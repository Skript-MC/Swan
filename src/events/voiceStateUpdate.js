import { client } from '../main';
import MusicBot from '../structures/Music';

export default function voiceStateUpdateHandler(oldState, newState) {
  if (!client.activated) return;
  const oldChannel = oldState.guild.channels.resolve(oldState.channelID);
  const newChannel = newState.guild.channels.resolve(newState.channelID);

  if (newState.member.user.bot) return;
  if (!oldChannel?.members.has(client.user.id)) return;
  if (!oldChannel || newChannel) return;
  if (oldChannel?.members.size > 1) return;

  newState.guild.voice.connection.disconnect();
  if (MusicBot.nowPlaying) {
    MusicBot.endReason = 'leave';
    MusicBot.dispatcher.end();
  }
  MusicBot.channel.send(client.config.messages.miscellaneous.leaveBecauseAlone);
}
