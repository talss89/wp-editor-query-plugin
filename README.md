# WP Editor Query Plugin for Webpack 5

*This is a Webpack 5 plugin, but I mainly use it with [Bud](https://bud.js.org). Examples use `bud`, but it should be usable in plain webpack too.*

## The problem:

When working on modern WordPress / Gutenberg theme development, we often like to make use of bundlers and hot-reloading to make our development life a lot easier. WordPress isn't really built with this workflow in mind.

Currently (as of WordPress 6.1.0), the 'block editor' loads styles from disk or URL, wraps them in an editor parent class, and then outputs them inline as `<style>` blocks in the editor iframe. This becomes a problem for us when using a module bundler such as Webpack or [Bud](https://bud.js.org), because in development mode our CSS assets are injected via a Javascript runtime, and don't exist on disk.

Sure, we can extract CSS to a file (eg. `mini-css-extract-plugin`), but we can end up with no separation between our main (front-end) styles and editor styles.

## The solution:

This plugin can selectively extract CSS rules from our main stylesheet, and output them to a CSS asset, to be loaded in WordPress. It can also `adopt` full entrypoints, and ensure that a CSS asset is emitted. Which approach you choose is up to you.

The plugin will emit a `css/default.editor.css` file to your build directory, containing editor styles only.

# Getting Started

*This plugin is pre-alpha, so is not published on NPM yet.*

1. Add the plugin to your `devDependencies` - eg. `yarn add https://github.com/talss89/wp-editor-query-plugin --dev`
2. Load the plugin
3. Add loader to CSS rules

## An example of a setup using [Bud](https://bud.js.org)

Until this plugin is wrapped up into a real `bud` plugin, there's a little bit of setup required:

In your `bud.config.js` file:
```JS
import WpEditorQueryPlugin from 'wp-editor-query-plugin';

export default async (app) => {

  await app.extensions.add(new WpEditorQueryPlugin())
  
  app.build.setLoader(
    `editor-extract-loader`,
    WpEditorQueryPlugin.loader
  )

  app.build.setItem(`wp-editor`, {
    loader: `editor-extract-loader`,
    options: {
      include: ['name-of-an-entrypoint'],
      adopt: ['name-of-an-entrypoint']
    },
  })

  app.build.rules.css.setUse(items => ['precss', 'css', 'wp-editor', 'postcss'])
  
  /* 
    ... Your configuration continues  ...
  */
```

Be sure to update your `options.include` and / or `options.adopt` parameters above.

Remember, you will also need to load the resulting CSS asset in WordPress via `add_editor_style`. An example of this in [Sage 10][https://sage.roots.io] is below:

```PHP
add_action('after_setup_theme', function () {
  $relAppCssPath = asset('css/default.editor.css')->relativePath(get_theme_file_path());
  add_editor_style($relAppCssPath);
});
```

# Choosing an approach (mark or adopt)

Now decide on how you wish to assign your editor styles. There are two approaches:

1. **Mark** - In your main stylesheet, wrap styles with a special media query to assign them to your editor stylesheet.
2. **Adopt** - Adopt an entire entrypoint, and ensure that the styles are always emitted as CSS

You may combine the two approaches, but marking rules in an adopted file is not useful and may result in unexpected behaviour. Marked styles will override adopted styles.

## Adopting Entire Stylesheets

Simply pass the name of your entrypoint as a loader option:

```JS
  app.build.setItem(`wp-editor`, {
    loader: `editor-extract-loader`,
    options: {
      adopt: ['editor']
    },
  })
```

In this example, any styles included in your `editor` entrypoint will now be emitted to `css/default.editor.css`.

## Marking Styles

To selectively mark styles to be extracted to your editor stylesheet from another entrypoint, ensure they're passed to the plugin via rule options:

```JS
  app.build.setItem(`wp-editor`, {
    loader: `editor-extract-loader`,
    options: {
      include: ['app', 'another-entrypoint']
    },
  })
```

All entrypoints `include`d will be processed for marked styles (`app` and `another-entrypoint` in this example).

Then, simply mark your styles using the special media query:

```CSS
@media all, (wp-editor) {

    /* Style is in both main and editor CSS */

    .your-styles-here {
        color: blue;
    }
}

@media (wp-editor) {

    /* Style is ONLY in editor CSS */

    .your-styles-here {
        color: blue;
    }
}
```

The plugin is smart enough to unwrap and remove the `@media` query, so no bloat is generated.

This syntax makes use of a fake [Media Feature](https://www.w3.org/TR/mediaqueries-4/#mq-features), which just about complies with Media Queries Level 4.

You may also use an alternative syntax, but this is not true CSS, and relies on a custom `@` rule. Your IDE may complain, linters may bork, CI jobs might curl up and die. However, it's shorter, and you can also optionally chunk editor styles into another file:

```CSS
@editor {

    /* Style is in both main and editor CSS */

    .your-styles-here {
        color: blue;
    }
}

@editor-only {

    /* Style is ONLY in editor CSS */

     .your-styles-here {
        color: blue;
    }
}

.your-styles-here {
    color: blue;
    /* Following property is in both main and editor CSS */
    @editor { font-weight: bold; }
}

@editor other-stylesheet {

    /* Style is in both main and editor CSS, */
    /* But output to the module:
    /* css/other-stylesheet.editor.css */

    .your-styles-here {
        color: blue;
    }
}
```

# Contributing

This is still a rough hack, and any feedback / help is appreciated. It is based on code from https://github.com/SassNinja/media-query-plugin