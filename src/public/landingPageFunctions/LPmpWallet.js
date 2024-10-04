let idPay = {}
let dataGrlPayload = {}
let vovlerALaUrl = ""

  function reloadPage() {
    // Cerrar todos los modales abiertos (ajusta el selector según tu implementación)
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const instance = bootstrap.Modal.getInstance(modal); // Si estás usando Bootstrap
        if (instance) {
            instance.hide();
            window.location.reload();
        }
    });
  }

  // busca los datos basicos y los guarda en sessionStorage
  async function fetchDatosBasicos() {
    try {
        const response = await fetch('/buscar/datos/basicosFronen');
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }

        const data = await response.json(); // Asumiendo que los datos están en formato JSON

        // Guardar los datos en sessionStorage
        sessionStorage.setItem('datosBasicos', JSON.stringify(data));
        //console.log('*****Datos guardados en sessionStorage:', data);

        // Puedes usar endpointTokensArray aquí o retornarlo si es necesario
        return data;
        
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        // Refrescar la pestaña después de 2 segundos
        setTimeout(function() {
          window.location.reload();
        }, 2000); // 2000 milisegundos = 2 segundos
      }
  }
  const dataBase = fetchDatosBasicos();

  async function LPmpWallet(dataPay, dataOwner) {
    const dataBasic = JSON.parse(sessionStorage.getItem('datosBasicos'));
    const urlServer = dataBasic.urlServer
      // Si no está el cliente, debe logearse
      if (dataOwner === null) { 
        // Mostrar el modal de usuario
        $('#usuario').modal('show');
        // Ocultar el modal de staticBackdrop si está presente
        $('#staticBackdropMediosPago').modal('hide');
        return
      }
      try {
        const {nombre, apellido, emailXYZ123, passwordXYZ123, confirmPasswordXYZ123} = dataOwner
        const {precioFinal, cantPRODO, tiempoContratoO} = dataPay

          const pedidoPendCobrar = []
          pedidoPendCobrar.push({precioFinal, cantPRODO, tiempoContratoO})

          const payer = {
            firstName: nombre,
            lastName: apellido,
            email: emailXYZ123,
          }

          dataOwner.payer = payer 

          const dataConfig = dataBasic.data.ConfigsOne[0]
          // Obtener solo el dominio principal (sin protocolo ni barra final)
          const urlCompleta = dataConfig.urlServer 

          dataOwner.urlCompleta = urlCompleta

          dataGrlPayload = {dataPay, dataOwner, pedidoPendCobrar, urlServer}

          const data = { dataOwner, pedidoPendCobrar, passwordXYZ123, confirmPasswordXYZ123}

          const idEnpointCheq = dataBasic.data.endpointTokensArray2
          const jwToken = dataBasic.data.jwToken
          const idEnpointCheq129 = idEnpointCheq[129]

          console.log("EEEEEEEEEEEEEEEEEEentro al pago con MP Wallet dataBasic",data);

          fetch(`${idEnpointCheq129}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwToken}`
            }, 
            body: JSON.stringify(dataGrlPayload)
          })

          .then(response => response.json())

          .then(data => {
            console.log("***************Que datos obtiene desde MP Wallet", data)
            if (data.success) {
              createCheckoutButton(data.dataMP, payer, dataOwner, dataPay, dataBasic);
            } else {
              ocultarModalLoading()
              mostrarAlerta(data.message)
              // Refrescar la pestaña después de 2 segundos
              setTimeout(function() {
                window.location.reload();
              }, 2000); // 2000 milisegundos = 2 segundos
            }
          })
          .catch(error => {
            ocultarModalLoading()
            console.error('Error al obtener la preferencia del backend:', error);
            // Refrescar la pestaña después de 2 segundos
            setTimeout(function() {
              window.location.reload();
            }, 2000); // 2000 milisegundos = 2 segundos
          });
        }
      catch (error) {
          ocultarModalLoading()
          console.error("que eeror detecto en el trycathc de mpWallet", error)
          // Refrescar la pestaña después de 2 segundos
          setTimeout(function() {
            window.location.reload();
          }, 2000); // 2000 milisegundos = 2 segundos
        }
  };
  async function createCheckoutButton(preferenceID, payer, dataOwner, dataPay, dataBasic) {
    try {
      dataGrlPayload = {dataPay, dataOwner}

      const ArTokenPublicMP = dataBasic.data.ConfigsOne[0].ArTokenPublicMP

      console.log("*createCheckoutButton eckoutButton Wallet",ArTokenPublicMP, dataBasic)

      const mercadopago = new MercadoPago(ArTokenPublicMP);

      const bricksBuilder = await mercadopago.bricks();

      let idPref = preferenceID.idMPUser
      if (!idPref || typeof idPref !== 'string') {
          throw new Error('El ID de preferencia no es válido.');
      }

      const idPreference = String(idPref)
      //console.log("Que id MP encontro?", idPreference)

      await bricksBuilder.create('wallet', 'wallet_container', {
        initialization: {
          preferenceId: idPreference, // Asegúrate de que este ID es válido
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
            // Refrescar la pestaña después de 2 segundos
            setTimeout(function() {
              window.location.reload();
            }, 2000); // 2000 milisegundos = 2 segundos
          },
          onReady: async (data) => {
            //console.log("Botón de pago generado correctamente");
            const opPagosDiv = document.getElementById('opcionesDePagoLandindPage');
            const FormopPagosDiv = document.getElementById('form54354gegghte5');
            const borrarBTNMP56 = document.getElementById('borrarBTNMP');
            const borrarComData = document.getElementById('sacarCompletaData');
            if (opPagosDiv) {
              borrarComData.innerHTML = `
              `
              borrarBTNMP56.innerHTML = `
              `
              FormopPagosDiv.innerHTML = `
              `
              opPagosDiv.innerHTML = `
                <div id="borrarElijeTC">
                  <button id="checkout-btn89754541" class="btn-block btn-primary" style="border-radius: 0.51rem;" hidden> 
                    <img src="images/tarjetas.jpg" alt="logo MP" width="45px" height="45px" style="border-radius: 0.51rem; margin:0 0.5rem">
                    Paga con Tarjetas de Crédito/Débito o Efectivo.
                  </button>
                  <br>
                  <button class="btn btn-primary btn-block" id="PagoManual">
                    <i class="fas fa-wallet" style="font-size: 35px; margin-right: 0.5rem;"></i>
                    Volver a Pago Manual, Deposito, Transfer con Wallet.
                  </button>
                </div>
              `;
            }
            ocultarModalLoading()
            // paga con TC
            const checkoutBtn = document.getElementById("checkout-btn89754541");
            if (checkoutBtn) {
              checkoutBtn.addEventListener("click", async function () {
                //('Operación pagada con Tarjeta de Crédito/Débito o Efectivo');
                await pagarTCLP(dataOwner, payer, dataPay, dataBasic);
              });
            }
            // paga de forma manual
            const BtnPagoManual = document.getElementById("PagoManual");
            if (BtnPagoManual) {
                BtnPagoManual.addEventListener("click", async function () {
                console.log('Operación pagada manualmente');
                // Recargar la página después de realizar la operación
                window.location.reload();
              });
            }
          },
          onSubmit: async () => {
            const messageDiv = document.getElementById('staticBackdropMediosPago');
            if (messageDiv) {
              messageDiv.innerHTML = "Aguarda unos segundos, tu pago está siendo procesado.";
            }
            // modal que muestra un gift de TC
            mostrarPagoWallet("");
          },
        },
      });
    } catch (error) { 
      console.error("Error inesperado durante el proceso de creación del wallet:", error);
      mostrarAlerta("Ocurrió un error inesperado. Por favor, inténtalo nuevamente más tarde.");
      // Refrescar la pestaña después de 2 segundos
      setTimeout(function() {
        window.location.reload();
      }, 2000); // 2000 milisegundos = 2 segundos
    }
  }; 






  async function CpanelmpWallet(renewMemId123) {

    const dataBasic      = JSON.parse(sessionStorage.getItem('datosBasicos'));
    const dataOwner      = JSON.parse(sessionStorage.getItem('ownerData'));
    const DataPayO     = JSON.parse(sessionStorage.getItem('dataPayOSes'));

      try {
        const {nombre, apellido, email, urlServer } = dataOwner
        const { precioPEsos, quantity, duration }   = DataPayO

          const pedidoPendCobrar = []
          pedidoPendCobrar.push({precioPEsos, cantPRODO:quantity, tiempoContratoO:duration})

          const datosOwnerResume = {nombre, apellido, email, urlServer}

          // enviar los datos a MP
          const idEnpointCheq = dataBasic.data.endpointTokensArray2
          const jwToken = dataBasic.data.jwToken
          const idEnpointCheq179 = idEnpointCheq[179]

          const payer = {
            firstName: nombre,
            lastName: apellido,
            email
          }

          const dataPayloads = {DataPayO, datosOwnerResume, payer, pedidoPendCobrar, dataBasic, renewMemId123 }
          console.log("CpanelmpWallet Eentro al pago con MP Wallet dataBasic",dataPayloads);

          fetch(`${idEnpointCheq179}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwToken}`
            }, 
            body: JSON.stringify(dataPayloads)
          })

          .then(response => response.json())

          .then(data => {
            //console.log("*****Vuelve de MP ******Que datos obtiene desde MP Wallet", data)
            if (data.success) {
              CpanelCheckoutButtonUpGrade(data.dataMP, payer, dataOwner, pedidoPendCobrar, dataBasic);
            } else {
              ocultarModalLoading()
              mostrarAlerta(data.message)
              // Refrescar la pestaña después de 2 segundos
              setTimeout(function() {
                window.location.reload();
              }, 2000); // 2000 milisegundos = 2 segundos
            }
          })
          .catch(error => {
            ocultarModalLoading()
            console.error('Error al obtener la preferencia del backend:', error);
            // Refrescar la pestaña después de 2 segundos
            setTimeout(function() {
              window.location.reload();
            }, 2000); // 2000 milisegundos = 2 segundos
          });
        }
      catch (error) {
          ocultarModalLoading()
          console.error("que error detecto en el trycathc de mpWallet", error)
          // Refrescar la pestaña después de 2 segundos
          setTimeout(function() {
            window.location.reload();
          }, 2000); // 2000 milisegundos = 2 segundos
        }
  };
  async function CpanelCheckoutButtonUpGrade(preferenceID, payer, dataOwner, pedidoPendCobrar, dataBasic) {

    try {


      const ArTokenPublicMP = dataBasic.data.ConfigsOne[0].ArTokenPublicMP

      console.log("*createCheckoutButton eckoutButton Wallet",ArTokenPublicMP, dataBasic)

      const mercadopago = new MercadoPago(ArTokenPublicMP);

      const bricksBuilder = await mercadopago.bricks();

      let idPref = preferenceID.idMPUser
      if (!idPref || typeof idPref !== 'string') {
          throw new Error('El ID de preferencia no es válido.');
      }

      const idPreference = String(idPref)
      //console.log("Que id MP encontro?", idPreference)

      await bricksBuilder.create('wallet', 'wallet_container', {
        initialization: {
          preferenceId: idPreference, // Asegúrate de que este ID es válido
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
            // Refrescar la pestaña después de 2 segundos
            setTimeout(function() {
              window.location.reload();
            }, 2000); // 2000 milisegundos = 2 segundos
          },
          onReady: async (data) => {

            // Obtener la URL actual
            var vovlerALaUrl = window.location.href;
            // Guardar la URL en sessionStorage
            sessionStorage.setItem('vovlerALaUrl', vovlerALaUrl);

            console.log("Botón de pago generado correctamente vovlerALaUrl", vovlerALaUrl);
            const opPagosDiv = document.getElementById('opcionesDePagoUpGrade');

            if (opPagosDiv) {
              opPagosDiv.innerHTML = `
                <div id="borrarElijeTC">
                  <button id="checkout-btn89754541" class="btn-block btn-primary" style="border-radius: 0.51rem;"hidden> 
                    <img src="../images/tarjetas.jpg" alt="logo MP" width="45px" height="45px" style="border-radius: 0.51rem; margin:0 0.5rem">
                    Paga con Tarjetas de Crédito/Débito o Efectivo.
                  </button>
                  <br>
                  <button class="btn btn-primary btn-block" id="PagoManual" onclick="location.reload()">
                    <i class="fas fa-wallet" style="font-size: 35px; margin-right: 0.5rem;"></i>
                    Volver y Pagar Manual, Deposito, Transfer con Wallet.
                  </button>
                </div>
              `;
            }
            ocultarModalLoading()
            // paga con TC
            const checkoutBtn = document.getElementById("checkout-btn89754541");
            if (checkoutBtn) {
              checkoutBtn.addEventListener("click", async function () {
                //('Operación pagada con Tarjeta de Crédito/Débito o Efectivo');
                await pagarTCLP(dataOwner, payer, dataPay, dataBasic);
              });
            }
            // paga de forma manual
            const BtnPagoManual = document.getElementById("PagoManual");
            if (BtnPagoManual) {
                BtnPagoManual.addEventListener("click", async function () {
                console.log('Operación pagada manualmente');
                // Recargar la página después de realizar la operación
                window.location.reload();
              });
            }
          },
          onSubmit: async () => {
            // Obtener la URL actual
            const messageDiv = document.getElementById('staticBackdropMediosPago');
            if (messageDiv) {
              messageDiv.innerHTML = "";
            }
            // modal que muestra un gift de TC
            mostrarPagoWallet("");
          },
        },
      });
    } catch (error) {
      console.error("Error inesperado durante el proceso de creación del wallet:", error);
      mostrarAlerta("Ocurrió un error inesperado. Por favor, inténtalo nuevamente más tarde.");
      // Refrescar la pestaña después de 2 segundos
      setTimeout(function() {
        window.location.reload();
      }, 2000); // 2000 milisegundos = 2 segundos
    }
  };






  //*********************** */ Aqui viene la devuluviones de MP Wallets y sus analissis


  const aquitaBobo = document.getElementById("cerrarModalPagos")
  if (aquitaBobo) {
    aquitaBobo.addEventListener("click", function () {
      location.reload();
    });
  }

  const cerraRModaloso = document.getElementById("cerrarModalPagos");
  if (cerraRModaloso) {
    cerraRModaloso.addEventListener("click", function () {
      location.reload();
    });
  }






  // verifica si hay un pedido pagado por Wallet de MP
    // Obtener la URL actual del navegador
    const currentURL = window.location.href;
    //console.log("Estado del currentURL:", currentURL);
    // Parsear la URL para obtener los parámetros de consulta
    const urlParams = new URLSearchParams(new URL(currentURL).search);
    // Verificar si los parámetros contienen el fragmento
    // Obtener la URL actual
    const currentURL87 = window.location.href;
    const cheqSucces = currentURL87.includes("enMPUpSuccessGradeSignUp");
    //console.log("Estado del urlParams:", urlParams);

    if (urlParams) {
      // Obtener los valores de los parámetros de consulta
      const statusCobro = urlParams.get('collection_status');
      const paymentId = urlParams.get('payment_id');
      const paymentType = urlParams.get('payment_type');
      const externalData = urlParams.get('external_reference');
      const siteId = urlParams.get('site_id');
      
      //console.log("Encontro un pedido cobrado por la successUpGrade de MP:",currentURL87, statusCobro, cheqSucces);  

      // filtra de donde vino el pago ya sea de Cpanel para ugrade update y ÑLanding PAge para cliente nuevo
      if (statusCobro) {
        const dataBasic = JSON.parse(sessionStorage.getItem('datosBasicos'));
        const idEnpointCheq = dataBasic.data.endpointTokensArray2
        const jwToken = dataBasic.data.jwToken
        const urlServer = dataBasic.data.ConfigsOne[0].urlServer

        const dataPedidoCorbado = JSON.parse(sessionStorage.getItem("dataGrlSave"));
        console.log("Encotnro la dataGrl", dataPedidoCorbado)
        const dataCobro = {externalData, statusCobro, paymentId, paymentType, siteId, dataPedidoCorbado}

        if (statusCobro === "approved") {
          console.log("Encontro un pedido cobrado por la walltet de MP:", statusCobro);
          // Cerrar el modal
          var modal = document.getElementById('opciones');
          modal.style.display = 'none';
          modal.innerHTML = ""
          // aqui va ser procesada la actualizacion upGrade memebresia premium desde el Cpanel
          if (cheqSucces) {

            var ownerDataX = JSON.parse(sessionStorage.getItem('ownerData'))

            const {nombre, apellido, email, urlServer, cantContratosMemRealizados, tipoMembresia, fechaVencMem } =  ownerDataX
            const ownerID = ownerDataX._id
            const cantProdQTiene = ownerDataX.TotalProdCOntratados
            const dataOwner5 = {nombre, apellido, email, urlServer, ownerID, cantProdQTiene, cantContratosMemRealizados,tipoMembresia, fechaVencMem }

            const dataGrlPayload = JSON.parse(sessionStorage.getItem('dataPayOSes'));

            const dataConsolidada = {dataOwner5, paymentId, dataGrlPayload,externalData}

            console.log("Encontro un aURL con un pago por wallet desde MP y por Upgrade*****************",dataConsolidada )

              const idEnpointCheq172 = idEnpointCheq[172]
              fetch(`${idEnpointCheq172}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwToken}`
                }, 
                body: JSON.stringify(dataConsolidada)
              })
              .then(response => response.json())
              .then(data => {
                const vovlerALaUrl2 = sessionStorage.getItem('vovlerALaUrl');
                console.log(vovlerALaUrl2);
                sessionStorage.removeItem('dataPayOSes');
                ocultarModalLoading()
                //console.log("************Que datos obtiene desde MP Wallet", data)
                mostrarExito(`¡Pago exitoso! Su transacción con MP ha sido aprobada y acreditada.<br>
                  Le enviamos un email con los pasos a seguir.<br>
                  Si no lo encuentra busque en "no deseados o spam y coloquemos en correo deseado"`, data.message); 
                // Redirigir a urlOwner después de 2 segundos
                setTimeout(async () => {
                  window.location.href = vovlerALaUrl2;
                }, 8000);
              })
              .catch(error => {
                console.error('Error revisar', error);
              });
          } 


          // aqui va a ser procesada opr primera vez que se registra desde la landing page
          else {

            console.log("vovlio desde MP por Cliente NUEVOOOOOOOOOOOOOO desde la LADING PAGEEEE por pago wallet MP")
            const idEnpointCheq169 = idEnpointCheq[169]
            fetch(`${idEnpointCheq169}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwToken}`
              }, 
              body: JSON.stringify(dataCobro)
            })
            .then(response => response.json())
            .then(data => {
              ocultarModalLoading()
              console.log("************Que datos obtiene desde MP Wallet", data)
              
              mostrarExito(`¡Pago exitoso! Su transacción con MP ha sido aprobada y acreditada.<br>
                Le enviamos un email con los pasos a seguir.<br>
                Si no lo encuentra busque en "no deseados o spam y coloquemos en correo deseado"`, data.message); 

              // Redirigir a urlOwner después de 2 segundos
              setTimeout(function() {
                window.location.href = urlServer;
              }, 5000); // 2000 milisegundos = 2 segundos
            })
            .catch(error => {
              console.error('Error revisar', error);
            });
          }
        }
        // aqui vovlio un rechazo de pago o el cliente se arrepintio y vovlio
      else{
          const vovlerALaUrl2 = sessionStorage.getItem('vovlerALaUrl');
          console.log(vovlerALaUrl2);
          // Luego redirige a la URL almacenada
          mostrarAlerta(`Tu pedido NO pudo cobrarse, por favor elije otro medio de pago.`);
          setTimeout(async () => {
            window.location.href = vovlerALaUrl2;
          }, 2000);
        }
      }   
    }