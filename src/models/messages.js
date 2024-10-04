const mongoose = require('mongoose');
const { Schema } = mongoose;

const messages = new Schema({
    //direccion
    email: { type: String },
    names: { type: String },
    urlImg: [],
    serverPathImg: [],
    apellido: { type: String },
    pais: { type: String },
    nombreEcommerce: { type: String },
    nombreProducto: { type: String },
    nombrePromocion: { type: String },
    nwePromoOk: { type: Boolean },
    nweNoticias: { type: Boolean },
    numCel: { type: String },
    message: { type: String },
    messageCliente: { type: String },
    messageOwner: { type: String },
    subjectCliente: { type: String },
    subjectOwner: { type: String },
    logoOwner: { type: String },
    nombreComercio: { type: String },
    nombreCliente: { type: String },
    idOwner: { type: String },
    idPromo: { type: String },
    idMensaje: { type: String },
    idCliente: { type: String },
    codigoPedido: { type: String },


    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('messages', messages)