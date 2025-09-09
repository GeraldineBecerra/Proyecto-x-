import dotenv from "dotenv"
import sgMail from "@sendgrid/mail"
import express from "express";
import cors from "cors";
import path from "path";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);


dotenv.config();
const mailApi = process.env.SENDGRID_API_KEY;
const port = process.env.PORT;
const mail = process.env.MAIL;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

sgMail.setApiKey(mailApi)


app.use("/css", express.static(path.join(__dirname, "..", "css")));
app.use("/js", express.static(path.join(__dirname, "..", "js")));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.redirect("/bienvenida.html");
});



if (!mail || !mailApi) {
    console.error('ERROR: Faltan variables de entorno EMAIL_USER y/o EMAIL_PASS');
    console.log('Asegurate de crear el archivo .env con las credenciales de Gmail');
    process.exit(1);
}

app.post('/api/contact', async(req, res) => {

    console.log('=== NUEVA PETICION ===');
    console.log('Datos recibidos:', req.body);
    console.log('Headers:', req.headers);


    const { nombre, emailBody, telefono, asunto, mensaje } = req.body;


    if (!nombre || !emailBody || !telefono || !asunto || !mensaje) {
        console.log('ERROR: Faltan campos requeridos');

        return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos'
        });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailBody)) {
        console.log('ERROR: Email invalido');
        return res.status(400).json({
            success: false,
            message: 'Email invalido'
        });
    };

    const mailOptions = {
      from: {
        email: mail,
        name: "Pokemon TCG",
      },
      to: emailBody,
      subject: `Nuevo mensaje de ${nombre}: ${asunto}`,
      html: `
            <h2>Nuevo mensaje desde tu portafolio</h2>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> ${emailBody}</p>
            <p><strong>Telefono:</strong> ${telefono}</p>
            <p><strong>Asunto:</strong> ${asunto}</p>
            <p><strong>Mensaje:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb;">
                ${mensaje.replace(/\n/g, "<br>")}
            </div>
            <hr>
            <p><small>Este mensaje fue enviado desde tu formulario de contacto el ${new Date().toLocaleString()}</small></p>
        `,
    };


    try {
        console.log('Enviando correo...');


        const info = await sgMail.send(mailOptions);


        console.log('✓ Correo enviado exitosamente:');


        res.json({
            success: true,
            message: 'Mensaje enviado correctamente'
        });

    } catch (error) {

        console.error('ERROR enviando correo:', error);


        let errorMessage = 'Error al enviar el mensaje';

        if (error.code === 'EAUTH') {

            errorMessage = 'Error de autenticacion con Gmail. Verifica las credenciales';
        } else if (error.code === 'ENOTFOUND') {

            errorMessage = 'Error de conexion. Verifica tu conexion a internet';
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            debug: error.message
        });
    }
});



app.listen(port, () => {

    console.log('=== SERVIDOR INICIADO ===');
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log('Presiona CTRL+C para detener el servidor');
    console.log('========================');

});