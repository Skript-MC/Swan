import SanctionManager from '../structures/SanctionManager';
import { client } from '../main';
import ModerationData from '../structures/ModerationData';
import ACTION_TYPE from '../structures/actions/actionType';
import UnbanAction from '../structures/actions/UnbanAction';

export default async function guildBanRemoveHandler(guild, user) {
  client.logger.debug('DEBUG: guildBanRemoveHandler -> isBanned(id)', await SanctionManager.isBanned(user.id, true));
  if (!(await SanctionManager.isBanned(user.id, true))) return;
  if (guild.id !== client.guild.id) return;

  const data = new ModerationData()
    .setType(ACTION_TYPE.UNBAN)
    .setColor(client.config.colors.success)
    .setReason(client.config.messages.errors.noReasonSpecified)
    .setVictimId(user.id)
    .setModerator(client.guild.members.resolve(client.user.id))
    .setMessageChannel(client.guild.channels.resolve(client.config.channels.logs));

  new UnbanAction(data).commit();
}
