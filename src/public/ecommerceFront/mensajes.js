	// funciones de modal de espera loading
	async function mostrarModalLoading() {
		console.log("Pidieorn mostrar el modal loading")
		$('#loadingModal').modal('show');
	}
	// Función para ocultar el modal
	function ocultarModalLoading() {
		$('#loadingModal').modal('hide');
		// Eliminar todos los nodos hijos del elemento
		const eli = document.getElementById("loadingModal");
		//eli.remove();
		eli.style.display = 'none';
	}

	async function mostrarExitoVentaEcom(mensajeExito, dominio) {
		console.log("Entro a mostrarExitoVentaEcom desde mensajes para ecommerce")
		// Ocultar el offcanvas si ya existe la instancia, o crearla si no existe
		// Para un Offcanvas, usa la API de Offcanvas, no la de Modal

		// Ejecuta la función para cerrar todos los modales menues etc
		ocultarModalLoading()
		cerrarTodo();

		const modalAlert = document.getElementById('exitoVenta');
		modalAlert.innerHTML = ""; // Limpiar el contenido existente
		modalAlert.style.display = 'block';
	
		const div = document.createElement('div');
		div.className = 'modal fade';
	
		div.innerHTML = `
		<div class="modal-dialog modal-dialog-centered justify-content-center align-items-center h-100" data-bs-backdrop="static" data-bs-keyboard="false">
			<div class="m-2 p-1 modal-content border border-success bg-success text-white">
				<div class="card-header text-center justify-content-center align-items-center mt-2">
					<h5 class="card-title" id="exampleModalLabel">¡Felicitaciones!</h5>
				</div>
				<div class="p-2 card-body text-center text-white">
					<div>${mensajeExito}</div>
				</div>
				<div class="card-footer justify-content-center my-4" align="center">
					<button style="margin: auto;" class="btn btn-primary" id="btnTerminarVenta159">
						Terminar
					</button>
				</div>
			</div>
		</div>
	`;
	
	
		modalAlert.appendChild(div);
	
		const myModal = new bootstrap.Modal(div);
		myModal.show();
	
		// Mover la asignación del evento aquí
		const botoner = div.querySelector('#btnTerminarVenta159'); // Asegúrate de seleccionar el botón correcto
		botoner.addEventListener("click", () => {
			console.log("El boton hizo click", botoner)
			modalAlert.innerHTML = ""; // Limpiar el contenido
			myModal.hide(); // Cerrar el modal
			location.href = dominio;
		});

		if (dominio) {
			setTimeout(() => {
				const myModal = new bootstrap.Modal(div);
				myModal.hide(); // Oculta el modal
				location.href = dominio;
			}, 10000);
		}
	}

	function vuelvePronto(mensajeExito) {
		//reproducirSonidoE(0.8, 0.05); // Velocidad normal, volumen al 100%
		// Obtener el elemento con el id "modalAlert"
		const modalAlertE = document.getElementById('muestraChau');
		modalAlertE.style.display = 'block';
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div
		div.className = 'modal fade';
		// Establecer el id del nuevo div
		div.id = 'muestraChau';
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
		<div style="z-index:999999999999999999999999999999 !important" class="modal-dialog modal-dialog-centered justify-content-center align-items-center">
			<div class="modal-content border text-white justify-content-center align-items-center">
				<div class="modal-header text-center justify-content-center align-items-center">
					<h5 class="modal-title" id="exampleModalLabel" hidden>Nos Vemos...</h5>
				</div>
				<br>
				<iframe src="https://giphy.com/embed/hDSGolpaNZTK9OQJqk" width="250" height="250" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
				<div class="modal-body text-center">
					<h5>${mensajeExito}</h5>
				</div>
				<div class="modal-footer justify-content-center" style="margin:auto" hidden>  
					<button style="margin: auto;" class="btn btn-primary" id="btnCerrarExit987">
						cerrar
					</button>
				</div>  				
			</div>
		</div>
		`;

		// Agregar el nuevo div al elemento con el id "modalAlert"
		modalAlertE.appendChild(div);

		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();

		// Mover la asignación del evento aquí
		const botonerC = div.querySelector('#btnCerrarExit987'); // Asegúrate de seleccionar el botón correcto
		botonerC.addEventListener("click", () => {
			myModal.hide(); // Cerrar el modal
			modalAlertE.style.display = 'none';
			modalAlertE.innerHTML = ""; // Limpiar el contenido
		});
	}

	// Mensajes de advertencia y confirmación
	function mostrarAlerta(mensajeAlert) {
		// Obtener el elemento con el id "modalAlert"
		const modalAlert = document.getElementById('muestraAlerta');
		modalAlert.style.display = 'block';
		modalAlert.style.position = 'fixed'; // Para que siempre esté visible en la pantalla
		modalAlert.style.zIndex = '2147483647'; // Asegurar que esté al frente
	
		// Crear un nuevo elemento div para el modal
		const div = document.createElement('div');
		div.className = 'modal fade';
		div.id = 'muestraAlertaModal'; // ID único para evitar conflictos
		div.style.zIndex = '2147483647'; // Asegurar que esté al frente de cualquier otro elemento
		div.style.position = 'fixed'; // Asegurar que se posicione sobre la pantalla completa
	
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
			<div class="modal-dialog modal-dialog-centered" style="z-index: 2147483647">
				<div class="modal-content" style="border: 1px solid red; background-color: rgb(144, 97, 97); color: white; z-index: 2147483647">
					<div class="modal-header text-center" style="z-index: 2147483647">
						<h5 class="modal-title">¡Atención!</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body" style="z-index: 2147483647">
						<h5>${mensajeAlert}</h5>
					</div>
				</div>
			</div>
		`;
	
		// Agregar el nuevo div al cuerpo del documento
		document.body.appendChild(div);
	
		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();
	}

	function mostrarExito(mensajeExito) {
		reproducirSonidoE(0.8, 0.05); // Velocidad normal, volumen al 100%
		// Obtener el elemento con el id "modalAlert"
		const modalAlert = document.getElementById('muestraExito');
		modalAlert.style.display = 'block';
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div
		div.className = 'modal fade';
		// Establecer el id del nuevo div
		div.id = 'muestraExito';
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
		<div class="modal-dialog modal-dialog-centered justify-content-center align-items-center" data-bs-backdrop="static">
			<div class="modal-content border border-success bg-success text-white justify-content-center align-items-center">
				<div class="modal-header text-center justify-content-center align-items-center">
					<h5 class="modal-title" id="exampleModalLabel">¡Felicitaciones!</h5>
					<button style="margin: 0 -2rem 0 0" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<br>
				<iframe style="border-radius:1rem" src="https://giphy.com/embed/f3orDrv1hzyMvgI3y6" width="130" height="130" frameborder="0" class="giphy-embed" allowfullscreen></iframe>
				<div class="modal-body text-center">
					<h5>${mensajeExito}</h5>
				</div>
			</div>
		</div>
	`;


		// Agregar el nuevo div al elemento con el id "modalAlert"
		modalAlert.appendChild(div);

		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();
	}
	function mostrarPagoWallet(mensajeExito) {
		reproducirSonidoE(0.8, 0.05); // Velocidad normal, volumen al 100%
		// Obtener el elemento con el id "modalAlert"
		const modalAlert = document.getElementById('pagoWallet');
		modalAlert.style.display = 'block';
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div
		div.className = 'modal fade';
		// Establecer el id del nuevo div
		div.id = 'pagoWallet';
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
		<div style="zIndex:9999999999999999999999999999 !important" class="modal-dialog modal-dialog-centered justify-content-center align-items-center" data-bs-backdrop="static">
			<div style="zIndex:9999999999999999999999999999 !important" class="modal-content border border-success bg-primary text-white justify-content-center align-items-center">
				<br>
				<iframe class="justify-content-center align-items-center" style="border-radius: 1rem;" src="https://giphy.com/embed/mGNO9zHJpV9JOVRz1L" width="150" height="150" frameborder="0" class="giphy-embed" allowfullscreen></iframe>
				<div class="modal-body text-center">
					<h5>${mensajeExito}</h5>
				</div>
			</div>
		</div>
	`;


		// Agregar el nuevo div al elemento con el id "modalAlert"
		modalAlert.appendChild(div);

		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();
	}
	function confirmOptions(mensajeOptions, confirma, rechaza) {
		// Obtener el elemento con el id "modalAlert"confir
		const modalAlert = document.getElementById('opciones');
		//modalAlert.style.display = 'absolute';
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div
		div.className = 'modal fade';
		// Establecer el id del nuevo div
		div.id = 'opciones';
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
			<div class="modal-dialog modal-dialog-centered data-bs-backdrop="static"">
				<div class="modal-content" style="border: 1px solid rgb(9, 60, 243); background-color: rgb(112, 185, 245);">
					<div class="modal-header text-center">
						<h5 class="modal-title" id="exampleModalLabel">Elije una opción</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<h5>${mensajeOptions}</h5>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-success" id="confirmOption">Confirmar</button>
						<button type="button" class="btn btn-danger" id="cancelOption" data-bs-dismiss="modal">Cancelar</button>
					</div>
				</div>
			</div>
		`;

		// Agregar el nuevo div al elemento con el id "modalAlert"
		modalAlert.appendChild(div);

		// Agregar un evento al botón de confirmar
		const confirmButton = document.getElementById('confirmOption');
		confirmButton.addEventListener('click', async () => {
			// Lógica cuando el usuario confirma (puedes redirigirlo a la página correspondiente)
			confirma()
			//console.log("Confirmo la opcion del modal confirm")
			// Cierra el modal
			//location.reload();
			//modalAlert.remove();
			div.innerHTML = ""
			// modalAlert.style.display = 'none';
			// const myModalin = new bootstrap.Modal(modalAlert);
			// myModalin.hide();


		});

		// Agregar un evento al botón de cancelar
		const cancelButton = document.getElementById('cancelOption');
		cancelButton.addEventListener('click', async () => {
			// Lógica cuando el usuario cancela
			//console.log("Rechazo la opcion del modal confirm")
			rechaza()
			location.reload();
			// Cierra el modal
			const myModal = new bootstrap.Modal(modalAlert);
			myModal.hide();
		});

		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();
	}
	function mostrarToast(mensaje) {
		//console.log("Entro a mostrar toast");
		Toastify({
			text: mensaje,
			duration: 9000,  // Duración en milisegundos
			newWindow: true,
			close: true,
			gravity: "top", // "top" o "bottom"
			position: "right", // "left", "center" o "right"
			style: {
				backgroundColor: "linear-gradient(to right, #FF9800, #F44336)",
			}
		}).showToast();
	}

	// Función para ocultar los modales en el Ecommerce
	function ocultarModalEcom(modalHide) {
		//console.log("Entro a cerrar el modal a que no funca")
		const modalElement = document.getElementById(modalHide);
		modalElement.innerHTML = ""
		// const modal = bootstrap.Modal.getInstance(modalElement);
		// modal.hide();
	}

	// Función para cerrar modales abiertos
	function cerrarModales() {
		const modales = document.querySelectorAll('.modal.show'); // Selecciona todos los modales abiertos
		modales.forEach(modalElement => {
			const modalInstance = bootstrap.Modal.getInstance(modalElement); // Obtiene la instancia del modal
			if (modalInstance) {
				modalInstance.hide(); // Cierra el modal
			}
		});
	}

	// Función para cerrar offcanvas abiertos
	function cerrarOffcanvas() {
		const offcanvases = document.querySelectorAll('.offcanvas.show'); // Selecciona todos los offcanvas abiertos
		offcanvases.forEach(offcanvasElement => {
			const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement); // Obtiene la instancia del offcanvas
			if (offcanvasInstance) {
				offcanvasInstance.hide(); // Cierra el offcanvas
			}
		});
	}

	// Función para cerrar dropdowns abiertos (opcional)
	function cerrarDropdowns() {
		const dropdowns = document.querySelectorAll('.dropdown-menu.show'); // Selecciona todos los dropdowns abiertos
		dropdowns.forEach(dropdownElement => {
			const dropdownToggle = dropdownElement.previousElementSibling; // Encuentra el botón de activación del dropdown
			const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle); // Obtiene la instancia del dropdown
			if (dropdownInstance) {
				dropdownInstance.hide(); // Cierra el dropdown
			}
		});
	}

	// Función para cerrar todos los componentes activos (modales, offcanvas, dropdowns)
	function cerrarTodo() {
		cerrarModales(); // Cierra todos los modales abiertos
		cerrarOffcanvas(); // Cierra todos los offcanvas abiertos
		cerrarDropdowns(); // Cierra todos los dropdowns abiertos
	}