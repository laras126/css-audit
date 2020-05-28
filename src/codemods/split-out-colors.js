const fs = require('fs');
const postcss = require('postcss');
const getColors = require('get-css-colors');

const explodeProp = require('./utils/explode-prop');

function writeCSS(name, output) {
	fs.writeFileSync(name, output);
}

module.exports = postcss.plugin('split-colors', function() {
	function getColorDecls(rule) {
		let hasColors = false;
		const colorDecls = [];
		// Explode out the border/outline props.
		rule.walkDecls(explodeProp);
		// Remove any declarations that have color.
		rule.walkDecls((decl) => {
			hasColors = Array.isArray(getColors(decl.value));
			// grayscale isn't actually a color, it's used in antialiasing.
			if ('grayscale' === decl.value) {
				return;
			}
			if (hasColors) {
				colorDecls.push(decl.clone());
				decl.remove();
			}
		});

		return colorDecls;
	}

	return function(root) {
		const colorRules = [];

		root.walkRules((rule) => {
			if ('atrule' === rule.parent.type) {
				return;
			}

			const colorDecls = getColorDecls(rule);

			if (colorDecls.length) {
				const newRule = rule.clone().removeAll();
				newRule.append(colorDecls);
				colorRules.push(newRule);
			}
		});

		root.walkAtRules((atRule) => {
			const localRules = [];
			atRule.walkRules((rule) => {
				const colorDecls = getColorDecls(rule);
				if (colorDecls.length) {
					const newRule = rule.clone().removeAll();
					newRule.append(colorDecls);
					localRules.push(newRule);
				}
			});

			if (localRules.length) {
				const newRule = atRule.clone().removeAll();
				newRule.append(localRules);
				colorRules.push(newRule);
			}
		});

		// Remove all empty rule blocks.
		root.walkRules((rule) => {
			if (rule.nodes && 0 === rule.nodes.length) {
				rule.remove();
			}
		});

		// Remove all empty @rule blocks.
		root.walkAtRules((rule) => {
			if (rule.nodes && 0 === rule.nodes.length) {
				rule.remove();
			}
		});

		const newRoot = postcss.root();
		newRoot.append(colorRules);
		writeCSS('colors.css', newRoot.toString());
	};
});
