const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const {
  shouldIgnoreMessage,
  handleBotMessage,
  getBotStats,
  userStates,
} = require("./ai,js");

// Flag para indicar que se está enviando un mensaje automático
let isSendingAutoMessage = false;

// Historial de estados del flag para poder verificar mensajes pasados
const autoMessageHistory = [];

// Función para obtener el estado del flag
function getIsSendingAutoMessage() {
  return isSendingAutoMessage;
}

// Función para registrar cambios en el estado del flag
function setAutoMessageFlag(value) {
  isSendingAutoMessage = value;
  autoMessageHistory.push({
    timestamp: Date.now(),
    isAuto: value,
  });

  // Limpiar historial antiguo (más de 1 hora)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const filteredHistory = autoMessageHistory.filter(
    (entry) => entry.timestamp > oneHourAgo
  );
  autoMessageHistory.length = 0;
  autoMessageHistory.push(...filteredHistory);
}

// Función para verificar si un mensaje fue automático basándose en su timestamp
function wasMessageAutoAtTime(messageTimestamp) {
  const msgTime = messageTimestamp * 1000;

  // Buscar el estado del flag más cercano al timestamp del mensaje
  let closestEntry = null;
  let minDiff = Infinity;

  for (const entry of autoMessageHistory) {
    const diff = Math.abs(entry.timestamp - msgTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestEntry = entry;
    }
  }

  // Si no hay entradas en el historial o la diferencia es muy grande, asumir que fue manual
  if (!closestEntry || minDiff > 30 * 1000) {
    // Más de 30 segundos de diferencia
    return false;
  }

  return closestEntry.isAuto;
}

// Use the session data if it exists
const client = new Client({
  authStrategy: new LocalAuth(),
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
      const shouldIgnore = await shouldIgnoreMessage(
        message,
        getIsSendingAutoMessage,
        wasMessageAutoAtTime
      );
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
          // Marcar que se está enviando un mensaje automático
          setAutoMessageFlag(true);

          // Enviar mensaje directamente con la versión actualizada
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
        } finally {
          // Resetear el flag después del envío (exitoso o con error)
          setAutoMessageFlag(false);
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

client.on("message_create", async (message) => {
  try {
    console.log("\n--- [message_create] Mensaje creado ---");
    console.log("De:", message.from);
    console.log("Para:", message.to);
    console.log("Contenido:", message.body);
    console.log("Tipo:", message.type);
    console.log("fromMe:", message._data.id.fromMe);

    const targetNumber = "5491130350056@c.us"; // Tu número de bot

    // Solo procesar si el mensaje viene del propio bot
    if (message.from === targetNumber) {
      const messageId = message.id._serialized;

      // Verificar si es un mensaje automático usando el flag
      if (wasMessageAutoAtTime(message._data.timestamp)) {
        console.log(
          `[message_create] Mensaje automático detectado (flag activo), no se silencia el bot`
        );
        return;
      }

      // Si el flag no está activo, es un mensaje manual (enviado por WhatsApp Web)
      const userToMute = message.to;
      console.log(
        `[message_create] Mensaje manual detectado para ${userToMute} (ID: ${messageId}) - El bot se desactivará automáticamente si hay actividad reciente`
      );
      return;
    }
  } catch (err) {
    console.error("Error en el manejo de message_create:", err);
  }
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

module.exports = {
  getIsSendingAutoMessage,
  wasMessageAutoAtTime,
};
