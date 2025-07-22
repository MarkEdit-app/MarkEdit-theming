"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const state = require("@codemirror/state");
const highlight = require("@lezer/highlight");
const markeditApi = require("markedit-api");
const view = require("@codemirror/view");
const language = require("@codemirror/language");
const toObject = (value, fallback = {}) => value ?? fallback;
const userSettings = toObject(markeditApi.MarkEdit.userSettings);
const rootValue = settingsForKey("extension.markeditTheming");
const lightColors = isModeEnabled(false) ? toObject(rootValue.lightTheme) : void 0;
const darkColors = isModeEnabled(true) ? toObject(rootValue.darkTheme) : void 0;
function settingsForKey(key) {
  return key === void 0 ? {} : toObject(userSettings[key]);
}
function enabledMode(settings) {
  return settings.enabledMode ?? "both";
}
function isModeEnabled(isDark, mode = enabledMode(rootValue)) {
  return ["both", isDark ? "dark" : "light"].includes(mode);
}
function buildBlendedTheme(isDark, extension, colors) {
  const mergedColors = mergeColors({
    lhs: colors,
    rhs: isDark ? darkColors : lightColors
  });
  const custom = isDark ? createTheme(mergedColors, { dark: true }) : createTheme(mergedColors);
  return {
    // In CodeMirror, extensions added earlier have higher priority
    extensions: [...custom, extension].filter((ext) => ext !== void 0),
    colors: mergedColors
  };
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
  if (highlightColors?.divider) {
    tagStyles.push({ tag: highlight.tags.contentSeparator, color: highlightColors?.divider });
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
    tagStyles.push({ tag: [highlight.tags.separator, highlight.tags.processingInstruction, highlight.tags.definition(highlight.tags.name)], color: highlightColors?.instruction });
  }
  if (highlightColors?.invalid) {
    tagStyles.push({ tag: highlight.tags.invalid, color: highlightColors?.invalid });
  }
  const extensions = [];
  if (Object.keys(cssStyles).length > 0) {
    extensions.push(view.EditorView.theme(cssStyles, options));
  }
  if (tagStyles.length > 0) {
    extensions.push(language.syntaxHighlighting(language.HighlightStyle.define(tagStyles)));
  }
  return extensions;
}
function mergeColors(colors) {
  return {
    editor: {
      ...colors.lhs?.editor,
      ...colors.rhs?.editor
    },
    highlight: {
      ...colors.lhs?.highlight,
      ...colors.rhs?.highlight
    },
    subtleEmphasis: colors.rhs?.subtleEmphasis ?? colors.lhs?.subtleEmphasis
  };
}
const selectors = {
  selectionBackground: ".cm-selectionBackground",
  lineGutter: ".cm-lineNumbers > .cm-activeLineGutter",
  foldGutter: ".cm-foldGutter, .cm-foldPlaceholder",
  visibleSpace: ".cm-visibleSpace, .cm-visibleSpace::before, .cm-visibleLineBreak, .cm-visibleLineBreak::before",
  matchingBracket: ".cm-matchingBracket",
  activeIndicator: ".cm-md-activeIndicator",
  accentColor: ".cm-md-header:not(.tok-meta):not(.cm-md-quote), .cm-md-codeInfo",
  syntaxMarker: ".cm-md-header.tok-meta:not(.cm-md-quote), .cm-md-codeMark, .cm-md-linkMark, .cm-md-listMark, .cm-md-quoteMark, .cm-md-bold.tok-meta, .cm-md-italic.tok-meta, .cm-md-strikethrough.tok-meta",
  boldText: ".cm-md-bold:not(.tok-meta)",
  italicText: ".cm-md-italic:not(.tok-meta)",
  quoteText: ".cm-md-quote:not(.cm-md-quoteMark)",
  dividerColor: ".cm-md-horizontalRule"
};
const cssText = `
.cm-activeLineGutter { background: inherit !important }
.cm-searchMatch.cm-searchMatch-selected { outline: inherit !important }
${selectors.lineGutter} {}
${selectors.foldGutter} {}
${selectors.visibleSpace} {}
${selectors.matchingBracket} {}
${selectors.activeIndicator} {}
${selectors.accentColor} {}
${selectors.syntaxMarker} {}
${selectors.boldText} {}
${selectors.italicText} {}
${selectors.quoteText} {}
${selectors.dividerColor} {}
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
  if (extension.length === 0) {
    return [{}, []];
  }
  const themes = flattenThemes(extension);
  const styles = Object.fromEntries(themes.flatMap((theme) => {
    const rules = extractStyleRules(theme)?.join("\n") ?? "";
    return Object.entries(parseCssRules(rules));
  }));
  return [styles, themes.flatMap((theme) => extractHighlightSpecs(theme) ?? [])];
}
function extractTaggedColor(styles, tag, fallback) {
  return styles.find((style) => {
    if (style.tag.toString().includes(tag.toString()) && style.color !== void 0) {
      return true;
    }
    return false;
  })?.color ?? fallback;
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
  const rgba = textColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
  if (rgba === null) {
    return void 0;
  }
  const [red, green, blue] = rgba.slice(1, 4).map(Number);
  return `rgba(${red}, ${green}, ${blue}, 0.6)`;
}
function isEmptyObject(object) {
  const isValid = (value) => value !== null && typeof value === "object";
  if (!isValid(object)) {
    return true;
  }
  const entries = Object.entries(object);
  const hasValue = (value) => value !== void 0 && value !== null;
  for (const [, value] of entries) {
    if (isValid(value)) {
      if (!isEmptyObject(value)) {
        return false;
      }
    } else if (hasValue(value)) {
      return false;
    }
  }
  return true;
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
function overrideThemes(config) {
  const key = config.options?.settingsKey;
  const mode = enabledMode(settingsForKey(key));
  if (config.light !== void 0 && isModeEnabled(false, mode)) {
    $context().customThemes.light = config.light;
  }
  if (config.dark !== void 0 && isModeEnabled(true, mode)) {
    $context().customThemes.dark = config.dark;
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
  const { extensions, colors } = buildBlendedTheme(isDark, theme?.extension, theme?.colors);
  editor.dispatch({
    effects: $context().configurator.reconfigure(extensions)
  });
  const [cssStyles, tagStyles] = extractTheme(extensions);
  const isDisabled = extensions.length === 0 && isEmptyObject(colors);
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
  const secondaryColor = colors.editor?.visibleSpaceColor ?? lighterColor(primaryColor);
  const emphasisColor = colors.subtleEmphasis === true ? primaryColor : void 0;
  const accentColor = extractTaggedColor(tagStyles, highlight.tags.heading, emphasisColor);
  const syntaxMarkerColor = extractTaggedColor(tagStyles, highlight.tags.processingInstruction, emphasisColor);
  const boldTextColor = extractTaggedColor(tagStyles, highlight.tags.strong, emphasisColor);
  const italicTextColor = extractTaggedColor(tagStyles, highlight.tags.emphasis, emphasisColor);
  const quoteTextColor = extractTaggedColor(tagStyles, highlight.tags.quote, emphasisColor);
  const dividerColor = extractTaggedColor(tagStyles, highlight.tags.contentSeparator, emphasisColor);
  const propertyUpdates = [
    [selectors.activeIndicator, activeLine, "background"],
    [selectors.matchingBracket, matchingBracket, "background"],
    [selectors.lineGutter, primaryColor, "color"],
    [selectors.foldGutter, secondaryColor, "color"],
    [selectors.visibleSpace, secondaryColor, "color"],
    [selectors.accentColor, accentColor, "color"],
    [selectors.syntaxMarker, syntaxMarkerColor, "color"],
    [selectors.boldText, boldTextColor, "color"],
    [selectors.italicText, italicTextColor, "color"],
    [selectors.quoteText, quoteTextColor, "color"],
    [selectors.dividerColor, dividerColor, "color"]
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
      if (accentColor !== void 0 && (selector === ".cm-md-header" || selector === ".cm-md-header:not(.cm-md-quote)")) {
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
          if (selector === selectors.matchingBracket || selector === selectors.activeIndicator) {
            rule.style.setProperty("box-shadow", "unset", "important");
          }
        }
      }
    }
  }
}
exports.overrideThemes = overrideThemes;
