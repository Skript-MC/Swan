import type { Constructor } from '@sapphire/pieces';
import { AliasStore } from '@sapphire/pieces';
import SwanCommand from './SwanCommand';

export default class SwanCommandStore extends AliasStore<SwanCommand> {
  constructor() {
    super(SwanCommand as Constructor<SwanCommand>, { name: 'commands' });
  }
}
