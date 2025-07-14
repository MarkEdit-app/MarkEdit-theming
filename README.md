# MarkEdit-theming

Easily create custom [MarkEdit](https://github.com/MarkEdit-app/MarkEdit) themes using existing CodeMirror theme extensions. See [MarkEdit-api](https://github.com/MarkEdit-app/MarkEdit-api) to learn more.

A list of themes created by the MarkEdit team can be found [here](https://github.com/MarkEdit-app/MarkEdit/wiki/Extensions#list-of-themes).

## Usage

Add `markedit-theming` to your (TypeScript) project's dependencies:

```json
{
  "dependencies": {
    "markedit-theming": "https://github.com/MarkEdit-app/MarkEdit-theming#v0.8.0"
  }
}
```

In your script, use the `overrideThemes` function to override the app's built-in themes:

```ts
import { overrideThemes } from 'markedit-theming';

overrideThemes({
  light: { extension, colors },
  dark: { extension, colors },
});
```

This package is fully typed and documented, see [index.d.ts](/dist/index.d.ts) for details.

## User Customization

Themes built with this package provide a way for user to customize colors, see the [wiki](https://github.com/MarkEdit-app/MarkEdit-theming/wiki#customization) for details.

## Community CodeMirror Themes

Here are some community-created CodeMirror theme extensions:

- [theme-one-dark](https://github.com/codemirror/theme-one-dark) by [@codemirror](https://github.com/codemirror)
- [cm6-themes](https://cm6-themes.netlify.app/) by [@craftzdog](https://github.com/craftzdog)
- [ThemeMirror](https://thememirror.net/) by [@vadimdemedes](https://github.com/vadimdemedes)
- [CodeMirror Themes](https://uiwjs.github.io/react-codemirror/#/theme/home) by [@uiwjs](https://github.com/uiwjs)

These extensions can be easily ported to MarkEdit using `markedit-theming`.

That said, not all implementations are of high quality and may require further refinement.
