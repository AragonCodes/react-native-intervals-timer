export const withLeadingZero = (seconds) => (seconds >= 10 ? seconds : `0${seconds}`);
export const printMinutesSeconds = (seconds) => `${Math.floor(seconds / 60)}:${withLeadingZero(seconds % 60)}`;
export const printTimer = (seconds) => ((seconds >= 60) ? printMinutesSeconds(seconds) : `${seconds}`);
