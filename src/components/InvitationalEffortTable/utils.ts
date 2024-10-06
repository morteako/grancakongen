export const formatSecondsToMMSS = (durationInSeconds: number) => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  const secondsPadding = seconds < 10 ? '0' : '';
  return `${minutes}:${secondsPadding}${seconds}`;
};

export const getFormattedPace = (durationInSec: number, distanceInMeters: number, postfix: string = '/km') => {
  const secPerKM = (durationInSec * 1000) / distanceInMeters;
  const minutes = Math.floor(secPerKM / 60);
  const seconds = Math.floor(secPerKM % 60);
  const secondsPadding = seconds < 10 ? '0' : '';
  return `${minutes}:${secondsPadding}${seconds}${postfix}`;
};
