    async function mpWallet(dataCliente, dataOwner) {
      try {
          //console.log("Oprimió el botón de pago mpWallet id=btnPagar007", dataOwner._id, dataCliente._id)
          const pedidoCarrito      = sessionStorage.getItem('pedidoCarritoPendientePago');
          const pedidoPendCobrar   = JSON.parse(pedidoCarrito)
          const jwToken = sessionStorage.getItem('jwtToken') 
          const payer = {
            firstName: dataCliente.nombre,
            lastName: dataCliente.apellido,
            email: dataCliente.emailOficial, 
          }

          // Si no está el cliente, debe logearse
          if (dataCliente === null || dataCliente == undefined || dataCliente.length <= 0) { 
            console.log("El cliente NO esta!!!", dataCliente)
            // Ocultar el modal de staticBackdrop si está presente
            $('#staticBackdropMediosPago').modal('hide');
            // Mostrar el modal de usuario
            $('#usuario').modal('show');
            return
          }

          updatePrice(pedidoPendCobrar);

          dataCliente.payer = payer 
          dataCliente.idOwner = dataOwner._id
          const urlServer = dataOwner.urlServer
          let amount = 0
          const costEnvio = JSON.parse(sessionStorage.getItem("costoDelivery")) || [];
          if (costEnvio.length >= 1) {
            costEnvio[1]
          }

          const data = {dataCliente, pedidoPendCobrar, jwToken, amount}

          const idEnpointCheq = JSON.parse(sessionStorage.getItem("idEndpoints"))
          const idEnpointCheq125 = idEnpointCheq[125].split(',');
          fetch(`${idEnpointCheq125}`, {
            //fetch(`${urlServer}MPwallets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwToken}`
            },
            body: JSON.stringify(data)
          })

          .then(response => response.json())

          .then(data => {
            ocultarModalLoading()
            if (data.error) {
              console.log("Error al crear la preferencia de pago", data)
              mostrarAlerta(data.error)
              return
            }
            console.log("************Que datos obtiene desde MP Wallet", data)
            createCheckoutButton(data.dataMP, payer, dataCliente, dataOwner, amount);
          })
          .catch(error => {
            console.error('Error al obtener la preferencia del backend:', error);
          });

        }
      catch (error) {
            console.error("que eeror detecto en el trycathc de mpWallet", error)
            //borrarsessionStorage()
        }
    };

    async function createCheckoutButton(preferenceID, payer, dataCliente, dataOwner, amount) {
      //const mercadopago = new MercadoPago('TEST-fd6e2ffa-d72d-4ef8-8d61-f1e341e9afb9');

      const basicData = JSON.parse(sessionStorage.getItem("basicData")) || JSON.parse(sessionStorage.getItem("datosBasicos"));

      const tokenMPWallet = 
          dataOwner?.ArTokenPublicMP || 
          basicData?.ArTokenPublicMP || 
          basicData?.[0]?.ArTokenPublicMP || 
          basicData?.data?.ConfigsOne?.[0]?.ArTokenPublicMP;

      console.log("00000000000ico para la WAllet encuentra???",tokenMPWallet,  preferenceID)
      const mercadopago = new MercadoPago(tokenMPWallet);
      //console.log("00000mercadopago000000ico para la WAllet encuentra???", mercadopago, preferenceID)
      if (tokenMPWallet == undefined) {
        console.log("00000mercadopago000000000000000000000000")
        mostrarAlerta(mercadopago)
      }
      //console.log("11111111111111Que mercadopago para la wallet armo???", mercadopago)
      const bricksBuilder = await mercadopago.bricks();
      console.log("2222222222222222222Que bricksBuilder MP al pago Wallet?", preferenceID, );
      if (preferenceID === undefined ) {
        // Abrir el modal
        $('#usuario').modal('show');
        $('#staticBackdropMediosPago').modal('hide');
        mostrarAlerta("Por favor logeate nuevamente para continuar la operación");
        console.log("Error inesperado durante el proceso de creación del wallet:");
        //return
      } else {
        const idPref = preferenceID.idMPUser 
        try {
          await bricksBuilder.create('wallet', 'wallet_container', {
            initialization: {
              preferenceId: idPref, // Asegúrate de que este ID es válido
              redirectMode: 'self',
              modal: true, // Abre el pago en un modal en tu propia página
              payer: payer, // Asegúrate de que payer tiene los datos correctos
            },
            customization: {
              visual: {
                style: {
                  theme: "default",
                },
              },
              texts: {
                valueProp: 'smart_option',
              },
            },
            callbacks: {
              onError: (error) => {
                // Manejo del error
                console.error("Error durante el pago con Wallet:", error);
                if (error.cause === 'get_preference_details_failed') {
                  return
                  alert("Hubo un problema al obtener los detalles de la preferencia. Por favor, inténtalo de nuevo.");
                  // Aquí puedes intentar volver a solicitar los detalles o redirigir al usuario a una página de error
                }
              },
              onReady: async (data) => {
                console.log("Botón de pago generado correctamente");
                // anulado TC
                const opPagosDiv = document.getElementById('opcionesDePago');
                if (opPagosDiv) {
                  opPagosDiv.innerHTML = ` 
                    <div hidden>
                      <button id="checkout-btn" class="btn-block btn-primary" style="border-radius: 0.51rem;"> 
                        <img src="images/tarjetas.jpg" alt="logo MP" width="45px" height="45px" style="border-radius: 0.51rem; margin:0 0.5rem">
                        Paga con Tarjetas de Crédito/Débito o Efectivo.
                      </button>
                      <br>
                    </div>
                  `;
                }
                const checkoutBtn = document.getElementById("checkout-btn");
                if (checkoutBtn) {
                  checkoutBtn.addEventListener("click", async function () {
                    console.log('Operación pagada con Tarjeta de Crédito/Débito o Efectivo');
                    await pagarTCEF(dataCliente, dataOwner);
                  });
                }
                // elije pagar contra entrega sin MP
                const botonPCE = document.getElementById('PCE');
                if (botonPCE) {
                  botonPCE.addEventListener("click", async () => {
                    const PCE = "Pago Contra Factura";
                    const procesoDCobro = true;
                    console.log('Operación pagada CONTRA ENTREGA', PCE, procesoDCobro);
                    await averiguandoDireccionEntrega(PCE);
                    // Ocultar el modal de staticBackdrop si está presente
                    $('#staticBackdropMediosPago').modal('hide');
                    // Mostrar el modal de usuario
                    $('#usuario').modal('hide');
                  });
                }
              },// elije pagar con MP
              onSubmit: async () => {
                const messageDiv = document.getElementById('staticBackdropMediosPago');
                if (messageDiv) {
                  messageDiv.innerHTML = "";
                }
                mostrarPagoWallet("");
                // Redirigir a la nueva dirección después de 2 segundos
                setTimeout(() => {
                  window.location.href = preferenceID.initPoint;
                }, 2000); // 2000 milisegundos = 2 segundos
              },
            },
          });
        } catch (error) {
          mostrarAlerta("Ocurrió un error inesperado. Por favor, inténtalo nuevamente más tarde.");
          console.error("Error inesperado durante el proceso de creación del wallet:", error);
        }
      }
    }



    // solo cuanod paga con tarjeta de credito
    function updatePrice(pedidoRender) {

      const costoDeliveryPush = 0

      const costoDeliv = JSON.parse(sessionStorage.getItem("costoDelivery"))

      if (costoDeliv.length >= 1) {
        costoDeliveryPush = costoDeliv[1]
      }

      // Limpia el contenido actual del elemento quantity
      const quantityElement     = document.getElementById("quantity");
      quantityElement.innerHTML = "";
      let totalCompra = []; // Inicializa el total de la compra como 0
      // Recorre cada elemento del pedido y renderiza los detalles en el elemento quantity
      pedidoRender.forEach(e => {
        const title       = e.nombreProducto;
        const description = e.descripcion;
        const quantity    = e.cantidad;
        const unitPrice   = e.precio;
        const imagen      = e.imagen;
        const subTotal    = (quantity * unitPrice)

        totalCompra.push(subTotal); // Agrega el subtotal al total de la compra
        // Crea un nuevo elemento para cada producto y agrega los detalles
        const productDetails = document.createElement("div");
        productDetails.innerHTML = `
          <div class="" style="margin: 0; padding: 0;">
            <img src="${imagen}" style="width: 35px; height: auto;" />
            <p style="text-align: left;">Producto: ${title}</p>
            <p style="text-align: left;">Cantidad: ${quantity}</p>
            <p style="text-align: left;">Precio unitario: ${unitPrice.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
            <p style="text-align: left;">Sub total: ${subTotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
            
          </div>
        `;
        // Agrega el nuevo elemento al elemento quantity
        quantityElement.appendChild(productDetails);
      });
      // Actualiza el total de la compra en el elemento summary-total
      // Sumar todos los elementos del array totalCompra
      const sumaTotalCompra = totalCompra.reduce((a, b) => a + b, 0) + costoDeliveryPush;
      document.getElementById("summary-total").innerHTML = "Total a pagar: " + sumaTotalCompra.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

    }

    document.getElementById("cerrarModalPagos").addEventListener("click", function () {
      location.reload();
    });
