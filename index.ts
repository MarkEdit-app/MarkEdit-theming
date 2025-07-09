import { Compartment, type Extension } from '@codemirror/state';
import { MarkEdit } from 'markedit-api';
import { selectors, cssText } from './src/const';
import { injectStyles, extractTheme, findBackground, lighterColor } from './src/utils';

import type { EditorView } from '@codemirror/view';
import type { OriginalRules } from './src/types';

/**
 * @public
 *
 * Override themes in MarkEdit.
 *
 * It is recommended to call this as soon as your script runs.
 *
 * @param themes Themes for light mode and/or dark mode, both are optional.
 */
export function overrideThemes(themes: { light?: CustomTheme; dark?: CustomTheme }) {
  if (themes.light !== undefined) {
    $context().customThemes.light = themes.light;
  }

  if (themes.dark !== undefined) {
    $context().customThemes.dark = themes.dark;
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
   * The colors used to override certain elements.
   */
  colors?: {
    /**
     * CSS color string used to override the accent color, it is often what we use for markdown headings.
     *
     * If not provided, a color from the app's main theme will be used.
     */
    accentColor?: string;
    /**
     * CSS color string used to override the color of syntax markers, such as for list, link, quote, etc.
     *
     * If not provided, a color from the app's main theme will be used.
     */
    syntaxMarker?: string;
    /**
     * CSS color string used to override the color of visible whitespaces.
     *
     * If not provided, it will be automatically generated from the text color.
     */
    visibleSpace?: string;
  };
}

// MARK: - Private

/**
 * The object that is shared between multiple theme extensions.
 *
 * This is useful to reduce unnecessary hooks and updates.
 */
const $global = (window as unknown) as Window & {
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

const $context = () => {
  return $global.__markeditTheming__;
};

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

  // Update when the app main theme changed (fires when color scheme is changed too)
  Object.defineProperty($global.config, 'theme', {
    get() {
      return $context().mainThemeName;
    },
    set(value) {
      $context().mainThemeName = value;
      requestAnimationFrame(() => updateTheme(MarkEdit.editorView));
    },
  });
}

/**
 * Update the theme, including the extension and style sheets.
 */
function updateTheme(editor: EditorView) {
  const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = isDark ? $context().customThemes.dark : $context().customThemes.light;

  // Reconfigure the extension
  editor.dispatch({
    effects: $context().configurator.reconfigure(theme?.extension ?? []),
  });

  // Get the spec from the used EditorView.theme
  const spec = extractTheme(theme?.extension);
  const disabled = theme === undefined;

  // Reconfigure the style sheets
  $context().styleSheet.disabled = disabled;
  overrideStyles(
    editor,
    isDark,
    disabled,
    spec,
    theme?.colors,
  );
}

/**
 * Iterate all style sheets and override properties as needed.
 */
function overrideStyles(
  editor: EditorView,
  isDark: boolean,
  isDisabled: boolean,
  spec: Record<string, Record<string, string>>,
  colors?: CustomTheme['colors'],
) {
  const activeLine = findBackground(spec, '.cm-activeLine');
  const selectionBackground = findBackground(spec, selectors.selectionBackground);
  const matchingBracket = findBackground(spec, selectors.matchingBracket);
  const primaryColor = getComputedStyle(editor.contentDOM).color;
  const secondaryColor = colors?.visibleSpace ?? lighterColor(primaryColor);

  const propertyUpdates: [string, string | undefined, 'background' | 'color'][] = [
    [selectors.activeIndicator, activeLine, 'background'],
    [selectors.matchingBracket, matchingBracket, 'background'],
    [selectors.lineGutter, primaryColor, 'color'],
    [selectors.visibleSpace, secondaryColor, 'color'],
    [selectors.accentColor, colors?.accentColor, 'color'],
    [selectors.syntaxMarker, colors?.syntaxMarker, 'color'],
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
      if (selector === '.cm-md-header' || selector === '.cm-md-header:not(.cm-md-quote)') {
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
          rule.style.setProperty(property, color, 'important');
        }
      }
    }
  }
}
