'use strict'
const ip = require("ip");
let os = require("os");

const options = {
    url_login: 'https://tramites.saime.gob.ve/index.php?r=site/login',
    url_historico: 'https://tramites.saime.gob.ve/index.php?r=tramite/tramite',
    url_pasaporte_consular: 'https://tramites.saime.gob.ve/index.php?r=consular/consular',
    url_cita_pasaporte_consular: 'https://tramites.saime.gob.ve/index.php?r=consular/consular/crear',
    nacionalidad: 'V',
    cedula: '20432774', // 17516196
    password: '8020emsmj', // Hack1234
    apiKey_2catpcha: 'f1bee643b39c3019accd86e34b216ffe',
    sitekey_2captcha: '6LfoobwUAAAAAGWFjvijr2R9_1_yn-BuSHjfMM2F',
    pageurl_2captcha: 'https://quental-451346393552162458.myfreshworks.com/',
    serverVPS: 'http://161.22.45.97:13500',
    cookiesPath: './sesiones',
    addressMachine: '',
    pathBrowser: '',
    headless: '',
    waitTimemin: 1000,
    waitTimemax: 5000,
    scrollJump: 5000,
    chatIdTelegram: -743827434,
    chatCanalSlack: 'C0328HDFDKR'
};

function getPathBrowser() {
    if (os.platform().indexOf('win') !== -1) {
        //return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    } else {
        if (os.hostname().indexOf('raspberry') !== -1) {
            return '/usr/bin/chromium-browser';
        } else {
            return '/usr/bin/google-chrome';
        }
    }
}

function getAddressMachine() {
    if ((ip.address().indexOf('192.168.') !== -1) || (ip.address().indexOf('127.0.0.1') !== -1)) {
        return os.hostname();
    } else {
        return ip.address();
    }
}

function getHeadless() {
    if (os.platform().indexOf('win') !== -1) {
        return false;
    } else {
        return true;
    }
}

options.addressMachine = getAddressMachine();
options.pathBrowser = getPathBrowser();
options.headless = getHeadless();
module.exports = options;