const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const {
  shouldIgnoreMessage,
  handleBotMessage,
  getBotStats,
} = require("./ai,js");

// Use the session data if it exists
const client = new Client({
  authStrategy: new LocalAuth(),
});

// Estado de conversación por usuario
const userStates = {}; // { [userId]: { state: 'menu' | 'option1' | 'option2' | etc } }

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
      if (response) {
        await message.reply(response);
        console.log("Respuesta enviada al usuario");
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
  console.log(`   Total usuarios: ${stats.totalUsers}`);
  console.log(`   Usuarios con soporte humano: ${stats.usersWithHumanSupport}`);
  console.log(`   Usuarios activos del bot: ${stats.activeBotUsers}`);
}

// Mostrar estadísticas cada 5 minutos
setInterval(showBotStats, 5 * 60 * 1000);

client.initialize();
