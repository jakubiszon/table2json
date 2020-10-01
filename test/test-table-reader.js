const dbReader = require('../index');

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

async function test() {
	let db = dbReader( "sqlserver" );
	await db.open( sqlConfig );
	let tables = await db.listTables( 'dbo' );
	let tableData = await Promise.all( tables.map( tname => db.defineTable( 'dbo', tname) ) );

	console.log( tables );
	console.dir( tableData );

	await db.close();
}

test();
