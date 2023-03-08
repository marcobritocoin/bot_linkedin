
// LEER DIRECTO DE LA CONSOLA


page.on('console', async msg => {
    const args = msg.args();
    const vals = [];
    for (let i = 0; i < args.length; i++) {
      vals.push(await args[i].jsonValue());
    }
    console.log(vals.map(v => typeof v === 'object' ? JSON.stringify(v, null, 2) : v).join('\t'));
});