import { config, db } from '../main';
import { toValidName } from '../utils';

export default async function guildMemberAddHandler(member) {
  // Get the nickname or the username of the member
  const name = member.nickname || member.user.username;
  // Get the correct name without special or forbidden characters
  const validName = toValidName(name);
  // Get the required perentage of valid characters in the miscellaneous database
  const requiredPrc = await db.miscellaneous.findOne({ entry: 'joinpercentage' }).catch(console.error);

  // Return if the value is not set to avoid errors
  if (!requiredPrc) return;
  // If the name is not changed, nothing to do!
  if (validName === name) return;

  let newName;
  // If the percentage of correct name is >= required percentage
  if (Math.round((validName.length / name.length) * 100) >= requiredPrc.value) {
    // Modify the username to the correct username (without special characters)
    newName = validName;
  } else {
    // Else, choose a new name in the rename list
    newName = config.messages.miscellaneous.renameList[Math.floor(Math.random() * config.messages.miscellaneous.renameList.length)];
  }

  // Modify nickname with the new name
  member.setNickname(newName);
  // Send a detailled message to inform why
  member.send(config.messages.miscellaneous.strangeName);
}
