import type { Extension } from '@codemirror/state';

type Spec = Record<string, Record<string, string>>;
type Theme = Extension & { value?: { rules?: string[] } };

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
 * Returns the spec from a CodeMirror theme.
 */
export function extractTheme(extension?: Extension): Spec {
  if (extension === undefined) {
    return {};
  }

  return Object.fromEntries(
    flattenThemes(extension).flatMap(theme => {
      const rules = theme.value?.rules?.join('\n') ?? '';
      return Object.entries(parseCssRules(rules));
    }),
  );
}

/**
 * Find the background or background-color from a spec.
 */
export function findBackground(spec: Spec, selector: string): string | undefined {
  for (const [key, value] of Object.entries(spec)) {
    if (key.includes(selector)) {
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
function flattenThemes(root: Extension): Theme[] {
  const result: Theme[] = [];
  const stack: Extension[] = [root];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (Array.isArray(node)) {
      node.forEach(o => stack.push(o));
    } else if ('extension' in node) {
      stack.push(node.extension);
    } else {
      result.push(node);
    }
  }

  return result;
}

/**
 * Parse CSS rules from CSS text, we only care about background colors.
 */
function parseCssRules(cssText: string): Spec {
  const result: Spec = {};
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
