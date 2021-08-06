import {
  CollectorFilter,
  EmojiResolvable,
  Message,
  MessageEmbed,
} from "discord.js";

export interface confirmOptions {
  message: Message;
  content: string | MessageEmbed;
  emojis?: {
    check?: EmojiResolvable;
    cross?: EmojiResolvable;
  };
  userID?: number;
  timeout?: number;
}

export function confirm({
  message,
  content,
  emojis,
  userID,
  timeout,
}: confirmOptions): Promise<Boolean> {
  return new Promise(async (res, rej) => {
    const msgRep = await message.channel.send(content);

    const check: EmojiResolvable = emojis?.check ? emojis.check : "🇾";
    const cross: EmojiResolvable = emojis?.cross ? emojis.cross : "🇳";

    let u = userID ? userID : message.author.id;

    await msgRep.react(check);
    await msgRep.react(cross);

    const filter: CollectorFilter = (reaction, user) => {
      return [check, cross].includes(reaction.emoji.name) && user.id === u;
    };

    msgRep
      .awaitReactions(filter, {
        max: 1,
        time: timeout ? timeout : 60000,
        errors: ["time"],
      })
      .then((collected) => {
        const reaction = collected.first();

        msgRep.delete().catch(() => null);

        if (reaction?.emoji.name === check) {
          res(true);
        } else if (reaction?.emoji.name === cross) {
          res(false);
        }
      })
      .catch((err) => {
        // .catch() is to handle the permission error
        msgRep.delete().catch(() => null);

        rej({ error: true, errorType: err });
      });
  });
}
