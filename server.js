// Copyright 2018 Google LLC.
// SPDX-License-Identifier: Apache-2.0

// server.js
// where your node app starts

// init project
const express        = require( 'express' );
var app              = express();
const fs             = require( 'fs' );
const lighthouse     = require( 'lighthouse' );
const chromeLauncher = require( 'chrome-launcher' );
const axios          = require( 'axios' );

app.get( '/', async ( req, res ) => {
  req.connection.setTimeout( 60 * 10 * 1000 );

  let target         = req.headers.referer;
  let responseTarget = req.headers.response_target;
  let demoName       = req.headers.demo_name;

  if ( ! target || '' === target || ! responseTarget || '' === responseTarget ) {
    res.status( 403 ).send( 'No domain passed on.' );
    return;
  }

  res.send( 'Domain is being analysed.' );

  const chrome = await chromeLauncher.launch( { 
    chromeFlags: ['--headless']
  } );

  const options = {
    logLevel: 'info', 
    output: 'html', 
    onlyCategories: ['performance'], 
    port: chrome.port
  };

  const config = {
    extends: 'lighthouse:default',
    settings: {
      onlyAudits: [
        'first-contentful-paint',
        'largest-contentful-paint',
        'max-potential-fid',
        'cumulative-layout-shift',
      ],
    },
  };

  const runnerResult = await lighthouse( target, options, config );

  let data = {
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
    score: runnerResult.lhr.categories.performance.score,
    demo_name: demoName,
  }

  axios.post( responseTarget, data ).then( ( res ) => {
    console.log( res )
  } ).catch( ( error ) => {
    console.error( error )
  } );

  await chrome.kill();
} );

// listen for requests :)
let port = process.env.PORT;
var listener = app.listen( 64291, function() {
  console.log( 'Your app is listening on port ' + listener.address().port );
} );

listener.on( 'connection', function( socket ) {
    socket.setTimeout( 600 * 60 * 1000 );
});