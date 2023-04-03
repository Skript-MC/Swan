import Sanction from '@/app/models/sanction';
import type ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import type { SanctionDocument } from '@/app/types';

export default class ActionUpdateInformations {
  data: ModerationData;
  sanctionDocument: SanctionDocument | null;

  constructor(data: ModerationData) {
    this.data = data;
    this.sanctionDocument = null;
  }

  public async load(): Promise<void> {
    const currentSanction = await ModerationHelper.getCurrent(this.data.victim.id, this.data.type);
    if (!currentSanction)
      return;

    this.sanctionDocument = await Sanction.findOne({
      userId: this.data.victim.id,
      revoked: false,
      sanctionId: currentSanction.sanctionId,
    });
  }

  public isUpdate(): boolean {
    return Boolean(this.sanctionDocument);
  }
}
