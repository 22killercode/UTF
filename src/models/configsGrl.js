const mongoose = require('mongoose');
const { Schema } = mongoose;

const GrlConfig = new Schema({
    apiKeyMap:{ type: String },
    tiempoParking :{ type: Number },
    comisionBasic:{ type: Number },
    preciosDolar:{
        precioDolarAr:{ type: Number },
        precioDolarUy:{ type: Number },
        precioDolarCh:{ type: Number },
        precioDolarCl:{ type: Number },
        precioDolarMx:{ type: Number },
        precioDolarPr:{ type: Number },
        precioDolarPa:{ type: Number },
        precioDolarBo:{ type: Number },
        precioDolarCr:{ type: Number },
        precioDolarDr:{ type: Number },
        precioDolarPn:{ type: Number },
    },
    Vendedores: [{
        id: String,
        idCordi: String,
        nombre: String,
        codVend: String,
        pais: String,
        direccion: String,
        celu: String,
        email: String,
        emailCom: String
    }],
    //direccion
    idConfig:{ type: String },
    urlServer:{ type: String },
    ArTokenPublicMP:{ type: String },
    ArTokenPrivateMP:{ type: String },
    transportEmail:{},
    transportGmail:{},
    cantImgXMemBasic :{ type: Number },
    cantImgXMemPremium :{ type: Number },
    urlsOwners:[
        {urlOwner:{ type: String }},
        {idOwner:{ type: String }}
    ],

    urlsPromos: [
        {
            urlPromo: { type: String },  // URL de la promoción
            idOwner: { type: String }    // ID del propietario
        }
    ],

    basePrice         :{ type: Number },
    precioDolarAr     :{ type: Number },
    extraProductPrice :{ type: Number },
    discount          :{ type: Number },
    codeDiscount      :{ type: Number },
    
    date: { type: Date, default: Date.now },

});

module.exports = mongoose.model('GrlConfig', GrlConfig)