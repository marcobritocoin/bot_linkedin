const fs = require('fs');
const FOLLOWERS_PATH = 'followers.json';
const JSON_TEST = {
    "id": 1,
    "nombre": "Pedro",
    "correo": "Pedro@gmail.com",
    "telefono": 662663380,
    "habitacion": 1,
    "banio": 2
};

Main();

async function Main() {
    const datos = await leerJson(FOLLOWERS_PATH);
    // const ObjDatos = JSON.parse(datos);
    // escribirJson(FOLLOWERS_PATH, JSON_TEST);
    console.log(datos.banio);
}

async function leerJson(archivo) {
    return new Promise((resolve, reject) => {
        fs.readFile(archivo, 'utf-8', (err, data) => {
            if (err) reject(err)
            else resolve(JSON.parse(data))
        });
    });
}

async function escribirJson(archivo, objJson) {
    return new Promise((resolve, reject) => {
        fs.writeFile(archivo, JSON.stringify(objJson), 'utf-8', (err) => {
            if (err) throw err;
            console.log(`Datos guardados en ${archivo} `);
            resolve(true);
        });
    });
}