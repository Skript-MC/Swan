/**
 * @description Élaguer le pseudo d'un membre, pour qu'il puisse être utilisé dans le nom d'un channel textuel.
 * @param {GuildMember} member Le membre
 */
export default function prunePseudo(member) {
  const cleanPseudo = member.nickname?.replace(/[^a-zA-Z0-9]/gimu, '')
    || member.user.username.replace(/[^a-zA-Z0-9]/gimu, '')
    || member.id;
  return cleanPseudo.toLowerCase();
}
