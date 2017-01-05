"use strict";

const fs = require("fs");
const csv = require("csv");
const path = require("path");
const async = require("async");
const request = require("request");
const prompt = require('prompt-sync')();
const client = new require('postcodesio-client')();
const argv = require('minimist')(process.argv);

const DEFAULT_SCHEMA = ["postcode", "longitude", "latitude"];

const onError = error => {
	console.log(`An error occurred: ${error.message}`);
	process.exit(1);
};


// Detect input file
const inputFile = argv.i;
if (!inputFile) {
	let message = `
		Please specify an input CSV file with the -i flag. 
		Please include postcode searches in the first column
	`;
	return onError(new Error(message));
}
const fullInputPath = path.resolve(inputFile);
try {
	fs.statSync(inputFile)
} catch (e) {
	let message = `Unable to find input file ${inputFile} (${fullInputPath})`
	onError(new Error(message));
}

// Detect output file
const ouputFile = argv.o;
if (!ouputFile) {
	let message = `
		Please specify an output CSV file with the -o flag
	`;
	return onError(new Error(message));
}
const fullOutputPath = path.resolve(ouputFile);

// Detect Schema
let outputSchema = DEFAULT_SCHEMA;
const SCHEMA = argv.s;
if (SCHEMA) {
	console.log("Custom CSV output schema detected");
	outputSchema = SCHEMA.split(",");
}

// Get confirmation from user to proceed
console.log(`\nYou are about to initiate a script to lookup postcodes at: \n${fullInputPath}`);
console.log(`The output will be written as CSV to: \n${fullOutputPath}`);
console.log(`The output CSV schema will be: \n${outputSchema.join(", ")}\n`)
const confirmation = prompt("Type 'yes' to continue: ");
if (!confirmation.match(/yes/i)) {
	console.log("You have opted to abort the script");
	process.exit(0);
}

// Start retrieving data
const data = [];

fs.createReadStream(inputFile, { encoding: "utf8" })
.pipe(csv.parse({ delimiter: "," }))
.on("data", row => data.push(row[0]))
.on("error", onError)
.on("end", () => {
	console.log(`Loaded ${data.length} postcodes`);
	console.log("Please wait while results are being retrieved from the API...");
	let count = 0;
	const toRow = (postcode, data) => {
		return outputSchema.map(attr => {
			if (attr === "postcode") return postcode;
			if (data === null) return null;
			return data[attr];
		});
	};

	async.map(data, (postcode, callback) => {
		client.lookup(postcode, (error, result) => {
			count += 1;
			if (count > 0 && count % 10000 === 0) {
				console.log(`${count} postcodes retrieved`);
			}
			return callback(error, toRow(postcode, result));
		});
	}, (error, output) => {
		if (error) return onError(error);
		csv.stringify(output, (error, data) => {
			if (error) return onError(error);
			fs.writeFileSync(ouputFile, data, { encoding: "utf8" });
			console.log(`Completed retrieval. Results written to ${fullOutputPath}`);
			process.exit(0);
		});
	});
});
