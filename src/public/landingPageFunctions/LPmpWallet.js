let idPay = {}
let dataGrlPayload = {}
let vovlerALaUrl = ""

src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js">

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


  // comprar memebresia desde la landing page
  async function LPmpWallet(dataPay, dataOwner) {
    console.log("Entro por LPmpWalletLPmpWalletLPmpWallet pára apagar la membresia desde la landing PAge", )
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

          const idEnpointCheq = JSON.parse(sessionStorage.getItem("endPointsIdTokensCpanel"))
          const jwToken = dataBasic.data.jwToken
          console.log("111111111jwTokenjwTokenjwTokenEEEEEEEEEEEEEEEEEentro al pago con MP Wallet dataBasic", jwToken);
          console.log("22222222222idEnpointCheq129idEnpointCheq129EEEEEEEentro al pago con MP Wallet dataBasic", idEnpointCheq[129]);

          fetch(`${idEnpointCheq[129]}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${jwToken}`
            }, 
            body: JSON.stringify(dataGrlPayload)
          })

          .then(response => response.json())

          .then(data => {
            console.log("******111111111111*********Que datos obtiene desde MP Wallet", data)
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
          console.error("QQQQQQQQQque error detecto en el trycathc de mpWallet", error)
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

      //console.log("*createCheckoutButton eckoutButton Wallet",ArTokenPublicMP, dataBasic)

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



  // upgrqde de membresia desde andentro del Cpanel
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
        const payer = {
          firstName: nombre,
          lastName: apellido,
          email
        }

          const dataPayloads = {DataPayO, datosOwnerResume, payer, pedidoPendCobrar, dataBasic, renewMemId123 }
          console.log("CpanelmpWallet Eentro al pago con MP Wallet dataBasic",);
          const idEnpointCheq = JSON.parse(sessionStorage.getItem("endPointsIdTokensCpanel"))
          fetch(`${idEnpointCheq[179]}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${jwToken}`
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


  //*********************** */ Aqui viene la devulusiones de MP Wallets y sus analissis

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


  // analiza la url para ver si hay una devolucion del pago de las membresias premium tanto de la landing page como del uprgrade de Cpanel
  function devolucionDeMP() {
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
      
      //console.log("devolucionDeMP Encontro un pedido cobrado por la successUpGrade de MP:",currentURL87, statusCobro, cheqSucces);  

      // filtra de donde vino el pago ya sea de Cpanel para ugrade update y ÑLanding PAge para cliente nuevo
      if (statusCobro) {
        const dataBasic = JSON.parse(sessionStorage.getItem('datosBasicos'));

        const jwToken = dataBasic.data.jwToken
        const urlServer = dataBasic.data.ConfigsOne[0].urlServer

        const dataPedidoCorbado = JSON.parse(sessionStorage.getItem("dataGrlSave"));

        console.log("Encontro la dataPedidoCorbado", dataPedidoCorbado)

        const dataCobro = {externalData, statusCobro, paymentId, paymentType, siteId, dataPedidoCorbado}

        if (statusCobro === "approved") {
          console.log("Encontro un pedido cobrado por la walltet de MP: idEnpointCheq");
          // Cerrar el modal
          var modal = document.getElementById('opciones');
          modal.style.display = 'none';
          modal.innerHTML = ""
          // aqui va ser procesada la actualizacion UPGRADE memebresia premium desde el Cpanel
          if (cheqSucces) {
            console.log("Encontro un paso cheqSucces***************", cheqSucces )
            const idEnpointCheq = JSON.parse(sessionStorage.getItem('endPointsIdTokensCpanel'));
            console.log("idEnpointCheq[169] wallet MP", idEnpointCheq[169])
            
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
                  // 'Authorization': `Bearer ${jwToken}`
                }, 
                body: JSON.stringify(dataConsolidada)
              })
              .then(response => response.json())
              .then(data => {
                //TODO armar la direccion de vuelta del cobro del upgrade
                // const vovlerALaUrl2 = sessionStorage.getItem('vovlerALaUrl')idEnpointCheq[172];
                const vovlerALaUrl2 = idEnpointCheq[172];
                console.log(vovlerALaUrl2);
                sessionStorage.removeItem('dataPayOSes');
                ocultarModalLoading()
                //console.log("************Que datos obtiene desde MP Wallet", data)
                mostrarExito(`
                  ¡Pago exitoso! <br>
                  Su Up Grade a membresia Premium abonada con con MP ha sido aprobada y acreditada.<br>
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
            const idEnpointCheq = JSON.parse(sessionStorage.getItem('endPointsIdTokensCpanel'));
            console.log("idEnpointCheq[169] wallet MP", idEnpointCheq[169])
            fetch(`${idEnpointCheq[169]}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${jwToken}`
              }, 
              body: JSON.stringify(dataCobro)
            })
            .then(response => response.json())
            .then(data => {
              ocultarModalLoading()
              console.log("************Que datos obtiene desde MP Wallet", data)
              
              mostrarExito(`¡Pago exitoso! <br> Su transacción con MP ha sido aprobada y acreditada.<br>
                Le enviamos un email con los pasos a seguir.<br>
                Si no lo encuentra busque en "no deseados o spam y coloquemos en correo deseado"`, data.message); 

              // Redirigir a urlOwner después de 2 segundos
              setTimeout(function() {
                window.location.href = urlServer;
              }, 5000); // 2000 milisegundos = 2 segundos
            })
            .catch(error => {
              console.error('Error revisar en LPmpWallet 169', error);
            });
          }
        }
        // aqui vovlio un rechazo de pago o el cliente se arrepintio y vovlio
        else{
            const vovlerALaUrl2 = sessionStorage.getItem('vovlerALaUrl');
            console.log("statusCobro === approved", statusCobro === "approved", vovlerALaUrl2);
            // Luego redirige a la URL almacenada
            mostrarAlerta(`Tu pedido NO pudo cobrarse, por favor elije otro medio de pago.`);
            setTimeout(async () => {
              window.location.href = vovlerALaUrl2;
            }, 2000);
          }
      }else{return}   
    } 
  }

  devolucionDeMP()