const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
// const { pagination } = require("../src/index");
const { pagination, stringPagination } = require("../dist");

client.config = require("./config.js");

client.on("message", (message) => {
  if (message.content === "=pg1") {
    const embed1 = new MessageEmbed()
      .setTitle("Page 1")
      .setDescription("Some data from page no 1.");
    const embed2 = new MessageEmbed()
      .setTitle("Page 2")
      .setDescription("Some other data from page no 2.");
    const embed3 = new MessageEmbed()
      .setTitle("Page 3")
      .setDescription("Some more data from page no 3.");

    pagination({
      pages: [embed1, embed2, embed3],
      message,
      initialText: "Heyy",
      initialPage: 1,
    });
  } else if (message.content === "=pg2") {
    const embed1 = new MessageEmbed()
      .setTitle("Page 1")
      .setDescription("Some data from page no 1.");
    const embed2 = new MessageEmbed()
      .setTitle("Page 2")
      .setDescription("Some other data from page no 2.");
    const embed3 = new MessageEmbed()
      .setTitle("Page 3")
      .setDescription("Some more data from page no 3.");

    pagination({
      pages: [embed1, embed2, embed3],
      message,
      initialText: "Heyy",
      initialPage: 1,
      emojis: {
        pageNumber: "⚛",
        home: "😐",
        left: "😶",
        right: "🙄",
        end: "😑",
        stop: "😪",
      },
    });
  } else if (message.content === "=pg3") {
    const page1 = "Some data from page no 1.";
    const page2 = "Some other data from page no 2.";
    const page3 = "Some more data from page no 3.";

    stringPagination({
      pages: [page1, page2, page3],
      message,
      initialPage: 1,
    });
  }
});

client.on("ready", () => {
  console.log("Logged in as " + client.user.tag);
});

client.login(client.config.token);
