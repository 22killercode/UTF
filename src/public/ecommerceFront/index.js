const bannerSection = document.getElementById('banner2233');
// Establecer altura inicial a 450px
bannerSection.style.height = 'auto'; // Alto inicial fijo
	let listaPedido        = []
	let oky                = false
	let SumaTotal          = 0
	let duenoE             = ""
	let productosComprados = []
	let codigosDeProductos = []// es para uso de las funciones de buscador de pedidos por su codigo de producto
	let todosLosProductos  = [];  // Aquí se almacenan todos los productos
	let comprasClientes2   = {}
	// para el coambio de domicilio de entrega
	let codigoPedido25741  = {}
	let coordenadas98789   = {}
	let longitud1          = {}
	let latitud1           = {}
	let direccionCompleta  = {}
	// costo delivery
	let costoDelivery      = []
	let categorias         = {};
	let categoriasProm     = {}
	let cheqOkComprar      = true
	// es para mostrar las fotos de lso productos de forma gigante
	let dataGigante = {}
	let acum = []
	let urlOwner = window.location.pathname.split('/')[1];

	//console.log("Que urlOwner encontro desde el path fronen", urlOwner)
	// reproducir sonido de Exito
	function reproducirSonidoE(velocidad, volumen) {
		var audio = new Audio('sounds/dingDong.wav');
		audio.loop = false; // Reproducir en bucle
		audio.playbackRate = velocidad;
		audio.volume = volumen;
		audio.play();
	}

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
		
		map88 = L.map('map88')
				// Agrega capa de mosaicos OpenStreetMap al mapa
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 19,
			id: 'osm_b&w',
			tileSize: 512,
			zoomOffset: -1
		}).addTo(map88);
	}
	mapas()
	let urlServer = ""
	let dataOwner, ownerMensajes, ownerPromos, ownerProducts, basicData, dataCliente


	//Envia todos los productos y el carrito al frontend
	document.addEventListener('DOMContentLoaded', async function () {

		// agrega el logo al body
		document.getElementById("insertLogo").innerHTML = `
<div id="coloratepapa" class="m-4 d-flex flex-column justify-content-center align-items-center vh-100">
    <div>
        <img src="images/logomtf.jpg" class="img-fluid rounded mb-4" alt="Logo" 
             style="box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5); 
                    transition: transform 0.2s; 
                    opacity: 0;" 
             onload="this.style.opacity='1';" 
             onmouseover="this.style.transform='translateY(-5px) translateX(5px) scale(1.05)';" 
             onmouseout="this.style.transform='';">
    </div>
    <div style="font-size: 4rem;" class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
</div>


		`;

		// funciones para obtener y renderizar todos los productos y procesar el pedido al carrito
		function obtenerProductosYPromociones() {
			const urlOwner2 = {urlOwner : urlOwner}
			//console.log("Entro a buscar los productos usando el orlOwner:", urlOwner2)
			fetch('http://localhost:3020/buscandoDataEcommerceInicial', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(urlOwner2)
			})
			.then(response => response.json()) 
			.then(async data => {
				if (data.success) {
					//console.log("777777777777", data)
					// Guarda los enpoints en el sessionStorage
					sessionStorage.setItem("idEndpoints", JSON.stringify(data.endPointsFronen));
					sessionStorage.setItem("basicData", JSON.stringify(data.basicData));
					urlServer = data.basicData.urlServer
					
					async function obtenerDatos() {
						let dataClient = JSON.parse(sessionStorage.getItem('clienteEcomm')) || { _id: false };
						let idClient2 = dataClient._id;
						//console.log("que idcliente encontro?????????", idClient2)
						// Aseguramos que idClient2 está inicializado correctamente

							// Desestructuramos la respuesta de la función rescueData
							({ dataOwner, ownerMensajes, ownerPromos, ownerProducts, basicData, dataCliente } = await rescueData(idClient2));
							
							// Guardamos en sessionStorage si existe dataCliente
							if (dataCliente) {
								sessionStorage.setItem("clienteEcomm", JSON.stringify(dataCliente));
							}

					}
					
					// Llamada a la función
					await obtenerDatos();
					
					
					await buscarProductosYPromos(data.endPointsFronen, ownerPromos, ownerProducts)
				} else {
					console.error('Error al obtener datos de /buscandoPostdeEcommerce');
					mostrarAlerta("Verifique su conexión a internet")
				}
			})
			.catch(error => console.error('Error de solicitud:', error),
			);
		};

		async function buscarProductosYPromos(enpoints, ownerPromos, ownerProducts) {
			//console.log("buscarProductosYPromos*****************" , dataOwner, ownerMensajes, ownerPromos, ownerProducts, basicData)
			// re ORdena los preoductos
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
			renderizarProductosYCategorias(categorias);
			// Inicializar todos los carruseles de Bootstrap
			$('.carousel').carousel();

			// re ORdena las promociones
			ownerPromos.forEach((producto) => {
				const categoria = producto.categoria;
				// Agrupar productos por categoría
				if (!categoriasProm[categoria]) {
					categoriasProm[categoria] = [];
				}
				categoriasProm[categoria].push(producto);
			});
			// Renderizar productos y categorías
			renderizarPromociones(categoriasProm);
			// Inicializar todos los carruseles de Bootstrap
			$('.carousel').carousel();

			await automatismo(enpoints)
		}

		// renderiza todos los productos
		function renderizarProductosYCategorias(categorias) {
			//console.log("2222222222222222222 Todos los prodcutos por categorias",categorias)
			//Encuentra el div pára renderizar los productos y servicios
			const contenedorProductosServicios = document.getElementById('productos-servicios');
			//catergorias del menu
			const contenedorCategorias     = document.getElementById('catego');
			//Productos del menu
			const contenedorProds = document.getElementById('prods');
			//console.log("que categorias hay", categorias)
			if (categorias) {
				contenedorProductosServicios.innerHTML = '';
				contenedorCategorias.innerHTML = '';
				contenedorProds.innerHTML = '';
				// Renderizar cada categoría
				// Crea el divProduc
				let divProduc = document.createElement('div');
				//divProduc.className = 'cardVertical'; // Agrega la clase 'cardVertical' al div

				// Aplica estilos para que divProduc se alinee horizontalmente
				divProduc.style.flex = '1 1 2000px'; // Ajusta el tamaño del divProduc; cambia '200px' según el ancho deseado
				divProduc.style.margin = '5px'; // Espacio alrededor de divProduc (opcional)
				divProduc.style.boxSizing = 'border-box'; // Asegura que el padding y borde se incluyan en el tamaño total del div

				// Supongamos que tienes un array de categorías con productos
				Object.keys(categorias).forEach(categoria => {
					const categoriaContainer = document.createElement('div');
					categoriaContainer.className = 'categoria-container';
					categoriaContainer.innerHTML = `<div id="${categoria}" style="height: auto;margin:0.5rem 0 !important; padding:0.5rem; border: none; background: none; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 -4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px;">
						<h5>${categoria}</h5>
					</div>`;
					contenedorProductosServicios.appendChild(categoriaContainer);

					// menú categorías
					const CatCategorias = document.createElement('a');
					CatCategorias.className = 'catego';
					CatCategorias.href = `#${categoria}`;
					CatCategorias.innerHTML = `<p style="color: white !important; line-height: 1rem !important;">${categoria}</p>`;
					contenedorCategorias.appendChild(CatCategorias);
					// Renderizar productos de cada categoría
					const productosEnCategoria = categorias[categoria];
					//console.log("Cuanos productos son para renderizar=???????????????", productosEnCategoria.length)
					productosEnCategoria.forEach((producto, index) => {
						// filtra si quedan cero productos NO lo renderiza
						if (producto.cantidad >= 1) {
							const CatProductos = document.createElement('a');
							CatProductos.className = 'prods';
							CatProductos.href = `#${producto.nombreProducto}`;
							CatProductos.innerHTML = `<p style="margin: 1rem auto; color: white !important; line-height: 1rem !important;">${producto.nombreProducto}</p>`;
							contenedorProds.appendChild(CatProductos);
							todosLosProductos.push(producto.nombreProducto);
							const cardProdHorizontal = `
<div style=" min-height: 450px !important; display:inline-flex !important" class=" border-0 point cardH col-md m-3 p-2 d-flex justify-content-center" id="coloreateputo${producto._id}">
    <div class="card w-100" style="transition: transform 0.2s; background-color: transparent;" 
        onmouseover="this.style.transform='scale(1.005)'" 
        onmouseout="this.style.transform='scale(1)'">
        <div class="card-header text-center" style="background-color: transparent;">
            <h4 class="product-name" id="${producto.nombreProducto}">
                <strong>${producto.nombreProducto}</strong>
            </h4>
        </div>
        <div class="card-body  border-0">
            <div class="row">
                <!-- Primera columna: Carrusel de imágenes -->
                <div class="col-12 col-md-6 d-flex justify-content-center">
                    <div class="carousel-container  m-0 p-0">
                        <div id="carousel${producto._id}" class="carousel slide  m-0 p-0" data-bs-ride="carousel">
                            <div class="carousel-inner  m-0 p-0">
                                ${producto.rutaSimpleImg.map((img, index) => `
                                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                        <img id="${producto._id}" src="${img}" alt="Producto" class="img-fluid m-0 p-0" 
                                            style="min-height: 400px; min-width: auto; cursor:pointer; border-radius:0.51rem" />
                                    </div>`).join('')}
                            </div>
                            <a class="carousel-control-prev" href="#carousel${producto._id}" role="button" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </a>
                            <a class="carousel-control-next" href="#carousel${producto._id}" role="button" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </a>
                        </div>
                    </div>
                </div>
                <!-- Segunda columna: Información del producto -->
                <div class="col-12 col-md-6 text-center" align="center">
                    <h5 class="price-info text-success">
                        <strong>Precio:</strong> $<span class="price">${formatoMoneda(producto.precio)} pesos.</span>
                    </h5>
                    <br>
                    <div align="center">
                        ${producto.animOK ?
                            producto.cantidad <= 3 ?
                            `
                            <div class="corazon">
                                <div class="textoC">
                                    <strong>Quedan<br>${producto.cantidad}</strong> 
                                </div>
                            </div>
                            ` : `
                                <div class="escarapela">
                                    <div class="capa capa1"></div>
                                    <div class="capa capa2"></div>
                                    <div class="capa capa3"></div>
                                    <div class="textoE">
                                        <strong>Quedan<br>${producto.cantidad}</strong> 
                                    </div>
                                </div>
                            `
                            : `
                                <div class="">
                                    <h5>
                                        <strong>Quedan<br>${producto.cantidad}</strong> 
                                    </h5>
                                </div>
                            `
                        }
                        <br>
                        <p><strong>Elige cantidad:</strong></p>
                        <div class="d-flex justify-content-center align-items-center px-auto">
                            <div class="p-0 d-flex justify-content-between align-items-center btn btn-primary">
                                <button class="m-0 btn btn-outline-secondary decrement${producto._id}" type="button" data-id="${producto._id}" 
                                style="width: 20px; border:none; height: 30px; color: green; font-weight: bold; display: flex; justify-content: center; align-items: center; font-size:1.5rem">
                                -
                                </button>
                        
                                <input 
                                type="number" 
                                data-cantidad-id="${producto._id}" 
                                name="cantidad"
                                value="1" 
                                id="infoInput${producto._id}" 
                                min="1" 
                                max="${producto.cantidad}" 
                                required
                                class="form-control text-center m-0" 
                                style="border:none; background: transparent !important; width: 40px !important; height: 30px; padding: 0; margin: 0; color: white"
                                />
                        
                                <button class="m-0 btn btn-outline-secondary increment${producto._id}" type="button" data-id="${producto._id}" 
                                style="width: 20px; height: 30px; border:none; font-weight: bold; display: flex; justify-content: center; align-items: center; font-size:1.5rem">
                                +
                                </button>
                            </div>
                        </div>
                        <br>
                        <button type="button" class="btn btn-success add-to-cart mt-2" id="BTNCarrito${producto._id}" data-producto-id="${producto._id}">
                            Agregar al Carrito
                            <span class="fas fa-shopping-cart"></span>
                        </button>
                        <br><br>
                        <button type="button" class="btn btn-outline-info description-toggle" data-bs-toggle="collapse" 
                            data-bs-target="#descriptionContainer${producto._id}" aria-expanded="false" 
                            aria-controls="descriptionContainer${producto._id}">
                            Descripción del producto
                        </button>
                        <div align="left" class="collapse" id="descriptionContainer${producto._id}">
                            <p class="mt-2">${producto.descripcion}</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer mt-0  border-0" style="background-color: transparent;">
        </div>
    </div>
</div>

							`;
							const cardProdVertical = `
							<div class="point col cardV p-0 m-2 g-0" style="min-height: 550px !important;" id="coloreateputo${producto._id}">
								<div class="card p-1 w-100 m-0" style="min-height:100%; transition: transform 0.2s; background-color: transparent;">
									<div class="card-header">
										<h5 style="text-align:center; margin: 0;" id="${producto.nombreProducto}">
											<strong>${producto.nombreProducto}</strong>
										</h5>
									</div>
									<div class="card-body p-1" align="center">
										<div id="carousel${producto._id}" class="carousel slide" data-bs-ride="carousel">
											<div class="carousel-inner">
												${producto.rutaSimpleImg.map((img, index) => `
													<div align="center" class="carousel-item ${index === 0 ? 'active' : ''}">
														<img id="${producto._id}" src="${img}" alt="Producto" class="img-fluid" style="cursor:pointer;">
													</div>`).join('')}
											</div>
											<a class="carousel-control-prev" href="#carousel${producto._id}" role="button" data-bs-slide="prev">
												<span class="carousel-control-prev-icon" aria-hidden="true"></span>
												<span class="visually-hidden">Previous</span>
											</a>
											<a class="carousel-control-next" href="#carousel${producto._id}" role="button" data-bs-slide="next">
												<span class="carousel-control-next-icon" aria-hidden="true"></span>
												<span class="visually-hidden">Next</span>
											</a>
										</div>
										<div>
											<h5 style="color:green; margin:0.5rem 0;">
												<strong>Precio:</strong> 
												$<span class="price">${formatoMoneda(producto.precio)}</span>
											</h5>
										</div>
										<div class="row" align="center" style="display: flex; align-items: center;">
											<div class="col-5 text-center">
												${producto.animOK ?
													producto.cantidad <= 3 ?
													`
													<div class="corazon">
														<div class="textoC">
															<strong>Quedan<br>${producto.cantidad}</strong> 
														</div>
													</div>
												` : `
													<div class="escarapela">
														<div class="capa capa1"></div>
														<div class="capa capa2"></div>
														<div class="capa capa3"></div>
														<div class="textoE">
															<strong>Quedan<br>${producto.cantidad}</strong> 
														</div>
													</div>
												`
												: `
													<div class="">
														<h5>
															<strong>Quedan<br>${producto.cantidad}</strong> 
														</h5>
													</div>
												`
											}
											</div>
											<div class="col-5 parent-div justify-content-center">
												<div class="child-div text-center">
													<p><strong>Elije cantidad:</strong></p>
												</div>
												<div class="child-div d-flex flex-column align-items-center" style="margin-top:-0.5rem">
										<div class="d-flex justify-content-center align-items-center px-auto">
											<div class="p-0 d-flex justify-content-between align-items-center btn btn-primary">
												<button class="m-0 btn btn-outline-secondary decrement${producto._id}" type="button" data-id="${producto._id}" 
												style="width: 20px; border:none; height: 30px; color: green; font-weight: bold; display: flex; justify-content: center; align-items: center; font-size:1.5rem">
												-
												</button>
										
												<input 
												type="number" 
												data-cantidad-id="${producto._id}" 
												name="cantidad"
												value="1" 
												id="infoInput${producto._id}" 
												min="1" 
												max="${producto.cantidad}" 
												required
												class="form-control text-center m-0" 
												style="border:none; background: transparent !important; width: 40px !important; height: 30px; padding: 0; margin: 0; color: white"
												/>
										
												<button class="m-0 btn btn-outline-secondary increment${producto._id}" type="button" data-id="${producto._id}" 
												style="width: 20px; height: 30px; border:none; font-weight: bold; display: flex; justify-content: center; align-items: center; font-size:1.5rem">
												+
												</button>
											</div>
										</div>
											</div>							
										</div>
										<br>
										<button type="button" class="w-50 add-to-cart" id="BTNCarrito${producto._id}" data-producto-id="${producto._id}" style="margin: 0.5rem auto;">
											Agregar al Carrito
											<span style="color:white !important;" class="fas fa-shopping-cart"></span>
										</button>
									</div>
									<div class="card-footer p-1" style="border:none ;min-height: 50px !important">
										<button type="button" class="btn btn-outline-info description-toggle" data-bs-toggle="collapse" 
											data-bs-target="#descriptionContainer${producto._id}" aria-expanded="false" 
											aria-controls="descriptionContainer${producto._id}"
											style="height: 35px !important; margin:0.5rem; padding:0.5">
											ver descripción del producto
										</button>
										<div align="left" class="collapse" id="descriptionContainer${producto._id}">
											<p style="margin: 0;">${producto.descripcion}</p>
										</div>
									</div>
								</div>
							</div>
							`;
							const cardHtmlTransparente = `
							<div class="point col-12 col-sm-6 col-md-4 cardV p-0 m-2 g-0" style="min-height: 550px !important; padding:0;margin:0;min-height: 350px; position: relative;" id="coloreateputo${producto._id}">
								<!-- Contenedor del carrusel como fondo -->
								<div class="p-0 w-100 m-0" style="position: relative; ">
								<!-- Carrusel de imágenes como fondo -->
									<div id="carousel${producto._id}" class="carousel slide justify-content-center align-items-center" data-bs-ride="carousel" style="border: none;position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
										<div class="carousel-inner" style="height: 100%;">
											${producto.rutaSimpleImg.map((img, index) => `
											<div class=" justify-content-center align-items-center carousel-item ${index === 0 ? 'active' : ''}" style="height: 100%;">
												<img id="${producto._id}" 
													src="${img}" 
													alt="Producto" 
													class="img-fluid justify-content-center align-items-center h-100 " style="margin-left:-0rem !important; min-height: 350px; width:110%; object-fit: contain; position:absolute"
												>
											</div>`).join('')}
										</div>
										<!-- Controles del carrusel -->
										<a class="carousel-control-prev" href="#carousel${producto._id}" role="button" data-bs-slide="prev" style="z-index: 2 !important;">
										<span class="carousel-control-prev-icon" aria-hidden="true"></span>
										<span class="visually-hidden">Previous</span>
										</a>
										<a class="carousel-control-next" href="#carousel${producto._id}" role="button" data-bs-slide="next" style="z-index: 2 !important;">
										<span class="carousel-control-next-icon" aria-hidden="true"></span>
										<span class="visually-hidden">Next</span>
										</a>
									</div>
								<!-- Card superpuesto en la parte inferior -->
							<div class="card p-0 m-0" style="padding:0 !important; position: relative; z-index: 2; min-height: 350px; background-color: transparent;">
									<!-- Encabezado del producto -->
									<div class="card-header text-center" style="padding-bottom: 22rem; border: none;">
										<h4 id="${producto.nombreProducto}">
											<strong>${producto.nombreProducto}</strong>
										</h4>
									</div>
									<!-- En stock y precio alineados horizontalmente -->
									<div class="card-body d-flex justify-content-between align-items-center" style="border: none;">
										<div hidden>
											<strong>Stock</strong>
											<p>${producto.cantidad}</p>
										</div>
										<div>
											<p style="font-size:1.5rem"><span class="price ml-4"><strong>$${formatoMoneda(producto.precio)}<strong></span></p>
										</div>
								
									<!-- Cantidad, botones y carrito alineados horizontalmente -->
										<div class="d-flex justify-content-center align-items-center px-auto">
											<div class="p-0 d-flex justify-content-between align-items-center btn btn-primary">
												<button class="m-0 btn btn-outline-secondary decrement${producto._id}" type="button" data-id="${producto._id}" 
												style="width: 20px; border:none; height: 30px; color: green; font-weight: bold; display: flex; justify-content: center; align-items: center; font-size:1.5rem">
												-
												</button>
										
												<input 
												type="number" 
												data-cantidad-id="${producto._id}" 
												name="cantidad"
												value="1" 
												id="infoInput${producto._id}" 
												min="1" 
												max="${producto.cantidad}" 
												required
												class="form-control text-center m-0" 
												style="border:none; background: transparent !important; width: 40px !important; height: 30px; padding: 0; margin: 0; color: white"
												/>
										
												<button class="m-0 btn btn-outline-secondary increment${producto._id}" type="button" data-id="${producto._id}" 
												style="width: 20px; height: 30px; border:none; font-weight: bold; display: flex; justify-content: center; align-items: center; font-size:1.5rem">
												+
												</button>
											</div>
											
											<!-- Botón del carrito -->
											<button type="button" class="btn btn-outline-primary add-to-cart" id="BTNCarrito${producto._id}" data-producto-id="${producto._id}">
												<i style="color: skyblue !important;" class="fas fa-shopping-cart"></i>
											</button>
										</div>
									</div>
									<!-- Footer con descripción que se expande -->
									<div class="card-footer p-1" style="border:none">
										<button type="button" class="btn btn-outline-info" data-bs-toggle="collapse" 
											data-bs-target="#descriptionContainer${producto._id}" aria-expanded="false" 
											aria-controls="descriptionContainer${producto._id}"
											style="height: 35px; margin: 0.5rem;">
											Ver descripción del producto
										</button>
										<div align="left" class="collapse p-4" id="descriptionContainer${producto._id}">
											<p>${producto.descripcion}</p>
										</div>
									</div>
								</div>
								</div>
							</div>
							
							<!-- CSS adicional -->
							<style>
								@media (max-width: 450px) {
								.cardV {
									width: 100%; /* Asegura que la tarjeta ocupe el 100% del ancho */
									margin: 0; /* Elimina márgenes para un mejor ajuste */
								}
								
								.carousel-inner img {
									width: 100% !important; /* Asegura que las imágenes ocupen el 100% */
									height: auto; /* Mantiene la proporción de la imagen */
								}
								}
							</style>
							`;

						// Funcionalidad para los botones de incrementar y decrementar
						// Espera 2 segundos antes de agregar los eventos
						setTimeout(() => {
							// Evento para el botón de decremento
							const btnDecrement = document.querySelector(`.decrement${producto._id}`);
							btnDecrement.addEventListener('click', function() {
								const input = document.querySelector(`#infoInput${producto._id}`);
								const currentValue = parseInt(input.value, 10);
								if (currentValue > 1) {
									input.value = currentValue - 1;
									acum.push(currentValue);
									console.log("oprimio para disminuir", acum.length, input.value);
								}
							});

							// Evento para el botón de incrementar
							const btnIncrement = document.querySelector(`.increment${producto._id}`);
							btnIncrement.addEventListener('click', function() {
								const input = document.querySelector(`#infoInput${producto._id}`);
								const currentValue = parseInt(input.value, 10);
								const maxCantidad = parseInt(input.max, 10);
								if (currentValue < maxCantidad) {
									input.value = currentValue + 1;
									acum.push(currentValue);
									console.log("oprimio para aumentar", acum.length, input.value);
								}
							});
						}, 4000); // 2000 milisegundos = 2 segundos
						
						// para ver las imagenes gigantes
						document.addEventListener('click', function(event) {
							//const idProduct = dataGigante.idProduct
							const idProduct = producto._id
							//console.log("1111111111111Carrousel ID encontrado:000000",idProduct,event.target);
							if (event.target.id) {
								const id = event.target.id
								//console.log("2222222222222Carrousel ID *********8000", id === idProduct);
								if (id === idProduct) {
									const imgGiga   = producto.rutaSimpleImg
									const Desscript = producto.descripcion
									dataGigante = {imgGiga, Desscript, idProduct}
									//console.log("3333333333333333", dataGigante)
									abrirImgGigante(dataGigante);
									return
								}
							} 
						});

						let cardElement = {}

						if (producto.cardProdHor) {
							divProduc.innerHTML = cardProdHorizontal;
							cardElement = divProduc.querySelector('.point');
						} else if (producto.cardProdVert) {
							divProduc.innerHTML = cardProdVertical;
							cardElement = divProduc.querySelector('.point');
						} else if (producto.cardProdTra) {
							divProduc.innerHTML =  cardHtmlTransparente;
							cardElement = divProduc.querySelector('.point');
						} else {
							divProduc.innerHTML =  cardHtmlTransparente;
							cardElement = divProduc.querySelector('.point');
						}

							// Agregar event listener al elemento de la tarjeta
							cardElement.addEventListener('click', function(event) {
								// Verificar si el clic ocurrió en un botón de agregar al carrito
								if (event.target.classList.contains('add-to-cart')) {
									const idProducto = event.target.dataset.productoId;
									const inputCantidad = document.getElementById(`infoInput${idProducto}`).value;
									const ok = true;
									armarListaDePedido(idProducto, inputCantidad, ok);
								}
							});
							// Agregar la tarjeta al contenedor de categorías
							categoriaContainer.appendChild(cardElement);
						}
					});
				});
			} 
			//console.log("Que va acumulando",acum)
		}
		// busca, revisa y renderiza todos los PROMOS que se venden en el ecommerce
		function renderizarPromociones(categoriasProm) {
			//console.log("2222222222222222222 Todos los renderizarPromociones por categorias", categoriasProm);
		
			// Encuentra el div para renderizar los productos y servicios
			const contenedorProductosServicios = document.getElementById('promociones9y97834');
			contenedorProductosServicios.style.width = '100%';
			contenedorProductosServicios.style.margin = '0';
			contenedorProductosServicios.style.padding = '0';
			contenedorProductosServicios.innerHTML = '';
		// verifica si tiene alguna promo
			if (categoriasProm && Object.keys(categoriasProm).some(key => Array.isArray(categoriasProm[key]) && categoriasProm[key].length > 0)) {
				// Renderizar cada categoría
				Object.keys(categoriasProm).forEach(categoria => {
					const categoriaContainer = document.createElement('div');
					//categoriaContainer.className = 'categoria-container2';
					categoriaContainer.innerHTML = `
						<div class="container-xxl" id="${categoria}" style="width:100% !important; height: auto; margin: 0.5rem 0 !important; padding: 0.5rem; border: none; background: none; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 -4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px;">
							<h5 class="">${categoria}</h5>
						</div>`;
					contenedorProductosServicios.appendChild(categoriaContainer);

					//console.log("Que es: categoriasProm[categoria]", categoriasProm[categoria])
					categoriasProm[categoria].forEach(producto => {
						const imgGiga   = producto.rutaSimpleImg
						const Desscript = producto.descripcion
						const idProduct = producto._id
						dataGigante = {imgGiga, Desscript, idProduct}
						// Solo renderiza si tiene más de una unidad
						if (producto.cantidadDisponible >= 1) {
							//console.log("PROMOSSSSSSSSSS   que hay en productos", producto);

							// Fecha actual
							const fechaActual = new Date();
							// Asegsúrate de que producto.fechaFin sea un objeto Date
							const fechaFin = new Date(producto.fechaFin); // Convertir a Date
							// Calcular la diferencia en milisegundos
							const diferencia = fechaFin - fechaActual;
							// Calcular los días restantes
							const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
							// Formatear la fecha de finalización
							const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
							const fechaFinFormateada = fechaFin.toLocaleDateString('es-ES', opcionesFecha);
							// Crear el texto para el HTML
							let promoTexto;
							if (diasRestantes <= 2) {
								promoTexto = `<p style="color: red;"><strong>Esta promo finaliza el: ${fechaFinFormateada}, restan ${diasRestantes} días. Aprovecha ahora, se termina!</strong></p>`;
							} else {
								promoTexto = `<p><strong>Esta promo finaliza el: ${fechaFinFormateada}, restan ${diasRestantes} días.</strong></p>`;
							}
							const promocionesRestantes = producto.cantidadDisponible - producto.cantidadPromoVendidas;

							const promosCard = `
							<div id="coloreateProm${producto._id}" align="center" class="cardH card m-2" style="display:inline-flex;background:transparent ;width: 550px; margin: 20px auto;">
								<div class="card-header text-center">
									<h5 class="card-title" id="headerPromo${producto._id}">
										${producto.nombrePromocion}
									</h5>
								</div>
								<div class="card-body row g-0 text-center">
									<div class="col-md">
										<div id="carousel${producto._id}" class="carousel slide" data-bs-ride="carousel">
											<div class="carousel-inner">
												${producto.rutaSimpleImg.map((img, index) => `
													<div class="carousel-item ${index === 0 ? 'active' : ''}">
														<div style="position: relative; display: inline-block;">
															<img src="${img}" id="image-${producto._id}-${index}" alt="Producto" class="img-fluid d-block w-100" style="cursor: pointer;"/>
														</div>
													</div>
												`).join('')}
											</div>
											<a class="carousel-control-prev" href="#carousel${producto._id}" role="button" data-bs-slide="prev">
												<span class="carousel-control-prev-icon" aria-hidden="true"></span>
												<span class="visually-hidden">Previous</span>
											</a>
											<a class="carousel-control-next" href="#carousel${producto._id}" role="button" data-bs-slide="next">
												<span class="carousel-control-next-icon" aria-hidden="true"></span>
												<span class="visually-hidden">Next</span>
											</a>
										</div>
									</div>
									<div class="col-md text-center" align="center">
										<div class="card-body d-flex flex-column align-items-center">
											<div class="d-flex align-items-center justify-content-between w-100">
												<p><strong>Precio: $${formatoMoneda(producto.precioInicial)} </strong></p>
												<p><strong>Descuento: ${producto.descuento}% </strong></p>
											</div>
											<p class="text-center mt-2 p-1 text-bg-info" style="font-size: 1.4rem; margin-bottom: 10px;">
												<strong>Precio Final: $${formatoMoneda(producto.precio)} </strong>
											</p>
											<div class="text-center">
												<div id="promoQuantities${producto._id}">
													${producto.cantLlevar && producto.cantPagar ? `
														<div class="d-flex justify-content-center">
															<p style="margin: 0px;">
																<strong>Llevas ${producto.cantLlevar} y pagas ${producto.cantPagar}</strong>
															</p>
														</div>` : `
														<p><em>Sin promo por cantidades</em></p>`}
													<p style="margin:0; color: ${promocionesRestantes <= 3 ? 'red' : 'black'}">
														<strong>Quedan ${promocionesRestantes} promociones: </strong>
													</p>
													<p>${promoTexto}</p>
													<!-- Botones y input centrados -->
													<div class="col-4 d-flex flex-column align-items-center" style="margin:auto">
														<div class="d-flex align-items-center">
															<button class="btn btn-outline-secondary decrementP" type="button" data-id="${producto._id}" style="height: 38px; width: 40px;">-</button>
															<input type="number" data-cantidad-id="${producto._id}" name="cantidad" value="1" id="infoInputPrmo${producto._id}" min="1" max="${promocionesRestantes}" class="form-control text-center mt-0 " style="width: 60px; height: 37px; padding: 0;" required>
															<button class="btn btn-outline-secondary incrementP" type="button" data-id="${producto._id}" style="height: 38px; width: 40px;">+</button>
														</div>
													</div>
													<button type="button" class="btn btn-primary add-to-cart" id="BTNCarrito${producto._id}" data-producto-id="${producto._id}">
														Agregar al Carrito <span class="fas fa-shopping-cart"></span>
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="card-footer text-center">
									<button type="button" class="btn btn-info description-toggle" data-bs-toggle="collapse" 
										data-bs-target="#descriptionContainer${producto._id}" aria-expanded="false" 
										aria-controls="descriptionContainer${producto._id}">
										Descripción del producto
									</button>
									<div align="left" class="collapse" id="descriptionContainer${producto._id}">
										<p>${producto.descripcionPromocion}</p>
									</div>
								</div>
							</div>
							`;

						// para ver las imgenes gigantes
						document.addEventListener('click', function(event) {
							//console.log("Carrousel ID encontrado:000000",event.target);
							//const idProduct = dataGigante.idProduct
							const imgGiga   = producto.rutaSimpleImg
							const Desscript = producto.descripcionPromocion
							const idProduct = producto._id
							dataGigante = {imgGiga, Desscript, idProduct}
							if (event.target.id) {
								const id = event.target.id
								//console.log("Carrousel ID encontrado:00088888888888888000",id === idProduct);
								if (id === idProduct) {
									console.log("jnfdscvnjfnvjfnvjn",id)
									abrirImgGigante(dataGigante);
								}
							} 
						});


						// Escucha los clics en los botones de incremento y decremento
						document.addEventListener('click', function(event) {
							if (event.target.matches('.incrementP')) {
								const id = event.target.getAttribute('data-id');
								const input = document.querySelector(`#infoInputPrmo${id}`);
								let currentValue = parseInt(input.value);
								if (!isNaN(currentValue)) {
									input.value = currentValue + 1;
								}
							} else if (event.target.matches('.decrementP')) {
								const id = event.target.getAttribute('data-id');
								const input = document.querySelector(`#infoInputPrmo${id}`);
								let currentValue = parseInt(input.value);
								if (!isNaN(currentValue) && currentValue > 1) {
									input.value = currentValue - 1;
								}
							}
						});

						// Crear un elemento div para contener el HTML
						const div = document.createElement('div');
						div.innerHTML = promosCard;
	
						// Obtener la tarjeta de producto dentro del div
						const cardElement = div.querySelector('.card');
	
						// Agregar event listener al elemento de la tarjeta para escuchar el clic
						cardElement.addEventListener('click', function(event) {
							// Verificar si el clic ocurrió en un botón de agregar al carrito
							if (event.target.classList.contains('add-to-cart')) {
								const idProducto = event.target.dataset.productoId;
								const inputCantidad = document.getElementById(`infoInputPrmo${idProducto}`).value || 1;
								const ok = true;
								console.log("Agrega Promocion al carrito", idProducto, inputCantidad);
								armarListaDelCarritoProm(idProducto, inputCantidad, ok);
							}
						});
	
						// Agregar la tarjeta al contenedor de categorías
						categoriaContainer.appendChild(cardElement);
	
						}
					});
				});
			} else {
				const cardHtml = ` 
				<div style="width: 800px; height: 600px;">
					<br><br><br><br>
					<h3>¡Esta tienda online aun no tiene promociones, solicitale una!</h3>
					<img src="../img/alfisaludo.png" alt="" srcset="" class="h-50 ">
				</div>`;
				contenedorProductosServicios.innerHTML += cardHtml;
			}
		
			// funciones del carrito compras 
		}
		// busca, revisa y renderiza todos los productos que se venden en el ecommerce
		obtenerProductosYPromociones();


		//funcion que pone los producto dentor del carrito de compras
		function armarListaDePedido(idProducto, cantidades, ok ) {
			//console.log("1111Armando el carrito",idProducto, cantidades, ok )
			//busca el producto seleccionado para el carrito de todos los productos en el array Categorias
			function encontrarProductoPorIdEnCategorias(categorias, idProducto) {
				//console.log("22222Armandoel carrito", categorias, idProducto )
				for (const categoria in categorias) {
					const productosEnCategoria = categorias[categoria];
					const productoEncontrado = productosEnCategoria.find(producto => producto._id === idProducto);
					if (productoEncontrado) {
						return {
							categoria,
							producto: productoEncontrado
						};
					}
				}
				
				return null; // Retorna null si el producto no se encuentra en ninguna categoría
			}
				const product = encontrarProductoPorIdEnCategorias(categorias, idProducto) 
				const producto = product.producto
				// Obtener información del producto seleccionado
				const nombreProducto  = `${producto.nombreProducto}`;
				const cantidad        = parseInt(cantidades, 10);
				const precio          = parseFloat(`${producto.precio}`);
				const imagen          = `${producto.rutaSimpleImg[0]}`;
				const descripcion     = `${producto.descripcion}`;
				const idCliente       = ""

				// Crear un objeto del pedido con la información del producto solicitado
				const pedido = {idCliente, descripcion, imagen, nombreProducto, cantidad, precio, idProducto };
				//console.log("Contenido del pedido :", pedido);

				// Clonar la lista de pedidos para evitar afectar el estado anterior
				pedido.subTotal      = cantidad * precio
				

				// compara el pedido con lo que esta guardado en listaPedido y lo diferente lo incluye
				//console.log("Que lista de pediido llega a armar listaPedido", listaPedido)

				const cheIngresado = listaPedido.find(e => e.idProducto === idProducto)
				
				// SI NO elmino y NO esta ya en listapedidos se pushea la lsta de pedidos
				if (oky === false && !cheIngresado) {
					oky = true
					listaPedido.push(pedido);
				}
				oky = false
				let listaPedidoClone = [...listaPedido];
				armarCarrito(listaPedidoClone, oky )
		}

		function abrirImgGigante(dataGigante) {
			//console.log("Entro a agrandar las imágenes", dataGigante);
			const { imgGiga, Desscript } = dataGigante;
			
			// Obtener el elemento del carrusel
			const carouselInnerPromo = document.getElementById('carouselInnerPRods').querySelector('.carousel-inner');
			carouselInnerPromo.innerHTML = ''; 
			
			
// Agregar dinámicamente las imágenes del producto al carrusel
imgGiga.forEach((img, index) => {
    const carouselItemPromo = document.createElement('div');
    carouselItemPromo.classList.add('carousel-item');
    
    if (index === 0) {
        carouselItemPromo.classList.add('active');
    }
    
    carouselItemPromo.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 50% !important; ">
            <img src="${img}" class="d-block" alt="" style="max-width: auto; height: 50% !important; object-fit: contain !important;">
        </div>
		<div>
			<h4>${Desscript}</h4>
		</div>
    `;

    carouselInnerPromo.appendChild(carouselItemPromo);
});

			
			// Abre el modal después de agregar todas las imágenes al carrusel
			var myModalPromo = new bootstrap.Modal(document.getElementById('imagenModalPRomos'));
			myModalPromo.show();
		}

		// funciones autoimaticas paraa verificar si hay comrpas en el carrito y si el cliente esta logeado
		async function automatismo() {
			let dataOwner = sessionStorage.getItem("dataOwner") ? JSON.parse(sessionStorage.getItem("dataOwner")) : {};
			//console.log("Entro a automatismo Que datos obtuvos desde rescueData en datos iniciales??????????", dataOwner)
			await agregarClase(dataOwner.desingShop);
			//proceso de activacion suave de todo el ecommerce
			async function activarTiendaOnline() {
				// Función para mostrar el menú barra arriba muy lentamente
				var menuOn = document.getElementById('barraMenuArriba');
				let opacity = 0; // Comenzamos desde 0
				menuOn.style.display = 'none'; // Asegúrate de que sea 'flex' para alinearlos horizontalmente
				menuOn.style.opacity = '0'; // Invisible al principio
				const checkDataOwner = setInterval(async () => {
					if (dataOwner) {
						menuOn.style.display = 'flex'; // Asegúrate de que sea 'flex' para alinearlos horizontalmente
						clearInterval(checkDataOwner); // Detenemos el intervalo cuando encontramos dataOwner
						const interval = setInterval(() => {
							if (opacity >= 1) {
								clearInterval(interval); // Detenemos el intervalo cuando la opacidad alcanza 1
							} else {
								//console.log("LLEgo hasta empezar a diseñar la pagina")
								opacity += 0.025; // Aumentamos la opacidad
								menuOn.style.opacity = opacity; // Aplicamos la nueva opacidad
							}
						}, 100); // Cada 100 milisegundos

						// imprime el fondo de pantalla del ecommerce
						const fondoPantalla = dataOwner.fondoPantalla;
						const bannerSection = document.getElementById('banner2233');
						bannerSection.style.position = 'relative';
						bannerSection.style.overflow = 'hidden'; // Asegurar que la imagen no se salga del contenedor
						bannerSection.style.width = '100%'; // Asegurar que el contenedor ocupe el 100% del ancho
						bannerSection.style.height = '100vh'; // Asegurar que el contenedor ocupe el 100% de la altura de la ventana
						
						// Crear la imagen
						const img = new Image();
						img.src = fondoPantalla;
						img.alt = 'Fondo de pantalla';
						img.style.position = 'absolute';
						img.style.top = '0';
						img.style.left = '0';
						img.style.width = '100%';
						img.style.height = '100%';
						img.style.objectFit = 'cover';
						img.style.opacity = '0';
						img.style.transition = 'opacity 3s ease-in';
						img.style.zIndex = '-1';
						img.classList.add('fade-in');
						img.onload = function() {
							img.style.opacity = '1';
						};
						
						// Agregar la imagen y el contenedor del spinner al bannerSection
						bannerSection.insertBefore(img, bannerSection.firstChild);
						
						// Agrega el logo del ownerEcom
						if (dataOwner.pathLogo) {
							const logoEcomm = document.getElementById("logoSigUp");
							logoEcomm.innerHTML = `<img src="${dataOwner.pathLogo}" style="width: auto; height: 250px; border-radius: 50%;">`;
							//inserta el logo en el menu principal
							const logoEcomm2 = document.getElementById("logoOwner222");
							logoEcomm2.innerHTML = `
								<img src="${dataOwner.pathLogo}" style="width: 100px; height: 100px; border-radius: 50%; margin-top:1rem ">
							`;
						}

						// agrega el color al, icono noticias si hay noticias nuevas
						const cheqNewsC = dataOwner.flagNews
						if (cheqNewsC) {
							sessionStorage.setItem("flagNews", JSON.stringify({ flagNews: true }));
						}
						const cheqNewsColor = JSON.parse(sessionStorage.getItem("flagNews"));
						const cheqNewsCerrado = JSON.parse(sessionStorage.getItem("flagNewsCerrado"));
						//console.log("LLEgo hasta qui y cambio el color de la corneta news", cheqNewsCerrado)
						// Verifica si hay noticias nuevas
						if (cheqNewsColor ){
							if (cheqNewsColor.flagNews && cheqNewsCerrado === null || cheqNewsCerrado.flagNewsCerrado === false) {
								const iconCorneta = document.getElementById("corneta");
								iconCorneta.style.color = "green"; 
								console.log("LLEgo hasta qui y cambio el color de la corneta news", cheqNewsColor)
							}
						}

						// Inserta el nombre del comercio en el signIn y la barra del menú principal
						const nombreDueno = document.getElementById("duenoEcom22");
						// Limpia el contenido existente en el elemento
						nombreDueno.innerHTML = "";

						const nombreComercio = dataOwner.ecommerceName;

						const nombreTitulo = document.getElementById("titulo");
						nombreTitulo.innerHTML = `${nombreComercio}`;

						// Crea un nuevo elemento div para contener el nombre del dueño
						const nombreDuenoC = document.createElement('div');

						// Agrega estilos al nuevo elemento div
						nombreDuenoC.style.color = 'white'; // Texto blanco
						nombreDuenoC.style.fontWeight = 'bold'; // Texto en negrita
						nombreDuenoC.style.textAlign = 'center'; // Texto centrado horizontalmente
						nombreDuenoC.style.display = 'flex'; // Utiliza flexbox para centrar verticalmente
						nombreDuenoC.style.alignItems = 'center'; // Texto centrado verticalmente
						nombreDuenoC.style.width = '300px'; // Ancho fijo
						nombreDuenoC.style.overflow = 'hidden'; // Oculta el desbordamiento
						nombreDuenoC.style.whiteSpace = 'nowrap'; // Texto en una sola línea
						nombreDuenoC.style.position = 'relative';

						// Agrega el nombre dle comercio deslzante en la barra alta del ecommerce
						nombreDuenoC.innerHTML = `
							<style>
								.marquee {
									margin-top: 2rem !important;
									color:white !important;
									width: 100%;
									display: inline-block;
									animation: marquee 10s linear infinite;
									font-size: 1.5rem; /* Tamaño de letra */
								}
								@keyframes marquee {
									from {
										transform: translateX(100%);
									}
									to {
										transform: translateX(-100%);
									}
								}
								@media (max-width: 768px) {
									.marquee {
										animation: marquee 8s linear infinite; /* Ajustar la velocidad si es necesario */
									}
								}
							</style>
							<div class="marquee">
								<p>${nombreComercio}</p>
							</div>
						`;

						// Agrega el nuevo elemento div al elemento con id "duenoEcom"
						nombreDueno.appendChild(nombreDuenoC);

						const nombreEcomm = document.getElementById("duenoEcom2288");
						nombreEcomm.innerHTML = `<h5>${nombreComercio}</h5>`;

						// Agrega las noticias y promos
						const newsModal = document.getElementById('newsMmodal');
						const carouselItems741 = document.getElementById('promosincertings2345');

						// Ordenar las noticias del más reciente al más antiguo
						let ownerMensajes = JSON.parse(sessionStorage.getItem('ownerMensajes'));
						ownerMensajes.sort((a, b) => new Date(b.date) - new Date(a.date));
						console.log("que tiene mensajes", ownerMensajes.length)

						// Limpiar el contenido de los contenedores
						newsModal.innerHTML = '';
						carouselItems741.innerHTML = '';

						// Variables para verificar la existencia
						let hasNoticias = false;
						let hasPromos = true;

						// Filtrar noticias
						const noticiasHTML = ownerMensajes.filter(news => news.nweNoticias).map(news => {
							hasNoticias = true;
							return `
								<hr>
	<div class="text-center d-flex flex-column align-items-center justify-content-center">
		<h5>${news.subjectCliente}</h5>
		<img class="d-block w-50 img-fluid carousel-image" src="${news.urlImg}" alt="Noticia Imagen" style="object-fit: contain; max-height: 100%;">
		<p>${news.messageCliente}</p>
	</div>

							`;
						}).join('');
						// Filtrar promociones
						const promosHTML = ownerMensajes.filter((proms, index) => proms.nwePromoOk).map((news, index) => {
							hasPromos = true;
							const isActive = index === 0 ? 'active' : '';
							return `
							
						<style>
													.carousel-content {
														zIndex: 9;
														text-align: center;
														max-width: 700px;
														margin: 10px auto;
														padding: 20px;
														border-radius: 10px;
														opacity: 0.7;
													}
													.carousel-image {
														object-fit: contain;
														display: block;
														margin: 5px auto; /* Centrar y agregar margen */
														border-radius: 1rem !important;
													}
													.carousel-caption {
														text-align: center;
													}
													@media (max-width: 450px) {
														.carousel-image {
															height:200px; 
															width:200px
														}
													}
												</style>
		<div class="carousel-item ${isActive}">
			<br><br>
			<h5>Nueva promo</h5>
			<img class="carousel-image" style="opacity:0.6; height:300px; width:300px; border-radius: 50% !important" src="${news.urlImg[0]}" alt="Noticia Imagen">
			<h6>Ver en promociones & descuentos</h6>
		</div>

							`;
						}).join('');

						// Renderizar contenido de las noticias
						if (hasNoticias ) {
							newsModal.innerHTML = noticiasHTML;
							//newsModal.innerHTML = promosHTML;
						}

						// Renderiza las promos en la pagina principal
						if (hasPromos && dataOwner.mostrarPromoPPrin) {
							carouselItems741.innerHTML = promosHTML;
						}

						// Agrega las redes sociales
						const socialLinks = dataOwner.linksredesSociales;
						if (socialLinks) {
							const savedLinksContainer = document.getElementById('savedlinks989').querySelector('ul');
							const savedLinksContainer2 = document.getElementById('redesSocialesLinks').querySelector('ul');
							savedLinksContainer.innerHTML = "";
							savedLinksContainer2.innerHTML = "";

							const socialPlatforms = {
								facebook: { icon: 'fab fa-facebook', color: '#3b5998' },
								twitter: { icon: 'fab fa-twitter', color: '#1da1f2' },
								X: { icon: 'fab fa-instagram', color: 'orange' },
								linkedin: { icon: 'fab fa-linkedin', color: '#0077b5' },
								youtube: { icon: 'fab fa-youtube', color: '#ff0000' },
							};

							Object.entries(socialLinks).forEach(([platform, url]) => {
								if (url) {
									const listItem1 = document.createElement('li');
									listItem1.classList.add('list-inline-item');
									listItem1.innerHTML = `
										<a href="${url}" target="_blank" class="social-link" style="color: ${socialPlatforms[platform].color}">
											<i class="${socialPlatforms[platform].icon} social-icon" style="font-size: 3em;"></i>
										</a>
									`;
									savedLinksContainer.appendChild(listItem1);

									const listItem2 = document.createElement('li');
									listItem2.classList.add('list-inline-item');
									listItem2.innerHTML = `
										<a href="${url}" target="_blank" class="social-link" style="color: ${socialPlatforms[platform].color}">
											<i class="${socialPlatforms[platform].icon} social-icon" style="font-size: 3em;"></i>
										</a>
									`;
									savedLinksContainer2.appendChild(listItem2);
								}
							});
						}
						var offcanvasRight = document.getElementById('offcanvasRight');
						offcanvasRight.addEventListener('shown.bs.offcanvas', function () {
							document.body.style.paddingRight = offcanvasRight.offsetWidth - offcanvasRight.clientWidth + 'px';
						});
				
						offcanvasRight.addEventListener('hidden.bs.offcanvas', function () {
							document.body.style.paddingRight = '';
						});

						document.getElementById('insertLogo').innerHTML = "";

					}
					else{
							menuOn.style.display = 'flex'; // Asegúrate de que sea 'flex' para alinearlos horizontalmente
							menuOn.style.opacity = '1'; // Invisible al principio
							menuOn.innerHTML = '<h3 style="color: red; font-size: 2rem;">Revisa tu conexión a internet, es muy lenta o no tienes.</h3>';
						}
				}, 100); // Revisamos cada 1 segundo si "dataOwner" está disponible
				return true
			};
			const onTiendaOn = await activarTiendaOnline();
			// verifica si hay algún cliente logeado
			let clienteEcomm = {}
			let jwToken = {}
			if (onTiendaOn) {
				async function revisarSiHayPedidoPendiente() {
					// revisa si tienens algun pedido pendiente
					const pedidoPendientes = JSON.parse(sessionStorage.getItem('pedidoCarritoPendientePago'));
					const dataCliente = JSON.parse(sessionStorage.getItem('clienteEcomm'))
					// revisa si hay un pedido pendiente
					console.log("3 Que pedido pendiente encontro?", pedidoPendientes);
					//Pedido pendiente con y sin cliente logeado carrito abandonado
					if (pedidoPendientes && pedidoPendientes.length >= 1) {
						console.log("Entro en el filtro que detecta un pedido pendiente de procesar");
						// Obtiene la fecha actual
						const fechaActual = new Date();
						// Obtiene la fecha del pedido pendiente
						const fechaPedido = new Date(pedidoPendientes[0].timeP);
						// Compara las fechas para verificar si la diferencia es menor a 5 minutos
						const diferenciaMinutos = Math.floor((fechaActual - fechaPedido) / (1000 * 60));
						// Pregunta al usuario si desea terminar el pedido pendiente
						if (diferenciaMinutos < 5) {
							//console.log("El pedido tiene menos de 5 minutos de realizado");
							// Abre el modal SI tiene un cliente logeado solo muestra el modal
							if (dataCliente) {
								dataOwner = JSON.parse(sessionStorage.getItem('dataOwner')) || JSON.parse(sessionStorage.getItem('DataOwnerEcom'));
								console.log("El cliente SI esta logeado ", dataOwner._id);
								// re arma el carrito
								pedidoPendientes.forEach(element => {
									listaPedido.push(element)
								});
								oky = false
								// arma el carrito
								await armarCarrito(listaPedido, oky )
								await costoEnvio(dataCliente, dataOwner )
								
								// cambia de color el carrito a ROJO cuando encuentra un pedido xon o sin cliente asignado
								const carritoLleno     = document.getElementById("carriToxico");
								carritoLleno.innerHTML = ""
								const AElement        = document.createElement("a");
								AElement.style.cursor = "pointer";
								// Asignar el contenido HTML icono del carrito a rojo
								AElement.innerHTML = `
									<a class="fas fa-shopping-cart" data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample" style="color:green !important"></a>
								`;
								// Agregar el elemento li al elemento signIn
								carritoLleno.appendChild(AElement);

								const costoDelEnvio = JSON.parse(sessionStorage.getItem('costoDelivery')) || []

								const innerEnvioElement = document.getElementById("CostoEnvio123");
								const innerCostoDel = document.getElementById("delivery6546");	
								//console.log("COSTO ENVIO   8888888888Este es el costo del envio costEnvioNumber", costoDelEnvio)
								if (costoDelEnvio.length >= 1) {
									innerCostoDel.textContent = `${costoDelEnvio[0]}`
									innerEnvioElement.textContent = `${costoDelEnvio[0]}`
								}

								// revisa si es un pedido pagado por MP wallet
								const currentURL = window.location.href;
								const urlParams = new URLSearchParams(new URL(currentURL).search);
								const statusCobro = urlParams.get('statusCobro');
								//console.log("Que tiene statusCobro?", statusCobro);
								if (!statusCobro) {
									//console.log("Encontro un pedido Que no a sido cobrado",statusCobro)
									// Muestra una alerta dentro del modal si ya estas registrado
									const mensaje = `<p style="text-transform: none !important; text-decoration: none !important;">
									Tienes un pedido pendiente para procesar. <br> 
									<br>
									Haz clic en <strong>"Confirmar"</strong> si deseas pagarlo. <br>
									<br>
									Si deseas eliminar todos los productos del carrito, haz clic en <strong>"Cancelar"</strong> <br>
									<br>
									También puedes presionar la <strong>"X"</strong> en la esquina superior derecha si deseas seguir agregando productos.
										</p>`;
									// modal de opcion que avisa que tienes un pedido pendiente de procesar
									const confirma = async function () {
											mostrarModalLoading()
											const tipoDePago = pedidoPendientes[0].tipoDePago
											//console.log("Que tipo de pago es??????????????????????????????????????????",tipoDePago)
											if (tipoDePago && tipoDePago == "Pago Contra Factura") {
												//console.log("SI es pago contra entrega", tipoDePago);
												await averiguandoDireccionEntrega(tipoDePago)
											}
											else{
												//console.log("Paga con MPWallet", tipoDePago);
												// Almacena la lista de productos en sessionStorage con la clave "pedidoCarritoPendientePago"
												const stringylistaPedido = JSON.stringify(listaPedido)
												sessionStorage.setItem("pedidoCarritoPendientePago", stringylistaPedido);
												//console.log("que listado de pedidos guarda desde pagar",stringylistaPedido )
												dataOwner = JSON.parse(sessionStorage.getItem('dataOwner'))
												//console.log("Oprimio el boton de pago mpWallet id=btnPagar007", dataOwner._id)
												// si no hay ningun pedido te avisa y reinicia la pagina
												if ( listaPedido.length == 0  ) {
													mostrarAlerta("agrega algún producto al carrito")
													// Esperar 1 segundos (3000 milisegundos)
													setTimeout(() => {
														// Recargar la página
														window.location.reload();
													}, 1500);
													return
												}
												let dataCliente = JSON.parse(sessionStorage.getItem('clienteEcomm'))
												if ( !dataCliente  ) {
													await ocultarModalLoading()
													mostrarAlerta("Logeate para continuar")
													// si no hay nadie logeado debe inscribirse o logerse
													// Recargar la página
													setTimeout(() => {
														// Recargar la página
														window.location.reload();
													}, 1500);
													return
												}
												// envia el boton de mercado pago al modal de la seleccion de medios de pago
												// Mostrar el modal
												// const modal = new bootstrap.Modal(document.getElementById('staticBackdropMediosPago'));
												// modal.show();
												// Llamar a la función mpWallet después de un breve retraso para asegurarse de que el modal se haya mostrado completamente
												setTimeout(() => {
													mpWallet(clienteEcomm, dataOwner);
												}, 500); // Ajusta este valor según sea necesario
											} 
									}
									const rechaza = function rechaza() {
										sessionStorage.removeItem('pedidoCarritoPendientePago');
									}
									confirmOptions(mensaje, confirma, rechaza);
								}
								if (statusCobro === "failed") {
									//console.log("se devolvio desde MP sin pagar o viene de Wallet MP",statusCobro)
									//mensajeAlert("Vo")
									location.href = await dominioUrl();
								};
							} 
							else {
								console.log("El cliente NO esta logeado que datos del pedido hay en el sessionStorage?",pedidoPendientes);
								// re arma el carrito
								pedidoPendientes.forEach(element => {
									listaPedido.push(element)
								});
								oky = false
								armarCarrito(listaPedido, oky )
								//sessionStorage.removeItem('pedidoCarritoPendientePago');
								console.log("Encontró un pedido con menos de 5 minutos de echo y no esta logeado el CLIENTE que hay en lista pedidos", pedidoPendientes);
								const modalUsuario = new bootstrap.Modal(document.getElementById('usuario'), {
									backdrop: 'static',  // Evita que el modal se cierre haciendo clic fuera de él
									keyboard: false  // Evita que el modal se cierre con la tecla Esc
								});
								modalUsuario.show();
								// Muestra una alerta dentro del modal
								mostrarAlerta("Ingresa o Inscribete y termina tu pedido");
							}
						} else {
							// Si la diferencia es mayor a 5 minutos, elimina el pedido pendiente del almacenamiento local
							sessionStorage.removeItem('pedidoCarritoPendientePago');
						}
					}
				};
				async function revisaExisteClienteLogeado() {
					// verifica si hay algún cliente logeado
					clienteEcomm = JSON.parse((sessionStorage.getItem('clienteEcomm')))
					jwToken = sessionStorage.getItem('jwtToken')
					console.log("1revisaExisteClienteLogeado que cliente encontro?", clienteEcomm);
					if (clienteEcomm === null) {
						sessionStorage.removeItem('jwtToken');
					}
					//Si encuentra un cliente o un token lo procesa en el Frontend para activar las intancias de cliente logeado.
					if (clienteEcomm && jwToken ) {
						// let clienteEcommFresh = clienteEcomm || await actualizarDatosCliente();
						let clienteEcommFresh = clienteEcomm 
						// Obtener la dirección IP del equipo
						const { idCliente, nombre } = clienteEcommFresh
						// busca los mensaje del cliente y los renderiza
						const mensajesCliente = ownerMensajes.filter(id => id.idCliente === clienteEcommFresh._id) 
						//console.log("que revisaExisteClienteLogeado mensajes del cliente encontro??????", mensajesCliente)
						// Iterar sobre los mensajes y mostrarlos
						mensajesCliente.forEach(async mensaje => {
							mostrarMensajePush(mensaje.subjectCliente, mensaje.messageCliente, mensaje._id);
						});

						// Se debe poner el nombre y poner en verde el ícono del usuario
						const iconoUser              = document.getElementById("chekUser");
						iconoUser.innerHTML          = "";
						const newIconUser            = document.createElement('a');
						newIconUser.className        = "fas fa-user text-success";
						newIconUser.id               = "logo";
						newIconUser.style.margin     = "0 !important";
						newIconUser.style.padding    = "0 !important";
						newIconUser.dataset.bsToggle = "modal";
						newIconUser.dataset.bsTarget = "#dataUsuario";
						iconoUser.appendChild(newIconUser);

						// Inserta el nombre del cliente en el signIn y la barra del menú principal
						const nombreUserio = document.getElementById("nombreUserArriba");
						// Limpia el contenido existente en el elemento
						nombreUserio.innerHTML = "";
				
						const nombr23e = nombre;
				
						// Crea un nuevo elemento div para contener el nombre del dueño
						const nombreUser8547 = document.createElement('div');
				
						// Agrega estilos al nuevo elemento div
						nombreUser8547.style.color = 'white'; // Texto blanco
						nombreUser8547.style.fontWeight = 'bold'; // Texto en negrita
						nombreUser8547.style.textAlign = 'center'; // Texto centrado horizontalmente
						nombreUser8547.style.display = 'flex'; // Utiliza flexbox para centrar verticalmente
						nombreUser8547.style.alignItems = 'center'; // Texto centrado vert1icalmente
						nombreUser8547.style.width = '100%'; // Ancho fijo
						nombreUser8547.style.overflow = 'hidden'; // Oculta el desbordamiento
						nombreUser8547.style.whiteSpace = 'nowrap'; // Texto en una sola línea
						nombreUser8547.style.position = 'relative';

						// Agrega el contenido HTML al nuevo elemento div con el CSS incluido
						nombreUser8547.innerHTML = `
							<style>
							.marquees {
								margin-top: 2rem !important;
								color:white !important;
								width: 100%;
								display: inline-block;
								animation: marquees 10s linear infinite;
								font-size: 1.5rem; /* Tamaño de letra */
							}
							@keyframes marquees {
								from {
								transform: translateX(100%);
								}
								to {
								transform: translateX(-100%);
								}
							}
							@media (max-width: 768px) {
								.marquees {
									animation: marquees 10s linear infinite; /* Ajustar la velocidad si es necesario */
								}
							}
							</style>
							<div class="marquees">
							<p>¡Hola, ${nombr23e}! ¿Que vamos a comprar hoy?</p>
							</div>
						`;
						// Agrega el nuevo elemento div al elemento con id "duenoEcom"
						nombreUserio.appendChild(nombreUser8547);

						// SALIR cerrar sesion agrega el boton salir al menu
						const salir = document.getElementById("salir");
						const btnSalir = document.createElement("a");
						btnSalir.setAttribute("href", "#");
						btnSalir.innerText = "Salir";
						salir.appendChild(btnSalir);

						// agrega el boton Mis datos al menu
						const signIn           = document.getElementById("signIn23");
						signIn.innerHTML = ""
						const liElement        = document.createElement("i");
						// liElement.className    = "links";
						// liElement.style.margin = "-6rem, -4rem -4rem 8rem !important"; // Ajuste de estilo CSS
						liElement.style.cursor = "pointer";
						// Asignar el contenido HTML al elemento li
						liElement.innerHTML = `
						<a data-bs-toggle="modal" data-bs-target="#dataUsuario">Mis datos</a>
						`;
						liElement.style.transition = "transform 0.5s ease"; // Agrega una transición suave al efecto de zoom
						// Agregar el elemento li al elemento signIn
						signIn.appendChild(liElement);

						let dataC = clienteEcommFresh

						// Agrega el logo del usuario al menú
						const domLogoUser = document.getElementById("logoUser21");
						domLogoUser.innerHTML = "";

						// Crea un elemento de imagen
						const imgElement = document.createElement("img");
						imgElement.className = "logoUser";
						imgElement.style.margin = "auto"; // Ajuste de estilo CSS
						imgElement.style.cursor = "pointer";
						imgElement.src = dataC.imgCli; // Reemplaza "URL_DE_LA_IMAGEN" con la URL real de la imagen
						imgElement.style.width = "90px"; // Establece el ancho de la imagen
						imgElement.style.height = "90px"; // Establece la altura de la imagen
						imgElement.style.borderRadius = "50%"; // Hace la imagen redonda
						imgElement.style.transition = "transform 0.5s ease"; // Agrega una transición suave al efecto de zoom

						// Aplica el efecto de zoom al hacer hover sobre la imagen
						imgElement.addEventListener("mouseenter", () => {
							imgElement.style.transform = "scale(1.051)"; // Aumenta la escala al 110% cuando se le hace hover
						});

						// Revierte el efecto de zoom cuando se quita el hover de la imagen
						imgElement.addEventListener("mouseleave", () => {
							imgElement.style.transform = "scale(1)"; // Restaura la escala original cuando se quita el hover
						});

						// Crea un elemento de enlace
						const linkElement = document.createElement("a");
						linkElement.setAttribute("data-bs-toggle", "modal");
						linkElement.setAttribute("data-bs-target", "#dataUsuario");

						// Agrega el elemento de imagen como hijo del enlace
						linkElement.appendChild(imgElement);

						// Agrega el elemento de enlace al contenedor domLogoUser
						domLogoUser.appendChild(linkElement);

					} 
				};
				const accionSalir = document.getElementById("salir");
				accionSalir.addEventListener("click", function(event) {
					event.preventDefault(); // Evitar el comportamiento predeterminado del enlace
					vuelvePronto(`Chau ${clienteEcomm.nombre}, Vuelve pronto`)
					// Puedes redirigir a la página de inicio u otra página después de eliminar los datos del almacenamiento local
					setTimeout(async () => {
						sessionStorage.removeItem("clienteEcomm")
						sessionStorage.removeItem("DataOwnerEcom")
						await borrarsessionStorage()
						// Recargar la página
						location.reload();
					}, 2000); 
				});
				await revisaExisteClienteLogeado ();
				await revisarSiHayPedidoPendiente();
				// detecta si el url viene con un pago de Mercado PAgo
				async function detectandoPagoEnUrl() {
					console.log("Entro a detectar el pago en URL")
					// Obtener la URL actual del navegador
					const currentURL = window.location.href;
					// Parsear la URL para obtener los parámetros de consulta
					const urlParams = new URLSearchParams(new URL(currentURL).search);
					// Obtener los valores de los parámetros de consulta
					const statusCobro = urlParams.get('statusCobro');
					const okCobroMP = urlParams.get('okCobroMP');
					// Revisa y renderiza la dirección de envío del pedido pagado con wallet de MP desde la URL de regreso del backend desde MP
					if (statusCobro) {
						if (statusCobro === "approved" && okCobroMP) {
							// Seleccionar el modal por su id
							var modal = document.getElementById('opciones');
							modal.style.display = 'none';
							modal.innerHTML = "";
							// Mostrar el modal de las direcciones guardadas
							const tipoCobro = "Mercado Pago";
							// Atni hac revisar si viene repetido el mismo codigo de producto
							averiguandoDireccionEntrega(tipoCobro);
						} else {
							mostrarAlerta("Tu pedido NO pudo cobrarse, elige otro medio de pago");
							// Recargar la página después de 5 segundos
							setTimeout(async () => {
								location.href = await dominioUrl();
							}, 2000);
						}
					}
				}
				await detectandoPagoEnUrl();
			} 
		await detectPromosparams()
		}
	}); //fin DOMContentLoaded

	//*********debe quedar AFUERA del DOMContentLoaded*************************************************************

	// funcion que busca primero las direcciones de envio y despues cobra y GUARDA EL EPDIDDO EN sessionStorage
	async function averiguandoDireccionEntrega(tipoCobro) {
		// cierra el carrito
		$('#offcanvasExample').modal('hide');
		// revisa si ya esta logeado
		const jwtToken      = sessionStorage.getItem('jwtToken');
		const clienteEcomm  = JSON.parse(sessionStorage.getItem('clienteEcomm'));
		// console.log("Entro a la funcion averiguandoDireccionEntrega", clienteEcomm.direcciones.length)
		// Evitar el envío predeterminado del formulario
		try {
			// Asignar la fecha actual al atributo timeP de cada elemento del array
			const fechaActual = new Date();
			listaPedido.forEach(pedido => {
				pedido.timeP      = fechaActual; // Agregar el atributo timeP a cada elemento del array
				pedido.tipoDePago = tipoCobro
			});
			// guardar el nuevo pedido en el almacenamiento local
			sessionStorage.setItem("pedidoCarritoPendientePago", JSON.stringify(listaPedido));
			/// revisa si ya esta logueado
			if (jwtToken && clienteEcomm) {
				//mostrarModalLoading()
				// revisa si tienens algun pedido pendiente
				const pedPendiente2        = sessionStorage.getItem('pedidoCarritoPendientePago');
				const pedidoPendientes     = JSON.parse(pedPendiente2);
				const DatapedidoPendientes = {pedidoPendientes, jwtToken, clienteEcomm}
				//console.log('QUE HAY EN DATA MANUAL ', DatapedidoPendientes);
				const pedidoJSON2 = JSON.stringify(DatapedidoPendientes);
				//console.log('******El cliente estaba logeado*****datosJsondatosJson', pedidoJSON2);
				const direcciones = clienteEcomm.direcciones
				//console.log('*Direcciones obtenidas del cliente que esta en sessionStorage:', direcciones);
				if (direcciones.length >= 1) {
					// Limpiar el contenido actual de los elementos
					const ingresarDomicilios        = document.getElementById('direccionEnvio11');
					const desaparecerBotonCofnirmar = document.getElementById('cambiarBotonera');
						desaparecerBotonCofnirmar.innerHTML = `
						<button class="btn btn-primary" data-bs-target="#exampleModalToggle2" data-bs-toggle="modal" data-bs-dismiss="modal">Otra dirección</button>`
						ingresarDomicilios.innerHTML = `<h6 style="text-transform: none !important;">Haz clic en una dirección donde te enviarán los productos, o abajo presiona 'Elegir otra dirección'</h6>`;
						console.log("Que direccion hay para enviar:", direcciones)
						direcciones.forEach((direccion, index) => {
							const aqui = document.createElement("div");
							aqui.classList.add("direccion-item"); // Agregar una clase para separar los divs
						
							aqui.innerHTML = `
							<style>
								.direccion-content:hover {
									box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.2);
									transform: scale(1.005);
								}
							</style>
							<div class="direccion-content card" id="direccion-${index}" style="margin: 2rem; cursor: pointer; transition: box-shadow 0.3s, transform 0.3s;">
								<div class="card-header" style="background-color: #f8f9fa; font-weight: bold;">
									Dirección de envío
								</div>
								<div class="card-body" style="background-color: #fff;">
									${direccion.pais ? `<p style="margin: 0;">País: ${direccion.pais}</p>` : ''}
									${direccion.estado ? `<p style="margin: 0;">Ciudad: ${direccion.estado}</p>` : ''}
									${direccion.localidad ? `<p style="margin: 0;">Localidad: ${direccion.localidad}</p>` : ''}
									${direccion.calle ? `<p style="margin: 0;">Calle: ${direccion.calle}</p>` : ''}
									${direccion.numeroPuerta ? `<p style="margin: 0;">Número de Puerta: ${direccion.numeroPuerta}</p>` : 'S/N.P.'}
									${direccion.CP ? `<p style="margin: 0;">Código Postal: ${direccion.CP}</p>` : ''}
								</div>
								<div class="card-footer" style="background-color: #f8f9fa; text-align: right;">
									Haz clic para seleccionar.
								</div>
							</div>
							<style>
								.card:active {
									transform: scale(0.999); /* Achicar la tarjeta al 95% de su tamaño original */
									background-color: red;  /* Cambiar el fondo de la tarjeta a rojo */
									transition: transform 0.2s ease, background-color 0.2s ease; /* Añadir una transición suave */
								}
							</style>
							`;
						
							ingresarDomicilios.appendChild(aqui);
						
							// Agregar el manejador de eventos 'click' para elegir la dirección de envío
							aqui.addEventListener('click', async () => {
								//console.log("Eligio una direccion 999999999999999999999999999999999999999999999999999")
								// mostrarModalLoading()
								await $('#loadingModal').modal('show');
								// Ahora ocultar los modal opciones pago
								$('#usuario').modal('hide');
								// Ahora ocultar los modal opciones direcciones
								$('#exampleModalToggleDir').modal('hide');
								

								// Obtener los datos almacenados en el sessionStorage
								const token = sessionStorage.getItem('jwtToken');
								const dataCliente = sessionStorage.getItem('clienteEcomm');
								const dataPedido = sessionStorage.getItem('pedidoCarritoPendientePago');
						
								// Asegurarse de que la dirección esté completa
								if (direccion.lat && direccion.lng ) {
									const dataCobrar = { direccion, token, dataCliente, dataPedido };
									// Pasa a cobrar el producto
									await cobrarProductos(dataCobrar);
								} else {
									console.error("Faltan datos en la dirección:", direccion);
									mostrarAlerta("La dirección está incompleta. Por favor, selecciona una dirección válida.");
								}
							});
						});
					// Mostrar el modal									
					const modalUsuario = new bootstrap.Modal(document.getElementById('exampleModalToggleDir'), {
						backdrop: 'static',  // Evita que el modal se cierre haciendo clic fuera de él
						keyboard: false  // Evita que el modal se cierre con la tecla Esc
					});
					modalUsuario.show();
				} else {
					console.log('No tienes direcciones guardadas');
					// ocultar el carrito
					$('#offcanvasExample').modal('hide');
					// Mostrar el modal
					const modalUsuario = new bootstrap.Modal(document.getElementById('exampleModalToggleDir'), {
						backdrop: 'static',  // Evita que el modal se cierre haciendo clic fuera de él
						keyboard: false  // Evita que el modal se cierre con la tecla Esc
					});
					modalUsuario.show();
					// Mostrar una alerta dentro del modal
					mostrarAlerta(`No tienes direcciones guardadas. <br> Primero debes registra una direccion de entrega y luego seguimos con la compra.`	);
				}
			} else {
				//NO estaba logueado o inscripto asi que guardar los datos del formulario de la compra en sessionStorage
				mostrarAlerta(`No estás logueado. <br> Se ha guardado tu compra. <br> Inicia sesión o regístrate para completar tu compra.`)
				// Recargar la página después de 5 segundos
				// setTimeout(() => {
				// 	location.reload();
				// }, 5000);
			}
		} catch (error) {
			mostrarAlerta(`No se obtuvo la info de las direcciones de envio del cliente.${error}`)
			//alert(`No se obtuvo la info del sever.${error}`);
		}
	}; 

	// menu del carrito
	const offcanvasExample = new bootstrap.Offcanvas(document.getElementById('offcanvasExample'));
	async function armarCarrito(listaPedidoClone, oky ) {
		const clienteEcom = sessionStorage.getItem("clienteEcom")
		dataOwner   = sessionStorage.getItem("dataOwner") || sessionStorage.getItem("DataOwnerEcom")
		//console.log("Que llegan a la funcion armarCarrito",dataOwner, clienteEcom, listaPedidoClone)
		if (clienteEcom) {
			await costoEnvio(clienteEcom, dataOwner )
		}
		// cambia de color el carrito a ROJO
		const carritoLleno     = document.getElementById("carriToxico");
		carritoLleno.innerHTML = ""
		const AElement         = document.createElement("a");
		AElement.style.cursor  = "pointer";
		// Asignar el contenido HTML al elemento li
		AElement.innerHTML = `
			<a class="fas fa-shopping-cart" data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample" style="color:red !important"></a>
		`;
		carritoLleno.appendChild(AElement);
		const offcanvasBody = document.getElementById('contedorDelProdcto');
		offcanvasBody.innerHTML = ''; // Limpiar el contenido 
		
		// Iterar sobre la lista de pedidos clonada y agregar cada producto al carrito
		listaPedidoClone.forEach(pedidoItem => {
			const { nombreProducto, cantidad, idProducto, imagen, descripcion } = pedidoItem;
			//console.log("Que hay?????? ownerProducts?????", ownerProducts)
			const findAlgo = ownerProducts.find(i => i._id === idProducto) || ownerPromos.find(i => i._id === idProducto);
			//console.log("Que hay???????????",findAlgo)
			const cantProdRest = findAlgo.cantidad || findAlgo.cantidadDisponible - findAlgo.cantidadPromoVendidas
			if (cantProdRest < cantidad) {
				cheqOkComprar = false
				mostrarAlerta(`Quedan ${cantProdRest} unidades de ${nombreProducto} en stock. <br> 
					<br>
					La cantidad que solicitas excede la cantidad disponible. Por favor, reduce la cantidad solicitada.`);
			}else{
				cheqOkComprar = true
			}
			//console.log("Que datos le llegan a la funcion armarCarrito",nombreProducto, cantidad, idProducto, imagen, )
			const precio            = parseFloat(pedidoItem.precio); // Convertir el precio a número
			const cardProducto      = document.createElement('div');
			cardProducto.className  = 'producto-card';
			// Estilos CSS para colocar los elementos uno al lado del otro y ocupar el ancho máximo sin márgenes
			cardProducto.style.display       = 'flex';
			cardProducto.style.flexDirection = 'row';
			cardProducto.style.width         = '100%';
			cardProducto.style.margin        = '0 0 0 -2rem'; // Asegura que no haya márgenes
			cardProducto.style.border        = 'none'; // Asegura que no haya márgenes

			// Estructura HTML del encabezado del producto
			
				// Crear el nuevo elemento div
				const updateCant = document.createElement('div');
				// Actualizar el contenido de updateCant
				// Agregar el código HTML y JavaScript
				updateCant.innerHTML = `
					<div style="margin: 0 0 -4rem 0 !important; display: flex; justify-content: flex-end; color:white !important"> <!-- Alineación a la derecha -->
						<div id="colorDesign" style="border: none; width: 90px; margin: 0 0 0 1.5rem;">
							<div style="padding: auto 1rem;display: flex; align-items: center; margin-top:-0.51rem; border-radius:100rem"> <!-- Contenedor flex para alinear elementos -->
								<button class="disminuir" data-id="${idProducto}" style="width: auto; height: min-content; padding: 2px; background-color: transparent; color: white !important; border: none; font-size: 2.8rem; margin:-8px 10px auto -2px; font-weight: 1200;">
									-
									<style>
										.disminuir:hover {
											color: green !important; /* Cambiar el color a verde al pasar el mouse */
											transform: scale(1.05); /* Aumentar el tamaño en un 5% al pasar el mouse */
										}
								
										.disminuir:active {
											color: red !important; /* Cambiar el color a rojo al hacer clic */
											transform: scale(0.97); /* Disminuir el tamaño en un 3% al hacer clic */
										}
									</style>
								</button>
								<input type="number" name="cantidad" min="1" style="width: 50px !important; margin-right: 5px; padding:5px; background-color: transparent; border: none; color: black; font-weight: 700; font-size: 1.2rem; overflow: visible !important;" placeholder="${cantidad}" id="cantidad${idProducto}" value="${cantidad}"/>
								
								<button class="aumentar" data-id="${idProducto}"  style="width: auto; height: min-content; padding: 2px; background-color: transparent; color: white !important; border: none; font-size: 2rem; margin:-5px 25px 0 -19px; font-weight: 1200;">
									+
									<style>
										.aumentar:hover {
											color: green; /* Cambiar el color a verde al pasar el mouse */
											transform: scale(1.05); /* Aumentar el tamaño en un 5% al pasar el mouse */
										}
								
										.aumentar:active {
											color: red; /* Cambiar el color a rojo al hacer clic */
											transform: scale(0.97); /* Disminuir el tamaño en un 3% al hacer clic */
										}
									</style>
								</button>
							</div>
						</div>
						<div style="border: none; width: 100px; margin: 0 -3rem 0 1rem;" >
							<p style="margin: 1rem;" id="subtotal${idProducto}">$${formatoMoneda(calcularSubtotal(cantidad, precio))}</p>
						</div>
					</div>
				`;

				// Agregar event listener para el contenedor de los botones de + y -
				updateCant.addEventListener('click', function(event) {
					// Verificar si el clic ocurrió en un botón de aumentar
					if (event.target.classList.contains('aumentar')) {
						const idProducto = event.target.dataset.id;
						aumentarCantidad(idProducto);
					}

					// Verificar si el clic ocurrió en un botón de disminuir
					if (event.target.classList.contains('disminuir')) {
						const idProducto = event.target.dataset.id;
						disminuirCantidad(idProducto);
					}
				});

				// Función para aumentar la cantidad
				function aumentarCantidad(idProducto) {
					const inputCantidad = document.getElementById(`cantidad${idProducto}`);
					inputCantidad.value = parseInt(inputCantidad.value) + 1;
					// Recalcular el subtotal
					recalcularSubtotal(idProducto, inputCantidad.value);
				}

				// Función para disminuir la cantidad
				function disminuirCantidad(idProducto) {
					const inputCantidad = document.getElementById(`cantidad${idProducto}`);
					if (parseInt(inputCantidad.value) > 1) {
						inputCantidad.value = parseInt(inputCantidad.value) - 1;
						// Recalcular el subtotal
						recalcularSubtotal(idProducto, inputCantidad.value);
					}
				}

				// Función para recalcular el subtotal
				function recalcularSubtotal(idProducto, nuevaCantidad) {
					// console.log("Que carajo ahy en listado peddo", listaPedido)
					// const findAlgo = ownerProducts.find(i => i._id === idProducto) || ownerPromos.find(i => i._id === idProducto);
					// const cantProdRest = findAlgo.cantidad || findAlgo.cantidadDisponible - findAlgo.cantidadPromoVendidas
					// if (cantProdRest < nuevaCantidad) {
						// 	mostrarAlerta(`Quedan ${cantProdRest} unidades en stock. <br> 
						// 		<br>
						// 		La cantidad que estas colocando en el carrito excede la cantidad disponible. Por favor, reduce la cantidad solicitada.`);
						
						// }
					const productoIndex = listaPedido.findIndex(item => item.idProducto === idProducto);
					if (productoIndex !== -1) {
						const precio = parseFloat(listaPedido[productoIndex].precio);
						listaPedido[productoIndex].cantidad = parseInt(nuevaCantidad);
						const nuevoSubtotal = parseInt(nuevaCantidad) * precio;
						listaPedido[productoIndex].subtotal = nuevoSubtotal;
						// Volver a ejecutar la función para actualizar el contenido del offcanvas
						oky = true;
						armarCarrito(listaPedido, oky);
					}
				}

			updateCant.className        = 'producto-header';
			updateCant.style.margin     = '1rem 5rem  0 -3rem';
			updateCant.style.background = 'transparent !important';

			updateCant.addEventListener('change', function(event) {
				const nuevaCantidad = parseInt(event.target.value); // Obtener la nueva cantidad del input
				const productoIndex = listaPedido.findIndex(item => item.idProducto === idProducto); // Encontrar el índice del producto en listaPedido
				// Verificar si el producto existe en listaPedido
				if (productoIndex !== -1) {
					const precio = parseFloat(listaPedido[productoIndex].precio); // Obtener el precio del producto
					// Actualizar la cantidad del producto
					listaPedido[productoIndex].cantidad = nuevaCantidad;
					// Calcular el nuevo subtotal
					const nuevoSubtotal = nuevaCantidad * precio;
					// Actualizar el subtotal del producto
					listaPedido[productoIndex].subtotal = nuevoSubtotal;
					// Volver a ejecutar la función para actualizar el contenido del offcanvas
					oky = true;
					armarCarrito(listaPedido, oky);
				}
			});

			// Enlace para eliminar el producto
			const eliminarProducto          = document.createElement('div');
			eliminarProducto.className      = 'producto-eliminar';
			eliminarProducto.innerHTML      = `<i class="fas fa-trash"></i>`;
			eliminarProducto.style.border   = 'none';
			eliminarProducto.style.margin   = 'auto';
			// ELIMINAR Filtrar el array eliminando el objeto con el idProducto correspondiente
			eliminarProducto.addEventListener('click', async function () {
				listaPedido = listaPedido.filter(item => item.idProducto !== idProducto);
				//console.log("***************88888888888888888888************DESDE ELIMINAR nuevaListaPedido que filter encontro desde eliminar",nuevaListaPedido)
				// Volver a ejecutar la función para actualizar el contenido del offcanvas 
				oky = true
				// Elimina el artículo existente en sessionStorage
				sessionStorage.removeItem("pedidoCarritoPendientePago");

				// Convierte la listaPedido a una cadena JSON antes de guardarla en sessionStorage
				const listaPedidoJSON = JSON.stringify(listaPedido);

				// Almacena la lista de productos en sessionStorage con la clave "pedidoCarritoPendientePago"
				sessionStorage.setItem("pedidoCarritoPendientePago", listaPedidoJSON);

				// REINICIAR LA PAGINA SI ELIMINA EL ULTIMO PRODUCTO
				if (listaPedido.length == 0) {
					// Recargar la página
					window.location.reload();
				}
				armarCarrito(listaPedido, oky ) 
			});
			
			//console.log(`Producto eliminado del carrito: ${producto}`);

			// Estructura HTML del contenido del CARRITO
			const productoContent     = document.createElement('div');
			productoContent.className = 'producto-content';
			productoContent.innerHTML = `
				<div style="height: 100px; margin: 0;">
					<div style="width: 90%; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; margin: 0 2rem; overflow: hidden; background: transparent; padding: 0px;">
						<div class="producto-img1">
							<img src="${imagen}" alt="Logo" height="80" width="90">
						</div>
						<div style="border: none; width: 100px; margin: -1rem 0.51rem ; padding: 0; overflow: hidden;">
							<p style="margin-bottom: -0.31rem;">${nombreProducto}</p>
							<div class="precio1">Precio $${formatoMoneda(precio)}</div>
						</div>
						<div id="actualizarCant"></div>
						<div id="subTotal"></div>
					</div>
				</div>
			`;

			cardProducto.appendChild(productoContent);
			cardProducto.appendChild(updateCant);
			cardProducto.appendChild(eliminarProducto);
			// Agregar el contenedor de productos al offcanvasBody
			offcanvasBody.appendChild(cardProducto);

			// Asignar la fecha actual al atributo timeP de cada elemento del array
			const fechaActual = new Date();
			listaPedido.forEach(pedido => {
				pedido.timeP      = fechaActual; // Agregar el atributo timeP a cada elemento del array
				pedido.tipoDePago = ""
				//agregar el idCLiente si hay un cliente logeado
				const dataCliente = JSON.parse(sessionStorage.getItem('clienteEcomm'));
				//console.log("eggjbgvkfjbvhjfbvhjbvjhibvjhibwijbvjhibnvjhirtb",dataCliente)
				if (dataCliente) {
					const idCliente = dataCliente._id
					pedido.idCliente = idCliente
					pedido.idPedido = idCliente
				}
			});
			// se le agrega el idPedido
			//listaPedido.idPedido = Math.floor(Math.random() * 1000000);
			// guardar el nuevo pedido en el almacenamiento local
			sessionStorage.setItem("pedidoCarritoPendientePago", JSON.stringify(listaPedido));
		}); 
		//termina de iterar la lista de pedidos de la fuincikon armarCarrito
		// Suma el total de la compra
		let sumando123 = []
		listaPedidoClone.forEach(objeto => {
			//console.log("Dentro de la formula para sumar el total:", listaPedido);
			// Inicializar la suma total para el objeto actual
			let sumaTotal = 0;
			// Calcular la cantidad multiplicada por el precio y sumar al total
			sumaTotal += objeto.cantidad * objeto.precio;
			//console.log("Qué suma total hace", sumaTotal);
			// Agregar la suma total al objeto como propiedad SumaTotal
			objeto.SumaTotalArray = sumaTotal;
			// Sumar al total general
			sumando123.push(sumaTotal)
		});
		const sumaTotal741 = sumando123.reduce((acumulador, numero) => {
			return acumulador + numero;
		}, 0);
		SumaTotal = sumaTotal741
		// Suma el total de todos los productos por sus cantidades
		let sumandoTodoslosProductos = []
		// Renderizar cada categoría
		listaPedidoClone.forEach(objeto => {
			//console.log("Dentro de la formula para sumar el sumandoTodoslosProductos:", listaPedido);
			// Inicializar la suma total para el objeto actual
			let sumaTotal = 0;
			// Calcular la cantidad multiplicada por el precio y sumar al total
			sumaTotal += objeto.cantidad;
			//console.log("Qué suma total sumandoTodoslosProductos", sumaTotal);
			// Agregar la suma total al objeto como propiedad SumaTotal
			objeto.SumaTotalArray = sumaTotal;
			
			// Sumar al total general
			sumandoTodoslosProductos.push(sumaTotal)
		});
		const sumaTotaCant = sumandoTodoslosProductos.reduce((acumulador, numero) => {
			return acumulador + numero
		}, 0);
		let totalSumaTotal = {}

		const costoDelivery = JSON.parse(sessionStorage.getItem("costoDelivery")) || []

		if (costoDelivery.length >= 2) {
			totalSumaTotal = Number(SumaTotal) + Number(costoDelivery[1]);
			//console.log("SIIIIIIII Tiene costo de envio totalSumaTotal",totalSumaTotal)
		}
		else{
			//console.log("NOOOOOOOOOOO Tiene costo de envio",costoDelivery)
			totalSumaTotal = SumaTotal
		}
		//console.log("QQQQQQQQQQue suma total TENEMOS", SumaTotal, costoDelivery, totalSumaTotal)
		// Imprimir Insertar en el fronen id"sumatoria" el total de los productos comprados
		const totalProds     = document.getElementById('sumatoria');
		// Formatear el número como moneda y aplicar estilo
		const formattedTotal = totalSumaTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
		totalProds.innerHTML = `
		<div align=center style="margin-bottom : -1rem">
			<div id="delivery6546"></div>
			<p style="margin-bottom: 0.3rem; color: white !important; line-height: 1.5rem !important; font-size: 1rem;">Tienes ${sumaTotaCant} productos en el carrito.</p>
			<p style="margin -1.2rem auto !important;color: white !important; line-height: 1.5rem !important; font-size: 1.5rem;">Total Compra ${formattedTotal}</p>
			<p style="margin-top: -1rem;color: white !important; line-height: auto !important; font-size: 0.8rem;">*Precios finales con imp. inc. </p>
		</div>
		`;
		offcanvasExample.show();

		// agrega si tiene costo de entrega
		if (costoDelivery.length >= 1 ) {
			//console.log("Entro para inyectar el costroDelivery",costoDelivery[0])
			// inyectarlo e informarlo en el carrito
			const costoDel = document.getElementById("delivery6546");	
			const deli = costoDelivery[0]
			costoDel.innerHTML = `${deli}`
		}
	};

	// Función para calcular el subtotal
	function calcularSubtotal(cantidad, precio) {
		const subtotal = cantidad * precio;
		return subtotal.toFixed(2);
	}
	// Función para dar formato de moneda a un valor
	function formatoMoneda(valor) {
		valor = Number(valor);
		if (isNaN(valor)) {
			console.error("Error: El valor no es un número válido");
			return null;
		}
		return `${valor.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
	}

	async function cobrarProductos(dataProductos) {
		if (!dataProductos || !dataProductos.direccion) {
			console.error("Los datos de dirección no están definidos.");
			return;
		}
		console.log("Que datos recibe para cobrrar?", dataProductos.direccion);
		const { pais, estado, localidad, calle, numeroPuerta, CP, lat, lng } = dataProductos.direccion;
		dataOwner = JSON.parse(sessionStorage.getItem("dataOwner"));
		const cliente = JSON.parse(sessionStorage.getItem("clienteEcomm"));
		const pedido = dataProductos.dataPedido;
		const token = dataProductos.token;
	
		const dataDir = { lat, lng, pais, estado, localidad, calle, numeroPuerta, CP, pedido };
		const dataPedidoConf = { cliente, pedido, dataDir, idOwner: dataOwner._id, token };
		const idPoint = JSON.parse(sessionStorage.getItem("idEndpoints"))[23]
		const response = await fetch(`${idPoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
			},
			body: JSON.stringify({ dataPedidoConf })
		});
	
		const data = await response.json();
	
		if (data.success) {
			console.log("Respuesta del servidor:", data);
			// Limpiar modales y actualizar el estado
			document.getElementById('exampleModalToggleDir').innerHTML = ""; 
			document.getElementById('exampleModalToggle2').innerHTML = "";
			sessionStorage.removeItem('pedidoCarritoPendientePago');
			// Verificar si los datos recibidos son válidos
			// Guardar y ACTUALIAZA los datos del cliente en el sessionStorage con la info de los pedidos comprados
			sessionStorage.setItem('clienteEcomm', JSON.stringify(data.data.dataCliente));
			let tipoDPago    = data.data.tiPago
			let codigoPedido = data.data.codigoPedido
				// reproducir sonido
			function reproducirSonido(velocidad, volumen) {
				var audio = new Audio('sounds/biciBell.wav');
				audio.loop = true; // Reproducir en bucle
				audio.playbackRate = velocidad;
				audio.volume = volumen;
				audio.play();
			}
			// Llamar a la función para reproducir el sonido con la velocidad y volumen deseados
			reproducirSonido(1.2, 1); // Velocidad normal, volumen al 100%
				
			// Mostrar mensaje de éxito
			let message = ""

			if (tipoDPago === "Pago Contra Factura" ) {
				message = `
				<div class="text-white">
					<p>Su pedido ${tipoDPago} ha sido aprobado.
						<br><br>
						<iframe style="border-radius:1rem" src="https://giphy.com/embed/f3orDrv1hzyMvgI3y6" width="130" height="130" frameborder="0" class="giphy-embed" allowfullscreen></iframe>
						<br><br>
						<strong>Código de pedido: ${codigoPedido}</strong>
					</p>
					<div class="text-body" style="text-align: justify; color:white !important">
<p>
    Te enviamos un correo electrónico con los detalles de la compra tanto a ti como a tu proveedor. En el correo podrán coordinar el método de pago contra entrega, los costos de envío (si los hubiera), así como la fecha y hora de entrega.
</p>

					</div>
				</div>
				`;
			} else {
				message = `
					<div class="text-white">
						<p>Su pedido abonado en ${tipoDPago} ha sido aprobado.
							<br><br>
							<iframe style="border-radius:1rem" src="https://giphy.com/embed/f3orDrv1hzyMvgI3y6" width="130" height="130" frameborder="0" class="giphy-embed" allowfullscreen></iframe>
							<br><br>
							<strong>Código de pedido: ${codigoPedido}</strong>
						</p>
						<div class="text-body" style="text-align: justify; color:white !important">
<p>
    Te enviamos un correo electrónico con los detalles de la compra tanto a ti como a tu proveedor. En el correo podrán coordinar el método de pago contra entrega, los costos de envío (si los hubiera), así como la fecha y hora de entrega.
</p>

						</div>
					</div>
				`;
			}
			const dominio = await dominioUrl();
			console.log("Que dominio encontro al final de la compra en ecommerce?????", dominio)
			mostrarExitoVentaEcom(message, dominio);
		} else {
			// cierra todos los modales
			cerrarTodo();
			//console.log("Que dominio armo??????????????????",dominioUrl())
			console.error(data.message);
			mostrarAlerta(data.message);
			setTimeout(async () => {
				window.location.href = await dominioUrl(); // Redirige a la primera subruta
			}, 2000);
		}
	}

	// funciones para la busqueda de productos/servicios del menu principal 
	function mostrarProductos() {
		const inputValor = document.getElementById('buscarProductoInput').value.toLowerCase();
		const selectProductos = document.getElementById('productosEncontrados');
		selectProductos.innerHTML = '';

		// Filtrar productos que contienen la letra ingresada
		const productosFiltrados = todosLosProductos.filter(producto => producto.toLowerCase().includes(inputValor));
		//console.log("***entro a mostrarProductos productosFiltrados", productosFiltrados)
		// Mostrar productos en el select
		productosFiltrados.forEach(producto => {
			const option = document.createElement('option');
			option.text = producto;
			option.style.color = 'red'; // Agregar color rojo al texto de la opción
			selectProductos.add(option);
		});
	// Mostrar el select como un modal
		selectProductos.style.display = productosFiltrados.length > 0 ? 'block' : 'none';
	}
	function seleccionarProducto() {
		const selectedOption = document.getElementById('productosEncontrados').value;
		//console.log("***entro a selecionar producto", selectedOption)
		document.getElementById('buscarProductoInput').value = selectedOption;
		buscarProducto();
	}
	function buscarProducto() {
		// Obtener el valor del input
		const valorInput = document.getElementById('buscarProductoInput').value;

		// Verificar si el valor está presente
		if (!valorInput) {
			//alert('Ingrese un producto válido');
			mostrarAlerta('Ingrese un producto válido')
			return;
		}

		// Buscar el elemento por su id (ajuste necesario)
		const elementoProducto = document.getElementById(valorInput);

		if (elementoProducto) {
			// Obtener la posición y desplazarse suavemente
			const posicionY = elementoProducto.getBoundingClientRect().top + window.scrollY - 330;
			window.scrollTo({ top: posicionY, behavior: 'smooth' });
		} else {
			//alert('Producto no encontrado');
			mostrarAlerta('Producto no encontrado')
		}

		// Ocultar el select después de seleccionar un producto
		document.getElementById('productosEncontrados').style.display = 'none';
	}

	// funcion que sirve para agregar direcciones
	async function guardarNuevaDireccion(direccion) {
		const jwtToken = sessionStorage.getItem('jwtToken');
		const clienteEcommString = JSON.parse(sessionStorage.getItem('clienteEcomm'));
		console.log("entra a la funcion para agregar direccion", clienteEcommString._id)
		// Verificar si el token JWT existe en el almacenamiento local
		if (jwtToken) {
			// Asignar el token JWT al objeto direccion
			direccion.Token = jwtToken;
		} else {
			// Manejar el caso en que el token JWT no esté presente en el almacenamiento local
			console.error('Token JWT no encontrado en el almacenamiento local');
		}
		// Asignar el idCliente del clienteEcomm almacenado en el almacenamiento local al objeto direccion
		if (clienteEcommString) {
			direccion.idCliente = clienteEcommString.idCliente;
			console.error('idCliente no encontrado en el objeto clienteEcomm');
		} else {
			console.error('Objeto clienteEcomm no encontrado en el almacenamiento local');
		}
		const endpoints = JSON.parse(sessionStorage.getItem("idEndpoints"))
		let dominio = await dominioUrl()
		const jwToken = jwtToken
		fetch(`${endpoints[76]}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${jwToken}`
			},
		body: JSON.stringify(direccion)
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				// Capturar el mensaje de error del backend
				return response.json().then(data => {
					throw new Error(data.message);
				});
			}
		})
		.then(data => {
			// Verificar si la respuesta contiene un mensaje de éxito
			if (data.success) {
				mostrarExito(data.message); // Mostrar mensaje de éxito en mostrarExito
				setTimeout(() => {
					const parsedDataPedido = JSON.parse(sessionStorage.getItem('pedidoCarritoPendientePago'));
					// si viene de M. Pago o solo es cargar una direccon  debe terminar el proceso interno de cobro
					if (parsedDataPedido.tipoDePago !== "Pago Contra Factura" ) {
						//pasa a cobrar el producto
						const dataCobrar  = { direccion, jwtToken, clienteEcommString, dataPedido }
						cobrarProductos(dataCobrar);
					} else {
						// Recargar la página
						window.location.href = dominio;
					}
				}, 2000);
			} else {
				mostrarAlerta(data.message); // Mostrar mensaje de error en mostrarAlerta
				setTimeout(() => {
					window.location.href = dominio;
					//location.reload(); // Recargar la página
				}, 2000);
			}
		})
		.catch(error => {
			console.error('Error en la solicitud Fetch:', error);
			mostrarAlerta(error.message); // Mostrar mensaje de error del backend
			setTimeout(() => {
				window.location.href = dominio;
			}, 2000); 
		});
	};

	// Función para renderizar los pedidos del usuario ecommerce.
	function renderizarPedidos(comprasCliente) {
		//console.log("Que llega a renderizar productos", comprasCliente)
		const pedidosContainer = document.getElementById('pedidos223');
		const cantPedi = document.getElementById('cantPedi');
		if (comprasCliente.length >= 1) {
			// Limpiar el contenido existente en el contenedor de pedidos
			pedidosContainer.innerHTML = '';
		}
		cantPedi.innerHTML = `Tiene ${comprasCliente.length} pedidos`;
		// Recorrer cada pedido y construir las tarjetas
		//console.log("renderizarPedidos/", comprasCliente)
		const listaDelPedido = comprasCliente
		//console.log("Que llega a renderizar listaDelPedido", listaDelPedido)
		listaDelPedido.forEach(pedido => {
			console.log("renderizarPedidos/", pedido);
		
			function formatearFecha(fecha) {
				const options = { day: 'numeric', month: 'short', year: 'numeric' };
				return new Date(fecha).toLocaleDateString('es-ES', options);
			}
		
			let totalCompra = pedido.TotalCompra;
			const card = document.createElement('div');
			const mensaje = `¿Seguro que quiere cancelar su pedido? <br> De haber una diferencia económica a favor o en contra por acto de cancelación deberá negociarla directamente en el comercio.`;
		
			// Aquí aseguramos que en pantallas medianas (md) las tarjetas ocupen la mitad (col-md-6) y en pantallas pequeñas (col-12) ocupen todo el ancho.
			card.classList.add('col-md-6', 'col-12', 'mb-3');
			card.innerHTML = `<style>
				.fa-hover:hover {
					transform: scale(1.10);
					transition: transform 0.51s;
					color: green !important;
				}
				.fa-hover:active {
					transform: scale(0.9);
					transition: transform 0.51s;
					color: red !important;
				}
			</style>
			<div class="card" id="${pedido.codigoPedido}" style="height: auto !important; z-index:88888 !important">
				<div class="card-header text-center">
					Código del pedido: ${pedido.codigoPedido}
					<img src="${dataOwner.pathLogo}" style="border-radius:100rem; width:35px; height:auto"/>
				</div>
				<div class="card-body text-md-left">
					<p class="card-text"><strong>Nombre del comercio:</strong> ${dataOwner.ecommerceName}</p>
					<p class="card-text"><strong>Fecha:</strong> ${formatearFecha(pedido.fecha)}</p>
					<p class="card-text"><strong>Cantidad de productos:</strong> ${pedido.totalProductos}</p>
					<p class="card-text"><strong>Total de la compra:</strong> ${totalCompra.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
					<p class="card-text"><strong>Forma de pago:</strong> ${pedido.tipoDePago}</p>
					<p class="card-text"><strong>Estado del envío:</strong> ${pedido.statusEnvio}</p>
				</div>
				<div class="card-footer text-center">
					<a class="fas fa-eye fa-hover tooltip-arrow" href="#" onclick="mostrarModalPedido('${pedido.codigoPedido}')" data-toggle="tooltip" data-placement="top" title="Mostrar Pedido"></a>
					<a class="fas fa-exclamation-circle fa-hover" href="#" onclick="mostrarModalReclamo('${pedido.codigoPedido}')" data-toggle="tooltip" data-placement="top" title="Iniciar Reclamo"></a>
					<a class="fas fa-sync-alt fa-hover" href="#" onclick="cambiarDirePedido('${pedido.codigoPedido}')" data-toggle="tooltip" data-placement="top" title="Ver y Cambiar Dirección del Pedido" hidden></a>
					<a class="fas fa-times-circle fa-hover" href="#" onclick="cancelarPedido('${mensaje}', '${pedido.codigoPedido}')" data-toggle="tooltip" data-placement="top" title="Cancelar Pedido"></a>
				</div>
			</div>`;
		
			// Agregar la tarjeta al contenedor de pedidos
			pedidosContainer.appendChild(card);
		
			// Calcular el total de pedidos y compras
			const totalPedidos = listaDelPedido.length;
			const totalCompras = listaDelPedido.reduce((total, pedido) => total + pedido.TotalCompra, 0);
		
			// Actualizar los elementos HTML con los resultados
			document.getElementById('totalPedidos').textContent = totalPedidos;
			document.getElementById('totalCompras').textContent = totalCompras.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
		});
	}

	// tooltips
    $(document).ready(function(){
        // Inicializa los tooltips
        $('[data-toggle="tooltip"]').tooltip();
    });

	// cancela el pedido realizado tiene filtro de estado de pedidos
	function cancelarPedido(mensaje, codPedi) {
		//console.log("que llego a la funcion cancelar pedido", mensaje,codPedi)
		// revisar que aun se pueda cancelar el pedido
			//obtener datosCLiente del sessionStorage y el pedido en cuestion
			const dataPedClie = JSON.parse(sessionStorage.getItem('clienteEcomm'));
			const idCliente = dataPedClie.idCliente
			const dataO = JSON.parse(sessionStorage.getItem('dataOwner'));
			const idOwner = dataO._id
			const arrayDataPed = dataPedClie.comprasCliente
			const objPedido = arrayDataPed.find(e => e.codigoPedido === codPedi)
			// verificar el stqatus del pedido y si esta en "Armando su pedido" continua sino Sale
			if (objPedido.statusEnvio == "Pedido en camino") {
				mostrarAlerta("No puedes cancelar el pedido porque ya esta en camino, comunicate con el proveedor")
				return
			}
		// enviar opciones con mensaje de alerta
			// armar funcion de confirma
			const confirma = async function () {
					// si confirma debe enviar una orden al backend para que ponga en statusEnvio del cliente y del owner "Pedido Cancelado"
					//console.log("Ento a confirma la cancelacion del pedido")
					const data = { codPedi, idCliente, idOwner };
						try {
							mostrarModalLoading()
							const jwToken = sessionStorage.getItem('jwtToken');
							const endpoints = JSON.parse(sessionStorage.getItem("idEndpoints"))
							const response = await fetch(`${endpoints[88]}`, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'Authorization': `Bearer ${jwToken}`
								},
								body: JSON.stringify(data)
							})
							if (response.ok) {
								ocultarModalLoading()
								mostrarExito("Su pedido ha sido cancelado");
								// Esperar 3 segundos (3000 milisegundos) antes de reiniciar la página
								setTimeout(function() {
									location.reload();
								}, 2000);
							} else {
								ocultarModalLoading()
								// Convertir la respuesta a JSON para obtener el mensaje de error
								const errorData = await response.json();
								mostrarAlerta(errorData.message);
								// Esperar 3 segundos (3000 milisegundos) antes de reiniciar la página
								setTimeout(function() {
									location.reload();
								}, 3000);
							}
						} catch (error) {
							// Esperar 3 segundos (3000 milisegundos) antes de reiniciar la página
							setTimeout(function() {
								location.reload();
							}, 3000);
							ocultarModalLoading()
							mostrarAlerta('Error al enviar la solicitud');
						}
					
			}
			const rechaza = function rechaza() {
				return
			}
			confirmOptions(mensaje, confirma, rechaza)
			//enviar mensajes de exito o alerta
	}

	// funcion que muestra el modal del pedido elejido y todos sus productos
	function mostrarModalPedido(codigoPedido) {
		// Obtener el modal y el cuerpo del modal
		const modal = document.getElementById('modalPedido5998');
		const modalBody = document.getElementById('modalBody8899');
		const datosPed = document.getElementById('dataPedido45698987');
	
		// Limpiar el cuerpo del modal
		modalBody.innerHTML = '';
		datosPed.innerHTML = '';
	
		// Buscar el pedido utilizando el codigoPedido
		const totalProductosPedidos = comprasClientes2.find(pedido => pedido.codigoPedido === codigoPedido);
	
		// Verificar si se encontró el pedido
		if (!totalProductosPedidos) {
			console.error('Pedido no encontrado');
			return;
		}
	
		// Función para formatear el número como moneda (pesos) con puntos y comas
		function formatCurrency(amount) {
			return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
		}
	
		const totoProd = totalProductosPedidos.totalProductos;
		const totMoney = totalProductosPedidos.TotalCompra;
		const satatus = totalProductosPedidos.statusEnvio;
	
		// Crear el título del modal con el nombre del producto
		const titulo4 = document.createElement('p');
		titulo4.textContent = `Estado del pedido: ${satatus}`;
		const titulo3 = document.createElement('p');
		titulo3.textContent = `Cantidad total de productos: ${totoProd}`;
		const titulo2 = document.createElement('p');
		titulo2.textContent = `Total de la compra: ${formatCurrency(totMoney)}`;
	
		datosPed.appendChild(titulo2);
		datosPed.appendChild(titulo3);
		datosPed.appendChild(titulo4);
	
		// Crear un contenedor de rejilla para las tarjetas
		const row = document.createElement('div');
		row.classList.add('row');
	
		totalProductosPedidos.listaProductos.forEach(pedido => {
			// Crear una columna para la tarjeta
			const col = document.createElement('div');
			col.classList.add('col-12', 'col-md-6', 'col-lg-4', 'mb-3');
	
			// Crear la tarjeta
			const card = document.createElement('div');
			card.classList.add('card', 'h-100');
	
			// Crear el título de la tarjeta con el nombre del producto
			const cardHeader = document.createElement('div');
			cardHeader.classList.add('card-header');
			const titulo = document.createElement('h5');
			titulo.textContent = `${pedido.nombreProd}`;
			cardHeader.appendChild(titulo);
			card.appendChild(cardHeader);
	
			// Mostrar la imagen del producto
			const cardBody = document.createElement('div');
			cardBody.classList.add('card-body', 'text-center');
	
			const imagen = document.createElement('img');
			imagen.src = pedido.imgProd;
			imagen.alt = `Imagen de ${pedido.nombreProd}`;
			imagen.classList.add('img-fluid'); // Clase para que la imagen sea responsive
			imagen.style.width = '100%'; // La imagen ocupa el 100% del ancho del contenedor
			imagen.style.height = 'auto'; // Mantiene la proporción de la imagen
	
			cardBody.appendChild(imagen);
	
			// Calcular el subtotal
			const subtotal = pedido.precio * pedido.cantidadProductos;
			const formattedSubtotal = formatCurrency(subtotal);
	
			// Crear elementos para cada propiedad del pedido
			const propiedadesPedido = [
				{ etiqueta: 'Precio', valor: formatCurrency(pedido.precio) },
				{ etiqueta: 'Cantidad', valor: pedido.cantidadProductos },
				{ etiqueta: 'Subtotal', valor: formattedSubtotal },
			];
	
			// Crear una lista para las propiedades del pedido
			const listaInfoPedido = document.createElement('ul');
			listaInfoPedido.classList.add('list-group', 'list-group-flush');
	
			// Recorrer las propiedades del pedido y crear elementos para cada una
			propiedadesPedido.forEach(propiedad => {
				const listItem = document.createElement('li');
				listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-left');
				listItem.style.margin = '1rem';
	
				const label = document.createElement('span');
				label.textContent = propiedad.etiqueta;
	
				const value = document.createElement('span');
				value.textContent = propiedad.valor;
				value.style.marginLeft = '10px';
	
				listItem.appendChild(label);
				listItem.appendChild(value);
				listaInfoPedido.appendChild(listItem);
			});
	
			// Agregar la lista de propiedades al cuerpo de la tarjeta
			cardBody.appendChild(listaInfoPedido);
			card.appendChild(cardBody);
			col.appendChild(card);
			row.appendChild(col);
		});
	
		// Agregar la fila al cuerpo del modal
		modalBody.appendChild(row);
	
		// Mostrar el modal
		const modalBootstrap = new bootstrap.Modal(modal);
		modalBootstrap.show();
	}

	// Función para calcular estadísticas y actualizar el footer del modulo de usuario del ecommerce
	function calcularEstadisticas(pedidos) {
		return
	}

	// inbiciar recmlamo por parte del cliente
	function mostrarModalReclamo(codigoPedido) {
		// Obtener el modal de reclamos y el cuerpo del modal
		const modalReclamos = document.getElementById('modalReclamos');
		// Actualizar el título del modal con el código del pedido
		const tituloCodigoPedido = modalReclamos.querySelector('.modal-header h4');
		tituloCodigoPedido.textContent = `Código del pedido: ${codigoPedido}`;
		// Mostrar el modal de reclamos
		const modalBootstrap = new bootstrap.Modal(modalReclamos);
		modalBootstrap.show();
	}

	// sirve para cambiar la direccion de envio busca la nueva direccion y la envia al html
	function cambiarDirePedido(codigoPedido) {
		codigoPedido25741 = codigoPedido
		//console.log("quedireccion hay que cambiar por su codigo de Pedido", codigoPedido);
		dataOwner = JSON.parse(sessionStorage.getItem('dataOwner'));
		dataCliente = JSON.parse(sessionStorage.getItem('clienteEcomm'));
		const idCliente = dataCliente._id
			//console.log("Que dataOwner encontro", dataOwner)
			// Buscamos en todas las ventas
			const dataDire = dataOwner.Ventas.find(venta => {
				// Buscamos en todas las compras de cada venta
				return venta.dataCompra.codigoPedido === codigoPedido;
			});
			//console.log("Que dataDire encontro", dataDire.dataDir)


			// verificar que el pedido NO este en camino
			if (dataDire.statusEnvio == "Pedido en camino") {
				mostrarAlerta("No puedes canbiar el domicilio de entrega porque el pedido ya esta en camino, comunicate con el proveedor")
				return
			}

			// verificar que el pedido NO este en camino
			if (dataDire.statusEnvio == "Pedido Cancelado") {
				mostrarAlerta("Ya cancelastee este pedido")
				return
			}

			const direEnvioPedido = dataDire.dataDir;
			// Verificar si se encontró la compra con el código de pedido dado
			const { CP, calle, estado, lat, lng, localidad, numeroPuerta, pais } = direEnvioPedido;
			

		// Establecer el valor del código de pedido en el modal
		$('#exampleModalToggleDirChange').find('#codPed78877').text('Cambiar dirección de entrega del pedido: ' + codigoPedido);
		const direccionInfo = document.getElementById('direccionInfo88799');
		direccionInfo.innerHTML = ''; // Limpiamos cualquier contenido previo

		// Mostrar el modal
		$('#exampleModalToggleDirChange').modal('show');

		function initMapFunctions(map88) {
			// Inicializa el popup
			var popup = L.popup();
			// Función para manejar el evento de clic en el mapa
			function onMapClick(e) {
				obtenerDireccion(e.latlng.lat, e.latlng.lng, function(direccion) {
					popup
						.setLatLng(e.latlng)
						.setContent("Dirección: " + direccion.road + " " + direccion.house_number)
						.openOn(map88);
				});
			}
		
			// Evento para escuchar el clic en el mapa
			map88.on('click', onMapClick);
			
			// Función para obtener la ubicación del usuario
			function obtenerUbicacion() {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(position) {
						var latitud = lat;
						var longitud = lng
						obtenerDireccion(latitud, longitud, mostrarDireccion); // Obtiene información de dirección y muestra la dirección
					});
				} else {
					mostrarAlerta('Geolocalización no es compatible en este navegador.');
				}
			}
			// Función para obtener información de dirección basada en coordenadas utilizando la API de OpenCage
			function obtenerDireccion(latitud, longitud, callback) {
				var apiKey = '88c66a70b2324b81a65c9059116e088c'; // Recuerda reemplazar con tu propia API key
				var url = `https://api.opencagedata.com/geocode/v1/json?q=${latitud}+${longitud}&key=${apiKey}`;
				fetch(url)
					.then(response => response.json())
					.then(data => {
						if (data.results && data.results.length > 0) {
							var direccion = data.results[0].components;
							direccion.latitud  = latitud
							direccion.longitud = longitud
							mostrarDireccion(direccion);
							map88.setView([latitud, longitud], 16); // Centra el mapa en el punto encontrado
							// Crea un polígono para la ubicación del usuario
							const dire = ("Calle: " + direccion.road + "<br>Número: " + direccion.house_number)
							userPolygon = L.polygon([
								[latitud - 0.0001, longitud - 0.0001],
							], {
								color: 'blue',
								fillColor: '#3388ff',
								fillOpacity: 0.5
							}).addTo(map88);
							var popup = L.popup()
								.setLatLng([latitud, longitud])
								.setContent(dire)
								.openOn(map88);
							// Agrega la calle y el número como etiquetas en el polígono
							userPolygon.bindPopup("Calle: " + direccion.road + "<br>Número: " + direccion.house_number).openPopup();
						} else {
							console.error('No se encontró ninguna dirección.');
						}
					})
					.catch(error => {
						console.error('Error al obtener la dirección:', error);
					});
			}
			// Función para mostrar información de dirección en los elementos <p>
			function mostrarDireccion(direccion) {
				direccionInfo.innerHTML = ''; // Limpiamos cualquier contenido previo
				//console.log("Dirección encontrada para renderizar:", direccion);
				direccionInfo.innerHTML += '<p hidden>codigoPedido: ' + (codigoPedido) + '</p>';
				direccionInfo.innerHTML += '<p hidden>idCliente: ' + (idCliente) + '</p>';
				direccionInfo.innerHTML += '<p hidden>lat: ' + (direccion.latitud) + '</p>';
				direccionInfo.innerHTML += '<p hidden>lng: ' + (direccion.longitud ) + '</p>';
				direccionInfo.innerHTML += '<p hidden>Localidad: ' + (direccion.state_district ) + '</p>';
				direccionInfo.innerHTML += '<p><strong>País:</strong> ' + (direccion.country || '(No disponible)') + '</p>';
				direccionInfo.innerHTML += '<p><strong>Ciudad:</strong> ' + (direccion.state || '(No disponible)') + ' / ' + (direccion.state_district || '(No disponible)') + '</p>';
				direccionInfo.innerHTML += '<p><strong>Calle:</strong> ' + (direccion.road || '(No disponible)') + ' ' +  'Nro. puerta: ' + (direccion.house_number || '') || '(No disponible)' + '</p>';
				direccionInfo.innerHTML += '<p><strong>Código Postal:</strong> ' + ((direccion.state_code || '') + (direccion.postcode || '') || '(No disponible)') + '</p>';
			}
			// Llama a la función para obtener la ubicación del usuario al cargar la página
			obtenerUbicacion(lat, lng)
		}
		// Llamada a la función para inicializar las funciones del mapa
		initMapFunctions(map88);
	}

	// muestra los mensajes push llamados desde el fronend cliente y elimina
	function mostrarMensajePush(titulo, cuerpo, idMess) {
		// datos
		const jwtToken           = sessionStorage.getItem('jwtToken');
		const clienteEcommString = sessionStorage.getItem('clienteEcomm');
		const clienteEcomm       = JSON.parse(clienteEcommString);
		const logoOwner          = dataOwner.pathLogo;

		const dataEliminar = {idMess}
		// Crear el elemento de la tostada
		var toastElement = document.createElement('div');
		toastElement.classList.add('toast');
		toastElement.setAttribute('role', 'alert');
		toastElement.setAttribute('aria-live', 'assertive');
		toastElement.setAttribute('aria-atomic', 'true');
	
		// Agregar el encabezado de la tostada
		var toastHeader = document.createElement('div');
		toastHeader.classList.add('toast-header');
		toastHeader.innerHTML = `
		<div class="d-flex align-items-center w-100">
			<div class="card">
<div class="card-header d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center">
        <img src="${logoOwner}" class="rounded me-2" alt="Logo" style="width: 30px; height: 30px;">
        <div>${titulo}</div>
    </div>
	<button type="button" class="btn-close" aria-label="Cerrar"></button>
</div>

				<div class="card-body">
					<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
					<div class="w-100">${cuerpo}</div>
					</div>
				</div>
				<div class="card-footer">
    <small class="text-muted">Justo ahora</small>		
				</div>
			</div>
		</div>`;
		toastElement.appendChild(toastHeader);
		// Agregar el cuerpo de la tostada

		// Agregar la tostada al contenedor
		document.getElementById('toastContainer').appendChild(toastElement);
	
		// Mostrar la tostada
		var toast = new bootstrap.Toast(toastElement);
		toast.show();
	
		// Cerrar automáticamente el toast después de 2 minutos
		setTimeout(function () {
			toast.hide();
		}, 10000); // 2 minutos en milisegundos
	
		// Agregar un evento al botón de cerrar
		var btnClose = toastElement.querySelector('.btn-close');
		btnClose.addEventListener('click', function () {
			eliminarPushMensaje(dataEliminar);
			toast.hide(); // Oculta el toast al hacer clic en el botón de cerrar
		});
	

	eliminarPushMensaje = async (dataEliminar) =>  {
		console.log("Entró a la función eliminar push mensaje", dataEliminar);
		// Configuración de la solicitud fetch
		const endpoints = JSON.parse(sessionStorage.getItem("idEndpoints"))
		const jwToken = sessionStorage.getItem('jwtToken');
		await fetch(`${endpoints[77]}`, { 
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${jwToken}`
			},
			body: JSON.stringify(dataEliminar)
		})
		.then(response => {
			// Verificar si la respuesta fue exitosa
			if (!response.ok) {
				throw new Error('Hubo un problema al eliminar el mensaje push');
			}
			// Devolver la respuesta como JSON
			return response.json();
		})
		.then(data => {
			// Procesar la respuesta
			//console.log('Respuesta del servidor:', data);
			// Aquí puedes realizar otras acciones con la respuesta del servidor si es necesario
			mostrarExito(data.message);
			// Esperar 2 segundos antes de recargar la página
			setTimeout(() => {
				location.reload();
			}, 2000); // 2000 milisegundos = 2 segundos
		})
		.catch(error => {
			// Capturar y manejar errores
			console.error('Error al eliminar el mensaje push:', error);
			mostrarAlerta(error);
			// Esperar 2 segundos antes de recargar la página
			setTimeout(() => {
				location.reload();
			}, 2000); // 2000 milisegundos = 2 segundos
		});
	};
	
	}

	async function costoEnvio(cienteEcomm, dataOwner ) {
		//console.log("***************Entro a la funcion costoEnvio", cienteEcomm, dataOwner)
		// verificar si tiene empresa de envio
		dataOwner = JSON.parse(sessionStorage.getItem('dataOwner'))
		if (dataOwner.deliveryCompany.length >= 1 && cienteEcomm.direcciones.length >= 1 ) {
			const latLngClient = { lat: cienteEcomm.direcciones[0].lat, lng: cienteEcomm.direcciones[0].lng };
			//console.log("que direccion tiene el cliente?",latLngClient)
			if (latLngClient.lat === "") {
				mostrarAlerta("Debes corregir tu dreccion no tiene latitud ni longitud", latLngClient)
				return
			}
			// calcular la distancia entre el comercio del ownerEcomm y el clienteEcomm
			const latLngOwner  = { lat: dataOwner.direcciones[0].lat, lng: dataOwner.direcciones[0].lng };
			//console.log("Entro a averiguar el precio del envio", latLngClient, latLngOwner)
			const distanciaEnKm = getDistanceInKm(latLngOwner, latLngClient);
			//console.log('Distancia en kilómetros:', distanciaEnKm);
			// calcular el costo del envio
			const deliveryCompany12 = dataOwner.deliveryCompany
			const costoEnvio2 = obtenerCostoEnvio(distanciaEnKm, deliveryCompany12[0]);
			costoDelivery.push(`El costo de envío para ${distanciaEnKm} km hasta tu direccion es: $${costoEnvio2}`, costoEnvio2)
			sessionStorage.setItem("costoDelivery", JSON.stringify(costoDelivery));
			//console.log(`El costo de envío para ${distanciaEnKm} km hasta tu direccion es: $${costoEnvio2}`);
			return `El costo de envío para ${distanciaEnKm} km hasta tu direccion es: $${costoEnvio2}`
		}
		else{
			if (dataOwner.deliveryCompany.length >= 1) {
				//console.log("Debe registrar su direccion para calcular el costo de envio")
				costoDelivery.push(`Debe registrar su dirección para calcular el costo de envío.`,)
				// Almacenar el costo de envío en sessionStorage
				// Almacenar costoDelivery en sessionStorage como una cadena JSON
			}else{
				//console.log("Comuniquese con el vendedor para calcular el costo de envio")
				costoDelivery.push(`Comuniquese con el vendedor para calcular el costo de envío`,)
			}
			return true
		}
	}

	function getDistanceInKm(latLngOwner, latLngClient) {
		const R = 6371; // Radio de la Tierra en km
		const dLat = (latLngClient.lat - latLngOwner.lat) * Math.PI / 180;
		const dLng = (latLngClient.lng - latLngOwner.lng) * Math.PI / 180;
		const a = 
			0.5 - Math.cos(dLat)/2 + 
			Math.cos(latLngOwner.lat * Math.PI / 180) * Math.cos(latLngClient.lat * Math.PI / 180) * 
			(1 - Math.cos(dLng))/2;
	
		const distance = R * 2 * Math.asin(Math.sqrt(a));
		//console.log("Que distancia tenemos en getDistanceInKm?????", distance)
		return distance.toFixed(2); // Redondear a dos decimales
	}

	// Función para obtener el costo de envío basado en la distancia
	function obtenerCostoEnvio(distanciaEnKm, deliveryCompany) {
		// Convertir las distancias y costos a número para asegurarse de que sean valores numéricos
		distanciaEnKm = parseFloat(distanciaEnKm);
		const distanceFree = parseFloat(deliveryCompany.distanceFree);
		const minDistance = parseFloat(deliveryCompany.minDistance);
		const midDistance = parseFloat(deliveryCompany.midDistance);
		const longDistance = parseFloat(deliveryCompany.longDistance);
		const extraLongDistance = parseFloat(deliveryCompany.extraLongDistance);

		//console.log("Iniciando cálculo de envío, distancia:", distanciaEnKm, "Distancia gratis:", distanceFree);

		// Si la distancia es menor o igual a la distancia gratis
		if (distanciaEnKm <= distanceFree) {
			//console.log("Caso: Envío gratis");
			return 0; // Envío gratis
		}

		// Si la distancia está entre el rango distanceFree y 15 km
		else if (distanciaEnKm > distanceFree && distanciaEnKm <= 15) {
			//console.log("Caso: Entre distanceFree y 15 km. Costo mínimo:", minDistance);
			return minDistance;
		}

		// Si la distancia está entre 15 km y 35 km
		else if (distanciaEnKm > 15 && distanciaEnKm <= 35) {
			const proporción = (distanciaEnKm - 15) / (35 - 15);
			const costo = minDistance + (midDistance - minDistance) * proporción;
			//console.log(`Caso: Entre 15 km y 35 km. Proporción: ${proporción}, Costo calculado: ${costo}`);
			return costo;
		}

		// Si la distancia está entre 35 km y 55 km
		else if (distanciaEnKm > 35 && distanciaEnKm <= 55) {
			const proporción = (distanciaEnKm - 35) / (55 - 35);
			const costo = midDistance + (longDistance - midDistance) * proporción;
			//console.log(`Caso: Entre 35 km y 55 km. Proporción: ${proporción}, Costo calculado: ${costo}`);
			return costo;
		}

		// Si la distancia supera los 55 km, calcular costo extra
		else {
			const proporción = (distanciaEnKm - 55) / (100 - 55); // Suponiendo que extraLongDistance cubre hasta 100 km, ajusta este valor si es necesario.
			const costo = longDistance + (extraLongDistance - longDistance) * proporción;
			//console.log(`Caso: Más de 55 km. Proporción: ${proporción}, Costo calculado: ${costo}`);
			return costo;
		}
	}


	//Cerrar el modal
	function cerrarModal(idModal) {
		//console.log("funcion Cierra el modal", idModal);
	
		// Obtiene el elemento del modal
		var modalElement = document.getElementById(idModal.id);
		
		if (!modalElement) {
			console.error('El modal con el id proporcionado no existe:', idModal);
			return;
		}
	
		// Obtiene la instancia del modal de Bootstrap
		var modal = bootstrap.Modal.getInstance(modalElement);
	
		if (!modal) {
			console.error('No se pudo obtener la instancia del modal:', idModal);
			return;
		}
	
		// Oculta el modal de manera suave
		modal.hide();
		
		// Elimina la clase 'modal-open' del body para permitir la interacción con el resto del sitio
		document.body.classList.remove('modal-open');
		
		// Elimina el fondo oscuro que se superpone al resto del sitio
		var modalBackdrop = document.querySelector('.modal-backdrop');
		if (modalBackdrop) {
			modalBackdrop.parentNode.removeChild(modalBackdrop);
		}
	}

	// sirve para re enviar a al direccion del dominio del ecommerce
	async function dominioUrl() {
		const dataOwn = JSON.parse(sessionStorage.getItem('dataOwner')) ;
		const dataB = JSON.parse(sessionStorage.getItem('basicData'));
		//console.log("Entro a buscar el dominio desde el index ecommerce", dataB)
        const urlServer = dataB[0].urlServer || null;
		//console.log("Entro a buscar el domioURL en index Ecommerce", urlServer)
		let dominioUrls
        let cheqDom = dataOwn?.dominio || false;
		if (cheqDom) {
            dominioUrls = `${dataOwn.urlOwner}/indexEcomm.html`;
			// Si necesitas redirigir a la URL almacenada en 'dominio' después de recargar, puedes hacer lo siguiente:
			//console.log("Entro por SI tiene dominio", dominio)
			return dominioUrls;
		} else {
			dominioUrls = urlServer + dataOwn.urlOwner;
			// Si necesitas redirigir a la URL almacenada en 'dominio' después de recargar, puedes hacer lo siguiente:
			//console.log("Entro por NO tiene dominio desde el index ecommerce linea 3274", dominio)
			return dominioUrls;
		}
	}

	// rescata los datos desde el server
	async function rescueData(idCliente) {
		try {
			// Busca los datos del dueño del ecommerce para configurar el sitio web
			const idEnpoints = JSON.parse(sessionStorage.getItem("idEndpoints"));
			let urlOwner = window.location.pathname.split('/')[1];
			//console.log("***rescueData****¿Qué endpoints encontró en el local storage?",);
			const response = await fetch(idEnpoints[0], {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${jwToken}`
				},
				body: JSON.stringify({ urlOwner, idCliente }),
			});
	
			if (!response.ok) {
				throw new Error('Error en la solicitud');
			}
	
			const responseData = await response.json();
	
			// Procesar y guardar los datos recibidos
			let dataOwner     = responseData.data.dataOwner;
			let ownerMensajes = responseData.data.ownerMensajes;
			let ownerPromos   = responseData.data.ownerPromos;
			let ownerProducts = responseData.data.ownerProducts;
			let basicData     = responseData.data.basicData;
			let dataCliente   = responseData.data.dataCliente;
			//console.log('Datos recibidos desde rescue????????????:', responseData.data);
	
			// Almacenar en sessionStorage
			sessionStorage.setItem("dataOwner", JSON.stringify(dataOwner));
			sessionStorage.setItem("ownerProducts", JSON.stringify(ownerProducts));
			sessionStorage.setItem("ownerPromos", JSON.stringify(ownerPromos));
			sessionStorage.setItem("basicData", JSON.stringify(basicData));
			sessionStorage.setItem("ownerMensajes", JSON.stringify(ownerMensajes));
			if (dataCliente) {
				sessionStorage.setItem("clienteEcomm", JSON.stringify(dataCliente));
			}
	
			//console.log("Desde RESCUESESSION: ¿Qué datos encontró en session?", { dataOwner, ownerMensajes, ownerPromos, ownerProducts, basicData });
	
			return { dataOwner, ownerMensajes, ownerPromos, ownerProducts, basicData };
		} catch (error) {
			console.error("Error en rescueData:", error);
	
			// Si ocurre un error, esperar 2 segundos y reintentar
			await new Promise(resolve => setTimeout(resolve, 2000));
			console.log("Reintentando ejecutar rescueData después de 2 segundos...");
			
			return await rescueData(); // Vuelve a llamar la función
		}
	}


	// agrega el diseño al ecommerce y obtiene que diseño eligio el owner
	async function agregarClase(desing) {
		//console.log("Entro a colorear el diseño", desing)
		try {
			if (desing) {
				// Obtener los elementos por sus IDs y agregarles la clase
				var elementosIds = ["coloratepapa", "muestraChau",
					"coloreamePAgos","color23BigImg", "colorCpanelCli2587",
					"coloredDir", "loadingModal", "colorElsign", "sigIngColor", 
					"noticiasColor", "coloreame", "coloreame2", "designPromos", 
					"colorBtnProdProm2", "colorBtnProdProm", "footer", "barraMenuArriba", 
					"intenertOK", "offcanvasExample", "offcanvasRight", "imagenModal", 
					"instruccionesUdpated", "coloredChangeDir","coloredChangeDir", "colorearReclamos", "colorListPEd" 
				]; // Agrega aquí los IDs que desees
		
				// agrega lis ide para que se coloren las cardde productos y promos
				ownerProducts && ownerProducts.length && ownerProducts.forEach(product => 
					elementosIds.push(`coloreateputo${product._id}`)
				);
				ownerPromos && ownerPromos.length && ownerPromos.forEach(product => 
					elementosIds.push(`coloreateProm${product._id}`)
				);

				elementosIds.forEach(function(id) {
					var elemento = document.getElementById(id);
					// Verificar si el elemento existe antes de agregar la clase
					if (elemento) {
						elemento.classList.add(desing);
					} else {
						console.console(`El elemento con ID "${id}" no existe en el DOM.`);
					}
				});
			}
		} catch (error) {
			console.warn(`Se produjo un error en el diseño de la tienda `, error);
		}
	}

	function armarListaDelCarritoProm(idProducto, cantidades, ok) {
		// busca el producto seleccionado para el carrito de todos los productos en el array Categorias
		function encontrarProductoPorIdEnCategorias(categorias, idProducto) {
			for (const categoria in categorias) {
				const productosEnCategoria = categorias[categoria];
				const productoEncontrado = productosEnCategoria.find(producto => producto._id === idProducto);
				if (productoEncontrado) {
					return {
						categoria,
						producto: productoEncontrado
					};
				}
			}
			return null; // Retorna null si el producto no se encuentra en ninguna categoría
		}

		const product = encontrarProductoPorIdEnCategorias(categoriasProm, idProducto);
		const producto = product.producto;

		// Obtener información del producto seleccionado
		const nombreProducto = `${producto.nombreProducto}`;
		const cantidad = parseInt(cantidades, 10);
		const precio = parseFloat(`${producto.precio}`);
		const imagen = `${producto.rutaSimpleImg[0]}`;
		const descripcion = `${producto.descripcion}`;
		const idCliente = "";

		// Crear un objeto del pedido con la información del producto solicitado
		const pedido = { idCliente, descripcion, imagen, nombreProducto, cantidad, precio, idProducto };
		//console.log("Contenido del pedido :", pedido);

		// Clonar la lista de pedidos para evitar afectar el estado anterior
		pedido.subTotal = cantidad * precio;

		// Compara el pedido con lo que está guardado en listaPedido y lo diferente lo incluye
		//console.log("Que lista de pedido llega a armar listaPedido", listaPedido);

		const cheIngresado = listaPedido.find(e => e.idProducto === idProducto);

		// Si no está ya en listaPedidos, se añade la lista de pedidos
		if (!cheIngresado) {
			listaPedido.push(pedido);
		}

		let listaPedidoClone = [...listaPedido];
		armarCarrito(listaPedidoClone, ok);
	}

	//console.log("Entro al identificador para ver si tiene el /Promo")
	async function detectPromosparams() {
		$(document).ready(function() {
			
			// Obtiene la URL actual
			const currentUrl2 = window.location.href;
			if (currentUrl2.includes("/Promo/")) {
				// Obtiene el idProm desde la URL después de "/Promo/"
				const idProm = currentUrl2.split("/Promo/")[1]; // Elimina los primeros 3 caracteres
				//console.log("Que dato es idProm:", idProm);
		
				// Función para encontrar el producto en todas las categorías
				const arrayPromociones = JSON.parse(sessionStorage.getItem("ownerPromos")) || [];
				//console.log("Que dato es arrayPromociones:", arrayPromociones);
				
				// Normalizar idProm a String (para asegurar consistencia)
				const idPromStr = String(idProm);
				
				// Buscar el producto con el idProm correspondiente
				const producto = arrayPromociones.find(e => e._id === idPromStr);
		
				//console.log("Que dato es producto encontrado:", producto);
				// Función para formatear la fecha
				function formatoFecha(fecha) {
					const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
					return new Date(fecha).toLocaleDateString('es-ES', opciones);
				}

				// Función para calcular los días restantes
				function calcularDiasRestantes(fechaFin) {
					const hoy = new Date();
					const fechaFinal = new Date(fechaFin);
					const diferencia = fechaFinal - hoy;
					return Math.ceil(diferencia / (1000 * 60 * 60 * 24)); // Convertir milisegundos a días
				}
				if (producto) {
					// Aquí puedes proceder con la lógica para mostrar el producto encontrado
					const inyectaPromo = document.getElementById("promoExpuesta");
					const promosCard = `
<div class="d-flex justify-content-center align-items-center" style="width: 100%; height: 900px !important; margin: 1rem;">
    <div class="text-center" id="${producto._id}" style="width: 100%; height: 900px !important; margin: 1rem 5rem;">
        <div class="cube mx-auto" id="${producto._id}" style="margin: 1rem; width: 400px; height: 400px;">
            <div class="face front">
                <img src="${producto.rutaSimpleImg[0]}" alt="" class="card-img" style="height: 400px; border-radius: 15px; box-shadow: 8px 8px 18px rgba(0, 0, 0, 0.3);">
            </div>
            <div class="face back">
                <img src="${producto.rutaSimpleImg[1]}" alt="" class="card-img" style="height: 400px; border-radius: 15px; box-shadow: 8px 8px 18px rgba(0, 0, 0, 0.3);">
            </div>
            <div class="face left">
                <img src="${producto.rutaSimpleImg[2]}" alt="" class="card-img" style="height: 400px; border-radius: 15px; box-shadow: 8px 8px 18px rgba(0, 0, 0, 0.3);">
            </div>
            <div class="face right">
                <img src="${producto.rutaSimpleImg[3]}" alt="" class="card-img" style="height: 400px; border-radius: 15px; box-shadow: 8px 8px 18px rgba(0, 0, 0, 0.3);">
            </div>
            <div class="face top">
                <img src="${producto.rutaSimpleImg[4]}" alt="" class="card-img" style="height: 400px; border-radius: 15px; box-shadow: 8px 8px 18px rgba(0, 0, 0, 0.3);">
            </div>
            <div class="face bottom">
                <img src="${producto.rutaSimpleImg[5]}" alt="" class="card-img" style="height: 400px; border-radius: 15px; box-shadow: 8px 8px 18px rgba(0, 0, 0, 0.3);">
            </div>
        </div>
        <style>
            .cube {
                position: relative;
                width: 400px;
                height: 400px;
                transform-style: preserve-3d;
                transform: rotateY(0deg);
                animation: rotate 10s infinite linear;
                margin: 0 auto; /* Centrando el cubo */
            }

            .face {
                position: absolute;
                width: 400px;
                height: 400px;
                border: 2px solid #000;
                border-radius: 15px;
                overflow: hidden;
            }

            .front  { transform: rotateY(0deg) translateZ(200px); }
            .back   { transform: rotateY(180deg) translateZ(200px); }
            .left   { transform: rotateY(-90deg) translateZ(200px); }
            .right  { transform: rotateY(90deg) translateZ(200px); }
            .top    { transform: rotateX(90deg) translateZ(200px); }
            .bottom { transform: rotateX(-90deg) translateZ(200px); }

            @keyframes rotate {
                from { transform: rotateY(0deg); }
                to { transform: rotateY(360deg); }
            }
        </style>
        <div class="card d-flex flex-column align-items-center" style="background: transparent; overflow-y: auto; font-size: 1rem !important">
            <div class="card-header text-center">
                <h3 class="card-title"><strong>${producto.nombrePromocion}</strong></h3>
            </div>
            <div class="card-body text-center">
                <div class="d-flex align-items-center justify-content-center">
                    <p class="m-0"><strong>Precio:</strong> $${formatoMoneda(producto.precioInicial)}</p>
                    <p class="mx-4"></p>
                    <p class="m-0"><strong>Descuento:</strong> ${producto.descuento}%</p>
                </div>
                ${producto.precio ? `<p class="text-center mt-2" style="font-size: 2.2rem; color: red;"><strong>Precio Final:</strong> $${formatoMoneda(producto.precio)}</p>` : ''}
                <div>
                    ${producto.cantLlevar && producto.cantPagar ? `
                        <p><strong>Aprovecha, lo llevas en promoción por cantidad:</strong></p>
                        <div class="d-flex align-items-center justify-content-center">
                            <p><strong>Lleva:</strong> ${producto.cantLlevar}</p>
                            <p class="mx-4"><strong>y</strong></p>
                            <p><strong>Pagas:</strong> ${producto.cantPagar}</p>
                        </div>
                    ` : `
                        <p><strong>Sin promo por cantidades</strong></p>
                        <br>
                    `}
                </div>
                <div>
                    <p><strong>Quedan: ${producto.cantidadDisponible - producto.cantidadPromoVendidas} promos disponibles.</strong></p>
                    <p><strong>Días que restan de la promoción: ${calcularDiasRestantes(producto.fechaFin)}</strong></p>
                </div>
                <div class="text-center">
                    <p class="m-0"><strong>Agregar cantidad:</strong></p>
                    <br>
                    <div class="d-flex align-items-center mb-3 justify-content-center">
                        <button type="button" class="btn btn-outline-secondary ms-2" id="decrementar-${producto._id}">
                            -
                        </button>
                        <input type="number" data-cantidad-id="${producto._id}" name="cantidad" value="1" id="in2387foInputPrmo${producto._id}" min="1" max="${producto.cantidadDisponible - producto.cantidadPromoVendidas}" class="form-control mx-2" style="width: 60px;" required>
                        <button type="button" class="btn btn-outline-secondary" id="incrementar-${producto._id}">
                            +
                        </button>
                    </div>
                </div>
                <div class="mb-3 text-center">
                    <button class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#descripcion${producto._id}" aria-expanded="false" aria-controls="descripcion${producto._id}">
                        <strong>Ver descripción</strong>
                    </button>
                    <div class="collapse" id="descripcion${producto._id}">
                        <p>${producto.descripcionPromocion}</p>
                    </div>
                </div>
            </div>
            <div class="card-footer text-center">
                <button type="button" class="btn btn-success w-80 add-to-cart" id="BTNCarrito${producto._id}" data-producto-id="${producto._id}">
                    Agregar al Carrito
                    <span class="fas fa-shopping-cart"></span>
                </button>
            </div>
        </div>
    </div>
</div>

					`;
					// Asignar eventos después de renderizar el HTML
					setTimeout(() => {
						const incrementarBtn = document.getElementById(`incrementar-${producto._id}`);
						const decrementarBtn = document.getElementById(`decrementar-${producto._id}`);
						
						incrementarBtn.addEventListener('click', () => incrementarCantidad(producto._id));
						decrementarBtn.addEventListener('click', () => decrementarCantidad(producto._id));

						const addToCartBtn = document.getElementById(`BTNCarrito${producto._id}`);
	
						addToCartBtn.addEventListener('click', () => {
							const input = document.getElementById(`in2387foInputPrmo${producto._id}`);
							const cantidad = input.value; // Obtener la cantidad del input
							const idProducto = producto._id
							const inputCantidad = cantidad
							const ok = true
							$('#modalPromos').modal('hide');
							armarListaDelCarritoProm(idProducto, inputCantidad, ok);
							// alert(`ID del producto: ${producto._id}, Cantidad: ${cantidad}`);
						});

					}, 0);
					function incrementarCantidad(id) {
						console.log("funcionna +")
						const input = document.getElementById(`in2387foInputPrmo${id}`);
						let cantidad = parseInt(input.value);
						if (cantidad < parseInt(input.max)) {
							input.value = cantidad + 1;
						}
					}
					function decrementarCantidad(id) {
						console.log("funcionna -")
						const input = document.getElementById(`in2387foInputPrmo${id}`);
						let cantidad = parseInt(input.value);
						if (cantidad > parseInt(input.min)) {
							input.value = cantidad - 1;
						}
					}


					document.getElementById('promoExpuesta').innerHTML = promosCard;
					if (inyectaPromo) {
						inyectaPromo.innerHTML = promosCard;
						var myModal = new bootstrap.Modal(document.getElementById('modalPromos'));
						myModal.show();
					} else {
						console.error("Element with ID 'promoExpuesta' not found.");
					}
				} else {
					console.error("No se encontró ningún producto con idProm:", idProm);
				}

			} else {
				//console.log("La URL actual no incluye '/Promo/'.");
			}
		})
	}


	// esta funcion sire para borrar el local storage cuando salis de la aplicasion
	async function borrarsessionStorage() {
		sessionStorage.removeItem("ownerEcom");
		sessionStorage.removeItem("dataOwner");
		sessionStorage.removeItem("basicData");
		sessionStorage.removeItem('dataPayOSes');
		sessionStorage.removeItem('datosBasicos');
		sessionStorage.removeItem('jwtToken');
		sessionStorage.removeItem('endPointsIdTokens');
		sessionStorage.removeItem('idEndpoints');
		sessionStorage.removeItem('jwTokenOwner');
		sessionStorage.removeItem('dataOwner');
		sessionStorage.removeItem('ownerMensajes');
		sessionStorage.removeItem('ownerProducts');
		sessionStorage.removeItem('ownerPromos');
		return;
	}

	//Back Box Ciber Security
    function BBcs() {
        // Funciones para detectar hackeos
        function borrarHtml() {
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
            // Limpiar consola para asegurarse de que no haya nada en ella
            console.clear();

            // Esperar un tiempo breve antes de cambiar el contenido de la página
            setTimeout(function() {
                // Crear el contenido de la advertencia en formato de tarjeta (card) con cubo giratorio

                // Reemplazar todo el contenido del <html> principal
                document.documentElement.innerHTML = warningCard;

                // Manejo de la rotación continua del cubo
                let rotationY = 0; // Inicializa la rotación en Y
                const cube = document.getElementById('cube');

                // Función para girar el cubo
                function rotateCube() {
                    rotationY += 2; // Incrementa el ángulo de rotación
                    cube.style.transform = `rotateY(${rotationY}deg)`; // Aplica la rotación
                }

                // Ejecutar la rotación cada 50 ms
                setInterval(rotateCube, 50); 

            }, 500);  // Un pequeño retraso antes de mostrar la advertencia

            setTimeout(function() {
                // Redirigir a otra página (por ejemplo, Google)
                window.location.href = "https://www.google.com";
            }, 15000);  // Un retraso de 20 segundos antes de la redirección
        }
        function detecHaker() {
            

            document.addEventListener('keydown', function(event) {
                // Mostrar en consola la tecla presionada
                console.log(`Tecla presionada: ${event.key}`);
                borrarsessionStorage();                
                // Alerta si se presiona F12
                if (event.key === 'F12') {
                    mostrarAlerta('¡ALERTA! Has presionado F12, lo que puede abrir la herramienta de inspección. ¡Cualquier intento de robo de datos es un delito grave y penado por la ley!');
                // agregar borrar el sessionStorage
                borrarsessionStorage();
                setTimeout(() => {
                    borrarsessionStorage();
                    borrarHtml()
                }, 2000); // Llama a la función después de 2 segundos

                setTimeout(() => {
                    borrarsessionStorage();
                    borrarHtml()
                }, 10000); // Llama a la función después de 10 segundos

                }
            });
            
            // Función para detectar clic derecho
            document.addEventListener('contextmenu', function(event) {
                event.preventDefault(); // Prevenir el menú contextual por defecto
                // Mensaje en la consola al hacer clic derecho
                console.log('Se hizo clic derecho en la página.');
                borrarsessionStorage();
                // Alerta alarmante cuando se intenta abrir la herramienta de inspección
                mostrarAlerta('Por temas de seguridad, este boton a sido anulado');
                // agregar borrar el sessionStorage
                setTimeout(() => {
                    borrarsessionStorage();
                    borrarHtml()
                }, 2000); // Llama a la función después de 2 segundos

                setTimeout(() => {
                    borrarsessionStorage();
                    borrarHtml()
                }, 10000); // Llama a la función después de 10 segundos
                
            });
            
        }
		function detectConsol() {
			let devToolsOpen = false;
			const lastWidth = window.innerWidth;
			const lastHeight = window.innerHeight;
		
			const checkDevTools = () => {
				// Comprobación del tiempo de ejecución de console.log
				const startTime = performance.now();
				console.log('%c Prueba de detección de DevTools...', 'color: transparent;'); // Usar color transparente para evitar mostrar nada
				const endTime = performance.now();
		
				// Si la diferencia de tiempo es significativa (mayor a 100ms), se asume que DevTools está abierta
				console.log('Tiempo de ejecución:', endTime - startTime);
				if (endTime - startTime > 0.9) {
					if (!devToolsOpen) {
						devToolsOpen = true; // Cambia el estado a abierto
						console.log('%c ¡ATENCIÓN! \nHas activado las herramientas de desarrollador (F12). \nEl acceso no autorizado a esta sección puede ser considerado un intento de manipulación o robo de datos, lo cual es una infracción grave conforme a la ley. \nPara evitar sanciones o la suspensión de tu cuenta, te recomendamos cerrar esta consola de inmediato.', 'color: white; background: red; font-size: 30px; font-weight: bold; padding: 20px; text-align: center; width: 100%;');
						ejecutarCodigoDeSeguridad();
					}
				} else {
					if (devToolsOpen) {
						devToolsOpen = false; // Cambia el estado a cerrado
						console.log('La consola de desarrollo se ha cerrado.');
					}
				}
		
				// Comprobación del tamaño de la ventana
				const currentWidth = window.innerWidth;
				const currentHeight = window.innerHeight;
		
				if (currentWidth < lastWidth || currentHeight < lastHeight) {
					if (!devToolsOpen) {
						devToolsOpen = true; // Cambia el estado a abierto
						console.log('%c ¡ATENCIÓN! \nLas herramientas de desarrollador pueden estar abiertas debido a un cambio en el tamaño de la ventana.', 'color: white; background: red; font-size: 30px; font-weight: bold; padding: 20px; text-align: center; width: 100%;');
						ejecutarCodigoDeSeguridad();
					}
				}
			};
		
			// Función que se ejecutará cuando las herramientas de desarrollador estén abiertas
			const ejecutarCodigoDeSeguridad = () => {
				borrarHtml(); // Asegúrate de que esta función esté definida
				// Borrar sessionStorage o cualquier otra acción de seguridad
				borrarsessionStorage(); // Asegúrate de que esta función esté definida
				console.log('%c Session Storage y HTML borrado por razones de seguridad.', 'color: white; background: blue; font-size: 20px; padding: 10px;');
                borrarsessionStorage();
			};
		
			// Verifica cada segundo si la consola está abierta o cerrada
			setInterval(checkDevTools, 10000);
		}
		
		// Llama a la función para iniciar la detección
		detectConsol();
        detecHaker()
        detectConsol()
    }

	// BBcs()