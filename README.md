# WP Editor Query Plugin

This is quick hack which will extract `@editor` at-rules and output them as CSS assets.

Developed for the Sage 10 / Bud workflow.

Readme to come at a later date.

Load plugin, add loader before 'postcss' - it needs plain CSS to function.

Here's an example `bud.config.js`:

```JS
/**
 * Build configuration
 *
 * @see {@link https://roots.io/docs/sage/ sage documentation}
 * @see {@link https://bud.js.org/guides/configure/ bud.js configuration guide}
 *
 * @typedef {import('@roots/bud').Bud} Bud
 * @param {Bud} app
 */

import WpEditorQueryPlugin from 'wp-editor-query-plugin';

export default async (app) => {
  /**
   * Application entrypoints
   * @see {@link https://bud.js.org/docs/bud.entry/}
   */
  await app.extensions.add(new WpEditorQueryPlugin())
  
  app.build.setLoader(
    `editor-extract-loader`,
    WpEditorQueryPlugin.loader
  )

  app.build.setItem(`wp-editor`, {
    loader: `editor-extract-loader`,
    options: {
      include: [
        'app'
    ],
    queries: {
        'print, screen and (min-width: 75em)': 'desktop'
    }
    },
  })

  app.build.rules.css.setUse(items => ['precss', 'css', 'wp-editor', 'postcss'])

  app
    // .use(new WpEditorQueryPlugin())
    .entry({
      app: ['@scripts/app', '@styles/app'],
      editor: ['@scripts/editor', '@styles/editor'],
    })

    /**
     * Directory contents to be included in the compilation
     * @see {@link https://bud.js.org/docs/bud.assets/}
     */
    .assets(['images'])

    /**
     * Matched files trigger a page reload when modified
     * @see {@link https://bud.js.org/docs/bud.watch/}
     */
    .watch(['resources/views', 'app'])

    /**
     * Proxy origin (`WP_HOME`)
     * @see {@link https://bud.js.org/docs/bud.proxy/}
     */
    .proxy('https://local.example')

    /**
     * Development origin
     * @see {@link https://bud.js.org/docs/bud.serve/}
     */
    .serve('http://0.0.0.0:3000')

    /**
     * URI of the `public` directory
     * @see {@link https://bud.js.org/docs/bud.setPublicPath/}
     */
    .setPublicPath('/app/themes/sage/public/')
    /**
     * Generate WordPress `theme.json`
     *
     * @note This overwrites `theme.json` on every build.
     *
     * @see {@link https://bud.js.org/extensions/sage/theme.json/}
     * @see {@link https://developer.wordpress.org/block-editor/how-to-guides/themes/theme-json/}
     */
    .wpjson.settings({
      appearanceTools: true,
      color: {
        custom: false,
        customDuotone: false,
        customGradient: false,
        defaultDuotone: false,
        defaultGradients: false,
        defaultPalette: false,
        duotone: [],
      },
      custom: {
        spacing: {},
        typography: {
          'font-size': {},
          'line-height': {},
        },
      },
      spacing: {
        padding: true,
        units: ['px', '%', 'em', 'rem', 'vw', 'vh'],
      },
      typography: {
        customFontSize: false,
      },
    })
    .useTailwindColors()
    .useTailwindFontFamily()
    .useTailwindFontSize()
    .enable()
    
};

```

## Prerequisites

You should already have a working webpack configuration before you try to use this plugin. If you haven't used webpack yet please go through the [webpack guide](https://webpack.js.org/guides/) first and start using this awesome tool for your assets mangement!

## Contribution

This plugin has been built because I wasn't able to find a webpack solution for such a trivial task of splitting files by media query and loading them async. It works for my use cases by I'm pretty sure it can get more improved. So if you miss any feature don't hesitate to create an issue as feature request or to create a PR to do the job.

**And last but not least, if you like this plugin please give it a star on github and share it!**

