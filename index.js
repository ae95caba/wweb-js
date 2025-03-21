const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

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
  const isFromMe = message._data.id.fromMe;
  let name;
  let log;
  const chat = await message.getChat();

  const targetNumber = "5491130350056@c.us"; // The number you don't want to forward messages to/from

  const hasImage = message.type === "image";
  const imageData = hasImage && message._data.body;

  function shouldIgnoreMessage() {
    // Check if the chat is archived
    const isArchived = chat.archived;
    // Ignore status updates (WhatsApp Stories)
    const isStory = message.from === "status@broadcast";

    const isTextLess = !message.body || message.body === "";

    //ignore group messages
    const isGroupChat = chat.id.server === "g.us";
    //ignore muted chats
    const isMuted = chat.muteExpiration === -1;
    // Skip empty or "This message can't be displayed here" messages
    const isEmpty = !hasImage && isTextLess;
    // Ignore messages sent to or received from the target number
    const isIrrelevant =
      message.from === targetNumber || message.to === targetNumber;
    const reasonsToIgnoreMessage = [];

    if (isGroupChat) reasonsToIgnoreMessage.push("isGroupChat");
    if (isArchived) reasonsToIgnoreMessage.push("isArchived");
    if (isStory) reasonsToIgnoreMessage.push("isStory");

    if (isIrrelevant) reasonsToIgnoreMessage.push("isIrrelevant");
    if (isMuted) reasonsToIgnoreMessage.push("isMuted");
    if (isEmpty) reasonsToIgnoreMessage.push("isEmpty");

    if (reasonsToIgnoreMessage.length > 0) {
      console.log("--------------- START -------------------");
      console.log("return triggered");
      console.log("reason:", reasonsToIgnoreMessage.join(", "));
      console.log("--------------- END -------------------");
      return reasonsToIgnoreMessage.length;
    }
  }
  if (shouldIgnoreMessage()) {
    return;
  }

  // handling messages with images
  if (hasImage) {
    const media = new MessageMedia("image/jpeg", imageData);
    // Send the image
    await client.sendMessage(targetNumber, media, {
      caption: message.body,
    });
    console.log("Image sent successfully!");
  } else {
    console.log("doesnt have image");
  }

  //handle the rest of messages
  if (isFromMe) {
    const contact = await client.getContactById(message.to);
    const receiver = contact.name || contact.number; // Prioritize pushname, then name, then number
    log = `Mama: ${message.body} a ${receiver}`;
  } else {
    contact = await message.getContact();
    name = contact.name || contact.pushname;
    log = `${name}: ${message.body}`;
  }
  console.log("--------------- START  -------------------");
  console.log(log);
  // Forward the message

  await client.sendMessage(targetNumber, log);

  console.log("--------------- END -------------------");
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected", reason);

  client.initialize(); // Reinitialize the client to prompt for a new QR code
});

client.initialize();
