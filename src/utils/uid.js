import crypto from 'crypto';

/**
 * Renvoie un string alphanumérique aléatoire de la longueur `len`.
 * Il y a une très petite chance (moins de 1/1 000 000) que la taille soit plus petite que len
 * à cause de la conversion en base64, mais ce n'est pas un problème ici.
 * La probabilité de collision est très très petite (avec len = 16, il faudrait
 * 3*10^12  utilisations pour avoir 1 chance sur 1 million d'avoir 2 doublons)
 * Voir http://en.wikipedia.org/wiki/Birthday_problem
 * C'est l'algorithme d'id utilisé par NeDB.
 */
export default function uid(len = 8) {
  return crypto.randomBytes(Math.ceil(Math.max(8, len * 2)))
    .toString('base64')
    .replace(/[+/]/g, '')
    .slice(0, len);
}
