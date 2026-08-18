/**
 * @public
 *
 * Colors of one element group in the preview pane.
 */
export interface PreviewElementStyles {
  /**
   * Text color.
   */
  color?: string;
  /**
   * Background color.
   */
  background?: string;
  /**
   * Border color, where the element has one (heading underlines, blockquote bars, table grids).
   */
  borderColor?: string;
}
/**
 * @public
 *
 * Styles for the [MarkEdit-preview](https://github.com/MarkEdit-app/MarkEdit-preview) pane, applied when the theme is active.
 *
 * All properties are optional; omitted ones keep the preview's own styling.
 */
export interface PreviewStyles {
  /**
   * The whole pane: page background and body text.
   */
  markdownBody?: PreviewElementStyles;
  /**
   * Headings (h1–h6); `borderColor` styles the h1/h2 underline.
   */
  headings?: PreviewElementStyles;
  /**
   * Links.
   */
  links?: PreviewElementStyles;
  /**
   * Inline code spans.
   */
  inlineCode?: PreviewElementStyles;
  /**
   * Fenced code blocks.
   */
  codeBlocks?: PreviewElementStyles;
  /**
   * Blockquotes; `borderColor` styles the leading bar.
   */
  blockquotes?: PreviewElementStyles;
  /**
   * Tables; `background` fills header cells, `borderColor` styles the grid.
   */
  tables?: PreviewElementStyles & {
    /**
     * Background of even rows (zebra striping).
     */
    alternatingRowBackground?: string;
  };
  /**
   * Thematic breaks (hr).
   */
  dividers?: PreviewElementStyles;
}
/**
 * Generates the css text for the preview pane.
 *
 * `!important` is used because the preview injects its own theme and the
 * order of script injection is not guaranteed.
 */
export declare function buildPreviewCss(styles: PreviewStyles): string;
