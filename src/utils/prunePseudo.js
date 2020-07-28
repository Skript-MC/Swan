/**
 * @description Élaguer le pseudo d'un membre, pour qu'il puisse être utilisé dans le nom d'un channel textuel.
 * @param {GuildMember} member Le membre
 */
export default function prunePseudo(member, user, id) {
  const cleanPseudo = member?.nickname?.replace(/[^a-zA-Z0-9]/gimu, '')
    || user.username.replace(/[^a-zA-Z0-9]/gimu, '')
    || id;
  return cleanPseudo.toLowerCase();
}
