import { type Extension } from '@codemirror/state';
import type { Colors } from './colors';

/**
 * @public
 *
 * Configuration for overriding themes.
 *
 * All properties are optional.
 */
export interface Config {
  /**
   * Theme for the light mode.
   */
  light?: CustomTheme;
  /**
   * Theme for the dark mode.
   */
  dark?: CustomTheme;
  /**
   * Additional options to control the behavior.
   */
  options?: {
    /**
     * The key of the extension settings in the [settings.json](https://github.com/MarkEdit-app/MarkEdit/wiki/Customization#advanced-settings) file.
     *
     * When specified, MarkEdit-theming automatically determines the available themes based on the value of `enabledMode`.
     */
    settingsKey?: string;
  };
}

/**
 * @public
 *
 * Override themes in MarkEdit.
 *
 * It is recommended to call this as soon as your script runs.
 */
export declare function overrideThemes(config: Config): void;

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
   * The colors for editor theme, syntax highlighting, etc.
   */
  colors?: Colors;
}
