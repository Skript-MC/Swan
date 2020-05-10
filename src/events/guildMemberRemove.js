import { config, client } from '../main';
import SanctionManager from '../structures/SanctionManager';
import ModerationData from '../structures/ModerationData';
import ACTION_TYPE from '../structures/actions/actionType';
import BanAction from '../structures/actions/BanAction';

export default async function guildMemberRemoveHandler(member) {
  if (await SanctionManager.isBan(member.id)) {
    const data = new ModerationData()
      .setType(ACTION_TYPE.HARDBAN)
      .setColor(config.colors.hardban)
      .setReason(config.messages.miscellaneous.hardBanAutomatic)
      .setDuration(-1)
      .setMember(member)
      .setModerator(client.guild.members.resolve(client.user.id))
      .setMessageChannel(client.guild.channels.resolve(config.channels.logs));
    new BanAction(data).commit();
  }
}
