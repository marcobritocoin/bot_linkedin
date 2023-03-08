'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');
const { ocrSpace } = require('ocr-space-api-wrapper');


const login = async function(page) {

    try {
        // Open URL
        await page.goto(`${config.url_cita_pasaporte_consular}`, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        await helpers.delay(2000);

        await page.waitForSelector(selectors.menuSuperior, {
            timeout: 6000
        });

        await page.waitForSelector(selectors.selMensajeCentral, {
            timeout: 6000
        });

        await helpers.delay(500);

        let texto = await page.evaluate((e) => document.querySelector(e).innerText, selectors.selMensajeCentral);
        texto = texto.replace(/x/g, '');
        console.log(texto);
        helpers.enviarMensajeTelegram('REVISIÓN CITA DISPONIBLE: \n\n' + texto);
        await helpers.delay(2000);
        console.log('Fin revisión de cita disponible');

    } catch (e) {
        console.log('Ocurrió un error inesperado: ' + e);
        return false;
    }
}

module.exports = {
    init: login,
}