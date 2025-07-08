import { type Extension } from '@codemirror/state';

/**
 * @public
 *
 * Override themes in MarkEdit.
 *
 * It is recommended to call this as soon as your script runs.
 *
 * @param themes Themes for light mode and/or dark mode, both are optional.
 */
export declare function overrideThemes(themes: {
  light?: CustomTheme;
  dark?: CustomTheme;
}): void;

/**
 * @public
 *
 * User-defined theme to override the editor appearance.
 *
 * It usually contains a CodeMirror extension and colors to override, both are optional.
 */
export interface CustomTheme {
  /**
   * The CodeMirror extension to configure the theme.
   */
  extension?: Extension;
  /**
   * The colors used to override certain elements.
   */
  colors?: {
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
