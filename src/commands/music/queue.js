import { MessageEmbed } from 'discord.js';
import Command from '../../components/Command';
import { config } from '../../main';
import MusicBot from '../../music';
import { secondToDuration } from '../../utils';

class Queue extends Command {
  constructor() {
    super('Queue');
    this.aliases = ['queue'];
    this.usage = 'queue [<remove <index> | clear>]';
    this.examples = ['queue', 'queue remove 2', 'queue clear'];
    this.activeInHelpChannels = false;
  }

  async execute(message, args) {
    if (['remove', 'rem', 'delete', 'del'].includes(args[0])) {
      const validate = MusicBot.canUseCommand(message, { queueNotEmpty: true, notRestricted: true });
      if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

      const songIndex = parseInt(args[1], 10);
      if (isNaN(songIndex) || !MusicBot.queue[songIndex - 1]) return message.channel.send(this.config.invalidIndex);

      MusicBot.queue.splice(songIndex - 1, 1);
      message.channel.send(this.config.removedSong.replace('%s', songIndex));
    // } else if (args[0] === 'add') {
    //   return 'SOON (nécessite de retravailler le système de .play, pour éviter de devoir tout remettre ici. Le diviser en méthode qu'on ajoute à MusicBotApp)';
    } else if (args[0] === 'clear') {
      const validate = MusicBot.canUseCommand(message, { queueNotEmpty: true, notRestricted: true });
      if (validate !== true) return message.channel.send(config.messages.errors.music[validate]);

      const minRole = message.guild.roles.find(r => r.id === config.music.minRoleToClearQueue).rawPosition;
      if (message.member.roles.highest.rawPosition >= minRole) {
        MusicBot.queue = [];
        return message.channel.send(this.config.cleared);
      }
      return message.channel.send(config.messages.errors.permission);
    } else {
      if (!MusicBot.queue || MusicBot.queue.length === 0) return message.channel.send(config.messages.errors.music[4]);

      const embed = new MessageEmbed()
        .setColor(config.colors.default)
        .setTitle("File d'attente des musiques")
        .setFooter(`Exécuté par ${message.author.username}`)
        .setTimestamp();
      if (MusicBot.nowPlaying) embed.addField('En train de jouer :', `${MusicBot.loop === MusicBot.enums.MUSIC ? ':repeat: ' : ''}[${MusicBot.nowPlaying.title}](${MusicBot.nowPlaying.video.shortURL})`);
      else embed.setDescription('Pour lancer la queue, faites simplement `.play`.');

      let queue = [];
      for (let i = 0; i < MusicBot.queue.length; i++) {
        queue.push(`\`${i + 1}\` [${MusicBot.queue[i].title}](${MusicBot.queue[i].video.shortURL}) \`${MusicBot.queue[i].duration} | demandée par \`${MusicBot.queue[i].requestedBy.toString()}\n`);
      }

      const durations = MusicBot.queue.map(elt => elt.video.durationSeconds);
      const totalDuration = secondToDuration(durations.reduce((acc, current) => acc + current));
      let footer = `\n${MusicBot.queue.length} musique${MusicBot.queue.length === 1 ? '' : 's'}. Durée totale : ${totalDuration}`;

      // Si l'embed est trop long
      if (queue.join('').length + footer.length > 1024) {
        let removed = 0;
        // 1000 (sur 1024) car il faut ajouter le "Et x de plus" ensuite
        while (queue.join('').length + footer.length >= 1000) {
          queue.pop();
          removed++;
        }
        if (removed !== 0) footer = `Et \`${removed}\` de plus...\n${footer}`;
      }

      queue = queue.join('');
      queue += footer;
      embed.addField('À venir :', queue);

      return message.channel.send(embed);
    }
  }
}

export default Queue;
