import { Listener } from 'discord-akairo';

class RateLimitListener extends Listener {
  constructor() {
    super('rateLimit', {
      event: 'rateLimit',
      emitter: 'client',
    });
  }

  exec(infos) {
    this.client.logger.error('Oops, Swan just hit a rate limit!');
    this.client.logger.detail(`Timeout (ms): ${infos.timeout}`);
    this.client.logger.detail(`Limit: ${infos.limit}`);
    this.client.logger.detail(`method: ${infos.method}`);
    this.client.logger.detail(`path: ${infos.path}`);
    this.client.logger.detail(`route: ${infos.route}`);
    this.client.logger.detail('More infos here: https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-rateLimit');
  }
}

export default RateLimitListener;
