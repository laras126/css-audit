/**
 * External dependencies
 */
const { parse } = require( 'postcss' );

/**
 * Internal dependencies
 */
const getValuesCount = require( '../utils/get-values-count' );

module.exports = function ( files = [], properties = [] ) {
	const values = [];
	if ( ! Array.isArray( properties ) ) {
		properties = Array( properties );
	}
	// Skip out if no properties are passed in.
	if ( ! properties.length ) {
		return { results: [] };
	}

	files.forEach( ( { content, name } ) => {
		const root = parse( content, { from: name } );
		root.walkDecls( function ( { prop, value } ) {
			if ( -1 !== properties.indexOf( prop ) ) {
				values.push( value );
			}
		} );
	} );

	const uniqueValues = [ ...new Set( values ) ];
	const valuesByCount = getValuesCount( values );

	return {
		audit: 'property-values',
		name: `Property Values: ${ properties.join( ', ' ) }`,
		results: [
			{
				id: 'count',
				label: `Number of values for ${ properties.join( ', ' ) }`,
				value: values.length,
			},
			{
				id: 'count-unique',
				label: `Number of unique values for ${ properties.join(
					', '
				) }`,
				value: uniqueValues.length,
			},
			{
				id: 'top-10-values',
				label: `Top 10 most-used values for ${ properties.join(
					', '
				) }`,
				value: valuesByCount.slice( 0, 10 ),
			},
			{
				id: 'bottom-10-values',
				label: `Top 10 least-used values for ${ properties.join(
					', '
				) }`,
				value: valuesByCount.slice( -10 ).reverse(),
			},
		],
	};
};
