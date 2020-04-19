module.exports = {
	plugins: [
		require( './src/codemods/remove-colors.js' )(),
	],
};
