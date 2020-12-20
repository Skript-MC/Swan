import ConvictedUser from '../models/convictedUser';
import Sanction from '../models/sanction';
import { constants, noop } from '../utils';

const lastSanctionField = {
  [constants.SANCTIONS.TYPES.BAN]: 'lastBanId',
  [constants.SANCTIONS.TYPES.HARDBAN]: 'lastBanId',
  [constants.SANCTIONS.TYPES.MUTE]: 'lastMuteId',
};


class ActionUpdateInformations {
  constructor(data) {
    this.data = data;
    this.userDocument = null;
    this.sanctionDocument = null;
  }

  async load() {
    this.userDocument = await ConvictedUser.findOne({ memberId: this.data.victim.id }).catch(noop);

    const fieldName = lastSanctionField[this.data.type];
    if (!fieldName)
      return;

    this.sanctionDocument = await Sanction.findOne({
      memberId: this.data.victim.id,
      revoked: false,
      id: this.userDocument?.[fieldName],
    }).catch(noop);
  }

  setUserDocument(userDocument) {
    this.userDocument = userDocument;
  }

  isUpdate() {
    return Boolean(this.sanctionDocument);
  }
}

export default ActionUpdateInformations;
