
const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const shortid = require('shortid');
const mongoose = require('mongoose'); // Asegúrate de que Mongoose esté importado
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const bodyParser = require('body-parser');
router.use(bodyParser.text());
const crypto = require('crypto');
const os = require('os');
// Middleware para analizar cuerpos urlencoded (formularios)
// router.use(express.urlencoded({ extended: true })); // o app.use(bodyParser.urlencoded({ extended: true }));
// Middleware para analizar cuerpos de solicitud JSON
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));
//helpers
const nodemailer = require('nodemailer');
const cunatos = []

// Determinar el sistema operativo
const isWindows = os.platform() === 'win32';

//auntenticador
const jwt       = require('jsonwebtoken');
// codificador
const bcrypt    = require('bcrypt');

//models
const User         = require('../../models/User');
const Productos    = require('../../models/Productos');
const Promociones  = require('../../models/promoDesc');
const ConfigGrl    = require('../../models/configsGrl');
const Mensajes     = require('../../models/messages');
const EcommUser    = require('../../models/usuarioEcommerce');
const pushMess     = require('../../models/pushMes');

// aqui se guardan los enpointokens de Cpanel
//let endpointTokensArrayCpanel = []
let urlServer = {}


const {compararFechas,eliminarImagenes, sendMail, guardarImagen, guardarImagenNews, guardarFondo, guardarMensajes, enpointsFactory} = require('../funcionesymas');
const {saveOrUpdateConfig}= require('../configGlrs');


// Middleware para verificar el token JWT
const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.query.token;
    //console.log("Entro a verificar token", authHeader);

    if (authHeader) {
        let token;
        if (authHeader.startsWith('Bearer ')) {
            const token2 = authHeader.split(' ')[1]; // Extrae el token eliminando el prefijo "Bearer"
            function eliminarComillas(cadena) {
                return cadena.replace(/['"]/g, '');
            }
            token = eliminarComillas(token2)
            //console.log("Que token extrajo?", token);
        } else {
            token = authHeader; // Usa el token directamente si no tiene el prefijo "Bearer"
        }

        jwt.verify(token, 'Sebatoken223', async (err, decoded) => {
            //console.log("Que datos encontró en decoded", decoded);
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    //console.log("Tu sesión ha expirado, logeate nuevamente");
                    return res.status(400).json({ message: `Tu sesión ha expirado, logeate nuevamente ${err}` });
                }
                //console.log("Token inválido");
                return res.status(400).json({ message: `Token inválido ${err}` });
            }
            const e = decoded.email
            //console.log("kelfñjnefjkgnjkefngjioefngjn", e, decoded)
            const dataOwner = await User.findOne({email:e});
            const idOwner   = dataOwner._id
            decoded.idOwner = idOwner
            req.user = decoded; // Guarda los datos decodificados en la solicitud para su uso posterior
            next(); // Continúa a la siguiente función middleware
        });
    } else {
        //console.log("No autorizado");
        res.sendStatus(400); // No autorizado
    }
};


function GenIEndpoints(urlServer) {
    // aqui se generan los distintos enpoints
    const endpointArray = []
    const generateRandmoString = (length = 333) => Array.from(crypto.getRandomValues(new Uint8Array(length)), byte => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[byte % 62]).join('');
    for (let i = 0; i < 200; i++) {
        const formEndpoint = (generateRandmoString().toString());
        const endpointTokenMasUrlServer = `${urlServer}${formEndpoint}`
        endpointArray.push(endpointTokenMasUrlServer);
    }
    return endpointArray
}

// ruta para enviar la fronen de la landing page los endpoint hay que meterle alguna seguridad
router.get(`/dataInfoTokensEtc`,  async (req, res) => {
    console.log("Entro al server a buscar la info de los productos y del owner/dataInfoTokensEtc", req.body);
    try{
        // BUSCA TODOS LOS URLoWNERS
        const configGrl = await ConfigGrl.findOne();
        //console.log("Que urlOwwners encontro??????", configGrl)
        urlServer = configGrl.urlServer
        
        let endpointTokensArrayCpanel = await GenIEndpoints(urlServer)

        console.log("Cuantos enpoints genero",endpointTokensArrayCpanel.length )
        const dataDatera = {urlServer}

        // dispara las rutas de los urlOwners
        if (configGrl.urlsOwners.length >= 1 ) {
            urls(configGrl)
        }
        // dispara las rutas de los urlOwners
        if (configGrl.urlsPromos.length >= 1 ) {
            //console.log("paso el filtro de urlPromos")
            urlsPromos(configGrl)
        }

        //dispara las rutas codificadas
        await registerEndpoints(endpointTokensArrayCpanel, verificarToken)

        setTimeout(() => {
            res.status(200).json({
                success: true, 
                endPointsIdTokens: endpointTokensArrayCpanel, 
                data: dataDatera 
            });
        }, 2000); // 2000 milisegundos = 2 segundos
        

    } catch (error) {
        console.error('Error en inicio de la pagina: /dataInfoTokensEtc', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }

});


// Ruta para confirmar la inscripción desde el email de comprobacion hay que meterle seguridad
router.get('/confirmaInscripcion', async (req, res) => {
    try {
        const id = req.query.id; // Accede al parámetro 'id' de la consulta
        console.log(`ID recibido en la consulta: ${id}`);
        const usuarioBloqueado = false
        const dataUser = await User.findByIdAndUpdate(id, {usuarioBloqueado: usuarioBloqueado}, {new:true} );
        const configGrl = await ConfigGrl.findOne();
        //console.log("Que urlOwwners encontro??????", configGrl)

        const urlServer = configGrl.urlServer
        
        if (dataUser) {
            // El usuario fue encontrado
            return res.status(200).send(`
                <script>
                    window.location.href = '${urlServer}';
                    mostrarExito('Usuario aprobado.');
                </script>
            `);
        } else {
            // El usuario no fue encontrado
            return res.status(404).send(`
                <script>
                    window.location.href = '${urlServer}';
                    mostrarAlerta('Usuario no aprobado.');
                </script>
            `);
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(`
            <script>
                window.location.href = '${urlServer}';
                alert('Error en el servidor.');
            </script>
        `);
    }
});

    // Arma las rutas de los urlOwners
    async function urls(configGrl) {
        const arrayUrls = configGrl.urlsOwners
        //console.log(`Encontro los siguientes urlOwners`,arrayUrls);
        arrayUrls.forEach(urlObj => {
            const urlOwner = urlObj.urlOwner; // Asegúrate de que este sea el nombre correcto del campo en tus documentos
            //console.log(`****Entro en el forEach a generar el primer urlOwner /${urlOwner}:`);
            // Ruta GET para renderizar la página sin datos adicionales
            router.get(`/${urlOwner}`, (req, res) => {
                try {
                    //console.log(`Entró en GET para /${urlOwner}`);
                    res.sendFile(path.join(__dirname, '../../views/indexEcomm.html')); // Enviar el archivo HTML
                } catch (error) {
                    console.error(`Error en el servidor para /${urlOwner} (GET):`, error);
                    res.status(500).json({ success: false, error: 'Error en el servidor' });
                }
            });
        });
    }
    // Arma las rutas de las promociones
    async function urlsPromos(configGrl) {
        const arrayUrls = configGrl.urlsPromos
        //console.log(`Encontro los siguientes urlsPromos`,arrayUrls);
        arrayUrls.forEach(urlObj => {
            const urlPromos = urlObj.urlPromo; // Asegúrate de que este sea el nombre correcto del campo en tus documentos
            //console.log(`Entro en el forEach a generar el primer urlsPromos ${urlPromos}:`);
            // Ruta GET para renderizar la página sin datos adicionales
            router.get(`${urlPromos}`, (req, res) => {
                try {
                    //console.log(`************************Entró en GET para las url de las promos /${urlPromos}`);
                    res.sendFile(path.join(__dirname, '../../views/indexEcomm.html')); // Enviar el archivo HTML
                } catch (error) {
                    console.error(`Error en el servidor para /${urlOwner} (GET):`, error);
                    res.status(500).json({ success: false, error: 'Error en el servidor' });
                }
            });
        });
    }


async function registerEndpoints(endpointTokensArrayCpanel, verificarToken) {

    let enpointTokens = endpointTokensArrayCpanel
    

    // define los puntos de acceso url

    function urlPoint(numPoint) {
        const endpointTokensArrayString22 = enpointTokens[numPoint]
        const endpointTokensArray22 = endpointTokensArrayString22.split(urlServer);
        const endpoint22 = `/${endpointTokensArray22[1]}`
        //console.log("Que numero de Endpoint solicitan????",urlServer, numPoint, endpoint22)
        cunatos.push(endpoint22)

        return endpoint22
    }

    
    // Definir el endpoint que verificará el token
    function generateRandomCode(length) {
        return crypto.randomBytes(length / 2).toString('hex');
    }
    const randomCode = generateRandomCode(128);
    router.get('/cPanel.html', verificarToken, (req, res) => {
        //console.log(`Ruta para SOLO cPanel`);
        const redirectURL = `/panelControl/${randomCode}`;
        res.set('Cache-Control', 'no-store');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.status(302).setHeader('Location', redirectURL).end();
    });
    router.get('/panelControl/:code', (req, res) => {
        const { code } = req.params;
        if (code === randomCode) {
            // El código es válido, puedes redirigir al usuario a la página deseada
            res.sendFile(path.join(__dirname, '..', '..', 'views', 'cPanel.html'));
        } else {
            // El código no es válido, puedes mostrar un mensaje de error o redirigir a una página de error
            //res.status(404).send('Código inválido');
            res.redirect("/")
        }
    });


    // 001 INICIO OBTENCION DE DATOS 
    //console.log(`que endpoint fabrico en el server para 96 ${urlPoint(96)}`)
    router.post(urlPoint(96), [verificarToken], async (req, res) => {
        const {idOwner} = req.body.dataSend
        console.log(`11111111*************Entro a refrescar información data`, req.body)
        // datos del owner
        const dataOwner = await User.findById(idOwner);
        // Verifica si se encontró el usuario
        if (!dataOwner) {
            throw new Error('Usuario no encontrado');
        }
        // Convertir el documento a un objeto plano y eliminar las propiedades no deseadas
        const { password, realPass, ...cleanedData } = dataOwner.toObject();
        
        //console.log("Salio real y pass???????",cleanedData); // Aquí tienes el objeto sin password y realPass
        
        const basicData = await ConfigGrl.findOne();
        // datos de los productos del owner
        const ownerProducts = await Productos.find({idCliente:idOwner});
        // obtiene datos de las prmociones
        const ownerPromos = await Promociones.find({idOwner:idOwner});
        // obtiene datos de los mensajes
        const ownerMensajes = await Mensajes.find({idOwner:idOwner});
        // informes diarios
        const informeDiario = dataOwner.lastInfo

        let endPointsIdTokens = GenIEndpoints(urlServer)

        console.log("Que enpoints esta recargadno desde 96?????????", endPointsIdTokens.length)

        const jwToken = jwt.sign({ email: dataOwner.email }, 'Sebatoken223', { expiresIn: '60m' });
        
        //Re inicializa todas las rutas codificadas del server
        await registerEndpoints(endPointsIdTokens, verificarToken)

        const data = {endPointsIdTokens, jwToken, dataOwner:cleanedData, ownerProducts, ownerPromos, ownerMensajes, basicData, informeDiario };

        //console.log("que datos envia al fronen nuevos de refresco", data)
        res.status(200).json({ success: true, data });
    });


    // 02 SIGNUP desde INSCRIPCION RAPIDA CON COMISION DESDE LANDING PAGE
    //console.log(`que endpoint fabrico en el server para signUP ${endpoint00}`)
    router.post(urlPoint(0), [], async (req, res) => {
        const { email, password, confirmPassword, tyc} = req.body;
        console.log("***********Que info trae a /nuevoUsuario/TiendaFacil ");

        try {
            // Aquí deberías agregar la lógica para almacenar el usuario en tu base de datos.
            if (password !== confirmPassword) {
                console.error('los password no corresponden:', error);
                res.status(400).json({ message: 'Los password no corresponden' });
                return
            }
            const cheqMail = await User.findOne({email:email});
            if (cheqMail) {
                res.status(400).json({ message: 'Este email ya esta registrado.' });
                return
            } 

            const transportEmail = null

            const Blogs = []
            const clientes = []
            const numCel = []
            const Ventas = []
            const linksredesSociales = {}
            const desingShop = "No tiene"
            const statusInscrip = "Incompleto"
            const usuarioBloqueado = true
            const realPass = password
            const pathLogo = "/images/usuario.png"
            const tipoMembresia = "basic"
            const emails = []
            const fondoPantalla = "No tiene"
            const urlOwner = "sebastian.paysse@tbs-it.net"
            const dominioOwner = "No tiene"
            emails.push({emailOwner:email})
            const direcciones = []
            const mediasDPagoCobro = {}
            const quienesSomos = {}
            const mostrarPromoPPrin = true

            const dataCofig = await saveOrUpdateConfig()
            const ArTokenPublicMP = dataCofig.ArTokenPublicMP

            const newUser = new User({cheqDocument:false,ArTokenPublicMP, desingShop, usuarioBloqueado, tyc, email, password, statusInscrip, transportEmail, emails, Blogs, clientes, numCel, Ventas, linksredesSociales, mediasDPagoCobro, realPass, pathLogo, tipoMembresia, urlOwner, urlServer, direcciones, quienesSomos, dominioOwner, fondoPantalla, cheqDataFaltante:true }, mostrarPromoPPrin);

            newUser.password = await newUser.encryptPassword(password);
            await newUser.save();
            const id = newUser._id;

            // Enviar un email para continuar con la inscripción
            const mensaje = `
                <div align="center" style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px; border-radius: 10px;">
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">Gracias por inscribirte enusatiendafacil.com donde vendes más rápido.</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">Haz clic en el botón de abajo y activaremos tu cuenta.</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">Volverás a la pagina de TiendaFacily deberás logearte <br> Gracias!</p>
                    <a href="${urlServer}confirmaInscripcion?id=${id}" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin-top: 20px; transition: background-color 0.3s ease;">Activar cuenta</a>
                </div>
            `;
            const subjectOwner = `Bienvenido a usatiendafacil.com, completa tu inscripción`;
            let Consulta = false
            let otraData = {} 
            otraData.Consulta
            const dataEnviarEmail = {transportEmail, reclamo: false, enviarExcel: false, emailOwner: email, emailCliente: null, numCelCliente: null, numCelOwner: null, mensaje, codigoPedido: null, nombreOwner: null, nombreCliente: null, subjectCliente: null, subjectOwner, otraData, logoOwner: null, cancelaEnvio: false, pedidoCobrado: false, quedaUno: false, product: false, inscripcion : true};

            await sendMail(dataEnviarEmail)
            res.status(200).json({ message: 'Se te registro con éxito, se te envió un email para activar tu membresía, revisa tu casilla de email "spam" y pon nuestro email en deseados.' });

        } catch (error) {
            console.error('Error interno del servidor:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
        return
    });

    // 03 SIGNIN ingresar a TiendaFacil
    //console.log("que enpoint token del signIn encontro en el server?? endpoint22",endpointTokensArray22, );
    router.post(urlPoint(22), [], async (req, res) => {
        const ipCliente = req.ip || req.connection.remoteAddress;
        console.log("Llega algo desde ingresar de forma MANUAL ", req.body);
            try {
                const { email, password, ip } = req.body;

                const lasDateInfo = new Date().toISOString(); // Obtiene la fecha y hora actual en formato ISO
                const dataOwner = await User.findOneAndUpdate(
                    { email },                    // Criterio de búsqueda
                    { lastUpdated: lasDateInfo }, // Objeto de actualización
                    { new: true }                // Devolver el documento actualizado
                );

                
                // Verifica si se encontró el usuario
                if (!dataOwner) {
                    res.status(401).json({ success: false, message: "No se encontró ningún cliente, revise su Email-Usuario" });
                    console.log("Email no encontrado o incorrecto");
                    return;
                }
                
                // Convertir el documento a un objeto plano y eliminar las propiedades no deseadas
                // const { password: _, realPass: __, ...cleanedData } = dataOwner.toObject();
                const { password: _,  ...cleanedData } = dataOwner.toObject();
                //console.log("Salio real y pass SIGNIN???????", cleanedData); // Aquí tienes el objeto sin password y realPass
                

                //console.log("Llega algo desde dataOwner de forma MANUAL ", dataOwner);
                const idOwner    = dataOwner._id
                let ownerPromos  = {}
                const ownerProms = await Promociones.find({idOwner:idOwner});
                if (ownerProms.length >= 1) {
                    ownerPromos = ownerProms
                }
                let ownerMensajes  = {}
                const ownerMensaje = await Mensajes.find({idOwner:idOwner});
                if (ownerMensaje.length >= 1) {
                    ownerMensajes = ownerMensaje
                }
                //console.log("Que datos encontro?", ownerMensajes)
                if (dataOwner.usuarioBloqueado) {
                    res.status(401).json({ success: false, message: "Debe ingresar a su casilla de correos y validar la cuenta" });
                    console.log("Debe ingresar a su casilla de correos y validar la cuenta");
                    return            
                }

                //console.log("Que cliente Ecomm encuentra", idOwner);
                const basicData = await ConfigGrl.findOne()

                if (dataOwner) {
                    // Aquí puedes verificar la contraseña de manera segura utilizando técnicas de hash y sal
                    // En este ejemplo, simplemente comparamos las contraseñas en texto plano (lo cual NO es seguro en un entorno de producción)
                    if ( password) {

                        // Supongamos que tienes el hash de la contraseña almacenado en la base de datos
                        const hashedPasswordFromDatabase = dataOwner.password; // Obtén el hash de la contraseña del usuario desde la base de datos
                        
                        // Supongamos que el usuario proporciona su contraseña durante el inicio de sesión
                        const userProvidedPassword = password; // La contraseña que el usuario proporciona durante el inicio de sesión
                        
                        // Compara el hash de la contraseña almacenada en la base de datos con la contraseña proporcionada por el usuario
                        bcrypt.compare(userProvidedPassword, hashedPasswordFromDatabase, async function(err, result) {
                            console.error('Entro a BCRYPT',);
                            if (err) {
                                console.error('Error al comparar contraseñas:', err);
                                // Manejar el error adecuadamente
                            } else {
                                if (result) {
                                    // La contraseña es correcta, procede con el inicio de sesión
                                    console.log('Contraseña correcta. Inicio de sesión exitoso.');
                                    // Generar el token JWT con la información del usuario
                                    const jwToken = jwt.sign({ email: dataOwner.email }, 'Sebatoken223', { expiresIn: '60m' });
                                    const ownerProducts = await Productos.find({idCliente:idOwner});
                                    const data = { jwToken, dataOwner:cleanedData, ownerProducts, ownerPromos, ownerMensajes, basicData };

                                    res.status(200).json({ success: true, data });

                                    //console.log("Encontró un cliente Ecommerce y se envio la data al Frontend", data);
                                    return
                                } else {
                                    // La contraseña es incorrecta, muestra un mensaje de error al usuario
                                    console.log('Contraseña incorrecta. No se pudo iniciar sesión.');
                                    res.status(401).json({ success: false, message: "Contraseña incorrecta" });
                                    console.log("Contraseña incorrecta");
                                    return            
                                }
                            }
                        });

                    } else {
                        res.status(401).json({ success: false, message: "Contraseña incorrecta" });
                        console.log("Contraseña incorrecta");
                    }
                } else {
                    res.status(404).json({ success: false, message: "No se encontró ningún cliente revise su Email-Usuario" });
                    console.log("No se encontró ningún cliente Ecommerce");
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(400).json({ success: false, message: "El servidor No encontro el usuario revise su email y password" });
            }
    });
    


    // 04 para editar los datos del Owner generales
    router.post(urlPoint(55), [verificarToken], async (req, res) => {
        console.log(`llego al BACKEND que datos obtiene para editar`, req.body);
        //const data          = JSON.parse(req.body)
        const data          = req.body
        const idOwner       = data.idOwner;
        const nombre        = data.nombre;
        const apellido      = data.apellido;
        const ecommerceName = data.ecommerceName;
        const tipoDocu      = data.tipoDocu;
        const numDocu       = data.numDocu
        const numDocuFiscal = data.numDocuFiscal;
        const tipoDocuFiscal= data.tipoDocuFiscal;

        // agregar el urlOwner
        function generateUrl(ecommerceName) {
            // Asegurarse de que ecommerceName sea un string
            if (typeof ecommerceName !== 'string') {
                throw new Error('El nombre del ecommerce debe ser un string');
            }
        
            // Convertir a minúsculas y eliminar espacios
            let urlString = ecommerceName.toLowerCase().replace(/\s+/g, '');
        
            // Eliminar caracteres especiales
            urlString = urlString.replace(/[^\w\s]/gi, '');
        
            return `${urlString}`;
        }
        
        // Ejemplo de uso
        const urlOwner = generateUrl(ecommerceName);
        //console.log("que urlOwner genero??????????",urlOwner); // Output: /urlsubdireccion/ejemplo-de-e-commerce

        // aqui lo agrega a todos los urlsOwners de tiendaYa!
        try {
            //aqui agrega el urls owner a la lista de urlsOwners en configuracion
            const configGrl = await ConfigGrl.findOne({ idConfig: "sebaalfiEduNatyTere" });
            if (configGrl) {
                const dataUrl = { urlOwner, idOwner };
                // Verifica que urlOwner y idOwner están definidos
                if (urlOwner && idOwner) {
                    configGrl.urlsOwners.push(dataUrl);
                    await configGrl.save();
                } else {
                    console.error('urlOwner o idOwner no están definidos');
                }
            } else {
                console.error('Configuración no encontrada');
            }

            const updatedUser = await User.findByIdAndUpdate(
                idOwner,
                { nombre, apellido, ecommerceName, urlOwner, tipoDocu, numDocu, numDocuFiscal, tipoDocuFiscal },
                { new: true }
            );

            if (!updatedUser) {
                console.log("Usuario no encontrado");
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            console.log("Usuario actualizado:", updatedUser);
            res.status(200).json({ message: "Los datos han sido correctamente actualizados", user: updatedUser });
        } catch (error) {
            console.error("Error al actualizar la información del usuario:", error);
            res.status(500).json({ message: "Error al actualizar la información del usuario", error });
        }
    });

    // editar el logo dle owner
    router.post(urlPoint(43), [verificarToken], async (req, res) => {
        console.log(`que datos obtiene para editar el logo`, req.body);
        console.log(`que imagen viene`, req.files);
        const idOwner = req.body.idOwner;
        const urlServer = req.body.urlServer;
        const empresa = req.body.empresa 

        try {
            // Enviar la imagen al servidor
            const cheq = await guardarImagen(req.files.imagen, empresa, idOwner);
            
            // Actualizar la ruta de la imagen en la base de datos
            const { rutaURL } = cheq;
            const rutaRelativa = `${urlServer}img/${rutaURL}`;
            
            //console.log("Imagen del cliente subida a la carpeta pathlogo**********************************?", rutaRelativa);

            await User.findByIdAndUpdate(idOwner, { pathLogo: rutaRelativa });
            
            // Responder con éxito
            res.status(200).json({ success: true, data: "Imagen guardada correctamente" });
        } catch (error) {
            // Manejar errores
            console.error("Error en carga de imagen:", error);
            res.status(500).json({ success: false, data: "Imagen no guardada correctamente" });
        }
    });


    // 06 para agregar/cambiar datos del owner
    router.post(urlPoint(14), [verificarToken], async (req, res) => {
        console.log(`888888888888888que datos obtiene para editar`, req.body);
        let responseData = {}
        //console.log("Entro a cambiar numero celular");
        if (req.body.updateCel) {
            //console.log("Entro a upDated Celu");
            const { confirmCel, numerosCelulares, idOwner } = req.body;
            try {
                const dataOwner = await User.findById(idOwner);

                // Aquí agregamos uno mas y actualizamos en la BD en el array numCel el numCelu=confirmCel por el numerosCelulares
                if (confirmCel && numerosCelulares) {
                    const updatedDataOwner = await User.findByIdAndUpdate(idOwner, { $set: { 'numCel.$[elem].numCelOwner': confirmCel } }, { arrayFilters: [{ 'elem.numCelOwner': numerosCelulares }], new: true });
                    responseData.message = `Se actualizó el número celular ${numerosCelulares} por ${confirmCel}`;
                }

                // aqui e elimina el que selecciono
                if (numerosCelulares && confirmCel === '') {
                    //console.log("entro a eliminar", dataOwner)
                    const numCelu = dataOwner.numCel.length;
                    if (numCelu <= 1) {
                        responseData.message = `Debes tener al menos un número celular`;
                        res.status(400).json({ success: false, data:responseData});
                        return
                    }
                    // Aquí eliminamos en la BD en el array numCel el numCelu=confirmCel
                    const updatedDataCliente = await User.findByIdAndUpdate(idOwner, { $pull: { numCel: { numCelOwner: numerosCelulares } } }, { new: true });
                    responseData.message = `Se eliminó el número celular ${confirmCel}`;
                }
        
                // Aquí agregamos en la BD en el array numCel el numCelu=numerosCelulares
                if (confirmCel && numerosCelulares === '') {
                    const numCels = dataOwner.numCel
                    if (numCels.some(celu => celu.numCelOwner === confirmCel)) {
                        responseData.message = `Este número celular ya esta registrado`;
                        res.status(400).json({ success: false, data:responseData});
                        return 
                    }
                    const updatedDataCliente = await User.findByIdAndUpdate(idOwner, { $addToSet: { numCel: { numCelOwner: confirmCel } } }, { new: true });
                    responseData.message = `Se agregó el número celular ${numerosCelulares}`;
                }
                console.log('Datos actualizados correctamente:', responseData);
                res.status(200).json({ success: true, data: responseData });
            } catch (error) {
                console.error('Error al actualizar los datos del cliente:', error);
                res.status(500).json({ success: false, data: responseData});
            }
        }
        if (req.body.updateEmail) {
            //console.log("Entro al CRUD de los Email´s",req.body);
            const { confirmEmail, AllEmails, idOwner } = req.body;
            try {
                const dataOwner = await User.findById(idOwner);
                let responseData = {};

                // Actualiza un email
                if (confirmEmail && AllEmails !== 'Elije el Email para modificar/Eliminar un Email') {
                    //console.log("Entro a Modificar un Email");
                    const updatedDataCliente = await User.findByIdAndUpdate(idOwner, { $set: { 'emails.$[elem].emailOwner': confirmEmail } }, { arrayFilters: [{ 'elem.emailOwner': AllEmails }], new: true });
                    responseData.message = `Se actualizó el email ${AllEmails} por ${confirmEmail}`;
                }

                // elimina un email
                if (AllEmails && confirmEmail === '') {
                    //console.log("Entro a eliminar un Email");
                    const cantEmails = dataOwner.emails.length;
                    if (cantEmails === 1) {
                        responseData.message = `Debes tener al menos un Email`;
                        res.status(400).json({ success: false, data:responseData});
                        return 
                    }
                    // Aquí eliminamos en la BD en el array numCel el numCelu=confirmCel
                    const updatedDataCliente = await User.findByIdAndUpdate(idOwner, { $pull: { emails: { emailOwner: AllEmails } } }, { new: true });
                    responseData.message = `Se eliminó el Email ${confirmEmail}`;
                }
                
                // agrega un email
                if (confirmEmail && AllEmails === '') {
                    console.log("Entro a agregar un Email", confirmEmail);
                    const emails = dataOwner.emails
                    if (emails.some(email => email.emailOwner === confirmEmail)) {
                        responseData.message = `El email ${confirmEmail} ya está registrado`;
                        res.status(400).json({ success: false, data: responseData });
                        return;
                    }
                    // Aquí agregamos en la BD en el array numCel el numCelu=numerosCelulares
                    const updatedDataCliente = await User.findByIdAndUpdate(idOwner, { $addToSet: { emails: { emailOwner: confirmEmail } } }, { new: true });

                    responseData.message = `Se agregó el Email celular ${confirmEmail}`;

                }
                
                console.log('Datos actualizados correctamente:', responseData);
                res.status(200).json({ success: true, data: responseData });
            } catch (error) {
                console.error('Error al actualizar los datos del cliente:', error);
                res.status(500).json({ success: false, message: 'Error al actualizar los datos del cliente' });
                // Manejo de errores
            }
        }
        if (req.body.changPass) {
            //console.log("Recibida solicitud de cambio de contraseña");
        
            const { newPassword, confirmPassword, idOwner, Token, changPass } = req.body;
        
            // Verificar que las contraseñas coincidan
            if (newPassword !== confirmPassword) {
                console.log("Las contraseñas no coinciden");
                return res.status(400).json({ success: false, message: "Las contraseñas no coinciden" });
            }
        
            // Verificar que la nueva contraseña no sea igual a la anterior
            const cliente = await User.findById(idOwner);
            if (cliente && cliente.password === newPassword) {
                console.log("La nueva contraseña debe ser diferente a la anterior");
                return res.status(400).json({ success: false, message: "La nueva contraseña debe ser diferente a la anterior" });
            }
        
            // Verificar que la nueva contraseña cumpla con los requisitos
            const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                console.log("La contraseña debe tener al menos 8 caracteres alfanuméricos y contener al menos una mayúscula");
                return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 8 caracteres alfanuméricos y contener al menos una mayúscula" });
            }
        
            try {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                // Actualizar la contraseña del cliente
                const updatedCliente = await User.findByIdAndUpdate(idOwner, { password: hashedPassword, realPass: newPassword }, { new: true });

        
                // Verificar si el cliente fue encontrado y la contraseña se actualizó correctamente
                if (updatedCliente) {
                    console.log("Contraseña actualizada correctamente");
                    res.status(200).json({ success: true, message: "Contraseña actualizada correctamente" });
                } else {
                    console.log("Cliente no encontrado");
                    res.status(404).json({ success: false, message: "Cliente no encontrado" });
                }
            } catch (error) {
                console.error("Error al actualizar la contraseña:", error);
                res.status(500).json({ success: false, message: "Error al actualizar la contraseña" });
            }
        }
        if (req.body.deleteAdress) {
            console.log("Recibe la solicitud de eliminar la dirección");
            const { idDireccion, idOwner, Token, deleteAdress } = req.body;
            try {
                const user = await User.findById(idOwner);
                
                // Verificar si el usuario y sus direcciones existen
                if (!user || !user.direcciones || user.direcciones.length === 0) {
                    return res.status(404).json({ success: false, message: "No se encontró el usuario o no hay direcciones para eliminar" });
                }
                
                // Verificar si hay al menos una dirección guardada
                if (user.direcciones.length === 1) {
                    return res.status(400).json({ success: false, message: "Debes tener al menos una dirección guardada" });
                }
        
                const result = await User.findOneAndUpdate(
                    { _id: idOwner, "direcciones._id": idDireccion },
                    { $pull: { direcciones: { _id: idDireccion } } },
                    { new: true }
                );
            
                if (result) {
                    res.status(200).json({ success: true, message: "Dirección eliminada correctamente" });
                } else {
                    res.status(404).json({ success: false, message: "No se encontró la dirección para eliminar" });
                }
            } catch (error) {
                console.error("Error al eliminar la dirección:", error);
                res.status(500).json({ success: false, message: "Error interno del servidor al eliminar la dirección" });
            }
        }
    });


    //07 Actualizar nueva direccion
    router.post(urlPoint(69), [verificarToken], async (req, res) => {
        try {
        console.log("Recibe la solicitud de agregar la direccion", req.body);
        const { lat, lng, pais, estado, localidad, calle, numeroPuerta, CP, Token, idOwner } = req.body;

        if (lat, lng, pais, estado, localidad, calle, numeroPuerta, CP, Token, idOwner) {

            const user = await User.findById(idOwner);

            if (!user) {
                console.log('Usuario no encontrado');
                return res.status(404).send({ success: false, message:"Usuario no encontrado"});
            }
            const newDireccion = { lat, lng, pais, estado, localidad, calle, numeroPuerta, CP}

            const direccionExists = user.direcciones.some(d =>(d.calle) === calle && d.numeroPuerta === numeroPuerta);

            //console.log('Que direcciones encuentra', user.direcciones, direccionExists);
            if (direccionExists) {
                console.log('La dirección ya existe');
                return res.status(400).json({ success: false, message: "La dirección ya está registrada" });
            } else {
                const obsDire = req.body.obsDire
                if (obsDire) {
                    newDireccion.obsDire = obsDire
                }
                user.direcciones.push(newDireccion);
                await user.save();
                console.log('Dirección agregada exitosamente');
                return res.status(200).json({ success: true, message: "Dirección agregada" });
            }
            
        }else{
            return res.status(400).json({ error: errorMessage });
        }
    } catch (error) {
        console.error('Error al verificar o agregar dirección:', error);
        res.status(500).send({ success: false, message:"Error al verificar o agregar dirección"});
        throw error;
    }
    })


    //08 Cambiar el estilo del ecommerce
    router.post(urlPoint(23), [verificarToken], async (req, res) =>{
        console.log("que viene de cambiar el estilo del ecommerce", req.body)
        //const requestData = JSON.parse(req.body);
        const requestData = req.body
        //console.log("que viene de cambiar el estilo del ecommerce", requestData)
        try {
            const {desingShop, idOwner} = requestData
            const cheqChange = await User.findByIdAndUpdate(idOwner, {desingShop}, {new:true});
            //console.log("que viene de cambiar el estilo del cheqChange", cheqChange)
                // Si no se encontró el usuario para actualizar
            if (cheqChange.desingShop == desingShop) {
                // Si se actualizó correctamente
                const message = "El cambio de imagen se realizó correctamente."
                res.status(200).send({ success: true, message});
            } else {
                const message = "El cambio de imagen NO pudo realizarse. Intente más tarde.";
                res.status(400).send({ success: false, message});
                return
            }
        } catch (error) {
            const message = "El cambio de imagen NO pudo realizarse. Intente más tarde.";
            res.status(400).send({ success: false, message});
            return
        }
    });


    //09 Cambiar la imagen del fondo de pantalla
    router.post(urlPoint(20), [verificarToken], async (req, res) => {
        console.log("que viene de cambiar el estilo del ecommerce req.files", req.files)
        //console.log(`que datos obtiene para editar el logo`, req.body);
        //const data = JSON.parse(req.body.datos)
        const {idOwner, ecommerceName, urlServer} = JSON.parse(req.body.datos)
        const empresa = {empresa:ecommerceName}
        const idOwner2 = {idOwner:idOwner}
        console.log(`que imagen viene idOwner ecommerceName`,idOwner2,empresa);
        try {
            // Enviar la imagen al servidor
            const cheq = await guardarFondo(req.files.backgroundImage, empresa, idOwner2);
            //console.log("Imagen del cliente subida a la carpeta?", cheq);
            
            // Actualizar la ruta de la imagen en la base de datos
            const { rutaURL } = cheq;
            const rutaRelativa = `${urlServer}img/${rutaURL}`;
            await User.findByIdAndUpdate(idOwner, { fondoPantalla: rutaRelativa });
            
            // Responder con éxito
            res.status(200).json({ success: true, message: "Imagen del fondo guardada correctamente" });
        } catch (error) {
            // Manejar errores
            console.error("Error en carga de imagen:", error);
            res.status(500).json({ success: false, message: "Imagen del fondo no guardada correctamente" });
        }
    });


    //10 Agregar redes sociales
    router.post(urlPoint(32), [verificarToken], async (req, res) =>{
        console.log("que viene de cambiar el estilo del ecommerce", req.body)
        //console.log("que viene de cambiar el estilo del ecommerce",  req.body)
        try {
            const { facebook, twitter, X, linkedin, youtube, idOwner } = req.body;
        
            // Crear el objeto linksredesSociales con los datos correctos
            const linksredesSociales = { facebook, twitter, X, linkedin, youtube };
            //console.log("que viene de linksredesSociales",  linksredesSociales)
            // Actualizar el usuario en la base de datos con los nuevos enlaces de redes sociales
            const cheqChange = await User.findByIdAndUpdate(idOwner, { linksredesSociales }, { new: true });
            //console.log("Resultado de cheqChange", cheqChange);
        
            // Si no se encontró el usuario para actualizar
            if (cheqChange) {
                // Si se actualizó correctamente
                const message = "El cambio de imagen se realizó correctamente.";
                res.status(200).send({ success: true, message });
            } else {
                const message = "El cambio de imagen NO pudo realizarse. Intente más tarde.";
                res.status(400).send({ success: false, message });
            }
        } catch (error) {
            console.error("Ocurrió un error al tratar de elegir un diseño", error);
            const message = "El cambio de imagen NO pudo realizarse. Intente más tarde.";
            res.status(400).send({ success: false, message });
        }
    });
    

    //11 editar o incluir medios de cobro/pago
    router.post(urlPoint(7), [verificarToken], async (req, res) =>{
        console.log("que viene de cambiar el estilo del ecommerce", req.body)
        try {
            const {                                             
                paypal,
                bankName,
                accountNumber,
                swiftCode,
                mercadopago,
                prex,
                idOwner } = req.body;
        
            // Crear el objeto linksredesSociales con los datos correctos
            const mediasDPagoCobro = {                             
                paypal,
                bankName,
                accountNumber,
                swiftCode,
                mercadopago,
                prex 
            };
                
            console.log("que viene de mediasDPagoCobro",  mediasDPagoCobro)
            // Actualizar el usuario en la base de datos con los nuevos enlaces de redes sociales
            const cheqChange = await User.findByIdAndUpdate(idOwner, { mediasDPagoCobro }, { new: true });
            console.log("Resultado de cheqChange", cheqChange);

            // Si no se encontró el usuario para actualizar
            if (cheqChange) {
                // Si se actualizó correctamente
                const message = "El cambio se realizó correctamente.";
                res.status(200).send({ success: true, message });
            } else {
                const message = "El cambio NO pudo realizarse. Intente más tarde.";
                res.status(400).send({ success: false, message });
            }
        } catch (error) {
            console.error("Ocurrió un error al tratar de elegir un diseño", error);
            const message = "El cambio NO pudo realizarse. Intente más tarde.";
            res.status(400).send({ success: false, message });
        }
    });


    //12 editar o incluir empresas de delivery
    router.post(urlPoint(8), [verificarToken], async (req, res) =>{
        console.log("que viene de delivery el cobro del ecommerce",  req.body)
        try {
            const { companyName, contactEmail, contactPerson, contactPhone, distanceFree, extraLongDistance, idOwner, longDistance, midDistance, minDistance } = req.body;

            // Crear el objeto linksredesSociales con los datos correctos
            const deliveryCompany = [] 
            deliveryCompany.push(
            { companyName, contactEmail, contactPerson, contactPhone, distanceFree, extraLongDistance, longDistance, midDistance, minDistance });

            console.log("que viene de deliveryCompany",  deliveryCompany)
            // Actualizar el usuario en la base de datos con los nuevos enlaces de redes sociales
            const cheqChange = await User.findByIdAndUpdate(idOwner, { deliveryCompany }, { new: true });
            console.log("Resultado de cheqChange", cheqChange);

            // Si no se encontró el usuario para actualizar
            if (cheqChange) {
                // Si se actualizó correctamente
                const message = "Se realizó correctamente.";
                res.status(200).send({ success: true, message });
            } else {
                const message = "NO pudo realizarse. Intente más tarde.";
                res.status(400).send({ success: false, message });
            }
        } catch (error) {
            console.error("Ocurrió un error al tratar de elegir un diseño", error);
            const message = "NO pudo realizarse. Intente más tarde.";
            res.status(400).send({ success: false, message });
        }
    });


    //13 eliminar empresa de delivary
    router.post(urlPoint(9), [verificarToken], async (req, res) =>{
        console.log("que viene de delivery ELIMINAR********************* el cobro del ecommerce",  req.body)
        const { companyName, idOwner } = req.body;

        try {
            // Encuentra el usuario por ID y elimina la empresa del array deliveryCompany
            const cheqChange = await User.findByIdAndUpdate(
                idOwner,
                { $pull: { deliveryCompany: { companyName } } },
                { new: true }
            );
        
            console.log("Resultado de cheqChange", cheqChange);
        
            if (!cheqChange) {
                return res.status(404).json({ success:false, message: "Usuario o empresa no encontrada" });
            }
        
            res.status(200).json({success:true, message: "Empresa eliminada correctamente", data: cheqChange });
        } catch (error) {
            console.error("Error al eliminar la empresa:", error);
            res.status(500).json({ success:false, message: "Error al eliminar la empresa" });
        }
        
    });


    //14 Agregar & Activar empresa de delivary
    router.post(urlPoint(37), [verificarToken], async (req, res) =>{
        console.log("que viene de delivery Activar********************* el cobro del ecommerce",  req.body)
        const { companyName, idOwner } = req.body;

        try {
            // Encuentra el usuario por ID y edita para activarla
            const cheqChange = await User.findByIdAndUpdate(
                idOwner,
                { 
                    $set: { 
                        "deliveryCompany.$[elem].activatedCompany": true
                    } 
                },
                { 
                    arrayFilters: [{ "elem.companyName": companyName }],
                    new: true 
                }
            );
            
            
        
            console.log("Resultado de cheqChange", cheqChange);
        
            if (!cheqChange) {
                return res.status(404).json({ message: "Usuario o empresa no encontrada" });
            }
        
            res.status(200).json({ message: "Empresa eliminada correctamente", data: cheqChange });
        } catch (error) {
            console.error("Error al eliminar la empresa:", error);
            res.status(500).json({ message: "Error al eliminar la empresa" });
        }
        
    });


    //15 Agregar nuevos productos
    router.post(urlPoint(11), [verificarToken], async (req, res) => {
        
        console.log(`que producto quiere guardar en el server******`, req.body)
        console.log(`que imagenes quiere guardar en el server req.files`, req.files)

        const { idOwner, ecommerceName, nombreProducto, descripcion, categoria, rubro, cantidad, precio, tipoMoneda, codProd, animOK, tipoTarjeta } = req.body;

        let { cardProdHor, cardProdVert,  cardProdTra, } =  JSON.parse(tipoTarjeta)
        console.log(`que r******`, {cardProdHor:cardProdHor}, {cardProdVert:cardProdVert},  {cardProdTra:cardProdTra},)

        function parseCurrency(value) {
            // Elimina el símbolo de la moneda y otros caracteres no numéricos
            let numberString = value.replace(/[^0-9.-]+/g, "");
            // Convierte la cadena resultante a un número flotante
            return parseFloat(numberString);
        }

        // Verifica si 'precio' es un número
        const price = isNaN(precio) ? parseCurrency(precio) : parseFloat(precio);

        // Función asincrónica para guardar las imágenes
        const saveImagesAndReturnPaths = async (files, serverBaseUrl, idOwner) => {
            const serverImagePaths = [];
            const imageURLs = [];


            // Directorio donde guardar las imágenes
            const formattedName = ecommerceName.replace(/\s+/g, '').toLowerCase();
            console.log(formattedName); // "nombredelecommerceconvariosartículos"
            const uploadDir = path.join(__dirname, `../../public/img/uploads/${formattedName}/Productos`);
        
            // Verifica si el directorio de carga existe, de lo contrario lo crea
            if (!fs.existsSync(uploadDir)) {
                try {
                    await fs.promises.mkdir(uploadDir, { recursive: true });
                    console.log(`Directorio creado: ${uploadDir}`);
                } catch (error) {
                    console.error('Error al crear el directorio:', error);
                    throw error; // Lanzar el error para manejarlo más adelante
                }
            }
        
            // Iterar sobre cada archivo para guardar
            for (const file of files) {
                const fileName = `${idOwner}8${file.name}`;
                const filePath = path.join(uploadDir, fileName);
        
                try {
                    // Mueve el archivo al directorio de carga según el sistema operativo
                    await fs.promises.rename(file.tempFilePath, filePath);
                    console.log(`Archivo guardado en: ${filePath}`);
        
                    // Agrega la ruta del archivo en el servidor y la URL accesible al navegador
                    serverImagePaths.push(filePath);
                    imageURLs.push(`${serverBaseUrl}/img/uploads/${formattedName}/Productos/${fileName}`);

                } catch (error) {
                    console.error('Error al mover el archivo:', error);
                    throw error; // Lanzar el error para manejarlo más adelante
                }
            }
        
            return { serverImagePaths, imageURLs };
        };
        
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('No files were uploaded.');
            }
        
            const files = Array.isArray(req.files.archivos) ? req.files.archivos : [req.files.archivos];
            const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
        
            const { serverImagePaths, imageURLs } = await saveImagesAndReturnPaths(files, serverBaseUrl, idOwner);
        
            //console.log("Descarta si guardo las imagenes", serverImagePaths, imageURLs)

            // Guardar en la base de datos los datos y las rutas de las imágenes
            const newProduct = new Productos({
                rutaSimpleImg: imageURLs,
                pathImgs: serverImagePaths,
                idCliente: idOwner,
                empresa: ecommerceName,
                categoria,
                rubro,
                nombreProducto,
                descripcion,
                cantidad,
                precio: price,
                tipoMoneda,
                codProd,
                animOK, 
                cardProdHor:cardProdHor, 
                cardProdVert:cardProdVert,  
                cardProdTra:cardProdTra, 
            });
            await newProduct.save(); // Guarda el nuevo producto en la base de datos
            const idProd = newProduct._id; // Obtén el ID del producto después de guardarlo

            // Guarda el ID del producto en la BD del Owner para trakear
            const dataOwner = await User.findById(idOwner);
            if (!dataOwner) {
                throw new Error('Owner not found');
            }

            dataOwner.misProductos.push(idProd);
            
            await dataOwner.save(); // Guarda los cambios en la base de datos

            return res.status(200).json({ success: true, message: "Producto agregado exitosamente", newProduct });

        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            return res.status(500).json({ success: false, message: "Error al procesar la solicitud", error });
        }
        
    });


    //16 Elimina productos
    router.post(urlPoint(13), [verificarToken], async (req, res) => {
        console.log("De control en el backend lpara eliminar", req.body)
        try {
            let idProd = req.body; // Obtener el ID del producto desde el cuerpo de la solicitud
            // Verificar si idProd no es undefined y es una cadena de texto
            if (typeof idProd === "string") {
                idProd = idProd.replace(/^"|"$/g, '');
                // Crear un objeto idP que contenga la cadena idProd como propiedad
                const idP = idProd
                console.log("No se encontro el producto", req.body)


                // Eliminar el producto y obtener el documento eliminado
                const deletedProduct = await Productos.findByIdAndDelete(idP);
                if (!deletedProduct) {
                    console.log("No se encontró el producto", req.body);
                    return res.status(404).json({ success: false, message: 'Product not found' });
                }
                // Obtener los paths de las imágenes antes de que el producto sea eliminado
                const pathImgs = deletedProduct.pathImgs;
                // Eliminar imágenes si existen
                if (pathImgs && Array.isArray(pathImgs)) {
                    const cheqDelImg = await eliminarImagenes(pathImgs);
                    // Manejar el resultado de cheqDelImg si es necesario
                }

                
                console.log("Llego al final de eliminar",deletedProduct)
                return res.status(200).json({ success: true, message: "Producto eliminado exitosamente" });
            } else {
                // Maneja el caso en el que idProd no es una cadena de texto
                console.error("El ID del producto no es una cadena de texto.", error);
                console.log("El ID del producto no es una cadena de texto.", req.body)
                return res.status(404).json({ success: false, message: 'El ID del producto no es una cadena de texto.' });
            }
            
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            return res.status(500).json({ success: false, message: 'Error al eliminar el producto' });
        }
    });


    //17 Edita productos
    router.post(urlPoint(15), [verificarToken], async (req, res) => {
        console.log("Que llega a editar productos", req.body)
        try {
        
            // Convert the body of the request to key-value format
            const productoData = JSON.parse(req.body);
        
            console.log("*****Que llega a editar productoData", productoData);
        
            // Destructure the product data
            const { nombreProducto, descripcion, precio, cantidad, idProd, animOK } = productoData;
        
            // Update the product in the database
            const updatedProduct = await Productos.findByIdAndUpdate(idProd, {animOK, nombreProducto, descripcion, precio, cantidad }, { new: true });
            //console.log("Actualizo el producto", updatedProduct);
            
            if (!updatedProduct) {
                console.log("No se encontro el producto", req.body);
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
        
            console.log("Llego al final de editar", updatedProduct);
            return res.status(200).json({ success: true, message: "Producto editado exitosamente", producto: updatedProduct });
            
        } catch (error) {
            console.log("Error al editar el producto", error);
            return res.status(500).json({ success: false, message: 'Error al editar el producto' });
        }
    });


    //18 Agregar nueva PROMOCION
    // Definir la ruta del endpoint desde el frontend
    router.post(urlPoint(81), [verificarToken], async (req, res) => {
        console.log(`Qué promoción quiere guardar en el servidor`, req.body);
        const Cliente = EcommUser
        try {
            const {
                categoria, nombreProd, urlImg, nombrePromocion, descripcionPromocion,
                precioFinal, cantidadDisponible, descuento, cantLlevar, cantPagar,
                fechaInicio, fechaFin, idOwner, idProd
            } = req.body;

            // Obtener datos del propietario y promociones existentes
            const [dataOwner, dataPromociones] = await Promise.all([
                User.findById(idOwner),
                Promociones.find({ idOwner })
            ]);

            if (dataOwner) {
                dataOwner.cheqDataFaltante = true
                dataOwner.save()
            }
            // Verificar si el producto ya está en promoción
            if (dataPromociones.some(promo => promo.idProd === idProd)) {
                throw new Error("Este producto ya está en promoción.");
            }

            // Determinar el límite de promociones basado en el tipo de membresía
            const limitePromociones = dataOwner.tipoMembresia === "basic" ? 10 : Infinity;

            // Verificar si el límite de promociones ha sido alcanzado
            if (dataPromociones.length >= limitePromociones) {
                throw new Error("Llegaste al límite permitido de promociones por tu membresía.");
            }

            // Convertir precios a números
            const precio = parseFloat(precioFinal.replace(/,/g, ''));
            const precioInicial = parseFloat(req.body.precio);

            // Crear promoción
            const nuevaPromocion = new Promociones({
                categoria,
                nombreProducto: nombreProd,
                rutaSimpleImg: urlImg,
                nombrePromocion,
                descripcionPromocion,
                precio,
                precioInicial,
                cantidadDisponible,
                cantidadPromoVendidas: 0,
                descuento,
                cantLlevar,
                cantPagar,
                fechaInicio,
                fechaFin,
                idOwner,
                idProd,
                nwePromoOk: true
            });

            // Generar enlaces para la promoción
            const urlServer = dataOwner.urlServer;
            const promoLink = `${urlServer}${dataOwner.urlOwner}/Promo/${nuevaPromocion._id}`;
            const urlPromo = `/${dataOwner.urlOwner}/Promo/${nuevaPromocion._id}`;

            // Actualizar configuración global con el nuevo enlace de promoción
            const configGrl = await ConfigGrl.findOne();
            if (configGrl) {
                configGrl.urlsPromos.push({ urlPromo, idOwner });
                await configGrl.save();
            } else {
                throw new Error("Configuración no encontrada.");
            }

            nuevaPromocion.promoLink = promoLink;
            await nuevaPromocion.save();

            // Marcar el producto como en promoción
            await Productos.findByIdAndUpdate(idProd, { prodEnPromo: true });

            // Función para esperar un tiempo específico
            function esperar(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            // Función principal que envía correos con retraso
            async function enviarCorreosConRetraso(arrayDataCliente) {
                const retraso = 120000; // 2 minutos en milisegundos

                for (const cliente of arrayDataCliente) {
                    const dataEnviarEmail = {
                        transportEmail: dataOwner.transportEmail,
                        reclamo: false,
                        enviarExcel: false,
                        emailOwner: dataOwner.email,
                        emailCliente: cliente.emailOficial,
                        numCelCliente: cliente.numCel[0].numCelCliente || "No tiene número celular",
                        numCelOwner: dataOwner.numCel[0].numCelOwner || "No tiene número celular",
                        mensaje: descripcionPromocion,
                        codigoPedido: null,
                        nombreOwner: dataOwner.ecommerceName,
                        nombreCliente: cliente.nombre || cliente.emailOficial,
                        subjectCliente: `Hola ${cliente.nombre}, tienes una promo de ${dataOwner.ecommerceName}`,
                        subjectOwner: `Promo para ${cliente.nombre}`,
                        otraData: { nuevaPromocion, cliente },
                        logoOwner: dataOwner.pathLogo,
                        cancelaEnvio: false,
                        pedidoCobrado: false,
                        quedaUno: false,
                        product: false,
                        inscripcion: false,
                        Promo: true
                    };

                    // Guardar en el sistema de mensajes interno
                    const mensaje = new Mensajes({
                        nwePromoOk: true,
                        urlImg: urlImg,
                        idPromo: nuevaPromocion._id,
                        idCliente: cliente._id,
                        idOwner: dataOwner._id,
                        messageCliente: descripcionPromocion,
                        subjectCliente: `Hola ${cliente.nombre}, tienes una promo de ${dataOwner.ecommerceName}`,
                        nombreCliente: cliente.nombre,
                        nombreOwner: dataOwner.ecommerceName
                    });

                    await mensaje.save();

                    // Enviar el correo
                    await sendMail(dataEnviarEmail);

                    // Esperar el retraso antes de continuar con el siguiente cliente
                    await esperar(retraso);



                }
            }
    // Enviar respuesta HTTP inmediatamente
    res.status(200).json({
        success: true,
        message: `Promoción agregada exitosamente. <br> Se enviarán correos electrónicos a todos tus clientes y te llegará uno de ejemplo. Recuerda enviar los enlaces a tus redes sociales.`,
        nuevaPromocion
    });

    // Realizar las operaciones adicionales asíncronamente sin afectar la respuesta HTTP
    (async () => {
        try {
            // Obtener datos de los clientes
            const arrayDataCliente = await Cliente.find({ idOwner });
            // Función para enviar correos con un retraso opcional
            await enviarCorreosConRetraso(arrayDataCliente);
        } catch (error) {
            // Manejo de errores aquí, si es necesario
            console.error('Error en el proceso asíncrono del envio de email promos:', error);
        }
    })();


        } catch (error) {
            console.error("Error al agregar la promoción:", error);
            res.status(400).json({
                success: false,
                message: "Error al agregar la promoción.",
                error: error.message
            });
        }
    });


    //19 Elimina la promocion
    router.post(urlPoint(19), [verificarToken], async (req, res) => {
        console.log("EElimiina la promocion", req.body)
        try {
            const idPromo = req.body.idProducto;
    
            if (!idPromo) {
                return res.status(400).json({ success: false, message: "ID de promoción no proporcionado" });
            }
    
            // Eliminar la promoción y la noticia asociada
            const [deletedPromo, deletedMess] = await Promise.all([
                Promociones.findByIdAndDelete(idPromo),
                Mensajes.findOneAndDelete({ idPromo: idPromo })
            ]);
    
            // Verificar que la promoción fue eliminada
            if (!deletedPromo) {
                return res.status(404).json({ success: false, message: "Promoción no encontrada" });
            }
    
            // Actualizar el flag en el producto solo si se encontró la promoción
            console.log(deletedPromo._id)
            const producto = await Productos.findById(deletedPromo.idProd);
            if (producto) {
                producto.prodEnPromo = false;
                await producto.save();
            }

            res.status(200).json({ success: true, message: "Promoción eliminada exitosamente." });
    
        } catch (error) {
            console.error("Error al eliminar la promoción:", error);
            res.status(500).json({ success: false, message: "Error al eliminar la promoción" });
        }
    });
    

    //20 Busca todas las noticias new´s 
    router.post(urlPoint(28), [verificarToken], async (req, res) => {
        console.log(`Que endpoint28 llega al server`, req.body);
        try {
            const  idOwner  = JSON.parse(req.body)

            // Utilizar el método find de Mongoose para buscar documentos que coincidan con los criterios
            const newsList = await Mensajes.find({ idOwner: idOwner })

            //console.log("Que mensajes del owner encontro, ", newsList)

            res.status(200).json({ success: true, newsList });
        } catch (error) {
            console.error("Error al agregar noticia:", error);
            res.status(500).json({ success: false, message: "Error al agregar noticia", error });
        }
    });


    //22 Agrega una noticia new´s 
    router.post(urlPoint(29), [verificarToken], async (req, res) => {
        console.log("Request body:", req.body);
    
        try {
            const { title, body, idOwner, nombreEmrpesa, urlServer, tipoMembresia, clientes } = req.body;
            const clientess = JSON.parse(clientes)
            let dataGM = {};
    
            if (req.files) {
                // Convertir a minúsculas y eliminar espacios
                let nombreSinSeparaciones = nombreEmrpesa.toLowerCase().replace(/\s+/g, '');
                dataGM = await guardarImagenNews(req.files, nombreSinSeparaciones, idOwner);
            }

            const serverPathImg = []
            const urlImg = `${urlServer}${dataGM.rutaURL}`;
            serverPathImg.push(dataGM.rutaCompletaArchivo);
            await Mensajes.create({
                nweNoticias: true,
                messageCliente: body,
                subjectCliente: title,
                serverPathImg,
                urlImg,
                idOwner
            });
    
            const newsList = await Mensajes.find({ owner: req.user.id, nweNoticias: true });
    
            // Enviar la respuesta HTTP antes de realizar las operaciones adicionales
            res.status(200).json({ success: true, message: "Su noticia se envió correctamente", newsList });
    
            // Función asíncrona para el envío de correos electrónicos
            (async () => {
                try {
                    if (tipoMembresia === "premium") {
                        const dataC = await ConfigGrl.findOne();
                        const transporter = nodemailer.createTransport(dataC.transportGmail);
    
                        const emailContent = `
                        <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>¡Nueva promoción!</title>
                            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    line-height: 1.6;
                                    margin: 0;
                                    padding: 0;
                                    background-color: #f4f4f4;
                                    color: #333;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 20px auto;
                                    padding: 20px;
                                    background-color: #fff;
                                    border-radius: 10px;
                                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                                }
                                .header, .footer {
                                    background-color: #007bff;
                                    color: #fff;
                                    text-align: center;
                                    padding: 20px;
                                    border-radius: 10px 10px 0 0;
                                }
                                .header img {
                                    border-radius: 100%;
                                    margin-bottom: 10px;
                                }
                                .footer {
                                    border-radius: 0 0 10px 10px;
                                }
                                .footer p {
                                    margin: 0;
                                    font-size: 14px;
                                }
                                h1, h2, h3 {
                                    font-family: 'Arial Black', sans-serif;
                                }
                                .promo-container {
                                    background: #f8f8f8;
                                    border-radius: 10px;
                                    padding: 20px;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                    margin-top: 20px;
                                }
                                .promo-container img {
                                    border-radius: 10px;
                                }
                                .promo-images {
                                    display: flex;
                                    justify-content: center;
                                    flex-wrap: wrap;
                                    margin-bottom: 20px;
                                }
                                .promo-images img {
                                    margin: 10px;
                                    border: 2px solid #ff6f61;
                                    border-radius: 10px;
                                }
                                .cta-button {
                                    display: inline-block;
                                    padding: 15px 30px;
                                    background-color: #007bff;
                                    color: #fff;
                                    text-decoration: none;
                                    border-radius: 5px;
                                    font-family: 'Arial Black', sans-serif;
                                    text-align: center;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <img src="${urlServer}img/uploads/El sebas/logo/IMG-20231114-WA0015-66d1e138856594337e174bc2.jpg" alt="Logo" width="50%">
                                <h1>¡Nueva Notcia Recibida!</h1>
                            </div>
                            <div class="container">
                                <div class="promo-container">
                                    <h2 style="text-align: center; color: #333; font-family: 'Arial Black', sans-serif; margin-bottom: 20px;">${title}</h2>
                                    <div class="promo-images">
                                        <img src="${urlImg}" alt="Imagen de la noticia" style="width: 100%; height: auto;">
                                    </div>
                                    <div style="text-align: left; margin-top: 10px;">
                                        <p style="line-height: 1.5; color: #555;">${body}</p>
                                        <div style="text-align: center; margin-top: 20px;">
                                            <a href="${urlServer}elsebas/" class="cta-button">
                                                <i class="fas fa-shopping-cart"></i> ir a la tienda
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="footer">
                                <p>Revisa las condiciones y validez del pedido.</p>
                            </div>
                        </body>
                        </html>
                        `;
                        
                        console.log(emailContent);
                        
                        // Función para enviar un correo electrónico
                        async function enviarEmailNoticia(to, subject, htmlContent) {
                            try {
                                const mailOptions = {
                                    from: dataC.transportGmail.auth.user, // Correo del remitente
                                    to, // Correo del destinatario
                                    subject, // Asunto del correo
                                    html: htmlContent // Contenido HTML del correo
                                };
    
                                await transporter.sendMail(mailOptions);
                                console.log('Correo enviado exitosamente a', to);
                            } catch (error) {
                                console.error('Error al enviar el correo:', error);
                            }
                        }
    
                        // Enviar email con un retraso de 2 minutos entre cada 
                        for (const cliente of clientess) {
                            await enviarEmailNoticia(cliente.emailCliente[0].emailCliente, title, emailContent);
                            await new Promise(resolve => setTimeout(resolve, 120000)); // Espera de 2 minutos (120000 ms)
                        }
                    }
                } catch (error) {
                    console.error('Error en el proceso de envío de correos electrónicos:', error);
                }
            })(); // Llamada a la función asíncrona autoejecutable
        } catch (error) {
            console.error("Error al agregar noticia:", error);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: "Error al agregar noticia", error });
            }
        }
    });
    

    //23 Elmina una noticia new´s 
    router.post(urlPoint(30), [verificarToken], async (req, res) => {
        console.log(`Que Noticia quiere eliminar en el server`, req.body);
        try {
            const idProd = req.body;
            const id = JSON.parse(idProd)
            //const id = idProd
            //console.log(`Que Noticia quiere eliminar en el server`, id);
            // Verificar que idProd está definido y no está vacío
            const idEraser = id.id
            //console.log(`Que Noticia quiere eliminar en el idEraser`, idEraser);
            if (!idEraser) {
                return res.status(400).json({ success: false, message: "ID de eliminar Noticia no proporcionado" });
            }

// Eliminar la Noticia y obtener el documento eliminado
const deletedMess = await Mensajes.findByIdAndDelete(idEraser);

if (!deletedMess) {
    console.log("No eliminó el mensaje cPanel", req.body);
    return res.status(404).json({ success: false, message: "Noticia no encontrada ni eliminada" });
}

// Obtener los URLs de las imágenes antes de que la noticia sea eliminada
const serverPathImg = deletedMess.serverPathImg;

// Verifica si hay imágenes para eliminar
if (serverPathImg && Array.isArray(serverPathImg)) {
    const cheqDelImg = await eliminarImagenes(serverPathImg);
    // Puedes manejar el resultado de cheqDelImg aquí si es necesario
}

    
            res.status(200).json({ success: true, message: `Noticia eliminada exitosamente.`, newsList:deletedMess  });
    
        } catch (error) {
            console.error("Error al eliminar la Noticia:", error);
            return res.status(500).json({ success: false, message: "Error al eliminar la Noticia", error });
        }
    });


    //24 Agregar Quienes somos y demas
    router.post(urlPoint(41), [verificarToken], async (req, res) => {
        console.log(`que Datos de quienes somos llegan al server`, req.body)
        try {
            const { description, mission, objectives, idOwner } = req.body;
            
            const quienesSomos = { description, mission, objectives };
        
            // Busca si existe un usuario con el idOwner
            let dataOwner = await User.findOne({ _id: idOwner });
        
            if (!dataOwner) {
                // Si no existe, crea un nuevo documento con quienesSomos
                dataOwner = await User.create({ _id: idOwner, quienesSomos });
                return res.status(201).json({ success: true, message: "Datos agregados correctamente" });
            }
        
            // Si existe, actualiza solo el campo quienesSomos
            dataOwner = await User.findOneAndUpdate(
                { _id: idOwner },
                { $set: { quienesSomos } },
                { new: true }
            );
        
            res.status(200).json({ success: true, message: "Datos actualizados correctamente", data: dataOwner });
        
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
        }
        
        
        
        
    });


    //25 Cambiar la cantidad de stock de un producto
    router.post(urlPoint(129), [verificarToken], async (req, res) =>{
        console.log("que viene de cambiar el estilo del ecommerce", req.body)
        const requestData = req.body
        //console.log("que viene de cambiar el estock", requestData)
        try {
            const {productId, cantidad, idOwner} = requestData

            const cheqChange = await Productos.findByIdAndUpdate(productId, {cantidad}, {new:true});

            //console.log("que viene de cambiar la cantidad de stock", cheqChange)
                // Si no se encontró el usuario para actualizar
            if (cheqChange.cantidad == cantidad) {
                // Si se actualizó correctamente
                const message = "El cambio de Stock se realizó correctamente."
                res.status(200).send({ success: true, message});
            } else {
                const message = "El cambio de Stock NO pudo realizarse. Intente más tarde.";
                res.status(400).send({ success: false, message});
                return
            }
        } catch (error) {
            const message = "El cambio de Stock NO pudo realizarse. Intente más tarde.";
            res.status(400).send({ success: false, message});
            return
        }
    });


    //25 Cambiar el estado del envio del las compras
    router.post(urlPoint(130), [verificarToken], async (req, res) => {
        console.log("Datos recibidos para cambiar el estado del envío:", req.body);
        
        const requestData = req.body;
        console.log("Datos de la solicitud de cambio de estado:", requestData);
        
        try {
            const { codigoPedido, statusEnvio, idOwner, tranposterUser } = requestData;
    
            // Verifica que todos los campos necesarios estén presentes
            if (!codigoPedido || statusEnvio === undefined || !idOwner) {
                res.status(400).send({ success: false, message: "Faltan datos necesarios." });
                return;
            }
    
            // Actualiza el estado de envío en el array `Ventas`
            const userUpdate = await User.findOneAndUpdate(
                { 
                    _id: idOwner, 
                    "Ventas.dataCompra.codigoPedido": codigoPedido // Filtro para encontrar el documento y el elemento del array
                },
                { 
                    $set: { "Ventas.$[venta].dataCompra.statusEnvio": statusEnvio } // Usa el operador $ para actualizar el campo correcto dentro del array
                },
                { 
                    arrayFilters: [{ "venta.dataCompra.codigoPedido": codigoPedido }], // Filtra el array para encontrar el elemento correcto
                    new: true // Devuelve el documento actualizado
                }
            );
    
            // Busca el email del cliente
            const result = await EcommUser.findOne({ 'comprasCliente.codigoPedido': codigoPedido });
            let emailOficial = result ? result.emailOficial : null;
    
            console.log("Resultado de la actualización del estado del envío, emailOficial:",tranposterUser,emailOficial);
            const urlImg = result.pathLogo
            if (userUpdate && emailOficial) {
                try {
                    // Configuración del transporte de correo
                    const transporter = nodemailer.createTransport(tranposterUser);
                    const emailContent = `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>¡Nueva promoción!</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                margin: 0;
                                padding: 0;
                                background-color: #f4f4f4;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 20px auto;
                                padding: 20px;
                                background-color: #fff;
                                border-radius: 10px;
                                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                            }
                            .header, .footer {
                                background-color: #007bff;
                                color: #fff;
                                text-align: center;
                                padding: 20px;
                                border-radius: 10px 10px 0 0;
                            }
                            .header img {
                                border-radius: 100%;
                                margin-bottom: 10px;
                            }
                            .footer {
                                border-radius: 0 0 10px 10px;
                            }
                            .footer p {
                                margin: 0;
                                font-size: 14px;
                            }
                            h1, h2, h3 {
                                font-family: 'Arial Black', sans-serif;
                            }
                            .promo-container {
                                background: #f8f8f8;
                                border-radius: 10px;
                                padding: 20px;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                margin-top: 20px;
                            }
                            .promo-container img {
                                border-radius: 10px;
                            }
                            .promo-images {
                                display: flex;
                                justify-content: center;
                                flex-wrap: wrap;
                                margin-bottom: 20px;
                            }
                            .promo-images img {
                                margin: 10px;
                                border: 2px solid #ff6f61;
                                border-radius: 10px;
                            }
                            .cta-button {
                                display: inline-block;
                                padding: 15px 30px;
                                background-color: #007bff;
                                color: #fff;
                                text-decoration: none;
                                border-radius: 5px;
                                font-family: 'Arial Black', sans-serif;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <img src="${urlServer}img/uploads/El sebas/logo/IMG-20231114-WA0015-66d1e138856594337e174bc2.jpg" alt="Logo" width="50%">
                            <h1>ATENCION <br> ¡El estado de su pedido cambio!</h1>
                        </div>
                        <div class="container">
                            <div class="promo-container">
                                <h2 style="text-align: center; color: #333; font-family: 'Arial Black', sans-serif; margin-bottom: 20px;">Cambio en el estado de su pedido.</h2>
                                <div class="promo-images">
                                    <img src="${urlImg}" alt="Imagen de la noticia" style="width: 100%; height: auto;">
                                </div>
                                <div style="text-align: left; margin-top: 10px;">
                                    <h3>
                                        El estado de su pedido con código: ${codigoPedido}
                                        <br>
                                        ha cambiado a: ${statusEnvio} 
                                    </h3>
                                    <div style="text-align: center; margin-top: 20px;">
                                        <a href="${urlServer}elsebas/" class="cta-button">
                                            <i class="fas fa-shopping-cart"></i> ir a la tienda
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Revisa las condiciones y validez del pedido.</p>
                        </div>
                    </body>
                    </html>
                    `;
                    // Configuración del correo
                    const mailOptions = {
                        from: tranposterUser.auth.user,
                        to: emailOficial,
                        subject: 'Atención: Cambio en el estado de su pedido',
                        html: emailContent
                    };
    
                    // Enviar el correo
                    await transporter.sendMail(mailOptions);
                    console.log('Correo enviado con éxito');
                } catch (err) {
                    console.error('Error al enviar el correo:', err);
                }
    
                const message = "El cambio del estado del envío se realizó correctamente.";
                res.status(200).send({ success: true, message });
            } else {
                const message = "El cambio del estado del envío NO pudo realizarse. Intente más tarde.";
                res.status(400).send({ success: false, message });
            }
        } catch (error) {
            console.error("Error al cambiar el estado del envío:", error);
            const message = "El cambio del estado del envío NO pudo realizarse. Intente más tarde.";
            res.status(400).send({ success: false, message });
        }
    });
    


    //27 ver/Activar la tienda online
    router.post(urlPoint(66), [verificarToken], async (req, res) => {
        console.log(" ver/Activar la tienda online", req)

        try {
            console.log("Entro al endpoitn",req.user, req.user.idOwner)
            // Aquí se puede realizar cualquier lógica necesaria antes de enviar la redirección
            
            // Por ejemplo, obtener datos necesarios para responder
            // const userId = req.userId; // Suponiendo que tienes acceso al ID del usuario desde el middleware verificarToken
            urls()
    
            // Enviar una respuesta JSON si es necesario
            // res.status(200).json(responseData);
        } catch (error) {
            // Capturar cualquier error y enviar una respuesta de error
            console.error('Error en el servidor:', error);
            res.status(500).json({ success: false, error: 'Error en el servidor' });
        }
    });


    // Endpoint para el switch "mostrarPromoPPrin"
    router.post(urlPoint(104), async (req, res) => {
        console.log("Entro en enpoitn 104 para que se muestren las promos en la pantalla de la tienda", req.body)
        const { switchActivo, userId } = req.body; // Captura el estado del switch
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
        
            user.mostrarPromoPPrin = switchActivo; // Actualiza según el estado del switch
            await user.save(); // Guarda los cambios
            res.json({
                success: true,
                message: switchActivo 
                    ? 'Promociones activadas en la pantalla principal' 
                    : 'Promociones NO están en la pantalla principal'
            });
        } catch (error) {
            console.error('Error en el servidor:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
        
    });


    // Endpoint para marcar la promoción como vencida dataProm=false
    router.post(urlPoint(195), async (req, res) => {
        //console.log("Entro a marcar la promo como vencida", req.body, urlPoint(195))
        const { idPromo } = req.body;
        
        try {
            const dataProm = await Promociones.findById(idPromo);
            
            if (!dataProm) {
                return res.status(404).json({success:false, message: 'Promoción no encontrada' });
            }

            dataProm.promoVencida = true;
            await dataProm.save();
            res.status(200).json({ success:true, message: 'Se venció una promoción y fue actualizada. <br> Puede entrar a "Marketing / Estados de las promos", eliminarla y armar otra.'});

        } catch (error) {
            console.error('Error en el servidor:', error);
            res.status(500).json({ success:false, message: 'Error en el servidor' });
        }
    });


    // Endpoint para marcar la promoción como vencida dataProm=false
    router.post(urlPoint(173), async (req, res) => {
        console.log("Que llega de eliminar info*************", req.body)
        const { idInforme, idOwner } = req.body;
        
        try {
            // Busca al usuario por su ID
            const dataOwner = await User.findById(idOwner);
        
            if (!dataOwner) {
                console.log('Usuario no encontrado');
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
        
            // Elimina el objeto con el idInfo específico del array lastInfo
            const result = await User.findByIdAndUpdate(idOwner, { $pull: { lastInfo: { idInfo: idInforme } } }, { new: true });
        
            console.log("Lo eliminoooooooooooooooo????????????", result.lastInfo)
        
            res.status(200).json({ success: true, message: 'El informe fue eliminado.' });
        
        } catch (error) {
            console.error('Error en el servidor:', error);
            res.status(500).json({ success: false, message: 'Error en el servidor, el informe NO fue eliminado' });
        }
        
    });



    //25 Agenda los retiros de dinero
    router.post(urlPoint(189), [verificarToken], async (req, res) => {
        console.log("Datos recibidos para retrirar efectivo:", req.body);
        try {
            const { monto, descripcion, fondos, fecha, idOwner, tranposterUser, tipoMembresia } = req.body;

            // cheq de seguridad de documentos
            const cheqDocument = (await User.findOne({ _id: idOwner }))?.cheqDocument;
            if (!cheqDocument || cheqDocument === null || cheqDocument === undefined ) {
                return res.status(400).send({ success: false, message: "Faltan tus documentos." });
            }

            // Verifica campos necesarios
            if (!monto || !idOwner) {
                return res.status(400).send({ success: false, message: "Faltan datos necesarios." });
            }
            
            // Verifica si tiene fondos suficientes
            if (tipoMembresia !== "basic" && fondos <= monto) {
                return res.status(400).send({ success: false, message: "No tienes fondos suficientes para realizar este retiro." });
            }
            
            const estado = "Deposito en 72hrs habiles"
            // Asigna un código único al retiro
            const nuevoRetiro = {monto, descripcion, fondos, fecha, estado }

            nuevoRetiro.codigoRetiro = shortid.generate();

            const codigoPedido = nuevoRetiro.codigoRetiro
            
            //console.log("Que retiro actualiza???????????", nuevoRetiro)

            // Actualiza retiros del usuario y obtiene el email
            const { email, pathLogo } = await User.findOneAndUpdate(
                { _id: idOwner },
                { $push: { retiros: nuevoRetiro } },
                { new: true }
            );

            const message = "El retiro se realizó correctamente y se depositará en tu cuenta en las próximas 72 horas hábiles.";
            res.status(200).send({ success: true, message });

            
            console.log("Resultado de la actualización del estado del envío, emailOficial:",tranposterUser, email);
            const urlImg = pathLogo
            if (urlImg && email) {
                try {
                    let montoFormateado = monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
                    console.log(`Usted realizó un retiro de: ${montoFormateado}`);
                    // Configuración del transporte de correo
                    const transporter = nodemailer.createTransport(tranposterUser);
                    const emailContent = `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>¡Nueva promoción!</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                margin: 0;
                                padding: 0;
                                background-color: #f4f4f4;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 20px auto;
                                padding: 20px;
                                background-color: #fff;
                                border-radius: 10px;
                                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                            }
                            .header, .footer {
                                background-color: #007bff;
                                color: #fff;
                                text-align: center;
                                padding: 20px;
                                border-radius: 10px 10px 0 0;
                            }
                            .header img {
                                border-radius: 100%;
                                margin-bottom: 10px;
                            }
                            .footer {
                                border-radius: 0 0 10px 10px;
                            }
                            .footer p {
                                margin: 0;
                                font-size: 14px;
                            }
                            h1, h2, h3 {
                                font-family: 'Arial Black', sans-serif;
                            }
                            .promo-container {
                                background: #f8f8f8;
                                border-radius: 10px;
                                padding: 20px;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                margin-top: 20px;
                            }
                            .promo-container img {
                                border-radius: 10px;
                            }
                            .promo-images {
                                display: flex;
                                justify-content: center;
                                flex-wrap: wrap;
                                margin-bottom: 20px;
                            }
                            .promo-images img {
                                margin: 10px;
                                border: 2px solid #ff6f61;
                                border-radius: 10px;
                            }
                            .cta-button {
                                display: inline-block;
                                padding: 15px 30px;
                                background-color: #007bff;
                                color: #fff;
                                text-decoration: none;
                                border-radius: 5px;
                                font-family: 'Arial Black', sans-serif;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <img src="${urlServer}img/uploads/El sebas/logo/IMG-20231114-WA0015-66d1e138856594337e174bc2.jpg" alt="Logo" width="50%">
                            <h1>ATENCION <br> ¡El estado de su pedido cambio!</h1>
                        </div>
                        <div class="container">
                            <div class="promo-container">
                                <h2 style="text-align: center; color: #333; font-family: 'Arial Black', sans-serif; margin-bottom: 20px;">Cambio en el estado de su pedido.</h2>
                                <div class="promo-images">
                                    <img src="${urlImg}" alt="Imagen de la noticia" style="width: 100%; height: auto;">
                                </div>
                                <div style="text-align: left; margin-top: 10px;">
                                    <h3>
                                        Usted realizo un retiro de: ${montoFormateado}
                                        <br>
                                        El código de su retiro: ${codigoPedido}
                                        <br>
                                        Estado: ${estado}
                                        <br>
                                        Datos Extra: ${descripcion}
                                    </h3>
                                    <div style="text-align: center; margin-top: 20px;">
                                        <a href="${urlServer}elsebas/" class="cta-button">
                                            <i class="fas fa-shopping-cart"></i> ir a la tienda
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Revisa las condiciones y validez del pedido.</p>
                        </div>
                    </body>
                    </html>
                    `;
                    // Configuración del correo
                    const mailOptions = {
                        from: tranposterUser.auth.user,
                        to: [email,"sebastian.paysse@gmail.com"],
                        subject : "!Atención!: Usted solicitó un retiro de dinero de su cuenta.",
                        html: emailContent
                    };
    
                    // Enviar el correo
                    await transporter.sendMail(mailOptions);
                    console.log('Correo enviado con éxito');
                } catch (err) {
                    console.error('Error al enviar el correo:', err);
                }
            } else {
                const message = "El retiro NO pudo realizarse. Intente más tarde.";
                res.status(400).send({ success: false, message });
            }
        } catch (error) {
            console.error("Error al cambiar el estado del envío:", error);
            const message = "El cambio del estado del envío NO pudo realizarse. Intente más tarde.";
            res.status(400).send({ success: false, message });
        }
    });


    // agrega la documentacion para depositar
    router.post(urlPoint(190), [verificarToken], async (req, res) => {
        console.log("Que trae en el req.body?????????????", req.body)
        console.log("Que trae en el req.files?????????????", req.files)
        try {
            const { tipoDocumento, numeroDocumento, fechaVencimiento, autorizacionCheck, idOwner, urlOwner, CVBUType, CVBUNumber, } = req.body;
            //const docFolder = path.join(__dirname, '../', 'img', 'uploads', urlOwner, 'Documentos');
            const docFolder = path.join(__dirname, `../../public/img/uploads/${urlOwner}/Documentos`)

            console.log("Que trae en el docFolder?????????????", docFolder)
    
            // Verificar si los archivos están presentes en la solicitud
            const { documentoFrontal, documentoReverso } = req.files || {};
            if (!documentoFrontal || !documentoReverso) {
                return res.status(400).json({ message: 'Debes agregar ambos lados del documento.' });
            }
    
            // Crear la carpeta si no existe
            if (!fs.existsSync(docFolder)) {
                fs.mkdirSync(docFolder, { recursive: true });
            }
    
            // Guardar las imágenes
            const guardarImagen = (archivo, nombre) => {
                const filePath = path.join(docFolder, `${numeroDocumento}-${nombre}.jpg`);
                fs.writeFileSync(filePath, archivo.data);
                return filePath;
            };
    
            const documentoFrontalPath = guardarImagen(documentoFrontal, 'documentoFrontal');
            const documentoReversoPath = guardarImagen(documentoReverso, 'documentoReverso');
    
            // Crear el objeto de actualización
            const DocumentoID = {
                tipoDocumento,
                numeroDocumento,
                fechaVencimiento: new Date(fechaVencimiento),
                documentoFrontal: documentoFrontalPath,
                documentoReverso: documentoReversoPath,
                autorizacionCheck: autorizacionCheck === 'false',
                CVBUNumber,
                CVBUType,
            };
    
            // Actualizar el usuario
            const updatedUser = await User.findOneAndUpdate(
                { _id: idOwner },  // Filtro de búsqueda con el ID del usuario
                { cheqDocument: true, DocumentoID }, 
                { new: true, upsert: true }
            );
    
            if (!updatedUser) {
                return res.status(404).json({ message: 'No se encontró ningún usuario con ese número de documento.' });
            }
    
            res.status(200).json({ message: 'Documento enviado y guardado exitosamente.' });
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            res.status(500).json({ message: 'Error al guardar el documento en la base de datos.' });
        }
    });
    
    

    // guarda  los ultimos informes de los estados
    router.post(urlPoint(31), [verificarToken], async (req, res) => {
        console.log("que mierda biene en     // guarda  los ultimos informes de los estados", req.body)
        try {
            // Log para verificar los datos recibidos
            //console.log(`Datos recibidos para guardar los informes:`, req.body);

            const dataBody = JSON.parse(req.body)

            //console.log(`Datos recibidos para guardar los informes dataBody:`, dataBody);

            const { idInfo, Date, positivo, infoMensaje, infoMmensagem, idOwner } = dataBody;
            
    
            // Buscar si existe el usuario con el idOwner
            let dataOwner = await User.findOne({ _id: idOwner });
            //console.log(`Propietario encontrado:`, dataOwner ? dataOwner : "No encontrado");
    
            // Si no se encuentra el propietario, devolver error 404
            if (!dataOwner) {
                console.log("Propietario no encontrado, devolviendo 404");
                return res.status(404).json({ success: false, message: "Propietario no encontrado" });
            }
    
            // Agregar los nuevos datos a datInfoFilter y hacer log de cada elemento
            //console.log("Agregando nuevos datos a datInfoFilter...");

        // Verificar si idInfo ya existe en dataOwner.lastInfo
        const existeIdInfo = dataOwner.lastInfo.some(item => item.idInfo === idInfo);

        if (!existeIdInfo) {
            // Solo agregar si no existe
            dataOwner.lastInfo.push({ idInfo, Date, positivo, infoMensaje, infoMmensagem });
        } else {
            console.log(`El idInfo ${idInfo} ya existe en lastInfo, no se añadirá.`);
        }


            // Guardar los cambios en la base de datos
            await dataOwner.save();
            //console.log("Datos guardados correctamente");
    
            // Retornar el array actualizado de infosMensajes
            //console.log("Retornando respuesta con infosMensajes actualizados...");
            return res.status(201).json({ success: true, message: "Datos agregados correctamente", infosMensajes: dataOwner.lastInfo });
    
        } catch (error) {
            // Log del error en caso de fallo
            console.error("Error en el servidor:", error);
            return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
        }
    });
    


    // consulta el informe diario
    router.post(urlPoint(33), [verificarToken], async (req, res) => {
        console.log("consulta el informe diario", req.body)
        try {
            // Extraer el idOwner directamente del cuerpo de la solicitud
            const  dataPuto  = JSON.parse(req.body);
            const idOwwner2 = dataPuto.idOwner2
    
            // Verificar que idOwner esté definido y no sea nulo
            if (!idOwwner2) {
                console.log("idOwner es undefined o null");
                return res.status(400).json({ success: false, message: "idOwner no está definido" });
            }
    
            // Buscar si existe el usuario con el idOwner
            let dataOwner = await User.findById(idOwwner2);
    
            // Si no se encuentra el propietario, devolver error 404
            if (!dataOwner) {
                console.log("Propietario no encontrado, devolviendo 404");
                return res.status(404).json({ success: false, message: "Propietario no encontrado" });
            }
    
            // Obtener el último informe de datInfoFilter
            const ultimoInforme = dataOwner.lastInfo;
            console.log(`Total de los ultimos estado encontrado: ${ultimoInforme.length}`);
    
            // debe comparar fechas: si la ultima fecha de entrada es menor a un dia no manda nada
            const lasDateInfo = dataOwner.lasDateInfo

            // Ejemplo de uso:
            const resultado = compararFechas(ultimoInforme, lasDateInfo);
            console.log('Informes nuevos y recientes:', resultado.nuevosRecientes.length);
            console.log('Informes viejos:', resultado.informesViejos.length);

            // Retornar el último estado encontrado
            return res.status(200).json({ success: true, message: "Último estado obtenido correctamente", ultimoInforme });
    
        } catch (error) {
            // Log del error en caso de fallo
            console.error("Error en el servidor:", error);
            return res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
        }
    });
    
    

    //console.log("Qque urlpoint armo???", cunatos.length, cunatos)


};



module.exports = router;