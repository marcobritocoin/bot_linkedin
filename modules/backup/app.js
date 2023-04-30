const puppeteer = require("puppeteer");
const config = require('./modules/config');
const helpers = require('./modules/helpers');
const CronJob = require('cron').CronJob;
const fs = require('fs');

const browser = async function() {
    const bro = await puppeteer.launch({
        headless: config.headless,
        handleSIGINT: false,
        ignoreHTTPSErrors: true,
        args: [
            '--log-level=3',
            '--start-maximized', // '--start-fullscreen'
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
            '--no-sandbox'
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
    await page.setViewport({ width: 1566, height: 950 });
    await page.setRequestInterception(true);
    page.on("request", (request) => {
        request.continue();
    });
    return page;
}

async function main() {

    const navigate = await browser();
    const page = await paginaitor(navigate);
    const url = 'https://bo1ocrdes.u2-ibermatica.com/'; // prod ,test
    const selInputuser='[name="username"]';
    const selCmbPet = '[id="exampleFormControlSelect1"]';
    const selPagNext = '[aria-label="Next"]';
    const selPeticiones = '[href="/requests"]';
    let paginador=null;

    try {
        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 600000
        });
        await helpers.delay(1000);
        await page.waitForSelector(selInputuser, {
            timeout: 600000
        });
        await helpers.delay(100);
        await page.type(selInputuser, 'loginbo');
        await page.type('[name="password"]', 'passbo');
        await helpers.delay(200);
        await page.click('[type="submit"]');
        await helpers.delay(1000);
        await page.waitForSelector(selPeticiones, {
            timeout: 600000
        });
        await page.click(selPeticiones);
        await helpers.delay(700);
        await page.waitForSelector(selCmbPet, {
            timeout: 600000
        });
        await helpers.delay(1000);
        await page.select(selCmbPet, '11'); // Filtro por "Pendiente de procesador manual"
        console.log('Filtro por "Pendiente de procesador manual"');
        await helpers.delay(2500);
         // Ordenamos Desc la tabla
         await page.click('[scope="col"]');
         await helpers.delay(1500);

         // Recorriendo todas las páginas y todas las tablas
        do{
            await helpers.delay(1000);
            const pagina = await page.evaluate((e) => document.querySelector(e).parentElement.innerText, '[class="sr-only ng-star-inserted"]');
            //console.log("Página: ",pagina.replace(/x/g, '\n(current)'));
            console.log("Página: ",pagina.split('\n')[0]);
            let pagesData = await revisarPage(page);
            let cantRows = Number(pagesData.length-1);
            if(cantRows > 0){
                for(let i=1; i <= cantRows; i++){
                    // CLick en la FILA
                    console.log("Fila: ", i);
                    await helpers.delay(1000);
                    await pagesData[i].click();
                    await page.waitForSelector('[role="tablist"]', {
                        timeout: 600000
                    });
                    // Click en la TAB de Model
                    await helpers.delay(1000);
                    await page.click('[role="tab"]');
                    await helpers.delay(2500);
                    let dataJson = await page.evaluate((e) => document.querySelector(e).value, '[class="jsoneditor-text"]');
                    dataJson = JSON.parse(dataJson);
                    const dataExtract = dataJson?.data;
                    const errorData = dataJson?.errors[0].title;
                    console.log("Datos correctos: ",dataExtract.length);
                    console.log("Error: ",errorData);
                    if((errorData.indexOf('WORKFLOW') > -1) || (errorData.indexOf('no disponible') > -1) && (errorData.length == 0)){
                        console.log("Consegui un documento que no sirve");
                        await helpers.delay(1000);
                        await page.click('[class="btn btn-primary mx-2"]');
                        // class="btn btn-success mx-2"
                        console.log("Click en Bton Validar");
                    }else{
                        await helpers.delay(2000);
                        await page.click('[class="close"]');
                    }
                }
            }
            // Click en la siguiente pagina si hay
            paginador = await page.evaluate((e) => document.querySelector(e).getAttribute('aria-disabled'), selPagNext);
            console.log(paginador);
            if(paginador==null){
                await page.evaluate(() => document.querySelector('[aria-label="Next"]').click());
                await helpers.delay(3000);
                // await page.evaluate(() => {
                //     window.scroll({
                //         top: 0,
                //         left: 0
                //     });
                // });
            }
            console.log("---------------------------------");
        }while(paginador==null);

        console.log("Fin de la depuracion");
        await helpers.delay(600000);

    } catch (err) {
        console.error(err);
    } finally {
        if (navigate) await navigate.close();
        console.log('Cerramos el navegador finalmente');
    }


}

async function revisarPage(page){
    let rows2 = await page.$('table');
    rows2 = await rows2.$$('tr');
    return rows2;
}

async function startTracking() {

    main();

    let interaccionInterna = new CronJob('00 00 9,20 * * *', function() {
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