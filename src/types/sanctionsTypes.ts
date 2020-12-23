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

// SanctionTypes is a union of SanctionCreations and SanctionRevokations
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
