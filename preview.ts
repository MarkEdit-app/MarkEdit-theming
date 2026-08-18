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
export function buildPreviewCss(styles: PreviewStyles): string {
  const rules: string[] = [];
  const rule = (selector: string, declarations: Record<string, string | undefined>) => {
    const body = Object.entries(declarations)
      .filter((entry): entry is [string, string] => entry[1] !== undefined)
      .map(([property, value]) => `${property}: ${value} !important;`)
      .join(' ');

    if (body.length > 0) {
      rules.push(`${selector} { ${body} }`);
    }
  };

  const body = styles.markdownBody;
  rule('.markdown-body', { background: body?.background, color: body?.color });

  const headings = styles.headings;
  rule(
    '.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6',
    { color: headings?.color, background: headings?.background, 'border-bottom-color': headings?.borderColor },
  );

  rule('.markdown-body a', { color: styles.links?.color, background: styles.links?.background });

  const inlineCode = styles.inlineCode;
  rule('.markdown-body code, .markdown-body tt', { color: inlineCode?.color, background: inlineCode?.background });

  const codeBlocks = styles.codeBlocks;
  if (codeBlocks !== undefined) {
    rule('.markdown-body pre', { background: codeBlocks.background });
    rule('.markdown-body pre code', { color: codeBlocks.color, background: 'transparent' });
  }

  const blockquotes = styles.blockquotes;
  rule('.markdown-body blockquote', {
    color: blockquotes?.color,
    background: blockquotes?.background,
    'border-left-color': blockquotes?.borderColor,
  });

  const tables = styles.tables;
  rule('.markdown-body table th, .markdown-body table td', { 'border-color': tables?.borderColor });
  rule('.markdown-body table th', { background: tables?.background });
  if (tables?.alternatingRowBackground !== undefined) {
    // Odd rows need the base background so striping stays visible
    rule('.markdown-body table tr', { background: styles.markdownBody?.background });
    rule('.markdown-body table tr:nth-child(2n)', { background: tables.alternatingRowBackground });
  }

  rule('.markdown-body hr', { background: styles.dividers?.color ?? styles.dividers?.background });

  return rules.join('\n');
}
