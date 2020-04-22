/* eslint-disable import/no-cycle */
import { regexPseudo } from '../utils';
import { config } from '../main';

export default async function memberAddHandler(member) {
  // On vérifie si le pseudonyme correspond aux critères.
  if (regexPseudo(member) === true) {
    // On en choisit un futur pseudonyme au hazard dans la liste.
    const name = config.messages.miscellaneous.renameList[Math.floor(Math.random() * config.messages.miscellaneous.renameList.length)];
    // On modifie son pseudonyme et on lui envoie un message expliquant pourquoi.
    member.setNickname(name);
    member.send(config.messages.miscellaneous.strangeName);
  }
}
