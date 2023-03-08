'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');

const unFollowAction = async function(page, userAccount) {
    try {
        // Url de la cuenta
        await page.goto(`${config.url}/${userAccount}/`, {
            waitUntil: "networkidle2",
            timeout: 120000,
        });

        await page.waitForSelector(selectors.selCountPageAccount, {
            timeout: 12000
        });

        const follows = await page.evaluate((e) => {
            return Number(document.querySelector('header').querySelector('section').querySelector('ul').children[2].innerText.split(' ')[0].replace(',', ''));
        });

        console.log('Cantidad siguiendo ahora: ' + follows);
        //console.log('Seguidos actualmente: ' + follows._remoteObject.value);

        // Obtener un numero aleatorio para dejar de seguir
        const UNFOLLOWNOW = helpers.getRandomInt((config.maxFollowsPerHour - 10), config.maxFollowsPerHour);

        // Tiempo de espera Aleatorio
        //await helpers.delay(helpers.getRandomInt(config.waitTimemin, config.waitTimemax)); 


        // verificamos que existen seguidos que dejar de seguir
        if (follows > 0) {

            // CLick en seguidores
            await page.evaluate((e) => {
                document.querySelector('header').querySelectorAll('li')[2].querySelector('a').click();
            });


            await helpers.delay(600);

            await page.waitForSelector('[role="dialog"]', {
                timeout: 120000
            });


            // Esperamos que carguen las cuentas seguidas
            await loadContentElement(page, '[class="PZuss"]');

            await helpers.delay(600);


            // Obtener la cantidad de seguidos en la lista
            let countFollows = countFollows(page);
            let tempCount = 0;

            for (let i = 0; i < UNFOLLOWNOW; i++) {

                if (tempCount === countFollows) {
                    //console.log(config.scrollJump);
                    // Scroll
                    await page.evaluate((e) => {
                        document.querySelector('[role="dialog"]').children[0].children[2].scrollTop = e;
                    }, config.scrollJump);
                    config.scrollJump *= 1.5;
                    //console.log(config.scrollJump);
                    followersCount._remoteObject.value += 12;
                    // esperar que carguen los nuevos
                    do {
                        await delay(500);
                        loading = await page.evaluateHandle((e) => {
                            return document.querySelectorAll('[data-visualcompletion="loading-state"]').length
                        });
                        //console.log('Esperamos que carguen los nuevos... ' + loading._remoteObject.value);
                    } while (loading._remoteObject.value === 2);
                }

                tempCount++;

                await delay(getRandomInt(1000, 3500));

                // Click dejar de seguir
                await page.evaluate((e) => {
                    document.querySelector('[role="dialog"]').querySelector('ul').children[0].children[e].querySelector('button').click();
                }, i);

                await delay(getRandomInt(1000, 3500));

                // Click dejar de seguir definitivo
                await page.evaluate((e) => {
                    //document.querySelectorAll('[role="dialog"]')[1].querySelector('button').click();     // SI
                    document.querySelectorAll('[role="dialog"]')[1].querySelectorAll('button')[1].click(); // CANCELAR
                });

                console.log('Llevamos: ' + tempCount);
                await delay(getRandomInt(5000, 15000)); // Intervalo de espera por cada Unfollow 6 - 12 segundos
            }



            console.log('FIN');

        } else {
            console.log('No tiene seguidores a quien dejar de seguir');
            //enviarMensaje('No tiene seguidores a quien dejar de seguir', '1238464436');
        }

    } catch (error) {
        console.log('Ocurio un error en UNFOLLOW ' + error);
    }

}

async function countFollows(page) {
    return await page.evaluate((e) => {
        return Number(document.querySelector('[role="dialog"]').querySelector('ul').children[0].childElementCount);
    });
}


async function loadContentElement(page, selector) {
    try {
        let elemento;
        do {
            await helpers.delay(1000);
            elemento = await page.evaluateHandle((e) => {
                el = document.querySelector(e);
                if (el) {
                    return el.innerText;
                }
            }, selector);
        } while (typeof elemento._remoteObject.value === 'undefined');
    } catch (e) {
        console.log('Error en la espera de carga del elemento: ' + e);
    }
}

module.exports = {
    unFollowAction
}