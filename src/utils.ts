import type { TagStyle } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import type { Tag } from '@lezer/highlight';

type Styles = Record<string, Record<string, string>>;
type Theme = Extension & { value?: { rules?: string[]; specs?: TagStyle[]; } };

const $global = window as {
  __extractStyleRules__?: (theme: Extension) => string[] | undefined;
  __extractHighlightSpecs__?: (theme: Extension) => TagStyle[] | undefined;
};

// Prefer a stable version provided by the main app, which can be updated as the app evolves
const extractStyleRules = $global.__extractStyleRules__ ?? ((theme: Theme) => theme.value?.rules);
const extractHighlightSpecs = $global.__extractHighlightSpecs__ ?? ((theme: Theme) => theme.value?.specs);

/**
 * Inject a <style> element from the input CSS text.
 */
export function injectStyles(cssText: string): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = cssText;
  document.head.appendChild(style);
  return style;
}

/**
 * Returns the extracted from a CodeMirror theme, including its css styles and tag styles.
 */
export function extractTheme(extension?: Extension): [Styles, TagStyle[]] {
  if (extension === undefined) {
    return [{}, []];
  }

  const themes = flattenThemes(extension);
  const styles = Object.fromEntries(themes.flatMap(theme => {
    const rules = extractStyleRules(theme)?.join('\n') ?? '';
    return Object.entries(parseCssRules(rules));
  }));

  return [styles, themes.flatMap(theme => extractHighlightSpecs(theme) ?? [])];
}

/**
 * Returns the defined color from tag styles.
 */
export function extractTaggedColor(styles: TagStyle[], tag: Tag): string | undefined {
  return styles.find(style => {
    // E.g., "heading,heading1" includes "heading"
    if (style.tag.toString().includes(tag.toString()) && style.color !== undefined) {
      return true;
    }

    return false;
  })?.color;
}

/**
 * Find the background or background-color from css styles.
 */
export function findBackground(styles: Styles, selector: string, exclude?: string): string | undefined {
  for (const [key, value] of Object.entries(styles)) {
    if (key.includes(selector) && (exclude === undefined || !key.includes(exclude))) {
      const background: string | undefined = value['background'] ?? value['backgroundColor'];
      if (background !== undefined) {
        return background;
      }
    }
  }

  return undefined;
};

/**
 * Returns a lighter color of the input.
 */
export function lighterColor(textColor: string): string | undefined {
  const components = textColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
  if (components === null) {
    return undefined;
  }

  const [red, green, blue] = components.slice(1, 4).map(Number);
  return `rgba(${red}, ${green}, ${blue}, 0.6)`;
}

// MARK: - Private

/**
 * Get flattened themes, since CodeMirror Extension is recursively declared.
 */
function flattenThemes(node: Extension): Extension[] {
  if (Array.isArray(node)) {
    return node.flatMap(flattenThemes);
  } else if ('extension' in node) {
    return flattenThemes(node.extension);
  } else {
    return [node];
  }
}

/**
 * Parse CSS rules from CSS text, we only care about background colors.
 */
function parseCssRules(cssText: string): Styles {
  const result: Styles = {};
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);

  for (const rule of sheet.cssRules) {
    const { style, selectorText: selector } = rule as CSSStyleRule;
    const { background, backgroundColor } = style;
    result[selector] = {};

    if (background.length > 0) {
      result[selector].background = background;
    }

    if (backgroundColor.length > 0) {
      result[selector].backgroundColor = backgroundColor;
    }
  }

  return result;
}
