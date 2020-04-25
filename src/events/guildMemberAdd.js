import { config } from '../main';

export default async function memberAddHandler(member) {
  // On vérifie si le pseudonyme correspond aux critères.
  const name = member.nickname || member.user.username;
  const regex = name.match(/[^a-zA-Z0-9-ÖØ-öø-ÿ]/gimu);
  if (regex && regex.length >= name.length / 2) {
    // On en choisit un futur pseudonyme au hazard dans la liste.
    const newName = config.messages.miscellaneous.renameList[Math.floor(Math.random() * config.messages.miscellaneous.renameList.length)];
    // On modifie son pseudonyme et on lui envoie un message expliquant pourquoi.
    member.setNickname(newName);
    member.send(config.messages.miscellaneous.strangeName);
  }
}
