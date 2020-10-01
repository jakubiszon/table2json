const dbReader= require('../index');

async function test( ) {
	reader = dbReader( "sqlserver" );

	let sqlConfig = {
		password: 'a',
		database: 'company_microservice',
		stream: false,
		options: {
			enableArithAbort: true,
			encrypt: true
		},
		port: 1433,
		user: 'haslo_a',
		server: 'localhost',
	}

	await reader.open( sqlConfig );

	let tables = await reader.listTables( 'dbo' );

	if( !tables ) console.log( "table is empty" );
	else console.dir( tables );

	await reader.close();
}

test();