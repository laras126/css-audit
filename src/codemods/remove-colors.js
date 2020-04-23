const postcss = require( 'postcss' );
const getColors = require( 'get-css-colors' );

/* A size is any number, optionally with a unit. */
const isSize = ( value ) => /^\d+\s?([a-zA-Z]+)?$/.test( value.trim() );

/* If the value has a color in it, getColors will return an array. */
const isColor = ( value ) => null !== getColors( value );

/* A line style is from a set of values */
const isLineStyle = ( value ) =>
	-1 !==
	[
		'auto', // Technically only allowed on outline.
		'none',
		'hidden',
		'dotted',
		'dashed',
		'solid',
		'double',
		'groove',
		'ridge',
		'inset',
		'outset',
	].indexOf( value );

function explodeProp( decl ) {
	switch ( decl.prop ) {
		case 'border':
		case 'border-top':
		case 'border-right':
		case 'border-bottom':
		case 'border-left':
		case 'outline':
			const values = decl.value.split( ' ' );
			values.forEach( ( value ) => {
				if ( isLineStyle( value ) ) {
					decl.before(
						postcss.decl( { prop: decl.prop + '-style', value } )
					);
				} else if (
					isSize( value ) ||
					-1 !== [ 'thin', 'medium', 'thick' ].indexOf( value )
				) {
					decl.before(
						postcss.decl( { prop: decl.prop + '-width', value } )
					);
				} else if ( isColor( value ) ) {
					decl.before(
						postcss.decl( { prop: decl.prop + '-color', value } )
					);
				}
			} );
			decl.remove();
			break;
	}
}

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
