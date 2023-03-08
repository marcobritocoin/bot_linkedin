const puppeteer = require("puppeteer");
const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");
const config = require("./config/config");
const request = require("request-promise-native");
require('dotenv').config();

console.log(process.env.NODE_ENV, 'Comenzo el evento', config.headless);

async function configureBrowser() {
    // Espera inicial para arrancar de 5 a 10min
    if (process.env.NODE_ENV != 'dev') {
        //console.log('Comenzo el evento');
        //await delay(getRandomInt(60000, 400000));
    }

    const browser = await puppeteer.launch({
        //headless: config.headless,
        headless: true,
        handleSIGINT: false,
        ignoreHTTPSErrors: true,
        browserContext: "default",
        args: [
            "--log-level=3",
            "--start-maximized",
            "--no-default-browser-check",
            "--disable-infobars",
            "--disable-web-security",
            "--disable-site-isolation-trials",
            "--no-experiments",
            "--ignore-gpu-blacklist",
            "--ignore-certificate-errors",
            "--ignore-certificate-errors-spki-list",
            "--disable-gpu",
            "--disable-extensions",
            "--disable-default-apps",
            "--enable-features=NetworkService",
            "--disable-setuid-sandbox",
            "--no-sandbox",
            '--no-zygote',
            '--deterministic-fetch',
            '--disable-features=IsolateOrigins',
        ],
        ignoreDefaultArgs: [
            "--enable-automation",
            "--mute-audio",
            "--hide-scrollbars",
            "--disable-dev-shm-usage"
        ],
    });
    return browser;
}

async function navegacion() {
    const browser = await configureBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36"
    );
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1900, height: 940 });
    await page.setRequestInterception(true);

    page.on("request", (request) => {
        request.continue();
    });
    return { page, browser };
}

async function loginIG() {
    const { page, browser } = await navegacion();

    try {
        await page.goto(config.url_ig, {
            waitUntil: "networkidle2",
            timeout: 120000,
        });

        try {
            // Popup 1
            await delay(2000);
            const popup = await page.evaluateHandle((e) => {
                if (document.querySelector('[role="presentation"]')) {
                    document.querySelector('[role="presentation"]').children[0].children[0].children[1].click();
                }
            });
            //console.log(popup._remoteObject.value);
            await delay(4000);
            console.log('salto el popup');
        } catch (e) {
            console.log(e);
        }


        await page.waitForSelector(config.selInputMail, {
            timeout: 120000
        });

        console.log('consegui el email');
        await page.type(config.selInputMail, config.usuario);
        await page.type(config.selInputPass, config.password);
        //await delay(getRandomInt(1000, 1500));
        await delay(1000);

        try {
            await page.click(config.btnSubmitLogin);
            // Click SUBMIT

            await delay(1500);

            console.log('tiro 1');

            await page.evaluate((e) => {
                document.querySelector('[type="submit"]').click();
            });
            console.log('tiro 2');
        } catch (error) {
            console.log(error);
        }


        await delay(2000);

        await page.waitForSelector(config.selIconHome, {
            timeout: 12000
        });

        console.log('Vamos bien');

        await delay(2000);

        try {
            // Popup 2
            await page.evaluate((e) => {
                document.querySelector('[role="main"]').querySelectorAll('button')[1].click();
            });
        } catch (error) {}

        console.log('Salto el Popup 2');

        await delay(3000);

        // await page.waitForSelector('[role="dialog"]', {
        //     timeout: 20000
        // });

        console.log('Pendiente');

        try {
            // Popup 3
            await page.evaluate((e) => {
                document.querySelector('[role="dialog"]').querySelectorAll('button')[1].click();
            });
        } catch (error) {}

        console.log('Login exitoso');

        await delay(1000);

        return { page, browser };

    } catch (error) {
        console.log('Error abriendo el navegador:' + error);
        enviarMensaje('Error abriendo el navegador:' + error, '1238464436');

    }
}


async function unFollow() {
    const { page, browser } = await loginIG();
    //console.log('unFollow');

    try {
        console.log('Vamos al perfil de IG');

        await page.goto(config.url_ig + config.usuario + '/', {
            waitUntil: "networkidle2",
            timeout: 120000,
        });

        await page.waitForSelector(config.selPageProfile, {
            timeout: 120000
        });

        await delay(1000);

        // let element = await page.$('header');
        // let value = await page.evaluate(el => el.textContent, element);
        // console.log(value);

        console.log('Listo Vamos a buscar los seguidores');

        // const followersCountTotal = await page.evaluateHandle((e) => {
        //     if (document.querySelector('[href="/' + e + '/following/"]')) {
        //         return Number(document.querySelector('[href="/' + e + '/following/"]').innerText.split(' ')[0].replace('.', ''));
        //     } else {
        //         return Number(document.querySelector('header').querySelector('section').querySelector('ul').children[2].innerText.split(' ')[0].replace(',', ''));
        //     }
        // }, config.usuario);

        const followersCountTotal = await page.evaluateHandle((e) => {
            return Number(document.querySelector('header').querySelector('section').querySelector('ul').children[2].innerText.split(' ')[0].replace(',', ''));
        });

        console.log('Seguidos actualmente: ' + followersCountTotal._remoteObject.value);

        if (followersCountTotal._remoteObject.value > 0) {

            enviarMensaje('Seguidos actualmente: ' + followersCountTotal._remoteObject.value, '1238464436');

            try {
                // CLick en seguidores
                await page.evaluate((e) => {
                    document.querySelector('header').querySelectorAll('li')[2].querySelector('a').click();
                });
            } catch (error) {}

            await delay(1000);

            await page.waitForSelector('[role="dialog"]', {
                timeout: 120000
            });

            // let element = await page.$('[role="dialog"]');
            // let value = await page.evaluate(el => el.textContent, element);

            do {
                await delay(1000);
                followers = await page.evaluateHandle((e) => {
                    el = document.querySelector('[class="PZuss"]');
                    if (el) {
                        return el.innerText;
                    }
                });
                //console.log(followers._remoteObject.value);
            } while (typeof followers._remoteObject.value === 'undefined');


            await delay(1000);
            const followersCount = await page.evaluateHandle((e) => {
                return document.querySelector('[role="dialog"]').querySelector('ul').children[0].childElementCount;
            });

            config.countFollowers = followersCount._remoteObject.value * 3;
            let tempCount = 0;

            // console.log(followersCount._remoteObject.value);
            // console.log(config.countFollowers);

            for (let i = 0; i < config.countFollowers; i++) {

                if (tempCount === followersCount._remoteObject.value) {
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
                    document.querySelectorAll('[role="dialog"]')[1].querySelector('button').click();
                    //document.querySelectorAll('[role="dialog"]')[1].querySelectorAll('button')[1].click();
                });

                console.log('Llevamos: ' + tempCount);
                await delay(getRandomInt(5000, 15000)); // Intervalo de espera por cada Unfollow 6 - 12 segundos
            }

            console.log('Se dejaron de seguir 36 personas mas');


        } else {
            console.log('No tiene seguidores a quien dejar de seguir');
            enviarMensaje('No tiene seguidores a quien dejar de seguir', '1238464436');

        }

    } catch (error) {
        console.log('Error haciendo UnFollow:' + error);
        enviarMensaje('Error haciendo UnFollow: ' + error, '1238464436');
    }

    cerrarNavegador(browser);
}


async function botInstagram() {
    //enviarMensaje('Arrancando los motores del bot de Fichaje', '1238464436');
    enviarMensaje('iniciando Bot de Instagram Unfollow', '1238464436');

    while (true) {
        await unFollow();
        //await delay(7400000); // 2 horas de espera
        await delay(getRandomInt(7200000, 7500000));
    }




    // // 24hrs
    // let unFollow = new CronJob("00 50 8 * * 1,2,3,4,5", function() {
    //     unFollow();
    // });

    // unFollow.start();



    //# ┌────────────── second (optional)
    //# │ ┌──────────── minute            (0 - 59)
    //# │ │ ┌────────── hour              (0 - 23)
    //# │ │ │ ┌──────── day of month      (1 - 31)
    //# │ │ │ │ ┌────── month             (1 - 12)
    //# │ │ │ │ │ ┌──── day of week       (0 domingo - 6)
    //# │ │ │ │ │ │
    //# │ │ │ │ │ │
    //# * * * * * *
}

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}


function cerrarNavegador(browser) {
    // browser
    //     .close()
    //     .then(() => process.exit(0))
    //     .catch(() => process.exit(0));

    browser
        .close()
        .then(() => console.log('Navegador Cerrado'))
        .catch(() => console.log('Navegador No Cerrado'));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function enviarMensaje(mensaje, chatid) {
    request.post(
        'https://api.telegram.org/bot1419831922:AAEw6Gg7-gKM09ZbWHmpSkPTUa3Ma-4tfeE/sendMessage', { json: { chat_id: `${chatid}`, text: mensaje } },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log('Mensaje enviado');
            }
        }
    );
}

async function getTask() {
    return new Promise((resolve, reject) => {
        request.get(
            config.urlApiRest + '/tarea',
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                }
            }
        );
    });
}

function insertTask(mTask) {
    request.post(
        config.urlApiRest + '/tarea', { json: { tarea: mTask } },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }
    );
}

botInstagram();