/**
 * Colors for editor theme, syntax highlighting, etc.
 *
 * In CSS color values format.
 */
export interface Colors {
  /**
   * Colors for the editor theme.
   */
  editor?: {
    /**
     * Primary text color.
     */
    textColor?: string;
    /**
     * Primary background color.
     */
    backgroundColor?: string;
    /**
     * Active line background color.
     */
    activeLineBackground?: string;
    /**
     * Caret color.
     */
    caretColor?: string;
    /**
     * Text selection background color.
     */
    selectionBackground?: string;
    /**
     * Matching bracket background color.
     */
    matchingBracketBackground?: string;
    /**
     * Gutter text color, such as line numbers.
     */
    gutterText?: string;
    /**
     * Gutter background color, such as line numbers.
     */
    gutterBackground?: string;
    /**
     * Fold placeholder text color, such as code fold buttons.
     */
    foldPlaceholderText?: string;
    /**
     * Fold placeholder background color, such as code fold buttons.
     */
    foldPlaceholderBackground?: string;
    /**
     * Search match background color.
     */
    searchMatchBackground?: string;
    /**
     * Selection match background color.
     */
    selectionMatchBackground?: string;
    /**
     * Visible whitespace color.
     */
    visibleSpaceColor?: string;
  };
  /**
   * Colors for syntax highlighting, based on lezer's [highlight.Tag](https://lezer.codemirror.net/docs/ref/#highlight.Tag).
   *
   * Tag names have been simplified for greater consistency.
   */
  highlight?: {
    heading?: string;
    bold?: string;
    italic?: string;
    strikethrough?: string;
    quote?: string;
    link?: string;
    divider?: string;
    comment?: string;
    meta?: string;
    keyword?: string;
    atom?: string;
    literal?: string;
    string?: string;
    special?: string;
    variable?: string;
    local?: string;
    type?: string;
    class?: string;
    macro?: string;
    property?: string;
    label?: string;
    operator?: string;
    constant?: string;
    instruction?: string;
    invalid?: string;
  };
  /**
   * If true, styles like bold, italic, and quote will inherit the editor text color when no specific color is provided.
   *
   * @default true
   */
  allowsFallback?: boolean;
}
