import { Client, Message, MessageEmbed, Intents } from "discord.js";
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

import { pagination, stringPagination, confirm } from "../index";

import "./config";
import config from "./config";

// TODO: Make this more readable
client.on("messageCreate", (message: Message) => {
  switch (message.content) {
    case "=pg1":
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
      break;

    case "=pg2":
      const embed4 = new MessageEmbed()
        .setTitle("Page 1")
        .setDescription("Some data from page no 1.");

      const embed5 = new MessageEmbed()
        .setTitle("Page 2")
        .setDescription("Some other data from page no 2.");

      const embed6 = new MessageEmbed()
        .setTitle("Page 3")
        .setDescription("Some more data from page no 3.");

      pagination({
        pages: [embed4, embed5, embed6],
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
      break;

    case "=pg3":
      const page1 = "Some data from page no 1.";
      const page2 = "Some other data from page no 2.";
      const page3 = "Some more data from page no 3.";

      stringPagination({
        pages: [page1, page2, page3],
        message,
        initialPage: 1,
      });
      break;

    case "=confirm1":
      confirm({
        message,
        content: "Hello",
      })
        .then((res) => {
          if (res) message.channel.send("Success!!");
          else message.channel.send("Denial!!");
        })
        .catch(() => {
          message.channel.send("Timeout!!");
        });
      break;

    case "=confirm2":
      confirm({
        message,
        content: new MessageEmbed()
          .setTitle("Hello")
          .setDescription("Are you sure?"),
        emojis: {
          check: "✔",
          cross: "❌",
        },
      })
        .then((res) => {
          if (res) message.channel.send("Success!!");
          else message.channel.send("Denial!!");
        })
        .catch(() => {
          message.channel.send("Timeout!!");
        });
      break;

    default:
      break;
  }
});

client.on("ready", () => {
  console.log("Logged in as " + client.user?.tag);
});

client.login(config.token);
