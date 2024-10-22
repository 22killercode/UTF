	// funciones de modal de espera loading
	function mostrarModalLoading() {
		//console.log("Entro a MOSTRAR modal loading")
		$('#loadingModal').modal('show');
	}
	// Función para ocultar el modal
	function ocultarModalLoading() {
		//console.log("Entro a ocultar modal loading")
		$('#loadingModal').modal('hide');
		// Eliminar todos los nodos hijos del elemento
		const eli = document.getElementById("loadingModal");
		if (eli) {
			eli.remove()|| (eli.style.display = 'none')
		}
	}

	function mostrarExitoVenta(mensajeExito) {
		// Obtener el elemento con el id "modalAlert"
		const modalAlert = document.getElementById('exitoVenta');
		modalAlert.innerHTML = ""; // Limpiar el contenido existente
		modalAlert.style.display = 'block';
	
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div  
		div.className = 'modal fade';
	
		// Definir la URL desde donde deseas obtener la URL principal
		const url = window.location.href; // Aquí obtienes la URL actual
	
		function obtenerUrlPrincipal(url) {
			// Crear un objeto URL
			const parsedUrl = new URL(url);
			// Obtener el protocolo, el host y el primer path
			//const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname.split('/').slice(0, 3).join('/')}`;
			const baseUrl = `${parsedUrl.protocol}`;
			return baseUrl;
		}
	
		const urlPrincipal = obtenerUrlPrincipal(url);
	
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
		<div class="modal-dialog modal-dialog-centered justify-content-center align-items-center h-100">
			<div class="modal-content border border-success bg-success text-white">
				<div class="modal-header text-center justify-content-center align-items-center">
					<h5 class="modal-title" id="exampleModalLabel">¡Felicitaciones!</h5>
				</div>
				<div class="modal-body text-center text-white">
					<div>${mensajeExito}</div>
				</div>
				<div class="modal-footer justify-content-center">
					<button style="margin: auto;" class="btn btn-primary" id="btnTerminarVenta159">
						Terminar
					</button>
				</div>
			</div>
		</div>
		`;
	
		// Agregar el nuevo div al elemento con el id "modalAlert"
		modalAlert.appendChild(div);
	
		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();

		// Mover la asignación del evento aquí
		const botoner = div.querySelector('#btnTerminarVenta159'); // Asegúrate de seleccionar el botón correcto
		botoner.addEventListener("click", () => {
			modalAlert.innerHTML = ""; // Limpiar el contenido
			myModal.hide(); // Cerrar el modal
		});
	}

	function mostrarInfo(mensajeInfo, idOwner) {
		// Obtener el elemento con el id "modalAlert"
		const modalAlert = document.getElementById('informacionPlus');
		modalAlert.innerHTML = "";
		modalAlert.style.display = 'block';
		
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div
		div.className = 'modal fade';
		// Establecer el id del nuevo div
		div.id = 'exitoVenta';
		
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
		<div class="modal-dialog modal-dialog-centered justify-content-center align-items-center">  
			<div class="modal-content border border-success" style="background-color: #00bcd4; color: white;">  
				<div class="modal-header text-center justify-content-center align-items-center">  
					<h5 class="modal-title" id="exampleModalLabel">¡Información!</h5>  
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" hidden></button>  
				</div>  
				<div class="modal-body text-center text-white p-4" style="max-height: calc(90vh - 150px); overflow:hidden;overflow-y: auto;">  
					<h5>${mensajeInfo}</h5>  
				</div>
<div class="modal-footer justify-content-center" style="margin:0.5rem; display: flex; gap: 1rem;">  
	<div class="">
		<div class="form-check form-switch">
			<input class="form-check-input" type="checkbox" id="switch2">
			<label class="form-check-label" for="switch2">No mostrar informe nuevamente.</label>
		</div>
		<div class="form-check form-switch">
			<input class="form-check-input" type="checkbox" id="switch1">
			<label class="form-check-label" for="switch1">Eliminar todos los informes</label>
		</div>
    </div>
    <button style="margin: auto;" class="btn btn-primary" id="btnCerrarInfo159">
        Cerrar/Activar
    </button>
	<p>Puedes volver a ver el informe presionando "Ver Informe"</p>
</div>  
			</div>  
		</div>
		`;
		
		// Agregar el nuevo div al elemento con el id "modalAlert"
		modalAlert.appendChild(div);
		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();
	



    // Switch 1
    document.getElementById('switch1').addEventListener('change', function() {
        if (this.checked) {
            let confirmation = confirm("¿Estás seguro de que deseas eliminar todos los informes?");
            if (!confirmation) {
                this.checked = true;
            } else {
                // Acciones para eliminar mensajes
                console.log("Todos los mensajes eliminados.");
            }
        }
    });

    // Switch 2
    document.getElementById('switch2').addEventListener('change', function() {
        if (this.checked) {
            let confirmation = confirm("¿Estás seguro de que no deseas volver los informes en esta sesión?");
            if (!confirmation) {
                this.checked = true;
            } else {
                // Acciones para no volver a mostrar la información
                console.log("No volver a mostrar esta información activado.");
            }
        }
    });




		// Añadir evento de eliminación a cada elemento
		const cantDel = document.querySelectorAll('.delete-info').forEach((deleteBtn) => {
			deleteBtn.addEventListener('click', (event) => {
				const liElement = event.target.closest('li'); // Obtener el <li> más cercano
				const idInforme = liElement.querySelector('p[data-id]').getAttribute('data-id'); // Obtener el ID del informe
				
				if (confirm('¿Quieres eliminar este informe?')) {
					liElement.remove(); // Eliminar el <li>
					// Eliminar el informe
					eliminarInformeRapido(idInforme, idOwner).then(() => {
						// Verifica si no quedan más informes (elementos <li>)
						const remainingItems = document.querySelectorAll('.delete-info').length;
	
						if (remainingItems === 0) {
							// Cerrar el modal si ya no hay más informes
							myModal.hide(); // Oculta el modal
						}
					});
				}
			});
		});
	
		// Asignación del evento de cerrar el modal
		const botoner = div.querySelector('#btnCerrarInfo159'); // Selecciona el botón correcto
		botoner.addEventListener("click", () => {
			myModal.hide(); // Cerrar el modal
			//SI ESTANA CTIVADOS LSO SWTICHES EN TRUE ENVIA LA INFO AL SERVER
			const cheqElimnar = document.getElementById('switch1').value
			const cheqNover   = document.getElementById('switch2').value
			console.log("Que valor inicial tiene cheqNover",cheqNover )
			if (cheqNover === "on") {
				sessionStorage.setItem("okInfo", JSON.stringify(cheqNover));
				console.log("Entro a no volver a mostrar", cheqElimnar)
			}
			if (cheqElimnar === "on") {
				// se va al servr a eliminar todos los mensajes
				console.log("Entro a eliminar toda la info", cheqElimnar)
			}

		});
	}

	//Mensajes de advertincia y confirmacion
	function mostrarAlerta(mensajeAlert) {
		// Obtener el elemento con el id "modalAlert"
		const modalAlertC = document.getElementById('muestraAlerta');
		modalAlertC.style.display = 'block';
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div
		div.className = 'modal fade';
		// Establecer el id del nuevo div
		div.id = 'muestraAlerta';
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
			<div class="modal-dialog modal-dialog-centered" >
				<div class="modal-content" style="border: 1px solid red; background-color: rgb(144, 97, 97); color: white;">
					<div class="modal-header text-center">
						<h5 class="modal-title" id="exampleModalLabel">¡Atención!</h5>
					</div>
					<div class="modal-body">
						<h5>${mensajeAlert}</h5>
					</div>
					<div class="modal-footer justify-content-center" style="margin:auto">  
						<button style="margin: auto;" class="btn btn-danger" id="btnCerrarAlert159">
							cerrar
						</button>
					</div>  
				</div>
			</div>
		`;

		// Agregar el nuevo div al elemento con el id "modalAlert"
		modalAlertC.appendChild(div);

		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();
		// Mover la asignación del evento aquí
		const botonerC = div.querySelector('#btnCerrarAlert159'); // Asegúrate de seleccionar el botón correcto
		botonerC.addEventListener("click", () => {
			myModal.hide(); // Cerrar el modal
			modalAlertC.style.display = 'none';
			modalAlertC.innerHTML = ""; // Limpiar el contenido
		});
	}

	//Mensajes de advertincia y confirmacion sin boton cerrar
	function mostrarAlertaSigIn(mensajeAlert) {
		// Obtener el elemento con el id "modalAlert"
		const modalAlertC = document.getElementById('muestraAlerta');
		modalAlertC.style.display = 'block';
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div
		div.className = 'modal fade';
		// Establecer el id del nuevo div
		div.id = 'muestraAlerta';
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
			<div class="modal-dialog modal-dialog-centered" >
				<div class="modal-content" style="border: 1px solid red; background-color: rgb(144, 97, 97); color: white;">
					<div class="modal-header text-center">
						<h5 class="modal-title" id="exampleModalLabel">¡Atención!</h5>
					</div>
					<div class="modal-body">
						<h5>${mensajeAlert}</h5>
					</div>
				</div>
			</div>
		`;

		// Agregar el nuevo div al elemento con el id "modalAlert"
		modalAlertC.appendChild(div);

		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();

	}


	function mostrarExito(mensajeExito) {
		reproducirSonidoE(0.8, 0.05); // Velocidad normal, volumen al 100%
		// Obtener el elemento con el id "modalAlert"
		const modalAlertE = document.getElementById('muestraExito');
		modalAlertE.style.display = 'block';
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div
		div.className = 'modal fade';
		// Establecer el id del nuevo div
		div.id = 'muestraExito';
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
		<div class="modal-dialog modal-dialog-centered justify-content-center align-items-center">
			<div class="modal-content border border-success bg-success text-white justify-content-center align-items-center">
				<div class="modal-header text-center justify-content-center align-items-center">
					<h5 class="modal-title" id="exampleModalLabel" >¡Bien hecho!</h5>
				</div>
				<br>
				<iframe class="justify-content-center align-items-center" style="border-radius: 1rem;" width="150" height="150" frameborder="0" class="giphy-embed" allowfullscreen></iframe>
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

		// Ocultar el modal después de 3 segundos (3000 milisegundos)
		setTimeout(() => {
			myModal.hide();
		}, 4000);

		// Mover la asignación del evento aquí
		const botonerC = div.querySelector('#btnCerrarExit987'); // Asegúrate de seleccionar el botón correcto
		botonerC.addEventListener("click", () => {
			myModal.hide(); // Cerrar el modal
			modalAlertE.style.display = 'none';
			modalAlertE.innerHTML = ""; // Limpiar el contenido
		});
	}


	function vuelvePronto(mensajeExito) {
		//reproducirSonidoE(0.8, 0.05); // Velocidad normal, volumen al 100%
		// Obtener el elemento con el id "modalAlert"
		const modalAlertE = document.getElementById('muestraExito');
		modalAlertE.style.display = 'block';
		// Crear un nuevo elemento div
		const div = document.createElement('div');
		// Asignar la clase 'modal' al nuevo div
		div.className = 'modal fade';
		// Establecer el id del nuevo div
		div.id = 'muestraExito';
		// Asignar el contenido HTML al nuevo div
		div.innerHTML = `
		<div style="z-index:999999999999999999999999999999 !important" class="modal-dialog modal-dialog-centered justify-content-center align-items-center">
			<div class="modal-content border border-success bg-success text-white justify-content-center align-items-center">
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
		<div style="zIndex:99999999999999999999999999999 !important" class="modal-dialog modal-dialog-centered justify-content-center align-items-center">
			<div class="modal-content border border-success bg-primary text-white justify-content-center align-items-center">
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
			<div class="modal-dialog modal-dialog-centered">
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
			//await actualizarData()
		});

		// Mostrar el modal
		const myModal = new bootstrap.Modal(div);
		myModal.show();
	}
	// reproducir sonido de Exito
	function reproducirSonidoE(velocidad, volumen) {
		var audio = new Audio('sounds/dingDong.wav');
		audio.loop = false; // Reproducir en bucle
		audio.playbackRate = velocidad;
		audio.volume = volumen;
		audio.play();
	}

	// Función para ocultar los modales en Cpanel
	function ocultarModalCpanel(modalHide) {
		console.log("Entro a cerrar el modal a que no funca")
		const modalElement = document.getElementById(modalHide);
		//const modal12 = bootstrap.Modal.getInstance(modalElement);
		//modalElement.hide();
		modalElement.innerHTML = ""
	}

	//marca como elminado lso informes rapidos
	async function eliminarInformeRapido(idInforme, idOwner) {
		console.log("Eliminar informe rápido:", idInforme, idOwner);
	
		const datSend = { idInforme, idOwner };
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${jwToken}` // Asegúrate de que `jwToken` esté correctamente definido
			},
			body: JSON.stringify(datSend)
		};
	
		try {
			const response = await fetch(`${endpoints[173]}`, options);
	
			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					console.log("¿Pudo borrar el informe?", data);
	
					// Verifica que RefreshactualizarData devuelva una promesa
					const cheq = await RefreshactualizarData();
					console.log("Resultado de RefreshactualizarData:", cheq);
	
					if (cheq) {
						mostrarExito(data.message + "Si no atiendes estos temas volverán a aparecer en el informe"); // Mostrar mensaje de éxito
					} else {
						mostrarAlerta("No se actualizó la info, salga e ingrese nuevamente."); // Mostrar mensaje de alerta
					}
				} else {
					console.error("Error en la respuesta del servidor:", data.message);
					mostrarAlerta(data.message); // Mostrar el mensaje de error
				}
			} else {
				console.error("Error en la solicitud fetch eliminarInformeRapido:", response.statusText);
				mostrarAlerta(`Error en la solicitud fetch eliminarInformeRapido: ${response.statusText}`); // Mostrar un mensaje de error
			}
		} catch (error) {
			console.error("Error en la solicitud fetch eliminarInformeRapido:", error);
			mostrarAlerta(`Error en la solicitud fetch eliminarInformeRapido: ${error.message}`); // Mostrar un mensaje de error
		}
	}
	

