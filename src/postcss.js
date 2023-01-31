/**
 * The PostCSS plugin component is supposed to extract the media CSS from the source chunks.
 * The CSS get saved in the store.
 */

const postcss = require('postcss');
const store = require('./store');
const normalize = require('./utils/normalize');
const processed = Symbol('wpe-processed')

module.exports = (options) => {

    function addToStore(name, node) {
        const css = postcss.root().append(node.type === 'atrule' ? node.nodes : node).toString();
        store.addMedia(name, css, options.path, '');
    }

    return { 
        postcssPlugin: "WpEditorPostCSS",
        AtRule(atRule) {
        if(atRule.name == 'editor' || atRule.name === 'editor-only') {
          if (!atRule[processed]) {
            const name = atRule.params ? atRule.params : 'default';
            
            if(atRule.nodes.length > 0 && atRule.nodes[0].type == 'decl') {
                const ghostNode = new postcss.Rule({selector: atRule.parent.selector})
                ghostNode.append(atRule.clone().nodes)
                atRule.replaceWith(atRule.nodes);
                atRule.remove();
                addToStore(name, ghostNode.clone());

            } else {
                addToStore(name, atRule.clone());
                if(atRule.name === 'editor') {
                    atRule.replaceWith(atRule.nodes);
                }
                atRule.remove();
            }
            atRule[processed] = true
          }
        }
        
      }}
};