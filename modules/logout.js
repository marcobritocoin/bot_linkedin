'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');

const now = async function(page, user, pass) {

    await helpers.delay(1000);

    await page.evaluate(()=>{
        try{
            document.querySelector('[class="_2dbep qNELH"]').click();
        }catch(e){ console.log(e); }
    });

    await helpers.delay(2000);

    await page.evaluate(()=>{
        try{
            document.querySelectorAll('[class="-qQT3"]')[4].click();
        }catch(e){ console.log(e); }
    });

    await helpers.delay(2000);
    console.log('Se ha cerrado la sesión');

 
}



module.exports = {
    now,
}