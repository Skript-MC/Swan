import Command from '../../structures/Command';

class AskExample extends Command {
  constructor() {
    super('Ask Example');
    this.aliases = ['askExample', 'askexample', 'askExemple', 'askexemple'];
    this.usage = 'askExample';
    this.examples = ['askExample'];
  }

  async execute(client, message, _args) {
    await message.channel.send('', { files: ['./assets/askExample.png'] });
  }
}

export default AskExample;
