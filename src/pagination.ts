import {
  Message,
  MessageEmbed,
  EmojiResolvable,
  ReactionCollector,
  MessageReaction,
  TextChannel,
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

export interface stringPaginationEmbedOptions {
  message: Message;
  pages: String[];
  initialPage?: number;
  emojis?: emojiOptions;
  timeout?: number;
}

interface handleReactionOptions {
  reaction: MessageReaction;
  emojiList: EmojiResolvable[];
  reactionCollector: ReactionCollector;
  channel: TextChannel;
  authorID: String;
  pagesLength: number;
  page: number;
}

async function handleReaction({
  reaction,
  emojiList,
  reactionCollector,
  channel,
  authorID,
  pagesLength,
  page,
}: handleReactionOptions): Promise<number> {
  return new Promise(async (res) => {
    switch (reaction.emoji.name) {
      case emojiList[0]:
        let res = await channel.send("Enter the page number. ");
        await channel
          .awaitMessages((response) => response.author.id === authorID, {
            max: 1,
            time: 30000,
            errors: ["time"],
          })
          .then((collected) => {
            let newMsg = collected.first();
            let newPage: number = parseInt(newMsg?.content || page.toString());
            res.delete();
            try {
              newMsg?.delete();
            } catch (err) {}
            if (isNaN(newPage)) return;
            else if (newPage < 1) return;
            else if (newPage > pagesLength) return;
            else page = newPage - 1;
          })
          .catch(() => null);
        break;
      case emojiList[1]:
        page = 0;
        break;
      case emojiList[2]:
        page = page > 0 ? --page : pagesLength - 1;
        break;
      case emojiList[3]:
        page = page + 1 < pagesLength ? ++page : 0;
        break;
      case emojiList[4]:
        page = pagesLength - 1;
        break;
      case emojiList[5]:
        reactionCollector.stop("User wanted to end it!");
        break;
      default:
        break;
    }
    res(page);
  });
}

export async function stringPagination(data: stringPaginationEmbedOptions) {
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

  if (!data.pages.length) throw new Error("There must be atleast 1 page");

  const curPage: Message = await data.message.channel.send({
    content: data.pages[page],
  });

  for (const emoji of emojiList) await curPage.react(emoji);

  const reactionCollector: ReactionCollector = curPage.createReactionCollector(
    (reaction, user) =>
      emojiList.includes(reaction.emoji.name) && user == data.message.author,
    { time: data.timeout }
  );

  reactionCollector.on("collect", async (reaction: MessageReaction) => {
    reaction.users.remove(data.message.author);

    page = await handleReaction({
      reaction,
      emojiList,
      reactionCollector,
      channel: data.message.channel as TextChannel,
      authorID: data.message.author.id,
      pagesLength: data.pages.length,
      page,
    });

    curPage.edit({
      content: data.pages[page],
    });
  });

  reactionCollector.on("end", () => {
    if (!curPage.deleted) {
      curPage.reactions.removeAll();
    }
  });
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

  if (!data.pages.length) throw new Error("There must be atleast 1 page");

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

    page = await handleReaction({
      reaction,
      emojiList,
      reactionCollector,
      channel: data.message.channel as TextChannel,
      authorID: data.message.author.id,
      pagesLength: data.pages.length,
      page,
    });

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
