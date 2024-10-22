    async function pagarTCEF(dataCliente, dataOwner){
      console.log("Entro en la funcion pagar con TC usando de MP")

        const borrarOpcionCE = document.getElementById("PCE")
        borrarOpcionCE.remove();
        const borrarOpcionMP = document.getElementById("wallet_container")
        borrarOpcionMP.remove();
        $('#checkout-btn').attr("hidden", true);

        mostrarModalLoading()

        const payer = { 
          firstName: dataCliente.nombre,
          lastName: dataCliente.apellido,
          email: dataCliente.emailOficial,
        }
      
        //console.log("Que datos de payer encontro en TC ???", payer)
        const costEnvio = JSON.parse(sessionStorage.getItem("costoDelivery"));
        const pedidoCarrito    = sessionStorage.getItem('pedidoCarritoPendientePago');
        const pedidoPendCobrar = JSON.parse(pedidoCarrito)
        const jwToken = sessionStorage.getItem('jwToken');
        const pedidosItems = []
        let amount = 0
        pedidoPendCobrar.forEach(b => {
          let title       = b.nombreProducto;
          let description = b.descripcion;
          let quantity    = b.cantidad;
          let unit_price  = b.precio;
          let subTotal    = b.subTotal
          amount += subTotal
          pedidosItems.push({title, description, quantity, unit_price, })
        });
        
        amount + costEnvio[1]
        console.log("Que amount1amount1amount1?????", amount)

        // renderiza los costos
        updatePrice(pedidoPendCobrar);

        const ArTokenPrivateMP = dataOwner.ArTokenPrivateMP
        const urlServer = dataOwner.urlServer
        const idOwner = dataOwner._id
        const dataLoad = {amount, pedidoCarrito, jwToken, ArTokenPrivateMP, payer, urlServer,idCliente, idOwner}
        const idEnpointCheq = JSON.parse(sessionStorage.getItem("idEndpoints"))
        const idEnpointCheq127 = idEnpointCheq[127].split(',');
        fetch(`${idEnpointCheq127}`, {
        //fetch(`${urlServer}create_preference3`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwToken}`
          },
          body: JSON.stringify(dataLoad)
        })
          .then(response => response.json())
          .then(async data => {
            ocultarModalLoading();
            //console.log(`que datos obtiene desde MP ${urlServer}create_preference3`, data);
            
            if (data) {
              const preferenceId = data.idMPUser;
              renderPaymentBrick(preferenceId, amount, pedidosItems, payer, urlServer);
              return;
            } else {
              console.error('Error: No se recibió un ID de preferencia válido.', data);
              mostrarAlerta(data)
              // Aquí puedes manejar el error, mostrar un mensaje al usuario, etc.
            }
          })
          .catch(error => {
            console.error('XXXXXXXXXXXXXXXXXError al obtener la preferencia del backend:', error);
          });
        

    }

    const renderPaymentBrick = async ( preferenceId, amount, pedidosItems, payer, urlServer) => {
      // const mercadopago = new MercadoPago('APP_USR-df9a0135-fdaf-44a2-93f9-3fc0bb59f7c7', {
      //   locale: 'es-AR'
      // });

      //console.log("entro a la funcion para renderPaymentBrick   renderPaymentBrick ", preferenceId, amount1, pedidosItems, payer, urlServer)
      const PreferID = preferenceId

      //console.log("Que prefer id armo???", PreferID)

      // para apgar con tatrjetas de credito debito o pago facil
      const Tamount = Number(amount)
      const settings = {
        initialization: {
            items: pedidosItems,
            amount: Tamount,
            preferenceId: PreferID,
            payer: payer,
            back_urls: {
              success: `${dataOwner.urlServer}resultado/del/cobro/enMP`,
              failure: `${dataOwner.urlServer}resultado/del/cobro/enMP`,
              pending: `${dataOwner.urlServer}resultado/del/cobro/enMP`,
            },
          },
          customization: {
            visual: {
              style: { 
                theme: "default",
              },
              defaultPaymentOption: {
                walletForm: true,
              },
            },
            paymentMethods: {
              mercadoPago: "all",
              //wallet_purchase: "all",
              creditCard: "all",
              debitCard: "all",
              ticket: "all",
              //bankTransfer: "all",
              //atm: "all",
              //onboarding_credits: "all",
              maxInstallments: 1
            },
          },
          callbacks: {
            onReady: () => {
              //console.log("Esta todo ready en TC")
              /*
                Callback llamado cuando el Brick está listo.
                Aquí puede ocultar cargamentos de su sitio, por ejemplo.
              */
            },
            onSubmit: ({ selectedPaymentMethod, preferenceId, formData }) => {
              // callback llamado al hacer clic en el botón de envío de datos
              console.log("Se oprimio el boton selectedPaymentMethod que viene en",preferenceId, formData)
              const dataLoad = {formData, jwToken, ArTokenPrivateMP}
              return new Promise((resolve, reject) => {
                const idEnpointCheq = JSON.parse(sessionStorage.getItem("idEndpoints"))
                const idEnpointCheq128 = idEnpointCheq[128].split(',');
                fetch(`${idEnpointCheq128}`, {
                //fetch(`${urlServer}process_payment`, {
                  method: "POST",
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwToken}`
                  },
                  body: JSON.stringify(dataLoad),
                })
                  .then((response) => response.json())
                  .then((response) => {
                    // recibir el resultado del pago
                    preferenceId = response.idMPUser  
                    //console.log("****Que datos recibo del proceso de pago de MP con tarjeta de credito??******", response)
                    if (response.status === 'approved' && response.status_detail === 'accredited') {
                      // Si el pago fue aprobado y acreditado, muestra un mensaje de éxito y redirige a la dirección deseada
                      mostrarExito('¡Pago exitoso! Su transacción con tarjeta ha sido aprobada y acreditada. <br><br> Por favor, revise su correo electrónico, donde encontrará los pasos a seguir. <br><br> Si no lo encuentra en su bandeja de entrada, verifique en la carpeta de spam y marque el mensaje como "No es spam o correo deseado".');
                      const tipoCobro = "Tarjeta Credito/Debito"
                      //averiguandoDireccionEntrega(tipoCobro)
                      setTimeout(function() {
                          window.location.reload();
                      }, 2000); 
                    } 
                    else {
                        // Si el pago no fue aprobado o no fue acreditado, muestra un mensaje de alerta y sugiere usar otra opción de pago
                        mostrarAlerta('¡Pago no aprobado! Por favor, intente con otra opción de pago.');
                    }
                    setTimeout(function() {
                      window.location.reload();
                  }, 2000); 
                  })
                  .catch((error) => {
                    // manejar la respuesta de error al intentar crear el pago
                    console.error("Que error del pago recibo",error)
                    setTimeout(function() {
                        window.location.reload();
                    }, 2000); 
                  });
              });
            },
            onError: (error) => {
              // callback llamado para todos los casos de error de Brick
              console.error("Error del funcionamiento del BRICK",error);
            },
          },
      };
      const tokenMPCard = dataOwner.ArTokenPublicMP
      const mercadopago = new MercadoPago(tokenMPCard);
      // Prueba para verificar si el token fue aceptado
      try {
        await mercadopago.getIdentificationTypes(); // Llamada a un método para verificar la autenticidad del token
        //console.log("Token de MercadoPago aceptado correctamente.");
      } catch (tokenError) {
        throw new Error("Token de MercadoPago no válido o rechazado.");
      }
      const bricksBuilder = await mercadopago.bricks();
      //console.log("Paso los settings", settings);
    // Crear el brick de pago
    window.paymentBrickController = await bricksBuilder.create( "payment", "paymentBrick_container", settings );
    //console.log("Brick de pago creado con éxito.");
    }

    // sirve para renderizar los costos
    function updatePrice(pedidoRender) {
      // Limpia el contenido actual del elemento quantity
      const quantityElement = document.getElementById("quantityCompra");
      quantityElement.innerHTML = "";
      quantityElement.classList.add("row", "g-4"); // Usar row y g-4 para espacios entre columnas
      let totalCompra = []; // Inicializa el total de la compra
      let totalCantProd = [];

      // Recorre cada elemento del pedido y renderiza los detalles en el elemento quantity
      pedidoRender.forEach(e => {
        const title       = e.nombreProducto;
        const description = e.descripcion;
        const quantity    = e.cantidad;
        const unitPrice   = e.precio;
        const imagen      = e.imagen;
        const subTotal    = quantity * unitPrice;

        totalCompra.push(subTotal); // Agrega el subtotal al total de la compra
        totalCantProd.push(quantity);

        // Crea un nuevo elemento para cada producto y agrega los detalles
        const productDetails = document.createElement("div");
        productDetails.classList.add("col-sm-6", "col-md-4", "d-flex", "justify-content-center"); // Tarjetas responsivas
        productDetails.innerHTML = `
<div class="card" style="width: 200px !important; margin: 0.5rem; padding: 1rem; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); background-color: #fff; transition: transform 0.3s ease, box-shadow 0.3s ease;">
    <!-- Contenedor para centrar el título -->
    <div style="text-align: center; margin-bottom: 0.5rem;">
        <p style="font-weight: bold; margin: 0;">Producto: ${title}</p>
    </div>
    
    <!-- Contenedor para centrar la imagen -->
    <div style="display: flex; justify-content: center; margin-bottom: 0.5rem;">
        <img src="${imagen}" style="width: 180px !important; height: auto; border-radius: 5px;" />
    </div>

    <!-- Texto alineado a la izquierda -->
    <p style="text-align: left; margin-bottom: 0.5rem;">Cantidad: ${quantity}</p>
    <p style="text-align: left; margin-bottom: 0.5rem;">Precio unitario: ${unitPrice.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
    <p style="text-align: left;">Sub total: ${subTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
</div>

<style>
.card:hover,
.card:active {
    transform: scale(1.02); /* Aumenta un 2% */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Sombra más intensa a la derecha y abajo */
}
</style>


        `;
        // Agrega el nuevo elemento al elemento quantity
        quantityElement.appendChild(productDetails);
      });

      // Actualiza el total de la compra en el elemento summary-total
      // Sumar todos los elementos del array totalCompra
      const totalisimo = totalCompra.reduce((a, b) => a + b, 0)
      const sumaTotalCompra = totalisimo.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 2
      });
      const sumaTotalProduct = totalCantProd.reduce((a, b) => a + b, 0);
      document.getElementById("totalCantidad").innerHTML = "Cantidad total de productos " + sumaTotalProduct + " con sub total de: " + sumaTotalCompra;
      // Obtener el elemento con el ID "CostoEnvio123"
      const costoEnvioElement = document.getElementById("CostoEnvio123");
      // Asignar el costo de envío al contenido del párrafo
      const costEnvio = JSON.parse(sessionStorage.getItem("costoDelivery")) || [];
      if (costEnvio.length >= 1) {
        costoEnvioElement.textContent = `${costEnvio[0]}`;
        document.getElementById("summary-total").innerHTML = "Total a abonar: $" + (totalisimo + costEnvio[1]);
      }
    }

    const cerraRModaloso = document.getElementById("cerrarModalPagos");
    if (cerraRModaloso) {
      cerraRModaloso.addEventListener("click", function () {
        location.reload();
      });
    }
    


