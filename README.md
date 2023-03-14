# table2json - tiny table structure reader
table2json is a minimalistic database structure reader. It can load structure data for postgresql or sql-server. It returns json data for the following items:

* tables
* table columns ( names, types, default values, identity usage, etc. )
* primary keys
* foreign keys
* unique indexes

table2json was tested on postgres and sql-server but as it relies on **information_schema** views it might be plugged in to other DBMS *with some effort*.

## How to use it?
You will need to install this package to reference it
```
npm install --save https://github.com/jakubiszon/table2json
```
Requiring the package `require( 'table2json' )` will return a function. The function can be used to create a database interface object.

The db-interface object expose just 2 functions reading data: `listAllTables` and `defineTable`. There also are `open` and `close` methods to manage the connection.

Example usage:
```js
const table2json = require( 'table2json' );
const fs = require( 'fs' ).promises;

(async function () {
	// create a db-interface, we need to pass dbms name
	// this could be either "postgres" or "sqlserver"
	// in this example we will play with postgres
	const db = table2json( 'postgresql' );

	// connect to the database
	await db.open({
		"host":"localhost",
		"port":5432,
		"database":"xxx",
		"password":"xxx",
		"user":"xxx"
	});

	// get the list of tableNames for the schema public
	let tables = await db.listAllTables();
	console.log(tables);

	// get table definitions
	const tableData = await Promise.all( tables.map( t => db.defineTable( t.table_schema, t.table_name )));

	// close the reader now
	await db.close( );

	// now tableData contains table objects
	// what you do with them is up to you
	// here we simply save them as files
	const filePromises = tableData.map(
		tableObject => fs.writeFile(
			`output/${tableObject.table_schema}.${tableObject.table_name}.json`,
			JSON.stringify( tableObject, null, 4 )
		)
	);

	await Promise.all( filePromises );
})();
```

For backwards compatibility, it is still possible to use the old `listTables` function
but it requires you to know what schema you want to use in advance.
```js
// get the list of tableNames for the schema public
let tableNames = await db.listTables( 'public' );
```

### Connecting to postgres
To connect to postgres you need to:
  1. Create a database interface by passing 'postgres' as the argument
```JS
const db = table2json( 'postgresql' );
```
  2. Pass connection description object to the `open` method, this object is consumed by the [pg library](https://www.npmjs.com/package/pg) and should be compatible with its specification
```JS
await db.open({
	"host":"localhost",
	"port":5432,
	"database":"xxxxx",
	"password":"xxxxx",
	"user":"xxxxx"
});
```

### Connecting to sqlserver
To connect to sqlserver you need to:
  1. Create a database interface by passing 'sqlserver' as the argument
```JS
const db = table2json( 'sqlserver' );
```
  2. Pass connection description object or a connection string to the `open` method. The format is identical to the one used when connecting to postgres.
```JS
// example
await db.open({
	"host": "localhost",
	"port": 1433,
	"database": "xxxxx",
	"password": "xxxxx",
	"user": "xxxxx"
});
```
Note:
 - The sqlserver you connect to should accept TCP/IP connections.
