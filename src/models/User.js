const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

// Esquema de dirección
const direccionSchema = new Schema({
    calle: { type: String },
    CP: { type: String },
    ciudad: { type: String },
    estado: { type: String },
    lat: { type: String },
    lng: { type: String },
    localidad: { type: String },
    numeroPuerta: { type: Number },
    observaciones: { type: String },
    pais: { type: String }
});

// Esquema de Usuario
const UserSchema = new Schema({
    flagNews: { type: Boolean },
    lastInfo:[],
    lasDateInfo : { type: Date, default: Date.now },
    // Información básica
    apellido: { type: String },
    cuit: { type: String },
    date: { type: Date, default: Date.now },
    descripcionTienda: { type: String },
    ecommerceName: { type: String },
    email: { type: String },
    emailOficial: { type: String },
    empresa: { type: String },
    nombre: { type: String },
    nombreEcommerce: { type: String },
    nombrePagAppWeb: { type: String },
    numDocu: { type: String },
    numDocuFiscal: { type: String },
    numCel: [{ numCelOwner: String }],
    pathLogo: { type: String },
    pathPhoto: { type: String },
    precio: { type: Number },
    user: { type: String },
    usuarioBloqueado: { type: Boolean },
    mostrarPromoPPrin: { type: Boolean },
    retiros: [
        {
        codigoRetiro: { type: String },
        monto: { type: Number },
        fecha: { type: Date, default: Date.now },
        descripcion: { type: String },
        metodo: { type: String },
        estado: { type: String },
        },
    ],
    // Información adicional
    cantContratosMemRealizados: [
        {
        // canProd: { type: Number },
        // fechaCompraCantProd: { type: Date, default: Date.now },
        // fechaVencimientoCantProd: { type: Date },
        // ticketNumber: { type: String },
        // ticketPath: { type: String },
        // tiempoCOntratadoProd: { type: Number },
        // tipoDPago: { type: String }
        }
    ],
    datosExtrasdeMP: {},
    deliveryCompany: [],
    desingShop: { type: String },
    linksredesSociales: {
        facebook: { type: String },
        linkedin: { type: String },
        twitter: { type: String },
        X: { type: String },
        youtube: { type: String }
    },
    medioCanalDPago: {},
    mediasDPagoCobro: {
    },
    DocumentoID:{
        // tipoDocumento: { type: String },
        // numeroDocumento: { type: Number },
        // fechaVencimiento: { type: Date },
        // documentoFrontal: { type: String },
        // documentoReverso: { type: String },
        // autorizacionCheck: { type: Boolean },
    },
    cheqDataFaltante:{ type: Boolean },
    misProductos: [],
    nombrePagAppWeb: { type: String },
    pathLogo: { type: String },
    pathPhoto: { type: String },
    password: { type: String },
    realPass: { type: String },
    statusInscrip: { type: String },
    tipoCliente: { type: String },
    tipoDocu: { type: String },
    cheqDocument: { type: Boolean },
    tipoDocuFiscal: { type: String },
    tipoMembresia: { type: String },
    ticketNumber: { type: String },
    transportEmail: {},
    transportGmail: {},
    tranposterEmailUser:{},
    urlOwner: { type: String },
    urlServer: { type: String },
    user: { type: String },
    usuarioBloqueado: { type: Boolean },
    Ventas: [],
    ownerPreference_idMP: { type: String },
    renovarMem:{ type: Boolean },
    // Membresía y contratos
    fechaVencMem: { type: Date },
    TotalProdCOntratados: { type: Number },
    mostrarPromoPPrin: { type: Boolean },
    pruductos: { type: Boolean },
    staffing: { type: Boolean },

    // Datos de contacto
    emails: [{ emailOwner: String }],
    otrosEmails: [],

    // Datos de beststaff
    datosExtrasdeMP: {},

    // Otras propiedades
    clientes: [],
    fondoPantalla: { type: String },
    pagWeb: { type: Boolean },
    // contraseñas
    Clave: { type: Boolean },

    // Diseño de la tienda
    desingShop: { type: String },
    descripcionTienda: { type: String },
    // dirección de la tienda
    direcciones: [direccionSchema]
});

// Métodos para manejo de contraseñas
UserSchema.methods.encryptPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
