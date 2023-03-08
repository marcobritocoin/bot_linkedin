'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');


const login = async function(page) {

    // Open URL
    await page.goto(`${config.url}`, {
        waitUntil: "networkidle2",
        timeout: 60000,
    });

    await helpers.delay(2000);

    const test = await page.waitForSelector(selectors.selInputCedula, {
        timeout: 60000
    });

    console.log(test);

    await page.type(selectors.selInputMail, config.username);
    await page.type(selectors.selInputPass, config.password);
    await helpers.delay(1000);

    // Click SUBMIT
    //await page.click(selectors.btnSubmitLogin);
    // await page.evaluate((e) => {
    //     document.querySelector(e).click();
    // }, selectors.btnSubmitLogin);

    await helpers.delay(200000);

    /**
     * 
     *  Break
     */

    try {
        await page.waitForSelector(selectors.selInputMail2, {
            timeout: 30000
        });

        await page.type(selectors.selInputMail2, config.username);
        await page.type(selectors.selInputPass2, config.password);
        await helpers.delay(1000);

        console.log('Esperando resolver el CAPTCHA');
        const response = await helpers.pollForRequestResults(config.apiKey_2catpcha, requestId);
        await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${response}";`);

        console.log('TOKEN-2captcha: ' + response);
        await helpers.delay(1000);

        if (response != '') {
            await page.evaluate((response) => {
                ___grecaptcha_cfg.clients[0].P.P.callback(response);
                console.log('TOKEN-2captcha: ' + response);
            }, response);
            console.log('Pilas con el captcha');
            await helpers.delay(1000);
            await page.keyboard.press('Enter');
        } else {
            if (navigate) await navigate.close();
            console.log('Closing browser');
        }
    } catch (e) {
        console.log('Captcha saltado o error inesperado' + e);
    }

    try {
        await page.waitForSelector(selectors.menuDashboard, {
            timeout: 60000
        });

        try {
            helpers.saveCookies2(page, config.cookiesPath + '/cookies_freshdesk.json');
            console.log('Cookies guardadas');
        } catch (err) {
            console.error(err);
        }

    } catch (e) {
        console.log('Error inesperado' + e);
    }

    console.log('Finalizó LOGIN');
    return false;
}

module.exports = {
    init: login,
}