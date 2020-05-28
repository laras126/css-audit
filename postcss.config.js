module.exports = {
	plugins: [
		// require( './src/codemods/remove-colors.js' )(),
		require( './src/codemods/rename-colors.js' ),
	],
};
