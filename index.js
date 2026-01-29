const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const {
  shouldIgnoreMessage,
  handleBotMessage,
  getBotStats,
  userStates,
} = require("./ai,js");

// Use the session data if it exists
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false, // 👈 clave para debug
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  },
});

client.on("ready", () => {
  console.log("Client is ready!");
  console.log("🤖 Bot iniciado con funcionalidad de soporte humano");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("message", async (message) => {
  try {
    console.log("\n--- Mensaje recibido ---");
    console.log("De:", message.from);
    console.log("Contenido:", message.body);
    console.log("Tipo:", message.type);

    // Verificar que el mensaje sea reciente (no más de 15 minutos)
    const messageTimestamp = message._data.timestamp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();
    const timeDifference = currentTime - messageTimestamp;

    if (timeDifference > 15 * 60 * 1000) {
      // 15 minutos
      console.log(
        `[message] Mensaje muy antiguo (${Math.round(
          timeDifference / 1000
        )}s), ignorando`
      );
      return;
    }

    if (!message._data.id.fromMe) {
      // Verificar si debemos ignorar el mensaje
      const shouldIgnore = await shouldIgnoreMessage(message);
      console.log("¿Debe ignorarse?", shouldIgnore);
      if (shouldIgnore) {
        console.log("Mensaje ignorado por shouldIgnoreMessage");
        return;
      }

      // Obtener respuesta del bot
      console.log("Llamando a handleBotMessage...");
      const response = await handleBotMessage(message);
      console.log("Respuesta generada:", response);

      // Solo responder si hay una respuesta válida
      if (
        response &&
        typeof response === "string" &&
        response.trim().length > 0
      ) {
        console.log("Intentando enviar mensaje a:", message.from);
        console.log("Longitud del mensaje:", response.length);

        // Delay para que suene el teléfono del administrador (solo si NO está en modo test)
        const userState = userStates[message.from];
        if (!userState || !userState.testMode) {
          console.log("⏰ Esperando 1.5 segundos para notificación...");
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          console.log("🚀 Modo test activado - sin delay");
        }

        try {
          // Enviar mensaje directamente
          const sentMessage = await client.sendMessage(message.from, response);

          console.log("Respuesta enviada exitosamente al usuario");
        } catch (sendError) {
          console.error("Error al enviar mensaje:", sendError);

          // Intentar enviar un mensaje de error simple
          try {
            const errorMessage = await client.sendMessage(
              message.from,
              "Lo siento, hubo un error técnico. Por favor, intenta de nuevo."
            );

            console.log("Mensaje de error enviado");
          } catch (finalError) {
            console.error(
              "Error final al enviar mensaje de error:",
              finalError
            );
          }
        }
      } else {
        console.log(
          "No se envió respuesta (puede estar en modo humano o error)"
        );
      }
    }
  } catch (err) {
    console.error("Error en el manejo del mensaje:", err);
  }
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected", reason);
  client.initialize(); // Reinitialize the client to prompt for a new QR code
});

// Función para mostrar estadísticas del bot (opcional, para debugging)
function showBotStats() {
  const stats = getBotStats();
  console.log("📊 Estadísticas del bot:");
  console.log(`   Total usuarios contactados: ${stats.totalUsers}`);
  console.log(`   Usuarios contactados hoy: ${stats.activeToday}`);
}

// Mostrar estadísticas cada 5 minutos
setInterval(showBotStats, 5 * 60 * 1000);

client.initialize();
