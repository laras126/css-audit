const postcss = require( 'postcss' );
const getColors = require( 'get-css-colors' );

const explodeProp = require( './utils/explode-prop' );

module.exports = postcss.plugin( 'remove-colors', function() {
	return function( root ) {
		root.walkRules( ( rule ) => {
			// Explode out the border/outline props.
			rule.walkDecls( ( decl ) => {
				explodeProp( decl );
			} );
			// Remove any declarations that have color.
			rule.walkDecls( ( decl ) => {
				const hasColors = getColors( decl.value );
				// grayscale isn't actually a color, it's used in antialiasing.
				if ( 'grayscale' === decl.value ) {
					return;
				}
				if ( Array.isArray( hasColors ) ) {
					let value = decl.value.slice();
					hasColors.forEach( ( color ) => {
						value = value.replace( color, '' );
					} );
					decl.remove();
				}
			} );
		} );
		// Remove all empty rule blocks.
		root.walkRules( ( rule ) => {
			if ( rule.nodes && 0 === rule.nodes.length ) {
				rule.remove();
			}
		} );
		// Remove all empty @rule blocks.
		root.walkAtRules( ( rule ) => {
			if ( rule.nodes && 0 === rule.nodes.length ) {
				rule.remove();
			}
		} );
	};
} );
