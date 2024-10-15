    // async function pagarTCLP(dataOwner, payer, dataPay, dataBasic){

    //     //console.log("pagarTCLP 1111111111111111111 Entro a pagar con TC el landing páge membresia", dataBasic)

    //     const borrarOpcionMP = document.getElementById("wallet_container")
    //     borrarOpcionMP.remove();
    //     $('#checkout-btn').attr("hidden", true);

    //     mostrarModalLoading()

    //     //console.log("Que datos de payer encontro en TC ???", payer)

    //     const pedidosItems = []

    //     const urlServer = dataBasic.data.ConfigsOne[0].urlServer
    //     //console.log("Que pedido pendiente encuentra para cobrar por MP? urlServer????", urlServer)

    //     const idEnpointCheq = dataBasic.data.endpointTokensArray2
    //     const jwToken = dataBasic.data.jwToken

    //     const dataLoad = {dataPay, jwToken, payer, urlServer }
    //     const idEnpointCheq131 = idEnpointCheq[131]

    //     fetch(`${idEnpointCheq131}`, {
    //         method: 'POST',
    //         headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${jwToken}`
    //         },
    //         body: JSON.stringify(dataLoad)
    //     })
    //     .then(response => response.json())
    //     .then(async data => {
    //     ocultarModalLoading();
    //     //console.log(`que datos obtiene desde MP ${urlServer}create_preference3`, data);
    //     const preferenceId = data.idMPUser;
    //     if (data.succes) {
    //         renderPaymentBrick(preferenceId, {amount1:dataPay}, pedidosItems, payer, urlServer, dataBasic);
    //         return;
    //     } else {
    //         console.error('Error: No se recibió un ID de preferencia válido.', data);
    //         mostrarAlerta(data.data)
    //         // Aquí puedes manejar el error, mostrar un mensaje al usuario, etc.
    //     }
    //     })
    //     .catch(error => {
    //         console.error('XXXXXXXXXXXXXXXXXError al obtener la preferencia del backend:', error);
    //     });

    // }

    // const renderPaymentBrick = async (preferenceId, amount1, pedidosItems, payer, urlServer, dataBasic) => {
    //     try {
    //         const elementToDelete = document.getElementById("borrarElijeTC");
    //         if (elementToDelete) {
    //             elementToDelete.remove();
    //             //console.log("Elemento con ID 'borrarElijeTC' eliminado.");
    //         } else {
    //             console.log("Elemento con ID 'borrarElijeTC' no encontrado.");
    //         }

    //         // Verificar que preferenceId es una cadena de texto
    //         const PreferID = String(preferenceId);
    //         const precio = amount1.amount1.precioFinal
    //         //console.log("BBBBBBBBBBBBBBBB********************************Preference ID convertido a cadena:", amount1);
    //         // Definir la configuración del brick de pago
    //         const settings = {
    //             initialization: {
    //                 items: pedidosItems,
    //                 amount: precio,
    //                 preferenceId: PreferID,
    //                 payer: payer,
    //                 back_urls: {
    //                     success: `${urlServer}resultado/del/cobro/enMPLandingSignUp`,
    //                     failure: `${urlServer}resultado/del/cobro/enMPLandingSignUp`,
    //                     pending: `${urlServer}resultado/del/cobro/enMPLandingSignUp`,
    //                 },
    //             },
    //             customization: {
    //                 visual: {
    //                     style: { 
    //                         theme: "default",
    //                     },
    //                     defaultPaymentOption: {
    //                         walletForm: true,
    //                     },
    //                 },
    //                 paymentMethods: {
    //                     mercadoPago: "all",
    //                     creditCard: "all",
    //                     debitCard: "all",
    //                     ticket: "all",
    //                     maxInstallments: 1,
    //                 },
    //             },
    //             callbacks: {
    //                 onReady: () => {
    //                     console.log("Brick está listo.");
    //                 },
    //                 onSubmit: async ({ selectedPaymentMethod, preferenceId, formData }) => {
    //                     //console.log("Formulario enviado con:", preferenceId, formData);
    //                     try { 
    //                         const idEnpointCheq = dataBasic.data.endpointTokensArray2
    //                         const jwToken = dataBasic.data.jwToken
    //                         const idEnpointCheq132 = idEnpointCheq[132]
    //                         //console.log("ID Endpoints:", idEnpointCheq132);
    //                         const response = await fetch(idEnpointCheq132, {
    //                             method: "POST",
    //                             headers: {
    //                                 'Content-Type': 'application/json',
    //                                 'Authorization': `Bearer ${jwToken}`,
    //                             },
    //                             body: JSON.stringify({ formData, jwToken }),
    //                         });

    //                         //console.log("Respuesta del servidor:", response);
    //                         const result = await response.json();
    //                         //console.log("Resultado del proceso de pago:", result);

    //                         if (result.status === 'approved' && result.status_detail === 'accredited') {
    //                         mostrarExito(`¡Pago exitoso! <br>
    //                             Su transacción con tarjeta ha sido aprobada y acreditada.
    //                             <br>
    //                             Bienvenid@ a Usa Tienda Fácil
    //                             <br>
    //                             Le estará llegando un e-mail con las acciones siguientes.
    //                             (si no encuentra el email busque en spam y páselo a correo deseado.)`);
    //                             setTimeout(function() {
    //                                 window.location.reload();
    //                             }, 2000); // 2000 milisegundos = 2 segundos
    //                         } else {
    //                             mostrarAlerta('¡Pago no aprobado! Por favor, intente con otra opción de pago.');
    //                             setTimeout(function() {
    //                                 window.location.reload();
    //                             }, 2000000); // 2000 milisegundos = 2 segundos
    //                         }
    //                     } catch (error) {
    //                         console.error("Error al procesar el pago:", error);
    //                         mostrarAlerta('C ¡Pago no aprobado! Por favor, intente con otra opción de pago.');
    //                         setTimeout(function() {
    //                             window.location.reload();
    //                         }, 2000000); // 2000 milisegundos = 2 segundos
    //                     }
    //                 },
    //                 onError: (error) => {
    //                     console.error("Error en el funcionamiento del BRICK:", error);
    //                     mostrarAlerta('Brick ¡Pago no aprobado! Por favor, intente con otra opción de pago.');
    //                     setTimeout(function() {
    //                         window.location.reload();
    //                     }, 2000); // 2000 milisegundos = 2 segundos
    //                 },
    //             },
    //         };

    //         // Verificar y convertir el token de MercadoPago
    //         const tokenMPCard = dataBasic.data.ConfigsOne[0].ArTokenPublicMP;
    //         //console.log("Token de MercadoPago:", tokenMPCard);

    //         if (typeof tokenMPCard !== 'string') {
    //             throw new Error("Token de MercadoPago debe ser una cadena de texto.");
    //         }

    //         const TokenM = String(tokenMPCard); // Asegúrate de que el token sea una cadena
    //         //console.log("Token de MercadoPago convertido a cadena:", TokenM);

    //         // Inicializar MercadoPago
    //         const mercadopago = new MercadoPago(TokenM);
    //         //console.log("Instancia de MercadoPago creada.");

    //         // Verificar la autenticidad del token
    //         await mercadopago.getIdentificationTypes();
    //         //console.log("Token de MercadoPago aceptado correctamente.");

    //         // Crear el brick de pago
    //         const bricksBuilder = await mercadopago.bricks();
    //         //console.log("Constructor de bricks obtenido:", bricksBuilder);

    //         window.paymentBrickController = await bricksBuilder.create(
    //             "payment",
    //             "paymentBrick_container",
    //             settings
    //         );
    //         //console.log("Brick de pago creado con éxito.");
    //     } catch (error) {
    //         console.error("Error al renderizar el brick de pago:", error);
    //     }
    // };







