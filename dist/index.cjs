"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const state = require("@codemirror/state");
const highlight = require("@lezer/highlight");
const markeditApi = require("markedit-api");
const view = require("@codemirror/view");
const language = require("@codemirror/language");
const toObject = (value, fallback = {}) => value ?? fallback;
const userSettings = toObject(markeditApi.MarkEdit.userSettings);
const rootValue = toObject(userSettings["extension.markeditTheming"]);
const enabledMode = rootValue.enabledMode ?? "both";
const lightColors = toObject(rootValue.lightTheme);
const darkColors = toObject(rootValue.darkTheme);
const isModeCustomized = (isDark) => ["both", isDark ? "dark" : "light"].includes(enabledMode);
const lightTheme = createTheme(lightColors);
const darkTheme = createTheme(darkColors, { dark: true });
function createExtensions(isDark, extension) {
  if (!isModeCustomized(isDark)) {
    return extension;
  }
  const custom = isDark ? darkTheme : lightTheme;
  if (custom === void 0) {
    return extension;
  }
  return [custom, extension].filter((ext) => ext !== void 0);
}
function createColors(isDark, colors) {
  if (!isModeCustomized(isDark)) {
    return colors;
  }
  const custom = isDark ? darkColors.custom : lightColors.custom;
  if (custom === void 0) {
    return colors;
  }
  return { ...colors, ...custom };
}
function createTheme(colors, options) {
  const cssStyles = {};
  const tagStyles = [];
  const editorColors = colors.editor;
  const highlightColors = colors.highlight;
  if (editorColors?.textColor) {
    cssStyles["&"] ??= {};
    cssStyles["&"].color = editorColors?.textColor;
    cssStyles[".cm-activeLineGutter"] = { backgroundColor: editorColors?.textColor };
  }
  if (editorColors?.backgroundColor) {
    cssStyles["&"] ??= {};
    cssStyles["&"].backgroundColor = editorColors?.backgroundColor;
  }
  if (editorColors?.activeLineBackground) {
    cssStyles[".cm-activeLine"] = { backgroundColor: editorColors?.activeLineBackground };
  }
  if (editorColors?.caretColor) {
    cssStyles[".cm-content"] = { caretColor: editorColors?.caretColor };
    cssStyles[".cm-cursor, .cm-dropCursor"] = { borderLeftColor: editorColors?.caretColor };
  }
  if (editorColors?.selectionBackground) {
    cssStyles["&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection"] = {
      backgroundColor: editorColors?.selectionBackground
    };
  }
  if (editorColors?.matchingBracketBackground) {
    cssStyles["&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket"] = {
      backgroundColor: editorColors?.matchingBracketBackground
    };
  }
  if (editorColors?.gutterText) {
    cssStyles[".cm-gutters"] ??= {};
    cssStyles[".cm-gutters"].color = editorColors?.gutterText;
  }
  if (editorColors?.gutterBackground) {
    cssStyles[".cm-gutters"] ??= {};
    cssStyles[".cm-gutters"].backgroundColor = editorColors?.gutterBackground;
    cssStyles[".cm-gutters"].border = "none";
  }
  if (editorColors?.foldPlaceholderText) {
    cssStyles[".cm-foldPlaceholder"] ??= {};
    cssStyles[".cm-foldPlaceholder"].color = editorColors?.foldPlaceholderText;
  }
  if (editorColors?.foldPlaceholderBackground) {
    cssStyles[".cm-foldPlaceholder"] ??= {};
    cssStyles[".cm-foldPlaceholder"].backgroundColor = editorColors?.foldPlaceholderBackground;
    cssStyles[".cm-foldPlaceholder"].border = "none";
  }
  if (editorColors?.searchMatchBackground) {
    cssStyles[".cm-searchMatch"] = { backgroundColor: editorColors?.searchMatchBackground };
  }
  if (editorColors?.selectionMatchBackground) {
    cssStyles[".cm-selectionMatch"] = { backgroundColor: editorColors?.selectionMatchBackground };
  }
  if (highlightColors?.heading) {
    tagStyles.push({ tag: highlight.tags.heading, color: highlightColors?.heading });
  }
  if (highlightColors?.bold) {
    tagStyles.push({ tag: highlight.tags.strong, color: highlightColors?.bold });
  }
  if (highlightColors?.italic) {
    tagStyles.push({ tag: highlight.tags.emphasis, color: highlightColors?.italic });
  }
  if (highlightColors?.strikethrough) {
    tagStyles.push({ tag: highlight.tags.strikethrough, color: highlightColors?.strikethrough });
  }
  if (highlightColors?.quote) {
    tagStyles.push({ tag: highlight.tags.quote, color: highlightColors?.quote });
  }
  if (highlightColors?.link) {
    tagStyles.push({ tag: [highlight.tags.url, highlight.tags.link], color: highlightColors?.link });
  }
  if (highlightColors?.separator) {
    tagStyles.push({ tag: [highlight.tags.definition(highlight.tags.name), highlight.tags.separator, highlight.tags.contentSeparator], color: highlightColors?.separator });
  }
  if (highlightColors?.comment) {
    tagStyles.push({ tag: highlight.tags.comment, color: highlightColors?.comment });
  }
  if (highlightColors?.meta) {
    tagStyles.push({ tag: highlight.tags.meta, color: highlightColors?.meta });
  }
  if (highlightColors?.keyword) {
    tagStyles.push({ tag: highlight.tags.keyword, color: highlightColors?.keyword });
  }
  if (highlightColors?.atom) {
    tagStyles.push({ tag: [highlight.tags.atom, highlight.tags.bool], color: highlightColors?.atom });
  }
  if (highlightColors?.literal) {
    tagStyles.push({ tag: [highlight.tags.literal, highlight.tags.inserted], color: highlightColors?.literal });
  }
  if (highlightColors?.string) {
    tagStyles.push({ tag: [highlight.tags.string, highlight.tags.deleted], color: highlightColors?.string });
  }
  if (highlightColors?.special) {
    tagStyles.push({ tag: [highlight.tags.regexp, highlight.tags.escape, highlight.tags.special(highlight.tags.string)], color: highlightColors?.special });
  }
  if (highlightColors?.variable) {
    tagStyles.push({ tag: highlight.tags.definition(highlight.tags.variableName), color: highlightColors?.variable });
  }
  if (highlightColors?.local) {
    tagStyles.push({ tag: highlight.tags.local(highlight.tags.variableName), color: highlightColors?.local });
  }
  if (highlightColors?.type) {
    tagStyles.push({ tag: [highlight.tags.typeName, highlight.tags.namespace], color: highlightColors?.type });
  }
  if (highlightColors?.class) {
    tagStyles.push({ tag: highlight.tags.className, color: highlightColors?.class });
  }
  if (highlightColors?.macro) {
    tagStyles.push({ tag: [highlight.tags.special(highlight.tags.variableName), highlight.tags.macroName], color: highlightColors?.macro });
  }
  if (highlightColors?.property) {
    tagStyles.push({ tag: highlight.tags.definition(highlight.tags.propertyName), color: highlightColors?.property });
  }
  if (highlightColors?.label) {
    tagStyles.push({ tag: highlight.tags.labelName, color: highlightColors?.label });
  }
  if (highlightColors?.operator) {
    tagStyles.push({ tag: [highlight.tags.operator, highlight.tags.operatorKeyword], color: highlightColors?.operator });
  }
  if (highlightColors?.constant) {
    tagStyles.push({ tag: [highlight.tags.color, highlight.tags.constant(highlight.tags.name), highlight.tags.standard(highlight.tags.name)], color: highlightColors?.constant });
  }
  if (highlightColors?.instruction) {
    tagStyles.push({ tag: highlight.tags.processingInstruction, color: highlightColors?.instruction });
  }
  if (highlightColors?.invalid) {
    tagStyles.push({ tag: highlight.tags.invalid, color: highlightColors?.invalid });
  }
  return [
    view.EditorView.theme(cssStyles, options),
    language.syntaxHighlighting(language.HighlightStyle.define(tagStyles))
  ];
}
const selectors = {
  selectionBackground: ".cm-selectionBackground",
  lineGutter: ".cm-lineNumbers > .cm-activeLineGutter",
  foldGutter: ".cm-foldGutter, .cm-foldPlaceholder",
  visibleSpace: ".cm-visibleSpace, .cm-visibleSpace::before, .cm-visibleLineBreak, .cm-visibleLineBreak::before",
  matchingBracket: ".cm-matchingBracket",
  activeIndicator: ".cm-md-activeIndicator",
  emphasisElement: ".cm-md-bold:not(.tok-meta), .cm-md-italic:not(.tok-meta), .cm-md-quote:not(.cm-md-quoteMark)",
  accentColor: ".cm-md-header:not(.tok-meta):not(.cm-md-quote), .cm-md-codeInfo",
  syntaxMarker: ".cm-md-header.tok-meta:not(.cm-md-quote), .cm-md-codeMark, .cm-md-linkMark, .cm-md-listMark, .cm-md-quoteMark"
};
const cssText = `
.cm-activeLineGutter { background: inherit !important }
.cm-searchMatch.cm-searchMatch-selected { outline: inherit !important }
${selectors.lineGutter} {}
${selectors.foldGutter} {}
${selectors.visibleSpace} {}
${selectors.matchingBracket} {}
${selectors.activeIndicator} {}
${selectors.emphasisElement} {}
${selectors.accentColor} {}
${selectors.syntaxMarker} {}
`;
const $global$1 = window;
const extractStyleRules = $global$1.__extractStyleRules__ ?? ((theme) => theme.value?.rules);
const extractHighlightSpecs = $global$1.__extractHighlightSpecs__ ?? ((theme) => theme.value?.specs);
function injectStyles(cssText2) {
  const style = document.createElement("style");
  style.textContent = cssText2;
  document.head.appendChild(style);
  return style;
}
function extractTheme(extension) {
  if (extension === void 0) {
    return [{}, []];
  }
  const themes = flattenThemes(extension);
  const styles = Object.fromEntries(themes.flatMap((theme) => {
    const rules = extractStyleRules(theme)?.join("\n") ?? "";
    return Object.entries(parseCssRules(rules));
  }));
  return [styles, themes.flatMap((theme) => extractHighlightSpecs(theme) ?? [])];
}
function extractTaggedColor(styles, tag) {
  return styles.find((style) => {
    if (style.tag.toString().includes(tag.toString()) && style.color !== void 0) {
      return true;
    }
    return false;
  })?.color;
}
function findBackground(styles, selector, exclude) {
  for (const [key, value] of Object.entries(styles)) {
    if (key.includes(selector) && (exclude === void 0 || !key.includes(exclude))) {
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
function flattenThemes(node) {
  if (Array.isArray(node)) {
    return node.flatMap(flattenThemes);
  } else if ("extension" in node) {
    return flattenThemes(node.extension);
  } else {
    return [node];
  }
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
  if (typeof markeditApi.MarkEdit.editorView === "object") {
    updateTheme(markeditApi.MarkEdit.editorView);
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
    configurator: new state.Compartment(),
    customThemes: {},
    lightOriginalRules: {},
    darkOriginalRules: {}
  };
  markeditApi.MarkEdit.addExtension($context().configurator.of([]));
  markeditApi.MarkEdit.onEditorReady((editor) => updateTheme(editor));
  const invokeUpdate = () => setTimeout(() => updateTheme(markeditApi.MarkEdit.editorView), 15);
  $scheme.addEventListener("change", invokeUpdate);
  $context().mainThemeName = $global.config.theme;
  Object.defineProperty($global.config, "theme", {
    get() {
      return $context().mainThemeName;
    },
    set(value) {
      $context().mainThemeName = value;
      invokeUpdate();
    }
  });
}
function updateTheme(editor) {
  const isDark = $scheme.matches;
  const theme = isDark ? $context().customThemes.dark : $context().customThemes.light;
  const extensions = createExtensions(isDark, theme?.extension);
  const colors = createColors(isDark, theme?.colors);
  editor.dispatch({
    effects: $context().configurator.reconfigure(extensions ?? [])
  });
  const [cssStyles, tagStyles] = extractTheme(extensions);
  const isDisabled = extensions === void 0;
  $context().styleSheet.disabled = isDisabled;
  overrideStyles(
    editor,
    isDark,
    isDisabled,
    cssStyles,
    tagStyles,
    colors
  );
}
function overrideStyles(editor, isDark, isDisabled, cssStyles, tagStyles, colors) {
  const activeLine = findBackground(cssStyles, ".cm-activeLine", ".cm-activeLineGutter");
  const selectionBackground = findBackground(cssStyles, selectors.selectionBackground);
  const matchingBracket = findBackground(cssStyles, selectors.matchingBracket);
  const primaryColor = getComputedStyle(editor.contentDOM).color;
  const secondaryColor = colors?.visibleSpace ?? lighterColor(primaryColor);
  const headingTagColor = extractTaggedColor(tagStyles, highlight.tags.heading);
  const instructionTagColor = extractTaggedColor(tagStyles, highlight.tags.processingInstruction);
  const propertyUpdates = [
    [selectors.activeIndicator, activeLine, "background"],
    [selectors.matchingBracket, matchingBracket, "background"],
    [selectors.lineGutter, primaryColor, "color"],
    [selectors.foldGutter, secondaryColor, "color"],
    [selectors.visibleSpace, secondaryColor, "color"],
    [selectors.accentColor, colors?.accentColor ?? headingTagColor, "color"],
    [selectors.syntaxMarker, colors?.syntaxMarker ?? instructionTagColor, "color"]
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
      if (headingTagColor !== void 0 && (selector === ".cm-md-header" || selector === ".cm-md-header:not(.cm-md-quote)")) {
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
          const priority = [selectors.accentColor, selectors.syntaxMarker].includes(selector) ? void 0 : "important";
          rule.style.setProperty(property, color, priority);
          if (selector === selectors.matchingBracket || selector === selectors.activeIndicator) {
            rule.style.setProperty("box-shadow", "unset", "important");
          }
        }
      }
      if (selector === selectors.emphasisElement) {
        if (colors?.subtleEmphasis ?? true) {
          rule.style.setProperty("color", "inherit", "important");
        } else {
          rule.style.removeProperty("color");
        }
      }
    }
  }
}
exports.overrideThemes = overrideThemes;
