const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const { pagination } = require("../src/index");

client.config = require("./config.js");

client.on("message", (message) => {
  if (message.content === "=testpg") {
    const embed1 = new MessageEmbed()
      .setTitle("Page 1")
      .setDescription("Some data.");
    const embed2 = new MessageEmbed()
      .setTitle("Page 2")
      .setDescription("Some other data.");

    pagination({
      pages: [embed1, embed2],
      message,
    });
  }
});

client.on("ready", () => {
  console.log("Logged in as " + client.user.tag);
});

client.login(client.config.token);
