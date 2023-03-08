'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');
const { ocrSpace } = require('ocr-space-api-wrapper');


const login = async function(page) {

    try {
        // Open URL
        await page.goto(`${config.url_historico}`, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        await helpers.delay(2000);

        await page.waitForSelector(selectors.menuSuperior, {
            timeout: 6000
        });

        await page.waitForSelector(selectors.tablaPersonalTramite, {
            timeout: 6000
        });

        // Hacer click en primer elemento de la tabla tramites
        await page.evaluate(() => {
            document.querySelector('table').querySelectorAll('tr')[1].children[4].children[0].click();
        });

        await helpers.delay(2000);

        const texto = await page.evaluate((e) => document.querySelector(e).innerText, selectors.tablaEstadoTramite);

        console.log(texto);
        helpers.enviarMensajeTelegram('REVISIÓN ESTADO DE TRAMITES: \n\n' + texto);
        await helpers.delay(2000);
        console.log('Fin revisión de estado del tramite');

    } catch (e) {
        console.log('Ocurrió un error inesperado: ' + e);
        return false;
    }
}

module.exports = {
    init: login,
}