// Activa la función cada 5000 milisegundos (5 segundos)

// TODO no alvidar avtivar ciber security
// setInterval(detectConsol, 5000);
// detecHaker()
endpoints = {}       
dataBase = {}
urlServer = ""
basicData = JSON.parse(sessionStorage.getItem('datosBasicos'))
console.log("Que hay e el primer basicData", basicData)
    // busca los datos basicos y los guarda en sessionStorage

    async function fetchDatosBasicos() {
        // Función para mostrar alertas
        const mostrarAlerta = (mensaje) => {
            console.warn(mensaje); // Puedes personalizar esta función según lo que quieras hacer con la alerta
        };
    
        try {
            // Primer fetch: obtener datos de /dataInfoTokensEtc
            const responseTokens = await fetch('/dataInfoTokensEtc');
    
            if (!responseTokens.ok) {
                mostrarAlerta(`Error: ${responseTokens.status} ${responseTokens.statusText}`);
                throw new Error(`HTTP Error! Status: ${responseTokens.status}`);
            }
    
            dataTokens = await responseTokens.json();
            //console.log("Que datos obtiene desdde /dataInfoTokensEtc", dataTokens)
    
            // Guardar datos obtenidos del servidor en sessionStorage
            urlServer = dataTokens.data.urlServer;
            endpoints = dataTokens.endPointsIdTokens;

            sessionStorage.setItem('endPointsIdTokensCpanel', JSON.stringify(endpoints));
    
            //console.log('Datos recibidos desde /dataInfoTokensEtc:', dataTokens);
    
        } catch (error) {
            console.error('Error en la solicitud a /dataInfoTokensEtc:', error);
            mostrarAlerta(`Error en la solicitud: ${error.message}`);
            return; // Detener ejecución si hay un error en el primer fetch
        }
    
        // Si el primer fetch tuvo éxito, realizar el segundo fetch
        try {
            const responseBasicos = await fetch('/buscar/datos/basicosFronen');
    
            if (!responseBasicos.ok) {
                throw new Error('Error en la solicitud: ' + responseBasicos.statusText);
            }
    
            const dataBasicos = await responseBasicos.json();
            sessionStorage.setItem('datosBasicos', JSON.stringify(dataBasicos));
    
            //console.log('/buscar/datos/basicosFronen - Datos guardados en sessionStorage:', dataBasicos);
    
            return dataBasicos; // Retornar los datos si se necesita en otra parte del código
    
        } catch (error) {
            console.error('Error al obtener los datos de /buscar/datos/basicosFronen:', error);
            // Refrescar la pestaña después de 2 segundos en caso de error
            setTimeout(() => window.location.reload(), 2000);
        }
    }
    
    // Autoejecutable para ejecutar la función
    (async () => {
        try {
            const dataBase = await fetchDatosBasicos();
            //console.log("Que datos traen1111111111111111111111",dataBase)
            basicData = dataBase
            if (basicData) {
                (async () => {
                    const cotizacionDolar = await cotizacionesDolaresPaises(basicData);
                    //console.log(`Cotización del dólar: ${cotizacionDolar}`);
                })();
            }
        
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    })();
    


    jwToken       = sessionStorage.getItem('jwTokenOwner') || "";
    ownerProducts = JSON.parse(sessionStorage.getItem("ownerProducts")) || [];
    ownerPromos   = JSON.parse(sessionStorage.getItem("ownerPromos")) || [];
    ownerMensajes = JSON.parse(sessionStorage.getItem("ownerMensajes")) || [];
    informeDiario = JSON.parse(sessionStorage.getItem("informeDiario")) || [] ;
    dataOwner     = JSON.parse(sessionStorage.getItem('ownerData')) || [];


    // let {comisionBasic} = basicData.data.ConfigsOne[0]

    //console.log("Que datos basicos grl encontro??", basicData )


// Asigna el valor de dataOwner o null a las variables, manteniendo valores existentes
tranposterUser = dataOwner ? dataOwner.tranposterEmailUser || basicData.transportGmail : null; ({ _id, nombre, apellido, tipoMembresia, Ventas, direcciones, emails, email, numCel, password, realPass, pathLogo, ecommerceName, tipoDocu, numDocu, numDocuFiscal, tipoDocuFiscal, fondoPantalla, clientes, retiros, cheqDocument, urlOwner, lastInfo } = dataOwner || {}); _id = _id || null; nombre = nombre || null; apellido = apellido || null; tipoMembresia = tipoMembresia || null; Ventas = Ventas || null; direcciones = direcciones || null; emails = emails || null; email = email || null; numCel = numCel || null; password = password || null; realPass = realPass || null; pathLogo = pathLogo || null; ecommerceName = ecommerceName || null; tipoDocu = tipoDocu || null; numDocu = numDocu || null; numDocuFiscal = numDocuFiscal || null; tipoDocuFiscal = tipoDocuFiscal || null; fondoPantalla = fondoPantalla || null; clientes = clientes || null; retiros = retiros || null; cheqDocument = cheqDocument || null; urlOwner = urlOwner || null; lastInfo = lastInfo || null;

    idOwner = dataOwner._id;
    //console.log("Que es tranposter???????????????????????????????????", tranposterUser)
    //console.log("idddddddddddddddddddd basicData",idOwner)


    /*iniciar la tienda*/
    // Cuando presionas ir Ver mi tienda pasa primero por aqui para ver si tenes todos lo basico configurado
    function RevisarDatosCompletos() {  
        let { nombre, apellido, tipoMembresia, ecommerceName, Ventas, direcciones, emails, numCel, password, realPass, pathLogo, fondoPantalla, desingShop, misProductos, retiros, cheqDocument, cheqDataFaltante } = dataOwner;  

        // Lista de datos básicos requeridos  
        const datosBasicos = [  
            { key: 'nombre', value: nombre, nombreCampo: 'Nombre' },  
            { key: 'apellido', value: apellido, nombreCampo: 'Apellido' },  
            { key: 'ecommerceName', value: ecommerceName, nombreCampo: 'El Nombre de tu comercio' },  
            { key: 'Numero celular', value: numCel, nombreCampo: 'Número celular' },  
            { key: 'direcciones', value: direcciones, nombreCampo: 'Dirección' },  
            { key: 'DiseñoTienda', value: desingShop, nombreCampo: 'Diseño de tu tienda' },  
            { key: 'FondoPantalla', value: fondoPantalla, nombreCampo: 'Fondo de pantalla' },  
            { key: 'AgregarProductos', value: misProductos, nombreCampo: 'Agrega al menos un producto' },  
        ];  

        let camposPendientes = [];  
        let contadorFaltantes = 0; // Contador de campos faltantes  

        // Verificar si los datos básicos están presentes  
        for (const dato of datosBasicos) {  
            if (!dato.value || dato.value.length === 0 || dato.value === "No tiene") {  
                camposPendientes.push(`<li><i class="fas fa-times" style="color: red;"></i> ${dato.nombreCampo}</li>`); // Campo faltante  
                contadorFaltantes++; // Incrementar el contador de faltantes  
            } else {  
                camposPendientes.push(`<li><i class="fas fa-check" style="color: green;"></i> ${dato.nombreCampo}</li>`); // Campo completo  
            }  
        }  

        // Mostrar la información con íconos
        if (contadorFaltantes > 0) {
            mostrarInfo(`  
                Hola ${nombre || email} Bienvenid@.  
                <br><br>  
                Te quedan por completar ${contadorFaltantes} datos en:  
                <br><br>  
                1-Configuraciones  
                <br>  
                <ul>${camposPendientes.join('')}</ul>  
            `);  
            return contadorFaltantes > 0; // retorna true si hay campos pendientes  
        } else{
            return false
        }

    }

    // atualiza los datos y refresca la pagina
    async function actualizarData() {
        //console.log("Hizo click para actualizarData la data session storage");
        // Define las opciones de la solicitud
        const dataSend = { idOwner };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwToken}`
            },
            body: JSON.stringify({ dataSend }) // Incluye el cuerpo de la solicitud
        };
        try {
            // Realiza la solicitud fetch usando await
            const endpoints96 = JSON.parse(sessionStorage.getItem('endPointsIdTokensCpanel'))[96] || [];
            console.log("Qué endpoint tiene actualizarData:", endpoints96);
            const response = await fetch(endpoints96, options);

            if (!response.ok) {
                throw new Error(`Error en la solicitud desde 96: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Datos recibidos en actualizarData:', data);

            // Maneja los datos recibidos
            const { endPointsIdTokens, jwToken, dataOwner, ownerProducts, ownerPromos, ownerMensajes, basicData, informeDiario } = data.data;

            if (data.success) {
                console.log('La renovación de datos fue un éxito:', data.success);

                // Actualiza los datos en sessionStorage
                endpoints = endPointsIdTokens;
                sessionStorage.setItem('endPointsIdTokensCpanel', JSON.stringify(endPointsIdTokens));
                sessionStorage.setItem('ownerData', JSON.stringify(dataOwner));
                sessionStorage.setItem('DataOwnerEcom', JSON.stringify(dataOwner));
                sessionStorage.setItem('ownerProducts', JSON.stringify(ownerProducts));
                sessionStorage.setItem('ownerPromos', JSON.stringify(ownerPromos));
                sessionStorage.setItem('ownerMensajes', JSON.stringify(ownerMensajes));
                sessionStorage.setItem('basicData', JSON.stringify(basicData));
                sessionStorage.setItem('informeDiario', JSON.stringify(informeDiario));
                //window.location.reload();
                // Reinicia la misma URL
                window.location.href = window.location.href; // Reinicia la página en la misma URL
    //            return true; // Indicar éxito 
            } else {
                console.warn('No se pudo actualizar el sessionStorage desde 96');
                return false; // Indicar fallo
            }

        } catch (error) {
            console.error('Error al realizar la solicitud actualizarData:', error);
            return false; // Indicar fallo
        }
    }
    // solo actualiza los datos en el sessiot SIN NO refresca la apgina
    async function RefreshactualizarData() {
        console.log("Hizo click para RefreshactualizarData la data session storage");
        const endpoints96 = JSON.parse(sessionStorage.getItem('endPointsIdTokensCpanel'))[96] || [];
        // Define las opciones de la solicitud
        const dataSend = { idOwner };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwToken}`
            },
            body: JSON.stringify({ dataSend }) // Incluye el cuerpo de la solicitud
        };
        try {
            // Realiza la solicitud fetch usando await
            //console.log("Qué endpoint tiene RefreshactualizarData:", endpoints96);

            const response = await fetch(endpoints96, options);

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }

            const data = await response.json();
            //console.log('Datos recibidos en RefreshactualizarData:', data);

            // Maneja los datos recibidos
            const { endPointsIdTokens, jwToken, dataOwner, ownerProducts, ownerPromos, ownerMensajes, basicData, informeDiario } = data.data;

            if (data.success) {
                //console.log('La renovación de datos fue un éxito:', data.success);

                // Actualiza los datos en sessionStorage
                endpoints = endPointsIdTokens;
                sessionStorage.setItem('endPointsIdTokensCpanel', JSON.stringify(endPointsIdTokens));
                sessionStorage.setItem('ownerData', JSON.stringify(dataOwner));
                sessionStorage.setItem('DataOwnerEcom', JSON.stringify(dataOwner));
                sessionStorage.setItem('ownerProducts', JSON.stringify(ownerProducts));
                sessionStorage.setItem('ownerPromos', JSON.stringify(ownerPromos));
                sessionStorage.setItem('ownerMensajes', JSON.stringify(ownerMensajes));
                sessionStorage.setItem('basicData', JSON.stringify(basicData));
                sessionStorage.setItem('informeDiario', JSON.stringify(informeDiario));
                //window.location.reload();
                return true; // Indicar éxito
            } else {
                console.warn('No se pudo actualizar el sessionStorage');
                return false; // Indicar fallo
            }

        } catch (error) {
            console.error('Error al realizar la solicitud RefreshactualizarData:', error);
            return false; // Indicar fallo
        }
    }


    async function iniciarTienda() {

        const culito = RevisarDatosCompletos()
        //console.log("Entro a la función para iniciar el ecommerce", culito)
        if (culito) {
            // si es true queda en la pagina actual
            console.log("No completo los datos mínimos para abrir la tienda", culito)
            return
        } else {
            // busca el urlOwner y activarTienda()
            const urlOwner = dataOwner.urlOwner;
            window.open(`/${urlOwner}`, '_blank');
            //console.log("Completo todos los datos y ya puede abrir su tienda", culito)
            //console.log("A que URLOWNER me derivo???????????????", urlOwner)
        }
    }


    async function cotizacionesDolaresPaises(basicData) {
        if (basicData) {
                //console.log("fljnfvjkrenjrnfverjngvjoergvnjnreo", basicData)
                // Obtén la configuración de precios del dólar
                const dataConfig = basicData
                const preciosDolar = basicData.data.ConfigsOne[0].preciosDolar || dataConfig.preciosDolar || null
                //console.log("cotizacionesDolaresPaises",preciosDolar)
                const {
                    precioDolarAr, precioDolarUy, precioDolarCh, precioDolarCl, precioDolarMx,
                    precioDolarPr, precioDolarPa, precioDolarBo, precioDolarCr, precioDolarDr, precioDolarPn
                } = preciosDolar;

                // Define la cotización del dólar para cada país
                const cotizacionesDolar = {
                    "Argentina": precioDolarAr,
                    "Uruguay": precioDolarUy,
                    "Chile": precioDolarCh,
                    "Colombia": precioDolarCl,
                    "Mexico": precioDolarMx,
                    "Peru": precioDolarPr,
                    "Paraguay": precioDolarPa,
                    "Bolivia": precioDolarBo,
                    "Costa Rica": precioDolarCr,
                    "Dominican Republic": precioDolarDr,
                    "Panama": precioDolarPn
                };

                // Función para obtener la ubicación del usuario
                async function obtenerUbicacion() {
                    if (!navigator.geolocation) {
                        console.error('Geolocalización no es compatible en este navegador.');
                        return null;
                    }

                    try {
                        const position = await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject);
                        });

                        const latitud = position.coords.latitude;
                        const longitud = position.coords.longitude;
                        const apiKey = '88c66a70b2324b81a65c9059116e088c'; // Reemplaza con tu propia API key
                        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitud}+${longitud}&key=${apiKey}`;
                        
                        const response = await fetch(url);
                        const data = await response.json();
                        
                        //console.error('Geolocalización SI es compatible en este navegador.', data.results);

                        if (data.results && data.results.length > 0) {
                            const direccion = data.results[0].components;
                            const pais = direccion.country;
                            return { pais, direccion };
                        } else {
                            console.error('No se encontraron resultados para la ubicación.');
                            return null;
                        }
                    } catch (error) {
                        console.error('Error al obtener la ubicación:', error);
                        return null;
                    }
                }

                // Función para obtener la cotización del dólar según el país
                async function obtenerCotizacion() {
                    try {
                        const dataLugar = await obtenerUbicacion();
                        if (dataLugar?.pais) {
                            const cotiDolar = Number(cotizacionesDolar[dataLugar.pais]);
                            return cotiDolar;
                        } else {
                            console.error('No se pudo obtener la ubicación.');
                            return null;
                        }
                    } catch (error) {
                        console.error('Error en la obtención de ubicación:', error);
                        return null;
                    }
                }

                // Obtén y retorna la cotización del dólar
                return await obtenerCotizacion();
        }
    }


    function cerrarModalPorId(idModal) {
        // Obtener el elemento del modal por su ID
        const modalElement = document.getElementById(idModal);

        // Verificar si se encontró el modal
        if (!modalElement) {
            console.error('Modal con ID', idModal, 'no encontrado.');
            return;
        }

        // Mostrar en consola el estado del modal
        console.log('Modal encontrado:', idModal, modalElement);

        // Intentar crear una instancia del modal de Bootstrap
        try {
            modalElement.innerHTML = ""
            // Crear una nueva instancia del modal y luego cerrarlo
            const modal = new bootstrap.Modal(modalElement);
            modal.hide();
            console.log('Modal cerrado:', modalElement);
        } catch (error) {
            console.error('Error al cerrar el modal:', error);
        }
    }


    // esta funcion sire para borrar el local storage cuando salis de la aplicasion
    async function borrarsessionStorage(exit) {
        console.log("eeeeeeeeeeeeeeeeeeeEEEEEEEEEEEEEEEEEEEEEEEEentro a borrar todo")
        // Verifica si se debe mostrar el mensaje de éxito

        // Espera 1 segundo antes de eliminar los items del sessionStorage

            // Lista de claves a eliminar
            const keysToRemove = [
                "DataOwnerEcom",
                "datosBasicos",
                "endPointsIdTokens",
                "endPointsIdTokensCpanel",
                "ownerEcom",
                "dataOwner",
                "dataOwnerEcom",
                "clienteEcomm",
                "pedidoCarritoPendientePago",
                "basicData",
                "dataPayOSes",
                "jwtToken",
                "idEndpoints",
                "jwTokenOwner",
                "ownerData",
                "ownerMensajes",
                "ownerProducts",
                "ownerPromos",
                'informeDiario',
                'okInfo'
            ];

            // Iterar sobre las claves y eliminarlas si existen
            keysToRemove.forEach(key => {
                // Comprobar si la clave existe antes de eliminar
                if (sessionStorage.getItem(key) !== null) {
                    sessionStorage.removeItem(key);
                }
            });

        
        if (exit) {
            vuelvePronto("Vuelve pronto");
            // Redirigir a la página de inicio después de 2 segundos
            setTimeout(() => {
                window.location.href = "/";
            }, 3000); // 2000 milisegundos = 2 segundos
        }
    }


    // funcion que guarda el infoDiario en la BD
    async function infoDiario(datInfo) {
        // console.log("00000 Entro a enviar la info al server ", datInfo.idInfo)
        // console.log("111 Entro a enviar la info al server y verifica que hay en lastInfoSessionStorage", lastInfo)
        
        //await renderizarInfoDiario(idOwner)

        let { idInfo, Date, positivo, infoMensaje, infoMmensagem, } = datInfo

        datInfo.idOwner = idOwner

        // 1ero busca entre los infoDiarios ya publicados, y los que no los envia a publicar
        const datInfoFilter = lastInfo.some(e => e.idInfo === idInfo);
        // console.log("2222Este mensaje esta publicado en el informe????",datInfoFilter)

        if (datInfoFilter === false) {
            console.log("Se carga un nuevo iformer",)
            // Los que no estan publicados lo envia a la BD
            try {
                const dataInfoOptions = {
                    method: 'POST', // Método de la solicitud
                    headers: {
                        'Content-Type': 'application/json' // Tipo de contenido de la solicitud
                    },
                    body: JSON.stringify(datInfo), // Convertir el objeto de datos a formato JSON
                    headers: {
                        'Authorization': `Bearer ${jwToken}`
                    }	 
                };
                //console.log("Que enpont buscar info genera???????????",endpoints[31])
                const response = await fetch(`${endpoints[31]}`, dataInfoOptions);
                const data = await response.json(); // Convertir la respuesta a JSON
                if (data.success) {
                    console.log("Se publicaron correctamente", data.message)
                    return data.infosMensajes
                } else {
                    console.log("NO se publicaron correctamente", data.message)
                }
            } catch (error) {
                console.error('Error en la solicitud Fetch:', error);
            }
        }
        else{
            //console.log("333333 Este informe ya esta cargador",)
        }
        return
    }

    // Consulta los informes diarios con el server y los renderiza
    async function consultaInfoDiario(idOwner) {
        const idOwner2 = idOwner
        const puto = ""
        const dataPuto = {idOwner2, puto}
        //console.log("CCCCCCCConsulta 22222222222 Entro a consultaInfoDiario info al server", idOwner2)
        try {
            const dataInfoOptions = {
                method: 'POST', // Método de la solicitud
                headers: {
                    'Content-Type': 'application/json' // Tipo de contenido de la solicitud
                },
                body: JSON.stringify( dataPuto ), 
                headers: {
                    'Authorization': `Bearer ${jwToken}`
                }	 
            };
            const response = await fetch(`${endpoints[33]}`, dataInfoOptions);
            const data = await response.json(); // Convertir la respuesta a JSON
            if (data.success) {
                // console.log("Desde el Server Se obtuvo correctamente los informes", data)
                return data.ultimoInforme
            } else {
                //console.log("NO Se obtuvo correctamente los informes", data.message)
            }
        } catch (error) {
            //console.error('Error en la solicitud Fetch:', error);
        }
    }
    async function renderizarInfoDiario(idOwner, a) {
        console.log("Se solicito informacion")
        if (a) {
            sessionStorage.removeItem("okInfo")
            console.log("Se solicito SI mostrar la informacion")
        }
        const okInf = JSON.parse(sessionStorage.getItem("okInfo"))
        if (okInf === "on") {
            console.log("Se solicito NO mostrar mas la informacion")
            return
        }
        //await mostrarModalLoading()
        //console.log("consulta 11111111 Entro el idOwner???",idOwner)
        setTimeout(async() => {
            // revisa si tiene alguuna cofiguracion faltante y si NO tiene promociones emitidas
            /******************************************************************************** */
            const cheqDataFaltante = RevisarDatosCompletos()
            if (cheqDataFaltante) {
                return
            }
            if (
                !cheqDataFaltante && 
                (!ownerPromos || ownerPromos.length === 0 || ownerPromos.length === undefined)
            ) {
                const modalInfo = document.getElementById('informacionPlus');
                modalInfo.innerHTML = "";
                mostrarExito(`
                    <br>
                    ${nombre} has completado las configuraciones básicas. <br>
                    <br>
                    En configuraciones puedes agregar tus redes sociales, detalles sobre tu negocio y mas. <br>
                    <br>
                    Para continuar, entra en "Marketing" añade una promoción y este mensaje no aparecerá más.
                `);
            }
            /********************************************************************************************* */
            const infoDiario = await consultaInfoDiario(idOwner) || 0
            // lo guarda en el seesion
            const informeDiario = infoDiario
            sessionStorage.getItem('informeDiario', JSON.stringify(informeDiario));

            ocultarModalLoading()

            if (infoDiario.length >= 1) {
                // Ordenar la información por fecha, de más reciente a más antigua
                infoDiario.sort((a, b) => {
                    const parseDate = (dateString) => {
                        const [day, month, yearAndTime] = dateString.split('/');
                        const [year, time] = yearAndTime.split(' ');
                        return new Date(`20${year}-${month}-${day}T${time}`);
                    };
                
                    return parseDate(b.Date) - parseDate(a.Date);
                });
                //console.log("UUUUUUUUUUUUUULTIMOOOOOOOOOOOOOOOOOOOOQue infolist existe??????????", infoDiario);
                let listaCompleta = '<ul class="list-group" style="background: transparent; padding: 0; list-style-type: none;">'; // Iniciamos la lista
                infoDiario.forEach((info, index) => {
                    // Ícono según el valor de "positivo"
                    const icon = info.positivo 
                        ? '<i class="fas fa-check-circle text-success"></i>' 
                        : '<i class="fas fa-exclamation-circle text-danger"></i>';
                
                    // Construcción del ítem de la lista
                    listaCompleta += `
                    <li class="d-flex align-items-left" style="background: transparent; border: none; padding: 0.5rem; justify-content: left;">
                        <span class="delete-info" style="cursor: pointer; margin-right: 10px; font-size: 0.8rem;" title="Eliminar informe">
                            <i class="fas fa-times-circle text-danger"></i>
                        </span>
                        ${icon}
                        <div style="margin-left: 10px; text-align: left;">
                            <strong>En la fecha y hora ${info.Date}</strong><br>
                            ${info.infoMensaje}
                            <p data-id="${info.idInfo}" hidden></p> <!-- Cambiado a data-id -->
                        </div>
                    </li>
                `;
                
                });
                // Cerramos la lista
                listaCompleta += '</ul>';
            //console.log("Cual es la lista que armo pare le informe??????", listaCompleta)
                // Pasamos la lista completa a la función mostrarInfo
                //ocultarModalLoading()
                    mostrarInfo(listaCompleta, idOwner);
                    return true
            } else {
                SinInfo = `<h4>
                    En este momento, no tienes informes disponibles.
                    <br>
                    Te invitamos a crear una promoción y compartir el enlace en todas tus redes sociales. 
                    <br><br>
                    Además, considera contratar nuestros servicios de Marketing Digital y Community Manager para potenciar tus ventas.
                </h4>`;
            
            
                mostrarInfo(SinInfo);
                return false
            }

        }, 0); // Espera de 2 segundos
    }


    function generarIdAleatorio(longitud = 8) {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let resultado = '';
        for (let i = 0; i < longitud; i++) {
            resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return resultado;
    }


    // Funciones para detectar hackeos
    function borrarHtml() {
        // Limpiar consola para asegurarse de que no haya nada en ella
        console.clear();

        // Esperar un tiempo breve antes de cambiar el contenido de la página
        setTimeout(function() {
            // Crear el contenido de la advertencia en formato de tarjeta (card) con cubo giratorio

            // Reemplazar todo el contenido del <html> principal
            document.documentElement.innerHTML = warningCard;

            // Manejo de la rotación continua del cubo
            let rotationY = 0; // Inicializa la rotación en Y
            const cube = document.getElementById('cube');

            // Función para girar el cubo
            function rotateCube() {
                rotationY += 2; // Incrementa el ángulo de rotación
                cube.style.transform = `rotateY(${rotationY}deg)`; // Aplica la rotación
            }

            // Ejecutar la rotación cada 50 ms
            setInterval(rotateCube, 50); 

        }, 500);  // Un pequeño retraso antes de mostrar la advertencia

        setTimeout(function() {
            // Redirigir a otra página (por ejemplo, Google)
            window.location.href = "https://www.google.com";
        }, 20000);  // Un retraso de 20 segundos antes de la redirección
    }
    function detecHaker() {
        

        document.addEventListener('keydown', function(event) {
            // Mostrar en consola la tecla presionada
            console.log(`Tecla presionada: ${event.key}`);
            
            // Alerta si se presiona F12
            if (event.key === 'F12') {
                mostrarAlerta('¡ALERTA! Has presionado F12, lo que puede abrir la herramienta de inspección. ¡Cualquier intento de robo de datos es un delito grave y penado por la ley!');
            // agregar borrar el sessionStorage
            borrarsessionStorage();
            setTimeout(() => {
                borrarsessionStorage();
                borrarHtml()
            }, 2000); // Llama a la función después de 2 segundos

            setTimeout(() => {
                borrarsessionStorage();
                borrarHtml()
            }, 10000); // Llama a la función después de 10 segundos

            }
        });
        
        // Función para detectar clic derecho
        document.addEventListener('contextmenu', function(event) {
            event.preventDefault(); // Prevenir el menú contextual por defecto
            // Mensaje en la consola al hacer clic derecho
            console.log('Se hizo clic derecho en la página.');
            // Alerta alarmante cuando se intenta abrir la herramienta de inspección
            mostrarAlerta('Por temas de seguridad, este boton a sido anulado');
            // agregar borrar el sessionStorage
            setTimeout(() => {
                borrarsessionStorage();
                borrarHtml()
            }, 2000); // Llama a la función después de 2 segundos

            setTimeout(() => {
                borrarsessionStorage();
                borrarHtml()
            }, 10000); // Llama a la función después de 10 segundos
            
        });
        
    }
    function detectConsol() {
        let devToolsOpen = false;
        const checkDevTools = () => {
            const startTime = performance.now();
            console.clear();
            // Este console.log está aquí para medir el tiempo que tarda en ejecutarse y detectar DevTools
            console.log('%c ¡ATENCIÓN! \nHas activado las herramientas de desarrollador (F12). \nEl acceso no autorizado a esta sección puede ser considerado un intento de manipulación o robo de datos, lo cual es una infracción grave conforme a la ley. \nPara evitar sanciones o la suspensión de tu cuenta, te recomendamos cerrar esta consola de inmediato.', 'color: white; background: red; font-size: 30px; font-weight: bold; padding: 20px; text-align: center; width: 100%;');
            // Aquí puedes agregar cualquier código adicional que desees ejecutar
            ejecutarCodigoDeSeguridad();
            
            const endTime = performance.now();
            
            // Si la diferencia de tiempo es significativa (mayor a 100ms), se asume que DevTools está abierta
            if (endTime - startTime > 100) {
                if (!devToolsOpen) {
                    // Si antes estaba cerrado y ahora se abre
                    devToolsOpen = true;
                    console.log('%c ¡ADVERTENCIA! La consola de desarrollo ha sido abierta. \nEl acceso no autorizado puede ser considerado una infracción grave.', 'color: white; background: red; font-size: 30px; font-weight: bold; padding: 20px; text-align: center; width: 100%;');
                    
                    // Aquí puedes agregar cualquier código adicional que desees ejecutar
                    ejecutarCodigoDeSeguridad();
                    //borrarHtml()
                }
            } else {
                if (devToolsOpen) {
                    // Si antes estaba abierta y ahora se cierra
                    devToolsOpen = false;
                    console.log('La consola de desarrollo se ha cerrado.');
                }
            }
        };

        // Función que se ejecutará cuando las herramientas de desarrollador estén abiertas
        const ejecutarCodigoDeSeguridad = () => {
            // Borrar sessionStorage o cualquier otra acción de seguridad
            borrarsessionStorage(); // Asegúrate de que esta función esté definida
            //borrarHtml()
            console.log('%c Session Storage y HTML borrado por razones de seguridad.', 'color: white; background: blue; font-size: 20px; padding: 10px;');
        };

        // Verifica cada segundo si la consola está abierta o cerrada
        setInterval(checkDevTools, 1000);
    }



    //funciopn del ojito para ver el Password
    function togglePassword(id) {
        //console.log("Entro aqui2")
        var input = document.getElementById(id);
        if (input.type === "password") {
            input.type = "text";
        } else {
            input.type = "password";
        }
    }


	async function dominioUrl() {
		const dataOwner = JSON.parse(sessionStorage.getItem('ownerData')) || null;
		const basicdata = JSON.parse(sessionStorage.getItem('datosBasicos')) || null;
		console.log("Entro a buscar el domioURL en index Ecommerce")
		let dominio
		if (dataOwner.dominio) {
			dominio = dataOwner.dominio;
			// Si necesitas redirigir a la URL almacenada en 'dominio' después de recargar, puedes hacer lo siguiente:
			//console.log("Entro por tiene dominio", dominio)
			return dominio;
		} else {
			dominio = basicdata.data.ConfigsOne[0].urlServer + dataOwner.urlOwner;
			// Si necesitas redirigir a la URL almacenada en 'dominio' después de recargar, puedes hacer lo siguiente:
			console.log("Entro por NO tiene dominio desde el index ecommerce linea 3274", dominio)
			return dominio;
		}
	}