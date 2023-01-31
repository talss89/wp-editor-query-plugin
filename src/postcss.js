/**
 * The PostCSS plugin component is supposed to extract the media CSS from the source chunks.
 * The CSS get saved in the store.
 */

const postcss = require('postcss');
const store = require('./store');
const normalize = require('./utils/normalize');

module.exports = postcss.plugin('WpEditorPostCSS', options => {

    function addToStore(name, atRule) {

        const css = postcss.root().append(atRule.nodes).toString();
        const query = atRule.params;
        
        store.addMedia(name, css, options.path, query);
    }

    return (css, result) => {

        css.walkAtRules('editor', atRule => {
            const name = atRule.params ? atRule.params : 'default';

            addToStore(name, atRule.clone());
            atRule.replaceWith(atRule.nodes);
            atRule.remove();
        });

        css.walkAtRules('editor-only', atRule => {
            const name = atRule.params ? atRule.params : 'default';

            addToStore(name, atRule.clone());
            atRule.remove();
        });
    };
});