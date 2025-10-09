const selectors = {
  selectionBackground: '.cm-selectionBackground',
  primaryText: '.cm-lineNumbers > .cm-activeLineGutter, .cm-tooltip-autocomplete ul li, .cm-tooltip-autocomplete ul li[aria-selected]',
  secondaryText: '.cm-foldGutter, .cm-foldPlaceholder, .cm-visibleSpace, .cm-visibleSpace::before, .cm-visibleLineBreak, .cm-visibleLineBreak::before',
  matchingBracket: '.cm-matchingBracket',
  activeIndicator: '.cm-md-activeIndicator',
  accentColor: '.cm-md-header:not(.tok-meta):not(.cm-md-quote), .cm-md-codeInfo, .cm-completionMatchedText',
  syntaxMarker: '.cm-md-header.tok-meta:not(.cm-md-quote), .cm-md-codeMark, .cm-md-linkMark, .cm-md-listMark, .cm-md-quoteMark, .cm-md-bold.tok-meta, .cm-md-italic.tok-meta, .cm-md-strikethrough.tok-meta',
  boldText: '.cm-md-bold:not(.tok-meta)',
  italicText: '.cm-md-italic:not(.tok-meta)',
  quoteText: '.cm-md-quote:not(.cm-md-quoteMark)',
  dividerColor: '.cm-md-horizontalRule',
  autocomplete: '.cm-tooltip-autocomplete',
  autocompleteHighlight: '.cm-tooltip-autocomplete ul li[aria-selected]',
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

export { selectors, cssText };
