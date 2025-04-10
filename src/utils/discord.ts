import Discord from 'discord.js';
import {
  Button,
  Command,
  Modal,
  SelectMenu,
  SlashCommand,
} from '@app-types/discord';

import { sleep } from './utiles';

// Statusをスマホアイコンにする
// (Discord.DefaultWebSocketManagerOptions.identifyProperties.browser as any) = "Discord iOS"

export const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.DirectMessageReactions,
    Discord.GatewayIntentBits.GuildEmojisAndStickers,
  ],
});

export const slashCommands: SlashCommand[] = [];
export const commands: { [commandName: string]: Command } = {};
export const buttons: Button[] = [];
export const selectMenus: SelectMenu[] = [];
export const modals: Modal[] = [];

export const autoDeleteMessage = async (
  message: Discord.Message,
  msec: number = 10000
) => {
  if (!message.guild) return;
  await sleep(msec);
  message.delete();
};

export const getShardId = () =>
  Array.from(client.guilds.cache.values())[0].shardId;
