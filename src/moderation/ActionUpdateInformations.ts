import { Sanction } from '#models/sanction';
import type { ModerationData } from '#moderation/ModerationData';
import * as ModerationHelper from '#moderation/ModerationHelper';
import type { SanctionDocument } from '#types/index';

export class ActionUpdateInformations {
  data: ModerationData;
  sanctionDocument: SanctionDocument | null;

  constructor(data: ModerationData) {
    this.data = data;
    this.sanctionDocument = null;
  }

  public async load(): Promise<void> {
    const currentSanction = await ModerationHelper.getCurrentSanction(this.data.victimId, this.data.type);
    if (!currentSanction)
      return;

    this.sanctionDocument = await Sanction.findOne({
      userId: this.data.victimId,
      revoked: false,
      sanctionId: currentSanction.sanctionId,
    });
  }

  public isUpdate(): this is ActionUpdateInformations & { sanctionDocument: SanctionDocument } {
    return Boolean(this.sanctionDocument);
  }
}
