const postcss = require( 'postcss' );
const getColors = require( 'get-css-colors' );

module.exports = postcss.plugin( 'rename-colors', function() {
	return function( root ) {
		const colorList = [];
		root.walkRules( ( rule ) => {
			if ( 'atrule' === rule.parent.type ) {
				return;
			}

			// Remove any declarations that have color.
			rule.walkDecls( ( decl ) => {
				const colors = getColors( decl.value );
				let value = decl.value;
				// grayscale isn't actually a color, it's used in antialiasing.
				if ( 'grayscale' === decl.value ) {
					return;
				}
				if ( Array.isArray( colors ) ) {
					const hasMultiple = colors.length > 1;
					colors.forEach( ( color, i ) => {
						let name = `${ rule.selector }--${ decl.prop }`.replace( /[^a-z0-9-_]+/ig, '-' );
						if ( name[ 0 ] === '-' ) {
							name = name.slice( 1 );
						}
						if ( hasMultiple ) {
							name += `-${ i }`;
						}
						colorList.push( {
							name: `--${ name }`,
							value: color,
						} );
						value = value.replace( color, `var(--${ name })` );
					} );
				}

				decl.value = value;
			} );
		} );

		const rootRule = postcss.rule( { selector: ':root' } );
		colorList.forEach( ( { name, value } ) => {
			const decl = postcss.decl( { prop: name, value } );
			rootRule.append( decl );
		} );
		root.prepend( rootRule );
	};
} );
