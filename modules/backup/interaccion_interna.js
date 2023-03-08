'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');

const likes = async function(page, userAccount) {

    console.log('Iniciando interaccion de LIKES');

    // Open URL
    await page.goto(`${config.url}/${userAccount}/`, {
        waitUntil: "networkidle2",
        timeout: 120000,
    });

    console.log('Mira la cuenta: ' + userAccount);

    await helpers.delay(2000);

    // Esperamos que carguen los POST
    await page.waitForSelector('[role="main"]', {
        timeout: 12000
    });

    await helpers.delay(2000);



    for (let i = 0; i < config.maxLikesPerAccount; i++) {

        await helpers.delay(1000);

        await page.evaluate((i) => {
            try {
                document.querySelector('[role="main"]').querySelector('article').querySelectorAll('[class="v1Nh3 kIKUG _bz0w"]')[i].querySelector('a').click();
            } catch (e) { console.log(e); }
        }, i);

        await helpers.delay(1000);

        console.log('Esperamos que aparezca POPUP');

        // Esperamos el POPUP
        await page.waitForSelector('[role="dialog"]', {
            timeout: 12000
        });

        await helpers.delay(500);

        // Click en ME GUSTA
        await page.evaluate(() => {
            try {
                document.querySelector('[role="dialog"]').querySelector('[d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"]').parentNode.parentNode.click();
            } catch (e) { console.log(e); }
        });

        console.log('Click en Me gusta');

        await helpers.delay(1500);

        // Cerrar POPUP
        await page.evaluate(() => {
            try {
                document.querySelectorAll('[class="QBdPU "]')[2].click();
            } catch (e) { console.log(e); }
        });


    }

    await helpers.delay(1500);
    console.log('Fin de LIkes de la cuenta: ' + userAccount);
}


module.exports = {
    likes,
}