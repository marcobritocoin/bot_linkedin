'use strict'
const config = require('./config');
const helpers = require('./helpers');
const selectors = require('./selectors');

const content = async function(page, userAccount) {
    var postDataScrapper = [];

    // Url de la cuenta
    await page.goto(`${config.url}/${userAccount}/`, {
        waitUntil: "networkidle2",
        timeout: 120000,
    });

    await page.waitForSelector(selectors.selCountPageAccount, {
        timeout: 12000
    });

    const post = await page.evaluate((e) => {
        return Number(document.querySelector('header').querySelector('section').querySelector('ul').children[0].innerText.split(' ')[0].replace(',', ''));
    });

    const followers = await page.evaluate((e) => {
        return Number(document.querySelector('header').querySelector('section').querySelector('ul').children[1].innerText.split(' ')[0].replace(',', ''));
    });

    const follows = await page.evaluate((e) => {
        return Number(document.querySelector('header').querySelector('section').querySelector('ul').children[2].innerText.split(' ')[0].replace(',', ''));
    });

    const biography = await page.evaluate((e) => {
        return document.querySelector(e).innerText;
    }, selectors.selBiografia);

    const storiesDestacadas = await page.evaluate((e) => {
        return document.querySelectorAll('[role="presentation"]')[1].innerText;
    });


    //console.log(post, followers, follows, biography, storiesDestacadas);
    console.log('Cantidad Post: ' + post);


    let count = 0;
    let scrollJump = 0;

    do {

        const postCurrentCount = await page.evaluate((e) => {
            return document.querySelectorAll('[class="eLAPa"]').length;
        });

        console.log('Cantidad actual: ' + postCurrentCount);

        await helpers.delay(200);

        for (var i = 0; i < postCurrentCount; i++) {
            if (count < 21) {

                const objDataPost = await extraer_data(page, i);

                // Insertamos el Objeto
                postDataScrapper.push(objDataPost);

                // Incrementamos el acumulador
                count += 1;

                console.log('Acumulado: ' + count);

            } else if ((count >= 21) && (i > (postCurrentCount - 13))) {

                const objDataPost = await extraer_data(page, i);

                // Insertamos el Objeto
                postDataScrapper.push(objDataPost);

                // Incrementamos el acumulador
                count += 1;

                console.log('Acumulado: ' + count);

            }


        } // Fin del FOR

        console.log('Fin del FOR');

        await helpers.delay(300);

        // Hacemos SCROLL
        scrollJump += 10000;
        await page.evaluate((e) => {
            window.scroll({
                top: e,
                behavior: 'smooth'
            });
        }, scrollJump);

        // Esperamos un tiempo
        await helpers.delay(500);

        console.log(count + '<' + post);

    } while (Number(count) < Number(post));

    console.log('Acumulado total: ' + count);
    console.log(postDataScrapper);
    console.log('Fin de los fines');
    console.log('-------------------------------------');
    console.log('-------------------------------------');
    console.log('-------------------------------------');
    console.log('-------------------------------------');
    console.log('-------------------------------------');

    console.log('Cantidad de POST inicial: ' + postDataScrapper.length);
    postDataScrapper = helpers.removeDuplicates(postDataScrapper);
    console.log('Cantidad nueva de POST: ' + postDataScrapper.length);
    //console.log(postDataScrapper);

    const jsonContentFull = {
        usuario: '@' + userAccount,
        biografia: biography,
        nroPost: post,
        seguidores: followers,
        seguidos: follows,
        storiesDestacadas: storiesDestacadas,
        contenidoPost: postDataScrapper
    }

    // Generamos el JSON
    helpers.writeJson('./content-posts-' + userAccount + '.json', jsonContentFull, true); // Pretty Json
    //helpers.writeJson('./content-posts-' + userAccount + '.json', jsonContentFull); // minify normally

    // Enviamos Notificaciones
    helpers.enviarMensajeSlack(`Ha finalizado correctamente la extracción de datos de la cuenta @${userAccount}`, 'C0328HDFDKR');
    helpers.enviarEMail('BOT AgenciaWOW | Finalizó ContentScrapping IG ', `Ha finalizado correctamente la extracción de datos de la cuenta @${userAccount}`, 'marcobritoduran@gmail.com');
}

async function extraer_data(page, index) {
    return await page.evaluate((e) => {
        async function proceso(e) {
            try {
                el = document.querySelectorAll('[class="eLAPa"]')[e];
                content = el.innerHTML;
                content = content.substring(content.indexOf('alt="'), content.indexOf('crossorigin'));
                content = content.replaceAll('alt="', '').replaceAll('class="FFVAD"', '');
                if (content.indexOf('says') != -1) {
                    content = content.substring(content.indexOf('\'') + 1, content.indexOf('\'.'));
                }
                await sleep(100);
                // Hago MouseOver sobre la imagen
                el.dispatchEvent(new MouseEvent('mouseover', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));

                await sleep(200);
                likes = document.querySelectorAll('[class="-V_eO"]')[0].innerText;
                comment = document.querySelectorAll('[class="-V_eO"]')[1].innerText;

                await sleep(100);
                // Hago MouseOver sobre la imagen
                el.dispatchEvent(new MouseEvent('mouseout', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));

                objdata = {
                    id: e,
                    titulo: content,
                    likes: likes,
                    comment: comment,
                }
                return objdata;
            } catch (error) {
                console.log(error);
            }
        }

        function sleep(time) {
            return new Promise(function(resolve) {
                setTimeout(resolve, time);
            });
        }

        return proceso(e);

    }, index);
}

module.exports = {
    content,
}