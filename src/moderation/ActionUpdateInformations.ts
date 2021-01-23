import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import type {
  ConvictedUserDocument,
  SanctionDocument,
  TrackedFieldNames,
  TrackedSanctionTypes,
} from '@/app/types';
import { SanctionTypes } from '@/app/types';
import type ModerationData from './ModerationData';


const lastSanctionField: Record<TrackedSanctionTypes, TrackedFieldNames> = {
  [SanctionTypes.Ban]: 'lastBanId',
  [SanctionTypes.Hardban]: 'lastBanId',
  [SanctionTypes.Mute]: 'lastMuteId',
};


class ActionUpdateInformations {
  data: ModerationData;
  userDocument: ConvictedUserDocument;
  sanctionDocument: SanctionDocument;

  constructor(data: ModerationData) {
    this.data = data;
    this.userDocument = null;
    this.sanctionDocument = null;
  }

  public async load(): Promise<void> {
    this.userDocument = await ConvictedUser.findOne({ memberId: this.data.victim.id });
    if (!this.userDocument)
      return;

    const fieldName: TrackedFieldNames = lastSanctionField[this.data.type as TrackedSanctionTypes];
    if (!fieldName)
      return;

    this.sanctionDocument = await Sanction.findOne({
      memberId: this.data.victim.id,
      revoked: false,
      sanctionId: this.userDocument?.[fieldName],
    });
  }

  public setUserDocument(userDocument: ConvictedUserDocument): void {
    this.userDocument = userDocument;
  }

  public isUpdate(): boolean {
    return Boolean(this.sanctionDocument);
  }
}

export default ActionUpdateInformations;
