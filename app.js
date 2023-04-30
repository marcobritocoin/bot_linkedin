const puppeteer = require("puppeteer");
const config = require('./modules/config');
const helpers = require('./modules/helpers');
const CronJob = require('cron').CronJob;
const fs = require('fs');
const clientesNoPostular = ['quental', 'ibermatica', 'biten'];
const ofertasPostular = ['RPA', 'Junior', 'Software', 'Backend', 'Frontend', 'Robotic Process Automation', 'proyecto', 'project', 'Consultor', 'Automation', 'Analista', 'Python', 'automatización', 'angular'];
const user = "marcobritoduran@gmail.com"; //  txara88@hotmail.com // marcobritoduran@gmail.com
const pass = "Trucutrux85"; // bASKET123 // Trucutrux85
const url = 'https://www.linkedin.com/';
const urlJobs = 'https://www.linkedin.com/jobs/';
const searchJobText = "rpa"; // remote  // RPA // NODE // ANGULAR // BACKEND // remoto // freelance / full stack
const numMovil = '681923325'; // 681923325 // 641705097


const browser = async function() {
    const bro = await puppeteer.launch({
        headless: config.headless,
        //headless: true,
        handleSIGINT: false,
        ignoreHTTPSErrors: true,
        args: [
            '--log-level=3',
            '--start-maximized', // '--start-fullscreen'
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
            '--no-sandbox'
        ],
        ignoreDefaultArgs: ['--enable-automation', '--mute-audio', '--hide-scrollbars'],
    });
    return bro;
}

const paginaitor = async function(browser) {
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36"
    );
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1566, height: 950 });
    await page.setRequestInterception(true);
    page.on("request", (request) => {
        request.continue();
    });
    return page;
}

async function main() {

    const navigate = await browser();
    const page = await paginaitor(navigate);
    const dateTimeNow = new Date();
    const formatTime = dateTimeNow.getDate()+'-'+dateTimeNow.getMonth()+'-'+dateTimeNow.getFullYear()+'_'+dateTimeNow.getHours()+'-'+dateTimeNow.getMinutes()+'-'+dateTimeNow.getTime();
    const selInputUser='[id="session_key"]';
    const selInputPass='[id="session_password"]';
    const timeWait = 200;
    let offerRecommended = false;
    //offerRecommended = "https://www.linkedin.com/jobs/collections/recommended/?currentJobId=3517573132";
    const cookiesUsed = '/cookies_linkedin.json';
    const dataOfferCsv = './dataExtract/dataExtract_'+formatTime+'.csv';
    const selProfileHeader = '[class="global-nav__primary-link global-nav__primary-link-me-menu-trigger artdeco-dropdown__trigger artdeco-dropdown__trigger--placement-bottom ember-view"]';
    const selJobs = '[href="https://www.linkedin.com/jobs/?"]';
    const inputSearchJob = '[class="jobs-search-box__text-input jobs-search-box__keyboard-text-input"]';
    const btnMessaging = '[type="chevron-down"]';
    const selHeadJobs = '[class="jobs-search-results-list__title-heading"]';
    const selbtnFilter = '[class="relative mr2"]';
    const selFilterDate = '[class="search-reusables__secondary-filters-values"]';
    const selFilterTypeJob = '[class="search-reusables__secondary-filters-values"]';
    const selFilterRemote = '[class="search-reusables__secondary-filters-values"]';
    const selSimpleSolicitud = '[class="jobs-search-advanced-filters__binary-toggle"]';
    const selBtnFilterSearch = '[class="reusable-search-filters-buttons search-reusables__secondary-filters-show-results-button artdeco-button artdeco-button--2 artdeco-button--primary ember-view"]';
    const selBtnSimpleRequest = '[class="artdeco-pill artdeco-pill--slate artdeco-pill--2 artdeco-pill--choice artdeco-pill--selected ember-view search-reusables__filter-pill-button"]';
    const selBtnSimpleOffer = '[class="jobs-apply-button artdeco-button artdeco-button--3 artdeco-button--primary ember-view"]';
    const selDivApplyJob = '[class="jobs-s-apply jobs-s-apply--fadein inline-flex mr2"]';
    let numberScroll = 70;
    let totalPage=null;
    let pagina = 1;
    let titleWin = '';
    // const listadoJobs = '[class="scaffold-layout__list-container"]';
    
    /* Inyectando las cookies en la web para evitar iniciar sesión */
    try {
        helpers.useCookies2(page, config.cookiesPath + cookiesUsed);
    } catch (e) {}
    await helpers.delay(timeWait);

    
    try {
        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 120000
        });

        infoAuto(page,'Bot de Linkedin');
        cerrarMensajeria(page, btnMessaging);

        await helpers.delay(timeWait);
        const profileHead = await page.$(selProfileHeader);
        if(!profileHead){
            console.log('Hacer Login');
            await page.waitForSelector(selInputUser, {
                timeout: 60000
            });
            await helpers.delay(100);
            await page.type(selInputUser, user);
            await page.type(selInputPass, pass);
            await helpers.delay(200);
            await page.click('[type="submit"]');
            await helpers.delay(1000);
            await page.waitForSelector(selProfileHeader, {
                timeout: 60000
            });
            /* Guardando las coockies para evitar iniciar sesión la proxima véz */
            try {
                helpers.saveCookies2(page, config.cookiesPath + cookiesUsed);
                console.log('Cookies guardadas');
                updateInfoAuto(page,'Cookies guardadas correctamente');
            } catch (err) {
                console.error(err);
            }
        }

        /* Activando la busqueda de empleo */
        await helpers.delay(timeWait);
        // await page.click(selJobs);

        if(!offerRecommended){

            await page.goto(urlJobs, {
                waitUntil: "networkidle2",
                timeout: 60000
            });
            
            updateInfoAuto(page,'Buscando ofertas de empleo');

            await page.waitForSelector(inputSearchJob, {
                timeout: 60000
            });

            /* BUSCAR UN TERMINO EN EL BUSCADOR SUPERIOR */
            await helpers.delay(1500);
            await page.type(inputSearchJob, searchJobText);
            await helpers.delay(1000);
            await page.evaluate(()=>document.querySelector('.jobs-search-box__submit-button--hidden').click());
            // await page.keyboard.press('Enter');
            // await helpers.delay(500);
            // await enterSimulate(page,inputSearchJob);
            updateInfoAuto(page,'Esperamos resultados de la busqueda');
            await helpers.delay(500);
            
            /* ESPERANDO LOS DATOS DE EMPLEO */
            await page.waitForSelector(selbtnFilter, {
                timeout: 60000
            });
            await helpers.delay(1500);


            /* VERIFICANDO SI YA APLIQUE LOS FILTROS */
            const easyApplyBtn = await page.evaluate(()=>document.querySelector('[class="search-reusables__filter-binary-toggle"]').querySelector('[aria-checked="true"]'));

            if(!easyApplyBtn){
                console.log('Aplicando los filtros correspondientes');
                /* APLICANDO FILTROS */
                await page.evaluate(`document.querySelector('${selbtnFilter}').children[0].click();`);
                updateInfoAuto(page,'Configurando criterios en los filtros');
                await helpers.delay(300);
                // await page.evaluate(`document.querySelectorAll(${selFilterDate})[1].querySelectorAll('li')[2].children[0].click();`); /* Fecha publicacion - Ultimas 24 h*/
                await page.evaluate(`document.querySelectorAll('${selFilterTypeJob}')[4].querySelectorAll('li')[0].children[0].click()`); /* Filter Tipo empleo */
                await page.evaluate(`document.querySelectorAll('${selFilterTypeJob}')[4].querySelectorAll('li')[1].children[0].click()`); /* Filter Tipo empleo */
                await page.evaluate(`document.querySelectorAll('${selFilterTypeJob}')[4].querySelectorAll('li')[2].children[0].click()`); /* Filter Tipo empleo */
                await page.evaluate(`document.querySelectorAll('${selFilterTypeJob}')[4].querySelectorAll('li')[3].children[0].click()`); /* Filter Tipo empleo */
                await page.evaluate(`document.querySelectorAll('${selFilterRemote}')[5].querySelectorAll('li')[1].children[0].click();`); /* Filter remoto */
                await page.evaluate(`document.querySelector('${selSimpleSolicitud}').children[0].click();`); /* Solicitud sencilla */
                console.log("Activo para filtrar...");
                await helpers.delay(1300);
                await page.click(selBtnFilterSearch);

                await helpers.delay(1000);
                await page.waitForSelector(selBtnSimpleRequest, {
                    timeout: 60000
                });
            }
        }else{
            /* Ofertas recomendadas por LINKEDIN */
            await page.goto(offerRecommended, {
                    waitUntil: "networkidle2",
                    timeout: 60000
            });
                
            updateInfoAuto(page,'Buscando ofertas de empleo');

            await page.waitForSelector('[id="results-list__title"]', {
                timeout: 60000
            });

        }

        await helpers.delay(2000);

        /* CAPTURANDO LAS CANTIDADES DE EMPLEOS */

        const resultCount = await page.evaluate((a)=>{ return Number(document.querySelector(a).children[1].innerText.split(' ')[0]); },selHeadJobs);
        updateInfoAuto(page,'Cantidad de resultados totales: '+ resultCount);

        totalPage = await page.evaluate(()=>{
            try{
                const totalPageBrut = document.querySelector('[class="artdeco-pagination__pages artdeco-pagination__pages--number"]').querySelectorAll('li');
                const totalPage = totalPageBrut ? Number(totalPageBrut[totalPageBrut.length-1].innerText): 0;
                return totalPage;
            }catch(e){
                return 1
            }
        });

        titleWin = 'Total de paginas: ' + totalPage;
        console.log(titleWin);
        updateInfoAuto(page,titleWin);

        console.log('----------------');

        const listCount = await page.evaluate(()=>{
            try{
                return Number(document.querySelector('[class="scaffold-layout__list-container"]').childElementCount);
            }catch(e){
                return 0;
            }
        });
        
        /* RECORRIENDO LISTADO DE EMPLEOS */
        if(totalPage > 1){
            for(let j=1; j<totalPage; j++){
                updateInfoAuto(page,'Pagina actual: '+ j);

                await offerProcess(page, listCount, numberScroll, dataOfferCsv);
                console.log('Fin del procesamiento de ofertas');

                await helpers.delay(2500);
                const nextPage = j+1;
                //const currentPage = j-1;
                let findPage = await page.evaluate((page)=>{
                    let find = -1;
                    var ax = document.querySelectorAll('[class="artdeco-pagination__indicator artdeco-pagination__indicator--number ember-view"]');
                    for(var i=0; i<ax.length; i++){
                        if(Number(ax[i].innerText) == page){
                            find = i;
                        }
                    }
                    return find;
                }, nextPage);
                
                console.log('Pagina actual: '+ j);
                console.log('Page: ',nextPage);
                console.log('Indice: ',findPage);

                // Click en el paginador
                if(findPage >= 0){
                    await page.evaluate((a)=>document.querySelectorAll('[class="artdeco-pagination__indicator artdeco-pagination__indicator--number ember-view"]')[a].children[0].click(), findPage);
                    console.log('Click en el index:',findPage);
                }else{
                    await page.evaluate(()=>document.querySelectorAll('[class="artdeco-pagination__indicator artdeco-pagination__indicator--number ember-view"]')[7].children[0].click());
                    console.log('Click en ...');
                }
                
                /*  ESPERANDO QUE CARGUE LA DATA DE LA OFERTA DE EMPLEO EN LA DERECHA */
                await helpers.delay(1500);
                await page.waitForSelector(selDivApplyJob, {
                    timeout: 600000
                });
                await helpers.delay(2000);

                /* ULTIMA PAGINA */
                if(nextPage == totalPage){
                    const listCount = await page.evaluate(()=>{
                        try{
                            return Number(document.querySelector('[class="scaffold-layout__list-container"]').childElementCount);
                        }catch(e){
                            return 0;
                        }
                    });

                    await offerProcess(page, listCount, numberScroll, dataOfferCsv);
                }
            } /*  FIN DEL CICLO de PAGINACIONES */
        }else{
            /* tramitando una sola pagina */
            await offerProcess(page, listCount, numberScroll, dataOfferCsv);
        }



        /** --------------------------------------------- */

        console.log("Fin de la depuracion");
        await helpers.delay(60000);

    } catch (err) { 
        console.error(err);
    } finally {
        if (navigate) await navigate.close();
        console.log('Cerramos el navegador finalmente');
    }
}

async function offerProcess(page, listCount, numberScroll, dataOfferCsv){
    let dataExtract = "";
    const inputTextDefault = '2';
    const btnCerrar = '[class="artdeco-button__icon"]';

    for(let i=0; i<listCount; i++){
        await helpers.delay(100);
        console.log('Procesando el item: ',i);

        try{

            cerrarPopupFinal(page);

            console.log('Click en la siguiente Oferta');
            await page.evaluate(`document.querySelector('[class="scaffold-layout__list-container"]').querySelectorAll('[class="job-card-list__entity-lockup artdeco-entity-lockup artdeco-entity-lockup--size-4 ember-view"]')[${i}].click();`); 
            await helpers.delay(2000);
            
            /* Extraer datos basicos de la oferta */
            const blockOffer = await page.evaluate((a)=>document.querySelector('[class="scaffold-layout__list-container"]').querySelectorAll('[class="job-card-list__entity-lockup artdeco-entity-lockup artdeco-entity-lockup--size-4 ember-view"]')[a].innerText, i);
            const titleOffer = blockOffer.split('\n')[0];
            const companyOffer = blockOffer.split('\n')[1];
            const titleWin = 'Oferta empleo como ('+ titleOffer + ') | '+ companyOffer;
            // const titleWin = 'It\'s Clicking: '+ titleOffer + ' | Company: '+ companyOffer;
            updateInfoAuto(page,titleWin);
            console.log(titleWin);
            
            //console.log(titleOffer, companyOffer);
            dataExtract += '\n'+titleOffer+';';
            dataExtract += companyOffer+';';

            /* Extraer datos de la descripcion de la oferta */
            const companyTime = await page.evaluate(()=>document.querySelector('[class="jobs-unified-top-card__primary-description"]').innerText);
            const jobType = await page.evaluate(()=>document.querySelector('[class="jobs-unified-top-card__job-insight"]').innerText);
            dataExtract += companyTime+';';
            dataExtract += jobType+';';

            try{
                const recruiterName = await page.evaluate(()=>document.querySelector('[class="hirer-card__hirer-information pt3 pb3 t-12 t-black--light"]').querySelector('a').innerText);
                const recruiterUrl = await page.evaluate(()=>document.querySelector('[class="hirer-card__hirer-information pt3 pb3 t-12 t-black--light"]').querySelector('a').href);
                dataExtract += recruiterName+';';
                dataExtract += recruiterUrl+';';
            }catch(e){}

            const descripOffer = await page.evaluate(()=>document.querySelector('[id="job-details"]').innerText);
            let correos = descripOffer.match(/(\w()?|(-)?|[.]?(\d)?)+@[a-zA-Z]+?\.[a-zA-Z]{2,3}/g);
            correos = correos ? correos.join('|') : null;
            dataExtract += correos+';';

            /* CLICK en Solicitud de EMPLEO   (AQUI VA LA MAGIA) */

            // CERRAR POPUP DEFAZADO
            cerrarPopupFinal(page);

            // Verificar las ofertas antes de postularme
            // const findOfferclick = ofertasPostular.find((a)=> titleOffer.toLowerCase().indexOf(a.toLowerCase()) >= 0);
            const findOfferclick = true;
            console.log(findOfferclick);
            
            // Verificar las empresas antes de postularme
            const findNoOfferClick = clientesNoPostular.find((a)=> companyOffer.toLowerCase().indexOf(a.toLowerCase()) >= 0);

            if(!findNoOfferClick && findOfferclick){

                const btnPostular = await page.$('[class="jobs-apply-button artdeco-button artdeco-button--3 artdeco-button--primary ember-view"]');
                if(btnPostular){
                    console.log('Me voy a postular a esta oferta');
                    await helpers.delay(500);
                    await btnPostular.click();
                    await helpers.delay(1000);
                    let btnNext = false;

                    do{
                        btnNext = await page.$('[class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view"]');
                        console.log('Pase por aqui');
                        await helpers.delay(800);
                        
                        /* Reforzando el Bton Cerrar */
                        // cerrarVentanillaError(page);
                        // await helpers.delay(600);
                        
                        /*-------------------------------- */
                        
                        if(btnNext){

                            const popupJobsApply = await page.$('[class="jobs-easy-apply-content"]');
                            let titleWin = await popupJobsApply.$('h3');
                            titleWin = await titleWin.evaluate(el => el.textContent);
                            titleWin = titleWin.trim();

                            console.log('Titulo de Pantalla: ',titleWin);

                            console.log('SE PRENDIO LA LOCURA DE SETEADERA');
                            await helpers.delay(300);
                            setearInputs(page, inputTextDefault, numMovil);
                            // await helpers.delay(100000);

                            console.log('Se acabo seteadera');
                            await helpers.delay(300);
                            chooseCV(page);
                            await helpers.delay(600);

                            // CERRAR a la fuerza si ocurre algun error
                            const errorValidation = await page.$('[class="artdeco-inline-feedback__message"]');
                            if(errorValidation){
                                closedOfferPopup(page);
                            }
                                
                            // await helpers.delay(300);
                            console.log('Click Btn siguiente');
                            //await btnNext.click();
                            // Refuerzo del boton Cerrar
                            await page.evaluate(()=>{
                                try{
                                    document.querySelector('[class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view"]').click();
                                }catch(e){
                                    console.log('Error: ', e);
                                }
                            });
                            console.log('Click Next');
                            await helpers.delay(1500);
                        }

                    }while(btnNext);
                    
                    console.log('Se acabo el proceso de postulación');

                    await helpers.delay(1000);
                    await page.waitForSelector(btnCerrar, {
                        timeout: 6000
                    });
                    
                    await helpers.delay(500);
                    console.log('Cerrando ventana Final de oferta recibida');
                    cerrarPopupFinal(page);

                    updateInfoAuto(page,'Postulación finalizada correctamente');
                    await helpers.delay(1000);
                }

            } else if(findNoOfferClick){
                console.log('CACA Empresa Hostil.. No postularme ni de coña ', findNoOfferClick);
                cerrarPopupFinal(page);
            } else if(!findOfferclick){
                console.log('Oferta que no me interesa ', findOfferclick);
                cerrarPopupFinal(page);
            }
            

            /* FIN de Solicitud de EMPLEO */

            await helpers.writeCsv(dataOfferCsv, dataExtract);
            await helpers.delay(1500);
            dataExtract="";
            
            await page.evaluate((a)=>document.querySelector('[class="scaffold-layout__list"]').children[1].scrollTop = a, numberScroll);
            numberScroll += numberScroll;
            
            // if( i == 5 || i == 10 || i == 15 || i == 20){
            //     await page.evaluate((a)=>document.querySelector('[class="scaffold-layout__list"]').children[1].scrollTop = a, numberScroll);
            //     console.log('Scroll BAJADO',numberScroll);
            //     numberScroll += numberScroll;
            // }

        }catch(e){
            //console.log('Error haciendo click: ',e);
        } 

        cerrarVentanillaError(page);

    } // FIN DEL CICLO DE Ofertas de empleo
}

/**--------------------------------------------------------------------- */

async function setearInputs(page, inputTextDefault, numMovil){
    try{
        await page.evaluate((textDefault, numPhoneMovil)=>{
                function setSelect(elem){
                    let selectedBol = false;
                    elem.querySelectorAll('option').forEach((a, index)=>{
                        if(a.value.toLowerCase() == 'yes' || a.value.toLowerCase() == 'sí' || a.value.toLowerCase() == 'conversación' || a.value.toLowerCase() == 'conversation' || a.value.toLowerCase() == 'conversational'){
                            elem.selectedIndex=index;
                            elem.dispatchEvent(new Event('change', { bubbles: true}));
                            selectedBol = true;
                        }
                    });
                    if(!selectedBol){
                        console.log('Seleccion al Azar en el listado');
                        elem.selectedIndex=1;
                        elem.dispatchEvent(new Event('change', { bubbles: true}));
                    }
                }
            
                function reviewSetWin(textDefault, numMovil){
                    try{
                    var popup = document.querySelector('[class="jobs-easy-apply-content"]');
                    var elementorium = popup.querySelector('.pb4') ? popup.querySelector('.pb4') : popup.querySelector('.pb5'); // VIEW
                    var totalElem = elementorium.querySelectorAll('label').length;
                    var selE, inputElement, tipoInput, titleInput, tagID;

                        for(var i=0; i< totalElem; i++){	
                            
                                selE = elementorium.querySelectorAll('div[data-test-form-element]')[i];
                                inputElement = selE.querySelector('select') ? selE.querySelector('select') : selE.querySelector('input');
                                inputElement = inputElement ? inputElement : selE.querySelector('textarea');
                                tipoInput = inputElement.tagName;
                                titleInput = selE.querySelector('label').innerText;
                                tagID = elementorium.getAttribute('id') ? elementorium.getAttribute('id') : inputElement.getAttribute('id');
                
                                if(tipoInput == "SELECT"){

                                    if(titleInput.toLowerCase().indexOf('email') == -1 && titleInput.toLowerCase().indexOf('phone country') == -1 && titleInput.toLowerCase().indexOf('phoneNumber-country') == -1 && titleInput.toLowerCase().indexOf('país') == -1){
                                        console.log('Input tipo Select: ', titleInput);
                                        setSelect(inputElement);
                                    }

                                }else if(tipoInput == "INPUT"){
                                    if(inputElement.getAttribute('type') == 'radio'){
                                            console.log("UN RADIOBUTTON");
                                            var finder = false;
                                            selectorium.childNodes.forEach((e)=>{
                                                if(e.innerText?.trim().toLowerCase().indexOf('yes') >= 0 || e.innerText?.trim().toLowerCase().indexOf('si') >= 0 || e.innerText?.trim().toLowerCase().indexOf('sí') >= 0){
                                                    e.children[0].click();
                                                    finder=true;
                                                }
                                            });
                                            if(!finder) inputElement.click();
                                    }
                                    if(titleInput.toLowerCase().indexOf('phone') == -1 && inputElement.value == ''){
                                        console.log('Setear Input normal');
                                        inputElement.value = textDefault;
                                        inputElement.dispatchEvent(new Event('input', { bubbles: true}));
                                    }else if(titleInput.toLowerCase().indexOf('phone') >= 0 && inputElement.value == ''){
                                        console.log('Setear telefono movil');
                                        inputElement.value = numMovil;
                                        inputElement.dispatchEvent(new Event('input', { bubbles: true}));
                                    }
                                }else if(tipoInput == "TEXTAREA"){
                                    console.log('Setear TEXTAREA');
                                    inputElement.value = textDefault;
                                    inputElement.dispatchEvent(new Event('input', { bubbles: true}));
                                }else{
                                    console.log('No se logró identificar el INPUT');
                                }

                        } // Fin del FOR
                        
                    }catch(e){}
                }

            reviewSetWin(textDefault, numPhoneMovil);
          
        }, inputTextDefault, numMovil);

    }catch(e){
        console.log('Error rellenando los campos, cerrando LALO ', e);
        await helpers.delay(300);
        await page.evaluate(()=>document.querySelector('[class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view"]').click());
    }
}

async function revisarPage(page){
    let rows2 = await page.$('table');
    rows2 = await rows2.$$('tr');
    return rows2;
}

async function cerrarMensajeria(page, selector){
    try{
        await page.evaluate((e)=>document.querySelector(e).parentElement.click(), selector);
    }catch(e){
        // console.log('Error haciendo click en mensajeria: ',e);
        console.log('Error haciendo click en mensajeria: ');
    }
}

async function closedOfferPopup(page){
    try{
        // await page.evaluate(()=>document.querySelector('[class="artdeco-button__icon"]').click());
        await page.click('[class="artdeco-button__icon"]');
        await helpers.delay(500);
        // await page.evaluate(()=>document.querySelector('[data-control-name="discard_application_confirm_btn"]').click());
        await page.click('[data-control-name="discard_application_confirm_btn"]');
    }catch(e){
        console.log('Error haciendo click en cerrar popup: ',e);
    }
}

async function cerrarPopupFinal(page){
    await page.evaluate(()=>{
        try { 
            // document.querySelector('[data-test-modal-container]').querySelector('[aria-label="Dismiss"]').click();
            document.querySelector('[class="artdeco-button artdeco-button--2 artdeco-button--primary ember-view mlA block"]').click();
        }catch(e){}
    });
    await helpers.delay(1000);
}

async function cerrarVentanillaError(page){
    // Dissmis
    await page.evaluate(()=>{
        try { 
            document.querySelector('[data-test-modal-id="data-test-easy-apply-discard-confirmation"]').querySelector('[data-control-name="discard_application_confirm_btn"]').click();
        }catch(e){}
    });
}


async function chooseCV(page){
    try{
        await page.evaluate(()=>{
            const a = document.querySelector('[class="jobs-resume-picker__resume-list"]');
            if(a){
                a.children[0].querySelector('button').click();
            }
        });
    }catch(e){
        console.log('Error haciendo click en Adjuntar CV: ',e);
    }
}


async function enterSimulate(page, selector){
    await page.evaluate((a)=>{
        var elelement = document.querySelector(a);
        var key = 13; /* ENTER */
        if(document.createEventObject)
        {
            var eventObj = document.createEventObject();
            eventObj.keyCode = key;
            elelement.fireEvent("onkeydown", eventObj);
            eventObj.keyCode = key;   
        }else if(document.createEvent)
        {
            var eventObj = document.createEvent("Events");
            eventObj.initEvent("keydown", true, true);
            eventObj.which = key; 
            eventObj.keyCode = key;
            elelement.dispatchEvent(eventObj);
        }
    },selector);
}

async function infoAuto(page, info){
    try{
        // ---> portatil
        // await page.evaluate(`document.body.insertAdjacentHTML("afterbegin", '<div id="infoAuto" style="color: #FFF;font-size: 16px; text-transform: uppercase; font-weight: bold; border-radius: 5px; letter-spacing: 2px; background-color: #E91E63; padding: 18px 30px 90px; position: fixed;bottom: 90px;left: 40px;transition: all 300ms ease 0ms;box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);z-index: 99999;"><img src="https://marketingshizukesa.com/wp-content/uploads/2022/05/favicon4.png" width="40px" style="padding-right:10px;border-radius: 50%;"/><b>$InfoBot:</b> ${info}</div>');`);
        
        // ---> Monitor full
        await page.evaluate(`document.body.insertAdjacentHTML("afterbegin", '<div id="infoAuto" style="color: #FFF;font-size: 16px; text-transform: uppercase; font-weight: bold; border-radius: 5px; letter-spacing: 2px; background-color: #E91E63; padding: 18px 30px 20px; position: fixed;bottom: 2px;left: 30px;transition: all 300ms ease 0ms;box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);z-index: 99999;"><img src="https://marketingshizukesa.com/wp-content/uploads/2022/05/favicon4.png" width="40px" style="padding-right:10px;border-radius: 50%;"/>$InfoBot: ${info}</div>');`);
    }catch(e){}
}

async function updateInfoAuto(page, info){
    try{
        const elem = await page.$('#infoAuto');
        if(elem){
            await page.evaluate(`document.querySelector('#infoAuto').innerText="$InfoBot: ${info}";`);
        }else{
            // await page.evaluate(`document.body.insertAdjacentHTML("afterbegin", '<div id="infoAuto" style="color: #FFF;font-size: 16px; text-transform: uppercase; font-weight: bold; border-radius: 5px; letter-spacing: 2px; background-color: #E91E63; padding: 18px 30px 90px; position: fixed;bottom: 90px;left: 40px;transition: all 300ms ease 0ms;box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);z-index: 99999;">$InfoBot: ${info}</div>');`);
            await page.evaluate(`document.body.insertAdjacentHTML("afterbegin", '<div id="infoAuto" style="color: #FFF;font-size: 16px; text-transform: uppercase; font-weight: bold; border-radius: 5px; letter-spacing: 2px; background-color: #E91E63; padding: 18px 30px 20px; position: fixed;bottom: 2px;left: 30px;transition: all 300ms ease 0ms;box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);z-index: 99999;">$InfoBot: ${info}</div>');`);
        }
    }catch(e){
        console.log('Error actualizando la info inferior:');
    }
}

async function startTracking() {

    main();

    // let interaccionInterna = new CronJob('00 00 9,20 * * *', function() {
    //     main();
    // });

    // interaccionInterna.start();

    //# ┌────────────── second (optional)
    //# │ ┌──────────── minute            (0 - 59)
    //# │ │ ┌────────── hour              (0 - 23)
    //# │ │ │ ┌──────── day of month      (1 - 31)
    //# │ │ │ │ ┌────── month             (1 - 12)
    //# │ │ │ │ │ ┌──── day of week       (0 domingo - 6)
    //# │ │ │ │ │ │
    //# │ │ │ │ │ │
    //# * * * * * *
}

startTracking();