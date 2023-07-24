const { join, parse } = require("path");

const { getOptions } = require("loader-utils");
const postcss = require("postcss");

const { extract, remove } = require("./postcss");

/**
 * wp-editor media query loader
 */
function loader(source) {
  const callback = this.async();
  const options = getOptions(this);
  const parsed = parse(this.resourcePath);

  // bail early if the source does not contain any queries
  // or the module is not slated for inclusion
  if (!containsQuery(source) || isIncluded(parsed.name, options.include))
    return callback(null, source);

  postcss([extract])
    .process(source, { from: parsed.base })
    /**
     * Extract the editor specific css from the source file
     * and emit it as a separate file
     */
    .then((extracted) => {
      const emitPath = join(`editor`, parsed.base);
      this.emitFile(emitPath, extracted.toString(), false);

      /**
       * Remove the editor specific css from the source file
       * and return the result
       */
      postcss([remove])
        .process(source, { from: parsed.base })
        .then((result) => {
          callback(null, result.toString());
        });
    });
}

/**
 * Check if the source contains any queries
 */
const containsQuery = (source) =>
  [
    source.match(/@editor/),
    source.match(/@editor-only/),
    source.match(/@media.*\(?wp-editor\)?/),
  ].some(Boolean);

/**
 * Check if the module is slated for inclusion
 */
const isIncluded = (name, included = []) => included.includes(name);

module.exports = loader;
