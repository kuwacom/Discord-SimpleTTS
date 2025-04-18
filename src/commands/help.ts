import Discord, { SlashCommandBuilder } from 'discord.js';

import { commandsConfig, embedConfig } from '@configs/discord';
import env from '@configs/env';
import { DiscordCommandInteraction } from '@app-types/discord';
import { slashCommands } from '@utils/discord';
import FormatButton from '@format/button';

export const command = new SlashCommandBuilder()
  .setName('help')
  .setDescription('コマンドの一覧と使い方を表示します');

export const executeMessage = async (message: Discord.Message) => {
  if (!message.guild) return;
  if (!message.member) return;
  console.log(message.channel.type);
  if (
    message.channel.type != Discord.ChannelType.GuildText &&
    message.channel.type != Discord.ChannelType.GuildVoice
  )
    return; // なんかv14からステージチャンネルからだとsendできないからこれ

  const fields: Discord.APIEmbedField[] = [];

  slashCommands.forEach((command) => {
    if (command.name in commandsConfig) {
      fields.push({
        name: `${env.bot.prefix}${command.name}`,
        value: command.description,
        inline: true,
      });
    }
  });

  message.delete();

  const button =
    new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(
      FormatButton.ToHelp(0)
    ); // スラコマ表示用ボタン

  const embeds = [
    new Discord.EmbedBuilder()
      .setColor(embedConfig.colors.info)
      .setTitle('-- TEXT COMMAND HELP --')
      .setDescription('テキストコマンド一覧')
      .setFields(fields)
      .setFooter({
        iconURL: message.author.avatarURL() as string,
        text:
          `${message.author.username}#${message.author.discriminator}\n` +
          embedConfig.footerText,
      }),
  ];

  message.channel.send({
    embeds: embeds,
    components: [button],
    allowedMentions: { repliedUser: false },
  });
  return;
};

export const executeInteraction = async (
  interaction: DiscordCommandInteraction
) => {
  if (!interaction.guild || !interaction.channel || !interaction.member) return;

  const baseFields: Discord.APIEmbedField[] = [];
  slashCommands.forEach((command) => {
    if (command.options) {
      if (command.options[0]?.type == 1 || command.options[0]?.type == 2) {
        // サブコマンドかサブコマンドグループ以外は普通にコマンド
        command.options.forEach((option) => {
          if (option.options) {
            if (option.options[0].type == 1 || option.options[0].type == 2) {
              option.options?.forEach((_option) => {
                baseFields.push({
                  name: `/${command.name} ${option.name} ${_option.name}`,
                  value: command.description + '\n' + option.description,
                  inline: true,
                });
              });
              return;
            }
          }
          baseFields.push({
            name: `/${command.name} ${option.name}`,
            value: command.description + '\n' + option.description,
            inline: true,
          });
        });
        return;
      } else {
        baseFields.push({
          name: `/${command.name}`,
          value: command.description,
          inline: true,
        });
      }
      return;
    } else {
      baseFields.push({
        name: `/${command.name}`,
        value: command.description,
        inline: true,
      });
      return;
    }
  });

  const pageSlice = 4; // ページごとに表示する量
  const betweenFields = baseFields.slice(0, pageSlice);

  let button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
    .addComponents(FormatButton.HelpBack(0, true))
    .addComponents(FormatButton.HelpNext(1));

  if (baseFields.length <= pageSlice) {
    // コマンドが最低表示数以下の場合はページング無効化
    button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
      .addComponents(FormatButton.HelpBack(0, true))
      .addComponents(FormatButton.HelpNext(1, true));
  }

  const embeds = [
    new Discord.EmbedBuilder()
      .setColor(embedConfig.colors.info)
      .setTitle(
        `-- SLASH COMMAND HELP - 1/${Math.ceil(
          baseFields.length / pageSlice
        )} --`
      )
      .setDescription('スラッシュコマンド一覧')
      .setDescription(`**全 ${baseFields.length}個中  1~${pageSlice}個目**`)
      .setFields(betweenFields)
      .setFooter({
        iconURL: interaction.user.avatarURL() as string,
        text:
          `${interaction.user.username}#${interaction.user.discriminator}\n` +
          embedConfig.footerText,
      }),
  ];
  interaction.reply({
    embeds: embeds,
    components: [button],
    allowedMentions: { repliedUser: false },
  });
  return;
};
