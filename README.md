# MarkEdit-theming

Easily create custom [MarkEdit](https://github.com/MarkEdit-app/MarkEdit) themes using existing CodeMirror theme extensions. See [MarkEdit-api](https://github.com/MarkEdit-app/MarkEdit-api) to learn more.

Please see [MarkEdit Themes](https://markedit-app.github.io/extensions/#themes) for a complete list of themes and an explanation of how they work.

## Usage

Add `markedit-theming` to your (TypeScript) project's dependencies:

```json
{
  "dependencies": {
    "markedit-theming": "https://github.com/MarkEdit-app/MarkEdit-theming#v0.14.0"
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

### Preview styling

A theme can also style the [MarkEdit-preview](https://github.com/MarkEdit-app/MarkEdit-preview) pane, so Preview mode matches the editor. Declare colors via `previewStyles`; they are applied only while that theme variant is active, and it is a no-op when the preview extension is not installed:

```ts
overrideThemes({
  light: {
    extension,
    colors,
    previewStyles: {
      markdownBody: { background: '#faf8f5', color: '#2d2006' },
      links: { color: '#1659df' },
      inlineCode: { color: '#896724', background: '#ddceb154' },
    },
  },
  dark: {
    extension,
    colors,
    previewStyles: {
      markdownBody: { background: '#2a2734', color: '#eeebff' },
      links: { color: '#9a86fd' },
      inlineCode: { color: '#ffb870', background: '#36334280' },
    },
  },
});
```

Available groups: `markdownBody`, `headings`, `links`, `inlineCode`, `codeBlocks`, `blockquotes`, `tables`, and `dividers` — see `PreviewStyles` in [index.d.ts](/dist/index.d.ts).

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
