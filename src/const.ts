const selectors = {
  selectionBackground: '.cm-selectionBackground',
  lineGutter: '.cm-lineNumbers > .cm-activeLineGutter',
  foldGutter: '.cm-foldGutter, .cm-foldPlaceholder',
  visibleSpace: '.cm-visibleSpace, .cm-visibleSpace::before, .cm-visibleLineBreak, .cm-visibleLineBreak::before',
  matchingBracket: '.cm-matchingBracket',
  activeIndicator: '.cm-md-activeIndicator',
  accentColor: '.cm-md-header:not(.tok-meta):not(.cm-md-quote), .cm-md-codeInfo',
  syntaxMarker: '.cm-md-header.tok-meta:not(.cm-md-quote), .cm-md-codeMark, .cm-md-linkMark, .cm-md-listMark, .cm-md-quoteMark',
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

export { selectors, cssText };
