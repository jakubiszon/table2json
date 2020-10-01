const dbEngine = require('../src/db-engine');

// comment out the function you don't need
// you also need to update the connection details in each function you run
runPG();
runMS();


async function runPG( ) {
	pgEngine = dbEngine( "postgresql" );
	await pgEngine.open( {
		"host":"localhost",
		"port":5432,
		"database":"xxxxx",
		"password":"xxxxx",
		"user":"xxxxx"
	} );

	const resultset = await pgEngine.query( "select $1 as foo, $2 as bar", [33, "bar-text"] );
	console.log( 'pg output:' );
	console.dir( resultset );

	await pgEngine.close( );
}

async function runMS( ) {
	msEngine = dbEngine( "sqlserver" );

	//let sqlConfig = "Server=localhost;Database=company_microservice;User Id=haslo_a;Password=a";
	let sqlConfig = {
		password: 'a',
		database: 'master',
		stream: false,
		options: {
			enableArithAbort: true,
			encrypt: true
		},
		port: 1433,
		user: 'haslo_a',
		server: 'localhost',
	}

	await msEngine.open( sqlConfig );

	const resultset = await msEngine.query( "select $1 as foo, $2 as bar", [11, 'some text'] )
	console.log( 'ms output:' );
	console.dir( resultset );

	await msEngine.close();

}
