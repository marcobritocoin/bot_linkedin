const puppeteer = require("puppeteer");
const config = require('../config');
const login = require('../login');
const logout = require('../logout');
const content_scraping = require('../content_xploit');
const unfollow = require('../modules/unfollow');
const interaccion = require('../interaccion_interna');
const CronJob = require('cron').CronJob;
const h = require('../helpers');
const fs = require('fs');


async function main() {
    let browser;

    try {
        browser = await puppeteer.launch({
            // executablePath: config.pathBrowser,
            // headless: config.headless,
            headless: false,
            // headless: true,
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
                // '--proxy-server=185.253.154.181:3128'
            ],
            ignoreDefaultArgs: ['--enable-automation', '--mute-audio', '--hide-scrollbars'],
        });
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

        cuentas = h.readJsonSync('cuentas.json');

        for (let i in cuentas) {

            // RANDOM DELAY

            // Seteando las cookies
            h.useCookies2(page, config.cookiesPath + '/cookies_' + cuentas[i].cuenta + '.json'); // Insertar cookies de sesion
            await login.init(page, cuentas[i].cuenta, cuentas[i].pass); // Verificamos cookies e Iniciamos sesion
            newArr = h.removeItemValueFromArr(cuentas, cuentas[i]); // Removemos el item actual
            newArr = newArr.sort(function() { return Math.random() - 0.5 }); // ordenamos aleatoriamente el array

            for (let item of newArr) {
                await interaccion.likes(page, item.cuenta);
            }

            await h.delay(1000);

            await logout.now(page);

        }

        // await login.init(page);
        //await content_scraping.content(page, 'acceseo');
        //await content_scraping.content(page, 'marcobrito.js');
        // await unfollow.unFollowAction(page, 'marcobrito.js');
        // await h.delay(50000);

    } catch (err) {
        console.error(err);
    } finally {
        if (browser) await browser.close();
        console.log('Closing browser');
    }
}


async function startTracking() {

    main();

    // 10:30 - 16:30
    let interaccionInterna = new CronJob('00 00 11,17 * * *', function() {
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