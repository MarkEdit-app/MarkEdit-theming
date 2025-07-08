import type { Extension } from '@codemirror/state';

export function injectStyles(cssText: string): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = cssText;
  document.head.appendChild(style);
  return style;
}

/**
 * Returns the cache extension that contains the target extension.
 */
export function findExtension(caches: Extension[], target?: Extension): Extension | undefined {
  for (const cache of caches) {
    if (extensionContains(cache, target)) {
      return cache;
    }
  }

  return undefined;
}

/**
 * Find the background or background-color from a spec.
 */
export function findBackground(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec: [string, any][],
  selector: string,
): string | undefined {
  for (const [key, value] of spec) {
    if (key.includes(selector)) {
      return value['background'] ?? value['backgroundColor'];
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

/**
 * Returns true when the source extension contains the target extension.
 */
function extensionContains(source: Extension, target?: Extension): boolean {
  if (Array.isArray(target)) {
    return target.some(o => extensionContains(source, o));
  }

  if (Array.isArray(source)) {
    return source.some(o => extensionContains(o, target));
  }

  return target === source;
}
