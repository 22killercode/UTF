require('dotenv').config();
const express   = require('express');
const router    = express.Router(); 
//const webpush = require('web-push');
const path      = require('path');  // Asegúrate de agregar esta línea
const fs        = require('fs');
// Función para mover la imagen a la carpeta
const fsExtra = require('fs-extra');

const http   = require('http');
const server = http.Server(express);
const os = require('os'); // Asegúrate de importar el módulo 'os'
// codificador
const bcrypt    = require('bcrypt');
//auntenticador
const jwt       = require('jsonwebtoken');
const schedule = require('node-schedule');


//helpers
const nodemailer = require('nodemailer');

//models DBmongo
const usuario       = require('../models/User');
const Tokens        = require('../models/Tokens'); 
const GrlConfig     = require('../models/configsGrl');
const PushMensajes  = require('../models/messages');

const JSONTransport = require('nodemailer/lib/json-transport');
const { Script } = require('vm');

const {saveOrUpdateConfig}= require('./configGlrs');

let urlServer = ""

let ConfigG = {}
async function configsss() {
    try {
        ConfigG = await saveOrUpdateConfig()
        //console.log('111111111FUNCIONESYMAS11111111111Cual es la Configuración global obtenida:', ConfigG);
        // Puedes hacer algo con ConfigG aquí
        urlServer =  ConfigG.urlServer
    } catch (error) {
        console.error('Error al obtener la configuración global:', error);
    }
}
// Llamar a la función configuraciones generales
configsss();

        //Arma los endpoints del ecommerce y l alanding page de forma separada
        function endpointTokensArray2() {
            //console.log("Entro a armar las rutas para el ecommerce")
            const endpointsFronen  = []
            const endpointsBackend = []
            // aqui se generan los distintos enpoints
            const generateRandomString = (length = 333) => Array.from(crypto.getRandomValues(new Uint8Array(length)), byte => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[byte % 62]).join('');
            for (let i = 0; i < 250; i++) {
                const formEndpoint = (generateRandomString().toString());
                const endpointTokenFronen = `${urlServer}${formEndpoint}`
                const endpointTokenBackend = `${formEndpoint}`
                endpointsFronen.push(endpointTokenFronen);
                endpointsBackend.push(endpointTokenBackend);
            }
            return {endpointsFronen, endpointsBackend }
        }

        // Middleware para verificar el token JWT
        const verificarToken = (req, res, next) => {
            
            const authHeader = req.headers.authorization;
            console.log("Entro a verificar token", authHeader )
        
            if (authHeader) {
            const token = authHeader.split(' ')[1]; // Extrae el token eliminando el prefijo "Bearer"
            jwt.verify(token, 'Sebatoken22', (err, decoded) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        //console.log("Desde el verify Token te avisamos que tu sesión a expirado logeate nuevamente",  )
                        return res.status(400).json({success:false,  message: 'Por seguridad tu Token de acceso a tu sesión a expirado, logeate nuevamente' });
                    }
                    //console.log("Invalid token")
                    return res.status(400).json({ success:false, message: 'Invalid token' });
                }
                req.user = decoded; // Guarda los datos decodificados en la solicitud para su uso posterior
                next(); // Continua a la siguiente función middleware
            });
            } else {
                console.log("TOKEN NO AUTORIZADO")
                res.sendStatus(400); // No autorizado
            }
        };


        const cheqpass = async( req, res, next) => {
            const cheq = req.body
            const email = req.body.email
            const password = req.body.password
            console.log(" que llego al del req.body",email, password)
            const validar = await usuario.findOne({email:email})
            console.log(" que llego al validador cheqpass",cheq, validar)
            if(!validar){
                console.log("No hay datos",validar)
                req.flash('error', 'Fallo en el validador, Revise su Email ingresado')
                res.redirect('/')
                return false 
            }
            else{
                const cheqPass = (password+validar._id)
                console.log(" En el validador revisa el email y el password",cheqPass)
                if (email == validar.email && validar.password == cheqPass  ) {
                    console.log('si valido el password')
                    return next();
                }
                    else{ 
                        req.flash('error', 'Fallo en el validador, su password es incorrecto')
                        res.redirect('/users/noestasRegistrado')
                        return false 
                }
            }
        }

        // guardar el mensaje el pull mensajes
        async function guardarMensajes(dataOwner, dataCliente, mensaje, subjectOwner, subjectCliente, codigoPedido){

            const messageOwner = mensaje.messageOwner;
            const messageCliente = mensaje.messageCliente;
            const nombreComercio = dataOwner.nombreEcommerce;
            const idOwner = dataOwner._id
            const nombreCliente = `${dataCliente.nombre} ${dataCliente.apellido}`;
            const idCliente = dataCliente._id

            if (subjectOwner) {
                // Crear objeto para el mensaje del propietario
                const mensajeOwner = new PushMensajes({ messageOwner, nombreCliente, subjectOwner, idOwner, codigoPedido });
                // Guardar el mensaje del propietario en la base de datos
                await mensajeOwner.save();
            }

            if (subjectCliente) {
                // Crear objeto para el mensaje del cliente
                const mensajeCliente = new PushMensajes({ messageCliente, nombreComercio,  subjectCliente, idCliente, codigoPedido });
                // Guardar el mensaje del cliente en la base de datos
                await mensajeCliente.save();
            }
        
        }

        // enviar emails automaticamente
        async function sendMail(dataEnviarEmail) {
            //console.log("Datos recibidos en sendMail:", dataEnviarEmail);
            const {NOUsartransportEmail, reclamo, enviarExcel, emailOwner, emailCliente, numCelCliente, numCelOwner, mensaje, codigoPedido, nombreOwner, nombreCliente, subjectCliente, subjectOwner, otraData,logoOwner, cancelaEnvio, pedidoCobrado, quedaUno, product, inscripcion, Promo, ConsultaOK} = dataEnviarEmail;

            const transportEmail = ConfigG.transportGmail

            //let transportEmail = {}
            
            // if (NOUsartransportEmail) {
            //     transportEmail = NOUsartransportEmail
            // } else {
            //     ConfigG.transportGmail
            // }

            const cliente = nombreCliente;
            let dataPedido23 = {}
            let dataDir2 = {}
            if (otraData && typeof otraData === 'object') {
                // Verifica si `otraData` es un objeto antes de acceder a sus propiedades
                if ('dataPedido23' in otraData && 'dataDir' in otraData) {
                    // Solo accede a las propiedades si existen
                    dataPedido23 = otraData.dataPedido23;
                    dataDir2 = otraData.dataDir;
                } else {
                    // Maneja el caso en que faltan propiedades esperadas
                    console.warn('`otraData` no contiene las propiedades esperadas.');
                }
            } else {
                // Maneja el caso en que `otraData` no es un objeto válido
                console.warn('`otraData` es nulo o no es un objeto.');
            }

            try {
                // Configuración del transporte de correo
                const transporter2 = nodemailer.createTransport({
                    host: "smtp.hostinger.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: "tbs-it.info@tbs-it.net",
                        pass: "Sebatbs@22",
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                });

                const transporter = nodemailer.createTransport(transportEmail);

                // Opciones de correo para el propietario del ecommerce
                let mailOptionsOwner = {};
                // Opciones de correo para el cliente
                let mailOptionsCliente = {};
                
                //aviso del pedido cobrado y enviado
                if (pedidoCobrado) {
                    console.log("Que datos llegan para enviar por email el pedido cobrado", pedidoCobrado)
                    // Formatear el número en formato de moneda local (pesos argentinos)
                    const totalEnPesos = dataPedido23.TotalCompra.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
                    // Generar el HTML para cada producto en el array listaProductos
                    const productosHTML = dataPedido23.listaProductos.map(producto => `
                    <div style="margin-bottom: 20px;">
                        <img src="${producto.imgProd}" alt="${producto.nombreProd}" style="max-width: 100px;">
                        <p><strong>Nombre:</strong> ${producto.nombreProd}</p>
                        <p><strong>Precio:</strong> ${producto.precio}</p>
                        <p><strong>Cantidad:</strong> ${producto.cantidadProductos}</p>
                        <p><strong>Subtotal:</strong> ${producto.subTotalCompra}</p>
                    </div>
                    `).join('');
                    mailOptionsOwner = {
                        from: "tbs-it.info@tbs-it.net",
                        to: ["sebastianpaysse@gmail.com", emailOwner],
                        subject: subjectOwner,
                        html : `
                        <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Nuevo pedido número ${dataPedido23.codigoPedido}</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
                        
                            <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                                <img src="${dataPedido23.logoOwner}" alt="Logo" height="50%" width="50%" style="border-radius: 100%;">
                                <h1 style="margin-bottom: 10px;">¡Nuevo Pedido Recibido!</h1>
                                <h2> ¡ATENCIÓN! <br> Tienes un nuevo pedido número código ${dataPedido23.codigoPedido}</h2>
                            </div>
                        
                            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;"><strong>Mensaje:</strong> ${mensaje.messageOwner}</p>
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                                    <strong>Datos del cliente:</strong>
                                    <br>
                                    <strong>Nombre:</strong> ${cliente} <br>
                                    <strong>Email:</strong> ${emailCliente} <br>
                                    <strong>Número de Celular:</strong> ${numCelCliente} <br>
                                    <br>
                                    <strong>Dirección Entrega:</strong>
                                    <br>
                                    <strong>País:</strong> ${dataDir2.pais} <br>
                                    <strong>Estado/Provincia:</strong> ${dataDir2.estado} <br>
                                    <strong>Localidad:</strong> ${dataDir2.localidad}<br>
                                    <strong>Calle:</strong> ${dataDir2.calle}<br>
                                    <strong>Número puerta:</strong> ${dataDir2.numeroPuerta}<br>
                                    <strong>C.P.:</strong> ${dataDir2.CP}<br>
                                    <br>
                                    <strong>Pedido:</strong>
                                    <br>
                                    <strong>Código Pedido:</strong> ${dataPedido23.codigoPedido} <br>
                                    <strong>Fecha:</strong> ${dataPedido23.fecha} <br>
                                    <strong>Nombre Ecommerce:</strong> ${dataPedido23.nombreEcomm} <br>
                                    <strong>Tipo de Pago:</strong> ${dataPedido23.tipoDePago} <br>
                                    <strong>Status de Envío:</strong> ${dataPedido23.statusEnvio} <br>
                                    <strong>Cantidad total de productos:</strong> ${dataPedido23.totalProductos} <br>
                                    <strong>Total Pago:</strong> ${totalEnPesos} <br>
                                    <strong>Productos:</strong> 
                                    ${productosHTML}
                                </p>
                        
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                                    <strong>
                                    ¡ATENCIÓN!
                                    <br>
                                    Asegúrate de comunicarte inmediatamente y coordinar la entrega, de resultar algún conflicto al respecto la cuenta sera suspendida.
                                    </strong>
                                </p>
                            </div>
                        
                            <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                            <p style="font-size: 14px; color: #fff; ">Por favor ponte en contacto con tu cliente a la brevedad o podrá ser objeto de suspension de tu cuenta.</p>
                            </div>
                        
                        </body>
                        </html>
                        `
                    };
                    mailOptionsCliente = {
                        from: "tbs-it.info@tbs-it.net",
                        to: emailCliente,
                        subject: subjectCliente, // Asegúrate de que subjectCliente esté formateado correctamente
                        html : `
                        <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Nuevo pedido número ${dataPedido23.codigoPedido}</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
                        
                            <div style="background-color: skyblue; color: #fff; padding: 20px; text-align: center;">
                                <img src="${dataPedido23.logoOwner}" alt="Logo" height="50%" width="50%" style="border-radius: 100%;">
                                <h1 style="margin-bottom: 10px;">¡Se recibió tu pedido!</h1>
                                <h2> ¡ATENCIÓN! <br> Se esta preparando tu pedido número código ${dataPedido23.codigoPedido}</h2>
                            </div>
                        
                            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;"><strong>Mensaje:</strong> ${mensaje.messageCliente}</p>
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                                    <strong>Datos del cliente:</strong>
                                    <br>
                                    <strong>Nombre:</strong> ${cliente} <br>
                                    <strong>Email:</strong> ${emailCliente} <br>
                                    <strong>Número de Celular:</strong> ${numCelCliente} <br>
                                    <br>
                                    <strong>Dirección Entrega:</strong>
                                    <br>
                                    <strong>País:</strong> ${dataDir2.pais} <br>
                                    <strong>Estado/Provincia:</strong> ${dataDir2.estado} <br>
                                    <strong>Localidad:</strong> ${dataDir2.localidad}<br>
                                    <strong>Calle:</strong> ${dataDir2.calle}<br>
                                    <strong>Número puerta:</strong> ${dataDir2.numeroPuerta}<br>
                                    <strong>C.P.:</strong> ${dataDir2.CP}<br>
                                    <br>
                                    <strong>Pedido:</strong>
                                    <br>
                                    <strong>Código Pedido:</strong> ${dataPedido23.codigoPedido} <br>
                                    <strong>Fecha:</strong> ${dataPedido23.fecha} <br>
                                    <strong>Nombre Ecommerce:</strong> ${dataPedido23.nombreEcomm} <br>
                                    <strong>Tipo de Pago:</strong> ${dataPedido23.tipoDePago} <br>
                                    <strong>Status de Envío:</strong> ${dataPedido23.statusEnvio} <br>
                                    <strong>Cantidad total de productos:</strong> ${dataPedido23.totalProductos} <br>
                                    <strong>Total Pago:</strong> ${totalEnPesos} <br>
                                    <strong>Productos:</strong> 
                                    ${productosHTML}
                                </p>
                        
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                                    <strong>
                                    ¡ATENCIÓN!
                                    <br>
                                    Asegúrate de comunicarte inmediatamente y coordinar la entrega.
                                    </strong>
                                </p>
                            </div>
                        
                            <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                            <p style="font-size: 14px; color: #fff; ">Por favor ponte en contacto con tu proveedor a la brevedad.</p>
                            </div>
                        
                        </body>
                        </html>
                        `
                    };
                    // Envío de correos electrónicos 
                    await transporter.sendMail(mailOptionsOwner);
                    await transporter.sendMail(mailOptionsCliente);
                }
                // inicia un reclamo consulta
                if (reclamo) {
                    console.log("ENTRO A reclamo consulta")
                    mailOptionsOwner = {
                        from: emailOwner,
                        to: ["sebastianpaysse@gmail.com", emailOwner],
                        subject: subjectOwner,
                        html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>¡¡¡ATENCION!!! <br> Nuevo Reclamo Recibido</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">

                <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                    <h1 style="margin-bottom: 10px;">¡Nuevo Reclamo Recibido!</h1>
                    <img src="${logoOwner}" alt="Logo" height="50%" width="50%" style="border-radius: 100%;">
                    <p style="font-size: 16px;">Se ha recibido una nuevo reclamo desde tu sitio web. </p>
                    <p style="font-size: 16px;">A continuación, se detallan los detalles:</p>
                </div>

                <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                        <strong>Nombre:</strong> ${cliente} <br>
                        <strong>Email:</strong> ${emailCliente} <br>
                        <strong>Número de Celular:</strong> ${numCelCliente}
                    </p>
                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;"><strong>Reclamo por el pedido número:</strong> ${codigoPedido}</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;"><strong>Mensaje:</strong> ${mensaje}</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        Asegúrate de responder a esta reclamo lo antes posible.
                    </p>
                </div>
                <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                <p style="font-size: 14px; color: #fff; ">Por favor ponte en contacto con tu cliente a la brevedad para resolver este importante reclamo o tu cuenta podrá ser objeto de suspension.</p>
                </div>
            </body>
            </html>
                        `
                    };
                    mailOptionsCliente = {
                        from: emailOwner,
                        to: emailCliente,
                        subject: subjectCliente,
                        html: `
                        <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Respuesta a tu Reclamo</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
                        
                            <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                                <img src="${logoOwner}" alt="Logo" height="50%" width="50%" style="border-radius: 100%;">
                                <h1 style="margin-bottom: 10px;">¡Hola ${nombreCliente}!</h1>
                                <p style="font-size: 16px;">En ${nombreOwner}, tu proveedor a recibido tu reclamo y queremos asegurarte que lo estamos revisando.</p>
                            </div>
                        
                            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                                    <strong>Mensaje: <strong>${mensaje}
                                </p>
                        
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                                    Estamos trabajando en proporcionarte una respuesta y nos pondremos en contacto contigo a la brevedad posible.
                                </p>
                        
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                                    puedes comunicarte con nosotros via whatsapp o llamando a: ${numCelOwner}.
                                    Apreciamos tu paciencia y gracias por elegirnos ${cliente}.
                                </p>
                            </div>
                        
                            <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                                <p style="font-size: 14px;color: #fff !important">Póngase en contacto con su proveedor.</p>
                            </div>
                        
                        </body>
                        </html>
                        `
                    };
                    // Envío de correos electrónicos
                    const cheqEnvio1236 = await transporter.sendMail(mailOptionsOwner);
                    const cheqEnvio25879 = await transporter.sendMail(mailOptionsCliente);
                }
                // Opciones de correo para adjuntar un archivo Excel
                if (enviarExcel) {
                    mailOptionsCliente = {
                        from: "tbs-it.info@tbs-it.net",
                        to: emailCliente,
                        subject: subjectCliente, // Asegúrate de que subjectCliente esté formateado correctamente
                        html: `
                            <!DOCTYPE html>
                            <html lang="es">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Respuesta a tu Consulta</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
                            
                                <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                                    <img src="${logoOwner}" alt="Logo" height="50%" width="50%" style="border-radius: 100%;">
                                    <h1 style="margin-bottom: 10px;">¡Hola ${nombreCliente}!</h1>
                                </div>
                            
                                <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                    <p style="font-size: 16px;">En ${nombreOwner}, es un gusto poder enviarte el Excel con la información solicitada.</p>

                                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                                            Puedes comunicarte con nosotros vía WhatsApp o llamando al: ${numCelOwner}.
                                            Apreciamos tu preferencia y gracias por elegirnos.
                                    </p>
                                </div>
                            
                                <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                                    <p style="font-size: 14px;color: #fff !important">Por dudas póngase en contacto con nosotros.</p>
                                </div>
                            
                            </body>
                            </html>
                        `,
                        attachments: [
                            {
                                filename: otraData.filename,
                                path: otraData.filePath, // Objeto Buffer o Stream del archivo adjunto
                            }
                        ]
                    };
                    // Envío de correos electrónicos 
                    await transporter.sendMail(mailOptionsCliente);
                }
                // cancela el envio y el pedido
                if (cancelaEnvio) {
                    const emailOwner1   = emailOwner.replace(/'/g, '').trim();
                    const emailCliente1 = emailCliente.replace(/'/g, '').trim();
                    console.log("Entro a cancelar el envio")
                    mailOptionsOwner = {
                        from: "tbs-it.info@tbs-it.net",
                        to: ["sebastianpaysse@gmail.com", emailOwner1],
                        subject: subjectOwner,
                        html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Se cancelo el pedido número código ${codigoPedido}</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">

                <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                    <img src="${logoOwner}" alt="Logo" height="50%" width="50%" style="border-radius: 100%;">
                    <h1 style="margin-bottom: 10px;">¡Nueva Cancelación Recibida!</h1>
                    <h2> ¡ATENCIÓN! <br> Se cancelo el pedido número código ${codigoPedido}</h2>
                </div>

                <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                        <strong>Nombre:</strong> ${cliente} <br>
                        <strong>Email:</strong> ${emailCliente.emailCliente} <br>
                        <strong>Número de Celular:</strong> ${numCelCliente}
                    </p>

                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;"><strong>Cancelación por el pedido número:</strong> ${codigoPedido}</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;"><strong>Mensaje:</strong> ${mensaje}</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        <strong>
                        ¡ATENCIÓN!
                        <br>
                        Asegúrate de responder a esta cancelación lo antes posible y arreglar las diferencias económicas que pueda haber, de resultar algún conflicto al respecto la cuenta sera suspendida.
                        </strong>
                    </p>
                </div>

                <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                <p style="font-size: 14px; color: #fff; ">Por favor ponte en contacto con tu cliente a la brevedad o podrá ser objeto de suspension de tu cuenta.</p>
                </div>

            </body>
            </html>
                        `
                    };
                    mailOptionsCliente = {
                        from: "tbs-it.info@tbs-it.net",
                        to: emailCliente1,
                        subject: subjectCliente, // Asegúrate de que subjectCliente esté formateado correctamente
                        html: `
                            <!DOCTYPE html>
                            <html lang="es">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Se cancelo tu pedido número código ${codigoPedido}</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
                            
                                <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                                    <img src="${logoOwner}" alt="Logo" height="50%" width="50%" style="border-radius: 100%;">
                                    <h1 style="margin-bottom: 10px;">¡Hola ${nombreCliente}!</h1>
                                </div>
                            
                                <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                    <p style="font-size: 16px;">En ${nombreOwner}, hemos recibido la cancelación del pedido numero ${codigoPedido}. El mismo NO te sera enviado.</p>

                                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                                            Por reintegro económico puedes comunicarte con nosotros vía WhatsApp o llamando al: ${numCelOwner}.
                                            Apreciamos tu preferencia y gracias por elegirnos.
                                    </p>
                                </div>
                            
                                <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                                    <p style="font-size: 14px;color: #fff !important">Por dudas póngase en contacto con nosotros.</p>
                                </div>
                            
                            </body>
                            </html>
                        `,
                    };
                    // Envío de correos electrónicos 
                    await transporter.sendMail(mailOptionsOwner);
                    await transporter.sendMail(mailOptionsCliente);
                }
                // avisa por email cuando solo queda un producto
                if (quedaUno) {
                    console.log("Entro enviar emal de queda un producto")
                    mailOptionsOwner = {
                        from: "tbs-it.info@tbs-it.net",
                        to: ["sebastianpaysse@gmail.com", emailOwner.value],
                        subject: subjectOwner,
                        html: `
                            <!DOCTYPE html>
                            <html lang="es">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Te queda un solo producto en stock</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
                
                                <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                                    <img src="${logoOwner}" alt="Logo" height="50%" width="50%" style="border-radius: 100%;">
                                    <h1 style="margin-bottom: 10px;">¡Atención te queda un solo productos en stock!</h1>
                                </div>
                
                                <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                    <p style="font-size: 16px;">
                                        ${mensaje.messageOwner}
                                    </p>
                                </div>
                
                                <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                                <p style="font-size: 14px; color: #fff; "></p>
                                </div>
                
                            </body>
                            </html>
                            `
                        };
                    // Envío de correos electrónicos
                    const cheqEnvio1236 = await transporter.sendMail(mailOptionsOwner);
                }
                // inicia un reclamo
                if (ConsultaOK) {
                    
                    console.log("ENTRO A Consultaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", emailOwner, emailCliente)

                    mailOptionsOwner = {
                        from: "tbs-it.info@tbs-it.net",
                        to: ["sebastianpaysse@gmail.com", emailOwner],
                        subject: subjectOwner,
                        html: `
                        <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Nueva Consulta Recibida</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
                        
                            <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                                <h1 style="margin-bottom: 10px;">¡Nueva Consulta Recibida!</h1>
                                <p style="font-size: 16px;">Has recibido una nueva consulta. </p>
                                <p style="font-size: 16px;">A continuación, se detallan los datos:</p>
                            </div>
                        
                            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                                    <strong>Nombre:</strong> ${nombreCliente} <br>
                                    <strong>Email:</strong> ${emailCliente} <br>
                                    <strong>Ciudad:</strong> ${dataDir2.ciudad} <br>
                                    <strong>Número de Celular:</strong> ${numCelCliente}
                                </p>
                        
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                                    <strong>Mensaje:</strong> ${mensaje}
                                </p>
                        
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                                    Asegúrate de responder a esta consulta lo antes posible.
                                </p>
                            </div>
                        
                            <div style="background-color: #ff6f61; color: #fff; padding: 20px; text-align: center;">
                                <p style="font-size: 14px; color: #fff; ">Este mensaje fue enviado por un cliente desde el correo electrónico ${emailCliente}.</p>
                            </div>
                        
                        </body>
                        </html>
                        `
                    };
                    mailOptionsCliente = {
                        from: "tbs-it.info@tbs-it.net",
                        to: emailCliente,
                        subject: subjectCliente,
                        html: `
                        <!DOCTYPE html>
                        <html lang="es">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Respuesta a tu Consulta</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
                        
                            <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                                <h1 style="margin-bottom: 10px;">¡Hola ${nombreCliente}!</h1>
                                <p style="font-size: 16px;">En ${nombreOwner}, hemos recibido tu consulta y queremos agradecerte por ponerte en contacto con nosotros desde la ciudad de ${dataDir2.ciudad}.</p>
                            </div>
                        
                            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                                    ${mensaje}
                                </p>
                        
                                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                                    Estamos trabajando en proporcionarte una respuesta y nos pondremos en contacto contigo a la brevedad posible.
                                </p>
                        
                                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                                    Apreciamos tu paciencia y gracias por elegirnos ${nombreCliente}.
                                </p>
                            </div>
                        
                            <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                                <p style="font-size: 14px;color: #fff !important">Este mensaje fue enviado desde el correo electrónico de ${emailCliente}.</p>
                            </div>
                        
                        </body>
                        </html>
                        `
                    };
                    // Envío de correos electrónicos
                    const cheqEnvio1236  = await transporter.sendMail(mailOptionsOwner);
                    const cheqEnvio25879 = await transporter.sendMail(mailOptionsCliente);
                }
                // envia email de tu inscripcion
                if (inscripcion) {
                    mailOptionsOwner = {
                        from: "tbs-it.info@tbs-it.net",
                        to: ["sebastianpaysse@gmail.com", emailOwner.value],
                        subject: subjectOwner,
                        html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido ausatiendafacil.com</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        body {
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
        }
        .email-container {
            width: 100%;
            background-color: #f4f4f4;
            padding: 20px 0;
        }
        .email-content {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background-color: #007bff;
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-width: 150px;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .header h1 {
            margin: 10px 0 0;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            line-height: 1.6;
        }
        .footer {
            background-color: #007bff;
            color: #fff;
            padding: 10px;
            text-align: center;
            font-size: 14px;
        }
        .footer a {
            color: #fff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-content">
            <div class="header">
                <img src="URL_DEL_LOGO" alt="Logo de la tienda" 
                    onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/a/a1/Shopify_logo_2021.svg';" />
                <h1>¡Bienvenid@ a usatiendafacil.com!</h1>
            </div>
            <div class="content">
                <p><strong>${mensaje}</strong></p>
            </div>
            <div class="footer">
                <p>TiendaFacil. Todos los derechos reservados para TBS-IT.</p>
                <p><a href="https://usatiendafacil.com.com">Visita nuestro sitio</a></p>
            </div>
        </div>
    </div>
</body>
</html>

                            `
                        };
                    // Envío de correos electrónicos
                    const cheqEnvio1236 = await transporter.sendMail(mailOptionsOwner);
                }
                // aviso de promocion 
                if (Promo) {
                    console.log("Que Producto Promo viene para enviar por email", Promo)
                    const {nuevaPromocion} = otraData
                    const producto = nuevaPromocion
                    console.log("Que Producto Promo viene para enviar por email", producto)
                    // Función para dar formato de moneda a un valor
                    function formatoMoneda(valor) {
                        valor = Number(valor);
                        if (isNaN(valor)) {
                            console.error("Error: El valor no es un número válido");
                            return null;
                        }
                        return `${valor.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                    }

                    // Función para calcular el precio final
                    function calcularPrecioFinal(precio, descuento) {
                        return precio - descuento;
                    }

                    // Función para formatear la fecha
                    function formatoFecha(fecha) {
                        const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
                        return new Date(fecha).toLocaleDateString('es-ES', opciones);
                    }

                    // Función para calcular los días restantes
                    function calcularDiasRestantes(fechaFin) {
                        const hoy = new Date();
                        const fechaFinal = new Date(fechaFin);
                        const diferencia = fechaFinal - hoy;
                        return Math.ceil(diferencia / (1000 * 60 * 60 * 24)); // Convertir milisegundos a días
                    }

                    // Variables calculadas
                    //const promRestantes = calcularPromRestantes(producto.cantidadDisponible, producto.cantidadPromoVendidas);
                    const precio        = formatoMoneda(producto.precio);
                    const descuento     = formatoMoneda(producto.descuento);
                    // Calcular el precio final con descuento
                    const precioConDescuento = producto.precio * (1 - producto.descuento / 100);
                    const precioFinal = formatoMoneda(precioConDescuento);
                    const fechaInicio   = formatoFecha(producto.fechaInicio);
                    const fechaFin      = formatoFecha(producto.fechaFin);
                    const diasRestantes = calcularDiasRestantes(producto.fechaFin);
                    const productoId    = producto._id;

                    // Crear contenido de imágenes
                    const imagenes = producto.rutaSimpleImg.map(img => `
                        <div style="margin: 10px; display: inline-block; border: 2px solid #ff6f61; border-radius: 10px; overflow: hidden;">
                            <img src="${img}" style="width: 20%; height: auto; border-radius: 10px;" alt="Producto">
                        </div>
                    `).join('');

                        // Crear el contenido del correo email
                        const cardPromo = `
                            <div class="container mt-4" style="max-width: 600px; background: #f8f8f8; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                                <h2 style="text-align: center; color: #333; font-family: 'Arial Black', sans-serif; margin-bottom: 20px;">${producto.nombrePromocion}</h2>
                                <div style="width: 100%; text-align: center; margin-bottom: 20px;">
                                    ${imagenes}
                                </div>
                                <div style="text-align: center; margin-bottom: 20px;">
                                    <img src="https://example.com/gif-promocion.gif" alt="¡Compra Ya!" width="100%" style="border-radius: 10px;">
                                </div>
                                <div style="text-align: left; margin-top: 10px;">
                                    <h3 style="color: #ff6f61; font-family: 'Arial', sans-serif;">Descripción de la promoción</h3>
                                    <p style="line-height: 1.5; color: #555;">${producto.descripcionPromocion}</p>
                                    <p style="line-height: 1.5; color: #555;"><strong>Nombre del producto:</strong> ${producto.nombreProducto || 'No definido'}</p>
                                    <p style="line-height: 1.5; color: #555;"><strong>Precio:</strong> $${precio}</p>
                                    <p style="line-height: 1.5; color: #555;"><strong>Descuento:</strong> ${descuento}%</p>
                                    ${producto.cantLlevar ? `
                                        <p style="line-height: 1.5; color: #555;"><strong>Promo en cantidad:</strong> ${producto.cantLlevar} X ${producto.cantPagar}</p>
                                    ` : ''}
                                    <p style="line-height: 1.5; color: #555;"><strong>Cantidad de promociones ofrecidas:</strong> ${producto.cantidadDisponible}</p>
                                    <p style="line-height: 1.5; color: #555;" hidden><strong>Promociones vendidas:</strong> ${producto.cantidadPromoVendidas}</p>
                                    <p style="line-height: 1.5; color: #555;"><strong>Quedan:</strong> 3 </p>
                                    <p style="line-height: 1.5; color: #555;"><strong>Fecha Inicio:</strong> ${fechaInicio}</p>
                                    <p style="line-height: 1.5; color: #555;"><strong>Fecha Fin:</strong> ${fechaFin}</p>
                                    <p style="line-height: 1.5; color: #555;"><strong>Días que restan:</strong> ${diasRestantes}</p>
                                    <div style="text-align: center; margin-top: 20px;">
                                        <strong style="font-size: 24px; color: #ff6f61;">Precio Final: $${precioFinal}</strong>
                                    </div>
                                    <div style="text-align: center; margin-top: 20px;">
                                        <a href="${producto.promoLink}" style="display: inline-block; padding: 15px 30px; background-color:#007bff; color: #fff; text-decoration: none; border-radius: 5px; font-family: 'Arial Black', sans-serif;">
                                            <i class="fas fa-shopping-cart"></i> Ver promo
                                        </a>
                                    </div>
                                </div>
                            </div>
                        `;

                        const emailTemplate = (content) => `
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
                                        background-color:#007bff;
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
                                </style>
                            </head>
                            <body>
                                <div class="header">
                                    <img src="${logoOwner}" alt="Logo" width="50%">
                                    <h1>¡Nueva Promoción Recibida!</h1>
                                </div>
                                <div class="container">
                                    ${content}
                                </div>
                                <div class="footer">
                                    <p>Revisa las condiciones y validez del pedido.</p>
                                </div>
                            </body>
                            </html>
                        `;

                        // se debe agregar la cantidad de todos los emails de todos los clientes del que hace la promo
                        const mailOptionsOwner = {
                            from: "tbs-it.info@tbs-it.net",
                            to: ["sebastianpaysse@gmail.com", emailOwner],
                            subject: subjectOwner,
                            html: emailTemplate(cardPromo),
                        };

                        const mailOptionsCliente = {
                            from: "tbs-it.info@tbs-it.net",
                            to: ["sebastianpaysse@gmail.com", emailCliente],
                            subject: subjectOwner,
                            html: emailTemplate(cardPromo),
                        };

                        // Envío de correos electrónicos 
                        await transporter.sendMail(mailOptionsOwner);
                        await transporter.sendMail(mailOptionsCliente);

                }

                return true;
            } catch (error) {
                console.log("Hubo un error al enviar el correo electrónico, intente más tarde:", error);
                return error;
            }
        }

        // es para guardar la imagen del logo de la empresa owner
        async function guardarImagen(dataImagen, empresa, idOwner) {
            //console.log('entro en la funcion enviarImagenAServidorDovemailer:', dataImagen);
            try {
                // Función para buscar y borrar la imagen si existe
                function buscarYBorrarImagen(idOwner, rutaCarpeta) {
                    //console.log("Entró a la función buscarYBorrarImagen");
                    fs.readdir(rutaCarpeta, (err, archivos) => {
                        if (err) {
                            console.error('Error al leer el directorio:', err);
                            return;
                        }
                        let imagenEncontrada = false;
                        archivos.forEach(archivo => {
                            if (archivo.includes(idOwner)) {
                                fs.unlink(path.join(rutaCarpeta, archivo), err => {
                                    if (err) {
                                        console.error('Error al eliminar la imagen:', err);
                                        return;
                                    }
                                    //console.log(`Se eliminó la imagen con el ID "${idOwner}"`);
                                });
                                imagenEncontrada = true;
                            }
                        });
                        if (!imagenEncontrada) {
                            //console.log(`No se encontró ninguna imagen con el ID "${idOwner}"`);
                        }
                    });
                }

                // Función para crear la carpeta si no existe
                const crearCarpeta = async (nombreCarpeta) => {
                    const nombreCarpeta2 = nombreCarpeta.toLowerCase().replace(/\s+/g, '');
                    //console.log("desde gurdar la imagen", nombreCarpeta2)
                    const createCarpeta = path.join(__dirname, `../public/img/uploads/${nombreCarpeta2}/logo`)
                    //console.log("********************************************************que carpeta creo", createCarpeta)
                    if (!fs.existsSync(createCarpeta)) {
                        await fs.promises.mkdir(createCarpeta, { recursive: true });
                        //console.log('La carpeta fue creada exitosamente:', createCarpeta);
                    } else {
                        //console.log('La carpeta ya existe:', createCarpeta);
                    }
                    return createCarpeta;
                };

                const moverImagenaCarpeta = async (dataImagen, nombreCarpeta2, idOwner, rutaCarpeta) => {
                    const nombreCarpeta = nombreCarpeta2.toLowerCase().replace(/\s+/g, '');
                    //console.log("Entro a la funcion mover imagena carpeta creada",)
                    try {
                        // Asegurarse de que la carpeta exista
                        const existe = await fsExtra.ensureDir(rutaCarpeta);
                        //console.log("Existe la carpeta",existe)
                        // Crear un nombre único para la imagen
                        const extension = dataImagen.name.split('.').pop();
                        const nombreImagen = dataImagen.name.split('.').slice(0, -1).join('.');
                        const nombreImg = `${nombreImagen}-${idOwner}.${extension}`;
                        const rutaCompletaArchivo = path.join(rutaCarpeta, nombreImg);
                        //console.log("rutaCompletaArchivo de la carpeta****************************************************************************", rutaCompletaArchivo)

                        // Leer el contenido de la imagen
                        const imagenBuffer = fs.readFileSync(dataImagen.tempFilePath);
                
                        // Escribir el contenido en un nuevo archivo en la carpeta de destino
                        // Mueve el archivo al directorio de carga según el sistema operativo

                        // Determinar el sistema operativo
                        const isWindows = os.platform() === 'win32';
                        if (isWindows) {
                            // Para Windows
                            fs.writeFileSync(rutaCompletaArchivo, imagenBuffer);
                            //console.log("Guarda usando windows")
                        } else {
                            // Para otros sistemas (por ejemplo, Ubuntu)
                            fs.renameSync(file.tempFilePath, rutaCompletaArchivo);
                            //console.log("Guarda usando obuntu")
                        }
                        // Comprobar si la imagen se guardó correctamente
                        if (fs.existsSync(rutaCompletaArchivo)) {
                            const rutaURL = `uploads/${nombreCarpeta}/logo/${nombreImg}`;
                            //console.log("Comprobando que si se guardo la imagen", rutaURL)
                            return { ok: true, rutaCompletaArchivo, rutaURL, idOwner };
                        } else {
                            throw new Error("No se pudo mover la imagen a la carpeta");
                        }
                    } catch (err) {
                        //console.error('Error en la subida de la imagen a la carpeta:', err);
                        throw err;
                    }
                };


                // Obtener la ruta de la carpeta
                const rutaCarpeta = await crearCarpeta(empresa);
                //console.log('Ruta de la carpeta creada:', rutaCarpeta);
                buscarYBorrarImagen(idOwner, rutaCarpeta);

                // Mover la imagen a la carpeta
                const dataSend = await moverImagenaCarpeta(dataImagen, empresa, idOwner, rutaCarpeta);
                //console.log('Movió la imagen a crearCarpeta', dataSend);
                
                return dataSend;
            } catch (error) {
                //console.error('Error en la función enviarImagenAServidorDovemailer:', error.message);
                throw error;
            }
        }

        async function guardarImagenCli(dataImagen, tienda, idOwner, clientesOK) {
            try {
                // Acceder a la propiedad de imagen
                const imagen = dataImagen.imagen;
        
                //console.log("Imagen recibida:", imagen);
        
                // Verificar que imagen y imagen.name existan
                if (!imagen || !imagen.name) {
                    throw new Error("No se proporcionó una imagen válida.");
                }
        
                // Normalizar el nombre de la carpeta
                const nombreCarpeta = tienda.toLowerCase().replace(/\s+/g, '');
                console.log("Nombre de la carpeta normalizado:", nombreCarpeta);
        
                // Definir la ruta de la carpeta donde se guardará la imagen
                const rutaCarpeta = path.join(__dirname, `../public/img/uploads/${clientesOK ? 'CarpetaClientes/' : ''}${nombreCarpeta}/logo`);
                //console.log("Ruta de la carpeta para guardar la imagen:", rutaCarpeta);
        
                // Crear la carpeta si no existe
                await fsExtra.ensureDir(rutaCarpeta);
                //console.log("Carpeta creada o ya existe:", rutaCarpeta);
        
                // Buscar y borrar imágenes anteriores si existen
                const archivos = await fs.promises.readdir(rutaCarpeta);
                //console.log("Archivos en la carpeta:", archivos);
                
                // Borrar imágenes que coincidan con idOwner
                await Promise.all(archivos.map(async archivo => {
                    if (archivo.includes(idOwner)) {
                        await fs.promises.unlink(path.join(rutaCarpeta, archivo));
                        console.log(`Se eliminó la imagen anterior con ID "${idOwner}":`, archivo);
                    }
                }));
        
                // Crear nombre único para la imagen
                const extension = path.extname(imagen.name);
                //console.log("Extensión de la imagen:", extension);
                const nombreImg = `${path.basename(imagen.name, extension)}-${idOwner}${extension}`;
                //console.log("Nombre de la imagen que se guardará:", nombreImg);
                const rutaCompletaArchivo = path.join(rutaCarpeta, nombreImg);
                //console.log("Ruta completa del archivo donde se guardará la imagen:", rutaCompletaArchivo);
        
                // Leer el contenido de la imagen desde el archivo temporal
                const imagenBuffer = fs.readFileSync(imagen.tempFilePath);
                //console.log("Buffer de imagen leído desde el archivo temporal.");
        
                // Escribir la imagen en la nueva ubicación
                fs.writeFileSync(rutaCompletaArchivo, imagenBuffer);
                //console.log("Imagen guardada en:", rutaCompletaArchivo);
        
                // Comprobar si la imagen se guardó correctamente
                if (!fs.existsSync(rutaCompletaArchivo)) {
                    throw new Error("No se pudo mover la imagen a la carpeta");
                }
        
                // Generar la URL de la imagen guardada
                const rutaURL = `uploads/${clientesOK ? 'CarpetaClientes/' : ''}${nombreCarpeta}/logo/${nombreImg}`;
                //console.log("URL de la imagen guardada:", rutaURL);
        
                // Devolver un objeto con la información de la imagen guardada
                return { ok: true, rutaCompletaArchivo, rutaURL, idOwner };
        
            } catch (error) {
                console.error('Error en guardarImagen:', error.message);
                throw error;
            }
        }

        async function guardarImagenNews(dataImagen, empresa, idOwner) {
            //console.log('Entro en la función guardarImagenNews:', dataImagen);
            
            try {
                // Función para crear la carpeta si no existe
                const crearCarpeta = async (nombreCarpeta) => {
                    const createCarpeta = path.join(__dirname, '../public/img/uploads', nombreCarpeta, 'News');
                    console.log('Intentando crear carpeta:', createCarpeta);
        
                    try {
                        await fs.promises.mkdir(createCarpeta, { recursive: true });
                        console.log('La carpeta fue creada exitosamente:', createCarpeta);
                    } catch (err) {
                        if (err.code === 'EEXIST') {
                            console.log('La carpeta ya existe:', createCarpeta);
                        } else {
                            throw err;
                        }
                    }
                    return createCarpeta;
                };
        
                // Función para mover la imagen a la carpeta
                const moverImagenACarpeta = async (dataImagen, nombreCarpeta, idOwner, rutaCarpeta) => {
                    console.log("Entró a la función moverImagenACarpeta");
        
                    try {
                        // Crear un nombre único para la imagen
                        const extension = dataImagen.image.name.split('.').pop();
                        const nombreImagen = dataImagen.image.name.split('.').slice(0, -1).join('.');
                        const nombreImg = `${nombreImagen}-${idOwner}.${extension}`;
                        const rutaCompletaArchivo = path.join(rutaCarpeta, nombreImg);
        
                        // Leer el contenido de la imagen
                        const imagenBuffer = fs.readFileSync(dataImagen.image.tempFilePath);
        
                        // Escribir el contenido en un nuevo archivo en la carpeta de destino
                        fs.writeFileSync(rutaCompletaArchivo, imagenBuffer);
                        console.log("Imagen guardada en:", rutaCompletaArchivo);
        
                        // Construir la URL de acceso a la imagen
                        const rutaURL = `/img/uploads/${nombreCarpeta}/News/${nombreImg}`;
        
                        return { ok: true, rutaCompletaArchivo, rutaURL, idOwner };
                    } catch (err) {
                        console.error('Error en la subida de la imagen a la carpeta:', err);
                        throw err;
                    }
                };
        
                // Obtener la ruta de la carpeta
                const rutaCarpeta = await crearCarpeta(empresa);
                console.log('Ruta de la carpeta creada:', rutaCarpeta);
        
                // Mover la imagen a la carpeta
                const dataSend = await moverImagenACarpeta(dataImagen, empresa, idOwner, rutaCarpeta);
                console.log('Movió la imagen a la carpeta:', dataSend);
        
                return dataSend;
            } catch (error) {
                console.error('Error en la función guardarImagenNews:', error.message);
                throw error;
            }
        }

        async function guardarFondo(dataImagen, empresa, idOwner) {
            console.log('entro en la funcion guardarFondo:', dataImagen, empresa, idOwner);
            const nombreEmpresa = empresa.empresa.toLowerCase().replace(/\s+/g, '');
            const idOwner2 = idOwner.idOwner
            try {
                // Función para buscar y borrar la imagen si existe
                function buscarYBorrarImagen(idOwner2, rutaCarpeta) {
                    console.log("Entró a la función buscarYBorrarImagen");
                    fs.readdir(rutaCarpeta, (err, archivos) => {
                        if (err) {
                            console.error('Error al leer el directorio:', err);
                            return;
                        }
                        let imagenEncontrada = false;
                        archivos.forEach(archivo => {
                            if (archivo.includes(idOwner2)) {
                                fs.unlink(path.join(rutaCarpeta, archivo), err => {
                                    if (err) {
                                        console.error('Error al eliminar la imagen:', err);
                                        return;
                                    }
                                    console.log(`Se eliminó la imagen con el ID "${idOwner2}"`);
                                });
                                imagenEncontrada = true;
                            }
                        });
                        if (!imagenEncontrada) {
                            console.log(`No se encontró ninguna imagen con el ID "${idOwner2}"`);
                        }
                    });
                }

                // Función para crear la carpeta si no existe
                const crearCarpeta = async (nombreCarpeta) => {
                    console.log("desde gurdar la imagen", nombreCarpeta)
                    //const createCarpeta = path.join(__dirname, '../../public/img/uploads', nombreCarpeta, '/logo');
                    //const createCarpeta = `${path.join(__dirname, '../../public/img/uploads', nombreCarpeta)}\logo`;
                    const createCarpeta = path.join(__dirname, `../public/img/uploads/${nombreCarpeta}/fondo`)
                    //const uploadDir     = path.join(__dirname, '../../public/img/uploads', ecommerceName, '/productos');
                    console.log("********************************************************que carpeta creo", createCarpeta)

                    if (!fs.existsSync(createCarpeta)) {
                        await fs.promises.mkdir(createCarpeta, { recursive: true });
                        console.log('La carpeta fue creada exitosamente:', createCarpeta);
                    } else {
                        console.log('La carpeta ya existe:', createCarpeta);
                    }
                    return createCarpeta;
                };

                const moverImagenaCarpeta = async (dataImagen, nombreCarpeta, idOwner2, rutaCarpeta) => {
                    console.log("Entro a la funcion mover imagena carpeta creada",)
                    try {
                        // Asegurarse de que la carpeta exista
                        const existe = await fsExtra.ensureDir(rutaCarpeta);
                        //console.log("Existe la carpeta",existe)
                        // Crear un nombre único para la imagen
                        const extension = dataImagen.name.split('.').pop();
                        const nombreImagen = dataImagen.name.split('.').slice(0, -1).join('.');
                        const nombreImg = `${nombreImagen}-${idOwner2}.${extension}`;
                        const rutaCompletaArchivo = path.join(rutaCarpeta, nombreImg);
                        console.log("rutaCompletaArchivo de la carpeta****************************************************", rutaCompletaArchivo)

                        // Leer el contenido de la imagen
                        const imagenBuffer = fs.readFileSync(dataImagen.tempFilePath);
                
                        // Escribir el contenido en un nuevo archivo en la carpeta de destino
                        // Mueve el archivo al directorio de carga según el sistema operativo
                        const os = require('os');
                        // Determinar el sistema operativo
                        const isWindows = os.platform() === 'win32';
                        if (isWindows) {
                            // Para Windows
                            fs.writeFileSync(rutaCompletaArchivo, imagenBuffer);
                            console.log("Guarda usando windows")
                        } else {
                            // Para otros sistemas (por ejemplo, Ubuntu)
                            fs.renameSync(file.tempFilePath, rutaCompletaArchivo);
                            console.log("Guarda usando obuntu")
                        }
                        // Comprobar si la imagen se guardó correctamente
                        if (fs.existsSync(rutaCompletaArchivo)) {
                            const rutaURL = `uploads/${nombreCarpeta}/fondo/${nombreImg}`;
                            console.log("Comprobando que si se guardo la imagen", rutaURL)
                            return { ok: true, rutaCompletaArchivo, rutaURL, idOwner2 };
                        } else {
                            throw new Error("No se pudo mover la imagen a la carpeta");
                        }
                    } catch (err) {
                        console.error('Error en la subida de la imagen a la carpeta:', err);
                        throw err;
                    }
                };


                // Obtener la ruta de la carpeta
                const rutaCarpeta = await crearCarpeta(nombreEmpresa);
                console.log('Ruta de la carpeta creada:', rutaCarpeta);
                buscarYBorrarImagen(idOwner2, rutaCarpeta);

                // Función para mover la imagen a la carpeta
                const fsExtra = require('fs-extra');

                // Mover la imagen a la carpeta
                const dataSend = await moverImagenaCarpeta(dataImagen, nombreEmpresa, idOwner2, rutaCarpeta);
                console.log('Movió la imagen a crearCarpeta', dataSend);
                
                return dataSend;
            } catch (error) {
                console.error('Error en la función enviarImagenAServidorDovemailer:', error.message);
                throw error;
            }
        }

        async function enpointsFactory(urlServer) {
            const endpointTokensArray = []
            const generateRandomString = (length = 128) => Array.from(crypto.getRandomValues(new Uint8Array(length)), byte => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[byte % 62]).join('');
            for (let i = 0; i < 100; i++) {
                const formEndpoint = (generateRandomString().toString());
                const endpointTokenMasUrlServer = `${urlServer}/${formEndpoint}`
                endpointTokensArray.push(endpointTokenMasUrlServer);
            }
            return endpointTokensArray
        }

        async function SingUp(emailXYZ123, passwordXYZ123, ticketNumber, datosExtrasdeMP, ticketPath, cantPRODO, tiempoContratoO, precioFinal, urlServer) {
            try {
                const password = passwordXYZ123
                console.log("Entro a la funcion de SignUp de funcionesymas 99999",emailXYZ123, passwordXYZ123, ticketNumber, datosExtrasdeMP, ticketPath, cantPRODO, tiempoContratoO, precioFinal);
        
                const transportEmail = ConfigG.transportEmail
                const cantContratosMemRealizados = [];

                let tipoM = ""

                if (ticketNumber) {
                    tipoM = "premium"
                } else {
                    tipoM = "basic"
                }
                
                // Calcula la fecha de vencimiento sumando los meses al valor actual
                const fechaCompraCantProd = new Date();
                const fechaVencimientoCantProd = new Date(fechaCompraCantProd);
                
                // Suma los meses a la fecha actual
                fechaVencimientoCantProd.setMonth(fechaVencimientoCantProd.getMonth() + tiempoContratoO);
                
                cantContratosMemRealizados.push({
                    canProd: cantPRODO,
                    tiempoCOntratadoProd: tiempoContratoO,
                    fechaCompraCantProd,
                    fechaVencimientoCantProd,
                    ticketPath,
                    ticketNumber,
                    precioFinal
                });
                
                console.log(cantContratosMemRealizados);
                
                const email = emailXYZ123;

                const newUser = new usuario({cheqDocument:false, cheqDataFaltante:false,
                    desingShop: "No tiene", usuarioBloqueado: true, tyc: true, email, password, statusInscrip: "Incompleto", transportEmail, emails: [{ emailOwner: email }], clientes: [], numCel: [], Ventas: [], linksredesSociales: {}, mediasDPagoCobro: {}, realPass: password, pathLogo: "/images/usuario.png", tipoMembresia: tipoM, urlOwner: "", urlServer, direcciones: [], quienesSomos: {}, dominioOwner: "No tiene", fondoPantalla: "No tiene", mostrarPromoPPrin: true, renovarMem: false, misProductos: [], fechaVencMem:fechaVencimientoCantProd, TotalProdCOntratados:cantPRODO,cantContratosMemRealizados
                });
                
                newUser.password = await newUser.encryptPassword(password);

                if (ticketNumber) {
                    newUser.ticketNumber = ticketNumber;
                    newUser.ticketPath   = ticketPath;
                    //newUser.datosExtrasdeMP = datosExtrasdeMP;
                }

                await newUser.save();
                const id = newUser._id;
        
                return { id, cheqSignUp: true };
        
            } catch (error) {
                console.error('Error en SingUp:', error);
                return { cheqSignUp: false, error: error.message };
            }
        }

        async function UpDateUpGrade(dataSendUpGrade) {
            console.log("************* UPGRADE OWNER  999999 Entro a la funcion", dataSendUpGrade);
            try {
                let { ownerID, paymentMethod, ticketNumber, ticketPath, dataPAyO: { precioPEsos, quantity, duration, tipoDPago }, cantProdQTiene, cantContratosMemRealizados, fechaVencMem, tipoMembresia, precioFinal } = dataSendUpGrade;
                
                //const fechaVencMemDate = new Date(fechaVencMem.replace(/"/g, ''));
                const fechaVencMemDate = fechaVencMem
                if (isNaN(fechaVencMemDate.getTime())) throw new Error("La fecha de vencimiento es inválida");

                const dataUser = await usuario.findByIdAndUpdate(ownerID) 
                if (dataUser.renovarMem) {
                    tipoMembresia = "basic"
                }

                const fechaVencMemNew = tipoMembresia === "basic"
                ? new Date(
                    fechaVencMemDate.getFullYear() + duration / 12, 
                    fechaVencMemDate.getMonth(), 
                    fechaVencMemDate.getDate(), 
                    fechaVencMemDate.getHours(), 
                    fechaVencMemDate.getMinutes(), 
                    fechaVencMemDate.getSeconds()
                )
                : fechaVencMemDate ;
            
            console.log("Año actual:", fechaVencMemDate.getFullYear());
            console.log("Años a agregar:", duration / 12);
            console.log("Nuevo año:", fechaVencMemDate.getFullYear() + duration / 12);
            console.log("Fecha de vencimiento nueva:", fechaVencMemNew);
            // Verifica si TotalProdCOntratados es un número válido antes de actualizarlo


                cantContratosMemRealizados.push({
                    canProd: quantity,
                    tiempoCOntratadoProd: duration,
                    fechaCompraCantProd: new Date(),
                    precioCompra: precioPEsos,
                    fechaVencimientoCantProd: fechaVencMemNew,
                    ticketNumber, ticketPath, tipoDPago, medioCanalDPago: paymentMethod,
                    precioFinal
                });

                const TotalProdCOntratados = Number(cantProdQTiene) + Number(quantity);
                console.log("Actualización exitosa TotalProdCOntratados:", TotalProdCOntratados, cantProdQTiene, quantity);

                const tipoMembresiaUpdated = "premium";
                const renovarMem = false
                const updatedOwner = ownerID ? await usuario.findByIdAndUpdate(ownerID, 
                    { tipoMembresia: tipoMembresiaUpdated, fechaVencMem: fechaVencMemNew, TotalProdCOntratados, cantContratosMemRealizados, medioCanalDPago: paymentMethod, renovarMem }, { new: true }) : {};

                console.log("Actualización exitosa:", TotalProdCOntratados, updatedOwner);
                return {ownerID, fechaVencMem: fechaVencMemNew, successUpdated: true, error: "La membresía se actualizó correctamente" };
            } catch (error) {
                console.error('Error en UpDateUpGrade:', error);
                return { successUpdated: false, error: error.message };
            }
        }
        

        async function consultarEstadoPago(paymentId) {
            const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
            const uril= `https://api.mercadopago.com/v1/payments/${paymentId}`
            try {
                const GrlData = await GrlConfig.findOne()
                const PrivToken = GrlData.ArTokenPrivateMP
                const response = await fetch(uril, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${PrivToken}`,
                    'Content-Type': 'application/json',
                },
                });
            
                // Verificar si la respuesta fue exitosa
                if (!response.ok) {
                throw new Error(`Error en la consulta: ${response.status} ${response.status}`);
                }
            
                const paymentData = await response.json(); // Parsear la respuesta a JSON 
                return paymentData;
            
            } catch (error) {
                console.error('Error al consultar el estado del pago:', error);
                throw error;
            }
        }


        function eliminarImagenes(imagePaths) {
            console.log("Que path a eliminar llega a eliminar imagenes)??????",imagePaths)
            // Asegúrate de que imagePaths sea un array
            const pathsArray = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
            
            let allDeleted = true; // Asumimos que todas las eliminaciones serán exitosas
        
            pathsArray.forEach(imagePath => {
                const normalizedPath = path.normalize(imagePath);
                try {
                    fs.unlinkSync(normalizedPath); // Elimina el archivo
                } catch (error) {
                    console.error(`Error al eliminar la imagen ${normalizedPath}:`, error);
                    allDeleted = false; // Al menos una eliminación falló
                }
            });
        
            return allDeleted; // Retorna true si todas las eliminaciones fueron exitosas
        }


        function compararFechas(informe, lasDateInfo) {
            // Convertir lasDateInfo a un objeto Date
            const fechaActual = new Date(lasDateInfo);
            
            // Inicializar los arrays para los informes recientes y viejos
            let nuevosRecientes = [];
            let informesViejos = [];
        
            // Iterar sobre cada objeto del informe y clasificar por fecha
            informe.forEach((item) => {
                // Convertir la fecha del informe a un objeto Date
                const [day, month, yearTime] = item.Date.split('/');
                const [year, time] = yearTime.split(' ');
                const fechaItem = new Date(`20${year}-${month}-${day}T${time}:00`);
        
                // Comparar las fechas
                if (fechaItem > fechaActual) {
                    nuevosRecientes.push(item); // Agregar a nuevosRecientes si es más reciente
                } else {
                    informesViejos.push(item); // Agregar a informesViejos si no es más reciente
                }
            });
        
            // Devolver los arrays clasificados
            return {
                nuevosRecientes,
                informesViejos
            };
        }
        



module.exports = {
    compararFechas,
    guardarImagenCli,
    eliminarImagenes,
    consultarEstadoPago,
    SingUp,
    UpDateUpGrade,
    endpointTokensArray2,
    verificarToken,
    guardarImagen,
    guardarImagenNews,
    guardarFondo,
    sendMail,
    guardarMensajes,
    cheqpass,
    enpointsFactory
};  

/********************************************************************************************************** */
/* es la funcion automatica que envia email y mensajes para avisar del vencimieno de la membresia*/
/********************************************************************************************************** */
async function checkMembershipExpirationFull() {

    // Función para mostrar alertas (debe ser implementada)
    function mostrarAlerta(message) {
        console.log(message); // Reemplaza esto con la lógica de mostrar alertas en tu aplicación
    }

    // Plantilla de correo electrónico en HTML
    const emailTemplate = (name, surname, message) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación de Membresía</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #007bff;
                color: #fff;
                padding: 20px;
                text-align: center;
            }
            .header img {
                max-width: 150px;
                height: auto;
            }
            .content {
                padding: 20px;
                font-size: 16px;
                line-height: 1.6;
            }
            .footer {
                background-color: #007bff;
                color: #fff;
                padding: 10px;
                text-align: center;
                font-size: 14px;
            }
            .footer a {
                color: #fff;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="URL_DEL_LOGO" alt="Logo de la tienda">
                <h1>¡Notificación de Membresía!</h1>
            </div>
            <div class="content">
                <p>Estimado ${name} ${surname},</p>
                <p><strong>${message}</strong></p>
                <p>Por favor, renueva a la brevedad.</p>
                <p>Gracias.</p>
                <p>Atentamente,<br>usatiendafacil.com.com</p>
                <p><a href="https://usatiendafacil.com.com">Visita nuestra página para renovar</a></p>
            </div>
            <div class="footer">
                <p>TiendaFacil. Todos los derechos reservados para TBS-IT.</p>
                <p><a href="https://usatiendafacil.com.com">Visita nuestro sitio</a></p>
            </div>
        </div>
    </body>
    </html>
    `;


    // Función para enviar correos electrónicos
    async function sendEmail(to, subject, name, surname, message, transporter) {
        const mailOptions = {
            from: 'tu-email@gmail.com',
            to: to,
            subject: subject,
            html: emailTemplate(name, surname, message)
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Correo enviado a ${to}`);
        } catch (error) {
            console.error(`Error al enviar correo a ${to}:`, error);
        }
    }

    // Función para verificar la fecha de vencimiento de la membresía
    async function checkMembershipExpiration() {
        // Fecha actual
        const today = new Date();
        
        // Consulta todos los usuarios
        const users = await usuario.find({});
    
        for (const user of users) {
            if (user.fechaVencMem) {
                const expirationDate = new Date(user.fechaVencMem);
                const timeDiff = expirationDate - today;
                const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
                let message = '';
                let emailSubject = 'Notificación de Vencimiento de Membresía';
    
                // Verificar la diferencia de días y crear el mensaje de alerta
                if (daysDiff <= 0) {
                    if (daysDiff === 0) {
                        message = `¡Membresía vencida hoy! Por favor, renueve a la brevedad.`;
                    } else if (daysDiff >= -10) {
                        message = `¡Membresía vencida hace ${-daysDiff} días! Por favor, renueve a la brevedad.`;
                    } else if (daysDiff > -20) {
                        message = `¡Membresía vencida desde hace más de 10 días! Por favor, renueve a la brevedad.`;
                    }
                } else {
                    if (daysDiff <= 10) {
                        message = `¡Membresía está a ${daysDiff} días de vencer! Por favor, renueve a la brevedad.`;
                    } else if (daysDiff <= 20) {
                        message = `¡Membresía está a 20 días de vencer! Por favor, renueve a la brevedad.`;
                    } else if (daysDiff <= 30) {
                        message = `¡Membresía está a 30 días de vencer! Por favor, renueve a la brevedad.`;
                    } else if (daysDiff <= 60) {
                        message = `¡Membresía está a 60 días de vencer! Por favor, renueve a la brevedad.`;
                    }
                }
    
                if (message) {
                    // Mostrar alerta interna
                    mostrarAlerta(message);
    
                    const dataConfig = await GrlConfig.findOne();
                    const transportGmail = dataConfig.transportGmail;
                    console.log("Encontró el transporterGmail:", transportGmail);
                    const transporter = nodemailer.createTransport(transportGmail);
                    
                    // Enviar correo electrónico
                    await sendEmail(user.email, emailSubject, user.nombre, user.apellido, message, transporter);
    
                    // Guarda un mensaje en mensajes internos
                    const nuevoMensaje = new PushMensajes({
                        email: user.email,
                        names: user.nombre,
                        apellido: user.apellido,
                        message,
                        date: new Date()
                    });
                    await nuevoMensaje.save();
    
                    // Actualiza la propiedad renovarMem en el usuario
                    user.renovarMem = true;
                    await user.save();
                }else{
                    // Actualiza la propiedad renovarMem en el usuario
                    user.renovarMem = false;
                    await user.save();
                }
            }
        }
    }
    

    checkMembershipExpiration()
}

// Ejecutar la verificación cada 3 segundos
//// Ejecutar la función inmediatamente
checkMembershipExpirationFull();

// Configurar el intervalo para que se ejecute cada 300000 ms (5 minutos)
setInterval(checkMembershipExpirationFull, 300000);


// Programar la tarea para que se ejecute todos los días a la medianoche
schedule.scheduleJob('0 0 * * *', checkMembershipExpirationFull);


// /********************************************************************************************************** */
