// Copyright 2018 Google LLC.
// SPDX-License-Identifier: Apache-2.0

// server.js
// where your node app starts

// init project
const express        = require( 'express' );
var app              = express();
const fs             = require( 'fs' );
const lighthouse     = require( 'lighthouse' );
const puppeteer      = require('puppeteer')
const axios          = require( 'axios' );

app.get( '/', async ( req, res ) => {
  let target         = req.headers.referer;
  let responseTarget = req.query.response;
  let demoName       = req.query.demo;

  if ( ! target || '' === target || ! responseTarget || '' === responseTarget ) {
    res.status( 403 ).send( 'No domain passed on.' );
    return;
  }

  const chromeFlags = ['--headless', '--disable-dev-shm-usag', '--disable-gpu', '--disable-extensions', '--disable-popup-blocking', '--no-sandbox', '--single-process' ];

  res.send( 'Domain is being analysed.' );

  const chrome = await puppeteer.launch( {
    defaultViewport: {
        width: 1920,
        height: 1080,
        isLandscape: true
    },
    args: chromeFlags
  } ).catch( error => { console.error( 'Chrome failed...', error ); } );

  const options = {
    logLevel: 'info', 
    disableStorageReset: true,
    maxWaitForLoad: 60000,
    chromeFlags: chromeFlags,
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'max-potential-fid',
      'cumulative-layout-shift',
    ],
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

  const runnerResult = await lighthouse( target, options, config ).catch( error => { console.error( 'Lighthouse failed...', error ); } );

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

  await chrome.kill();

  axios.post( responseTarget, data ).then( ( res ) => {
    return;
  } ).catch( ( error ) => {
    console.error( error )
  } );

  return;
} );

// listen for requests :)
let port = process.env.PORT;
// let port = 64291;
var listener = app.listen( port, function() {
  console.log( 'Your app is listening on port ' + listener.address().port );
} );
