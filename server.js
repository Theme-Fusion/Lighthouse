// Copyright 2018 Google LLC.
// SPDX-License-Identifier: Apache-2.0

// server.js
// where your node app starts

// init project
const express        = require( 'express' );
var app              = express();
const fs             = require('fs');
const lighthouse     = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

app.get( '/', async ( req, res ) => {
	let target = req.headers.referer;

	if ( ! target || '' === target ) {
		res.send( 'No domain passed on.' );
	}

	const chrome       = await chromeLauncher.launch({chromeFlags: ['--headless'], onlyCategories: ['performance'] });
	const options      = {logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chrome.port};
	const runnerResult = await lighthouse( target, options );
    let data           = {
      fcp : {
        score: runnerResult.lhr.audits['first-contentful-paint'].score,
        display: runnerResult.lhr.audits['first-contentful-paint'].displayValue,
      },
      lcp: {
        score:  runnerResult.lhr.audits['largest-contentful-paint'].score,
        display: runnerResult.lhr.audits['largest-contentful-paint'].displayValue,
      },
      fid: {
        score: runnerResult.lhr.audits['max-potential-fid'].score,
        display: runnerResult.lhr.audits['max-potential-fid'].displayValue,
      }, 
      cls: {
        score: runnerResult.lhr.audits['cumulative-layout-shift'].score,
        display: runnerResult.lhr.audits['cumulative-layout-shift'].displayValue,
      },
      score: runnerResult.lhr.categories.performance.score
    }

	let jsonOutput = JSON.stringify( data );
	res.send( jsonOutput );
	  
  	await chrome.kill();
} );

// listen for requests :)
var listener = app.listen( process.env.PORT, function() {
  console.log( 'Your app is listening on port ' + listener.address().port );
} );
