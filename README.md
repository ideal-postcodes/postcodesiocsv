# Postocodes.io CSV Translation

A quick command line script to translate a CSV of postcodes (with postcodes in first column) into a list of results retrieved from the Postcodes.io API

## Install

Since this is a command line script, you will need to install this globally

```
npm install postcodesiocsv -g
```

## Getting Started

```
postcodesiocsv -i <INPUT_FILE.csv> -o <OUTPUT_FILE.csv>
```

This will return postcode,longitude,latitude by default. Specify your own output schema with the `-s` flag with properties separated by a comma

```
postcodesiocsv -i <INPUT_FILE.csv> -o <OUTPUT_FILE.csv> -s postcode,country,northings,eastings
```

## Example

input.csv

```
CA7 3AJ
HP10 9AW
INVALID POSTCODE
PL17 7BW
```

Run with:
```
postcodesiocsv -i example.csv -o output.csv
```

output.csv
```
CA7 3AJ,-3.32567403434222,54.7646808638358
HP10 9AW,-0.711040381510592,51.5989108287906
INVALID POSTCODE,,
PL17 7BW,-4.31379882001634,50.5040671479147
```

## Changelog

1.0.2 Initiate script from ./bin/
1.0.0 Initial commit