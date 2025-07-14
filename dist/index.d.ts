import { type Extension } from '@codemirror/state';
import type { Colors } from './colors';

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
   * The colors used to customize certain elements.
   */
  colors?: Colors['custom'];
}
