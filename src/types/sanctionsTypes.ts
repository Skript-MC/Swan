export enum SanctionCreations {
  Hardban = 'hardban',
  Ban = 'ban',
  Mute = 'mute',
  Warn = 'warn',
  Kick = 'kick',
}

export enum SanctionRevokations {
  Unban = 'unban',
  Unmute = 'unmute',
  RemoveWarn = 'removeWarn',
}

// TODO: Find a better way to do this. We can take inspiration from https://stackoverflow.com/a/55827534/11687747
// SanctionTypes is a merge of SanctionCreations and SanctionRevokations
export enum SanctionTypes {
  Hardban = 'hardban',
  Ban = 'ban',
  Mute = 'mute',
  Warn = 'warn',
  Kick = 'kick',
  Unban = 'unban',
  Unmute = 'unmute',
  RemoveWarn = 'removeWarn',
}

export enum SanctionsUpdates {
  Revoked = 'revoked',
  Duration = 'duration',
}
