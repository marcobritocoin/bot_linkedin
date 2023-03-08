const { createWorker } = require('tesseract.js');

const worker = createWorker({
    logger: m => console.log(m), // Add logger here
});

(async() => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    //   const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
    // const { data: { text } } = await worker.recognize('imagenes_comprimidas/capture_web.png');
    const { data: { text } } = await worker.recognize('../capture_web.png');
    console.log(text);
    await worker.terminate();
})();