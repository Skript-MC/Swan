import { client } from '../main';
import ModerationData from '../structures/ModerationData';
import BanAction from '../structures/actions/BanAction';
import ACTION_TYPE from '../structures/actions/actionType';
import SanctionManager from '../structures/SanctionManager';

export default async function guildBanAddHandler(guild, user) {
  if (!client.activated) return;
  if (await SanctionManager.isBanned(user.id, true)) return;
  if (guild.id !== client.guild.id) return;

  const member = guild.members.resolve(user.id) || await guild.members.fetch(user.id);
  if (!member) return;

  const { reason } = await guild.fetchBan(user.id);
  const data = new ModerationData()
    .setType(ACTION_TYPE.HARDBAN)
    .setColor(client.config.colors.hardban)
    .setReason(reason)
    .setDuration(-1)
    .setVictimId(member.id)
    .setModerator(client.guild.members.resolve(client.user.id))
    .setMessageChannel(client.guild.channels.resolve(client.config.channels.logs))
    .setFinishTimestamp();

  new BanAction(data).commit();
}
