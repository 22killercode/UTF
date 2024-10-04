require('dotenv').config();
const express   = require('express');
const router    = express.Router(); 
const cors      = require('cors');
router.use(cors());
const fs        = require('fs');
const os = require('os'); // Asegúrate de importar el módulo 'os'
const path      = require('path');  // Asegúrate de agregar esta línea
// codificador
const bcrypt    = require('bcrypt');

//models
const User      = require('../models/User');
const GrlConfig = require('../models/configsGrl');
const Mensajes  = require('../models/messages');

//pasarela de pagos
const { MercadoPagoConfig, Payment, Preference  } = require('mercadopago');
const {saveOrUpdateConfig}= require('./configGlrs');
const {sendMail, guardarFondo, consultarEstadoPago, guardarMensajes, SingUp, UpDateUpGrade, endpointTokensArray2, verificarToken} = require('./funcionesymas');

let ConfigG = {}
async function configss() {
  try {
      ConfigG = await saveOrUpdateConfig()
      //console.log('MPPPPPPPPPPP111111111mp11111111111111Cual es la Configuración global obtenida:', ConfigG);
      // Puedes hacer algo con ConfigG aquí
  } catch (error) {
      console.error('Error al obtener la configuración global:', error);
  }
}
// Llamar a la función configuraciones generales
configss();

const bodyParser = require('body-parser');

router.use(bodyParser.text());

const endpointTokensArray = endpointTokensArray2

  // para activar boton pago con TC en MP tienda Online
  const endpointTokensArrayString127 = endpointTokensArray[127]
  const endpointTokensArray127 = endpointTokensArrayString127.split(',');
  const endpoint127 = (typeof endpointTokensArray127 === 'string') ? endpointTokensArray127 : endpointTokensArray127.toString().replace("http://localhost:3020/", "");
  //console.log("que idPoint encontro ",endpoint5)
  router.post(`/${endpoint127}`, [verificarToken], async (req, res) => {
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
  const endpointTokensArrayString128 = endpointTokensArray[128]
  const endpointTokensArray128 = endpointTokensArrayString128.split(',');
  const endpoint128 = (typeof endpointTokensArray128 === 'string') ? endpointTokensArray128 : endpointTokensArray128.toString().replace("http://localhost:3020/", "");
  //console.log("que idPoint encontro ",endpoint5)
  router.post(`/${endpoint128}`, [verificarToken], async (req, res) => {
  //router.post('/process_payment', async (req, res) => {
    // Agrega credenciales
    console.log("Qué datos obtiene MP para pagar/cobrar con tarjetas de credito debito", req.body);
    const {formData, jwToken} = req.body
    try {

      const ArTokenPrivateMP = ConfigG.ArTokenPrivateMP 

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
      console.error('Error al crear la preferencia de pago:', error);
      res.status(500).json({ error: 'Error al crear la preferencia de pago endpoint128' });
    }
  });

  /*para pago con wallets tienda Online*/
  const endpointTokensArrayString125 = endpointTokensArray[125]
  const endpointTokensArray125 = endpointTokensArrayString125.split(',');
  const endpoint125 = (typeof endpointTokensArray125 === 'string') ? endpointTokensArray125 : endpointTokensArray125.toString().replace("http://localhost:3020/", "");
  router.post(`/${endpoint125}`, [verificarToken], async (req, res) => {
  console.log("1111111111111111111111111111111 MP que idPoint encontro ",req.body)

  try {

      const idCliente = req.body.dataCliente._id
      const idOwner   = req.body.dataCliente.idOwner
      const Token     = req.body.dataCliente.Token
      const amount    = req.body.amount

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

      console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA", pedidosItems, amount )

      // Si 'amount' es un valor numérico, asegúrate de convertirlo antes de sumar
      const amountNumber = Number(amount);
      
      // Actualizar solo el 'unit_price' del primer elemento [0] del array
      if (pedidosItems.length > 0) {
          // Asegúrate de que el unit_price sea un número después de la suma
          let c = pedidosItems[0].unit_price = Number(pedidosItems[0].unit_price) + amountNumber;
          console.log("qqqqqqqqqqqqqqqqqqqqqqqq", pedidosItems[0].unit_price, c)
      }
      
      // Ahora, el primer elemento de 'pedidosItems' tendrá el 'unit_price' actualizado correctamente y será un número.
      
      
      // Ahora, el primer elemento de 'pedidosItems' tendrá el 'unit_price' actualizado correctamente.
      
      const dataOwner = await User.findById(idOwner)

      const ArTokenPrivateMP = ConfigG.ArTokenPrivateMP;


      // pedidosItems[0].unit_price + amount

      let client = new MercadoPagoConfig({accessToken: ArTokenPrivateMP});
      
      //console.log("Que client privado  encuentra  en MPwallets???", client)

      let idMPUser = {}
      
      const preference = new Preference(client);
      
      await preference.create({
      body : {
          items: pedidosItems,
          purpose: 'wallet_purchase',
          back_urls: {
          success: `${dataOwner.urlServer}resultado/del/cobro/enMP`,
          failure: `${dataOwner.urlServer}resultado/del/cobro/enMP`,
          pending: `${dataOwner.urlServer}resultado/del/cobro/enMP`,
          },
          payer: req.body.dataCliente.payer,
          purpose: "wallet_purchase",
          auto_return: "approved",
          binary_mode: true,
          statement_descriptor: "usatienfacil",
          external_reference : {idCliente,idOwner,Token},
          init_point:global.init_point
        },
      })
      
      .then(data => {
      console.log("Que data encontro", data);
      preference.idMPUser = data.id
      const dataMP = {}
      dataMP.initPoint = data.init_point
      dataMP.idMPUser = data.id
      res.status(200).json({dataMP,preference});
      })
    } catch (error) {
        // Enviar una respuesta de error si ocurre algún problema
        console.error('Error al crear la preferencia de pago:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago endpoint125' });
    }
  });





  // devolucciones del cobro MP wallets
  router.get('/resultado/del/cobro/enMP', async (req, res) => {
    try {
        console.log("/resultado/del/cobro/enMP que devuelve desde MP:", req.query);
        
        // Desestructurar la información de req.query
        const { collection_status, external_reference, payment_id, collection_id, Token } = req.query;

        let okCobroMP = false;
          // Convertir external_reference a objeto
          const externalReferenceObj = JSON.parse(external_reference);
          const { idCliente, idOwner } = externalReferenceObj;
  
          const dataOwner = await User.findById(idOwner);
          const dominio = dataOwner.dominio || `${dataOwner.urlServer}${dataOwner.urlOwner}`;

        // Verificar que payment_id y collection_id no sean 'null' como cadena o undefined
        if (payment_id !== 'null' && payment_id && collection_id !== 'null' && collection_id) {
            const paymentData = await consultarEstadoPago(payment_id);
            okCobroMP = paymentData.status === 'approved';
            console.log('Datos del pago:', paymentData);
            console.log(okCobroMP ? 'Pago Aprobado' : 'Pago No Aprobado');
        } else {
            console.log('Pago rechazado, intente con otro método de pago');
            const redirectURL = `${dominio}/?statusCobro=failed&ref1=null&ref2=null&Token=${Token}`;
            return res.redirect(redirectURL);
        }

        // Verificar si el cobro fue aprobado
        if (collection_status === 'approved' && okCobroMP) {
            const redirectURL = `${dominio}?statusCobro=approved&idCliente=${idCliente}&idOwner=${idOwner}&okCobroMP=${okCobroMP}&Token=${Token}`;
            console.log("El cobro SI fue aprobado", redirectURL);
            return res.redirect(redirectURL);
        } else {
            console.log("El cobro NO fue aprobado");
            const redirectURL = `${dominio}/?statusCobro=failed&ref1=null&ref2=null&Token=${Token}`;
            return res.redirect(redirectURL);
        }
    } catch (error) {
        console.error("Error al procesar el cobro en MP:", error);
        const redirectURL = `${dominio}/?statusCobro=failed&ref1=null&ref2=null&Token=${Token}`;
        return res.redirect(redirectURL);
    }
});


  /****************************************************LANDIGNPAGE****************************************************** */


   //141 Ruta para abonar la Membresia Premium por FORMA MANUAL 
  const endpointTokensArrayString141 = endpointTokensArray[141]
  const endpointTokensArray141 = endpointTokensArrayString141.split(',');
  const endpoint141 = (typeof endpointTokensArray141 === 'string') ? endpointTokensArray141 : endpointTokensArray141.toString().replace("http://localhost:3020/", "");
  //console.log("Le endpointTokensArray101 a guardar CUSTOM ",endpoint101)
  router.post(`/${endpoint141}`, [verificarToken], async (req, res) => {        
      try { 
          console.log("Request Body 141 pago manual landingPAge:", req.body);
          console.log("Request Files 141 pago manual landingPAge:", req.files);
  
          const { imgTicket } = req.files;
          const { name, tempFilePath, data } = imgTicket;
          const { paymentMethod, ticketNumber, extraData, dataOwner, dataPay } = req.body;
          const { nombre, apellido, emailXYZ123, passwordXYZ123 } = JSON.parse(dataOwner);
          const { precioFinal, cantPRODO, tiempoContratoO } = JSON.parse(dataPay);
  
          // Verificar si el email ya está registrado
          const cheqMail = await User.findOne({ email: emailXYZ123 });
          if (cheqMail) {
              throw new Error('Este email ya está registrado');
          }
  
          // Verificar si se subió una imagen
          if (!tempFilePath) {
              throw new Error('La imagen del ticket es requerida.');
          }
  
          const nameTiket = (emailXYZ123 + name )
          const receiptImagePath = path.join(__dirname, `../public/img/uploads/imgTicketsLP/${nameTiket}`);
          let singUP = {}
          // Registrar un nuevo usuario si es necesario
          if (ticketNumber) {
              const ticketPath = receiptImagePath
              const datosExtrasdeMP = null

              console.log("Que se envia a sigUp?????????:", emailXYZ123, passwordXYZ123, ticketNumber, datosExtrasdeMP, ticketPath, cantPRODO, tiempoContratoO, precioFinal);
              singUP = await SingUp(emailXYZ123, passwordXYZ123, ticketNumber, datosExtrasdeMP, ticketPath, cantPRODO, tiempoContratoO, precioFinal);

              if (!singUP.cheqSignUp) {
                  throw new Error('Debes agregar el numero de ticket y subir la imagen del mismo.');
              }
          }

          // Guardar la imagen en el sistema de archivos
          if (os.platform().startsWith('win')) {
            // En sistemas Windows, usa mv para mover el archivo
            req.files.imgTicket.mv(receiptImagePath, err => { 
              if (err) {
                console.error('Error al mover el archivo:', err);
              } else {
                console.log('Archivo movido exitosamente a', receiptImagePath);
              }
            });
          } else {
            // En otros sistemas, usa fs.renameSync para mover el archivo
            fs.renameSync(tempFilePath, receiptImagePath);
            console.log('Archivo movido exitosamente a', receiptImagePath);
          }
          
          
          res.status(200).json({ success: true, message: 'Datos recibidos y correo enviado.' });
          
/************************************************************************************************************ */          
          // Guardar los datos en la base de datos
          const nuevoMensaje = new Mensajes({
            idOwner:singUP.id,
            email: emailXYZ123,
            names: nombre,
            apellido,
            pais: "Pago Manual",
            message: `
                Este es el ticket Nro: ${ticketNumber} que comprueba el pago por el método: ${paymentMethod}.
                <br>
                Pago: ${precioFinal}, Cantidad de productos contratados: ${cantPRODO}, por un tiempo de: ${tiempoContratoO} meses.
                <br>
                Mensaje: ${extraData}
              `,
            date: new Date()
          });
          await nuevoMensaje.save();



          message = `
                <br>
                ¡Hola ${nombre} Felicitaciones! <br> 
                <br>
                Tu membresía Premium y su cantidad de productos han sido correctamente actualizados.
                <br>
                No se te cobraran comisiones.
                <br>
                Te llamaremos para configurar tu nuevo dominio, ssl, pasarela de pago y demás datos.
                <br>
                Este proceso puede demorar 72 horas hábiles. 
                <br>
                Cantidad de productos contratados: ${cantPRODO}.
                <br>
                Tiempo de contrato de tu membresía y productos:${tiempoContratoO} meses.
                <br>
                <strong>Pago: ${precioFinal}.</strong> pesos.
                <br>
                Ticket Nro: ${ticketNumber} del pago por el método: ${paymentMethod}.
                <br>
                Datos Extra que nos enviaste: ${extraData}
                <br><br>
                <strong>La imputación del pago esta siendo procesada, te podemos llamar por alguna duda.<br>
                ya puedes disfrutar de todas las ventajas de tener la membresía premium.
                </strong>
                <br>
              `
          // Preparar y enviar el correo electrónico
          const tranportEmail = ConfigG.transportEmail
          const dataEnviarEmail = {
              transportEmail:tranportEmail,
              reclamo: false,
              enviarExcel: false,
              emailOwner: 'sebastianpaysse@gmail.com',
              emailCliente: emailXYZ123,
              numCelCliente: 'No especificado', // Deberías agregar la variable correcta si está disponible
              numCelOwner: 'No especificado', // Deberías agregar la variable correcta si está disponible
              mensaje: message,
              codigoPedido: ticketNumber,
              nombreOwner: "Sebas",
              nombreCliente: nombre,
              subjectCliente: `Hola ${nombre}, Bienvenido a Usa Tienda Facil, nos llegó tu pago`,
              subjectOwner: `Se inscribió ${nombre} un nuevo cliente desde la Landing Page`,
              otraData: null,
              logoOwner: null,
              cancelaEnvio: false,
              pedidoCobrado: false,
              quedaUno: false,
              product: false,
              inscripcion: true,
              Promo: false,
              attachments: [{ path: receiptImagePath }]
          };
          await sendMail(dataEnviarEmail);
  
      } catch (error) {
          console.error('Error:', error);
          res.status(400).json({ success: false, message: error.message });
      }
  });


   //142 UPDATED USUARIO YA EXISTENTE WALLET DESDE CPANEL PARa Membresia Premium por FORMA MANUAL UPGRADE desde Cpanel
  const endpointTokensArrayString142 = endpointTokensArray[142]
  const endpointTokensArray142 = endpointTokensArrayString142.split(',');
  const endpoint142 = (typeof endpointTokensArray142 === 'string') ? endpointTokensArray142 : endpointTokensArray142.toString().replace("http://localhost:3020/", "");
  router.post(`/${endpoint142}`, [verificarToken], async (req, res) => {        
      try { 
          console.log("142 Request Body:", req.body);
          console.log("142 Request Files:", req.files);
          okCobroMP = true
          /* ********************************************************************************************************/
          if (okCobroMP) {

          const { imgTicket } = req.files;
          const { name, tempFilePath, data } = imgTicket;
          const { paymentMethod, ticketNumber, extraData, dataOwner, dataPay, urlServer, fechaVencMem } = req.body;

                    const { nombre, apellido, email, ownerID, cantProdQTiene, cantContratosMemRealizados, tipoMembresia } = JSON.parse(dataOwner);

                    const dataPAyO = JSON.parse(dataPay);
                    const { precioFinal, cantPRODO, tiempoContratoO } = dataPAyO

                    let tipoDPago = ""
                    if (imgTicket) {
                      tipoDPago = "Manual"
                    }else{
                      tipoDPago= "Electrónico MP"
                    }
            
                    // Verificar si se subió una imagen
                    if (!tempFilePath) {
                        throw new Error('La imagen del ticket es requerida.');
                    }
            
                    const nameTiket = (email + name )
                    const receiptImagePath = path.join(__dirname, `../public/img/uploads/imgTicketsLP/${nameTiket}`);
                    let upDateBDOwner =  {}
                    // Actualiza el usuario que realizo el upgrade a membresia premium
                    if (ticketNumber) {
                      const ticketPath = receiptImagePath
                      const datosExtrasdeMP = extraData
                      dataPAyO.tipoDPago = tipoDPago

                      const dataSendUpGrade = {ownerID, paymentMethod, ticketNumber, datosExtrasdeMP, ticketPath, dataPAyO, cantProdQTiene, cantContratosMemRealizados, fechaVencMem, tipoMembresia, precioFinal }
                      upDateBDOwner = await UpDateUpGrade(dataSendUpGrade);

                      if (upDateBDOwner.successUpdated === false) {
                        res.status(400).json({ success: false, message: "No se pudo Actualizar tu membresía intenta nuevamente mas tarde." });
                        return
                      }

                      console.log("Que data le enviamos a upDateBDOwner 142?????????", upDateBDOwner)
                    }else{
                      res.status(400).json({ success: false, message: "Agrega el numero de ticket y su imagen" });
                    }
            
                    // Guardar la imagen en el sistema de archivos
                    if (os.platform().startsWith('win')) {
                      // En sistemas Windows, usa mv para mover el archivo
                      req.files.imgTicket.mv(receiptImagePath, err => { 
                        if (err) {
                          console.error('Error al mover el archivo:', err);
                          res.status(400).json({ success: false, message: err.message });
                        } else {
                          console.log('Archivo movido exitosamente a', receiptImagePath);
                        }
                      });
                    } else {
                      // En otros sistemas, usa fs.renameSync para mover el archivo
                      fs.renameSync(tempFilePath, receiptImagePath);
                      console.log('Archivo movido exitosamente a', receiptImagePath);
                    }
                    
                    res.status(200).json({ success: true, message: 'Datos recibidos y correo enviado.' });

/*************Estas actividadesd de regisro se hacen de forma asincronica independiente*******************************/


        const formatearFecha = fecha => {
          const d = new Date(fecha);
          return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        };
        
        // Ejemplo de uso
        const fechaFormateada = formatearFecha(fechaVencMem);


                    let message = ""
                    if (tipoMembresia === "basic") {
                      message = `
                      <br>
                      ${nombre} Felicitaciones!!! <br>
                      Tu membresía Basic fue actualizada a Premium y su cantidad de productos han sido correctamente actualizados.
                      <br>
                      No se te cobraran comisiones.
                      <br>
                      Te llamaremos para configurar tu nuevo dominio, ssl, pasarela de pago y demás datos.
                      <br>
                      Este proceso puede demorar 72 horas hábiles. 
                      <br>
                      Cantidad de productos contratados: ${cantPRODO}.
                      <br>
                      Fecha de vencimiento de tu membresía y productos:${fechaFormateada}
                      <br>
                      Pago: ${precioFinal}.
                      <br>
                      Este es el ticket Nro: ${ticketNumber} que comprueba el pago por el método: ${paymentMethod}.
                      <br>
                      Fecha de vencimiento de tu membresia ${fechaFormateada}:
                      <br>
                      Datos Extra que nos enviaste: ${extraData}
                      <br>
                      Estos datos puedes verlos en tu panel de control dentro de: 
                      <br>
                      <a href="${urlServer}">${urlServer}</a>
                      `
                    } else {
                      message = `
                        <br>
                        ${nombre} tu membresía Premium y su cantidad de productos han sido correctamente actualizados.
                        <br>
                        Fecha de vencimiento de tu membresía y productos:${fechaFormateada}
                        <br>
                        Pago: ${precioFinal}.
                        <br>
                        Este es el ticket Nro: ${ticketNumber} que comprueba el pago por el método: ${paymentMethod}.
                        <br>
                        Cantidad de productos contratados: ${cantPRODO}.
                        <br>
                        Datos Extra que nos enviaste: ${extraData}
                        <br>
                        Estos datos puedes verlos en tu panel de control dentro de: 
                        <br>
                        <a href="${urlServer}">${urlServer}</a>
                      `
                    }
                    console.log(message)
                    // Guardar los datos en la base de datos
                    const nuevoMensaje = new Mensajes({
                      idOwner:upDateBDOwner.ownerID,
                      email,
                      names: nombre,
                      apellido,
                      pais: paymentMethod,
                      message,
                      date: new Date()
                    });
                    await nuevoMensaje.save();

                    // Preparar y enviar el correo electrónico
                    const tranportEmail = ConfigG.transportEmail
                    const dataEnviarEmail = {
                        transportEmail:tranportEmail,
                        enviarExcel: false,
                        emailOwner: 'sebastianpaysse@gmail.com',
                        emailCliente: email,
                        numCelCliente: 'No especificado', // Deberías agregar la variable correcta si está disponible
                        numCelOwner: 'No especificado', // Deberías agregar la variable correcta si está disponible
                        mensaje: message,
                        codigoPedido: ticketNumber,
                        nombreOwner: nombre,
                        nombreCliente: nombre,
                        subjectCliente: `Hola ${nombre}, El cambio en tu membresía se actualizo correctamente`,
                        subjectOwner:  `Hola Sebas el cliente ${nombre}, Agrego productos a su membresía`,
                        otraData: null,
                        logoOwner: null,
                        cancelaEnvio: false,
                        pedidoCobrado: false,
                        quedaUno: false,
                        product: false,
                        inscripcion: true,
                        reclamo: false,
                        Promo: false,
                        attachments: [{ path: receiptImagePath }]
                    };
                    await sendMail(dataEnviarEmail);
            
                    
          } else {
            console.error('Error:', error);
            res.status(400).json({ success: false, message: error.message });
          }
        
        } catch (error) {
            console.error('Error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
  });




  //142 UPDATED USUARIO YA EXISTENTE WALLET DESDE CPANEL PARa Membresia Premium y FORMA MANUAL UPGRADE desde Cpanel
  const endpointTokensArrayString172 = endpointTokensArray[172]
  const endpointTokensArray172 = endpointTokensArrayString172.split(',');
  const endpoint172 = (typeof endpointTokensArray172 === 'string') ? endpointTokensArray172 : endpointTokensArray172.toString().replace("http://localhost:3020/", "");
  router.post(`/${endpoint172}`, [verificarToken], async (req, res) => {        
      try { 
        // primero verificamos la veracidad del cobro:
        console.log("1728888888888888888888Request Body:",req.body);
        const { dataOwner5, paymentId, dataGrlPayload } = req.body;
        // desestructurar info
        let {nombre, apellido, email, urlServer, ownerID, cantContratosMemRealizados, tipoMembresia, fechaVencMem } = dataOwner5

        const dataOwner = await User.findById(ownerID)
        const cantProdQTiene = dataOwner.misProductos.length

        fechaVencMem = fechaVencMem ? new Date(fechaVencMem.replace(/"/g, '')) : new Date();
        const {precioPEsos, quantity, duration} = dataGrlPayload
        
/* ********************************************************************************************************/
        // Función asíncrona para consultar el estado de un pago en MercadoPago
/* ********************************************************************************************************/
    let okCobroMP = false
    const paymentData = await consultarEstadoPago(paymentId);
    console.log('Datos del pago:', paymentData);
    console.log('Estado del pago:', paymentData.status); // Ejemplo: 'approved', 'rejected', 'pending'
    if (paymentData.status === 'approved') {
      okCobroMP = true, console.log('Pago Aprobado');
    }
    else{
      console.log('Pago rechazado intente con otro método de pago');
      okCobroMP = false
      return res.status(400).json({ success: true, false: 'Pago rechazado intente con otro método de pago' });
    }
 //       okCobroMP = true
/* ********************************************************************************************************/

        if (okCobroMP) {
          const paymentMethod = paymentData.order.type
          // Actualiza la BD del usuario que realizo el upgrade a membresia premium
          let tipoDPago= "Electrónico MP"
          //const datosExtrasdeMP = paymentData.external_reference
          const dataPAyO = {tipoDPago, precioPEsos, quantity, duration}
          const ticketNumber = paymentData.id
          const ticketPath = null
          const precioFinal = precioPEsos.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
          const dataSendUpGrade = {ownerID, paymentMethod, ticketNumber, ticketPath, dataPAyO, cantProdQTiene, cantContratosMemRealizados, fechaVencMem, tipoMembresia, precioFinal }
          const upDateBDOwner = await UpDateUpGrade(dataSendUpGrade );
          console.log("Que data le enviamos al fronen desde la fncion  UpDateUpGrade?????????", upDateBDOwner)

          if (upDateBDOwner.successUpdated) {
            res.status(200).json({ success: true, message:upDateBDOwner.message});
          } else {
            res.status(400).json({ success: false, message:"Ocurrió un error al actualizar la BD. intente mas tarde" });
            return
          }

/*************Estas actividadesd de regisro se hacen de forma asincronica independiente*******************************/
          const attachments = [{ path: ticketPath }]
      

          const formatearFecha = fecha => {
            const d = new Date(fecha);
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
          };
        
        // Ejemplo de uso
        const fechaFormateada = formatearFecha(upDateBDOwner.fechaVencMem);

        let message = ""
          if (tipoMembresia === "basic") {
            message = `
            <br>
            ${nombre} Felicitaciones!!! <br>
            Tu membresía Basic fue actualizada a Premium y su cantidad de productos han sido correctamente actualizados.
            <br>
            No se te cobraran comisiones.
            <br>
            Te llamaremos para configurar tu nuevo dominio, ssl, pasarela de pago y demás datos.
            <br>
            Este proceso puede demorar 72 horas hábiles. 
            <br>
            Cantidad de productos contratados: ${quantity}.
            <br>
            Fecha de vencimiento de tu membresía y productos:${fechaFormateada}
            <br>
            Pago: ${precioFinal}.
            <br>
            Estos datos puedes verlos en tu panel de control dentro de: 
            <br>
            <a href="${urlServer}">${urlServer}</a>
            `
          } else {
            message = `
              <br>
              ${nombre} tu membresía Premium y su cantidad de productos han sido correctamente actualizados.
              <br>
              Cantidad de productos contratados: ${quantity}.
              <br>
              Fecha de vencimiento de tu membresía y productos:${fechaFormateada}
              <br>
              Pago: ${precioFinal}.
              <br>
              Estos datos puedes verlos en tu panel de control dentro de: 
              <br>
              <a href="${urlServer}">${urlServer}</a>
            `
          }
          console.log(message)
          // Guarda un mensaje en mensajes internos
          const nuevoMensaje = new Mensajes({
            idOwner:upDateBDOwner.ownerID,
            email,
            names: nombre,
            apellido,
            pais: paymentMethod,
            message,
            date: new Date()
          });
          await nuevoMensaje.save();

          // Preparar y enviar el correo electrónico
          const tranportEmail = ConfigG.transportEmail
          const dataEnviarEmail = {
              transportEmail:tranportEmail,
              enviarExcel: false,
              emailOwner: 'sebastianpaysse@gmail.com',
              emailCliente: email,
              numCelCliente: 'No especificado', // Deberías agregar la variable correcta si está disponible
              numCelOwner: 'No especificado', // Deberías agregar la variable correcta si está disponible
              mensaje: message,
              codigoPedido: ticketNumber,
              nombreOwner: nombre,
              nombreCliente: nombre,
              subjectCliente: `Hola ${nombre}, El cambio en tu membresía se actualizo correctamente`,
              subjectOwner:  `Hola Sebas el cliente ${nombre}, Agrego productos a su membresía`,
              otraData: null,
              logoOwner: null,
              cancelaEnvio: false,
              pedidoCobrado: false,
              quedaUno: false,
              product: false,
              inscripcion: true,
              reclamo: false,
              Promo: false,
              attachments,
          };
          sendMail(dataEnviarEmail);
        }
        else{
          console.error('Error:', error);
          res.status(400).json({ success: false, message: "El pago NO pudo ser cobrado intente con un nuevo medio de pago" });
        }
      } catch (error) {
          console.error('Error:', error);
          res.status(400).json({ success: false, message: error.message });
      }
  });







 //***********para mostrar los botones con mercado pago DESDE LA LANDING PAGE wallet y tarjetas aprobadas

  // muestra los botones MP y TC desde Wallet de la landing page
  const endpointTokensArrayString129 = endpointTokensArray[129]
  const endpointTokensArray129 = endpointTokensArrayString129.split(',');
  const endpoint129 = (typeof endpointTokensArray129 === 'string') ? endpointTokensArray129 : endpointTokensArray129.toString().replace("http://localhost:3020/", "");
  //console.log("que idPoint encontro ",endpoint129)
  router.post(`/${endpoint129}`, [verificarToken], async (req, res) => {
    // Agrega credenciales
    //console.log("  mp endpointTokensArray[129]  Qué datos obtiene MP MPwallets desde el fronen", req.body );
    try {
      const {dataPay, dataOwner, pedidoPendCobrar, urlServer} = req.body
      const {precioFinal, cantPRODO, tiempoContratoO} = dataPay
      const {nombre, apellido, emailXYZ123, passwordXYZ123, confirmPasswordXYZ123, payer} = dataOwner

      // 1ero debe revisar si el email ya esta registrado y existe.
      const dataPIdx = passwordXYZ123
      const dataEIdx = emailXYZ123
      const cheqEmail = await User.findOne({email:emailXYZ123})
  
      if (cheqEmail) {
        console.log("Entro y encontro un email ya refgistrado CheqEmail", cheqEmail );
        res.status(400).json({success:false, message:"Este email ya se encuentra registrado", error: 'Este email ya se encuentra registrado' });
        return
      }
      const pedidosItems = []
      pedidoPendCobrar.forEach(e => {
        let title       = `Membresía Premium Usa Tienda Fácil por ${e.cantPRODO} productos.`
        let description = `Incluye SSL, Dominio propio y hasta 5 imágenes por producto y por un tiempo de: ${e.tiempoContratoO}`
        let quantity    = 1
        let unit_price  = e.precioFinal
        let subTotal    = e.precioFinal
        pedidosItems.push({title, description, quantity, unit_price})
      });

      const ArTokenPrivateMP = ConfigG.ArTokenPrivateMP 

      let client = new MercadoPagoConfig({accessToken: ArTokenPrivateMP});

      const preference = new Preference(client);

      dataPassCompra = pedidosItems[0]

      const dataPayload = {dataEIdx, dataPIdx, tiempoContratoO, cantPRODO, urlServer, nombre}

      await preference.create({
        body : {
          items: pedidosItems,
          purpose: 'wallet_purchase',
          back_urls: {
            success: `${dataOwner.urlCompleta}resultado/del/cobro/enMPLandingSignUp`,
            failure: `${dataOwner.urlCompleta}resultado/del/cobro/enMPLandingSignUp`,
            pending: `${dataOwner.urlCompleta}resultado/del/cobro/enMPLandingSignUp`,
          },
          payer: dataOwner.payer,
          purpose: "wallet_purchase",
          auto_return: "approved",
          binary_mode: true,
          statement_descriptor: "usatienfacil",
          external_reference : dataPayload,
          init_point:global.init_point
        },
      })
      .then(data => {
        //console.log("MMMMMMMMMMMMMMQue data aprobo del pago con WALLET en mercado pago????????????????????????", data);
        preference.idMPUser = data.id
        const dataMP = {}
        dataMP.initPoint = data.init_point
        dataMP.idMPUser = data.id
        //console.log("Qué datos obtiene MPreference",data, preference);
        res.status(200).json({success:true, dataMP, preference});
      })

    } catch (error) {
      // Enviar una respuesta de error si ocurre algún problema
      console.error('Error al crear la preferencia de pago:', error);
      res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }
  });


  // TC TC TC para activar boton pago con TC en MP tienda Online y acrditar el PAGO
  const endpointTokensArrayString131 = endpointTokensArray[131]
  const endpointTokensArray131 = endpointTokensArrayString131.split(',');
  const endpoint131 = (typeof endpointTokensArray131 === 'string') ? endpointTokensArray131 : endpointTokensArray131.toString().replace("http://localhost:3020/", "");
  //console.log("que idPoint encontro ",endpoint5)
  router.post(`/${endpoint131}`, [verificarToken], async (req, res) => {
      try {
      const {jwToken, dataPay, payer, urlServer } = req.body;
      const { precioFinal, cantPRODO, tiempoContratoO } = dataPay
      
      //const urlServer = ConfigG.urlServer || urlServer
      const ArTokenPrivateMP = ConfigG.ArTokenPrivateMP
      //console.log("777777777777999999999999999999999999999999999999999988888888888888888", ConfigG )
      //console.log("8888888888888888888888888888888888888", req.body )

      const pedidosItems = []
      const title       = `Membresía Premium Usa Tienda Fácil.`
      const description = `Incluye SSL, Dominio propio y hasta 5 imágenes por producto y por una cantidad de ${cantPRODO} y un tiempo de: ${tiempoContratoO}`
      const quantity    = 1
      const unit_price  = precioFinal
      const subTotal    = precioFinal
      pedidosItems.push({title, description, quantity, unit_price, subTotal })
      
      //console.log("ConfigGConfigGArTokenPrivateMPArTokenPrivateMPArTokenPrivateMP??????", urlServer )

      const client = new MercadoPagoConfig({ accessToken: ArTokenPrivateMP });
      //console.log("222222222222222Que cliente armo MP PAGO CON TC????????", client )
      
      const preference = new Preference(client);
      //console.log("3333333333333Que datos PREFEERENCIA armo MP PAGO CON TC????????", preference )

      //console.log("4444444444444Que pedidosItems armo PAGO CON TC????????", pedidosItems )

      await preference.create({
          body : {
          items: pedidosItems,
          payer: payer,
          back_urls: {
              success: `${urlServer}resultado/del/cobro/enMPLandingSignUp`,
              failure: `${urlServer}resultado/del/cobro/enMPLandingSignUp`,
              pending: `${urlServer}resultado/del/cobro/enMPLandingSignUp`,
          },
          auto_return: 'approved', // Retornar automáticamente cuando el pago es aprobado
          external_reference : {Token:jwToken, payer},
          binary_mode: true, // Habilita o deshabilita el modo binario (true/false)
          statement_descriptor: 'UsaTiendaOnline'
          }
      })
      .then(data => {
          if (data && data.id) {
            res.status(200).json({succes:true,  idMPUser: data.id });
          } else {
            console.log("5555555555Que mierda NOOOOOOOOOOOOOO obteiene aqui PAGO CON TC????????", data )
            throw new Error('No se pudo crear la preferencia.');
          }
      })
      } catch (error) {
        console.error('Error al crear la preferencia de pago PAGO CON TC:', error);
        res.status(500).json({succes:false, data: 'Error al crear la preferencia de pago' });
      }
  });

  // para pagar/cobrar con tarjetas de credito debito tienda Online
  const endpointTokensArrayString132 = endpointTokensArray[132]
  const endpointTokensArray132 = endpointTokensArrayString132.split(',');
  const endpoint132 = (typeof endpointTokensArray132 === 'string') ? endpointTokensArray132 : endpointTokensArray132.toString().replace("http://localhost:3020/", "");
  //console.log("que idPoint encontro ",endpoint5)
  router.post(`/${endpoint132}`, [verificarToken], async (req, res) => {
    console.log("Qué datos obtiene MP para pagar/cobrar con tarjetas de credito debito", req.body);
    
    const { formData, jwToken } = req.body;
  
    try {
      const ArTokenPrivateMP = ConfigG.ArTokenPrivateMP;
  
      // Crear una instancia de MercadoPagoConfig con el token de acceso
      let client = new MercadoPagoConfig({ accessToken: ArTokenPrivateMP });
  
      // Crear el pago
      const payment = new Payment(client);
      const data = await payment.create({ body: formData });
  
      //console.log("MMMMMMMMMMMMMMMMMQué datos responde MP por el pago con TC?????????????", data);
  
      data.idMPUser = data.id;
  
      // Enviar la respuesta exitosa
      res.status(200).json(data);
    } catch (error) {
      console.error('Error al crear la preferencia de pago:', error);
  
      // Enviar una respuesta de error al cliente
      res.status(500).json({ error: 'Error al crear la preferencia de pago', message: error.message });
    }
  });
  


  // devolucciones desde MP del cobro o regreso en MP wallets desde la LANDING PAGE donde debe registrarse SINGUP y enviar mail
  // para pagar/cobrar con tarjetas de credito debito tienda Online
  const endpointTokensArrayString169 = endpointTokensArray[169]
  const endpointTokensArray169 = endpointTokensArrayString169.split(',');
  const endpoint169 = (typeof endpointTokensArray169 === 'string') ? endpointTokensArray169 : endpointTokensArray169.toString().replace("http://localhost:3020/", "");
  //console.log("que idPoint encontro ",endpoint5)
  router.post(`/${endpoint169}`, [verificarToken], async (req, res) => {
    try {
      console.log("que devuelve desde MP URL????????????????????????????????", req.body)
      // Desestructurar la información de req.query
      const { statusCobro, externalData, paymentId, paymentType, siteId } = req.body;
      const dataExtra = JSON.parse(externalData)
      const {dataEIdx, dataPIdx, tiempoContratoO, cantPRODO, urlServer, nombre} = dataExtra
      // const { title, description, quantity, unit_price } = dataPassCompra
      const datosExtrasdeMP = {paymentType, siteId}
      const ticketNumber = String(paymentId)
      const paymentMethod = paymentType
      const emailXYZ123 = dataEIdx
      const passwordXYZ123 = dataPIdx

      // Verificar si el cobro fue aprobado
      if (statusCobro === "approved") {


/* ********************************************************************************************************/
        // Función asíncrona para consultar el estado de un pago en MercadoPago
/* ********************************************************************************************************/
let okCobroMP = false
const paymentData = await consultarEstadoPago(paymentId);
//console.log('Datos del pago:', paymentData);
console.log('Estado del pago:', paymentData.status); // Ejemplo: 'approved', 'rejected', 'pending'
console.log('Datos del pago6541654156441564135641567456456:', paymentData);
const precioFinal = paymentData.transaction_amount
// Formatear el monto en pesos mexicanos
const precioFinalFormateado = precioFinal.toLocaleString('es-MX', {
  style: 'currency',
  currency: 'MXN'
});
if (paymentData.status === 'approved') {
  okCobroMP = true
  console.log('Pago Aprobado');
}
else{
  console.log('Pago rechazado intente con otro método de pago');
  okCobroMP = false
  return res.status(400).json({ success: true, false: 'Pago rechazado intente con otro método de pago' });
}
//       okCobroMP = true
/* ********************************************************************************************************/

    if (okCobroMP) {
        // se inscribe el usuario 
        const ticketPath = null
        const dataOwner = await SingUp(emailXYZ123, passwordXYZ123, ticketNumber, datosExtrasdeMP, ticketPath, cantPRODO, tiempoContratoO);

        console.log("Se agrego el nuevo owner", dataOwner)

        res.status(200).json({dataOwner, succes:true, message:"Bienvenido a Usa Tienda Fácil"});

   /*******************Sigue con cosas******************************************************************** */
                // Calcula la fecha de vencimiento sumando los meses al valor actual
                const fechaCompraCantProd = new Date();
                const fechaVencimientoCantProd = new Date(fechaCompraCantProd);
                
                // Suma los meses a la fecha actual
                fechaVencimientoCantProd.setMonth(fechaVencimientoCantProd.getMonth() + tiempoContratoO);




// Obtener el día, mes y año
const dia = String(fechaVencimientoCantProd.getDate()).padStart(2, '0');
const mes = String(fechaVencimientoCantProd.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
const anio = fechaVencimientoCantProd.getFullYear();

// Formatear la fecha
const fechaFormateada = `${dia}/${mes}/${anio}`;

        message = `
<div align="center" style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px; border-radius: 10px;">
 <div align="left">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">Gracias por inscribirte enusatiendafacil.com donde vendes más rápido.</p>
        <br>
        ${nombre} tu membresía Premium y su cantidad de productos han sido correctamente aprovada.
        <br>
        Cantidad de productos contratados: ${cantPRODO}.
        <br>
        Fecha de vencimiento de tu membresía y productos:${fechaFormateada}
        <br>
        Pago: ${precioFinalFormateado} pesos.
        <br>
        Metodo de pago: ${paymentMethod}
        <br>
        </div>
        <br>
Estos datos puedes verlos en tu panel de control.
	<p style="font-size: 16px; color: #333; line-height: 1.6;">Haz clic en el botón de abajo y activaremos tu compra.</p>
	<p style="font-size: 16px; color: #333; line-height: 1.6;">Volverás a la pagina de TiendaFacily deberás logearte <br> Gracias!</p>
	<a href="http://localhost:3020/confirmaInscripcion?id=${dataOwner.id}" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin-top: 20px; transition: background-color 0.3s ease;">Activar cuenta</a>
</div>
      `

        // se agrega un mensaje de bienvenida
        // Guardar los datos en la base de datos
        const nuevoMensaje = new Mensajes({
          email: emailXYZ123,
          names: nombre,
          apellido : null,
          pais: "Pago Wallet MP",
          message,
          date: new Date()
        });
        await nuevoMensaje.save();


        // se envia el email de bienvenida y activasio
          // Preparar y enviar el correo electrónico
          const tranportEmail = ConfigG.transportEmail
          const dataEnviarEmail = {
              transportEmail:tranportEmail,
              reclamo: false,
              enviarExcel: false,
              emailOwner: 'sebastianpaysse@gmail.com',
              emailCliente: emailXYZ123,
              numCelCliente: 'No especificado', // Deberías agregar la variable correcta si está disponible
              numCelOwner: 'No especificado', // Deberías agregar la variable correcta si está disponible
              mensaje: message,
              codigoPedido: ticketNumber,
              nombreOwner: "Sebas",
              nombreCliente: nombre,
              subjectCliente: `Hola ${nombre}, Bienvenido ausatiendafacil.com`,
              subjectOwner: `Nuevo Pago membresia premium landingPage recibido de ${emailXYZ123}`,
              otraData: null,
              logoOwner: null,
              cancelaEnvio: false,
              pedidoCobrado: false,
              quedaUno: false,
              product: false,
              inscripcion: true,
              Promo: false,
          };
          await sendMail(dataEnviarEmail);
    } 
    else {
      // Si el cobro no fue aprobado, devolver un error
      console.log("El cobro NO fue aprobado")
      const redirectURL = `${dominio}/?statusCobro=failed&ref1=null&ref2=null&Token=${Token}`;
      return res.status(400).json({ succes:false, message: "Error al procesar el cobro en MP" });
    }

    }else{
      console.error("Error al procesar el cobro en MP intente con otro medio de pago:", error);
      return res.status(500).json({ error: "Error al procesar el cobro en MP intente con otro medio de pago" });
    }

    } catch (error) {
      console.error("Error al procesar el cobro en MP:", error);
      return res.status(500).json({ error: "Error al procesar el cobro en MP" });
    }
  });





/*********************Aqui estan los Up Grade de MEmebresias**********************/

const endpointTokensArrayString179 = endpointTokensArray[179]
const endpointTokensArray179 = endpointTokensArrayString179.split(',');
const endpoint179 = (typeof endpointTokensArray169 === 'string') ? endpointTokensArray179 : endpointTokensArray179.toString().replace("http://localhost:3020/", "");
//console.log("que idPoint encontro ",endpoint5)
router.post(`/${endpoint179}`, [verificarToken], async (req, res) => {

  console.log("Que llega del fronen?????????????", req.body)
    const {DataPayO, datosOwnerResume, pedidoPendCobrar, payer } = req.body
    const  {nombre, apellido, email, urlServer} = datosOwnerResume
    const  {precioPEsos, quantity, duration} = DataPayO

    const priceXProducto = precioPEsos / quantity
    try{
      const pedidosItems = []
      const title       = `Membresía Premium usatiendafácil.com por ${quantity} productos.`
      const description = `Incluye SSL, Dominio propio, hasta 5 imágenes por producto y por un tiempo de: ${duration}`
      const unit_price  = priceXProducto
      pedidosItems.push({title, description, quantity, unit_price})


    const ArTokenPrivateMP = ConfigG.ArTokenPrivateMP 

    let client = new MercadoPagoConfig({accessToken: ArTokenPrivateMP});

    const preference = new Preference(client);

    const dataEId = email

    const dataPayload = {dataEId}

    await preference.create({
      body : {
        items: pedidosItems,
        purpose: 'wallet_purchase',
        back_urls: {
          success: `${urlServer}resultado/del/cobro/enMPUpSuccessGradeSignUp`,
          failure: `${urlServer}resultado/del/cobro/enMPUGradeFalilureSignUp`,
          pending: `${urlServer}resultado/del/cobro/enMPUpGradePeddingSignUp`,
        },
        payer,
        purpose: "wallet_purchase",
        auto_return: "approved",
        binary_mode: true,
        statement_descriptor: "usatienfacil",
        external_reference : dataPayload,
        init_point:global.init_point
      },
    })
    .then(data => {
      preference.idMPUser = data.id
      const dataMP = {}
      dataMP.initPoint = data.init_point
      dataMP.idMPUser = data.id
      //console.log("Qué datos obtiene UPGRADE MPreference",data, preference);
      res.status(200).json({success:true, dataMP, preference});
    })

    } catch (error) {
    // Enviar una respuesta de error si ocurre algún problema
    console.error('Error al crear la preferencia de pago:', error);
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }


});





/*AQUI SOLO ESTAN LOS CUESTIONARIOS DE CUSTOM Y CONSULTAS DE LA LANDING PAGE*/

  //101 Guarda el formulario CUSTOM y CONTACTOS
  const endpointTokensArrayString101 = endpointTokensArray[101]
  const endpointTokensArray101 = endpointTokensArrayString101.split(',');
  const endpoint101 = (typeof endpointTokensArray101 === 'string') ? endpointTokensArray101 : endpointTokensArray101.toString().replace("http://localhost:3020/", "");
  //console.log("Le endpointTokensArray101 a guardar CUSTOM ",endpoint101)
  router.post(`/${endpoint101}`, [verificarToken], async (req, res) => {
  //router.post('/datos/custom/cliente', [verificarToken], async (req, res) => {
      console.log("Le entrooooooooooooo a guardar CUSTOM ",req.body)
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
            const dataEnviarEmail = {transportEmail, reclamo:true, enviarExcel:false, emailOwner:"sebastianpaysse@gmail.com", emailCliente:email, numCelCliente:celular, numCelOwner:celular, mensaje:`<br> ${descripcionProyecto}, <br> nos comunicaremos a la brevedad posible. <br> Gracias`, codigoPedido:"16165", nombreOwner:"Sebas", nombreCliente:nombre, subjectCliente:`Hola ${nombre}, nos llegó tu consulta`, subjectOwner, otraData:null, logoOwner:null, cancelaEnvio:false, pedidoCobrado:false, quedaUno:false, product:false, inscripcion:false, Promo:false} 

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










module.exports = router;


