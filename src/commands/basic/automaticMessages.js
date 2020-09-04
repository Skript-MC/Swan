import Command from '../../structures/Command';
import searchMessage from '../../structures/SearchMessage';

class AutomaticMessages extends Command {
  constructor() {
    super('Automatic Messages');
    this.aliases = ['automaticmessage', 'automaticmessages', 'automsg', 'auto_msg', 'auto-msg', 'auto'];
    this.usage = 'automsg <nom du message>';
    this.examples = ['automsg asktoask'];
  }

  async execute(client, message, args) {
    await searchMessage(client, message, args, 'auto');
  }
}

export default AutomaticMessages;
