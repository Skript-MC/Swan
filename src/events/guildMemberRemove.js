import { client } from '../main';
import SanctionManager from '../structures/SanctionManager';
import ModerationData from '../structures/ModerationData';
import ACTION_TYPE from '../structures/actions/actionType';
import BanAction from '../structures/actions/BanAction';

export default async function guildMemberRemoveHandler(member) {
  if (!client.activated) return;
  if (await SanctionManager.isBanned(member.id)) {
    const data = new ModerationData()
      .setType(ACTION_TYPE.HARDBAN)
      .setColor(client.config.colors.hardban)
      .setReason(client.config.messages.miscellaneous.hardBanAutomatic)
      .setDuration(-1)
      .setVictimId(member.id)
      .setModerator(client.guild.members.resolve(client.user.id))
      .setMessageChannel(client.guild.channels.resolve(client.config.channels.logs));
    new BanAction(data).commit();
  }
}
