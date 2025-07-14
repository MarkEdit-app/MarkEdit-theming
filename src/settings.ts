import { MarkEdit, type JSONObject, type JSONValue} from 'markedit-api';
import type { Colors } from '../colors';

const toObject = (value: JSONValue, fallback = {}) => (value ?? fallback) as JSONObject;
const userSettings = toObject(MarkEdit.userSettings);
const rootValue = toObject(userSettings['extension.markeditTheming']);
const enabledMode = (rootValue.enabledMode ?? 'both') as string;

export const lightColors = toObject(rootValue.lightTheme) as Colors;
export const darkColors = toObject(rootValue.darkTheme) as Colors;
export const isModeCustomized = (isDark: boolean) => (['both', isDark ? 'dark' : 'light']).includes(enabledMode);
