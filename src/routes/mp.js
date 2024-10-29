require('dotenv').config();
const express   = require('express');
const router    = express.Router(); 
const cors      = require('cors');
router.use(cors());
const fs        = require('fs');
const os = require('os'); // Asegúrate de importar el módulo 'os'
const path      = require('path');  // Asegúrate de agregar esta línea

//models
const User      = require('../models/User');
const GrlConfig = require('../models/configsGrl');
const Mensajes  = require('../models/messages');

//pasarela de pagos
const { MercadoPagoConfig, Payment, Preference  } = require('mercadopago');
const {saveOrUpdateConfig}= require('./configGlrs');
const {sendMail, guardarFondo, consultarEstadoPago, guardarMensajes, SingUp, UpDateUpGrade, endpointTokensArray2, verificarToken} = require('./funcionesymas');


let urlServer = ""

let ConfigG = {}
async function configss() {
  try {
      ConfigG = await saveOrUpdateConfig()
      //console.log('MPPPPPPPPPPP111111111mp11111111111111Cual es la Configuración global obtenida:', ConfigG);
      // Puedes hacer algo con ConfigG aquí
      urlServer = ConfigG.urlServer
  } catch (error) {
      console.error('Error al obtener la configuración global:', error);
  }
}
// Llamar a la función configuraciones generales
configss();

const bodyParser = require('body-parser');

router.use(bodyParser.text());

const endpointTokensArray = endpointTokensArray2().endpointsBackend


if (endpointTokensArray.length === 0) {
  throw new Error("No tienen endpoints");
}

//console.log("Que endpointTokensArray2 en el server MP ???????????????", endpointTokensArray[129])



// no sirve apra nada mp server







module.exports = router;


