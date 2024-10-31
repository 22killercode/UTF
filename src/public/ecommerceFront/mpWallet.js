    async function mpWallet(dataCli, dataOwn) {
      try { 
        let dataCliente = JSON.parse(sessionStorage.getItem('clienteEcomm')) || dataCli
        let dataOwner = JSON.parse(sessionStorage.getItem('dataOwner')) || dataOwn
          console.log("Dentro de la funcion mpWallet id=btnPagar007", dataOwner._id, dataCliente._id)
          const pedidoPendCobrar = JSON.parse(sessionStorage.getItem('pedidoCarritoPendientePago'))
          const jwToken = sessionStorage.getItem('jwtToken') 

          const payer = {
            firstName: dataCliente.nombre,
            lastName: dataCliente.apellido,
            email: dataCliente.emailOficial, 
          }

          // Si no está el cliente, debe logearse
          if (!dataCliente || Object.keys(dataCliente).length === 0) {
            await ocultarModalLoading()
            console.log("El cliente NO está en mpWallet!!!", dataCliente);
            await mostrarAlerta("Logeate para continuar desde mpwallet");
            
            setTimeout(() => {
              // Ocultar el modal de staticBackdrop si está presente
              $('#staticBackdropMediosPago').modal('hide');
              // Mostrar el modal de usuario
              $('#usuario').modal('show');
            }, 1500);
            
            return; // Terminar la ejecución si no hay cliente
          }


          await updatePrice(pedidoPendCobrar);

          dataCliente.payer = payer 
          dataCliente.idOwner = dataOwner._id
          const urlServer = dataOwner.urlServer
          let amount = 0
          const costEnvio = JSON.parse(sessionStorage.getItem("costoDelivery")) || [];
          if (costEnvio.length >= 1) {
            amount = costEnvio[1]
          }

          const data = {dataCliente, pedidoPendCobrar,  amount}

          const idEnpointCheq = JSON.parse(sessionStorage.getItem("idEndpoints"))

          console.log("Que mpWalletmpWalletmpWalletmpWallet", idEnpointCheq[125])
          fetch(`${idEnpointCheq[125]}`, {
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
              console.log("Error al crear la preferencia de pago desde mpWallet", data)
              mostrarAlerta(data.error)
              return
            }
            console.log("************Que datos obtiene desde MP Wallet", data)
            createCheckoutButton8789(data.dataMP, payer, dataCliente, dataOwner, amount);
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

    async function createCheckoutButton8789(preferenceID, payer, dataCliente, dataOwner, amount) {
      //const mercadopago = new MercadoPago('TEST-fd6e2ffa-d72d-4ef8-8d61-f1e341e9afb9');

      const modal = new bootstrap.Modal(document.getElementById('staticBackdropMediosPago'));
      modal.show();

      const basicData = JSON.parse(sessionStorage.getItem("basicData")) || JSON.parse(sessionStorage.getItem("datosBasicos"));

      const tokenMPWallet = 
          dataOwner?.ArTokenPublicMP || 
          basicData?.ArTokenPublicMP || 
          basicData?.[0]?.ArTokenPublicMP || 
          basicData?.data?.ConfigsOne?.[0]?.ArTokenPublicMP;

      console.log("0000createCheckoutButton0000000ico para la WAllet encuentra???",tokenMPWallet,  preferenceID)
      const mercadopago = new MercadoPago(tokenMPWallet);
      //console.log("00000mercadopago000000ico para la WAllet encuentra???", mercadopago, preferenceID)
      if (tokenMPWallet == undefined) {
        console.log("tokenMPWallettokenMPWallet erroneo")
        mostrarAlerta(mercadopago)
      }
      //console.log("11111111111111Que mercadopago para la wallet armo???", mercadopago)
      const bricksBuilder = await mercadopago.bricks();
      console.log("2222222222222222222Que bricksBuilder MP al pago Wallet?", preferenceID, );
      if (preferenceID === undefined ) {
        // Abrir el modal
        $('#usuario').modal('show');
        $('#staticBackdropMediosPago').modal('hide');
        mostrarAlerta("MPWALLET Por favor logeate nuevamente para continuar la operación");
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
                  mostrarAlerta("Hubo un problema al obtener los detalles de la preferencia. Por favor, inténtalo de nuevo.");
                  // Aquí puedes intentar volver a solicitar los detalles o redirigir al usuario a una página de error
                  return
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
      const sumaTotalCompra = totalCompra.reduce((a, b) => a + b, 0) + costoDeliveryPush;
      console.log("Que sumo el sumaTotalCompra", sumaTotalCompra)
      document.getElementById("summary-total").innerHTML = "Total a pagar: " + sumaTotalCompra.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

      return sumaTotalCompra

    }

    document.getElementById("cerrarModalPagos").addEventListener("click", function () {
      location.reload();
    });
