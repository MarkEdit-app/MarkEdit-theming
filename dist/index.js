import { Compartment } from "@codemirror/state";
import { MarkEdit } from "markedit-api";
const selectors = {
  selectionBackground: ".cm-selectionBackground",
  lineGutter: ".cm-lineNumbers > .cm-activeLineGutter",
  foldGutter: ".cm-foldGutter, .cm-foldPlaceholder",
  visibleSpace: ".cm-visibleSpace, .cm-visibleSpace::before, .cm-visibleLineBreak, .cm-visibleLineBreak::before",
  matchingBracket: ".cm-matchingBracket",
  activeIndicator: ".cm-md-activeIndicator",
  accentColor: ".cm-md-header:not(.tok-meta):not(.cm-md-quote), .cm-md-codeInfo",
  syntaxMarker: ".cm-md-header.tok-meta:not(.cm-md-quote), .cm-md-codeMark, .cm-md-linkMark, .cm-md-listMark, .cm-md-quoteMark"
};
const cssText = `
  .cm-activeLineGutter {
    background: inherit !important;
  }
  .cm-searchMatch.cm-searchMatch-selected {
    outline: inherit !important;
  }
  .cm-md-bold:not(.tok-meta), .cm-md-italic:not(.tok-meta), .cm-md-quote:not(.cm-md-quoteMark) {
    color: inherit !important;
  }
  ${selectors.lineGutter} {}
  ${selectors.foldGutter} {}
  ${selectors.visibleSpace} {}
  ${selectors.matchingBracket} { box-shadow: unset !important; }
  ${selectors.activeIndicator} { box-shadow: unset !important; }
  ${selectors.accentColor} {}
  ${selectors.syntaxMarker} {}
`;
function injectStyles(cssText2) {
  const style = document.createElement("style");
  style.textContent = cssText2;
  document.head.appendChild(style);
  return style;
}
function extractTheme(extension) {
  if (extension === void 0) {
    return {};
  }
  return Object.fromEntries(
    flattenThemes(extension).flatMap((theme) => {
      const rules = theme.value?.rules?.join("\n") ?? "";
      return Object.entries(parseCssRules(rules));
    })
  );
}
function findBackground(spec, selector) {
  for (const [key, value] of Object.entries(spec)) {
    if (key.includes(selector)) {
      const background = value["background"] ?? value["backgroundColor"];
      if (background !== void 0) {
        return background;
      }
    }
  }
  return void 0;
}
function lighterColor(textColor) {
  const components = textColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
  if (components === null) {
    return void 0;
  }
  const [red, green, blue] = components.slice(1, 4).map(Number);
  return `rgba(${red}, ${green}, ${blue}, 0.6)`;
}
function flattenThemes(root) {
  const result = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (Array.isArray(node)) {
      node.forEach((o) => stack.push(o));
    } else if ("extension" in node) {
      stack.push(node.extension);
    } else {
      result.push(node);
    }
  }
  return result;
}
function parseCssRules(cssText2) {
  const result = {};
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText2);
  for (const rule of sheet.cssRules) {
    const { style, selectorText: selector } = rule;
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
function overrideThemes(themes) {
  if (themes.light !== void 0) {
    $context().customThemes.light = themes.light;
  }
  if (themes.dark !== void 0) {
    $context().customThemes.dark = themes.dark;
  }
  if (typeof MarkEdit.editorView === "object") {
    updateTheme(MarkEdit.editorView);
  }
}
const $global = window;
const $context = () => $global.__markeditTheming__;
const $scheme = matchMedia("(prefers-color-scheme: dark)");
if (typeof $context() !== "object") {
  initContext();
}
function initContext() {
  $global.__markeditTheming__ = {
    styleSheet: injectStyles(cssText),
    configurator: new Compartment(),
    customThemes: {},
    lightOriginalRules: {},
    darkOriginalRules: {}
  };
  MarkEdit.addExtension($context().configurator.of([]));
  MarkEdit.onEditorReady((editor) => updateTheme(editor));
  Object.defineProperty($global.config, "theme", {
    get() {
      return $context().mainThemeName;
    },
    set(value) {
      $context().mainThemeName = value;
      requestAnimationFrame(() => updateTheme(MarkEdit.editorView));
    }
  });
  $scheme.addEventListener("change", () => {
    requestAnimationFrame(() => updateTheme(MarkEdit.editorView));
  });
}
function updateTheme(editor) {
  const isDark = $scheme.matches;
  const theme = isDark ? $context().customThemes.dark : $context().customThemes.light;
  editor.dispatch({
    effects: $context().configurator.reconfigure(theme?.extension ?? [])
  });
  const spec = extractTheme(theme?.extension);
  const disabled = theme === void 0;
  $context().styleSheet.disabled = disabled;
  overrideStyles(
    editor,
    isDark,
    disabled,
    spec,
    theme?.colors
  );
}
function overrideStyles(editor, isDark, isDisabled, spec, colors) {
  const activeLine = findBackground(spec, ".cm-activeLine");
  const selectionBackground = findBackground(spec, selectors.selectionBackground);
  const matchingBracket = findBackground(spec, selectors.matchingBracket);
  const primaryColor = getComputedStyle(editor.contentDOM).color;
  const secondaryColor = colors?.visibleSpace ?? lighterColor(primaryColor);
  const propertyUpdates = [
    [selectors.activeIndicator, activeLine, "background"],
    [selectors.matchingBracket, matchingBracket, "background"],
    [selectors.lineGutter, primaryColor, "color"],
    [selectors.foldGutter, secondaryColor, "color"],
    [selectors.visibleSpace, secondaryColor, "color"],
    [selectors.accentColor, colors?.accentColor, "color"],
    [selectors.syntaxMarker, colors?.syntaxMarker, "color"]
  ];
  const styles = Array.from(document.querySelectorAll("style"));
  const originalRules = isDark ? $context().darkOriginalRules : $context().lightOriginalRules;
  for (const style of styles) {
    const rules = style.sheet?.cssRules;
    if (rules === void 0) {
      continue;
    }
    for (let index = 0; index < rules.length; ++index) {
      const rule = rules[index];
      const selector = rule.selectorText ?? "";
      if (selector.includes(".cm-focused") && selector.includes(selectors.selectionBackground)) {
        originalRules.selectionBackground ??= rule.cssText;
        if (isDisabled) {
          rule.cssText = originalRules.selectionBackground;
        } else if (selectionBackground !== void 0) {
          rule.style.setProperty("background", selectionBackground, "important");
        }
      }
      if (selector === ".cm-md-header" || selector === ".cm-md-header:not(.cm-md-quote)") {
        originalRules.markdownHeader ??= rule.cssText;
        if (isDisabled) {
          rule.cssText = originalRules.markdownHeader;
        } else {
          rule.style.removeProperty("color");
        }
      }
      for (const [target, color, property] of propertyUpdates) {
        if (selector !== target) {
          continue;
        }
        if (color === void 0) {
          rule.style.removeProperty(property);
        } else {
          rule.style.setProperty(property, color, "important");
        }
      }
    }
  }
}
export {
  overrideThemes
};
