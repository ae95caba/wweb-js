const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { shouldIgnoreMessage, handleBotMessage } = require("./ai,js");

// Use the session data if it exists
const client = new Client({
  authStrategy: new LocalAuth(),
});

// Estado de conversación por usuario
const userStates = {}; // { [userId]: { state: 'menu' | 'option1' | 'option2' | etc } }

client.on("ready", () => {
  console.log("Client is ready!");
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
  if (!message._data.id.fromMe) {
    if (await shouldIgnoreMessage(message)) {
      return;
    }

    const response = handleBotMessage(message);

    if (response) {
      await message.reply(response);
    }
  }
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected", reason);
  client.initialize(); // Reinitialize the client to prompt for a new QR code
});

client.initialize();
