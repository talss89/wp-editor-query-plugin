const ExtractEditorRules = {
  postcssPlugin: "WpEditorExtractRules",
  AtRule(atRule) {
    if (
      atRule.name.startsWith(`editor`) ||
      atRule.params.includes(`wp-editor`)
    ) {
      return atRule.replaceWith(atRule.nodes);
    }

    atRule.remove();
  },
};

const RemoveEditorRules = {
  postcssPlugin: "WpEditorRemoveRules",
  AtRule(atRule) {
    // @editor
    if (atRule.name === `editor`) {
      return atRule.replaceWith(atRule.nodes);
    }

    // @editor-only
    if (atRule.name === `editor-only`) {
      return atRule.remove();
    }

    // @media (wp-editor)
    if (atRule.params.includes(`wp-editor`)) {
      // @media all and (wp-editor)
      if (atRule.params.includes(`all`)) {
        return atRule.replaceWith(atRule.nodes);
      }

      return atRule.remove();
    }
  },
};

module.exports = {
  extract: ExtractEditorRules,
  remove: RemoveEditorRules,
};
