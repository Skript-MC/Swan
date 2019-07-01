import { RichEmbed } from "discord.js";
import { config } from '../main';

export function success(success) {
  console.log(`[SkriptMc Bot] ✔️  ${success}`);
}

export function discordSuccess(description, message) {
  const embed = new RichEmbed()
    .setAuthor(message.author.username, message.author.avatarURL)
    .setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570570402615525387/ok.png")
    .setTitle('Succès')
    .setColor(`${config.colors.success}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter(`Executé par ${message.author.username}`);
  message.channel.send(embed);
}

export function discordInfo(description, message) {
  const embed = new RichEmbed()
    .setAuthor(message.author.username, message.author.avatarURL)
    .setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570569077173649438/info_png_704336.png")
    .setTitle('Information')
    .setColor(`${config.colors.default}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter(`Executé par ${message.author.username}`);
  message.channel.send(embed);
}

export function discordWarning(description, message) {
  const embed = new RichEmbed()
    .setAuthor(message.author.username, message.author.avatarURL)
    .setThumbnail("https://cdn.discordapp.com/attachments/533791418259341315/570722475772608519/warning-icon-md-png-4.png")
    .setTitle('Avertissement')
    .setColor(`${config.colors.warning}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter(`Executé par ${message.author.username}`);
  message.channel.send(embed);
}

export function discordError(description, message) {
  const embed = new RichEmbed()
    .setAuthor(message.author.username, message.author.avatarURL)
    .setThumbnail("https://cdn.discordapp.com/attachments/459996868852711434/570565753044992000/error-icon-4.png")
    .setTitle('Erreur')
    .setColor(`${config.colors.error}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter(`Executé par ${message.author.username}`);
  message.channel.send(embed);
}

export function ez_ma(message) {
  if(message.channel.parentID == '361247112303738890' && message.member.roles.has('269479421998530561') && message.content.includes("docs.skunity.com")){
    if(message.deletable) message.delete().catch(e => console.log(e))
    let embed = new RichEmbed().setColor('AQUA').setDescription(`Petit Membre Actif: \n \n Tu semble manquer de neurones, pas de lien Skunity. Tu bouge ton cul et tu modifie la Doc SkriptMC si il manque quelque chose. Si tu as pas les perms, tu les demandes à Vengelis ou Rémi`);
    message.author.send(embed)
  }
}
