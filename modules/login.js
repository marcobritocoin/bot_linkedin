'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');
const { ocrSpace } = require('ocr-space-api-wrapper');


const login = async function(page) {

    try {
        // Open URL
        await page.goto(`${config.url_login}`, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        await helpers.delay(2000);

        await page.waitForSelector(selectors.menuSuperior, {
            timeout: 60000
        });

        // Verificamos si la sesión ya fue iniciada
        // if (await verificarsesion(page)) {
        //     console.log('sesion iniciada anteriormente');
        //     return true;
        // }

        // Hacer Scroll
        await page.evaluate(() => {
            window.scroll({
                top: 500
            });
        });

        console.log('Comienza el inicio de sesión');

        await page.waitForSelector(selectors.selInputCedula, {
            timeout: 6000
        });

        // Seteamos los datos del login
        await page.select(selectors.selInputNacionalidad, config.nacionalidad);
        await page.type(selectors.selInputCedula, config.cedula);
        await page.type(selectors.selInputPass, config.password);


        // Obtenemos capture para extraer el captcha
        await page.screenshot({ path: 'capture_web.png' });
        await helpers.delay(1000);


        try {
            const res1 = await ocrSpace('capture_web.png');
            console.log(res1);
            // const captcha_result = res1.ParsedResults[0].ParsedText.split('\n')[2].replaceAll(' ', '');
            const captcha_result = res1.ParsedResults[0].ParsedText.split('\n')[2].replace(/ /g, '');
            console.log('Captcha: ' + captcha_result);
            await page.type(selectors.selInputCaptcha, captcha_result);
            await helpers.delay(2000);

            // Hacer Click SUBMIT
            try {
                await page.click(selectors.btnSubmitLogin);
            } catch (e) {}


            await page.waitForSelector(selectors.menuSuperior, {
                timeout: 60000
            });

            await helpers.delay(1000);

            return await verificarsesion(page);

        } catch (err) {
            console.log('Error obteniendo OCR de captcha: ' + err);
            return false;
        }

    } catch (e) {
        console.log('Ocurrió un error inesperado: ' + e);
        return false;
    }
}

const verificarsesion = async function(page) {
    const texto = await page.evaluate((e) => document.querySelector(e).innerText, selectors.menuSuperior);

    if (texto.indexOf('Histórico') != -1) {
        // Guardamos las cookies
        try {
            helpers.saveCookies2(page, config.cookiesPath + '/cookies_saime.json');
            console.log('Cookies guardadas');
        } catch (e) {}

        return true;
    } else {
        return false;
    }
}



module.exports = {
    init: login,
}