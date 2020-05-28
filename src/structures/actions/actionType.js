const ACTION_TYPE = {
  BAN: 'ban',
  HARDBAN: 'hardban',
  MUTE: 'mute',
  WARN: 'warn',
  KICK: 'kick',
  UNBAN: 'unban',
  UNMUTE: 'unmute',
  REMOVE_WARN: 'remove_warn',
  opposite(type) {
    if (type === this.BAN) return this.UNBAN;
    if (type === this.HARDBAN) return this.UNBAN;
    if (type === this.MUTE) return this.UNMUTE;
    if (type === this.WARN) return this.REMOVE_WARN;
    if (type === this.UNBAN) return this.BAN;
    if (type === this.UNMUTE) return this.MUTE;
    if (type === this.REMOVE_WARN) return this.WARN;
  },
};

export default ACTION_TYPE;
