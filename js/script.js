document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact-form');

    console.log('JavaScript cargado correctamente');
    console.log('Formulario encontrado:', form ? 'Si' : 'No');


    if (!form) {
        console.error('ERROR: No se encontro el formulario con clase .contact-form');
        return;
    }


    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        console.log('Enviando formulario...');


        const formData = {
            nombre: form.nombre.value.trim(),
            emailBody: form.emailBody.value.trim(),
            telefono: form.telefono.value.trim(),
            asunto: form.asunto.value.trim(),
            mensaje: form.mensaje.value.trim()
        };

        console.log('Datos a enviar:', formData);



        if (!formData.nombre || !formData.emailBody || !formData.telefono || !formData.asunto || !formData.mensaje) {
            alert('Por favor completa todos los campos');
            return;
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.emailBody)) {
            alert('Por favor ingresa un email valido');
            return;
        }


        if (formData.nombre.length < 2) {
            alert('El nombre debe tener al menos 2 caracteres');
            return;
        }

        if (formData.mensaje.length < 10) {
            alert('El mensaje debe tener al menos 10 caracteres');
            return;
        }


        const submitBtn = form.querySelector('button[type="submit"]');
        const textoOriginal = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;


        try {
            console.log('Enviando peticion a /api/contact');


            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Respuesta del servidor:', response.status);

            const result = await response.json();
            console.log('Datos de respuesta:', result);


            if (result.success) {
                alert('Mensaje enviado correctamente! Te respondere pronto.');
                form.reset();
            } else {
                alert('Error: ' + result.message);
            }

        } catch (error) {

            console.error('Error completo:', error);
            alert('Error al enviar el mensaje. Verifica que el servidor este corriendo.');
        } finally {

            submitBtn.textContent = textoOriginal;
            submitBtn.disabled = false;
        }
    });
});