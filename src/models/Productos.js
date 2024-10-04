const mongoose = require('mongoose');
const { Schema } = mongoose;

const Productos = new Schema({
    cardProdHor: { type: Boolean },
    cardProdVert: { type: Boolean },
    cardProdTra: { type: Boolean },
    esPromocion: { type: Boolean },
    animOK: { type: Boolean },
    idOwner: { type: String },
    prodEnPromo: { type: Boolean },
    endPointsIdTokens: { type: String },
    pathImg: [{ type: String }], 
    rutaSimpleImg: [{ type: String }],
    pathImgs: [{ type: String }],
    empresa: { type: String },
    titulo: { type: String },
    categoria: { type: String },
    rubro: { type: String },
    moneda: { type: String },
    nombreProducto: { type: String },
    descripcion: { type: String },
    cantidad: { type: Number },
    precio: { type: Number },
    rutaURL: { type: String },
    pathImg: { type: String },
    rutaSimple: { type: String },
    nombreEcommerce: { type: String },
    emailDuenoEcommerce: { type: String },
    rutaSimple2: { type: String },
    codProd: { type: String },
    idCliente: { type: String },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Productos', Productos)