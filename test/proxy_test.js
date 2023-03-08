'use strict';
const puppeteer = require('puppeteer');
const h = require('../modules/helpers');

const proxies = ['185.253.154.181:3128', '46.183.115.148:3128', '80.240.126.125:3128'];

(async() => {
    const proxy = proxies[h.getRandomInt(0, 3)];
    const browser = await puppeteer.launch({
        // executablePath: '/usr/bin/google-chrome',
        headless: true,
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
            // '--proxy-server=46.183.115.148:3128'
            // '--proxy-server=80.240.126.125:3128'
            '--proxy-server=' + proxy
        ],
        ignoreDefaultArgs: ['--enable-automation', '--mute-audio', '--hide-scrollbars'],
    });
    const page = await browser.newPage();
    await page.goto('https://www.cual-es-mi-ip.net/', {
        waitUntil: "networkidle2",
        timeout: 120000,
    })
    const ip = await page.evaluate(() => {
        return document.querySelector('#ip-col').querySelector('span').innerText
    })
    console.log('Tu IP: ' + ip);
    await browser.close();
})();

// curl -x http://185.253.154.181:3128 https://www.cual-es-mi-ip.net/