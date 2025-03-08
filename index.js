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
  const isGroupChat = chat.id.server === "g.us";
  // Check if the chat is archived
  const isArchived = chat.archived;
  // Ignore status updates (WhatsApp Stories)
  const isStory = message.from === "status@broadcast";
  const targetNumber = "5491130350056@c.us"; // The number you don't want to forward messages to/from
  // Skip empty or "This message can't be displayed here" messages
  const isTextLess = !message.body || message.body === "";
  const hasImage = message.type === "image";
  const isEmpty = !hasImage && isTextLess;
  // Ignore messages sent to or received from the target number
  const isIrrelevant =
    message.from === targetNumber || message.to === targetNumber;
  // Check if the chat is archived
  if (isGroupChat || isArchived || isStory || isTextLess || isIrrelevant) {
    return;
  }

  /*  // Ignore system messages (disappearing messages, deleted messages, etc.)
  const systemTypes = ["protocol", "revoked", "ciphertext"];
  if (systemTypes.includes(message.type)) {
    return;
  }
 */

  if (isFromMe) {
    const contact = await client.getContactById(message.to);
    const receiver = contact.name || contact.number; // Prioritize pushname, then name, then number
    log = `Me: ${message.body} to ${receiver}`;
  } else {
    contact = await message.getContact();
    name = contact.name || contact.pushname;
    log = `${name}: ${message.body}`;
  }

  console.log(log);
  // Forward the message

  await client.sendMessage(targetNumber, log);

  console.log("----------------------------------");
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected", reason);

  client.initialize(); // Reinitialize the client to prompt for a new QR code
});

client.initialize();
