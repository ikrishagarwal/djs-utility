import {
  Message,
  EmojiResolvable,
  ReactionCollector,
  MessageReaction,
  TextChannel,
  MessageEmbed,
} from "discord.js";

const ZER_WIDTH_SPACE = "\u200B";

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
          .awaitMessages({
            filter: (response) => response.author.id === authorID,
            max: 1,
            time: 30000,
            errors: ["time"],
          })
          .then((collected) => {
            let newMsg = collected.first();
            let newPage: number = parseInt(newMsg?.content || page.toString());

            res.delete().catch(() => null);
            newMsg?.delete().catch(() => null);

            if (isNaN(newPage) || newPage < 1 || newPage > pagesLength) return;
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
    content: data.pages[page] as string,
  });

  for (const emoji of emojiList) await curPage.react(emoji);

  const reactionCollector: ReactionCollector = curPage.createReactionCollector({
    filter: (reaction, user) =>
      emojiList.includes(reaction.emoji.name as string) &&
      user == data.message.author,
    time: data.timeout,
  });

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
      content: data.pages[page] as string,
    });
  });

  reactionCollector.on("end", () => {
    if (!curPage.deleted) {
      curPage.reactions
        .removeAll()
        .catch((err) =>
          console.error("An error occured while removing the reactions\n", err)
        );
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
    embeds: [
      data.pages[page].setFooter(`Page ${page + 1} / ${data.pages.length}`),
    ],
    content: (data.initialText || ZER_WIDTH_SPACE) as string,
  });

  for (const emoji of emojiList) await curPage.react(emoji);

  const reactionCollector: ReactionCollector = curPage.createReactionCollector({
    filter: (reaction, user) =>
      emojiList.includes(reaction.emoji.name as EmojiResolvable) &&
      user == data.message.author,
    time: data.timeout,
  });

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
      embeds: [
        data.pages[page].setFooter(`Page ${page + 1} / ${data.pages.length}`),
      ],
      content: (data.initialText || ZER_WIDTH_SPACE) as string,
    });
  });

  reactionCollector.on("end", () => {
    if (!curPage.deleted) {
      curPage.reactions
        .removeAll()
        .catch((err) =>
          console.error("An error occured while removing the reactions\n", err)
        );
    }
  });
}
