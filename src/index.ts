import 'dotenv/config';
import Discord from 'discord.js';

import { Logger } from 'tslog';
import shardSyncAPI from './shardSyncAPI';
const logger = new Logger();

// npm test 等一番上のディレクトリで実行する際
// ./dist/ になるためcommands に dist を追加する必要あり
const TSDistPath = './dist';

// https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/understanding/sharding.md
const manager = new Discord.ShardingManager(TSDistPath + '/bot.js', {
  totalShards: 'auto', // サーバー数に合わせて数字でもOK
  token: process.env.BOT_TOKEN,
});

manager.on('shardCreate', (shard: Discord.Shard) => {
  logger.info(`Launched shard ${shard.id}`);
});
manager.spawn();

if (process.env.SHARD_SYNC_API_LOCALHOST) shardSyncAPI();
