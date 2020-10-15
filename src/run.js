/**
 * Node dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const { formatReport } = require( './utils/format-report' );
const { getArgFromCLI, getFileArgsFromCLI, getHelp } = require( './utils/cli' );


const runAuditsFromCLIArgs = ( cssFiles ) => {
	const audits = [];
	const runAll = getArgFromCLI( '--all' );
	const runRecommended = getArgFromCLI( '--recommended' );

	if ( runAll || runRecommended || getArgFromCLI( '--colors' ) ) {
		audits.push( require( './audits/colors' )( cssFiles ) );
	}
	if ( runAll || runRecommended || getArgFromCLI( '--important' ) ) {
		audits.push( require( './audits/important' )( cssFiles ) );
	}
	if ( runAll || getArgFromCLI( '--display-none' ) ) {
		audits.push( require( './audits/display-none' )( cssFiles ) );
	}
	if ( runAll || runRecommended || getArgFromCLI( '--selectors' ) ) {
		audits.push( require( './audits/selectors' )( cssFiles ) );
	}
	if ( runAll || runRecommended || getArgFromCLI( '--media-queries' ) ) {
		audits.push( require( './audits/media-queries' )( cssFiles ) );
	}
	if ( !! getArgFromCLI( '--property-values' ) ) {
		audits.push(
			require( './audits/property-values' )(
				cssFiles,
				getArgFromCLI( '--property-values' ).split( ',' )
			)
		);
	}

	const reports = audits.flat().filter( Boolean );

	const format = getArgFromCLI( '--format' );

	return formatReport( reports, format );

};

const runAuditsFromConfig = ( config, cssFiles ) => {
	const audits = [];

	// TODO: Support value for config arg, and default to css-audit.config filename
	config.audits.forEach( audit => {
		// TODO: check for and support property-values array
		audits.push( require( `./audits/${audit}` )( cssFiles ) );
	});

	const reports = audits.flat().filter( Boolean );

	const format = config.format;

	return formatReport( reports, format );
}

const runAudits = ( config = false ) => {

	const input = getFileArgsFromCLI();

	if ( getArgFromCLI( '--help' ) || ! input.length ) {
		console.log( getHelp() ); // eslint-disable-line no-console
		process.exit( 0 );
	}

	const cssFiles = [];
	input.forEach( ( file ) => {
		const filePath = path.resolve( process.env.INIT_CWD, file );
		const stats = fs.statSync( filePath );
		if ( stats.isDirectory() ) {
			return;
		}
		if ( file.match( /min\.css$/ ) ) {
			return;
		}
		cssFiles.push( {
			name: file,
			content: String( fs.readFileSync( filePath ) ),
		} );
	} );

	const result = false !== config ? runAuditsFromConfig( config, cssFiles ) : runAuditsFromCLIArgs( cssFiles );

	return result;

}

module.exports = {
	runAudits
};
