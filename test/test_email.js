'use strict'
const helpers = require('../helpers');
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');


//helpers.enviarMensajeTelegram('hola pocket', '-617466595');

sendNotification('Novedades BOT', 'Esto es lo que hay', 'marcobritoduran@gmail.com');


async function sendNotification(asunto, mensaje, correo) {

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

// function insertarMensajeSMS(telefono, mensaje) {
//     request.post(
//         'http://161.22.45.97:10200/mensajes/sms', { json: { telefono: telefono, mensaje: mensaje } },
//         function(error, response, body) {
//             if (!error && response.statusCode == 200) {
//                 console.log('Mensaje enviado a SMS');
//             }
//         }
//     );
// }