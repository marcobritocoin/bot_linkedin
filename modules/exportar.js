'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');

const reportes = async function(page, user, pass) {

    await helpers.delay(1000);

    await page.evaluate((selector) => {
        try {
            document.querySelector(selector).click();
        } catch (e) { console.log(e); }
    }, selectors.menuDashboard);

    await helpers.delay(2000);

    await page.evaluate((selector) => {
        try {
            document.querySelector(selector).click();
        } catch (e) { console.log(e); }
    }, selectors.btnExportar);

    await helpers.delay(3000);

    await page.evaluate(() => {
        try {
            document.querySelector('[data-test-radio-input="xls"]').click();
        } catch (e) { console.log(e); }
    });

    await helpers.delay(2000);
    console.log('Fin de la exportación');

    await helpers.delay(10000);
}

module.exports = {
    reportes,
}