"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const state = require("@codemirror/state");
const view = require("@codemirror/view");
const markeditApi = require("markedit-api");
const selectors = {
  selectionBackground: ".cm-selectionBackground",
  lineGutter: ".cm-lineNumbers > .cm-activeLineGutter",
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
  .cm-md-bold:not(.tok-meta), .cm-md-italic:not(.tok-meta), .cm-md-quote:not(.cm-md-quoteMark) {
    color: inherit !important;
  }
  ${selectors.lineGutter} {}
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
function findExtension(caches, target) {
  for (const cache of caches) {
    if (extensionContains(cache, target)) {
      return cache;
    }
  }
  return void 0;
}
function findBackground(spec, selector) {
  for (const [key, value] of spec) {
    if (key.includes(selector)) {
      return value["background"] ?? value["backgroundColor"];
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
function extensionContains(source, target) {
  if (Array.isArray(target)) {
    return target.some((o) => extensionContains(source, o));
  }
  if (Array.isArray(source)) {
    return source.some((o) => extensionContains(o, target));
  }
  return target === source;
}
function overrideThemes(themes) {
  if (themes.light !== void 0) {
    $context().customThemes.light = themes.light;
  }
  if (themes.dark !== void 0) {
    $context().customThemes.dark = themes.dark;
  }
  if (typeof markeditApi.MarkEdit.editorView === "object") {
    updateTheme(markeditApi.MarkEdit.editorView);
  }
}
const $global = window;
const $context = () => {
  return $global.__markeditTheming__;
};
if (typeof $context() !== "object") {
  initContext();
}
function initContext() {
  $global.__markeditTheming__ = {
    styleSheet: injectStyles(cssText),
    configurator: new state.Compartment(),
    customThemes: {},
    lightOriginalRules: {},
    darkOriginalRules: {},
    cachedExtensions: []
  };
  const originalTheme = view.EditorView.theme;
  view.EditorView.theme = (spec, options) => {
    const theme = originalTheme(spec, options);
    if (spec["@keyframes cm-blink"] === void 0 && spec[".cm-md-previewButton"] === void 0) {
      theme.spec = spec;
      $context().cachedExtensions.push(theme);
    }
    return theme;
  };
  markeditApi.MarkEdit.addExtension($context().configurator.of([]));
  markeditApi.MarkEdit.onEditorReady((editor) => updateTheme(editor));
  Object.defineProperty($global.config, "theme", {
    get() {
      return $context().mainThemeName;
    },
    set(value) {
      $context().mainThemeName = value;
      requestAnimationFrame(() => updateTheme(markeditApi.MarkEdit.editorView));
    }
  });
}
function updateTheme(editor) {
  const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = isDark ? $context().customThemes.dark : $context().customThemes.light;
  editor.dispatch({
    effects: $context().configurator.reconfigure(theme?.extension ?? [])
  });
  const spec = findExtension($context().cachedExtensions, theme?.extension)?.spec;
  const disabled = theme === void 0;
  $context().styleSheet.disabled = disabled;
  overrideStyles(
    editor,
    isDark,
    disabled,
    Object.entries(spec ?? {}),
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
exports.overrideThemes = overrideThemes;
