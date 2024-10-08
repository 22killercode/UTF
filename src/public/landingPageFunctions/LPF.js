        // let endpoints = {}

        // busca la info inicial del server PROTEGER RUTA
        window.addEventListener('load', async () => {
            try {
                // Realizar la solicitud fetch usando async/await
                const response = await fetch('/dataInfoTokensEtc');
        
                // Verificar si la respuesta fue exitosa
                if (!response.ok) {
                    mostrarAlerta('Revisa tu conexión a Internet');
                    throw new Error('Revisa tu conexión a Internet');
                }
        
                // Si la respuesta fue exitosa, obtener los datos JSON
                const data = await response.json();
        
                // Manejar los datos recibidos del servidor
                console.log('Datos recibidos desde el server dataInfoTokensEtc:', data);
                
                // Guardar la información en el almacenamiento local
                endpoints = data.endPointsIdTokens;
                sessionStorage.setItem('endPointsIdTokensCpanel', JSON.stringify(data.endPointsIdTokens));
        
            } catch (error) {
                // Manejar cualquier error ocurrido durante la solicitud
                console.error('Error:', error);
                mostrarAlerta(`Error en la solicitud desde LPF linea 28 ${error}`);
            }
        });
        


        // SignUP inscribir dueños de Ecommerce
        const sigUp = document.getElementById('botonSignUp09870');
        if (sigUp) {
            sigUp.addEventListener('click', async function() {
                    mostrarModalLoading()
                    const email = document.getElementById('email1').value;
                    const password = document.getElementById('password').value;
                    const confirmPassword = document.getElementById('confirm-password').value;
                    const tyc = document.getElementById('invalidCheck22').value;
                    if (password !== confirmPassword) {
                        mostrarAlertaSigIn('Las contraseñas no coinciden.');
                        return;
                    }
                    // Verificar que la contraseña cumpla con los requisitos
                    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9a-zA-Z]).{8,}$/;
                    if (!passwordRegex.test(password)) {
                        mostrarAlertaSigIn('La contraseña debe contener al menos una mayúscula y ser de al menos 8 caracteres alfanuméricos.');
                        return;
                    }
    
                    const data = { email, password, confirmPassword, tyc };
                    mostrarModalLoading()

                    try {
                        const response = await fetch(`${endpoints[0]}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        }); 
                        const result = await response.json();
                        // const signupModal = document.getElementById('signupModal');
                        // signupModal.innerHTML = "";
                        ocultarModalCpanel("signupModal")
                        if (response.ok) {
                            const signupModal = document.getElementById('signupModal');
                            signupModal.innerHTML = ""
                            ocultarModalLoading()
                            mostrarExito(result.message, 'success');
                            // Esperar 3 segundos y luego recargar la página
                            setTimeout(() => {
                                location.reload();
                            }, 8000);
                        } else {
                            ocultarModalLoading()
                            mostrarAlertaSigIn(result.message, 'error');
                            // Esperar 3 segundos y luego recargar la página
                            setTimeout(() => {
                                location.reload();
                            }, 3000);
                        }
                    } catch (error) {
                        ocultarModalLoading()
                        console.error('Error:', error);
                        mostrarAlertaSigIn('No se pudo registrar, error en el fetch signUp', error);
                        // Esperar 3 segundos y luego recargar la página
                        setTimeout(() => {
                            location.reload();
                        }, 3000);
                    }
            });
        }

        //SignIn
        const signinCheq = document.getElementById('btnSignIn1598563');
        if (signinCheq) {
            signinCheq.addEventListener('click', async function() {
                    //console.log("Hizo click en el boton para ingresar al Cpanel")
                    
                    const email = document.getElementById('emailSignIn').value;
                    const password = document.getElementById('passwordSignIN').value;

                    //console.log("Hizo click en el boton para ingresar al Cpanel", endpoints[22])

                    try {
                        mostrarModalLoading()
                        const response = await fetch(`${endpoints[22]}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ email, password })
                        });
                        const result = await response.json();
                        if (response.ok) { 
                            // Guardar la data en sessionStorage
                            const jwToken = result.data.jwToken
                            sessionStorage.setItem('jwTokenOwner', jwToken);
                            sessionStorage.setItem('ownerData', JSON.stringify(result.data.dataOwner));
                            sessionStorage.setItem('basicData', JSON.stringify(result.data.basicData));
                            sessionStorage.setItem('ownerProducts', JSON.stringify(result.data.ownerProducts));
                            sessionStorage.setItem('ownerPromos', JSON.stringify(result.data.ownerPromos)); 
                            sessionStorage.setItem('ownerMensajes', JSON.stringify(result.data.ownerMensajes));  
                            //window.location.href = `http://localhost:3020/cPanel.html?token=${jwToken}`;
                            const diretionsss = `${urlServer}cPanel.html?token=${jwToken}`;
                            console.log("Que datos trajo del server DESDE EL SIGN IN??",diretionsss, result.data.dataOwner)
                            window.location.href = diretionsss
                        } else {
                            ocultarModalLoading()
                            mostrarAlertaSigIn(`${result.message}`);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        console.log('Error:', error.message);
                        ocultarModalLoading()
                        mostrarAlertaSigIn(`Revisa tu conexión a internet e inténtelo de nuevo más tarde.${error}`);
                        setTimeout(async () => {
                            await actualizarData()
                        }, 1000); // 3000 milisegundos = 3 segundos
                    }
            });
        }


