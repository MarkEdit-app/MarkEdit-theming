import { Compartment } from "@codemirror/state";
import { tags } from "@lezer/highlight";
import { MarkEdit } from "markedit-api";
import { EditorView } from "@codemirror/view";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
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
function lighterColor(textColor, alpha = 0.6) {
  const rgba = textColor.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
  if (rgba === null) {
    return void 0;
  }
  const [red, green, blue] = rgba.slice(1, 4).map(Number);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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
const toObject = (value, fallback = {}) => value ?? fallback;
const userSettings = toObject(MarkEdit.userSettings);
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
  flattenThemes(extension ?? []).forEach((input) => {
    const typed = input;
    if (typed.value && Array.isArray(typed.value?.rules)) {
      typed.value.rules = typed.value?.rules.filter((rule) => !`${rule}`.includes(".cm-tooltip"));
    }
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
    tagStyles.push({ tag: tags.heading, color: highlightColors?.heading });
  }
  if (highlightColors?.bold) {
    tagStyles.push({ tag: tags.strong, color: highlightColors?.bold });
  }
  if (highlightColors?.italic) {
    tagStyles.push({ tag: tags.emphasis, color: highlightColors?.italic });
  }
  if (highlightColors?.strikethrough) {
    tagStyles.push({ tag: tags.strikethrough, color: highlightColors?.strikethrough });
  }
  if (highlightColors?.quote) {
    tagStyles.push({ tag: tags.quote, color: highlightColors?.quote });
  }
  if (highlightColors?.link) {
    tagStyles.push({ tag: [tags.url, tags.link], color: highlightColors?.link });
  }
  if (highlightColors?.divider) {
    tagStyles.push({ tag: tags.contentSeparator, color: highlightColors?.divider });
  }
  if (highlightColors?.comment) {
    tagStyles.push({ tag: tags.comment, color: highlightColors?.comment });
  }
  if (highlightColors?.meta) {
    tagStyles.push({ tag: tags.meta, color: highlightColors?.meta });
  }
  if (highlightColors?.keyword) {
    tagStyles.push({ tag: tags.keyword, color: highlightColors?.keyword });
  }
  if (highlightColors?.atom) {
    tagStyles.push({ tag: [tags.atom, tags.bool], color: highlightColors?.atom });
  }
  if (highlightColors?.literal) {
    tagStyles.push({ tag: [tags.literal, tags.inserted], color: highlightColors?.literal });
  }
  if (highlightColors?.string) {
    tagStyles.push({ tag: [tags.string, tags.deleted], color: highlightColors?.string });
  }
  if (highlightColors?.special) {
    tagStyles.push({ tag: [tags.regexp, tags.escape, tags.special(tags.string)], color: highlightColors?.special });
  }
  if (highlightColors?.variable) {
    tagStyles.push({ tag: tags.definition(tags.variableName), color: highlightColors?.variable });
  }
  if (highlightColors?.local) {
    tagStyles.push({ tag: tags.local(tags.variableName), color: highlightColors?.local });
  }
  if (highlightColors?.type) {
    tagStyles.push({ tag: [tags.typeName, tags.namespace], color: highlightColors?.type });
  }
  if (highlightColors?.class) {
    tagStyles.push({ tag: tags.className, color: highlightColors?.class });
  }
  if (highlightColors?.macro) {
    tagStyles.push({ tag: [tags.special(tags.variableName), tags.macroName], color: highlightColors?.macro });
  }
  if (highlightColors?.property) {
    tagStyles.push({ tag: tags.definition(tags.propertyName), color: highlightColors?.property });
  }
  if (highlightColors?.label) {
    tagStyles.push({ tag: tags.labelName, color: highlightColors?.label });
  }
  if (highlightColors?.operator) {
    tagStyles.push({ tag: [tags.operator, tags.operatorKeyword], color: highlightColors?.operator });
  }
  if (highlightColors?.constant) {
    tagStyles.push({ tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: highlightColors?.constant });
  }
  if (highlightColors?.instruction) {
    tagStyles.push({ tag: [tags.separator, tags.processingInstruction, tags.definition(tags.name)], color: highlightColors?.instruction });
  }
  if (highlightColors?.invalid) {
    tagStyles.push({ tag: tags.invalid, color: highlightColors?.invalid });
  }
  const extensions = [];
  if (Object.keys(cssStyles).length > 0) {
    extensions.push(EditorView.theme(cssStyles, options));
  }
  if (tagStyles.length > 0) {
    extensions.push(syntaxHighlighting(HighlightStyle.define(tagStyles)));
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
    allowsFallback: colors.rhs?.allowsFallback ?? colors.lhs?.allowsFallback
  };
}
const selectors = {
  selectionBackground: ".cm-selectionBackground",
  primaryText: ".cm-lineNumbers > .cm-activeLineGutter, .cm-tooltip-autocomplete ul li, .cm-tooltip-autocomplete ul li[aria-selected]",
  secondaryText: ".cm-foldGutter, .cm-foldPlaceholder, .cm-visibleSpace, .cm-visibleSpace::before, .cm-visibleLineBreak, .cm-visibleLineBreak::before",
  matchingBracket: ".cm-matchingBracket",
  activeIndicator: ".cm-md-activeIndicator",
  accentColor: ".cm-md-header:not(.tok-meta):not(.cm-md-quote), .cm-md-codeInfo, .cm-completionMatchedText",
  syntaxMarker: ".cm-md-header.tok-meta:not(.cm-md-quote), .cm-md-codeMark, .cm-md-linkMark, .cm-md-listMark, .cm-md-quoteMark, .cm-md-bold.tok-meta, .cm-md-italic.tok-meta, .cm-md-strikethrough.tok-meta",
  boldText: ".cm-md-bold:not(.tok-meta)",
  italicText: ".cm-md-italic:not(.tok-meta)",
  quoteText: ".cm-md-quote:not(.cm-md-quoteMark)",
  dividerColor: ".cm-md-horizontalRule",
  autocomplete: ".cm-tooltip-autocomplete",
  autocompleteHighlight: ".cm-tooltip-autocomplete ul li[aria-selected]"
};
const cssText = `
.cm-activeLineGutter { background: inherit !important }
.cm-searchMatch.cm-searchMatch-selected { outline: inherit !important }
${selectors.primaryText} {}
${selectors.secondaryText} {}
${selectors.matchingBracket} {}
${selectors.activeIndicator} {}
${selectors.accentColor} {}
${selectors.syntaxMarker} {}
${selectors.boldText} {}
${selectors.italicText} {}
${selectors.quoteText} {}
${selectors.dividerColor} {}
${selectors.autocomplete} {}
${selectors.autocompleteHighlight} {}
`;
function overrideThemes(config) {
  const key = config.options?.settingsKey;
  const mode = enabledMode(settingsForKey(key));
  if (config.light !== void 0 && isModeEnabled(false, mode)) {
    $context().customThemes.light = config.light;
  }
  if (config.dark !== void 0 && isModeEnabled(true, mode)) {
    $context().customThemes.dark = config.dark;
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
  const invokeUpdate = () => setTimeout(() => updateTheme(MarkEdit.editorView), 15);
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
  const shouldFallback = colors.allowsFallback ?? theme?.extension !== void 0;
  $context().styleSheet.disabled = isDisabled;
  overrideStyles(
    editor,
    isDark,
    isDisabled,
    cssStyles,
    tagStyles,
    colors,
    shouldFallback
  );
}
function overrideStyles(editor, isDark, isDisabled, cssStyles, tagStyles, colors, shouldFallback) {
  const activeLine = findBackground(cssStyles, ".cm-activeLine", ".cm-activeLineGutter");
  const selectionBackground = findBackground(cssStyles, selectors.selectionBackground);
  const matchingBracket = findBackground(cssStyles, selectors.matchingBracket);
  const backgroundColor = getComputedStyle(editor.dom).backgroundColor;
  const primaryColor = getComputedStyle(editor.contentDOM).color;
  const secondaryColor = colors.editor?.visibleSpaceColor ?? lighterColor(primaryColor);
  const fallbackColor = shouldFallback ? primaryColor : void 0;
  const accentColor = extractTaggedColor(tagStyles, tags.heading, fallbackColor);
  const syntaxMarkerColor = extractTaggedColor(tagStyles, tags.processingInstruction, fallbackColor);
  const boldTextColor = extractTaggedColor(tagStyles, tags.strong, fallbackColor);
  const italicTextColor = extractTaggedColor(tagStyles, tags.emphasis, fallbackColor);
  const quoteTextColor = extractTaggedColor(tagStyles, tags.quote, fallbackColor);
  const dividerColor = extractTaggedColor(tagStyles, tags.contentSeparator, fallbackColor);
  const propertyUpdates = [
    [selectors.activeIndicator, activeLine, "background"],
    [selectors.matchingBracket, matchingBracket, "background"],
    [selectors.primaryText, primaryColor, "color"],
    [selectors.secondaryText, secondaryColor, "color"],
    [selectors.accentColor, accentColor, "color"],
    [selectors.syntaxMarker, syntaxMarkerColor, "color"],
    [selectors.boldText, boldTextColor, "color"],
    [selectors.italicText, italicTextColor, "color"],
    [selectors.quoteText, quoteTextColor, "color"],
    [selectors.dividerColor, dividerColor, "color"],
    [selectors.autocomplete, lighterColor(backgroundColor), "background"],
    [selectors.autocomplete, `1px solid ${lighterColor(primaryColor, 0.3)}`, "border"],
    [selectors.autocompleteHighlight, lighterColor(primaryColor, 0.1), "background"]
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
export {
  overrideThemes
};
