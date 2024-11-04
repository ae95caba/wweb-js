const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

// Use the session data if it exists
const client = new Client({
  authStrategy: new LocalAuth(),
});

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

client.on("message", (message) => {
  if (message.body === "Hello") {
    client.sendMessage(message.from, "World");
  }
});

client.on("message_create", async (message) => {
  console.log("----------------------------------");
  const isFromMe = message._data.id.fromMe;
  let name;
  let log;
  const chat = await message.getChat();

  // Check if the chat is archived
  if (chat.archived) {
    return;
  }

  if (isFromMe) {
    log = `Me: ${message.body}`;
  } else {
    contact = await message.getContact();
    name = contact.name || contact.pushname;
    log = `${name}: ${message.body}`;
  }

  console.log(log);
  console.log("----------------------------------");
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected", reason);

  client.initialize(); // Reinitialize the client to prompt for a new QR code
});

client.initialize();
