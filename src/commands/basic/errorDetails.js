import Command from '../../structures/Command';
import searchMessage from '../../structures/SearchMessage';

class ErrorDetails extends Command {
  constructor() {
    super('Error Details');
    this.aliases = ['errordetail', 'errordetails', 'error_detail', 'error_details', 'error-detail', 'error-details', 'error'];
    this.usage = 'errordetail <votre erreur>';
    this.examples = ["errordetail Can't compare 'if arg 1' with a text"];
  }

  async execute(client, message, args) {
    await searchMessage(client, message, args, 'error');
  }
}

export default ErrorDetails;
