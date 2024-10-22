// // requerimientos
// const express        = require('express');
// const cors           = require('cors');
// const path           = require('path');
// const methodOverride = require('method-override');
// const flash          = require('connect-flash');
// const http           = require('http');
// const fileUpload     = require('express-fileupload');
// const favicon        = require('serve-favicon');
// const session        = require('express-session');
// const mercadopago    = require('mercadopago');

// // busca la base de datos local

// // inicializations
// const app = express();
// require('../dataBase');

// const server = http.Server(app);

// // Settings

// // Middlewares
// app.use(cors());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(fileUpload({
//     useTempFiles: true,
//     tempFileDir: '/tmp/', // O cualquier ruta en tu sistema donde quieras almacenar archivos temporales
//     limits: { fileSize: 50 * 1024 * 1024 } // Ajusta el límite de tamaño de archivo según sea necesario
// }));

// app.use(methodOverride('_method'));

// // Configurar express-session
// app.use(session({
//     secret: 'putososss4343434', // Cambia esto con una cadena secreta más segura
//     resave: true,
//     saveUninitialized: true
// }));

// // Configurar connect-flash
// app.use(flash());

// // Global Variables
// app.use((req, res, next) => {
//     res.locals.success_msg = req.flash('success_msg');
//     res.locals.error_msg = req.flash('error_msg');
//     res.locals.error     = req.flash('error');
//     res.locals.errors    = req.flash('errors');
//     res.locals.user      = req.user || null;
//     next();
// });

// // Lista negra de IPs
// const blacklist = new Set(); // Agrega aquí las IPs que quieras bloquear
// //console.log("Cuantas IPs bloqueadas hay?", blacklist);

// const requestCounts = {};
// const requestLimit = 1500000;
// const requestWindow = 60000; // 1 minuto

// // Middleware para detectar IP y controlar el acceso
// app.use((req, res, next) => {
//     const ip = req.ip;

//     if (blacklist.has(ip)) {
//         //console.log(`IP ${ip} está en la lista negra`);
//         return res.status(403).send(`Sorry, Mrs. Bot, You are blacklisted. IP: ${ip}`);
//     }

//     if (!requestCounts[ip]) {
//         requestCounts[ip] = { count: 1, firstRequestTime: Date.now() };
//     } else {
//         const currentTime = Date.now();
//         const timeElapsed = currentTime - requestCounts[ip].firstRequestTime;

//         if (timeElapsed < requestWindow) {
//             requestCounts[ip].count++;
//         } else {
//             // Reset count and timestamp if the time window has passed
//             requestCounts[ip].count = 1;
//             requestCounts[ip].firstRequestTime = currentTime;
//         }

//         if (requestCounts[ip].count > requestLimit) {
//             blacklist.add(ip);
//             console.log(`IP ${ip} ha superado el límite de solicitudes y ha sido añadida a la lista negra`);
//             return res.status(429).send(`Sorry, Mrs. Bot, you are disconnected. IP: ${ip}`);
//         }
//     }

//     next();
// });


// // Routes
// // app.use(require('./routes/funciones'));
// //app.use(require('./routes/users'));
// app.use(require('./routes/Ecommerce'));
// app.use(require('./routes/mp'));
// app.use(require('./routes/PanelControlOwner/imagenes'));
// app.use(require('./routes/PanelControlOwner/cPanelServer'));


// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // Servir archivos estáticos desde la carpeta 'public'
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'views')));
// app.use(express.static(path.join(__dirname, 'layouts')));
// app.use(express.static(path.join(__dirname, 'partials')));
// app.use('/uploads', express.static('uploads'));
// app.use('/uploads', express.static('C:\\Users\\Coderian\\Desktop\\pruebaTBS\\src\\uploads'));


// // Middleware para manejar errores de rutas no definidas y redirigir a la página principal
// app.use((req, res, next) => {
//     // construir la ruta del archivo index.html
//     const indexPath = path.join(__dirname, 'views', 'index.html');
//     // enviar el archivo como respuesta
//     res.sendFile(indexPath);
// });

// // ruta para renderizar el archivo index.html
// app.get('/', (req, res) => {
//     console.log("Desde el Index principal No se encontro la pagina buscada")
//     // enviar el archivo como respuesta
//     res.redirect('/');
//     const indexPath = path.join(__dirname, 'views', 'index.html');
//     res.sendFile(indexPath);
// });


// // server
// const port = process.env.PORT || 3020;
// server.listen(port, (err) => {
//     console.log(`The Best Staff en desarrollo desde el Servidor con el puerto, ${port}`);
//     if (err) {
//         return console.log('Error No se encontro el servidor probelmas de conexios a internet', err);
//     }
// });












// requerimientos
const express = require('express');
const cors = require('cors');
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const http = require('http');
const fileUpload = require('express-fileupload');
const favicon = require('serve-favicon');
const session = require('express-session');
const mercadopago = require('mercadopago');
const rateLimit = require('express-rate-limit');

// busca la base de datos local

// inicializations
const app = express();
require('../dataBase');

const server = http.Server(app);

// Settings

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '150mb' })); // Ajustado para 50mb
app.use(express.json({ limit: '150mb' })); // Ajustado para 50mb
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/', // O cualquier ruta en tu sistema donde quieras almacenar archivos temporales
    limits: { fileSize: 50 * 1024 * 1024 } // Ajusta el límite de tamaño de archivo según sea necesario
}));

app.use(methodOverride('_method'));

// Configurar express-session
app.use(session({
    secret: 'putososss4343434', // Cambia esto con una cadena secreta más segura
    resave: true,
    saveUninitialized: true
}));

// Configurar connect-flash
app.use(flash());

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.errors = req.flash('errors');
    res.locals.user = req.user || null;
    next();
});

// Lista negra de IPs
const blacklist = new Set(); // Agrega aquí las IPs que quieras bloquear
// console.log("Cuantas IPs bloqueadas hay?", blacklist);

const requestCounts = {};
const requestLimit = 1000000;
const requestWindow = 60000; // 1 minuto

// Middleware para detectar IP y controlar el acceso
app.use((req, res, next) => {
    const ip = req.ip;

    if (blacklist.has(ip)) {
        // console.log(`IP ${ip} está en la lista negra`);
        return res.status(403).send(`Sorry, Mrs. Bot, You are blacklisted. IP: ${ip}`);
    }

    if (!requestCounts[ip]) {
        requestCounts[ip] = { count: 1, firstRequestTime: Date.now() };
    } else {
        const currentTime = Date.now();
        const timeElapsed = currentTime - requestCounts[ip].firstRequestTime;

        if (timeElapsed < requestWindow) {
            requestCounts[ip].count++;
        } else {
            // Reset count and timestamp if the time window has passed
            requestCounts[ip].count = 1;
            requestCounts[ip].firstRequestTime = currentTime;
        }

        if (requestCounts[ip].count > requestLimit) {
            blacklist.add(ip);
            console.log(`IP ${ip} ha superado el límite de solicitudes y ha sido añadida a la lista negra`);
            return res.status(429).send(`Sorry, Mrs. Bot, you are disconnected. IP: ${ip}`);
        }
    }

    next();
});

// Middleware de verificación de User-Agent y Rate Limiting
const verifyUserAgentAndLimit = (req, res, next) => {
    const userAgent = req.headers['user-agent'];

    // Lista de User-Agent permitidos (navegadores de escritorio y móviles)
    const allowedUserAgents = [
        'Mozilla',
        'Chrome',
        'Firefox',
        'Safari',
        'Edge',
        'SamsungBrowser',
        'Mobile Safari',
        'CriOS',
        'Opera Mini',
        'UCBrowser',
        'FxiOS',
        'Android',
        'Silk',
        'OPR',
        'iPhone',
        'iPad'
    ];

    // Verificar si el User-Agent está permitido
    const isAllowed = allowedUserAgents.some(agent => userAgent.includes(agent));

    if (isAllowed) {
        // Aplicar Rate Limiting si el User-Agent es válido
        limiter(req, res, next);
    } else {
        res.status(403).send('Acceso denegado. Navegador no permitido.');
    }
};

const warningCard = `
<style>
    body {
        margin: 0;
        padding: 0;
        background-color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: Arial, sans-serif;
    }
    .container {
        display: flex;
        flex-direction: column; /* Apilar elementos verticalmente */
        justify-content: center; /* Alinear verticalmente al centro */
        align-items: center; /* Alinear horizontalmente al centro */
        text-align: center; /* Centrar el texto dentro del contenedor */
        max-width: 400px; /* Limitar el ancho del contenedor */
        padding: 20px;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
        background-color: #f8d7da;
        color: #721c24;
    }
    .cube-container {
        perspective: 1000px;
        margin-bottom: 20px;
    }
    .cube {
        width: 150px;
        height: 150px;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 1s linear; /* Suaviza el movimiento */
    }
    .cube div {
        position: absolute;
        width: 150px;
        height: 150px;
        background-color: #333;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #000;
        font-size: 14px;
    }
    .front { transform: translateZ(75px); }
    .back { transform: rotateY(180deg) translateZ(75px); }
    .right { transform: rotateY(90deg) translateZ(75px); }
    .left { transform: rotateY(-90deg) translateZ(75px); }
    .top { transform: rotateX(90deg) translateZ(75px); }
    .bottom { transform: rotateX(-90deg) translateZ(75px); }

    .warning-label {
        background-color: black;
        color: white;
        padding: 10px;
        font-size: 14px;
        margin-top: 20px;
    }
    p {
        margin: 20px 0 0 0;
    }
</style>
<div class="container" align="center">
    <div class="cube-container">
        <div class="cube" id="cube">
            <div class="front">Black Box <br> Ciber Security</div>
            <div class="back">TBS-IT <br> Sofware Solutions</div>
            <div class="right">Black Box <br> Ciber Security</div>
            <div class="left">Protect your software</div>
            <div class="top">Black Box <br> Ciber Security</div>
            <div class="bottom">Black Box <br> Ciber Security</div>
        </div>
    </div>
    <div class="warning-label">

<div style="color: red; font-weight: bold; padding: 1rem; border: 2px solid red; border-radius: 5px; background-color: #f8d7da;">
    <strong>Advertencia:</strong><br>
    Se ha detectado un intento sospechoso de acceso no autorizado al servidor, con múltiples intentos reiterados. 
    Por motivos de seguridad, el contenido ha sido protegido.<br>
    Su actividad será registrada para un análisis adicional. 
    Le solicitamos encarecidamente que no intente acceder a nuestra información, ya que esto puede resultar en acciones legales.
</div>


    </div>
</div>
`;

// Limitar 100 solicitudes por IP cada 15 minutos
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // límite por IP
    message: warningCard
});

// Aplicar el middleware de verificación y rate-limiting en todas las rutas
app.use(verifyUserAgentAndLimit);

// Routes
// app.use(require('./routes/funciones'));
// app.use(require('./routes/users'));
app.use(require('./routes/Ecommerce'));
app.use(require('./routes/mp'));
app.use(require('./routes/PanelControlOwner/imagenes'));
app.use(require('./routes/PanelControlOwner/cPanelServer'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'layouts')));
app.use(express.static(path.join(__dirname, 'partials')));
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('C:\\Users\\Coderian\\Desktop\\pruebaTBS\\src\\uploads'));

// Middleware para manejar errores de rutas no definidas y redirigir a la página principal
app.use((req, res, next) => {
    // construir la ruta del archivo index.html
    const indexPath = path.join(__dirname, 'views', 'index.html');
    // enviar el archivo como respuesta
    res.sendFile(indexPath);
});

// ruta para renderizar el archivo index.html
app.get('/', (req, res) => {
    console.log("Desde el Index principal No se encontro la pagina buscada");
    // enviar el archivo como respuesta
    res.redirect('/');
    const indexPath = path.join(__dirname, 'views', 'index.html');
    res.sendFile(indexPath);
});

// server
const port = process.env.PORT || 3020;
server.listen(port, (err) => {
    console.log(`The Best Staff en desarrollo desde el Servidor con el puerto, ${port}`);
    if (err) {
        return console.log('Error No se encontro el servidor problemas de conexiones a internet', err);
    }
});


