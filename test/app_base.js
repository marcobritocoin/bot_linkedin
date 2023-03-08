const puppeteer = require("puppeteer");
const config = require('./modules/config');
const login = require('./modules/login');
const logout = require('./modules/logout');
const interaccion = require('./modules/interaccion_interna');
const h = require('./modules/helpers');
const CronJob = require('cron').CronJob;
const fs = require('fs');

const proxies = ['185.253.154.181:3128', '46.183.115.148:3128', '80.240.126.125:3128']

const browser = async function() {
    const proxy = proxies[h.getRandomInt(0, 3)];
    const bro = await puppeteer.launch({
        executablePath: config.pathBrowser,
        headless: config.headless,
        handleSIGINT: false,
        ignoreHTTPSErrors: true,
        args: [
            '--log-level=3',
            '--start-maximized',
            '--no-default-browser-check',
            '--disable-infobars',
            '--disable-web-security',
            '--disable-site-isolation-trials',
            '--no-experiments',
            '--ignore-gpu-blacklist',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-default-apps',
            '--enable-features=NetworkService',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--proxy-server=' + proxy
        ],
        ignoreDefaultArgs: ['--enable-automation', '--mute-audio', '--hide-scrollbars'],
    });
    return bro;
}

const paginaitor = async function(browser) {
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36"
    );
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1750, height: 850 });
    await page.setRequestInterception(true);
    page.on("request", (request) => {
        request.continue();
    });
    return page;
}

async function main() {

    let cuentas_base = h.readJsonSync(config.cuentas_base);
    cuentas_base = cuentas_base.sort(function() { return Math.random() - 0.5 });

    for (let i in cuentas_base) {

        const navigate = await browser();
        const page = await paginaitor(navigate);

        try {
            // RANDOM DELAY
            random = h.getRandomInt(1000, 2000);
            console.log('Esperar: ' + random + ' ms');
            await h.delay(random);

            // Seteando las cookies
            //h.useCookies2(page, config.cookiesPath + '/cookies_' + cuentas_base[i].cuenta + '.json'); // Insertar cookies de sesion

            // Iniciando Sesion
            const sesion = await login.init(page, cuentas_base[i].cuenta, cuentas_base[i].pass); // Verificamos cookies e Iniciamos sesion

            console.log(sesion);

            if (sesion) {
                console.log('Comienza la Interaccion con la cuenta');

                let cuentas_objetivo = h.readJsonSync(config.cuentas_objetivo); // Leemos las cuentas objetivos a darles interaccion
                cuentas_objetivo = h.removeItemValueFromArr(cuentas_objetivo, cuentas_base[i]); // Removemos el item actual por si acaso
                cuentas_objetivo = cuentas_objetivo.sort(function() { return Math.random() - 0.5 }); // ordenamos aleatoriamente el array

                for (let item of cuentas_objetivo) {
                    await interaccion.likes(page, item.cuenta);
                }

                await h.delay(1000);
                await logout.now(page);
            }

            console.log('Fin del proceso para la cuenta: ' + cuentas_base[i].cuenta);

        } catch (err) {
            console.error(err);
        } finally {
            if (navigate) await navigate.close();
            console.log('Closing browser');
        }

    } // FOr de las cuentas

}


async function startTracking() {

    main();

    // 10:30 - 16:30
    let interaccionInterna = new CronJob('00 00 11,17,21 * * *', function() {
        main();
    });

    interaccionInterna.start();



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

startTracking();