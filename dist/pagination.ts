import {
  Message,
  MessageEmbed,
  EmojiResolvable,
  ReactionCollector,
  MessageReaction,
} from "discord.js";

export interface emojiOptions {
  pageNumber?: EmojiResolvable;
  home?: EmojiResolvable;
  left?: EmojiResolvable;
  right?: EmojiResolvable;
  end?: EmojiResolvable;
  stop?: EmojiResolvable;
}

export interface paginationEmbedOptions {
  message: Message;
  pages: MessageEmbed[];
  initialPage?: number;
  initialText?: String;
  emojis?: emojiOptions;
  timeout?: number;
}

export async function pagination(data: paginationEmbedOptions) {
  let page = data.initialPage || 0;
  let { emojis } = data;
  data.timeout = data.timeout || 120000;
  let emojiList: EmojiResolvable[] = [
    emojis?.pageNumber || "🔢",
    emojis?.home || "⏪",
    emojis?.left || "⬅️",
    emojis?.right || "➡️",
    emojis?.end || "⏩",
    emojis?.stop || "⏹️",
  ];

  const curPage: Message = await data.message.channel.send({
    embed: data.pages[page].setFooter(
      `Page ${page + 1} / ${data.pages.length}`
    ),
    content: data.initialText || "",
  });

  for (const emoji of emojiList) await curPage.react(emoji);

  const reactionCollector: ReactionCollector = curPage.createReactionCollector(
    (reaction, user) =>
      emojiList.includes(reaction.emoji.name) && user == data.message.author,
    { time: data.timeout }
  );

  reactionCollector.on("collect", async (reaction: MessageReaction) => {
    reaction.users.remove(data.message.author);

    switch (reaction.emoji.name) {
      case emojiList[0]:
        let res = await data.message.channel.send("Enter the page number. ");
        await data.message.channel
          .awaitMessages(
            (response) => response.author.id === data.message.author.id,
            {
              max: 1,
              time: 30000,
              errors: ["time"],
            }
          )
          .then((collected) => {
            let newMsg = collected.first();
            let newPage: number = parseInt(newMsg?.content || page.toString());
            res.delete();
            try {
              newMsg?.delete();
            } catch (err) {}
            if (isNaN(newPage)) return;
            else if (newPage < 1) return;
            else if (newPage > data.pages.length) return;
            else page = newPage - 1;
          })
          .catch(() => null);
        break;
      case emojiList[1]:
        page = 0;
        break;
      case emojiList[2]:
        page = page > 0 ? --page : data.pages.length - 1;
        break;
      case emojiList[3]:
        page = page + 1 < data.pages.length ? ++page : 0;
        break;
      case emojiList[4]:
        page = data.pages.length - 1;
        break;
      case emojiList[5]:
        reactionCollector.stop("User wanted to end it!");
        break;
      default:
        break;
    }

    curPage.edit({
      embed: data.pages[page].setFooter(
        `Page ${page + 1} / ${data.pages.length}`
      ),
      content: data.initialText || "",
    });
  });

  reactionCollector.on("end", () => {
    if (!curPage.deleted) {
      curPage.reactions.removeAll();
    }
  });
}
