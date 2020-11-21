export const autoLockedText = (state) => {
  const timeoutMins = state.autoLockedTimeout;
  const timesInt = parseInt(timeoutMins);
  if (timesInt <= 0) return 'Always unlocked';

  let tsn = [],
    h,
    m;
  if (timesInt >= 120 && timesInt < 24 * 60) {
    h = parseInt(timesInt / 60);
    m = timesInt % 60;

    return m === 0 ? `${h} hours` : `${h} hours ${m} minutes`;
  }

  return `${timesInt} minutes`;
};
