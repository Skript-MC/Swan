import { Argument, Command } from 'discord-akairo';
import { ban as config } from '../../../config/commands/moderation';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import ModerationData from '../../structures/ModerationData';
import BanAction from '../../structures/actions/BanAction';
import { constants } from '../../utils';

class BanCommand extends Command {
  constructor() {
    super('ban', {
      aliases: config.settings.aliases,
      description: { ...config.description },
      // TODO: Make it so arguments can be unordered
      args: [{
        id: 'member',
        type: Argument.validate(
          'member',
          (message, _phrase, value) => value.id !== message.author.id
            && value.roles.highest.position < message.member.roles.highest.position,
        ),
        prompt: {
          start: 'Il faut ajouter un membre. Il doit être présent sur le discord. Vous pouvez le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en postant un message contenant seulement le membre :',
          retry: "Ce membre n'est pas valide, il se peut qu'il ne soit pas sur le discord ou que vous ayez fait une faute de frappe. Vous pouvez le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en postant un message contenant seulement le membre :",
        },
      }, {
        id: 'duration',
        type: Argument.validate(
          'duration',
          (message, _phrase, value) => (message.member.roles.highest.id === settings.roles.forumModerator
            ? (value > 0 && value < settings.moderation)
            : true),
        ),
        prompt: {
          start: 'Il faut ajouter une durée (en anglais ou en francais). Vous pouvez par exemple entrer `1s` pour 1 seconde, `1min` pour 1 minute et `1j` pour 1 jour. Vous pouvez également combiner ces durées ensemble : `10j15min300s` est par exemple une durée valide. Entre-la en postant un message contenant seulement la durée :',
          retry: "Cette durée n'est pas valide.. Vous pouvez par exemple entrer `1s` pour 1 seconde, `1min` pour 1 minute et `1j` pour 1 jour. Vous pouvez également combiner ces durées ensemble : `10j15min300s` est par exemple une durée valide. Entre-la en postant un message contenant seulement la durée :",
        },
      }, {
        id: 'reason',
        type: 'string',
        match: 'rest',
        prompt: {
          start: 'Il faut ajouter une raison à la sanction. Entre-la en postant un message contenant seulement la raison :',
          retry: "Cette raison n'est pas valide.  Entre-la en postant un message contenant seulement la raison :",
        },
      }, {
        id: 'autoban',
        match: 'flag',
        flag: ['--autoban', '-a'],
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  async exec(message, args) {
    const data = new ModerationData(message)
      .setVictim(args.member)
      .setReason(args.reason);

    let type = constants.SANCTIONS.TYPES.HARDBAN;
    if (args.duration === -1) {
      data.setDuration(args.duration, false);
    } else {
      args.duration *= 1000;
      data.setDuration(args.duration, true)
        .setInformations({ hasSentMessage: !args.autoban });
      type = constants.SANCTIONS.TYPES.BAN;
    }

    data.setType(type);

    try {
      await new BanAction(data).commit();
      await message.util.send(config.messages.success);
    } catch (error) {
      this.client.logger.error('An error occured while banning a member!');
      this.client.logger.detail(`Duration: ${args.duration}`);
      this.client.logger.detail(`Parsed member: ${args.member}`);
      this.client.logger.detail(`Autoban: ${args.autoban}`);
      this.client.logger.detail(`Message: ${message.url}`);
      this.client.logger.error(error.stack);
      message.util.send(messages.global.oops);
    }
  }
}

export default BanCommand;
