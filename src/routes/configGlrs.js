const GrlConfig = require('../models/configsGrl');

// Asegúrate de que `config` y las variables sensibles estén definidas antes de usar
const config = {
    apiKeyMap: '88c66a70b2324b81a65c9059116e088c',
    tiempoParking: 1,
    comisionBasic : 16.5,
    preciosDolar:{
        precioDolarAr: 1350,
        precioDolarUy: 45,
        precioDolarCh: 100,
        precioDolarCl: 1542,
        precioDolarMx: 21,
        precioDolarPr: 1254,
        precioDolarPa: 4589,
        precioDolarBo: 452,
        precioDolarCr: 1203,
        precioDolarDr: 1584,
        precioDolarPn: 1254,
    },
    Vendedores: [
        {
            id: "gerg1grgre1grfg12g1",
            idCordi: "Es del cordi Sebas",
            nombre:"Seba",
            codVend:"Edu16500",
            pais: "Argentina",
            direccion: "fgk{lnl{kgnklrnklvg",
            celu: "11546465464",
            email: "vendedor@vendedor.com",
            emailCom:"vendedor@vendedor.com"
        },
        {
            id: "grgre1grfg12g1",
            idCordi: "Es del cordi Sebas",
            nombre:"Ale",
            codVend:"Ale16500",
            pais: "Argentina",
            direccion: "fgk{lnl{kgnklrnklvg",
            celu: "11546465464",
            email: "vendedor@vendedor.com",
            emailCom:"vendedor@vendedor.com"
        }
    ],
    urlsOwners : {
        urlOwner:"elsebas",
        _id:"66d1e138856594337e174bc2"
    },
    cantImgXMemBasic : 3,
    cantImgXMemPremium : 5,
    basePrice         : 1, // Precio base
    precioDolarAr     : 1,
    extraProductPrice : 0.5, // Precio por producto
    discount          : 0.5, // Descuento del 50%
    codeDiscount      : 0.1,  // 10% de descuento adicional
    idConfig: 'sebaalfiEduNatyTere',
    //urlServer: 'http://localhost:3020/',
    urlServer: 'https://utf-odfm.onrender.com/',
    // alfi token vendedor
    ArTokenPublicMP: process.env.AR_TOKEN_PUBLIC_MP || 'APP_USR-8737d261-a71e-43fe-addd-03c0c056d282',
    ArTokenPrivateMP: process.env.AR_TOKEN_PRIVATE_MP || 'APP_USR-80741225863147-082714-acfe2d6b40dd4673cbeaafbc1b61c586-1781639407',
    //seba token vendedor
    //ArTokenPublicMP: process.env.AR_TOKEN_PUBLIC_MP || 'TEST-cd8d4068-bde9-4779-bded-b0054a0bc51c',
    //ArTokenPrivateMP: process.env.AR_TOKEN_PRIVATE_MP || 'TEST-634616371095007-042315-22557fa3618160d8feb06b9824adcd37-540933245',
    transportEmail: {
        auth: {
            pass: process.env.EMAIL_PASS || 'Sebatbs@22', // Ajusta el valor predeterminado si es necesario
            user: process.env.EMAIL_USER || 'tbs-it.info@tbs-it.net'
        },
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        tls: { rejectUnauthorized: false }
    },
    transportGmail: {
        auth: {
            pass: process.env.EMAIL_PASS || 'kqbc qhlb zzgr xvql', // Ajusta el valor predeterminado si es necesario
            user: process.env.EMAIL_USER || 'sebastianpaysse@gmail.com'
        },
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls: { rejectUnauthorized: false }
    }
}; 

const saveOrUpdateConfig = async () => {
    try {
        // Verificar si ya existe un documento con `idConfig`
        const existingConfig = await GrlConfig.findOne({ idConfig: config.idConfig });

        if (existingConfig) {
            // Si el documento existe, actualizarlo
            const updatedConfig = await GrlConfig.findOneAndUpdate(
                { idConfig: config.idConfig },
                {
                    $set: {
                        apiKeyMap: config.apiKeyMap,
                        tiempoParking : config.tiempoParking,
                        comisionBasic : config.comisionBasic,
                        cantImgXMemBasic : config.cantImgXMemBasic,
                        cantImgXMemPremium : config.cantImgXMemPremium,
                        preciosDolar : config.preciosDolar,
                        basePrice : config.basePrice,
                        Vendedores : config.Vendedores,
                        precioDolarAr :     config.precioDolarAr,
                        extraProductPrice : config.extraProductPrice, // Precio por producto
                        discount          : config.discount,
                        codeDiscount      : config.codeDiscount,
                        idConfig: config.idConfig,
                        urlServer: config.urlServer,
                        ArTokenPublicMP: config.ArTokenPublicMP,
                        ArTokenPrivateMP: config.ArTokenPrivateMP,
                        transportEmail: config.transportEmail,
                        transportGmail: config.transportGmail
                    }
                },
                { new: true } // Devuelve el documento actualizado
            );
            //console.log('Configuración actualizada correctamente.', updatedConfig);
            return updatedConfig;
        } else {
            // Si no existe, crear un nuevo documento
            const newConfig = new GrlConfig({
                apiKeyMap: config.apiKeyMap,
                tiempoParking : config.tiempoParking,
                comisionBasic : config.comisionBasic,
                cantImgXMemBasic : config.cantImgXMemBasic,
                cantImgXMemPremium : config.cantImgXMemPremium,
                preciosDolar : config.preciosDolar,
                Vendedores : config.Vendedores,
                basePrice : config.basePrice,
                precioDolarAr :     config.precioDolarAr,
                extraProductPrice : config.extraProductPrice, // Precio por producto
                discount          : config.discount,
                codeDiscount      : config.codeDiscount,
                idConfig: config.idConfig,
                urlServer: config.urlServer,
                ArTokenPublicMP: config.ArTokenPublicMP,
                ArTokenPrivateMP: config.ArTokenPrivateMP,
                transportEmail: config.transportEmail,
                transportGmail: config.transportGmail
            });
            await newConfig.save();
            console.log('Nueva configuración creada correctamente.');
            return newConfig;
        }
    } catch (error) {
        console.error('Error al guardar o actualizar la configuración:', error);
    }
};

// Llamar a la función para verificar y actualizar o crear la configuración
saveOrUpdateConfig();

// Exportar la función
module.exports = { saveOrUpdateConfig };
