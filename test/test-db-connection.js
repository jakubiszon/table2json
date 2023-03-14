// please review the connections before you run this script
const dbEngine = require( '../src/db-engine' );
const connections = require( './connections.json');

runPG();
runMS();


async function runPG( ) {
	pgEngine = dbEngine( "postgresql" );
	await pgEngine.open( connections.postgresql );

	const resultset = await pgEngine.query( "select $1 as foo, $2 as bar", [33, "bar-text"] );
	console.log( 'pg output:' );
	console.dir( resultset );

	await pgEngine.close( );
}

async function runMS( ) {
	msEngine = dbEngine( "sqlserver" );
	await msEngine.open( connections.sqlserver );

	const resultset = await msEngine.query( "select $1 as foo, $2 as bar", [11, 'some text'] )
	console.log( 'ms output:' );
	console.dir( resultset );

	await msEngine.close();
}
