import SanctionManager from '../structures/SanctionManager';
import { client } from '../main';
import ModerationData from '../structures/ModerationData';
import ACTION_TYPE from '../structures/actions/actionType';
import UnbanAction from '../structures/actions/UnbanAction';

export default async function guildBanRemoveHandler(guild, user) {
  if (!client.activated) return;
  if (!(await SanctionManager.isBanned(user.id, true))) return;
  if (client.usersBeingUnbanned.includes(user.id)) return;
  if (guild.id !== client.guild.id) return;

  const data = new ModerationData()
    .setType(ACTION_TYPE.UNBAN)
    .setColor(client.config.colors.success)
    .setReason(client.config.messages.errors.noReasonSpecified)
    .setModerator(client.guild.members.resolve(client.user.id))
    .setMessageChannel(client.guild.channels.resolve(client.config.channels.logs));
  await data.setVictimId(user.id);

  new UnbanAction(data).commit();
}
