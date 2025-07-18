import { Compartment, type Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { MarkEdit } from 'markedit-api';
import { buildBlendedTheme } from './src/builder';
import { selectors, cssText } from './src/const';
import { injectStyles, extractTheme, extractTaggedColor, findBackground, lighterColor, isEmptyObject } from './src/utils';
import { settingsForKey, enabledMode, isModeEnabled } from './src/settings';

import type { EditorView } from '@codemirror/view';
import type { TagStyle } from '@codemirror/language';
import type { Colors } from './colors';
import type { OriginalRules } from './src/types';

/**
 * @public
 *
 * Configuration for overriding themes.
 *
 * All properties are optional.
 */
export interface Config {
  /**
   * Theme for the light mode.
   */
  light?: CustomTheme;
  /**
   * Theme for the dark mode.
   */
  dark?: CustomTheme;
  /**
   * Additional options to control the behavior.
   */
  options?: {
    /**
     * The key of the extension settings in the [settings.json](https://github.com/MarkEdit-app/MarkEdit/wiki/Customization#advanced-settings) file.
     *
     * When specified, MarkEdit-theming automatically determines the available themes based on the value of `enabledMode`.
     */
    settingsKey?: string;
  };
}

/**
 * @public
 *
 * Override themes in MarkEdit.
 *
 * It is recommended to call this as soon as your script runs.
 */
export function overrideThemes(config: Config) {
  const key = config.options?.settingsKey;
  const mode = enabledMode(settingsForKey(key));

  if (config.light !== undefined && isModeEnabled(false, mode)) {
    $context().customThemes.light = config.light;
  }

  if (config.dark !== undefined && isModeEnabled(true, mode)) {
    $context().customThemes.dark = config.dark;
  }

  if (typeof MarkEdit.editorView === 'object') {
    updateTheme(MarkEdit.editorView);
  }
}

/**
 * @public
 *
 * User-defined theme to override the editor appearance.
 *
 * It usually contains a CodeMirror extension and colors to override, both are optional.
 */
export interface CustomTheme {
  /**
   * The CodeMirror extension to configure the theme.
   */
  extension?: Extension;
  /**
   * The colors for editor theme, syntax highlighting, etc.
   */
  colors?: Colors;
}

// MARK: - Private

/**
 * The object that is shared between multiple theme extensions.
 *
 * This is useful to reduce unnecessary hooks and updates.
 */
const $global = (window as unknown) as {
  config: { theme: string; };
  __markeditTheming__: { // The package namespace
    mainThemeName?: string;
    styleSheet: HTMLStyleElement;
    configurator: Compartment;
    customThemes: Parameters<typeof overrideThemes>[0];
    lightOriginalRules: OriginalRules;
    darkOriginalRules: OriginalRules;
  }
};

const $context = () => $global.__markeditTheming__;
const $scheme = matchMedia('(prefers-color-scheme: dark)');

// Initialize the shared object (only once, works like a singleton)
if (typeof $context() !== 'object') {
  initContext();
}

function initContext() {
  // This is shared between all scripts that rely on markedit-theming
  $global.__markeditTheming__ = {
    styleSheet: injectStyles(cssText),
    configurator: new Compartment,
    customThemes: {},
    lightOriginalRules: {},
    darkOriginalRules: {},
  };

  // Update when the editor is ready
  MarkEdit.addExtension($context().configurator.of([]));
  MarkEdit.onEditorReady(editor => updateTheme(editor));

  // Update when the color scheme changed
  const invokeUpdate = () => setTimeout(() => updateTheme(MarkEdit.editorView), 15);
  $scheme.addEventListener('change', invokeUpdate);

  // Update when the app main theme changed
  $context().mainThemeName = $global.config.theme;
  Object.defineProperty($global.config, 'theme', {
    get() {
      return $context().mainThemeName;
    },
    set(value) {
      $context().mainThemeName = value;
      invokeUpdate();
    },
  });
}

/**
 * Update the theme, including the extension and style sheets.
 */
function updateTheme(editor: EditorView) {
  const isDark = $scheme.matches;
  const theme = isDark ? $context().customThemes.dark : $context().customThemes.light;
  const { extensions, colors } = buildBlendedTheme(isDark, theme?.extension, theme?.colors);

  // Reconfigure the extension
  editor.dispatch({
    effects: $context().configurator.reconfigure(extensions),
  });

  // Get the css styles and tag styles from the used EditorView.theme
  const [cssStyles, tagStyles] = extractTheme(extensions);
  const isDisabled = extensions.length === 0 && isEmptyObject(colors);

  // Reconfigure the style sheets
  $context().styleSheet.disabled = isDisabled;
  overrideStyles(
    editor,
    isDark,
    isDisabled,
    cssStyles,
    tagStyles,
    colors,
  );
}

/**
 * Iterate all style sheets and override properties as needed.
 */
function overrideStyles(
  editor: EditorView,
  isDark: boolean,
  isDisabled: boolean,
  cssStyles: Record<string, Record<string, string>>,
  tagStyles: TagStyle[],
  colors: Colors,
) {
  const activeLine = findBackground(cssStyles, '.cm-activeLine', '.cm-activeLineGutter');
  const selectionBackground = findBackground(cssStyles, selectors.selectionBackground);
  const matchingBracket = findBackground(cssStyles, selectors.matchingBracket);
  const primaryColor = getComputedStyle(editor.contentDOM).color;
  const secondaryColor = colors.editor?.visibleSpaceColor ?? lighterColor(primaryColor);
  const headingTagColor = extractTaggedColor(tagStyles, tags.heading);
  const instructionTagColor = extractTaggedColor(tagStyles, tags.processingInstruction);

  const propertyUpdates: [string, string | undefined, 'background' | 'color'][] = [
    [selectors.activeIndicator, activeLine, 'background'],
    [selectors.matchingBracket, matchingBracket, 'background'],
    [selectors.lineGutter, primaryColor, 'color'],
    [selectors.foldGutter, secondaryColor, 'color'],
    [selectors.visibleSpace, secondaryColor, 'color'],
    [selectors.accentColor, headingTagColor, 'color'],
    [selectors.syntaxMarker, instructionTagColor, 'color'],
  ];

  const styles = Array.from(document.querySelectorAll('style'));
  const originalRules = isDark ? $context().darkOriginalRules : $context().lightOriginalRules;

  for (const style of styles) {
    const rules = style.sheet?.cssRules;
    if (rules === undefined) {
      continue;
    }

    for (let index = 0; index < rules.length; ++index) {
      const rule = rules[index] as CSSStyleRule;
      const selector = rule.selectorText ?? '';

      // Text selection
      if (selector.includes('.cm-focused') && selector.includes(selectors.selectionBackground)) {
        originalRules.selectionBackground ??= rule.cssText;
        if (isDisabled) {
          rule.cssText = originalRules.selectionBackground;
        } else if (selectionBackground !== undefined) {
          rule.style.setProperty('background', selectionBackground, 'important');
        }
      }

      // Markdown headings
      if (headingTagColor !== undefined && (selector === '.cm-md-header' || selector === '.cm-md-header:not(.cm-md-quote)')) {
        originalRules.markdownHeader ??= rule.cssText;
        if (isDisabled) {
          rule.cssText = originalRules.markdownHeader;
        } else {
          rule.style.removeProperty('color');
        }
      }

      // Properties that can be overridden
      for (const [target, color, property] of propertyUpdates) {
        if (selector !== target) {
          continue;
        }

        if (color === undefined) {
          rule.style.removeProperty(property);
        } else {
          const priority = [selectors.accentColor, selectors.syntaxMarker].includes(selector) ? undefined : 'important';
          rule.style.setProperty(property, color, priority);

          // Remove the special styling in MarkEdit when colors are provided
          if (selector === selectors.matchingBracket || selector === selectors.activeIndicator) {
            rule.style.setProperty('box-shadow', 'unset', 'important');
          }
        }
      }

      if (selector === selectors.emphasisElement) {
        // This is default true since lots of community themes don't have emphasis colors
        if (colors.subtleEmphasis ?? true) {
          rule.style.setProperty('color', 'inherit', 'important');
        } else {
          rule.style.removeProperty('color');
        }
      }
    }
  }
}
