'use strict'
// const fs = require('fs').promises;
const fs = require('fs');
const config = require('./config');
const request = require("request-promise-native");
const poll = require('promise-poller').default;
const nodemailer = require('nodemailer');
const { ConsoleMessage } = require('puppeteer');


const delay = function(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}

const getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// helpers.enviarMensajeTelegram('Hola mundo');
const enviarMensajeTelegram = function(mensaje) {
    request.post(
        'https://api.telegram.org/bot5272719209:AAEJJ8N2Yo-roFVnBQmZRn9JkzHK-3Kyt2E/sendMessage', { json: { chat_id: `${config.chatIdTelegram}`, text: mensaje } },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log('Mensaje enviado');
            }
        }
    );
}


// enviarMensajeSlack('Hola', 'C0328HDFDKR');
// helpers.enviarMensajeSlack('Hola mundo');
const enviarMensajeSlack = function(mensaje) {
    request.post({
        headers: { 'Authorization': 'Bearer xoxb-3091164152002-3084629804406-OpJirAlgMsMgTAyTDNUvj3ug', 'Content-Type': 'application/json', 'Accept': 'application/json' },
        url: 'https://slack.com/api/chat.postMessage',
        form: { channel: `${config.chatCanalSlack}`, text: mensaje }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log('Mensaje enviado');
            //console.log(body);
        }
    });
}

// enviarEMail('Novedades BOT', 'Esto es lo que hay', 'marcobritoduran@gmail.com');
const enviarEMail = async function(asunto, mensaje, correo) {
    // Hay que habilitar el envio de aplicaciones NO SEGURAS en GMAIL en el link de abajo
    // https://www.google.com/settings/security/lesssecureapps

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hal21digital@gmail.com',
            pass: 'Espana*2022'
        }
    });

    //let textToSend = 'Price dropped to ' + mensaje;
    //let htmlText = `<a href=\"${url}\">Link</a>`;
    let textToSend = mensaje;
    let htmlText = mensaje;

    let info = await transporter.sendMail({
        from: '"Bot Agencia WOW" <marketing@agenciawow.es>',
        to: correo,
        subject: asunto,
        text: textToSend,
        html: htmlText
    });
    console.log("Correo enviado: %s", info.messageId);
}

const writeCsv = async function(filename, content) {
    return new Promise((resolve, reject) => {
        fs.appendFile(filename, content, 'utf-8', (err) => {
            if (err) throw err;
            resolve(true);
        });
    });
}

const writeCsv2 = async function(filename, content) {
    fs.readFileSync(filename, content, "utf8");
}

const readJson = async function(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf-8', (err, data) => {
            console.log('entre');
            if (err) reject(err)
                // else resolve(JSON.parse(data))
            else resolve(data)
            console.log(data);
        });
    });
}

const readJsonSync = function(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8')
        return JSON.parse(data);
    } catch (err) {
        return err
    }
}


const writeJson = async function(filename, objJson, prettyJson = false) {
    return new Promise((resolve, reject) => {
        jsonFormat = (prettyJson == false) ? JSON.stringify(objJson) : JSON.stringify(objJson, null, 4); //JSON.stringify(objJson, null, 2);
        fs.writeFile(filename, jsonFormat, 'utf-8', (err) => {
            if (err) throw err;
            console.log(`Datos guardados en ${filename} `);
            resolve(true);
        });
    });
}

const saveCookies = async function(page, fileCookies) {
    try {
        const cookies = await page.cookies();
        await fs.writeFile(fileCookies, JSON.stringify(cookies, null, 2));
        console.log('Cookies guardadas');
    } catch (e) {
        console.log('Error guardando las cookies: ');
        console.log(e);
    }
}

const useCookies = async function(page, fileCookies) {
    try {
        const cookiesString = await fs.readFile(fileCookies);
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        console.log('Cookies utilizadas');
    } catch (e) {
        console.log('No existen cookies para usar');
        console.log(e);
    }
}

const saveCookies2 = async function(page, fileCookies) {
    try {
        const cookies = await page.cookies();
        fs.writeFileSync(fileCookies, JSON.stringify(cookies, null, 2));
        console.log('Cookies guardadas');
    } catch (e) {
        console.log('Error guardando las cookies: ');
        console.log(e);
    }
}

const useCookies2 = async function(page, fileCookies) {
    try {
        const cookiesString = fs.readFileSync(fileCookies, 'utf8', function(err, data) {});
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        console.log('Cookies utilizadas');
    } catch (e) {
        console.log('No existen cookies para usar');
        console.log(e);
    }
}


const removeDuplicates = function(q) {
    var qcache = {};
    var nuevoArray = q.reverse().filter(e => {
        return e ? (qcache[e.titulo] ? false : qcache[e.titulo] = 1) : true;
    }).reverse();
    return nuevoArray;
}

const removeItemValueFromArr = function(arr, item) {
    return arr.filter(function(e) {
        return e !== item;
    });
};


/**
 *   FUNCTIONS RECAPTCHA2 API
 */

const initiateCaptchaRequest = async function(apiKey) {
    const formData = {
        method: 'userrecaptcha',
        googlekey: config.sitekey_2captcha,
        key: apiKey,
        invisible: 1,
        pageurl: config.pageurl_2captcha,
        json: 1
    };
    const response = await request.post('http://2captcha.com/in.php', { form: formData });
    return JSON.parse(response).request;
}

const pollForRequestResults = async function(key, id, retries = 30, interval = 1500, delay = 15000) {
    await timeout(delay);
    return poll({
        taskFn: requestCaptchaResults(key, id),
        interval,
        retries
    });
}


const requestCaptchaResults = function(apiKey, requestId) {
    const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
    return async function() {
        return new Promise(async function(resolve, reject) {
            const rawResponse = await request.get(url);
            const resp = JSON.parse(rawResponse);
            if (resp.status === 0) return reject(resp.request);
            resolve(resp.request);
        });
    }
}

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis));


module.exports = {
    delay,
    getRandomInt,
    readJson,
    writeJson,
    saveCookies,
    useCookies,
    removeDuplicates,
    enviarMensajeTelegram,
    enviarEMail,
    enviarMensajeSlack,
    readJsonSync,
    removeItemValueFromArr,
    saveCookies2,
    useCookies2,
    initiateCaptchaRequest,
    pollForRequestResults,
    requestCaptchaResults,
    writeCsv,
    writeCsv2
}