'use strict'
const request = require("request-promise-native");


const enviarMensajeSlack = function(mensaje, canal) {
    request.post({
        headers: { 'Authorization': 'Bearer xoxb-3091164152002-3084629804406-OpJirAlgMsMgTAyTDNUvj3ug', 'Content-Type': 'application/json', 'Accept': 'application/json' },
        url: 'https://slack.com/api/chat.postMessage',
        form: { channel: canal, text: mensaje }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log('Mensaje enviado');
            //console.log(body);
        }
    });
}


enviarMensajeSlack('Hola', 'C0328HDFDKR');


const enviarMensajeTelegram = function(mensaje, chatid) {
    request.post(
        'https://api.telegram.org/bot5272719209:AAEJJ8N2Yo-roFVnBQmZRn9JkzHK-3Kyt2E/sendMessage', { json: { chat_id: `${chatid}`, text: mensaje } },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log('Mensaje enviado');
            }
        }
    );
}