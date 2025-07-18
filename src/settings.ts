import { MarkEdit, type JSONObject, type JSONValue} from 'markedit-api';
import type { Colors } from '../colors';

const toObject = (value: JSONValue, fallback = {}) => (value ?? fallback) as JSONObject;
const userSettings = toObject(MarkEdit.userSettings);
const rootValue = settingsForKey('extension.markeditTheming');

export const lightColors = isModeEnabled(false) ? (toObject(rootValue.lightTheme) as Colors) : undefined;
export const darkColors = isModeEnabled(true) ? (toObject(rootValue.darkTheme) as Colors) : undefined;

export function settingsForKey(key?: string) {
  return key === undefined ? {} : toObject(userSettings[key]);
}

export function enabledMode(settings: JSONObject) {
  return (settings.enabledMode ?? 'both') as string;
}

export function isModeEnabled(isDark: boolean, mode: string = enabledMode(rootValue)) {
  return ['both', isDark ? 'dark' : 'light'].includes(mode);
}
