const { ocrSpace } = require('ocr-space-api-wrapper');

// https://ocr.space/OCRAPI/
// https://www.npmjs.com/package/ocr-space-api-wrapper

async function main() {
    try {
        // Using the OCR.space default free API key (max 10reqs in 10mins) + remote file
        // const res1 = await ocrSpace('http://dl.a9t9.com/ocrbenchmark/eng.png');
        const res1 = await ocrSpace('../capture_web.png');

        // Using your personal API key + local file
        // const res2 = await ocrSpace('/path/to/file.pdf', { apiKey: '<API_KEY_HERE>' });
        // const res2 = await ocrSpace('imagenes_comprimidas/capture_web.png', { apiKey: 'helloworld' });
        // const res2 = await ocrSpace('../capture_web.png', { apiKey: 'helloworld' });

        // // Using your personal API key + base64 image + custom language
        // const res3 = await ocrSpace('data:image/png;base64...', { apiKey: '<API_KEY_HERE>', language: 'ita' });

        console.log(res1);
        console.log(res1.ParsedResults[0].ParsedText.split('\n')[2].replaceAll(' ', ''));


    } catch (error) {
        console.error(error);
    }
}

main();