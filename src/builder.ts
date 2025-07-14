import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting, type TagStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { lightColors, darkColors, isModeCustomized } from './settings';

import type { Extension } from '@codemirror/state';
import type { StyleSpec } from 'style-mod';
import type { Colors } from '../colors';

const lightTheme = createTheme(lightColors);
const darkTheme = createTheme(darkColors, { dark: true });

export function createExtensions(isDark: boolean, extension?: Extension) {
  if (!isModeCustomized(isDark)) {
    return extension;
  }

  const custom = isDark ? darkTheme : lightTheme;
  if (custom === undefined) {
    return extension;
  }

  return [custom, extension].filter(ext => ext !== undefined);
}

export function createColors(isDark: boolean, colors?: Colors['custom']) {
  if (!isModeCustomized(isDark)) {
    return colors;
  }

  const custom = isDark ? darkColors.custom : lightColors.custom;
  if (custom === undefined) {
    return colors;
  }

  return { ...colors, ...custom };
}

// MARK: - Private

function createTheme(colors: Colors, options?: { dark?: boolean }) {
  const cssStyles: { [selector: string]: StyleSpec } = {};
  const tagStyles: TagStyle[] = [];
  const editorColors = colors.editor;
  const highlightColors = colors.highlight;

  // Editor Theme

  if (editorColors?.textColor) {
    cssStyles['&'] ??= {};
    cssStyles['&'].color = editorColors?.textColor;
    cssStyles['.cm-activeLineGutter'] = { backgroundColor: editorColors?.textColor };
  }

  if (editorColors?.backgroundColor) {
    cssStyles['&'] ??= {};
    cssStyles['&'].backgroundColor = editorColors?.backgroundColor;
  }

  if (editorColors?.activeLineBackground) {
    cssStyles['.cm-activeLine'] = { backgroundColor: editorColors?.activeLineBackground };
  }

  if (editorColors?.caretColor) {
    cssStyles['.cm-content'] = { caretColor: editorColors?.caretColor };
    cssStyles['.cm-cursor, .cm-dropCursor'] = { borderLeftColor: editorColors?.caretColor };
  }

  if (editorColors?.selectionBackground) {
    cssStyles['&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection'] = {
      backgroundColor: editorColors?.selectionBackground,
    };
  }

  if (editorColors?.matchingBracketBackground) {
    cssStyles['&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket'] = {
      backgroundColor: editorColors?.matchingBracketBackground,
    };
  }

  if (editorColors?.gutterText) {
    cssStyles['.cm-gutters'] ??= {};
    cssStyles['.cm-gutters'].color = editorColors?.gutterText;
  }

  if (editorColors?.gutterBackground) {
    cssStyles['.cm-gutters'] ??= {};
    cssStyles['.cm-gutters'].backgroundColor = editorColors?.gutterBackground;
    cssStyles['.cm-gutters'].border = 'none';
  }

  if (editorColors?.foldPlaceholderText) {
    cssStyles['.cm-foldPlaceholder'] ??= {};
    cssStyles['.cm-foldPlaceholder'].color = editorColors?.foldPlaceholderText;
  }

  if (editorColors?.foldPlaceholderBackground) {
    cssStyles['.cm-foldPlaceholder'] ??= {};
    cssStyles['.cm-foldPlaceholder'].backgroundColor = editorColors?.foldPlaceholderBackground;
    cssStyles['.cm-foldPlaceholder'].border = 'none';
  }

  if (editorColors?.searchMatchBackground) {
    cssStyles['.cm-searchMatch'] = { backgroundColor: editorColors?.searchMatchBackground };
  }

  if (editorColors?.selectionMatchBackground) {
    cssStyles['.cm-selectionMatch'] = { backgroundColor: editorColors?.selectionMatchBackground };
  }

  // Markdown Highlighting

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
    tagStyles.push({ tag: tags.link, color: highlightColors?.link });
  }

  if (highlightColors?.separator) {
    tagStyles.push({ tag: [tags.definition(tags.name), tags.separator, tags.contentSeparator], color: highlightColors?.separator });
  }

  if (highlightColors?.comment) {
    tagStyles.push({ tag: [tags.meta, tags.comment], color: highlightColors?.comment });
  }

  // General Syntax

  if (highlightColors?.meta) {
    tagStyles.push({ tag: tags.meta, color: highlightColors?.meta });
  }

  if (highlightColors?.keyword) {
    tagStyles.push({ tag: tags.keyword, color: highlightColors?.keyword });
  }

  if (highlightColors?.atom) {
    tagStyles.push({ tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName], color: highlightColors?.atom });
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
    tagStyles.push({ tag: tags.processingInstruction, color: highlightColors?.instruction });
  }

  if (highlightColors?.invalid) {
    tagStyles.push({ tag: tags.invalid, color: highlightColors?.invalid });
  }

  return [
    EditorView.theme(cssStyles, options),
    syntaxHighlighting(HighlightStyle.define(tagStyles)),
  ];
}
