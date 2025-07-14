/**
 * Colors for editor theme, syntax highlighting, and custom styles.
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
  };
  /**
   * Colors for syntax Highlighting, see [highlight.Tag](https://lezer.codemirror.net/docs/ref/#highlight.Tag) for details.
   */
  highlight?: {
    heading?: string;
    bold?: string;
    italic?: string;
    strikethrough?: string;
    quote?: string;
    link?: string;
    separator?: string;
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
   * Colors for customization.
   */
  custom?: {
    /**
     * If true, syntax like bold, italic, and quote will inherit the editor text color.
     *
     * Used in themes that don't define specific colors for bold, italic, or quote syntax, to prevent fallback to unintended default colors.
     *
     * @default true
     */
    subtleEmphasis?: boolean;
    /**
     * CSS color string used to override the accent color, it is often what we use for markdown headings.
     *
     * If not provided, a color from the app's main theme will be used.
     */
    accentColor?: string;
    /**
     * CSS color string used to override the color of syntax markers, such as for list, link, quote, etc.
     *
     * If not provided, a color from the app's main theme will be used.
     */
    syntaxMarker?: string;
    /**
     * CSS color string used to override the color of visible whitespaces.
     *
     * If not provided, it will be automatically generated from the text color.
     */
    visibleSpace?: string;
  };
}
