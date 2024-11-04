require('dotenv').config();
const express   = require('express');
const router    = express.Router(); 
const fs        = require('fs');
const path      = require('path');  // Asegúrate de agregar esta línea
const axios     = require("axios")
const mongoose  = require('mongoose');
const cors      = require('cors')
const passport  = require('passport'); 
const ExcelJS   = require('exceljs');

// codificador
const bcrypt    = require('bcrypt');

//auntenticador
const jwt       = require('jsonwebtoken');

const shortid = require('shortid');

//config MP
//mercadopago.configurations.setAccessToken('TU_ACCESS_TOKEN');

router.use(cors());

//models
const User         = require('../models/User');
const Productos    = require('../models/Productos');
const Promociones  = require('../models/promoDesc');
const EcommUser    = require('../models/usuarioEcommerce');
const pushMess     = require('../models/pushMes');
const Mensajes     = require('../models/messages');
const Configs      = require('../models/configsGrl');

const bodyParser = require('body-parser');

let urlServer = ""

let ConfigGrl = {}
async function getConfig() {
    try {
        ConfigGrl = await Configs.findOne();
        //console.log(ConfigGrl);
        urlServer = ConfigGrl.urlServer
        return ConfigGrl;
    } catch (error) {
        console.error('Error fetching configuration:', error);
    }
}

getConfig()


    router.use(bodyParser.text());

let urlOwner = ""


//const endpointTokensArray = []

const {registrarYEnviarIncidente, guardarImagenCli, endpointTokensArray2, verificarToken, sendMail, guardarMensajes, consultarEstadoPago} = require('./funcionesymas');

//pasarela de pagos
const { MercadoPagoConfig, Payment, Preference  } = require('mercadopago');
const UserEcomm = require('../models/usuarioEcommerce');
const configsGrl = require('../models/configsGrl');

    // backend del LANDING PAGE busca los datos para la landing page
    router.get('/buscar/datos/basicosFronen', async (req, res) => { 
        try {

            // Obtener los datos básicos
            // Eliminar el campo ArTokenPrivateMP de cada configuración obtenida
            const configs = await Configs.find({}, { ArTokenPrivateMP: 0 }).exec();
            
            //console.log('Datos obtenidos:', configs);
            const ConfigsOne = configs
            const jwToken = jwt.sign({ email: "email" }, 'Sebatoken22', { expiresIn: '60m' });
            //console.log("Le entrooooooooooooo a busacar los datos basicos",ConfigsOne)
            urlOwner = configs.urlOwner
            // arma el paquete de datos iniciales
            const endpointTokensArr = endpointTokensArray2() 
            //console.log("Que endpoints armo desde endpointTokensArray2", endpointTokensArr)
            const datosBasicos = {endpointTokensArr, ConfigsOne, jwToken }
            // Si todo sale bien, responder con los datos y un código 200 (success)
            res.status(200).json({ success: true, data: datosBasicos });
        } catch (error) {
            // Si ocurre un error, responder con un código 500 (error del servidor) y un mensaje de error
            console.error('Error al obtener los datos básicos:', error);
            res.status(500).json({
                success: false,
                message: 'Ocurrió un error al obtener los datos básicos.'
            });
        }
    });

    //01 solicita todos los productos y servicios y tambien los idEndpoints
    router.post('/buscandoDataEcommerceInicial', async (req, res) => {
            // primero arma los enpointsTokens 
            try {
                // accesos de seguridad
                console.log("*******/buscandoDataEcommerceInicial*********que hay en el req.body", req.body);
                //const urlOwner = req.body.urlOwner.substring(1); // Eliminar el '/' inicial
                const urlOwner = req.body.urlOwner
                // Buscar al usuario que tenga el urlOwner especificado
                const dataDueno = await User.findOne({ urlOwner: urlOwner }) || await User.findOne({ dominio: urlOwner }) || null;
                //const dataDueno = await User.findOne({ urlOwner }) ?? await User.findOne({ dominio: urlOwner });
                //console.log("****************que dataDueno genero en el server ecommerce????", dataDueno.nombre);
                const idOwner = dataDueno._id
                // busca los datos de la BD de los productos
                const dataProductos = await Productos.find({ idCliente: idOwner }).sort({ date: -1 });
                const dataPromociones = await Promociones.find({ idOwner: idOwner }).sort({ date: -1 });
                //console.log("que encuentra desde la pagina web /dataDueno",dataProductos.length, dataPromociones)
                dataProductos.nombreEcommerce = dataDueno.nombreEcommerce
                const Config = await Configs.find()
                const endPointsIdTokens = endpointTokensArray2()
                const endPointsFronen = endPointsIdTokens.endpointsFronen 
                const endPointsBackend = endPointsIdTokens.endpointsBackend 
                //console.log("buscandoDataEcommerceInicial", endPointsFronen[0], endPointsBackend[0] )
                res.status(200).json({ success: true, endPointsFronen,  basicData:Config[0] });
                
                await registerEndpoints2(endPointsBackend, verificarToken)
                await registerEnpointsMP(endPointsBackend, verificarToken)

            } catch (error) {
                console.error('Error handling the request:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
    });

    // datos enpoints y funciones del server Ecommerce tienda online
    async function registerEndpoints2(endpointTokensArray, verificarToken) { 

        //02 revisa de forma automatica los datos del Owner el ecommerce
        //console.log("Que enpoint es el num 0 de ecommerce server??????", endpointTokensArray[0])
        router.post(`/${endpointTokensArray[0]}`, async (req, res) => { 
            const {idCliente, urlOwner} = req.body
            //console.log("00000000000Entra al sever y Solicita los datos basicos del ecommerce ", urlOwner)
            //revisar con los datos que me tira si este ip o los datos del local storage me hayan un cliente
            try {
                const dataOwner2     = await User.findOne({ urlOwner: urlOwner });
                const idOwner        = dataOwner2._id
                const basicData2     = await Configs.findOne();
                const ownerMensajes  = await Mensajes.find({ idOwner: idOwner });
                const ownerProducts  = await Productos.find({ idCliente: idOwner });
                const ownerPromos    = await Promociones.find({ idOwner: idOwner });
                const basicData = []
                // Convertir el documento a un objeto plano y eliminar las propiedades no deseadas
                const { retiros, password, realPass, ...dataOwner } = dataOwner2.toObject();
                const { ArTokenPrivateMP, ...basicData3 } = basicData2.toObject();

                basicData.push(basicData3)
                let dataCliente = {}
                if (idCliente) {
                    dataCliente = await EcommUser.findById(idCliente)
                }
                //console.log("que datos del dueño del comercio encontró??????", dataOwner)
                if (dataOwner) { 
                    // Generar el token JWT con la información del usuario (en este caso, solo el email)
                    const data = {dataOwner, ownerMensajes, ownerProducts, ownerPromos, idOwner, basicData, dataCliente}
                    res.status(200).json({ success: true, data: data });
                } else {
                    res.status(500).json({ success: false, data: "No es cliente" });
                }
            } catch (error) {
                console.error("Error en la busqueda del ecommerce", error)
            }
        });

        //03 revisa si es cliente y llega el IP de forma automatica cuando se abre a pagina
        router.post(`/${endpointTokensArray[55]}`, [verificarToken], async (req, res) => {
            //const ipCliente = req.ip || req.connection.remoteAddress;
            //console.log("llega algo de FORMA AUTOMATICA Ecommerce para enconrar AUTOMATICAMENTE a slo cleintes", req.body)
            const {  idCliente, nombre, email, token, ip, urlOwner} = req.body
            try {
                // Buscar al cliente por email
                //const cienteEcomm = await EcommUser.findByIdAndUpdate(idCliente, { ipCliente: ip }, { new: true });
                const cienteEcomm = await EcommUser.findById(idCliente);
                const ownerEcomm  = await User.findOne({ urlOwner: urlOwner });
                //console.log("Que cliente encontro?",req.body, ownerEcomm)
                if (cienteEcomm) {
                    // Generar el token JWT con la información del usuario (en este caso, solo el email)
                    const email = cienteEcomm.emails[0]
                    const token = jwt.sign({ email: email }, 'Sebatoken22', { expiresIn: '60m' });
                    const data = {token, cienteEcomm, ownerEcomm}
                    res.status(200).json({ success: true, data: data });
                } 
                else {
                    res.status(500).json({ success: false, data: "No es cliente" });
                }
            } catch (error) {
                console.error("Desde el ctch del server no encontro los datos", error)
                res.status(400).json({ success: false, data: "No eencotnro los datos en el server" });
            }
        });

        //04 SIGNIN desde el signIn MANUAL busca el usuario cliente del ecommerce de forma MANUAL
        router.post(`/${endpointTokensArray[10]}`, [], async (req, res) => {
            const ipCliente = req.ip || req.connection.remoteAddress;
            console.log("Ingresas SIGNIN ecommerce", req.body);
            try {
                const { email, password, ip } = req.body;
                const clienteEcomm = await EcommUser.findOne({emailOficial:email});
                if (clienteEcomm) {
                    //console.log("Que cliente Ecomm encuentra",clienteEcomm.emailOficial);
                    // Aquí puedes verificar la contraseña de manera segura utilizando técnicas de hash y sal
                    // En este ejemplo, simplemente comparamos las contraseñas en texto plano (lo cual NO es seguro en un entorno de producción)
                    if ( password) {

                        // Supongamos que tienes el hash de la contraseña almacenado en la base de datos
                        const hashedPasswordFromDatabase = clienteEcomm.password; // Obtén el hash de la contraseña del usuario desde la base de datos
                        
                        // Supongamos que el usuario proporciona su contraseña durante el inicio de sesión
                        const userProvidedPassword = password; // La contraseña que el usuario proporciona durante el inicio de sesión
                        
                        // Compara el hash de la contraseña almacenada en la base de datos con la contraseña proporcionada por el usuario
                        bcrypt.compare(userProvidedPassword, hashedPasswordFromDatabase, function(err, result) {
                            console.error('Entro a BCRYPT a comparar conraseñas',);
                            if (err) {
                                console.error('Error al comparar contraseñas:', err);
                                // Manejar el error adecuadamente
                            } else {
                                if (result) {
                                    // La contraseña es correcta, procede con el inicio de sesión
                                    //console.log('Contraseña correcta. Inicio de sesión exitoso.');
                                    // Generar el token JWT con la información del usuario
                                    const token = jwt.sign({ email: clienteEcomm.emailOficial }, 'Sebatoken22', { expiresIn: '60m' });
                                    const data = { token, clienteEcomm };
                                    res.status(200).json({ success: true, data });
                                    //console.log("Encontró un cliente Ecommerce y se envio la data al Frontend", data);
                                    return
                                } else {
                                    // La contraseña es incorrecta, muestra un mensaje de error al usuario
                                    //console.log('Contraseña incorrecta. No se pudo iniciar sesión.');
                                    res.status(401).json({ success: false, message: "Contraseña incorrecta" });
                                    //console.log("Contraseña incorrecta");
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

        //05 SingUP de clientes en forma manual
        //console.log("que idPoint encontro ", endpointTokensArray[27])
        router.post(`/${endpointTokensArray[27]}`, [], async (req, res) => {
            const ipCliente = req.ip || req.connection.remoteAddress;
            //console.log("llega algo del Ecommerce para inscribir clientes", req.body, ipCliente)
            try {
                const { nombre, apellido, email, numCel, password, urlOwner, urlServer, pedidoOk } = req.body;

                // Verificar la presencia de todos los campos requeridos
                if (!nombre || !apellido || !email || !numCel || !password) {
                    // Al menos uno de los campos requeridos está ausente
                    const camposFaltantes = [];
                    
                    if (!nombre) camposFaltantes.push('nombre');
                    if (!apellido) camposFaltantes.push('apellido');
                    if (!email) camposFaltantes.push('email');
                    if (!numCel) camposFaltantes.push('numCel');
                    if (!password) camposFaltantes.push('password');
                
                    const mensajeError = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
                    
                    return res.status(400).json({ error: true, mensaje: mensajeError });
                }
                
                // hacer validacion si existe ya ese correo electronico inscripto en EcommUser
                if (await EcommUser.findOne({ emailOficial:email })) return res.status(400).json({ success:false, message: 'Correo electrónico ya registrado' });


                    const dataUSerEcomm = new EcommUser({
                        usuarioSuspendido:false, 
                        nombre, 
                        apellido,
                        emailOficial : email,
                        emails: [{ emailCliente: email }], // Agregar el email al array email
                        numCel: [{ numCelCliente: numCel }], // Agregar cada número de celular al array numCel
                        password, 
                        realPass : password,
                        duenoEcom : [{urlOwner:urlOwner}],
                        desingOwner : "none",
                        ipCliente,
                        imgCli : `${urlServer}images/usuario.png`,
                        direcciones : [],
                        comprasCliente : [],
                        misProductos : [],
                        quienesSomos: {}
                    });
                    
                    dataUSerEcomm.idCliente = dataUSerEcomm._id;
                    dataUSerEcomm.password = await dataUSerEcomm.encryptPassword(password);

                    // Guardar el usuario en la base de datos
                    await dataUSerEcomm.save();

                    // Generar el token JWT con la información del usuario (en este caso, solo el email)
                    const token = jwt.sign({ email: email }, 'Sebatoken22', { expiresIn: '60m' });
                    const message = "Te has inscrito correctamente, logeate y continua."
                    const success = true

                    if (pedidoOk) {
                        const dataInfo = { dataUSerEcomm, token }
                        //console.log("Envio al fronen porque tiene un pedido pendiente", pedidoOk)
                        res.status(200).json( {success, dataInfo} );
                        return;
                    } else {
                        const dataInfo = {token, message }
                        res.status(200).json( {success, dataInfo} );
                        return;
                    }
                } catch (error) {
                    return res.status(400).json({ error: true, mensaje: error });
                }
        });

        //06 COBRO DE PAGOS  cofirmar la compra por cualquier metodo de pago 
        router.post(`/${endpointTokensArray[23]}`, [verificarToken], async (req, res) => {
            //console.log("*Llega DESDE el fronen ecommerce para procsar el pedido y cobrarlo??????????", req.body);
            const codigoPedido = shortid.generate()
            let tiPago = ""
            let dataD = {}
            let dataC = {}
            let dataV = {}
            let success = true
            let statusEnvio   = ""
            let logoOwner     = ""
            let nombreEcomm   = ""
            let emailCliente  = ""
            let idCliente     = ""
            let emailOwner    = ""
            let nombreCliente = ""
            let nombreOwner   = ""
            let numCelCliente = 0
            let numCelOwner   = 0
            const transportEmail = ConfigGrl.transportGmail
            // avisa a infoDiario rapido
            const fechaActual2 = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            try {
                // Acceder a cada objeto dataPedidoConf desde req.body
                const dataPedidoConf = req.body.dataPedidoConf;
                const { pedido, cliente, dataDir, idOwner } = dataPedidoConf;
                const dataCli = cliente;

                const pedidos = JSON.parse(pedido);
                console.log("Que pedido armo para cobrar???????????????", pedidos)
                
                const fecha = new Date();
                // Comprobar cliente y datos
                const dataCliente = await EcommUser.findById(dataCli._id);
                const dataDueno   = await User.findById(idOwner);
                dataD = dataDueno
                dataC = dataCliente
                
                const idDueno        = dataDueno._id;
                idCliente     = dataCliente._id;
                statusEnvio   = "Armando su pedido";
                logoOwner     = dataDueno.pathLogo
                nombreOwner   = dataDueno.nombre
                emailCliente  = dataCliente.emailOficial;
                numCelCliente = dataCliente.numCel[0].numCelCliente;
                numCelOwner   = dataDueno.numCel[0].numCelOwner;
                emailOwner    = dataDueno.email;
                nombreEcomm   = dataDueno.ecommerceName;
                nombreCliente = `${dataCliente.nombre} ${dataCliente.apellido}`;

                // Inicializar arrays si no están definidos
                if (!dataCliente.comprasCliente) {
                    dataCliente.comprasCliente = [];
                }
                if (!dataDueno.Ventas) {
                    dataDueno.Ventas = [];
                }

                const listaProductos = [] 

                // MAPEA el array para almacenar las promesas de actualización de productos y promociones
                const updatePromises = await pedidos.map(async (e) => {
                    const idProducto            = e.idProducto;
                    let cantidadProductos       = e.cantidad;
                    let cantidadPromoVendidas   = e.cantidad;
                    const imgProd           = e.imagen;
                    const precio            = e.subTotal;
                    const nombreProd        = e.nombreProducto;
                    const subTotalCompra    = precio * cantidadProductos;
                    
                    // obtiene el tipo de pago
                    const tipoDePago = e.tipoDePago;
                    tiPago = tipoDePago;

                    // Intentar encontrar el producto en la colección Productos
                    let dataProductos = await Productos.findById(idProducto);
                    let dataPromo     = await Promociones.findById(idProducto);

                    //console.log("Que dataPromo armo para cobrar???????????????", dataPromo)
                    
                    // Si no encuentra Productos lo busca con los datos de promociones
                    if (!dataProductos) {
                        dataProductos = await Productos.findById(dataPromo.idProd);
                    }

                    //console.log("Que dataProductos armo para cobrar???????????????", dataProductos)

                    // asigna el valor boleano para indicar que el productos e compro en promo
                    if (dataPromo) {
                        // Averiguar si incluye promo por cantidad y cuál es (2x1, 4x1, etc.) y agregar los productos que sean
                        const cantLleva = dataPromo.cantLlevar ? dataPromo.cantLlevar : 1;
                        // console.log("Que cantidad de productos tiene la promoocion", cantLleva)
                        cantidadProductos = cantLleva * cantidadPromoVendidas
                        const esPromocion = true;
                        // Usar un bucle para agregar el número correcto de productos
                        for (let i = 0; i < cantLleva; i++) {
                            // Hacer una copia del objeto producto para evitar referencias
                            const producto = { esPromocion, imgProd, nombreProd, precio, cantidadProductos, idProducto, subTotalCompra };
                            listaProductos.push(producto); // Hace push del objeto la cantidad especificada
                        }
                    }else{
                        const esPromocion = false
                        const producto = {esPromocion, imgProd,  nombreProd, precio, cantidadProductos, idProducto, subTotalCompra, };
                        listaProductos.push(producto); // Agrega el objeto al array listaProductos
                    }

                    // Validar si se encontró el producto o el producto en promocion en cualquiera de las colecciones
                    if (!dataProductos) {
                        res.status(400).json({ success: false, message: " No se encontró el producto avise al comercio." });
                        return
                    }

                    // Enviar emails por cada proucto que le queda 1 solo de cantidad
                    async function revisarStock() {
                        console.log("Entro a revisar stock");
                        if (dataProductos.cantidad <= 2) {
                            console.log("Envía un email avisando que solo queda una unidad de este producto", dataProductos);
                            // Aquí va la lógica para enviar el email
                            const catego = dataProductos.categoria
                            const producto = dataProductos.nombreProducto
                            const subjectOwner   =  `ATENCIÓN Te queda un solo producto en tu stock de: ${producto}`
                            const mensaje = {}
                            mensaje.messageOwner = `Te queda un solo producto de ${producto} en tu stock de la categoria ${catego}. `;

                            const dataEnviarEmail = {transportEmail, reclamo:false, enviarExcel:false, emailOwner, emailCliente, numCelCliente, numCelOwner, mensaje, codigoPedido, nombreOwner, nombreCliente, subjectCliente:null, subjectOwner, otraData: null, logoOwner, cancelaEnvio:false, pedidoCobrado:false, quedaUno:true, product:null, inscripcion:false, Promo:false, ConsultaOK:false}
                            
                            sendMail(dataEnviarEmail) 
                            // genra un mensaje para los informes diarios           
                            const datInfo = {
                                idInfo: shortid.generate(), // Genera un ID único
                                Date: fechaActual2, // Asigna la fecha actual
                                positivo: false, // Asigna un valor booleano
                                infoMensaje: mensaje.messageOwner
                                // Mensaje con información
                            };
                            dataDueno.lastInfo.push(datInfo)
                            return
                            // Ojo los subject controlan a quien le mandas el mensaje push si es null no se manda
                            //guardarMensajes(dataOwner, dataCliente, mensaje, subjectOwner, subjectCliente, codigoPedido)
                        }
                    }
                    await revisarStock()

                    // resta las cantidades vendidas en las BD de productos y en promosiones
                    if (dataPromo) {
                        dataPromo.cantidadPromoVendidas += cantidadPromoVendidas;
                        await dataPromo.save();
                    }
                    
                    if (dataProductos) {
                        dataProductos.cantidad -= cantidadProductos;
                        await dataProductos.save(); // Guardar los cambios en la base de datos de los 
                        return true
                    }else{
                        return false
                    }

                });
                
                // console.log("pudo terminar de mapear los pedidos ????????", updatePromises)
                const dataCompra = {
                    codigoPedido,
                    fecha,
                    imgCli: dataCliente.imgCli,
                    nombreCli: dataCliente.nombre,
                    idCliente,
                    idDueno,
                    tipoDePago: tiPago,
                    statusEnvio,
                    listaProductos,
                };

                // Agregar la cantidad de productos vendidos al dueño del Ecommerce
                // Extraer los datos de la dirección de dataDir excluyendo el array pedido
                if (req.body) {
                    //console.log("Paso el req.body")
                    const { pedidos, ...direccionSinPedido } = dataDir;
                    // Crear el objeto datosVenta con los datos de la compra y los datos de la dirección
                    const datosVenta = {
                        dataCompra: dataCompra,
                        dataDir: direccionSinPedido
                    };
                    dataV = datosVenta
                    dataDueno.Ventas.push(datosVenta);

                    // Agregar la dirección si es nueva o no tenía
                    const dires = dataCliente.direcciones;

                    // Verificar si el idCliente ya está presente en dataDueno.clientes y si NO esta guarda el nuevo cliente del ownerEcomm
                    const clienteExistente = dataDueno.clientes.find(cliente => cliente.idCliente == dataCli._id);
                    if (!clienteExistente) {
                        // Si no existe, agregarlo al array
                        const fechaInCli = new Date();
                        const { nombre, apellido, emails, numCel, imgCli, } = dataCliente;
                        const dataClient = { idCliente, nombre, apellido, emailCliente:emails, numCelCliente:numCel, imgCli, direCli: dires, fechaInCli };
                        dataDueno.clientes.push(dataClient);
                    }
                    tiPago = dataCompra.tipoDePago
                    // guarda un limite maximo de 4 direcciones
                    if (dires.length <= 4) {
                        //console.log("Tiene menos de 4 direcciones guardadas.", dires.length);
                        const cheqCalle  = dires.find(d => d.calle === dataDir.calle );
                        const cheqPuerta = dires.find(d => d.numeroPuerta === dataDir.numeroPuerta);
                        if (!cheqCalle, !cheqPuerta) {
                            dataCliente.direcciones.push(dataDir);
                            //console.log("No tenía la dirección guardada, así que se guardó.");
                        }
                    }

                    // Esperar a que todas las promesas de actualización se resuelvan
                    await Promise.all(updatePromises);
                    //console.log("que datos dle cliente se obtuvo.", dataCliente);


                    // actualiza el estado de la compra en el cliente y el vendedor
                    //console.log("La lista de productos es válida y contiene elementos.", listaProductos);
                    if (Array.isArray(listaProductos) && listaProductos.length > 0) {
                        //console.log("La lista de productos es válida y contiene elementos.");
    
                        // Calculando el total de la compra
                        let totalCompra = 0;
                        let totalCantProd = 0;
                        
                        listaProductos.forEach(producto => {
                            // Verifica que cada producto tenga subtotal y cantidad
                            if (producto.subTotalCompra && producto.cantidadProductos) {
                                //console.log(`Producto encontrado: Subtotal: ${producto.subTotalCompra}, Cantidad: ${producto.cantidadProductos}`);
                                totalCompra += producto.subTotalCompra; // Acumula el subtotal
                                totalCantProd += producto.cantidadProductos; // Acumula la cantidad total de productos
                            } else {
                                console.warn("El producto no tiene un subtotal o cantidad válida:", producto);
                            }
                        });
    
                        // Asignando los totales a dataCompra
                        dataCompra.TotalCompra = totalCompra;
                        dataCompra.totalProductos = totalCantProd;
                        //console.log(`Total de compra calculado: ${totalCompra}`);
                        //console.log(`Total de productos calculado: ${totalCantProd}`);
    
                        // Asegúrate de que comprasCliente sea un array
                        if (!Array.isArray(dataCliente.comprasCliente)) {
                            dataCliente.comprasCliente = [];
                            //console.log("Inicializando comprasCliente como un array vacío.");
                        }
    
                        // Agregando la compra actual al historial del cliente
                        dataCliente.comprasCliente.push(dataCompra);
                        //console.log("Compra añadida a las compras del cliente:", dataCompra);
                    } else {
                        console.error("La lista de productos está vacía o no es válida.");
                        success = false
                        //throw new Error("La lista de productos está vacía o no es válida.");
                        res.status(500).json({ success: false, message: "Ocurrió un error al procesar la compra: la lista de productos está vacía o no es válida." });
                        return
                    }

                    // guarda el informe Rapido de la venta
                    if (success) {
                        const formatearAPesos = (cantidad) => {
                            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(cantidad);
                        };
                        const totalFormPesos = formatearAPesos(dataCompra.TotalCompra)
                        const datInfo = {
                            idInfo: shortid.generate(), // Genera un ID único
                            Date: fechaActual2, // Asigna la fecha actual
                            positivo: true, // Asigna un valor booleano
                            infoMensaje: `
                            <h5>¡Felicitaciones!</h5>
                            <p>Vendiste ${dataCompra.totalProductos} productos.<br> Por un total de ${totalFormPesos} pesos.<br> El código de la operación es: ${codigoPedido}.<br> Comunícate con el cliente y acuerda un horario de entrega. <br> Recuerda cambiar el estado de la entrega en "Estados de Envíos".</p>`
                            // Mensaje con información
                        };
                        dataDueno.lastInfo.push(datInfo)
                    }
                    // Guardar los cambios en la base de datos del cliente y del dueño
                    await dataDueno.save();
                    await dataCliente.save();

                    // Devolver el status adecuado al frontend con la leyenda de Pedido Aprobado
                    const data = {dataCliente}
                    data.tiPago = tiPago
                    data.codigoPedido = codigoPedido

                    const dominio = dataDueno.dominio || null

                    data.dominio = dominio

                    console.log("Proceso y guardo la compra en  la BD y envia al fronen esta data", data)

                    res.status(200).json({ success: true, data });

/************************************************************************************************************** */
                } 
            }
            catch (error) {
                success = false
                console.error("Error en el proceso /confirmarCompra165165156", error);
                // Enviar una respuesta de error al cliente
                registrarYEnviarIncidente({mensajeError:error}, {emailReport:"sebastianpaysse@gmail.com"}, {userIncidentID:idCliente}, {userEmailIncident:emailCliente})
                res.status(500).json({ success: false, message: "Ocurrió un error al procesar la compra, intente de nuevo mas tarde" });
            } 

                if (success) {
                    // enviar por email al cliente y owner el pedido y tambien a serviceWorker para que haga un pushnotification
                    try {
                        const dataOwner      = dataD;
                        const dataCliente    = dataC;
                        const datosVenta     = dataV;
                        const subjectCliente = `Hola ${nombreCliente} tu pedido número de codigo ${codigoPedido} fue recibido con éxito`;
                        const subjectOwner   = `Felicitaciones ${nombreOwner} tienes un nuevo pedido con el número de codigo ${codigoPedido}`;
                        const logoOwner      = dataOwner.pathLogo;
                        let otraData = {};
                        otraData.Consulta98   = false;
                        otraData.dataDir      = datosVenta.dataDir;
                        otraData.dataPedido23 = datosVenta.dataCompra;
                        otraData.dataPedido23.nombreEcomm = nombreEcomm
                        const messageOwner    = `Tienes un nuevo pedido con número de codigo ${codigoPedido}, comunicate para coordinar el dia y horario de entrega.
                        <br>
                        email:${emailCliente}
                        <br>
                        Celular:${numCelCliente}
                        `;
                        const messageCliente  = `El pedido número de codigo ${codigoPedido} fue recibido con éxito y se esta armando, comunicate para coordinar el dia y horario de entrega.<br>
                        email:${emailOwner}<br>
                        Celular:${numCelOwner}`;
    
                        const mensaje = { messageOwner, messageCliente };
                        
                        const dataEnviarEmail = { transportEmail, reclamo: false, enviarExcel:false, emailOwner, emailCliente, numCelCliente, numCelOwner, mensaje, codigoPedido, nombreOwner, nombreCliente, subjectCliente, subjectOwner, otraData, logoOwner, cancelaEnvio:false, pedidoCobrado:true, quedaUno: false, product: null,inscripcion:false, Promo:false, ConsultaOK:false };

                        // guarda el mensaje para los push mensaje
                        guardarMensajes(dataOwner, dataCliente, mensaje, subjectOwner, subjectCliente, codigoPedido);
                    
                        // envia un email
                        const enviarEmails = await sendMail(dataEnviarEmail);

                        console.log("Se enviaron los emails de la venta/compra????", enviarEmails);
                        return
                    } catch (error) {
                        console.error("Se produjo un error, pero la aplicación continuará ejecutándose:", error);
                    }
                }
        });

        // 07 revisa las direcciones del userEcomm
        router.post(`/${endpointTokensArray[41]}`, [verificarToken], async (req, res) => {
        const clientIP = req.ip || req.connection.remoteAddress;
            //console.log("llega algo del Ecommerce para revisar las direcciones de envio de los productos", clientIP, req.body)
            let dataFront = req.body
        try{
                // ver que procutos llegan y sus cantidades
                const userEcomm = await EcommUser.findById(dataFront.clienteEcomm.idCliente);
                // revisa las direcciones que tiene guardadas y las re envia
                const direcciones = userEcomm.direcciones;
                //console.log("QUE DIRECCIONES GUARDADAS ENCONTRO?", direcciones);
                if (direcciones.length !== 0) {
                    //console.log("SI ENCONTRÓ DIRECCIONES GUARDADAS");
                    const dataDir = JSON.stringify(direcciones);
                    res.status(200).json({ success: true, data: dataDir });
                } else {
                    //console.log("NO ENCONTRÓ DIRECCIONES GUARDADAS");
                    res.status(200).json({ success: false, data: "No tiene direcciones guardadas" });
                }
                
            } catch (error) {
                console.error('Error no se obtuvieron los datos de la BD de mongo', error);
                res.status(500).json({ error: 'Error no se obtuvieorn los datos de la BD de mongo' });
            }

        });

        //07.5 revisa si hay internet
        router.get('/hayInternet', async (req, res) => {

            res.status(200).json({ success: true });
        });

        //08 se actualizan los datos del ususario del ecommerce
        router.post(`/${endpointTokensArray[14]}`, [verificarToken], async (req, res) => {
            console.log("llega algo del Ecommerce paa updatear clientes", req.body)
            console.log("llega algo del Ecommerce paa updatear clientes", req.files)
            const{idCliente} = req.body
            if (req.body.cambiarImg) {
                const id = idCliente;
                //console.log("Entro a cambiar imagen");
                const empresa = "imgClientes";
                try {
                    // Enviar la imagen al servidor
                    const { ok, rutaCompletaArchivo, rutaURL, idOwner } = await guardarImagenCli(req.files, empresa, idCliente, {rutaCarpeta:true});

                    if (!ok) {
                        throw new Error("La imagen no se guardó. Intente de nuevo más tarde.");
                    }
                    
                    // Actualizar la ruta de la imagen en la base de datos
                    const rutaRelativa = rutaURL;

                    console.log("Que mierda devuelve guardar imagen logo cliente",ok, rutaCompletaArchivo, rutaURL, idOwner )

                    await EcommUser.findByIdAndUpdate(id, { imgCli: `${req.protocol}://${req.get('host')}/img/${rutaRelativa}`, rutaCompletaArchivo });

                    
                    // Responder con éxito
                    res.status(200).json({ success: true, data: "Imagen guardada correctamente" });
                } catch (error) {
                    // Manejar errores
                    console.error("Error en carga de imagen:", error);
                    res.status(500).json({ success: false, data: "Imagen no guardada correctamente" });
                }
            }
            
            if (req.body.updateCel) {
                //console.log("Entro a upDated Celu");
            
                const { confirmCel, numerosCelulares, idCliente } = req.body;
                try {
                    const dataCliente = await EcommUser.findById(idCliente);
            
                    let responseData = {};

                    // Aquí agregamos uno mas y actualizamos en la BD en el array numCel el numCelu=confirmCel por el numerosCelulares
                    if (confirmCel && numerosCelulares) {
                        const updatedDataCliente = await EcommUser.findByIdAndUpdate(idCliente, { $set: { 'numCel.$[elem].numCelCliente': confirmCel } }, { arrayFilters: [{ 'elem.numCelCliente': numerosCelulares }], new: true });
                        responseData.message = `Se actualizó el número celular ${numerosCelulares} por ${confirmCel}`;
                    }

                    // aqui e elimina el que selecciono
                    if (numerosCelulares && confirmCel === '') {
                        const numCelu = dataCliente.numCel.length;
                        if (numCelu <= 1) {
                            responseData.message = `Debes tener al menos un número celular`;
                            res.status(400).json({ success: false, data:responseData});
                            return
                        }
                        // Aquí eliminamos en la BD en el array numCel el numCelu=confirmCel
                        const updatedDataCliente = await EcommUser.findByIdAndUpdate(idCliente, { $pull: { numCel: { numCelCliente: numerosCelulares } } }, { new: true });
                        responseData.message = `Se eliminó el número celular ${confirmCel}`;
                    }
                    
            
                    // Aquí agregamos en la BD en el array numCel el numCelu=numerosCelulares
                    if (confirmCel && numerosCelulares === '') {
                        const updatedDataCliente = await EcommUser.findByIdAndUpdate(idCliente, { $addToSet: { numCel: { numCelCliente: confirmCel } } }, { new: true });
                        responseData.message = `Se agregó el número celular ${numerosCelulares}`;
                    }
                    
            
                    //console.log('Datos actualizados correctamente:', responseData);
                    res.status(200).json({ success: true, data: responseData });
                } catch (error) {
                    console.error('Error al actualizar los datos del cliente:', error);
                    res.status(500).json({ success: false, data: responseData});
                    // Manejo de errores
                }
            }

            if (req.body.updateEmail) {
                //console.log("Entro al CRUD de los Email´s");
                const { confirmEmail, AllEmails, idCliente } = req.body;
                try {
                    const dataCliente = await EcommUser.findById(idCliente);
                    let responseData = {};
            

                    if (confirmEmail && AllEmails !== 'Elije emodificar/Elimina un Email') {
                        //console.log("Entro Modificar un Email");
                        const updatedDataCliente = await EcommUser.findByIdAndUpdate(idCliente, { $set: { 'emails.$[elem].emailCliente': confirmEmail } }, { arrayFilters: [{ 'elem.emailCliente': AllEmails }], new: true });
                        responseData.message = `Se actualizó el email ${AllEmails} por ${confirmEmail}`;
                    }

                    // elimina un email
                    if (AllEmails && confirmEmail === '') {
                        //console.log("Entro a eliminar un Email");
                        const cantEmails = dataCliente.emails.length;
                        if (cantEmails === 1) {
                            responseData.message = `Debes tener al menos un Email`;
                            res.status(400).json({ success: false, data:responseData});
                            return 
                        }
                        // Aquí eliminamos en la BD en el array numCel el numCelu=confirmCel
                        const updatedDataCliente = await EcommUser.findByIdAndUpdate(idCliente, { $pull: { emails: { emailCliente: AllEmails } } }, { new: true });
                        responseData.message = `Se eliminó el Email ${confirmEmail}`;
                    }
                    
                    // agrega un emails
                    if (confirmEmail && AllEmails === 'Elije emodificar/Elimina un Email') {
                        //console.log("Entro aagregar un Email");
                        // Aquí agregamos en la BD en el array numCel el numCelu=numerosCelulares
                        const updatedDataCliente = await EcommUser.findByIdAndUpdate(idCliente, { $addToSet: { emails: { emailCliente: confirmEmail } } }, { new: true });
                        responseData.message = `Se agregó el Email celular ${confirmEmail}`;
                    }
                    
                    //console.log('Datos actualizados correctamente:', responseData);
                    res.status(200).json({ success: true, data: responseData });
                } catch (error) {
                    console.error('Error al actualizar los datos del cliente:', error);
                    res.status(500).json({ success: false, message: 'Error al actualizar los datos del cliente' });
                    // Manejo de errores
                }
            }

            if (req.body.changPass) {
                //console.log("Recibida solicitud de cambio de contraseña");
            
                const { newPassword, confirmPassword, idCliente, Token, changPass } = req.body;
            
                // Verificar que las contraseñas coincidan
                if (newPassword !== confirmPassword) {
                    //console.log("Las contraseñas no coinciden");
                    return res.status(400).json({ success: false, message: "Las contraseñas no coinciden" });
                }
            
                // Verificar que la nueva contraseña no sea igual a la anterior
                const cliente = await EcommUser.findById(idCliente);
                if (cliente && cliente.password === newPassword) {
                    //console.log("La nueva contraseña debe ser diferente a la anterior");
                    return res.status(400).json({ success: false, message: "La nueva contraseña debe ser diferente a la anterior" });
                }
            
                // Verificar que la nueva contraseña cumpla con los requisitos
                const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]{8,}$/;
                if (!passwordRegex.test(newPassword)) {
                    //console.log("La contraseña no cumple con los requisitos");
                    return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 8 caracteres alfanuméricos y contener al menos una mayúscula" });
                }
            
                try {
                    const saltRounds = 10;
                    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                    // Actualizar la contraseña del cliente
                    const updatedCliente = await EcommUser.findByIdAndUpdate(idCliente, { password: hashedPassword, realPass: newPassword }, { new: true });

            
                    // Verificar si el cliente fue encontrado y la contraseña se actualizó correctamente
                    if (updatedCliente) {
                        //console.log("Contraseña actualizada correctamente");
                        res.status(200).json({ success: true, message: "Contraseña actualizada correctamente" });
                    } else {
                        //console.log("Cliente no encontrado");
                        res.status(404).json({ success: false, message: "Cliente no encontrado" });
                    }
                } catch (error) {
                    console.error("Error al actualizar la contraseña:", error);
                    res.status(500).json({ success: false, message: "Error al actualizar la contraseña" });
                }
            }
            
            if (req.body.deleteAdress) {
                //console.log("Recibe la solicitud de eliminar la dirección");
                const { idDireccion, idCliente, Token, deleteAdress } = req.body;
                try {
                    const user = await EcommUser.findById(idCliente);
                    
                    // Verificar si el usuario y sus direcciones existen
                    if (!user || !user.direcciones || user.direcciones.length === 0) {
                        return res.status(404).json({ success: false, message: "No se encontró el usuario o no hay direcciones para eliminar" });
                    }
                    
                    // Verificar si hay al menos una dirección guardada
                    if (user.direcciones.length === 1) {
                        return res.status(400).json({ success: false, message: "Debes tener al menos una dirección guardada" });
                    }
            
                    const result = await EcommUser.findOneAndUpdate(
                        { _id: idCliente, "direcciones._id": idDireccion },
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

        //09 Actualizar nueva direccion
        router.post(`volviendoleruleruProd`, [verificarToken], async (req, res) => {
            console.log("Recibe la solicitud de agregar la direccion", req.body);
            const { lat, lng, pais, estado, localidad, calle, numeroPuerta, CP, Token, idCliente } = req.body;
            try {
                const userData = await EcommUser.findById(idCliente);
                const dires = userData.direcciones;
                //console.log("Que direcciones encuentra", dires.length)
                if (!userData && lat === ""  &&  lat === "") {
                    return res.status(404).send({ success: false, message:"Usuario o datos de latitud y longitud no encontrados"});
                }
        // Verificar si la dirección ya existe en el array direcciones
        // Crear un arreglo de strings que representen las direcciones existentes
        const direccionesExistentes = dires.map(direccion => `${direccion.calle}-${direccion.numeroPuerta}`);
        // Crear un string que represente la nueva dirección que intentamos agregar
        const nuevaDireccion = `${calle}-${numeroPuerta}`;
        //console.log("Encotnro al guna direccion duplicada",nuevaDireccion)
        if (direccionesExistentes.includes(nuevaDireccion)) {
            // Si la dirección ya existe, enviar un mensaje de error
            return res.status(400).json({ success: false, message: "La dirección ya está registrada" });
        } else {
            // Crear el objeto de dirección
            const dir = { lat, lng, pais, estado, localidad, calle, numeroPuerta, CP };

            // Verificar si ya existe una dirección con las mismas coordenadas
            const direccionExistente = dires.some(d => d.lat === lat && d.lng === lng);

            if (direccionExistente) {
                // Si la dirección ya existe, devolver un error
                return res.status(400).json({ success: false, message: "La dirección ya está guardada." });
            } else {
                // Si la dirección no está duplicada, agregarla al array direcciones
                dires.push(dir);
                // Actualizar el documento del usuario para agregar la nueva dirección al array
                await EcommUser.findByIdAndUpdate(idCliente, { $push: { direcciones: dir } });
                return res.status(200).json({ success: true, message: "Dirección agregada" });
            }

        }

            } catch (error) {
                console.error("Error al agregar dirección:", error);
                res.status(500).send({ success: false, message:"Error al agregar dirección"});
            }
            
        })

        //Actualiza lso datos del cliente en el Ecommerce
        //console.log("endpointTokensArray[114] Entro en atualizar los datos del cliente", endpointTokensArray[114]);
        router.post(`/${endpointTokensArray[114]}`, [], async (req, res) => {
            console.log("Entro en atualizar los datos del cliente", req.body);
            const { idCliente } = req.body; // Extraer el valor de la propiedad id del objeto
            try {
                const dataCliente = await EcommUser.findById(idCliente);
                //console.log("Entro a leru leru y que usuario encontro", dataCliente);
                res.status(200).json({ success: true, data: dataCliente });
            } catch (error) {
                console.log("Entro en atualizar los datos del cliente error ", error);
                res.status(400).json({ success: false, data: "Error al actualizar datos del cliente ecommerce" });
            }
        });

        //10 descargar todos los pedidos en excell
        router.post(`/${endpointTokensArray[76]}`, [verificarToken], async (req, res) => {    
        //router.post('/bajando/aExcell/los/datos2365', async (req, res) => {
            let filePath2 = {}
            try {
                const pedidos = JSON.parse(req.body.data);
                //console.log("Recibiendo datos para descargar en Excel...",filePath2);

                // Crear un nuevo libro de Excel
                const generarArchivoExcel = async (pedidos) => {
                    try {
                        // Crear un nuevo libro de Excel
                        const workbook = new ExcelJS.Workbook();
                        const worksheet = workbook.addWorksheet('Pedidos');
                
                        // Encabezados de las columnas
                        const headers = [
                            'Código de Pedido',
                            'Fecha',
                            'Nombre del Ecommerce',
                            'Tipo de Pago',
                            'Estado de Envío',
                            'Total de Productos',
                            'Total de Compra',
                            'Producto: Nombre',
                            'Producto: Precio',
                            'Producto: Cantidad'
                        ];
                
                        // Agregar los encabezados a la hoja de cálculo
                        worksheet.addRow(headers);
                
                        // Agregar filas para cada pedido
                        pedidos.forEach(pedido => {
                            const pedidoData = [
                                pedido.codigoPedido,
                                pedido.fecha,
                                pedido.nombreEcomm,
                                pedido.tipoDePago,
                                pedido.statusEnvio,
                                pedido.totalProductos,
                                pedido.TotalCompra // Agregar el símbolo de pesos al Total de Compra
                            ];
                
                            // Agregar una fila para cada producto en listaProductos
                            pedido.listaProductos.forEach(producto => {
                                const rowData = [
                                    ...pedidoData,
                                    producto.nombreProd,
                                    producto.precio,
                                    producto.cantidadProductos
                                ]; // Agregar el símbolo de pesos al precio del producto
                                worksheet.addRow(rowData);
                            });
                
                            // Rellenar los espacios vacíos repitiendo la información del pedido
                            const maxProductos = pedido.listaProductos.length;
                            const emptyRows = Math.max(0, 1 - maxProductos); // Calcular la cantidad de filas vacías
                            for (let i = 0; i < emptyRows; i++) {
                                const emptyRowData = [...pedidoData, '', '', '']; // Datos vacíos para llenar los espacios
                                worksheet.addRow(emptyRowData);
                            }
                        });
                
                        // Generar un nombre de archivo único
                        const fileName = `pedidos_${Date.now()}.xlsx`;
                        const filePath = path.join(__dirname, `../../downloads/bajarExcel/${fileName}`);
                        // Escribir el archivo Excel
                        await workbook.xlsx.writeFile(filePath);
                        //console.log("Archivo Excel creado correctamente:", filePath);
                        filePath2 = filePath
                
                        return { ok: true, filePath, fileName };
                    } catch (error) {
                        console.error('Error al generar el archivo de Excel:', error);
                        return { ok: false, error: 'Error al generar el archivo de Excel' };
                    }
                };
                
                const dataExcell = await generarArchivoExcel(pedidos);

                if (!dataExcell.ok) {
                    throw new Error(dataExcell.error);
                }
                
                const { filePath, fileName} = dataExcell
                //console.log("que archiovo filepath gneero desde bajar excell", filePath)
                        // Obtener los datos del cliente y del propietario
                        const idCliente = pedidos[0].idCliente;
                        const idOwner = pedidos[0].idDueno;
                        const ownerData = await User.findById(idOwner);
                        const clienteData = await EcommUser.findById(idCliente);

                        // Construir los datos para enviar por correo electrónico
                        const enviarExcel = true;
                        const reclamo = false;
                        const numCelCliente = clienteData.numCel[0];
                        const numCelOwner = ownerData.numCel[0];
                        const codigoPedido = clienteData.codigoPedido;
                        //const emailCliente = clienteData.emails.emailCliente;
                        const emailCliente = clienteData.emails.map(emailObj => emailObj.emailCliente);
                        const nombreCliente = `${clienteData.nombre} ${clienteData.apellido}`;
                        const nombreOwner = ownerData.nombreEcommerce;
                        const mensaje = `${nombreCliente}, en adjuntos el excel con los datos solicitados`;
                        const subjectCliente = `${nombreCliente}, en adjuntos el excel con los datos solicitados`;

                        // Leer el archivo Excel con la extensión .xlsx
                        //const archivoAdjunto = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });

                        const otraData = { filePath, fileName };
                        const transportEmail = ownerData.transportEmail;
                        const logoOwner = ownerData.logoOwner
                        
                        const { cancelaEnvio, pedidoCobrado, quedaUno, product } = { cancelaEnvio: false, pedidoCobrado: false, quedaUno: false, product: false };
                        
                        const dataEnviarEmail = { transportEmail, reclamo, enviarExcel, emailCliente, numCelCliente, numCelOwner, mensaje, codigoPedido, nombreOwner, nombreCliente, subjectCliente, otraData, logoOwner, cancelaEnvio, pedidoCobrado, quedaUno, product };


                        // Enviar el correo electrónico
                        const enviarEmails = await sendMail(dataEnviarEmail);
                        //console.log('¿Qué respuesta me da el enviador de emails?', enviarEmails);

                        // Eliminar el archivo después de enviarlo por correo electrónico
                        if (enviarEmails) {
                            // Enviar el archivo Excel como una descarga al cliente
                            // Enviar el archivo Excel como una descarga al cliente
                            res.download(filePath, fileName);

                            // Manejar errores durante la descarga
                            res.on('error', (err) => {
                                console.error('Error durante la descarga del archivo:', err);
                            });

                            // Notificar cuando la descarga se ha completado correctamente
                            res.on('finish', () => {
                                //console.log('La descarga del archivo se ha completado correctamente.');
                            });

                            //console.log('El archivo Excel se ha descargado correctamente.',);
                            // Enviar la respuesta HTTP fuera del bloque if
                            //res.status(200).send("El excel ha sido enviado a tu casilla de correos.");
                            setTimeout(() => {
                                fs.unlinkSync(filePath);
                                //console.log('Si se envio por email y el archivo Excel se ha eliminado correctamente.');
                            }, 5550000); // 10000 milisegundos = 10 segundos
                        } else {
                            fs.unlinkSync(filePath);
                            //console.log('Desde NOOOOOOOO se envio por email El archivo Excel se ha eliminado correctamente.');
                            // Si enviarEmails es falso, enviar una respuesta de error
                            res.status(500).send("Error al enviar el correo electrónico.");
                        }
            } catch (error) {
                //fs.unlinkSync(filePath2);
                console.error("entro en error",error);
                res.status(400).send(error);
            }
        });

        //11 Envia un reclamo al owner
        router.post(`/${endpointTokensArray[18]}`, [verificarToken], async (req, res) => {
            const reclamo = true
            try {
                // Obtener los datos del cuerpo de la solicitud
                const { titulo, nombre, mensaje, jwtToken, dataCLiente } = req.body;
                console.log('Datos recibidos del reclamo:', { titulo, nombre, mensaje, jwtToken, dataCLiente });

                // Verificar si los objetos recibidos del frontend están parseados
                // Extraer el código de pedido del título
                const codigoPedido = titulo.split(':').pop().trim();
                //console.log('Código de pedido extraído del título:', codigoPedido);
                if (typeof codigoPedido !== 'string' || typeof nombre !== 'string' || typeof mensaje !== 'string') {
                    //console.log('Los objetos recibidos del frontend no están correctamente parseados.');
                    return res.status(400).send('Los objetos recibidos del frontend no están correctamente parseados.');
                }
                // Consultar la base de datos para obtener los datos relevantes del cliente y su compra
                const idCliente     = dataCLiente.idCliente
                const clienteData   = await EcommUser.findById(idCliente);
                const emailCliente  = clienteData.emailOficial
                const numCelCliente = clienteData.numCel[0].numCelCliente
                //console.log('Datos del cliente encontrado en la base de datos:', clienteData);
                // Verificar si se encontró el cliente y su compra
                if (!clienteData) {
                    //console.log('No se encontró ningún cliente con el código de pedido especificado.');
                    return res.status(404).send('No se encontró ningún cliente con el código de pedido especificado.');
                }
                // Extraer los datos relevantes del cliente y su compra
                const compraCliente = clienteData.comprasCliente;
                //console.log('compraCliente del cliente encontrado:', compraCliente);
                const dataIdOwner = compraCliente.find(item => item.codigoPedido.toLowerCase() === codigoPedido.toLowerCase());

                //console.log('ID del propietario encontrado:', dataIdOwner);

                // Verificar si se encontró el propietario
                if (!dataIdOwner) {
                    console.log('No se encontró ningún propietario con el código de pedido especificado.');
                    return res.status(404).send('No se encontró ningún propietario con el código de pedido especificado.');
                }

                // Consultar la base de datos para obtener los datos del propietario
                const ownerData = await User.findById(dataIdOwner.idDueno);
                //console.log('***************************************************Datos del propietario encontrado en la base de datos:', ownerData);
                const emailOwner      = ownerData.email
                const nombreOwner     = ownerData.ecommerceName;
                const nombreCliente   = `${clienteData.nombre} ${clienteData.apellido}`;
                const subjectCliente  = `Hola ${nombreCliente} su reclamo fue recibido en ${nombreOwner}`;
                const subjectOwner    = `Hola ${nombreOwner} tienes un reclamo para atender de ${nombreCliente}`;
                const numCelOwner     = ownerData.numCel[0].numCelOwner
                const transportEmail  = ConfigGrl.transportGmail
                const enviarExcel = false
                const otraData = null
                // Enviar correo electrónico
                const dataEnviarEmail = {transportEmail,reclamo,enviarExcel, emailOwner, emailCliente, numCelCliente, numCelOwner, mensaje, codigoPedido, nombreOwner, nombreCliente, subjectCliente, subjectOwner, otraData};
                const enviarEmails = await sendMail(dataEnviarEmail) 
                //console.log("Puedo enviar lso emails?", enviarEmails)
                // Enviar respuesta de éxito al cliente
                res.status(200).send('Reclamo enviado con éxito');
            } catch (error) {
                // Capturar cualquier error y enviar una respuesta de error al cliente
                console.error('Error al enviar el reclamo:', error);
                res.status(500).send('Ha ocurrido un error al enviar el reclamo');
            }
        });

        //12 Envia un reclamo al owner
        router.post(`/${endpointTokensArray[88]}`, [verificarToken], async (req, res) => {
        //router.post('/cancelar/envio/pedido', async (req, res) => {
            const { codPedi, idCliente, idOwner} = req.body;
            try {
                // Cambiar el status del pedido en el cliente
                const dataCliente = await EcommUser.findById(idCliente);
                const dataOwner = await User.findById(idOwner);
                const arrayDataPed = dataCliente.comprasCliente;
                const objPedidoCliente = arrayDataPed.find(e => e.codigoPedido === codPedi);
                objPedidoCliente.statusEnvio = "Pedido Cancelado";
                dataCliente.save()
                // Cambiar el status del pedido en el propietario
                const updatedDataCliente = await User.findByIdAndUpdate(
                    idOwner,
                    { $set: { 'Ventas.$[elem].dataCompra.statusEnvio': 'Pedido Cancelado' } },
                    { arrayFilters: [{ 'elem.dataCompra.codigoPedido': codPedi }] }
                );
                // Guardar los cambios en ambas colecciones
                //console.log("¿Canceló el pedido?", updatedDataCliente);
                res.status(200).send(`Su pedido codigo ${codPedi} fue cancelado con éxito`
            );

                // envia los emails avisando la cancelacion del pedido
                const { reclamo, enviarExcel, pedidoCobrado } = false
                const transportEmail  = {}
                const emailCliente    = dataCliente.emails[0].emailCliente
                const numCelCliente   = dataCliente.numCel[0].numCelCliente
                const numCelOwner     = dataOwner.numCel[0].numCelOwner
                const codigoPedido    = codPedi
                const nombreOwner     = dataOwner.ecommerceName
                const nombreCliente   = `${dataCliente.nombre} ${dataCliente.apellido}`;
                const mensaje         = `El pedido número de codigo ${codPedi} fue cancelado por el cliente ${nombreCliente}`
                const subjectCliente  = `Hola ${nombreCliente} tu pedido número de codigo ${codPedi} fue cancelado con éxito`
                const subjectOwner    = `${nombreOwner} te informamos que se cancelo el pedido número de codigo ${codPedi}`
                const logoOwner       = dataOwner.pathLogo
                const cancelaEnvio    = true
                const emailOwner      = dataOwner.email
                const dataPEdido      = dataOwner.Ventas.find(e => e.dataCompra.codigoPedido === codPedi)
                const otraData        = {}
                otraData.dataDir      = dataPEdido.dataDir
                const dataEnviarEmail = {transportEmail, reclamo, enviarExcel, emailOwner, emailCliente, numCelCliente, numCelOwner, mensaje, codigoPedido, nombreOwner, nombreCliente, subjectCliente, subjectOwner, otraData, logoOwner, cancelaEnvio, pedidoCobrado};


                // Enviar el correo electrónico
                const enviarEmails = await sendMail(dataEnviarEmail);

            } catch (error) {  
                // Capturar cualquier error y enviar una respuesta de error al cliente
                console.error('Error al cancelar el pedido:', error);
                res.status(500).send('Ha ocurrido un error al cancelar el pedido, intente más tarde');
            }
        });

        //13 cambio de direccion del envio del pedido
        router.post(`/${endpointTokensArray[97]}`, [verificarToken], async (req, res) => {
        //router.post('/actualizar/cambioDeDireccionDelPedido', async (req, res) => {
            //console.log("Datos recibidos en req.body:", req.body);

            try {
                // Recibir los datos de la dirección del cuerpo de la solicitud
                const direccion = req.body.direccion;
                const { idCliente, pais, estado, localidad, calle, numero, codigoPostal, latitud, longitud, codigoPedido } = direccion;

                //console.log("Que direccion encontro??.", direccion);

                // Buscar el cliente por su ID
                const dataOwner = await User.findById(direccion.idCliente);
                //console.log("Que idCliente encontro??.", idCliente, dataOwner);
                // Verificar si se encontró el cliente
                if (!dataOwner) {
                    //console.log('No se encontró ningún cliente con el ID proporcionado.');
                    return res.status(404).json({ message: 'No se encontró ningún cliente con el ID proporcionado.' });
                }

                // Obtener las ventas del cliente
                const Ventas = dataOwner.Ventas;

                // Encontrar el pedido por su código
                const pedidoIndex = Ventas.findIndex(pedido => pedido.dataCompra.codigoPedido === codigoPedido);

                // Verificar si se encontró el pedido
                if (pedidoIndex !== -1) {
                    const estadoEnvio = Ventas[pedidoIndex].statusEnvio
                    if (estadoEnvio !== "Armando su pedido") {
                        //console.log('No puede cambiar la dirección del pedido el mismo esta en camino.', Ventas[pedidoIndex].statusEnvio);
                        return res.status(404).json({ message: 'No puede cambiar la dirección del pedido el mismo esta en camino.' });
                    }
                    const CP = codigoPostal;
                    // Convertir la cadena 'numero' a un número entero
                    const numeroPuerta = parseInt(numero);
                    const lat = latitud;
                    const lng = longitud;
                    const newDataDirChange = { lat, lng, pais, estado, localidad, calle, numeroPuerta, CP };
                    //console.log('La dirección que debe ser cambiada.', Ventas[pedidoIndex].dataDir);
                    // Crear un nuevo objeto pedido con los cambios en la dirección
                    const pedidoActualizado = { ...Ventas[pedidoIndex], dataDir: newDataDirChange };
                    // Crear una nueva array de ventas con el pedido actualizado
                    const nuevasVentas = [...Ventas.slice(0, pedidoIndex), pedidoActualizado, ...Ventas.slice(pedidoIndex + 1)];
                    // Actualizar las ventas del cliente con las nuevas ventas
                    dataOwner.Ventas = nuevasVentas;
                    await dataOwner.save(); // Guardar los cambios en dataOwner
                    //console.log('La dirección se actualizó correctamente.', newDataDirChange);
                    return res.status(200).json({ message: 'La dirección se actualizó correctamente.' });
                } else {
                    console.log('No se encontró ninguna dirección con las coordenadas proporcionadas.');
                    return res.status(404).json({ message: 'No se encontró ninguna dirección con las coordenadas proporcionadas.' });
                }
            } catch (error) {
                console.error('Error al actualizar la dirección:', error.message);
                return res.status(500).json({ message: 'Error al actualizar la dirección.' });
            }
        });

        //13.3 busca mensajes pull
        router.post('/messagesPull', async (req, res) => {
            try {
                //console.log("Que datos llegan a mensajes pull cada 5 minutos", req.body);
                // Supongamos que obtienes los datos de alguna fuente, como una base de datos
                const idCliente = req.body.idCliente
                const data = await Mensajes.find({idCliente})
            // console.log("Que datos encontro?",idCliente,data)
                // Devolver los datos con status 200
                res.status(200).json(data);
            } catch (error) {
                console.error("Error al obtener mensajes:", error);
                // Si ocurre algún error, devolver un status 500 y un mensaje de error
                res.status(500).json({ error: "Error al obtener mensajes" });
            }
        });

        //13.5 Ruta para suscribirse a notificaciones push
        router.post('/subscribePush', async (req, res) => {
            try {
                // Lógica para guardar la suscripción en la base de datos
                //console.log("que datos lelgan para suscribir un cliente push", req.body)
                const {dataCli} = req.body
                const dataPushCliente = req.body
                const idCliente = dataCli.idCliente

                const pushCliente = await pushMess.findOne({ 'dataCli.idCliente': idCliente });
                // Verifica si ya está suscrito
                if (pushCliente) {
                    const cheqTime = pushCliente.date;
                    const currentTime = new Date(); // Obtener la hora actual
                    const diffInHours = Math.abs(currentTime - cheqTime) / 36e5; // Calcular la diferencia en horas
                    if (diffInHours >= 1) { // Si la diferencia es mayor o igual a 1 hora
                        await pushMess.findOneAndUpdate({ 'dataCli.idCliente': idCliente }, dataPushCliente);
                    }
                    // Lógica adicional si es necesario
                    await pushMensajeFunc(idCliente); // Llamar a la función de envío de mensajes
                    return;
                }
                // Guardar la suscripción en la base de datos o en memoria
                const guardardataPsuh = new pushMess({ dataPushCliente });
                await guardardataPsuh.save();
                
                // Enviar respuesta al cliente
                res.status(200).json({ message: 'Suscripción exitosa' });

                await pushMensajeFunc(idCliente)

            } catch (error) {
                console.error('Error al guardar la suscripción:', error);
                res.status(500).json({ message: 'Error al guardar la suscripción' });
            }
        });

        //14 elimina los mensajes push
        router.post(`/${endpointTokensArray[77]}`, [verificarToken], async (req, res) => {
            try {
                //console.log("Datos recibidos para eliminar pushMensajes:", req.body);
                const { idMess } = req.body;
                // Validación de datos
                if (!idMess) {
                    return res.status(400).json({ succes:false, message: "Faltan datos requeridos para eliminar el mensaje push." });
                }

                // Eliminar el mensaje push
                const deletedPushMensaje = await Mensajes.findByIdAndDelete(idMess);
                if (!deletedPushMensaje) {
                    return res.status(404).json({ message: "No se encontró ningún mensaje push con los datos proporcionados." });
                }
        
                // Enviar una respuesta de éxito (código 200) como un objeto JSON
                res.status(200).json({ message: "Mensaje push eliminado exitosamente." });
            } catch (error) {
                console.error("Error al eliminar el mensaje push:", error);
                // Enviar una respuesta de error (código 500) con el mensaje de error
                res.status(500).json({ message: "Error al eliminar el mensaje push: " + error.message });
            }
        });

        // 15 Envia mensaje desde contacto
        router.post(`/${endpointTokensArray[33]}`, [verificarToken], async (req, res) => {
        //router.post('/recibiendoMensajeDesdeContacto', async (req, res) => {
            try {
                //console.log("Datos recibidos desde el formulario de contacto:", req.body.dataOwner);
                const { nombre, email, ciudad, numCel, mensaje, dataOwner, dataCliente, jwToken } = req.body;
                const codigoPedido = null
                // Aquí podrías agregar la lógica para enviar un correo electrónico con la consulta
                // envia los emails avisando la cancelacion del pedido
                const transportEmail  = dataOwner.transportEmail
                const emailCliente    = dataCliente.emails[0].emailCliente
                const numCelCliente   = dataCliente.numCel[0].numCelCliente
                const numCelOwner     = dataOwner.numCel[0]
                const messageOwner    = `${mensaje}`
                const messageCliente  = `${mensaje}`
                const nombreOwner     = dataOwner.nombreEcommerce
                const nombreCliente = `${dataCliente.nombre} ${dataCliente.apellido}`;
                const subjectCliente  = `Hola ${nombreCliente} tu consulta ha sido enviada`
                const subjectOwner    = `Hola ${nombreOwner} tienes una nueva consulta`
                const logoOwner       = dataOwner.logoOwner
                const emailOwner      = dataOwner.email
                let otraData          = {}
                const pais            = dataCliente.direcciones[0].pais
                otraData.messageOwner = messageOwner
                otraData.messageCliente = messageCliente
                otraData.Consulta     = true
                otraData.dataDir      = {nombre, email, ciudad, numCel, pais}
                const dataEnviarEmail =  {transportEmail, reclamo: false, enviarExcel: false, emailOwner, emailCliente, numCelCliente, numCelOwner, mensaje, codigoPedido:null, nombreOwner, nombreCliente, subjectCliente, subjectOwner, otraData,logoOwner, cancelaEnvio:false, pedidoCobrado:false, quedaUno:false, product:false};

                await sendMail(dataEnviarEmail) 

                // guarda el mensaje para los push mensaje
                await guardarMensajes(dataOwner, dataCliente, mensaje, subjectOwner, subjectCliente, codigoPedido)

                // Si todo está bien, envía una respuesta con un status 200
                return res.status(200).json({ message: "El mensaje se envió correctamente." });
            } catch (error) {
                // Si hay algún error, envía una respuesta con un status 400
                console.error("Error al procesar el mensaje:", error);
                return res.status(400).json({ message: "No se pudo enviar el mensaje." });
            }
        });

        // recive las consultas de  a tienda online ecommerce
        //console.log("Le entro endpointTokensArray[101] a guardar una consulta desde el ecommerce ", endpointTokensArray[101])
        router.post(`/${endpointTokensArray[101]}`, [], async (req, res) => {
            //router.post('/datos/custom/cliente', [verificarToken], async (req, res) => {
                console.log("Le entrooooooooooooo a guardar una consulta desde el ecommerce ",req.body)
                try {
                    // Desestructuración del objeto req.body
                    const { nombre, apellido, celular, email, descripcionProyecto, consulta } = req.body;
        
                    // Aquí se guardo el mensaje
                    const guardarMensajes = new Mensajes(
                        {
                        names:nombre, 
                        apellido, 
                        numCel:celular, 
                        email,
                        message:descripcionProyecto
                        })
                        guardarMensajes.save()
        
                        res.status(200).json({ success: true, message: "Su consulta fue recibida con éxito" });
        
                        //const transportEmail = ConfigG.transportEmail
                        const dataUser = await User.findOne()
                        const transportEmail = dataUser.transportEmail
        
                        console.log("Se copio el tranpostrter???" , transportEmail)
        
                        let subjectOwner = ""
                        if (consulta) {
                        subjectOwner = "ATENCIÓN!!! Una consulta entrante"
                        } else {
                        subjectOwner = "ATENCIÓN!!! Un posible cliente CUSTOM"
                        }
                        // enviar por email el mensaje
                        const dataEnviarEmail = {transportEmail, reclamo:false, enviarExcel:false, emailOwner:"sebastianpaysse@gmail.com", emailCliente:email, numCelCliente:celular, numCelOwner:dataUser.numCel[0].numCelOwner, mensaje:`<br> ${descripcionProyecto}`, codigoPedido:"16165", nombreOwner:"Sebas", nombreCliente:nombre, subjectCliente:`Hola ${nombre}, nos llegó tu consulta`, subjectOwner, otraData:null, logoOwner:null, cancelaEnvio:false, pedidoCobrado:false, quedaUno:false, product:false, inscripcion:false, Promo:false, ConsultaOK:true} 
        
                        await sendMail(dataEnviarEmail)
        
                } catch (error) {
                    // Si ocurre un error, responder con un código 500 (error del servidor) y un mensaje de error
                    console.error('Error al obtener los datos básicos:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Ocurrió un error al obtener los datos básicos.'
                    });
                }
        });

    }

    // funciones de mercado pago
    async function registerEnpointsMP(endPointsBackend, verificarToken) {

        let endpointTokensArray = endPointsBackend
        // para activar boton pago con TC en MP tienda Online
        //console.log("que idPoint encontro ",endpoint5)
        router.post(`/${endpointTokensArray[127]}`, [verificarToken], async (req, res) => {
        //router.post('/create_preference3', async (req, res) => {
            try {
            const {amount, idCliente,idOwner,jwToken, pedidoCarrito, payer, urlServer } = req.body;
        
            console.log("11111111111Que datos recibo del fronen con TC????", req.body )
        
            const pedidito = JSON.parse(pedidoCarrito);
        
        
            const pedidosItems = pedidito.map(e => ({
                title: e.nombreProducto,
                description: e.descripcion,
                quantity: e.cantidad,
                unit_price: e.precio,
            }));
            
            pedidosItems[0].unit_price + amount
        
            const ArTokenPrivateMP = ConfigG.ArTokenPrivateMP 
        
            const client = new MercadoPagoConfig({ accessToken: ArTokenPrivateMP });
            //console.log("222222222222222Que datos recivo de client MP PAGO CON TC????????", client )
            
            const preference = new Preference(client);
            //console.log("3333333333333Que datos recivo de preference MP PAGO CON TC????????", preference )
        
            //console.log("4444444444444Que pedidosItems armo PAGO CON TC????????", pedidosItems )
        
            await preference.create({
                body : {
                    items: pedidosItems,
                    payer: payer,
                    back_urls: {
                        success: `${urlServer}resultado/del/cobro/enMP`,
                        failure: `${urlServer}resultado/del/cobro/enMP`,
                        pending: `${urlServer}resultado/del/cobro/enMP`,
                    },
                    auto_return: 'approved', // Retornar automáticamente cuando el pago es aprobado
                    external_reference : {idCliente,idOwner,Token:jwToken},
                    binary_mode: true, // Habilita o deshabilita el modo binario (true/false)
                    statement_descriptor: 'UsaTiendaOnline',
                }
            })
            .then(data => {
                if (data && data.id) {
                //console.log("5555555555555Que mierda obteiene aqui PAGO CON TC????????", data.id )
                res.status(200).json({ idMPUser: data.id });
        
                } else {
                console.log("5555555555Que mierda NOOOOOOOOOOOOOO obteiene aqui PAGO CON TC????????", data )
                throw new Error('No se pudo crear la preferencia.');
                }
        
            });
        
            } catch (error) {
            console.error('Error al crear la preferencia de pago PAGO CON TC:', error);
            res.status(500).json({ data: 'Error al crear la preferencia de pago con TC' });
            }
        });
        
        // para pagar/cobrar con tarjetas de credito debito tienda Online
        //console.log("que idPoint encontro ",endpoint5)
        router.post(`/${endpointTokensArray[128]}`, [verificarToken], async (req, res) => {
        //router.post('/process_payment', async (req, res) => {
            // Agrega credenciales
            console.log("Qué datos obtiene MP para pagar/cobrar con tarjetas de credito debito", req.body);
            const {formData, jwToken} = req.body
            try {
        
            const ArTokenPrivateMP = ConfigGrl.ArTokenPrivateMP 
        
            let client = new MercadoPagoConfig({accessToken: ArTokenPrivateMP});
        
            // crea el pago para enviar al server de MP
            const payment = new Payment(client);
            payment.create({ body: formData })
        
            // recibe la respuesta del sever de MP
            .then(data => {
                console.log("Que data encontró en process_payment", data);
                data.idMPUser = data.id
                //console.log("Qué datos obtiene MPreference", data);
                res.status(200).json(data);
            })
        
            } catch (error) { 
            // Enviar una respuesta de error si ocurre algún problema
            console.error('Error al crear la preferencia de pago endpoint128:', error);
            res.status(500).json({ error: 'Error al crear la preferencia de pago endpoint128' });
            }
        });
        
        /*PAGO MP WALLETS ECOMMERCE para pago con wallets tienda Online*/
        //console.log("--------ENPOIBNTS22222222222 125 idPoint encontro ", `/${endpointTokensArray[125]}`)
        router.post(`/${endpointTokensArray[125]}`, [verificarToken], async (req, res) => {
            console.log("*******************Viene de  MPWallet 1111 MP que idPoint encontro ",req.body)
            const idCliente = req.body.dataCliente._id
            const idOwner   = req.body.dataCliente.idOwner
            const Token     = req.body.dataCliente.Token
            const amount    = req.body.amount
            try {
            // Iterar sobre el array de productos 'pedidoPendCobrar'
            const pedidosItems = [];
            // Iterar sobre el array de productos 'pedidoPendCobrar'
            req.body.pedidoPendCobrar.forEach(e => {
                let title       = e.nombreProducto;
                let description = e.descripcion;
                let unit_price  = e.precio;      // Convertir 'precio' a número para asegurar que sea numérico
                let quantity    = e.cantidad;    // Convertir 'cantidad' a número
                // Agregar el producto procesado al array 'pedidosItems'
                pedidosItems.push({ title, description, quantity, unit_price });
            });
        
            //console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA", pedidosItems, amount )
        
            // Si 'amount' es un valor numérico, asegúrate de convertirlo antes de sumar
            const amountNumber = Number(amount);
            
            // Actualizar solo el 'unit_price' del primer elemento [0] del array
            if (pedidosItems.length > 0) {
                // Asegúrate de que el unit_price sea un número después de la suma
                let c = pedidosItems[0].unit_price = Number(pedidosItems[0].unit_price) + amountNumber;
                //console.log("qqqqqqqqqqqqqqqqqqqqqqqq", pedidosItems[0].unit_price, c)
            }
            
            // Ahora, el primer elemento de 'pedidosItems' tendrá el 'unit_price' actualizado correctamente.
            
            //const dataOwner = await User.findById(idOwner)

            //console.log("tiene los ConfigGrlConfigGrl??????", ConfigGrl)

            const ArTokenPrivateMP = ConfigGrl.ArTokenPrivateMP;
        
            // pedidosItems[0].unit_price + amount

            console.log("tiene los token??????", ArTokenPrivateMP)
            
            let client = new MercadoPagoConfig({accessToken: ArTokenPrivateMP});
            
            console.log("Que client privado  encuentra  en MPwallets???", client)
        
            
            const preference = new Preference(client);
            
            await preference.create({
            body : {
                items: pedidosItems,
                purpose: 'wallet_purchase',
                back_urls: {
                success: `${ConfigGrl.urlServer}resultado/del/cobro/enMP`,
                failure: `${ConfigGrl.urlServer}resultado/del/cobro/enMP`,
                pending: `${ConfigGrl.urlServer}resultado/del/cobro/enMP`,
                },
                payer: req.body.dataCliente.payer,
                purpose: "wallet_purchase",
                auto_return: "approved",
                binary_mode: true,
                statement_descriptor: "usatienfacil",
                external_reference : {idCliente, idOwner, Token},
                init_point:global.init_point
                },
            })
            
            .then(data => {
            console.log("Que data encontro del 125 server MP", data);
            preference.idMPUser = data.id
            const dataMP = {}
            dataMP.initPoint = data.init_point
            dataMP.idMPUser = data.id
            res.status(200).json({dataMP,preference});
            })
            } catch (error) {
                // Enviar una respuesta de error si ocurre algún problema
                registrarYEnviarIncidente({mensajeError:error}, {emailReport:"sebastianpaysse@gmail.com"}, {userIncidentID:idCliente}, {userEmailIncident:"emailCliente"})
                res.status(500).json({ success: false, message: "Ocurrió un error al procesar la compra, intente de nuevo mas tarde" });
                console.error('Error al crear la preferencia de pago endpoint125:', error);
                res.status(500).json({ error: 'Error al crear la preferencia de pago endpoint125' });
            }
        });
        
        
        // devolucciones del cobro MP wallets
        // router.get(`${urlServer}/resultado/del/cobro/enMP`, async (req, res) => {
        router.get(`/resultado/del/cobro/enMP`, async (req, res) => {
            try {
                console.log("/resultado/del/cobro/enMP que devuelve desde MP:", req.query);
                
                // Desestructurar la información de req.query
                const { collection_status, external_reference, payment_id, collection_id, Token } = req.query;
        
                let okCobroMP = false;
                // Convertir external_reference a objeto
                const externalReferenceObj = JSON.parse(external_reference);
                const { idCliente, idOwner } = externalReferenceObj;
        
                const dataOwner = await User.findById(idOwner);

                console.log("Encotnro al owner????????????", dataOwner._id)

                let dominioUrls
                let cheqDom = dataOwner?.dominio || false;
                if (cheqDom) {
                    dominioUrls = `${dataOwner.urlOwner}/indexEcomm.html`;
                } else {
                    dominioUrls = urlServer + dataOwner.urlOwner;
                }

                console.log("Que dominio encuentra ", dominioUrls)
        
                // Verificar que payment_id y collection_id no sean 'null' como cadena o undefined
                if (payment_id !== 'null' && payment_id && collection_id !== 'null' && collection_id) {
                    const paymentData = await consultarEstadoPago(payment_id);
                    okCobroMP = paymentData.status === 'approved';
                    console.log('Datos del pago:', paymentData);
                    console.log(okCobroMP ? 'Pago Aprobado' : 'Pago No Aprobado');
                } else {
                    console.log('Volvio de MP o Pago rechazado, intente con otro método de pago');
                    const redirectURL = `${dominioUrls}`;
                    return res.redirect(redirectURL);
                }
        
                // Verificar si el cobro fue aprobado
                if (collection_status === 'approved' && okCobroMP) {
                    const redirectURL = `${dominioUrls}?statusCobro=approved&idCliente=${idCliente}&idOwner=${idOwner}&okCobroMP=${okCobroMP}&Token=${Token}`;
                    console.log("El cobro SI fue aprobado", redirectURL);
                    return res.redirect(redirectURL);
                } else {
                    console.log("El cobro NO fue aprobado");
                    const redirectURL = `${dominioUrls}/?statusCobro=failed&ref1=null&ref2=null&Token=${Token}`;
                    return res.redirect(redirectURL);
                }
            } catch (error) {
                console.error("Error al procesar el cobro en MP:", error);
                const redirectURL = `${dominioUrls}/?statusCobro=failed&ref1=null&ref2=null&Token=${Token}`;
                return res.redirect(redirectURL);
            }
        });
    }

    // Ruta para la política de privacidad
    router.get('/politicaPrivacidad', async (req, res) => {
        res.sendFile(path.join(__dirname, '../', 'views', 'politicasUso.html'));
    });
    
    // O, si es condiciones de uso
    router.get('/terminosUso', async (req, res) => {
        res.sendFile(path.join(__dirname, '../', 'views', 'terminosUso.html'));
    });


module.exports = router