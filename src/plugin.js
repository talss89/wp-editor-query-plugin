/**
 * The plugin component is supposed to extract @editor and @editor-only at-rules to *.editor.css assets.
 */

const pluginName = 'WpEditorQueryPlugin';

const { RawSource } = require('webpack-sources');
const Compilation = require('webpack/lib/Compilation');
const store = require('./store');

module.exports = class WpEditorQueryPlugin {

    constructor(options) {
        this.options = Object.assign({
            include: [],
            queries: {},
            groups: {}
        }, options);
    }

    getFilenameOption(compiler) {
        const plugins = compiler.options.plugins;
        let MiniCssExtractPluginOptions = {};

        for (const plugin of plugins) {
            if (plugin.constructor.name === 'MiniCssExtractPlugin') {
                MiniCssExtractPluginOptions = plugin.options || {};
            }
        }

        return MiniCssExtractPluginOptions.filename || compiler.options.output.filename;
    }

    apply(compiler) {

        // if no filename option set, use default
        this.options.filename = this.options.filename || this.getFilenameOption(compiler);

        // save options in store to provide to loader
        store.options = this.options;

        // reset store for every webpack instance
        // required for unit testing because the store is shared
        compiler.hooks.entryOption.tap(pluginName, () => {
            store.resetMedia();
        });

        // if a filename has become invalid (watch mode)
        // remove all related data from store
        compiler.hooks.invalid.tap(pluginName, (fileName, changeTime) => {
            store.removeMediaByFilename(fileName);
        });

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {

            const hasDeprecatedChunks = (compilation.chunks instanceof Set) === false; // webpack < 5

            if (hasDeprecatedChunks) {
                console.warn('\n\n[WARNING] We are going to drop webpack 4 support with the next major version so you should consider upgrading asap!\n\n');
            }

            const processAssets = (compilationAssets, cb) => {

                const chunks = compilation.chunks;
                const chunkIds = [...chunks].map(chunk => chunk.id);
                const assets =  hasDeprecatedChunks ? compilation.assets : compilationAssets;

                store.getMediaKeys().forEach(mediaKey => {
                    const css = store.getMedia(mediaKey);
                    const queries = store.getQueries(mediaKey);
                    const fn = 'css/' + mediaKey + '.editor.css';
                    compilation.emitAsset(fn, new RawSource(css));
                });

                cb();
            }


            // Since webpack 4 doesn't have the processAssets hook, we need the following condition.
            // In future (once webpack 4 support has been dropped) this can be simplified again.
            if (hasDeprecatedChunks) {
                compilation.hooks.additionalAssets.tapAsync(pluginName, (cb) => {
                    processAssets(compilation.assets, cb);
                });
            } else {
                compilation.hooks.processAssets.tapAsync({
                    name: pluginName,
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
                }, (assets, cb) => {
                    processAssets(assets, cb);
                });
            }

        });

    }
};
