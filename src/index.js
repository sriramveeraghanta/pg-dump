#! /usr/bin/env node

var pg = require('pg');
var path = require('path');
var fs = require('fs');
var _cliProgress = require('cli-progress');

var database_name = process.argv[2]
var cwd = path.resolve(process.cwd())

const pro_bar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

if (!fs.existsSync(path.resolve(cwd, 'data_dump'))){
    fs.mkdirSync(path.resolve(cwd, 'data_dump'));
}

var database_url = "postgres://localhost:5432/"+database_name;

var client = new pg.Client(database_url);
client.connect();

var tables = []
client.query("SELECT * FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema = 'public' ORDER BY table_type, table_name", function(err, result){
	if (err) {
		console.log(err);
	} else {
		console.log("Creating files......");
		result.rows.forEach(function(table, index){
			client.query("COPY "+table.table_name+" TO '"+path.resolve(cwd, 'data_dump')+"/"+table.table_name+".csv' DELIMITER ',' CSV HEADER;", function(err, res){
				if (err) {
					console.log(err)
				}else {
					pro_bar.start(result.rows.length, 0);
					pro_bar.update(index+1)
					if(result.rows.length === index+1){
						pro_bar.stop();
						console.log("Completed")
						client.end();
					}
				}
			})
		})
	}
});

