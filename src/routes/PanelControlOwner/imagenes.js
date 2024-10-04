require('dotenv').config();
const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const shortid = require('shortid');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const bodyParser = require('body-parser');
router.use(bodyParser.text());
const fsExtra = require('fs-extra');


router.get('/imagen/block/primero', async (req, res) => {
    ////console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/publi01.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});

router.get('/imagen/block/rubros', async (req, res) => {
    ////console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/rubros.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});

router.get('/imagen/block/pasos', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/pasos.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});

router.get('/imagen/block/incluye', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/invluye.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});

router.get('/imagen/block/dispositivos', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/dispisitivos.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});



router.get('/imagen/block/dispo1', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/Diapositiva4.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});

router.get('/imagen/block/dispo2', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/Diapositiva5.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});

router.get('/imagen/block/dispo3', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/Diapositiva6.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});

router.get('/imagen/block/dispo4', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/Diapositiva7.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});

router.get('/imagen/block/dispo5', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/Diapositiva8.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});


router.get('/imagen/block/comparaciones', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    const imagePath = path.join(__dirname, '../../public/img/comparaciones.jpg'); // Ajusta la ruta según la estructura de tu proyecto
    res.sendFile(imagePath);
});



router.get('/elements', async (req, res) => {
    //console.log("Entro a buscar la imagen")
    res.render("/elements.html");
});


module.exports = router;