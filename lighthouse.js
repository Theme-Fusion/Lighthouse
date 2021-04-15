const fs             = require('fs');
const lighthouse     = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

let demos = [
  'classic',
  'retail',
  'country-butcher',
  'business-coach',
  'avada-builder',
  'psychology',
  'accountant',
  'handmade',
  'winery',
  'nutritionist',
  'festival',
  'virtual-assistant',
  'financial-advisor',
  'plumber',
  'marketing-consultant',
  'pet-supplies',
  'online-tutor',
  'videographer',
  'cleaning-services',
  'takeout',
  'interior-design',
  'fitness',
  'author',
  'restaurant',
  'taxi',
  'landscaper',
  'esports',
  'bakery',
  'yoga',
  'splash',
  'influencer',
  'podcasts',
  'food',
  'nightclub',
  'galerie',
  'driving',
  'barber-shop',
  'cryptocurrency',
  'seo',
  'spa',
  'sports',
  'movers',
  'salon',
  'beer',
  'electrician',
  'promote',
  'adventure',
  'launch',
  'university',
  'finance',
  'information-technology',
  'freelancer',
  'dentist',
  'science',
  'photography-light',
  'music',
  'creative',
  'construction',
  'charity',
  'daycare',
  'veterinarian',
  'technology',
  'health',
  'wedding',
  'resume',
  'photography',
  'gym',
  'modern-shop',
  'classic-shop',
  'landing-product',
  'forum',
  'church',
  'cafe',
  'travel',
  'hotel',
  'architecture',
  'hosting',
  'law',
  'fashion',
  'lifestyle',
  'app',
];
(async () => {
  const chrome       = await chromeLauncher.launch( { chromeFlags: ['--headless'] }) ;
  const options      = {
    logLevel: 'silent', 
    output: 'json', 
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
  let data           = {};

  for ( demo of demos) {
    const runnerResult = await lighthouse( 'https://avada.theme-fusion.com/' + demo + '/', options, config );

    data[ demo ] = {
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
  };

  let jsonOutput = JSON.stringify( data );
  fs.writeFileSync('demos.json', jsonOutput);
  
  await chrome.kill();
})();