'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');

const login = async function(page, user, pass) {

    await helpers.delay(1000);

    // Open URL
    await page.goto(`${config.url}`, {
        waitUntil: "networkidle2",
        timeout: 120000,
    });

    await helpers.delay(2000);

    // Click en Permitir Cookies
    await page.evaluate(() => {
        try {
            document.querySelector('[class="aOOlW   HoLwm "]').click();
        } catch (e) {
            console.log(e);
        }
    });


    await helpers.delay(2000);

    //Verificar Authentication inicial
    const loginPanel = await page.evaluateHandle((selector) => {
        try {
            if (document.querySelector(selector)) {
                console.log(document.querySelector(selector));
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        };
    }, selectors.selInputMail);

    // console.log('WAIT...');
    // await helpers.delay(2000000);

    // Verificamos si el login existe
    if (loginPanel._remoteObject.value) {

        console.log('Hay que iniciar sesion primero');

        try {
            await page.waitForSelector(selectors.selInputMail, {
                timeout: 120000
            });

            await page.type(selectors.selInputMail, user);
            await page.type(selectors.selInputPass, pass);
            await helpers.delay(1000);


            //await page.click(selectors.btnSubmitLogin);
            // Click SUBMIT
            await page.evaluate((e) => {
                document.querySelector(e).click();
            }, selectors.btnSubmitLogin);


            await helpers.delay(1000);

            // Verificar si hay error en el Login o si IG esta pichacoso
            const test = await page.evaluate(() => {
                try {
                    return document.querySelector('[data-testid="login-error-message"]').innerText;
                } catch (e) {
                    console.log(e);
                    return '';
                }
            });

            await helpers.delay(500);

            if (test.length == 0) {

                //Verify Authentication SUCCESS
                console.log('Verificar si tuvo exito el Login');

                await helpers.delay(1000);

                await page.waitForSelector(selectors.selIconHome, {
                    timeout: 12000
                });

                await helpers.delay(2000);

                // Click en AHORA NO
                await clickAhoraNO(page);
                await helpers.delay(2000);
                await clickAhoraNO(page);

                // console.log('Enhorabuena chaval!! procedemos a guardar las cookies');
                // // Guardando las cookies
                // helpers.saveCookies2(page, config.cookiesPath + '/cookies_' + user + '.json');

                // WAIT FINAL
                console.log('Esperando unos segundos para finalizar');
                await helpers.delay(4000);
                return true;
            }



        } catch (error) {
            console.log(error);
        }
    } else {
        console.log('Sesión iniciada');
        return true;
    }

    await helpers.delay(1000);
    console.log('Finalizó LOGIN');
    return false;
}

const clickAhoraNO = async function(page) {
    // Click en AHORA NO
    await page.evaluate(() => {
        try {
            document.querySelector('[class="aOOlW   HoLwm "]').click();
        } catch (e) {
            console.log(e);
        }
        try {
            document.querySelector('[class="sqdOP yWX7d    y3zKF     "]').click();
        } catch (e) {
            console.log(e);
        }
    });
    console.log('Click en Ahora NO');

    await helpers.delay(3000);
}

module.exports = {
    init: login,
}