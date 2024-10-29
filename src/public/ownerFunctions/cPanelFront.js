
const comprasClientes2 = []
const categorias  = []
const categorias2 = []
const categorias3 = []

let editorInstances = {};
let map; // Variable global para el objeto de mapa
let map88; // Variable global para el objeto de mapa88
async function mapas() {
    
    // carga el mapa
    var userPolygon; // Variable global para el polígono de usuario
    // Inicializa el mapa
    map = L.map('map')
            // Agrega capa de mosaicos OpenStreetMap al mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        id: 'osm_b&w',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);
    
    //map787 = L.map('map787')
    // Agrega capa de mosaicos OpenStreetMap al mapa
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    //     maxZoom: 19,
    //     id: 'osm_b&w',
    //     tileSize: 512,
    //     zoomOffset: -1
    // }).addTo(map787);
}
mapas()

urlServer = ""

document.addEventListener('DOMContentLoaded', async function () {
    //datos generales
    endpoints      = JSON.parse(sessionStorage.getItem('endPointsIdTokensCpanel'));
    const jwToken        = sessionStorage.getItem('jwTokenOwner');
    const dataOwner      = JSON.parse(sessionStorage.getItem('dataOwner'));
    const ownerProducts  = JSON.parse(sessionStorage.getItem("ownerProducts")) || [];
    const ownerPromos    = JSON.parse(sessionStorage.getItem("ownerPromos")) || [];
    const ownerMensajes  = JSON.parse(sessionStorage.getItem("ownerMensajes")) || [];
    const basicData      = JSON.parse(sessionStorage.getItem("basicData")) || JSON.parse(sessionStorage.getItem("datosBasicos")).data.ConfigsOne[0] ;
    //console.log("**************Que jwToken y dataOwner encontro?", dataOwner)

    urlServer = basicData.urlServer

    // Desestructurar el objeto de datos del cliente
    let { nombre, apellido, tipoMembresia, Ventas, direcciones, emails, email, numCel, realPass, pathLogo, ecommerceName, tipoDocu, numDocu, numDocuFiscal, tipoDocuFiscal,  retiros, cheqDocument, cheqDataFaltante, dominio } = dataOwner;

    const idOwner = dataOwner._id 

    // funciones para obtener y renderizar todos los productos
    function obtenerProductos(ownerProducts) {
        //console.log("Cuantos productos encotro desde el fronen", ownerProducts.length)
        ownerProducts.forEach((producto) => {
            // sube al localHost los enpoints
            const categoria = producto.categoria;
            // Agrupar productos por categoría
            if (!categorias[categoria]) {
                categorias[categoria] = [];
            }
            categorias[categoria].push(producto);
        });

        // Renderizar productos y categorías
        renderizarProductosYCategoriasCpanel(categorias);

        // Inicializar todos los carruseles de Bootstrap
        $('.carousel').carousel();

    }
    function renderizarProductosYCategoriasCpanel(categorias) {
        //console.log("2222222222222222222 Todos los productos por categorias", categorias);
        // Encuentra el div para renderizar los productos y servicios
        const contenedorProductosServicios = document.getElementById('tusProductos');
        contenedorProductosServicios.innerHTML = '';
        contenedorProductosServicios.style.maxHeight = '600px'; // Altura máxima del contenedor
        //console.log("Cuantos categorias hay????????????????????????????????????????",categorias.lenght )
            // Renderizar cada categoría
            Object.keys(categorias).forEach(categoria => {
                const categoriaContainer = document.createElement('div');
                categoriaContainer.className = 'alert alert-success';
                categoriaContainer.innerHTML = `
                    <h5 style="height: 1rem; margin: -1rem auto !important; padding: auto; width: auto" id="${categoria}">${categoria}</h5>
                `;
                contenedorProductosServicios.appendChild(categoriaContainer);

                // Contenedor de rejilla para los productos
                const productosRow = document.createElement('div');
                productosRow.className = 'row row-cols-1 row-cols-md-3'; // 1 columna en dispositivos pequeños, 3 en dispositivos medianos y grandes
                productosRow.style.textAlign = "center"; // Centra el texto dentro del contenedor
                productosRow.style.display = "flex"; // Usa Flexbox para alinear elementos
                productosRow.style.justifyContent = "center"; // Centra los elementos hijos horizontalmente
                productosRow.style.margin = "0 auto"; // Centra el contenedor si tiene un ancho definido
                
                // Renderizar cada producto de la categoría
                categorias[categoria]
                    .sort((a, b) => {
                        const fechaA = new Date(a.date);
                        const fechaB = new Date(b.date);
                        return fechaB - fechaA; // Ordenar por fecha, el más reciente primero
                    })                 
                    .forEach(producto => {
                        const productoId = producto._id;
                        if (producto.cantidad <= 1) {
                            const fechaActual = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                            const datInfo = {
                                idInfo : productoId,
                                Date: fechaActual, 
                                positivo:false,
                                infoMensaje: `Te queda un solo producto de ${producto.nombreProducto}, revisalo en control de stock`
                            };
                            infoDiario(datInfo)
                        }
                        const cardHtmlPRodCpanel = `
                            <br>
                            <div class="col" align="center" style="border-radius: 2rem !important;">
                                <div class="card" id="${producto._id}" style="width: auto; margin:0.3rem !mportant">
                                    <div id="carousel${producto._id}" class="carousel slide" data-bs-ride="carousel">
                                        <div class="carousel-inner p-3">
                                            ${producto.rutaSimpleImg.map((img, index) => `
                                                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                                    <img src="${img}" class="d-block w-100" alt="Producto" style="width: auto; height: 200px !important; object-fit: contain;">
                                                </div>`).join('')}
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <h4 class="card-title">${producto.nombreProducto}</h4>
                                        ${producto.codProd ? `<h6 class="card-title">Código del producto: ${producto.codProd}</h6>` : ''}
                                        <div class="product-description-container" style="margin: 1rem 0 0 -0.91rem !important; padding: 0.51rem; height: 150px; overflow-y: auto;" align="left">
                                            <p><strong>Descripción del producto.</strong></p>
                                            <p align="left">${producto.descripcion}</p>
                                        </div>
                                        <p class=""><strong>Precio:</strong> $${formatoMoneda(producto.precio)}</p>
                                        <p class=""><strong>Quedan:</strong> ${producto.cantidad}</p>
                                        <div align="center">
                                            <button type="button" class="btn btn-primary add-to-cart" id="BTNEditar${productoId}" data-producto-id="${producto._id}">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button type="button" class="btn btn-primary add-to-cart" id="BTNEliminar${productoId}" data-producto-id="${producto._id}">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        productosRow.innerHTML += cardHtmlPRodCpanel;
                    });
                    contenedorProductosServicios.appendChild(productosRow);
            });

            // EDITAR PRODUCTOS
            document.addEventListener('click', function(event) {
                if (event.target.closest('.btn-primary.add-to-cart[id^="BTNEditar"]')) {
                    const button = event.target.closest('.btn-primary.add-to-cart[id^="BTNEditar"]');
                    const idProd = button.getAttribute('data-producto-id')
                        const modalElement = document.getElementById('editarProducto254');
                        const insertProd   = document.getElementById('insertarProducto');
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                        //insertProd.innerHTML = ""
                        const productos = ownerProducts
                        //console.log("Que productos encuentra jfnjwnfjwnfjnjnjn", productos)
                        const producto = productos.find(prod => prod._id === idProd);
                                                    //quita las etiquetas HTML para el textarea placeholder
                            function stripHTMLEdit(text) {
                                return text.replace(/<\/?[^>]+(>|$)/g, "");
                            }
                            let descriptionEdit = stripHTMLEdit(producto.descripcion);
                        // Objeto que contiene la opción seleccionada
                        let tipoTarjetaEdit = {
                            cardProdHor: false,
                            cardProdVert: false,
                            cardProdTra: false
                        };
                        const cardHtmlEdit = `
                    <div class="col container-xxl">
                        <div class="card container-xxl" id="${producto._id}" style="width: auto; margin: 0.3rem !important;">
                            <div id="carousel${producto._id}" class="carousel slide" data-bs-ride="carousel">
                                <div class="carousel-inner">
                                    ${producto.rutaSimpleImg.map((img, index) => `
                                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                            <img src="${img}" class="d-block w-100" alt="Producto" style="width: auto; height: 300px; object-fit: contain;">
                                        </div>`).join('')}
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="product-description-container mt-3">
                                    <h5 class="card-title">
                                        <strong>
                                            Categoría del producto: <br> ${producto.categoria}
                                        </strong>
                                    </h5>
                                </div>
<div class="product-description-container mt-3">
    <div class="row align-items-center">
        <div class="col-6"> <!-- Cambiar a col-6 para ocupar la mitad de la pantalla -->
            <h5 class="card-title"><strong>Nombre del producto</strong></h5>
            <input class="form-control" name="nombreProducto23" placeholder="Nombre del producto: ${producto.nombreProducto}">
        </div>
        <div class="col-6"> <!-- Cambiar a col-6 para ocupar la mitad de la pantalla -->
            <div class="form-check form-switch">
                <label class="form-check-label" for="animOK1">Activar animaciones en cantidad</label>
                <br>
                <input class="form-check-input" type="checkbox" id="animOK1" name="animOK" value="true">
            </div>
        </div>
    </div>
</div>






                                                    <!-- elije el diseño de las tarjetas de los productos -->
                                                    <div class="container-xxl mt-2 w-100">
                                                        <div class="row w-100">
                                                            <!-- Tarjeta 1 -->
                                                            <div class="col-lg-4 col-md-4 mb-2">
                                                                <div class="card">
                                                                    <div class="card-header">
                                                                        Tarjeta horizontal Vintage
                                                                    </div>
                                                                    <div class="card-body">
                                                                        <img src="/images/ejemploHorizontal.jpg" class="card-img-top" alt="Imagen del producto 1" style="max-width: 300px; height: 300px;">
                                                                    </div>
                                                                    <div class="card-footer d-flex justify-content-between align-items-center">
                                                                        <label class="form-check-label" for="switch1ABCedit">On/Off</label>
                                                                        <div class="form-check form-switch">
                                                                            <input class="form-check-input" type="checkbox" role="switch" id="switch1ABCedit" onchange="handleSwitchABCedit('cardProdHor', this)">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <!-- Tarjeta 2 -->
                                                            <div class="col-lg-4 col-md-4 mb-2">
                                                                <div class="card">
                                                                    <div class="card-header">
                                                                        Tarjeta Vertical Vintage
                                                                    </div>
                                                                    <div class="card-body">
                                                                        <img src="/images/ejemploVertical.jpg" class="card-img-top" alt="Imagen del producto 2" style="max-width: 300px; height: 300px;">
                                                                    </div>
                                                                    <div class="card-footer d-flex justify-content-between align-items-center">
                                                                        <label class="form-check-label" for="switch2ABCedit">On/Off</label>
                                                                        <div class="form-check form-switch">
                                                                            <input class="form-check-input" type="checkbox" role="switch" id="switch2ABCedit" onchange="handleSwitchABCedit('cardProdVert', this)">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <!-- Tarjeta 3 -->
                                                            <div class="col-lg-4 col-md-4 my-2">
                                                                <div class="card">
                                                                    <div class="card-header">
                                                                        Tarjeta Cristal Edition
                                                                    </div>
                                                                    <div class="card-body">
                                                                        <img src="/images/ejemploCristal.jpg" class="card-img-top" alt="Imagen del producto 3" style="max-width: 300px; height: 300px;">
                                                                    </div>
                                                                    <div class="card-footer d-flex justify-content-between align-items-center">
                                                                        <label class="form-check-label" for="switch3ABCedit">On/Off</label>
                                                                        <div class="form-check form-switch">
                                                                            <input class="form-check-input" type="checkbox" role="switch" id="switch3ABCedit" onchange="handleSwitchABCedit('cardProdTra', this)">
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>







<div class="product-description-container mt-3" align="left">
    <h6><strong>Descripción del producto.</strong></h6>
    <textarea 
        name="descripcion23" 
        id="descr55ipcion23" 
        class="ckeditor form-control" 
        rows="3" 
        placeholder="${descriptionEdit}" 
        style="text-align: left;"
        align="left">
    </textarea>
</div>

                                <div class="row mt-3">
                                    <div class="col">
                                        <h6><strong>Precio del producto</strong></h6>
                                        <input name="precio23" class="form-control" placeholder="Precio: $${formatoMoneda(producto.precio)}">
                                    </div>
                                    <div class="col">
                                        <h6><strong>Quedan en stock.</strong></h6>
                                        <input name="cantidad23" class="form-control" placeholder="Quedan en stock: ${producto.cantidad}">
                                    </div>
                                </div>
                                <div class="text-center mt-3">
                                    <button type="button" class="btn btn-primary" id="BTNConfEditar${idProd}" data-producto-id="${producto._id}">Confirmar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                        `;
                        insertProd.innerHTML = cardHtmlEdit
                       // Función para manejar el switch

                        // Función para crear el editor
                        let editorInstanceEdit = null
                        function inicializarEditorProd(selector) {
                            ClassicEditor.create(document.querySelector(selector))
                                .then(editor => {
                                    // Guardar la instancia del editor
                                    editorInstanceEdit = editor;
                                    // Establecer la altura del contenedor del editor
                                    const editorElement = editor.ui.view.editable.element;
                                    editorElement.style.height = '200px';
                                })
                                .catch(console.error);
                        }
                        inicializarEditorProd('#descr55ipcion23');
                        //console.log(`Editar producto con ID: ${button.getAttribute('data-producto-id')}`);
                        const btnConfEdit = document.getElementById(`BTNConfEditar${idProd}`);
                        // Agregar event listener al botón
                        btnConfEdit.addEventListener('click', function() {
                            //console.log('El botón de confirmar edición ha sido clickeado.');
                            //const card = document.getElementById(idProd);
                            // Función para obtener el contenido del editor
                            function obtenerContenidoEditor() {
                                if (editorInstanceEdit) {
                                    const contenidoHTML = editorInstanceEdit.getData();
                                    //console.log("Contenido del editor:", contenidoHTML);
                                    return contenidoHTML;
                                } else {
                                    //console.log("El editor aún no está inicializado.");
                                    return null;
                                }
                            }
                            const descripcion = obtenerContenidoEditor()
                            const nombreProducto = document.getElementsByName('nombreProducto23')[0].value;
                            //const descripcion    = document.getElementsByName('descripcion23')[0].value;
                            const precio         = document.getElementsByName('precio23')[0].value;
                            const cantidad       = document.getElementsByName('cantidad23')[0].value;
                            const animOK       = document.getElementsByName('animOK')[0].value;

                            if (!nombreProducto || !descripcion || !precio || !cantidad) {
                                mostrarAlerta('Por favor, complete todos los campos requeridos.');
                                return
                            }
                            
                            // Crear el objeto dataObjects
                            const dataEdit = {
                                nombreProducto:nombreProducto,
                                descripcion:descripcion,
                                precio:precio,
                                cantidad:cantidad,
                                idProd,
                                animOK
                            };
                            //console.log('Que datos se obtienen.',dataEdit);
                            // Debe enviar la info al server para updatearla
                            const options45 = {
                                method: 'POST', // Método de la solicitud
                                headers: {
                                    'Content-Type': 'application/json' // Tipo de contenido de la solicitud
                                },
                                body: JSON.stringify(dataEdit), // Convertir el objeto de datos a formato JSON
                                headers: {
                                    'Authorization': `Bearer ${jwToken}`
                                }	 
                            };
                            //cerrar el modal loading
                            mostrarModalLoading()
                            ocultarModalCpanel("borrarEditProd")
                            // Realizar la solicitud Fetch
                            fetch(`${endpoints[15]}`, options45) 
                            .then(async response => {
                                //cerrar el modal loading
                                ocultarModalLoading()
                                    // Verificar si la solicitud fue exitosa
                                    if (response.ok) {
                                        //console.log('Datos enviados correctamente para eliminar producto',idProd);
                                        // Aquí puedes agregar lógica adicional si la solicitud fue exitosa
                                        return response.json(); // Convertir la respuesta a JSON
                                    } else {
                                        console.error('Error al enviar los datos:', response);
                                    }
                                })
                                .then(data => {
                                    if (data && data.success === false) {
                                        // Si la respuesta tiene un estado 400 y contiene un mensaje de error, mostrarlo en la alerta
                                        mostrarAlerta(data.message);
                                        // Esperar 3 segundos antes de recargar la página
                                        setTimeout(async () => {
                                            await actualizarData()
                                        }, 1000); // 3000 milisegundos = 3 segundos
                                    } else {
                                        // Manejar la respuesta si es exitosa
                                        mostrarExito(data.message); // Mostrar la respuesta en un alert
                                        // Esperar 3 segundos antes de recargar la página
                                        setTimeout(async () => {
                                            await actualizarData()
                                        }, 1000); // 3000 milisegundos = 3 segundos
                                    }
                                })
                                .catch(error => {
                                    // Esperar 3 segundos antes de recargar la página
                                    setTimeout(() => {
                                        location.reload(); // Recargar la página
                                    }, 1000); // 3000 milisegundos = 3 segundos
                                    console.error('Error en la solicitud Fetch:', error);
                                    mostrarAlerta('Error en la solicitud Fetch en la edición del producto',error); // Mostrar un mensaje genérico de error en un alert
                                });
                        });
                }
            // ELIMINAR PRODUCTO
                if (event.target.closest('.btn-primary.add-to-cart[id^="BTNEliminar"]')) {
                    const button = event.target.closest('.btn-primary.add-to-cart[id^="BTNEliminar"]');
                    const idProd = button.getAttribute('data-producto-id')
                    const mensajeOptions = "¿Deseas eliminar este producto?"
                    const rechaza = function(){}
                    // para eliminar productos del owner
                    const confirma =   async function eliminarProducto() {
                        //console.log("entro a elimnar 888888888 producto", idProd)
                        // Configurar las opciones de la solicitud Fetch
                        const options45 = {
                            method: 'POST', // Método de la solicitud
                            headers: {
                                'Content-Type': 'application/json' // Tipo de contenido de la solicitud
                            },
                            body: JSON.stringify(idProd), // Convertir el objeto de datos a formato JSON
                            headers: {
                                'Authorization': `Bearer ${jwToken}`
                            }	 
                        };
                        //cerrar el modal loading
                        mostrarModalLoading()
                        // Realizar la solicitud Fetch
                        fetch(`${endpoints[13]}`, options45) 
                        .then(async response => {
                            //cerrar el modal loading
                            await ocultarModalLoading()
                                // Verificar si la solicitud fue exitosa
                                if (response.ok) {
                                    //console.log('Datos enviados correctamente para eliminar producto',idProd);
                                    // Aquí puedes agregar lógica adicional si la solicitud fue exitosa
                                    return response.json(); // Convertir la respuesta a JSON
                                } else {
                                    console.error('Error al enviar los datos:', response);
                                }
                            })
                            .then(data => {
                                if (data && data.success === false) {
                                    // Si la respuesta tiene un estado 400 y contiene un mensaje de error, mostrarlo en la alerta
                                    mostrarAlerta(data.message);
                                    // Esperar 3 segundos antes de recargar la página
                                    setTimeout(async () => {
                                        await actualizarData()
                                    }, 1000); // 3000 milisegundos = 3 segundos
                                } else {
                                    // Manejar la respuesta si es exitosa
                                    mostrarExito(data.message); // Mostrar la respuesta en un alert
                                    // Esperar 3 segundos antes de recargar la página
                                    setTimeout(async () => {
                                        await actualizarData()
                                    }, 1000); // 3000 milisegundos = 3 segundos
                                }
                            })
                            .catch(error => {
                                // Esperar 3 segundos antes de recargar la página
                                setTimeout(() => {
                                    location.reload(); // Recargar la página
                                }, 1000); // 3000 milisegundos = 3 segundos
                                console.error('Error en la solicitud Fetch:', error);
                                mostrarAlerta('Error en la solicitud Fetch eliminar producto', error); // Mostrar un mensaje genérico de error en un alert
                            });

                    };
                    confirmOptions(mensajeOptions, confirma, rechaza)
                }
            });
    }
    // busca, revisa y renderiza todos los productos que se venden en el ecommerce
    obtenerProductos(ownerProducts);


    //MARKETING funciones para obtener y renderizar todos los productos para promocionar en Cpanel
    function productosMarketig(ownerProducts) {
        //console.log("Cuantos productos encotro desde el productosMarketig", ownerProducts.length)
        ownerProducts.forEach((producto) => {
            // sube al localHost los enpoints
            const categoria = producto.categoria;
            // Agrupar productos por categoría
            if (!categorias2[categoria]) {
                categorias2[categoria] = [];
            }
            categorias2[categoria].push(producto);
        });
        // Inicializar todos los carruseles de Bootstrap
        $('.carousel').carousel();
        //console.log("Cuantos productos encotro desde el renderizarProductosMarketing", categorias2)
        const contenedorProductosServicios = document.getElementById('tusProductosEnMarketing');
        contenedorProductosServicios.innerHTML = '';
        contenedorProductosServicios.style.maxHeight = '600px'; // Altura máxima del contenedor

        if (categorias2) {
            //console.log("Cuantos categorias2 encontro desde el renderizarProductosMarketing", categorias2.length)
            // Renderizar cada categoría
            Object.keys(categorias2).forEach(categoria => {
                const categoriaContainer = document.createElement('div');
                categoriaContainer.className = 'alert alert-success';
                categoriaContainer.innerHTML = `<h3 style="height: auto;margin:-1rem 0 !important; padding:0.5rem; width: auto" id="${categoria}">${categoria}</h3>`;
                contenedorProductosServicios.appendChild(categoriaContainer);

                // Contenedor de rejilla para los productos
                const productosRow = document.createElement('div');
                productosRow.className = 'row row-cols-1 row-cols-md-4 g-4'; // 4 columnas en dispositivos grandes, 1 columna en dispositivos pequeños
                // Renderizar cada producto de la categoría
                categorias2[categoria]
                    .sort((a, b) => {
                        const fechaA = new Date(a.date);
                        const fechaB = new Date(b.date);
                        return fechaB - fechaA; // Ordenar por fecha, el más reciente primero
                    })                 
                    .forEach(producto => {
                        const productoId = producto._id;
                        const cardHtml = `
<div class="col-12 col-md-6 col-lg-4 d-flex justify-content-center mb-4">
    <div class="card" id="${producto._id}" style="width: 100%; max-width: 400px;">
        <div id="carousel${producto._id}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner p-3">
                ${producto.rutaSimpleImg.map((img, index) => `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <img src="${img}" class="d-block rounded-3" alt="Producto" style="width:auto;height: 150px !important; object-fit: contain !important;">
                    </div>`).join('')}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carousel${producto._id}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel${producto._id}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
        <div class="card-body">
            <h4 class="card-title" id="${producto.nombreProducto}">${producto.nombreProducto}</h4>
            <div class="mb-4 d-flex justify-content-center align-items-center mt-4">
                <p class="mb-0"><strong>Quedan:</strong> ${producto.cantidad}</p>
                <span class="m-2"></span>
                <p class="mb-0"><strong>Precio:</strong> $${formatoMoneda(producto.precio)}</p>
            </div>
            <h5 clas="mt-3">Descripción</h5>
            <div align="left" class="product-description-container" style="height: 150px; overflow-y: auto;">
                <p>${producto.descripcion}</p>
            </div>
            <div class="text-center mt-3">
                ${producto.prodEnPromo ? `
                    <div class="alert alert-danger p-1 m-0" role="alert">
                        <p>Este producto ya está en promoción</p>
                    </div>
                ` : `
                    <button type="button" class="btn btn-primary add-to-cart" id="BTNPromocionar${producto._id}" data-producto-id2="${producto._id}">
                        <i class="fas fa-edit"></i>
                        Promocionar
                        <i class="fas fa-bullhorn"></i>
                    </button>
                `}
            </div>
        </div>
    </div>
</div>
                        `;
                        productosRow.innerHTML += cardHtml;
                    });
                    
                contenedorProductosServicios.appendChild(productosRow);
                // / aqui muestra el modal para diseñar la promo
                document.addEventListener('click', async function(event) {
                    const button = event.target.closest('.btn-primary.add-to-cart[id^="BTNPromocionar"]');
                    if (button) {
                        const productoId = button.getAttribute('data-producto-id2');
                        const producto = categorias[categoria].find(prod => prod._id === productoId);
    
                        if (producto) {
                            const modalElement2999125 = document.getElementById('promocionarProd');
                            const insertProd = modalElement2999125.querySelector('#insertarProductoPromocional');

                            //quita las etiquetas HTML para el textarea placeholder
                            function stripHTML(text) {
                                return text.replace(/<\/?[^>]+(>|$)/g, "");
                            }
                            let culoooo = producto.descripcion;
                            let descriptionBD = stripHTML(culoooo);

                            const cardHtmlProm = `
                                <div class="col" align="center" style="width: 100%; margin:0 ">
                                    <div class="card p-1 shadow-lg" id="${producto._id}" style="width: auto; margin: 0.3rem !important;">
                                    <div class="card-header mb-2">
                                        <h4>Nombre producto: ${producto.nombreProducto}</h4>
                                    </div>
                                        <div class="row g-0">
                                            <!-- Columna izquierda para carousel -->
                                            <div class="col-md-6">
                                                <div id="carousel${producto._id}" class="carousel slide" data-bs-ride="carousel">
                                                    <div class="carousel-inner">
                                                        ${producto.rutaSimpleImg.map((img, index) => `
                                                            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                                                <img src="${img}" class="d-block w-100" alt="Producto" style="height: 300px; object-fit: cover;">
                                                            </div>`).join('')}
                                                    </div>
                                                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel${producto._id}" data-bs-slide="prev">
                                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                                        <span class="visually-hidden">Previous</span>
                                                    </button>
                                                    <button class="carousel-control-next" type="button" data-bs-target="#carousel${producto._id}" data-bs-slide="next">
                                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                                        <span class="visually-hidden">Next</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <!-- Columna derecha para nombre de la promoción, descripción y detalles -->
                                            <div class="col-md-6">
                                                <div class="card-body">
                                                    <h3 class="card-title text-center"><strong>Nombre de la promoción</strong></h3>
                                                    <input class="form-control mb-3" name="nombrePromocion" placeholder="Nombre de la promoción:">

                                                    <div class="product-description-container mb-3" style="" >
                                                        <h6><strong>Descripción de la promoción</strong></h6>
                                                        <textarea style="height:350px !important" 
                                                            name="descripcionPromocion" 
                                                            id="descripPromoEdit" 
                                                            class="form-control ckeditor" 
                                                            placeholder="${descriptionBD}" 
                                                            align="left">
                                                        </textarea>
                                                    </div>

<h6><strong>Cantidad de productos disponible para la promoción</strong></h6>
<input id="cantidadDisponible" name="cantidadDisponible" class="form-control" placeholder="Quedan en stock: ${producto.cantidad}">
<small id="mensajeError" class="text-danger" style="display:none;"></small>



                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="row mb-3 text-center" style="padding: 1rem">
                                                    <fieldset class="col-12 mb-3 p-3 border rounded">
                                                        <legend>Promoción por cantidades. (Opcional)</legend>
<p>Ten cuidado al aplicar esta promoción en relación con el stock disponible. Es importante que la cantidad de productos que ofreces en promoción esté multiplicada por el número de unidades que deseas ofrecer, para asegurarte de que tienes suficiente inventario para satisfacer la demanda.</p>

                                                        <div class="row align-items-center">
                                                            <div class="col-5">
                                                                <label for="cantLlevar${producto._id}" class="form-label"><strong>Cantidad a llevar</strong></label>
                                                                <input type="text" name="cantLlevar" class="form-control" id="cantLlevar${producto._id}" placeholder="2">
                                                            </div>
                                                            <div class="col-2 text-center">
                                                                <label class="form-label"><strong>X</strong></label>
                                                            </div>
                                                            <div class="col-5">
                                                                <label for="cantPagar${producto._id}" class="form-label"><strong>Cantidad a pagar</strong></label>
                                                                <input type="text" name="cantPagar" class="form-control" id="cantPagar${producto._id}" placeholder="1">
                                                            </div>
                                                        </div>
                                                        <small id="mensajeErrorPRom" class="mt-2" style="display:none;"></small>
                                                    </fieldset>
                                                    <fieldset class="col-12 mb-3 p-3 border rounded">
                                                        <legend>Promoción por descuento</legend>
                                                        <div class="row">
                                                            <div class="col-4">
                                                                <label class="form-label"><strong>Precio</strong></label>
                                                                <input type="text" name="precio" class="form-control" placeholder="${formatoMoneda(producto.precio)}" readonly>
                                                            </div>
                                                            <div class="col-4">
                                                                <label for="descuento${producto._id}" class="form-label"><strong>Descuento (%)</strong></label>
        <input type="number" name="descuento" class="form-control" id="descuento${producto._id}" placeholder="0" min="0" max="100" oninput='actualizarPrecioFinal(${producto._id}, ${producto.precio})'>
                                                            </div>
                                                            <div class="col-4">
                                                                <label for="precioFinal${producto._id}" class="form-label"><strong>Precio Final con descuento</strong></label>
                                                                <input type="text" name="precioFinal" class="form-control" id="precioFinal${producto._id}" placeholder="${formatoMoneda(producto.precio)}" readonly>
                                                            </div>
                                                        </div>
                                                    </fieldset>
                                                </div>
                                                <fieldset class="row mb-3 p-3 border rounded">
                                                    <legend>Tiempo de duración</legend>
<div class="col-6 mb-3">
    <label for="fechaInicio${producto._id}" class="form-label">Fecha de inicio</label>
    <input type="date" id="fechaInicio${producto._id}" class="form-control">
    <small id="mensajeFecha${producto._id}" class="text-danger" style="display:none;"></small>
</div>

                                                    <div class="col-6 mb-3">
                                                        <label for="fechaFin${producto._id}" class="form-label">Fecha de finalización</label>
                                                        <input type="date" id="fechaFin${producto._id}" class="form-control">
                                                    </div>
                                                </fieldset>
                                                <div class="card-footer text-center mb-3">
                                                    <button type="button" class="btn btn-primary" id="BTNConfPromo${producto._id}" data-producto-id="${producto._id}">Confirmar promoción</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                            // Inyectar el HTML dinámico en el div #insertarProductoPromocional
                            insertProd.innerHTML = cardHtmlProm;
                            // Mostrar el modal
                            const modal256165 = new bootstrap.Modal(modalElement2999125);
                            modal256165.show();
                            let editorInstanceArmarPromo = null
                            // Función para crear el editor del textarea
                            function inicializarEditorPRomo(selector) {
                                ClassicEditor.create(document.querySelector(selector))
                                    .then(editor => {
                                        // Guardar la instancia del editor
                                        editorInstanceArmarPromo = editor;
                                        // Establecer la altura del contenedor del editor
                                        const editorElement = editor.ui.view.editable.element;
                                        editorElement.style.height = '200px';
                                    })
                                    .catch(console.error);
                            }
                            // Inicializar el editor con el selector adecuado
                            inicializarEditorPRomo('#descripPromoEdit');

                            // Llamar a la función para actualizar el precio final
                            await actualizarPrecioFinal(producto._id, producto.precio);
    

                            // Agregar el evento 'input' al campo de cantidad disponible
                            document.getElementById('cantidadDisponible').addEventListener('input', function() {
                                verificarCantidad(producto.cantidad);
                            });
                            let cantidadDisponible = 0
                            function verificarCantidad(cantidadStock) {
                                // Obtener el valor del input
                                cantidadDisponible = document.getElementById('cantidadDisponible').value;
                                const mensajeError = document.getElementById('mensajeError');

                                // Convertir el valor ingresado a número
                                const cantidadIngresada = parseInt(cantidadDisponible, 10);

                                // Verificar si el valor es un número válido y si es mayor que la cantidad en stock
                                if (isNaN(cantidadIngresada) || cantidadIngresada > cantidadStock) {
                                    // Mostrar el mensaje de error si el valor es mayor al stock o no es un número
                                    mensajeError.style.display = 'block';
                                    mensajeError.textContent = `No puedes poner más productos en promoción que los disponibles en stock (${cantidadStock}).`;
                                } else {
                                    // Ocultar el mensaje si todo está correcto
                                    mensajeError.style.display = 'none';
                                }
                            }

                            // Agregar el evento 'input' al campo de cantidad disponible usando 'name'
                            document.getElementsByName('cantLlevar')[0].addEventListener('input', function() {
                                verificarPromos2x1(cantidadDisponible);
                            });

                            function verificarPromos2x1(cantidadDisponible) {
                                // Obtener el valor del input
                                const cantidadProm = document.getElementsByName('cantLlevar')[0].value;
                                const mensajeError = document.getElementById('mensajeErrorPRom');

                                // Convertir el valor ingresado a número
                                const cantidadIngresada = (cantidadDisponible / parseInt(cantidadProm, 10)).toFixed(2);

console.log("¿Cuántas promos armo?", cantidadIngresada);
mensajeError.innerHTML = ""
// Verificar si el valor es mayor que cero y es un número entero
// Verificar si el valor es un entero (sin parte decimal)
if (cantidadIngresada % 1 === 0) {
    // Mostrar el mensaje indicando cuántas promociones se van a ofrecer si el valor es un número entero
    mensajeError.style.display = 'block';
    mensajeError.style.color = '#28a745'; // Un tono de verde específico
    mensajeError.textContent = `Según la cantidad de productos y la promoción por cantidad, vas a ofrecer (${cantidadIngresada}) promociones.`;
} else {
    // Mostrar el mensaje de error si el valor tiene decimales
    mensajeError.style.display = 'block';
    mensajeError.style.color = 'red'; // Un tono de verde específico
    mensajeError.textContent = `Según la cantidad de productos y la promoción por cantidad, vas a ofrecer (${cantidadIngresada}) promociones, es decir, hay una promoción incompleta. Por favor ajusta la cantidad a un número entero.`;
}






                            }

                            // Agregar evento al campo de fecha de inicio para verificar que no sea una fecha anterior a la actual
                            document.getElementById(`fechaInicio${producto._id}`).addEventListener('input', function() {
                                verificarFechaInicio(producto._id);
                            });

                            // Función para verificar la fecha de inicio
                            function verificarFechaInicio(productoId) {
                                // Obtener la fecha de hoy en formato YYYY-MM-DD
                                const hoy = new Date().toISOString().split('T')[0];

                                // Obtener el valor del input de fecha de inicio
                                const fechaInicio = document.getElementById(`fechaInicio${productoId}`).value;

                                // Obtener el elemento del mensaje de error
                                const mensajeError = document.getElementById(`mensajeFecha${productoId}`);

                                // Verificar si la fecha de inicio es anterior a la fecha de hoy
                                if (fechaInicio < hoy) {
                                    // Mostrar el mensaje de error si la fecha es anterior a la actual
                                    mensajeError.style.display = 'block';
                                    mensajeError.textContent = `No puedes seleccionar una fecha anterior a la actual (${hoy}).`;
                                } else {
                                    // Ocultar el mensaje de error si la fecha es válida
                                    mensajeError.style.display = 'none';
                                }
                            }

                            
                            // Agregar event listener al botón confirmar para hacer la promo
                            document.getElementById(`BTNConfPromo${producto._id}`).addEventListener('click', function() {
                                // Mostrar el modal loading
                                mostrarModalLoading();
                                // Función para obtener el contenido del editor
                                function obtenerContenidoEditor() {
                                    if (editorInstanceArmarPromo) {
                                        const contenidoHTML = editorInstanceArmarPromo.getData();
                                        console.log("Contenido del editor:", contenidoHTML);
                                        return contenidoHTML;
                                    } else {
                                        console.log("El editor aún no está inicializado.");
                                        return null;
                                    }
                                }
                                const descripcionPromocion = obtenerContenidoEditor()
                                const nombrePromocion = document.querySelector('input[name="nombrePromocion"]').value;
                                const descuento = document.querySelector('input[name="descuento"]').value;
                                const precioFinal = document.querySelector('input[name="precioFinal"]').value;
                                const cantidadDisponible = document.querySelector('input[name="cantidadDisponible"]').value;
                                const fechaInicio = document.getElementById(`fechaInicio${producto._id}`).value;
                                const fechaFin = document.getElementById(`fechaFin${producto._id}`).value;
                                const cantLlevar = document.querySelector('input[name="cantLlevar"]').value;
                                const cantPagar = document.querySelector('input[name="cantPagar"]').value;
    
                                if (!nombrePromocion || !descripcionPromocion || !precioFinal || !cantidadDisponible || !descuento) {
                                    mostrarAlerta('Por favor, complete todos los campos requeridos.');
                                    return;
                                }
    
                                // Crear el objeto dataPromo
                                const dataPromo = {
                                    nombreProd:producto.nombreProducto,
                                    urlImg:producto.rutaSimpleImg,
                                    nombrePromocion: nombrePromocion,
                                    descripcionPromocion: descripcionPromocion,
                                    precio:producto.precio,
                                    precioFinal: precioFinal,
                                    cantidadDisponible: cantidadDisponible,
                                    descuento: descuento,
                                    cantLlevar: cantLlevar,
                                    cantPagar: cantPagar,
                                    fechaInicio: fechaInicio,
                                    fechaFin: fechaFin,
                                    idOwner: idOwner,
                                    idProd: producto._id,
                                    categoria:producto.categoria
                                };
                                //console.log("Que producto quiere mandar al server para promocionar???", dataPromo)
                                const options15458 = {
                                    method: 'POST', // Método de la solicitud
                                    headers: {
                                        'Content-Type': 'application/json', // Tipo de contenido de la solicitud
                                        'Authorization': `Bearer ${jwToken}`
                                    },
                                    body: JSON.stringify(dataPromo) // Convertir el objeto de datos a formato JSON
                                }; 
    
                                // oculta el modal de promocion
                                const modalHide1 = "cerrarModalPromos"
                                ocultarModalCpanel(modalHide1)
                                // const modalHide2 = "insertarProductoPromocional"
                                // ocultarModalCpanel(modalHide2)
    
                                // Realizar la solicitud Fetch
                                fetch(`${endpoints[81]}`, options15458)
                                    .then(async response => {
                                        // Ocultar el modal loading
                                        ocultarModalLoading();
                                        if (response.ok) {
                                            return response.json(); // Convertir la respuesta a JSON
                                        } else {
                                            console.error('Error al enviar los datos:', response);
                                        }
                                    })
                                    .then(data => {
                                        if (data && data.success === false) {
                                            mostrarAlerta(data.message);
                                        } else {
                                            mostrarExito(data.message); // Mostrar la respuesta en un alert
                                            setTimeout(async () => {
                                                await actualizarData();
                                            }, 5000); // 1000 milisegundos = 1 segundo
                                        }
                                        setTimeout(async () => {
                                            await actualizarData();
                                        }, 3000); // 1000 milisegundos = 1 segundo
                                    })
                                    .catch(error => {
                                        console.error('Error en la solicitud Fetch: En crear la promoción', error);
                                        mostrarAlerta('Error en la solicitud Fetch En crear la promoción',error);
                                        setTimeout(async () => {
                                            await actualizarData();
                                        }, 1000); // 1000 milisegundos = 1 segundo
                                    });
                            });
                        }
                    }
                });
            });
        }
        else{
            console.log("*******no hay categorias2i en marketing para hacer promos",categorias2)
        }
    }
    // busca, revisa y renderiza todos los productos que se venden en el ecommerce
    productosMarketig(ownerProducts);


    //funciones para obtener y renderizar todos las PROMOCIONES y sus estados en Cpanel
    function obtenerPromociones(ownerPromos) {
        //console.log("Cuantos productos encotro desde el fronen", ownerProducts.length)
        ownerPromos.forEach((producto) => {
            const categoria = producto.categoria;
            // Agrupar productos por categoría
            if (!categorias3[categoria]) {
                categorias3[categoria] = [];
            }
            categorias3[categoria].push(producto);
        });

        // Renderizar productos y categorías
        renderizarPromociones(categorias3);

        // Inicializar todos los carruseles de Bootstrap
        $('.carousel').carousel();

    }

    function renderizarPromociones(categorias3) {
        const contenedorPromos = document.getElementById('estadosPromos23');
        contenedorPromos.innerHTML = '';
        // contenedorPromos.style.maxHeight = '600px';
        Object.keys(categorias3).forEach(categoria => {
            if (categorias3[categoria].length > 0) {
                const productosRow = document.createElement('div');
                productosRow.className = 'container-xxl row w-100 p-0 m-0 d-flex flex-wrap';
                categorias3[categoria]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .forEach(producto => {
                        const productoId = producto._id;
    
                        function formatoFecha(fecha) {
                            const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
                            return new Date(fecha).toLocaleDateString('es-ES', opciones);
                        }
    
                        function calcularDiasRestantes(fechaFin) {
                            const hoy = new Date();
                            const fechaFinal = new Date(fechaFin);
                            const diferencia = fechaFinal - hoy;
                            return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
                        }
    
                        const promRestantes = producto.cantidadDisponible - producto.cantidadPromoVendidas;
                        let cardHtmlPromo = {} // no sacar se le aplican efectos
                        if (promRestantes <= 1) {
                            const infoMmensagem = `Te queda 1 o menos promociones de: <br> ${producto.nombrePromocion}`
                            //mostrarAlerta(infoMmensagem)
                            const fechaActual = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                            const datInfo = {
                                idInfo : productoId,
                                Date: fechaActual,
                                positivo:false,
                                infoMensaje: infoMmensagem
                            };
                            infoDiario(datInfo)
                        }


                        // cardP es par buscarlo en el click
                        cardHtmlPromo = `
                            <div class="col-12 col-sm-6 col-md-4 mb-4">
                                <div class="card">
                                    <div class="cardP shadow-sm rounded">
                                        <div class="card-header">
                                            <h4 class="card-title text-center nomPRom">${producto.nombrePromocion}</h4>
                                        </div>
                                        <div id="${productoId}" class="card-body p-3" align="left">
                                            <div id="carousel${productoId}" class="carousel slide" data-bs-ride="carousel">
                                                <div class="carousel-inner rounded p-3">
                                                    ${producto.rutaSimpleImg.map((img, index) => `
                                                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                                            <img src="${img}" alt="Producto" class="d-block" style="height: 150px !important; height:auto; object-fit: contain;">
                                                        </div>`).join('')}
                                                </div>
                                                <a class="carousel-control-prev" href="#carousel${productoId}" role="button" data-bs-slide="prev">
                                                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                                    <span class="visually-hidden">Previous</span>
                                                </a>
                                                <a class="carousel-control-next" href="#carousel${productoId}" role="button" data-bs-slide="next">
                                                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                                    <span class="visually-hidden">Next</span>
                                                </a>
                                            </div>
                                            <fieldset class="border rounded p-3">
                                                <h5 class="w-auto px-2">Descripción de la promo:</h5>
                                                <fieldset style="height: 150px; overflow-y: auto; overflow-x: hidden;">
                                                    <p class="mb-2">${producto.descripcionPromocion}</p>
                                                </fieldset>
                        
                                                <h5>Categoria del producto:</h5>
                                                <p class="mb-2">${producto.categoria}</p>
                        
                                                <h5>Nombre del producto:</h5>
                                                <p class="mb-2">${producto.nombreProducto}</p>
                        
                                                <h5>Precio:</h5>
                                                <p class="mb-2 text-success">$${formatoMoneda(producto.precio)}</p>
                        
                                                <h5>Descuento:</h5>
                                                <p class="mb-2 text-danger">${producto.descuento}%</p>
                        
                                                <h5>Precio Final:</h5>
                                                <p class="mb-2 text-success">$${formatoMoneda(producto.precio, producto.descuento)}</p>
                        
                                                <h5>Promo en cantidad:</h5>
                                                <p class="mb-3">
                                                    ${producto.cantLlevar && producto.cantPagar ? `${producto.cantLlevar} X ${producto.cantPagar}` : "NO tiene promo por cantidades"}
                                                </p>
                        
                                                <h5>Cantidad de promos ofrecidas:</h5>
                                                <p class="mb-2">${producto.cantidadDisponible}</p>
                        
                                                <h5>Promos vendidas:</h5>
                                                <p class="mb-2">${producto.cantidadPromoVendidas}</p>
                        
                                                <h5>Restan por vender:</h5>
                                                <p class="mb-2 promosRestantesID">${promRestantes}</p>
                        
                                                <div class="d-flex justify-content-between mt-3">
                                                    <div>
                                                        <h5>Fecha Inicio:</h5>
                                                        <p>${formatoFecha(producto.fechaInicio)}</p>
                                                    </div>
                                                    <div>
                                                        <h5>Fecha Fin:</h5>
                                                        <p class="fecha-fin">${formatoFecha(producto.fechaFin)}</p>
                                                    </div>
                                                </div>
                        
                                                <h5>Días que restan:</h5>
                                                <p>${calcularDiasRestantes(producto.fechaFin)}</p>
                                            </fieldset>
                        
                                            <div class="text-center mt-3 p-3 border rounded" style="background-color: #f1f1f1;">
                                                <h2 class="mb-2">Link a redes sociales</h2>
                                                <div>
                                                    <h3 id="socialLink${productoId}" style="word-break: break-all;">
                                                        <a href="${producto.promoLink}" class="text-decoration-none text-dark">${producto.promoLink}</a>
                                                    </h3>
                                                </div>
                                                <i class="fas fa-copy" id="portaPapers${productoId}" style="cursor: pointer;" data-promo-id="${productoId}"></i>
                                            </div>
                        
                                            <div class="text-center mt-3">
                                                <button type="button" class="btn btn-danger add-to-cart" id="BTNEliminarPromo${productoId}" data-producto-id="${productoId}">
                                                    <i class="fas fa-trash-alt" style="font-size: 2rem;"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;



                        productosRow.innerHTML += cardHtmlPromo;
                    });
                    contenedorPromos.appendChild(productosRow);
            } else {
                contenedorPromos.innerHTML = '<h4>No tienes promociones disponibles. <br> Ve a la solapa Promociones & Descuentos y arma una promo e impulsa tus ventas. <br> También puedes contratar nuestros servicios de Marketing Digital & Community Manager.</h4>';
            }
        });
        if (ownerPromos.length >= 1) {
                

            // Función para averiguar las promos vencidas, enviar al servidor y aplicar efectos
            function aplicarEfectosTarjetas() {
                document.querySelectorAll('.cardP').forEach(card => {
                    // Extraer la fecha de fin y calcular los días restantes
                    const fechaFinElement  = card.querySelector('.fecha-fin');

                    const productoId = card.querySelector('[data-producto-id]').dataset.productoId;

                    let nombrePRom = card.querySelector('.nomPRom'); 
                    if (nombrePRom) { nombrePRom = nombrePRom.innerText; }
                    
                    let elementoPromRest = card.querySelector('.promosRestantesID'); 
                    let cantidadPromRest = elementoPromRest ? Number(elementoPromRest.innerText) || 0 : 0;

                    const fechaFin = fechaFinElement.textContent.trim(); // Asegurarse de que no haya espacios en blanco
                    const diasRestantes = calcularDiasRestantes(fechaFin);

                    // Mostrar alerta si los días restantes son 10 o menos
                    if (cantidadPromRest <= 2 || diasRestantes <= 3 && diasRestantes >= 0 ) {
                        //console.log("Tiene menos de 2 promos o ya vencio en fecha")
            // mostrarAlerta(`Hay una promoción que está por vencer en ${diasRestantes} días.`);
            //mostrarAlerta(infoMmensagem)
            const fechaActual = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const datInfo = {
            idInfo : productoId,
            Date: fechaActual,
            positivo:false,
            infoMensaje: `${cantidadPromRest <= 1 ? `La promoción ${nombrePRom} apenas tiene ${cantidadPromRest} producto(s).` : `La promoción ${nombrePRom} está por vencer en ${diasRestantes} días.`}`
            };
            infoDiario(datInfo);
                    }

                    // Aplicar el estilo de "promo vencida" si los días restantes son 0 o negativos
                    if (cantidadPromRest <= 0 || diasRestantes <= 0) {
                        //console.log("ya noo tiene promos o ya vencio en fecha")
                        const alertaDiv = document.createElement('div');
                        alertaDiv.className = 'alerta-vencida';
                        alertaDiv.textContent = '¡Promo Vencida!';
                        card.style.position = 'relative'; // Asegurarse de que la tarjeta tenga posición relativa
                        card.appendChild(alertaDiv);

                        // Endpoint para marcar la promoción como vencida dataProm=false
                        marcarPromoVencida(productoId);

            // mostrarAlerta(`Hay una promoción que está por vencer en ${diasRestantes} días.`);
            //mostrarAlerta(infoMmensagem)
            const fechaActual = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const datInfo = {
            idInfo : productoId,
            Date: fechaActual,
            positivo:true,
            infoMensaje: `${cantidadPromRest <= 1 ? `¡Felicitaciones la promoción ${nombrePRom} se agoto!. <br> ¡Aprovecha y Crea otra ya!` : `La promoción ${nombrePRom} está por vencer en ${diasRestantes} días.`}`
            };
            infoDiario(datInfo);
                    }
                });
            }

            //    // Endpoint para marcar la promoción como vencida dataProm=false
            async function marcarPromoVencida(idPromo) {
                //console.log("ID de la promo a enviar:", idPromo);

                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwToken}` // Asegúrate de que `jwToken` esté correctamente definido
                    },
                    body: JSON.stringify({ idPromo }) // Enviar el ID de la promo como un objeto
                };

                try {
                    //console.log("Porque no lo encuentraaaas endpoints[195]",endpoints[195])
                    const response = await fetch(`${endpoints[195]}`, options);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            //mostrarInfo(data.message); // Mostrar el mensaje de éxito
                        } else {
                            console.error('Error en la respuesta del servidor:', data.message);
                            mostrarAlerta(data.message); // Mostrar el mensaje de error
                        }
                    } else {
                        console.error('Error en la solicitud fetch marcarPromoVencida:', response.statusText);
                        mostrarAlerta(`Error en la solicitud fetch marcarPromoVencida: ${response.statusText}`); // Mostrar un mensaje de error
                    }
                } catch (error) {
                    console.error('Error en la solicitud fetch marcarPromoVencida:', error);
                    mostrarAlerta(`Error en la solicitud fetch marcarPromoVencida: ${error.message}`); // Mostrar un mensaje de error
                }
            }

            // Llamar a la función para aplicar efectos después de que las tarjetas sean renderizadas
            aplicarEfectosTarjetas();



            // Eliminar la promo creada
            document.addEventListener('click', function(event) {
                // Verificar si se hizo clic en el ícono de eliminar
                if (event.target.closest('.btn-danger.add-to-cart')) {
                    // Buscar el botón padre del ícono
                    const button = event.target.closest('button.add-to-cart');
                    
                    // Verificar si se encontró el botón y obtener el data-producto-id
                    if (button) {
                        const idProd = button.getAttribute('data-producto-id');
                        console.log("ID del producto a eliminar:", idProd);
                        
                        const mensajeOptions = "¿Deseas eliminar esta promoción?";
                        const rechaza = function() {}; // Función en caso de cancelar la eliminación

                        // Función para eliminar el producto
                        const confirma = async function eliminarProducto() {
                            // Configurar las opciones de la solicitud Fetch
                            const options4384848 = {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${jwToken}` // Asegúrate de que `jwToken` esté correctamente definido
                                },
                                body: JSON.stringify({ idProducto: idProd }) // Enviar el ID del producto como un objeto
                            };

                            // Mostrar el modal de carga
                            mostrarModalLoading();

                            // Realizar la solicitud Fetch
                            //const endpoints = JSON.parse(sessionStorage.getItem('endPointsIdTokens'));
                            fetch(`${endpoints[19]}`, options4384848)
                                .then(async response => {
                                    // Ocultar el modal de carga
                                    await ocultarModalLoading();

                                    if (response.ok) {
                                        return response.json();
                                    } else {
                                        console.error('Error al enviar los datos:', response);
                                    }
                                })
                                .then(data => {
                                    if (data && data.success === false) {
                                        mostrarAlerta(data.message); // Mostrar el mensaje de error
                                        setTimeout(async () => {
                                            await actualizarData();
                                        }, 1000);
                                    } else {
                                        mostrarExito(data.message); // Mostrar el mensaje de éxito
                                        setTimeout(async () => {
                                            await actualizarData();
                                        }, 1000);
                                    }
                                })
                                .catch(error => {
                                    setTimeout(() => {
                                        actualizarData(); // Recargar los datos en caso de error
                                    }, 1000);
                                    console.error('Error en la solicitud Fetch: eliminarProducto', error);
                                    mostrarAlerta(`Error en la solicitud Fetch eliminarProducto${error}`); // Mostrar un mensaje de error
                                });
                        };

                        // Mostrar la confirmación antes de eliminar
                        confirmOptions(mensajeOptions, confirma, rechaza);
                    }
                }
            });

            // Copiar el enlace al portapapeles
            document.addEventListener('click', function(event) {
                if (event.target.closest('.fas.fa-copy[id^="portaPapers"]')) {
                    const button = event.target.closest('.fas.fa-copy[id^="portaPapers"]');
                    const idProd = button.getAttribute('data-promo-id');
                    // Función para copiar el enlace al portapapeles
                    const copyText = document.getElementById(`socialLink${idProd}`).textContent;
                    navigator.clipboard.writeText(copyText).then(function() {
                        mostrarExito('¡Enlace copiado al portapapeles!');
                    }).catch(function(err) {
                        console.error('Error al copiar el enlace: ', err);
                    });
                }
            });


            // Función para calcular los días restantes en que vencen las promos
            function calcularDiasRestantes(fechaFin) {
                //console.log("Entro a calcular los días restantes");

                const hoy = new Date();
                const [dia, mes, año] = fechaFin.split('/'); // Divide la fecha en partes
                const fechaFinal = new Date(`${año}-${mes}-${dia}`); // Reordena la fecha a formato 'yyyy-mm-dd'
                const diferencia = fechaFinal - hoy;

                return Math.ceil(diferencia / (1000 * 60 * 60 * 24)); // Diferencia en días
            }
        }
    }// termina function rendder promos

    // busca las promociones
    if (ownerPromos.length >= 1) {
        obtenerPromociones(ownerPromos)
    }

    // Función para actualizar el precio final de los productos
    function actualizarPrecioFinal(id, precioOriginal) {
        console.log("Entro a la funcion calcular descuento", id, precioOriginal)
        const descuentoInput = document.getElementById(`descuento${id}`);
        const precioFinalInput = document.getElementById(`precioFinal${id}`);
    
        const calcularPrecioFinal = () => {
            const descuento = parseFloat(descuentoInput.value) || 0;
            const precioFinal = precioOriginal - (precioOriginal * descuento / 100);
            precioFinalInput.value = formatoMoneda(precioFinal);
        };
    
        descuentoInput.addEventListener('input', calcularPrecioFinal);
        calcularPrecioFinal(); // Calcular el precio final inicial
    }

    // Inicialización de los modales (debe realizarse después de cargar el contenido dinámico)
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar modal de loading
        const modalLoading = new bootstrap.Modal(document.getElementById('modalLoading'));
        // Inicializar modal de promocionar producto
        const modalPromocionar = new bootstrap.Modal(document.getElementById('promocionarProd'));

        // Ejemplo: Cerrar modal de loading al hacer clic en el botón de cerrar
        document.getElementById('btnCerrarModalLoading').addEventListener('click', function() {
            modalLoading.hide();
        });

        // Ejemplo: Cerrar modal de promocionar producto al hacer clic en el botón de cerrar
        document.getElementById('btnCerrarModalPromocionar').addEventListener('click', function() {
            modalPromocionar.hide();
        });
    });

    // Función para dar formato de moneda a un valor
    function formatoMoneda(valor) {
        valor = Number(valor);
        // if (isNaN(valor)) {
        //     console.error("Error: El valor no es un número válido");
        //     return null;
        // }
        return `${valor.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }

    // funcion para obtener los datos generales del owner y su comercio
    async function renderizaDatosatosOwner() {
        //console.log("que cliente encontro en el MODAL DE DATOS DEL CLIENTE ECOMM??",dataOwner)
        const idOwner = dataOwner._id
        const nombre  = dataOwner.nombre
        const email   = dataOwner.email
        if (dataOwner) {
                // Renderizar la plantilla con los datos del cliente
                const nombreOwner = `
                <h3 class="modal-title" id="modalActiveLabel">Hola, ${nombre} estos son tus datos generales.</h3>
                `
                const completaTusDatos = `
                <h5 align="center" class="modal-title" id="modalActiveLabel">
                    Hola ${nombre || email}.
                    <br>
                    Para continuar debemos conocernos un poquito.
                    <br> 
                    Empecemos completando estos datos.</h5>
                `
                // Crear el nuevo elemento div y renderizarlo en el DOM la imagen del cliente
                const renderDataCli = document.getElementById("ownerInfo");
                const dtaConName = document.getElementById("ownerInfoName");
                const html = `
<div class="row m-4" align="left">
    <div class="col image-section m-2" align"center">
        <label for="fileInput951357">
            <img id="cambiarImagen99798798" src="${pathLogo}" alt="" style="cursor:pointer">
            <br><br>
            <p style="color: black;">Click en la imagen para cambiarla.</p>
        </label>
        <input id="fileInput951357" type="file" hidden>
    </div>
    <div class="col">
        <p><strong>Nombre completo:</strong>              <br>${nombre} ${apellido}</p>
        <p><strong>Tipo Documento:</strong>               <br>${tipoDocu} Nro: ${numDocu}</p>
        <p><strong>Nombre de tu comercio online:</strong> <br>${ecommerceName}</p>
        <p><strong>Tipo Doc. Fiscal:</strong>             <br>${tipoDocuFiscal} Nro: ${numDocuFiscal}</p>
        <p><strong>Membresía:</strong>                    <br>${tipoMembresia}</p>
    </div>
</div>

                `;

                const htmlSindata = `
                <div align"center" class="card p-4 d-flex justify-content-center align-items-center vh-100">
                    <div class="p-4 shadow-sm" style="overflow: hidden;">
                        <h5 class="text-center">Asegúrate bien de los datos que vas a agregar, porque NO pueden editarse.</h5>
                        <div class="w-100 d-flex align-items-center justify-content-center mb-3">
                            <div class="text-center me-3" hidden>
                                <label for="fileInput951357">
                                    <img id="cambiarImagen99798798" src="${pathLogo}" alt="" height="200" width="200" class="rounded-circle" style="cursor: pointer;">
                                    <p class="text-dark">Agrega tu logo aquí <br> (1 MB max).</p>
                                </label>
                                <input id="fileInput951357" type="file" hidden>
                            </div>
                        </div>
                        <div class="w-100">
                            <form>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="nombre33" placeholder="Ingrese su nombre" required>
                                            <label for="nombre33">Nombre</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="apellido33" placeholder="Ingrese su apellido" required>
                                            <label for="apellido33">Apellido</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-floating">
                                            <select class="form-select" id="tipoDocumento" required>
                                                <option value="" disabled selected>Seleccione un tipo de documento</option>
                                                <option value="DNI">DNI</option>
                                                <option value="Pasaporte">Pasaporte</option>
                                                <option value="C.I.">Cédula de Identidad</option>
                                                <option value="other">Otro</option>
                                            </select>
                                            <label for="tipoDocumento">Tipo de Documento</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="numDocu" placeholder="Número de Documento" required>
                                            <label for="numDocu">Número de Documento</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-floating">
                                            <select class="form-select" id="tipoDocumentoFiscal" required>
                                                <option value="" disabled selected>Seleccione un tipo de documento fiscal</option>
                                                <option value="CUIT">CUIT</option>
                                                <option value="RUC">RUC</option>
                                                <option value="RUT">RUT</option>
                                                <option value="other">Otro</option>
                                            </select>
                                            <label for="tipoDocumentoFiscal">Tipo de Documento Fiscal</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="numDocuFiscal" placeholder="Número de Documento Fiscal" required>
                                            <label for="numDocuFiscal">Número de Documento Fiscal</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-floating">
                                        <input type="text" class="form-control" id="nomCom33" placeholder="Nombre del comercio" required>
                                        <label for="nomCom33">Nombre del Comercio</label>
                                    </div>
                                    <p id="alertContainer" class="text-danger"></p>
                                    <p id="messageContainer" class="mt-3" hidden></p>
                                </div>
                                <button id="botonito122987" type="button" class="btn btn-primary btn-block">Enviar</button>
                            </form>
                        </div>
                    </div>
                </div>
                `;
                
                if (nombre) {
                    dtaConName.innerHTML = html;
                    // Insertar el HTML renderizado en el elemento deseado en tu página
                    const lugarNombre =  document.getElementById("datosDueno22")
                    lugarNombre.innerHTML = "";
                    lugarNombre.innerHTML = nombreOwner;
                } 
                else {
                    renderDataCli.className = "col-lg-10"
                    renderDataCli.innerHTML = htmlSindata;
                    //console.log("hizo click")
                    // Insertar el HTML renderizado en el elemento deseado en tu página
                    const lugarNombre =  document.getElementById("datosDueno22")
                    lugarNombre.innerHTML = ""
                    lugarNombre.innerHTML = completaTusDatos;
                    // Seleccionar el formulario
                    const clickBotonito22 = document.getElementById("botonito122987");
                    clickBotonito22.addEventListener("click", async (event) => {
                        event.preventDefault(); // Evitar que el formulario se envíe de forma convencional
                        // Revisamos que el nombre del comercio NO esté repetido (sin importar mayúsculas/minúsculas y eliminando todos los espacios).
                        const ecommerceName89 = document.getElementById("nomCom33").value.toLowerCase().replace(/\s+/g, '');
                        const cheNameEcom = basicData.urlsOwners.some(e => e.urlOwner && e.urlOwner.toLowerCase().replace(/\s+/g, '') === ecommerceName89);

                        //console.log("Ya esta registrado el nombre dle comercio????????????", cheNameEcom)
                        // revisa si el nombre del comercio esta registraod en la web
                        if (tipoMembresia === "premium") {
                            if (!cheNameEcom) {
                                const isURLAvailable = await checkURLAvailability(ecommerceName89);
                                if (!isURLAvailable) return;
                            } else {
                                mostrarAlerta("El nombre de tu comercio y URL ya están ocupados. Por favor, elige otra.");
                                return
                            }
                            async function checkURLAvailability(url) {
                                const formattedUrl = url.startsWith('http') ? url : 'http://' + url;
                            
                                try {
                                    const response = await fetch(formattedUrl, { method: 'HEAD' });
                                    const isAvailable = !response.ok;
                                    console.log("aakpwdfkofwokjdnfcjodnfjornfgvnejrfvnjfnvjntfgjovb", isAvailable)
                                    updateUI(isAvailable, url);
                                    return false;
                                } catch {
                                    updateUI(true, url);
                                    return true;
                                }
                            }
                            function updateUI(isAvailable, url) {
                                const alertContainer = document.getElementById('alertContainer');
                                const messageContainer = document.getElementById('messageContainer');
                                
                                alertContainer.innerHTML = `<div class="alert alert-${isAvailable ? 'success' : 'danger'}" role="alert">La URL ${isAvailable ? 'está disponible' : 'ya está ocupada'}. Puedes registrarla.</div>`;
                                messageContainer.innerHTML = `<p class="text-${isAvailable ? 'success' : 'danger'}">La URL <strong>${url}</strong> ${isAvailable ? 'está disponible' : 'ya está ocupada'}. Puedes registrarla.</p>`;
                            }
                        }
                        else{
                            // Si encuentra un nombre de tienda repetido, muestra la alerta
                            if (cheNameEcom) {
                                mostrarAlerta("Este nombre de tienda online ya fue elegido, por favor elije otro.");
                                // No retorna, solo muestra la alerta para que continúe el flujo del código
                                return
                            } 
                        }
                        //console.log("Lo encontro si o no??????????????",ecommerceName89,   basicData.urlsOwners, cheNameEcom)
                        // Recoger los valores de los campos del formulario
                        const ecommerceName33 = document.getElementById("nomCom33").value
                        const nombre33 = document.getElementById("nombre33").value;
                        const apellido33 = document.getElementById("apellido33").value;
                        const tipoDocu = document.getElementById("tipoDocumento").value;
                        const numDocu = document.getElementById("numDocu").value;
                        const tipoDocuFiscal = document.getElementById("tipoDocumentoFiscal").value;
                        const numDocuFiscal = document.getElementById("numDocuFiscal").value;

                        // Crear un objeto FormData para manejar el envío del archivo
                        const data = {nombre:nombre33, apellido:apellido33, ecommerceName:ecommerceName33, numDocu, tipoDocu, idOwner, tipoDocuFiscal, numDocuFiscal}
                        //console.log("hizo click dentro data", data);
                        // revisa si falta algunn dato
                        function verificarDatos(data) {
                            for (const key in data) {
                                if (!data[key]) {
                                    mostrarAlerta(`Verifica, falta el dato: ${key}`);
                                    return false;
                                }
                            }
                            return true;
                        }
                        
                        // Uso de la función antes de enviar los datos
                        if (!verificarDatos(data)) {
                            // Falta algún dato, no envíes el formulario
                            //console.log('Falta algún dato.');
                            return; // Esto evitará que se continúe con el envío
                        }

                        // Obtener la URL del endpoint del servidor desde el almacenamiento local
                        //const endpoints = JSON.parse(sessionStorage.getItem('endPointsIdTokens'));

                        console.log("FRONEN A que endpint quieren alcanzar????????", endpoints[55] )
                        try {
                            const response = await fetch(`${endpoints[55]}`, 
                                {
                                method: 'POST',
                                body: JSON.stringify(data),
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${jwToken}`
                                }	
                            });

                            // Obtener la respuesta del servidor
                            const result = await response.json();
                
                            // Mostrar un mensaje según la respuesta del servidor
                            if (response.ok) {
                                mostrarExito("Información actualizada con éxito.");
                                // Espera 2 segundos y luego recarga la página
                                setTimeout(async function() {
                                    // Puedes redirigir a otra página o actualizar la página actual aquí
                                    //location.reload();
                                    await actualizarData()
                                }, 2000); // 2000 milisegundos = 2 segundos
                            } 
                            else {
                                mostrarAlerta("Error al actualizar la información: " + result.message);
                                setTimeout(async function() {
                                    // Puedes redirigir a otra página o actualizar la página actual aquí
                                    //location.reload();
                                    await actualizarData()
                                }, 2000); // 2000 milisegundos = 2 segundos
                            }
                        } catch (error) {
                            console.error("Error al enviar la solicitud:", error);
                            mostrarAlerta(`Error al enviar la solicitud.,${error}`);
                            setTimeout(async function() {
                                // Puedes redirigir a otra página o actualizar la página actual aquí
                                //location.reload();
                                await actualizarData()
                            }, 2000); // 2000 milisegundos = 2 segundos
                        }
                    });
                }
        }
        else {
            throw new Error('El servidor no pudo obtener los datos del cliente');
        }
    }
    await renderizaDatosatosOwner()

    // Función para manejar el evento de cambio de imagen con fetch
    const handleImageChange = async (event) => {
        try {
            const file = event.target.files[0]; // Obtener el archivo seleccionado
            if (!file) {
                console.error('No se seleccionó ningún archivo');
                mostrarAlerta('No se seleccionó ningún archivo');
                return;
            }
            const reader = new FileReader(); // Crear un FileReader para leer la imagen
    
            reader.onload = function(e) {
                cambiarImagen.src = e.target.result; // Asignar la imagen al src de cambiarImagen
            }
    
            reader.readAsDataURL(file); // Leer el archivo como una URL de datos

            //console.log("Entró al manejador de la imagen", file);
    
            // Crear un objeto FormData para enviar el archivo al backend
            const formData = new FormData();
            formData.append('idOwner', idOwner); // Agregar el ID del cliente al FormData
            formData.append('imagen', file); // Agregar el archivo al objeto FormData
            formData.append('urlServer', urlServer); // Agregar el archivo al objeto FormData
            formData.append('empresa', ecommerceName); // Agregar el archivo al objeto FormData
            // Muestra el contenido de FormData
            for (let [key, value] of formData.entries()) {
                //console.log(key, value);
            }
    
            // Mostrar el modal de loading
            mostrarModalLoading();
    
            // Realizar la solicitud Fetch
            //const endpoints = JSON.parse(sessionStorage.getItem('endPointsIdTokens'));
            //console.log("Endpoints que está usando", endpoints[43]);
            const response = await fetch(`${endpoints[43]}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${jwToken}`
                }	
            });
    
            if (response.ok) {
                // Cerrar el modal de loading
                ocultarModalLoading();
                //console.log('La imagen se cargó correctamente');
                mostrarExito('La imagen se cargó/cambió correctamente');
                // Recargar la página después de 3 segundos
                setTimeout(async () => {
                    await actualizarData()
                }, 2000); // 3000 milisegundos = 3 segundos
            } else {
                    // Cerrar el modal de loading
                    ocultarModalLoading();
                    mostrarAlerta('Error al cargar la imagen en el backend');
                    setTimeout(async () => {
                        await actualizarData()
                    }, 2000); // 3000 milisegundos = 3 segundos
                }
            } catch (error) {
                // Cerrar el modal de loading
                ocultarModalLoading();
                console.error('Ocurrió un error al enviar la imagen al backend', error);
                mostrarAlerta('Ocurrió un error al enviar la imagen al backend');
                setTimeout(async () => {
                    await actualizarData()
                }, 1000); // 3000 milisegundos = 3 segundos
            }
    };
    // Obtener el elemento de la imagen y el input de tipo file
    const cambiarImagen = document.getElementById('cambiarImagen99798798');
    const fileInput = document.getElementById('fileInput951357');
    // Agregar evento click al elemento de la imagen
    cambiarImagen.addEventListener('click', () => {
        // Agregar evento change al input de tipo file
        fileInput.addEventListener('change', handleImageChange);
    });

    const aqilosCelus = document.getElementById("insertaNumCelOwner");
    // Iterar sobre todos los números celulares y agregarlos como opciones al elemento select
    if (numCel.length >= 1) {
        numCel.forEach(numCelu => {
            const option = document.createElement('option');
            option.value = numCelu.numCelOwner;
            option.textContent = `Núm cel. ${numCelu.numCelOwner}`;
            aqilosCelus.appendChild(option);
        });
        const numCelu = `
            <p><strong>Tienes:</strong> ${numCel.length} números celulares registrados</p>
            <p><strong>Numero de celular principal:</strong> ${numCel[0].numCelOwner}</p>
        `
        document.getElementById("numCeluOwner").innerHTML = numCelu 
    }
    else{
        const numCelu = "No tiene celular agrega uno"
        document.getElementById("numCeluOwner").innerHTML = numCelu
    }
    // Aqui se ingresa o edita los numeros de celular
    function enviarDatosUpdateCelus() {
        // Obtener los valores de los campos de entrada
        const confirmCel = document.getElementById('confirmCel').value;
        const updateCel = true
        const numerosCelulares = document.getElementById('numerosCelulares').value; // Obtener el valor seleccionado del select
        // Crear un objeto con los datos a enviar
        const data = {
            idOwner,
            confirmCel: confirmCel,
            updateCel: updateCel,
            numerosCelulares: numerosCelulares, // Agregar el valor del select al objeto de datos
            jwToken
        };

        // Configurar las opciones de la solicitud Fetch
        const options = {
            method: 'POST', // Método de la solicitud
            headers: {
                'Content-Type': 'application/json' // Tipo de contenido de la solicitud
            },
            body: JSON.stringify(data), // Convertir el objeto de datos a formato JSON
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwToken}`
            }	
        };

        // Realizar la solicitud Fetch
        //abrir el modal loading
        mostrarModalLoading()
        //const endpoints = JSON.parse(sessionStorage.getItem('endPointsIdTokens'));
        //console.log("Hizo click para actualizar celus", jwToken )
        fetch(`${endpoints[14]}`, options) 
        .then(response => {
            // Verificar si la solicitud fue exitosa
            if (response.ok) {
                    //console.log('Datos enviados correctamente');
                    // Aquí puedes agregar lógica adicional si la solicitud fue exitosa
                    return response.json(); // Convertir la respuesta a JSON
                } else {
                    console.error('Error enviado por el servers:', response);
                    return response.json(); // Convertir la respuesta a JSON para obtener el mensaje de error
                }
            })
            .then(data => {
                if (data && data.success === false) {
                    //cerrar el modal loading
                    ocultarModalLoading()
                    // Si la respuesta tiene un estado 400 y contiene un mensaje de error, mostrarlo en la alerta
                    mostrarAlerta(data.data.message);
                } else {
                    //cerrar el modal loading
                    ocultarModalLoading()
                    // Manejar la respuesta si es exitosa
                    mostrarExito(data.data.message); // Mostrar la respuesta en un alert
                    // Esperar 3 segundos antes de recargar la página
                    setTimeout(async () => {
                        await actualizarData()
                    }, 1000); // 3000 milisegundos = 3 segundos
                }
            })
            .catch(error => {
                //cerrar el modal loading
                ocultarModalLoading()
                mostrarAlerta(`Error en en el envio de datos puede que no tengas internet, intenta mas tarde, ${error}.`); 
                console.error('Error al enviar los datos en la solicitud Fetch:', error);
            });
    }
    // Obtener el botón y agregar un evento de clic para llamar a la función enviarDatos
    document.getElementById('btnUpdateCelus').addEventListener('click', enviarDatosUpdateCelus);
    // funciones para el CRUD de emails
    const aqilosEmail = document.getElementById("insertaEmails");
    if (emails.length >= 1 ) {
        // Iterar sobre todos los números celulares y agregarlos como opciones al elemento select
        emails.forEach(e => {
            const option = document.createElement('option');
            option.value = e.emailOwner;
            option.textContent = `Email: ${e.emailOwner}`;
            aqilosEmail.appendChild(option);
        });
        const emailCli = `
            <p><strong>Tienes:</strong> ${emails.length} emails registrados</p>
            <p><strong>Email principal:</strong> ${emails[0].emailOwner || email}</p>
        `
        document.getElementById("emailCli").innerHTML = emailCli;
    }
    else{
        const option = document.createElement('option');
        option.value = email
        option.textContent = `Email: ${email}`;
        aqilosEmail.appendChild(option);
        const emailCli = `Email principal ${email}. <br> Agrega o edita un email de tu cuenta`;
        document.getElementById("emailCli").innerHTML = emailCli
    }
    // funciones CRUDS para los emails
    function enviarDatosUpdateEmails() {
        // Obtener los valores de los campos de entrada
        const confirmMail = document.getElementById('confirmEmail').value;
        //const updateMail = document.querySelector('input[name="updateEmail"]').value;
        const todosLosEmails = document.getElementById('Emailsss').value; // Obtener el valor seleccionado del select
        // Crear un objeto con los datos a enviar
        const dataMail = {
            idOwner,
            confirmEmail: confirmMail,
            updateEmail: true,
            AllEmails: todosLosEmails, // Agregar el valor del select al objeto de datos
            jwToken
        };
        //console.log("que estamos enviando para el CRUD de emails", dataMail)
        // Configurar las opciones de la solicitud Fetch
        const options2 = {
            method: 'POST', // Método de la solicitud
            headers: {
                'Content-Type': 'application/json' // Tipo de contenido de la solicitud
            },
            body: JSON.stringify(dataMail), // Convertir el objeto de datos a formato JSON
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwToken}`
            }	 
        };
        //cerrar el modal loading
        mostrarModalLoading()
        // Realizar la solicitud Fetch
        //console.log("Hizo click para actualizar celus", jwToken )
        fetch(`${endpoints[14]}`, options2) 
        .then(response => {
            //cerrar el modal loading
            ocultarModalLoading()
                // Verificar si la solicitud fue exitosa
                if (response.ok) {
                    //console.log('Datos enviados correctamente pra el CRUD emails');
                    // Aquí puedes agregar lógica adicional si la solicitud fue exitosa
                    return response.json(); // Convertir la respuesta a JSON
                } else {
                    console.error('Error al enviar los datos:', response);
                }
            })
            .then(data => {
                if (data && data.success === false) {
                    // Si la respuesta tiene un estado 400 y contiene un mensaje de error, mostrarlo en la alerta
                    mostrarAlerta(data.data.message);
                    // Esperar 3 segundos antes de recargar la página
                    setTimeout(async () => {
                        await actualizarData()
                    }, 1000); // 3000 milisegundos = 3 segundos
                } else {
                    // Manejar la respuesta si es exitosa
                    mostrarExito(data.data.message); // Mostrar la respuesta en un alert
                    // Esperar 3 segundos antes de recargar la página
                    setTimeout(async () => {
                        await actualizarData()
                    }, 1000); // 3000 milisegundos = 3 segundos
                }
            })
            .catch(error => {
                // Esperar 3 segundos antes de recargar la página
                setTimeout(() => {
                    location.reload(); // Recargar la página
                }, 3000); // 3000 milisegundos = 3 segundos
                console.error('Error en la solicitud Fetch enviarDatosUpdateEmails:', error);
                mostrarAlerta('Error en la solicitud Fetch enviarDatosUpdateEmails',error); // Mostrar un mensaje genérico de error en un alert
            });
    }
    // Obtener el botón y agregar un evento de clic para llamar a la función enviarDatos
    document.getElementById('btnUpdateEmail').addEventListener('click', enviarDatosUpdateEmails);

    //console.log("Encuentra el password?????????????????????????????????", dataOwner)
    const pass = `<p><strong>Password:</strong> ${realPass}</p> `
    document.getElementById("passwordCpanel").innerHTML = dataOwner.realPass ? pass : "No tiene password";

    // funcion CRUDS para el cambio de password
    document.getElementById('changePass').addEventListener('click', async () => {
        const newPassword = document.getElementById('changePassword').value;
        const confirmPassword = document.getElementById('changeConfirmPassword').value;
        const changPass = true
        // Verificar que la nueva contraseña cumpla con los requisitos
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            console.log("La contraseña debe tener al menos 8 caracteres alfanuméricos y contener al menos una mayuscula");
            const message = "La contraseña debe tener al menos 8 caracteres alfanuméricos y contener al menos una mayuscula"
            mostrarAlerta(message);
        }
        // Verificar si las contraseñas coinciden
        if (newPassword !== confirmPassword) {
            mostrarAlerta('Las contraseñas no coinciden');
            return;
        }
        // Objeto con los datos a enviar al backend
        const data = {
            newPassword: newPassword,
            confirmPassword: confirmPassword,
            idOwner,
            jwToken,
            changPass
        };
            // Realizar la solicitud fetch
            try {
                //cerrar el modal loading
                mostrarModalLoading()
                    // Realizar la solicitud Fetch
                    //const endpoints = JSON.parse(sessionStorage.getItem('endPointsIdTokens'));
                    //console.log("Hizo click para actualizar los passwords", jwToken )
                const response = await fetch(`${endpoints[14]}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwToken}`  
                    },
                    body: JSON.stringify(data),
                });
                //cerrar el modal loading
                ocultarModalLoading()
                // Verificar si la solicitud fue exitosa
                if (response.ok) {
                    const responseData = await response.json();
                    mostrarExito(responseData.message); // Mostrar mensaje del backend en la función mostrarAlerta
                    // Esperar 3 segundos antes de recargar la página
                    setTimeout(async () => {
                        await actualizarData()
                    }, 1000); // 3000 milisegundos = 3 segundos
                } else {
                    // Capturar el mensaje de error del backend si está presente
                    let errorMessage = '';
                    try {
                        const responseData = await response.json();
                        if (responseData && responseData.message) {
                            errorMessage = responseData.message;
                        }
                    } catch (error) {
                        console.error('Error al parsear la respuesta del backend:', error);
                    }
                    throw new Error(errorMessage);
                }
            } catch (error) {
                console.error('Error en la solicitud Fetch:changePass', error);
                mostrarAlerta("Error al cambiar su passsword, intente mas tarde.",error); // Mostrar mensaje de error en la función mostrarAlerta
            }
    });

    // Verificar que la variable 'direcciones' 
    const container = document.getElementById("DireccionesResgistaradas");
    if (direcciones.length >= 1) {
        // Generar HTML para las direcciones
        function generarHTMLDirecciones(direcciones) {
            let direccionesHTML = '';
            direcciones.forEach(direccion => {
                direccionesHTML += `
                    <div class="col-md-6 mb-4">
                        <div class="card" style="min-height: 50px !important;">
                            <div class="card-header">
                            <h5>Datos de la dirección</h5>
                            </div>
                            <div class="card-body">
                                <p class="text-left"><strong>Pais:</strong> ${direccion.pais}</p>
                                <p class="text-left"><strong>Estado:</strong> ${direccion.estado}</p>
                                <p class="text-left"><strong>Localidad:</strong> ${direccion.localidad}</p>
                                <p class="text-left"><strong>Calle:</strong> ${direccion.calle}<span>  </span><strong>Número:</strong> ${direccion.numeroPuerta}</p>
                                <p class="text-left"><strong>C.P:</strong> ${direccion.CP}</p>
                                <!-- Agregar un identificador único a cada botón de eliminación -->
                                <input type="hidden" id="idCliente-${direccion._id}" value="${direccion._id}">
                            </div>
                            <div class="card-footer" align="center">
                                <button class="btn btn-danger delete-btn" id="idcliente-${direccion._id}" value="${direccion._id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            return direccionesHTML;
        }
        // Lógica principal para renderizar las direcciones
        const direccionesHTML = generarHTMLDirecciones(direcciones);
        container.innerHTML = `
            <div class="row">
                ${direccionesHTML}
            </div>
        `;
        // Función para agregar evento de clic a los botones de eliminación
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async function(event) {
                // Función para confirmar y eliminar la dirección
                // Obtener el id de la dirección del atributo 'data-id' del botón
                const idDireccion = button.value;
                //console.log("Apreto el boton de eliminar Que idDireccion encontro", idDireccion)
                const jwtToken = sessionStorage.getItem("jwtToken");
                const clienteEc1 = sessionStorage.getItem('clienteEcomm');
                const dataCliente = JSON.parse(clienteEc1);
                const deleteAdress = true;
                const data = {
                    idDireccion: idDireccion,
                    idOwner,
                    deleteAdress: deleteAdress
                };
                const mensaje = "¿Deseas eliminar esta direccion?"
                const rechaza = () => {
                    location.reload();
                }
                const confirma = async function confirmaEliminarDire() {
                    const data = {
                    idDireccion: idDireccion,
                    idOwner,
                    deleteAdress: deleteAdress
                };
                    try {
                        //mostrar el modal loading
                        mostrarModalLoading()
                        //const endpoints = JSON.parse(sessionStorage.getItem('endPointsIdTokens'));
                        const response = await fetch(`${endpoints[14]}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${jwToken}`
                            }	
                        });
                        const responseData = await response.json();
                        //cerrar el modal loading
                        ocultarModalLoading()
                        if (response.ok) {
                            mostrarExito(responseData.message);
                            // Esperar 2 segundos (2000 milisegundos)
                            setTimeout(async () => {
                                await actualizarData()
                            }, 1000); // 3000 milisegundos = 3 segundos
                        } else {
                            throw new Error(responseData.message); // Lanzar un error con el mensaje del backend
                        }
                    } catch (error) {
                        mostrarAlerta(error.message); // Mostrar el mensaje de error del backend
                        setTimeout(function() {
                            // Refrescar la página
                            location.reload();
                        }, 1000); // 2000 milisegundos = 2 segundos
                    }
                }

                // Llamar a confirmOptions con confirma como argumento
                const opcion33 = await confirmOptions(mensaje, confirma, rechaza);
                if (opcion33 == "true") {
                    console.log("Que devuelve la función confirmOptions",opcion33)
                    confirmaEliminarDire(data)
                }
            });
        });
    }
    else{
        // Lógica principal para renderizar las direcciones
        const container = document.getElementById("DireccionesResgistaradas");
        container.innerHTML = `
            <div class="row">
                <p>Agrega tu direccion por favor</p>
            </div>
        `;
    }
}); 

        //re envia al dominio del cliente o al de UTF Cpanel
        async function dominioURLCpanel() {
            const dataOwner = JSON.parse(sessionStorage.getItem('dataOwner')) || null;
            const dataBasic = JSON.parse(sessionStorage.getItem('basicData')) || null;
            console.log("Entro a buscar el domioURL",dataBasic.urlServer)
            let dominioUrls
            let cheqDom = dataOwner?.dominio || false;
            if (cheqDom) {
                dominioUrls = `${dataOwner.urlOwner}/indexEcomm.html`;
                // Si necesitas redirigir a la URL almacenada en 'dominio' después de recargar, puedes hacer lo siguiente:
                console.log("********Entro por tiene dominio", dominioUrls)
                return dominioUrls;
            } else {
                dominioUrls = dataBasic.urlServer + dataOwner.urlOwner;
                // Si necesitas redirigir a la URL almacenada en 'dominio' después de recargar, puedes hacer lo siguiente:
                console.log("Entro por NO tiene dominio desde el index ecommerce linea 3274", dominioUrls)
                return dominioUrls;
            }
        }

        function exportarAExcel(dataExcel) {
            console.log("Entro a descargar el excel", dataExcel);

            // Crear un nuevo libro de Excel
            let wb = XLSX.utils.book_new();

            // Crear un array para almacenar todos los datos juntos
            let datosLimpios = [];

            // Recorremos el array padre y sus subarrays
            dataExcel.forEach((compra) => {
            // Verificamos si 'compra' es un array
            if (Array.isArray(compra)) {
                // Si es un array, limpiamos cada objeto del array
                compra.forEach(item => {
                const { _id, idCliente, idOwner, clienteId, idDueno, ...limpio } = item;
                datosLimpios.push(limpio);  // Agregamos el objeto limpio al array
                });
            } else if (typeof compra === 'object') {
                // Si es un objeto, lo limpiamos y lo agregamos
                const { _id, idCliente, idOwner, clienteId, idDueno, ...limpio } = compra;
                datosLimpios.push(limpio);  // Agregamos el objeto limpio al array
            }
            });

            // Convertimos el array limpio en una hoja de Excel
            let ws = XLSX.utils.json_to_sheet(datosLimpios);

            // Agregamos la hoja de Excel con todos los datos en una sola hoja
            XLSX.utils.book_append_sheet(wb, ws, 'Compras Clientes');

            // Generamos el archivo Excel
            XLSX.writeFile(wb, 'ComprasClientes.xlsx');
        }
    
