import useSWR from 'swr';
import * as api from '../api';
import { ClubEfforts, ClubEffortsFromApi } from '../types';

const useEfforts = () => {
  const { data, error } = useSWR('efforts', () => api.fetchEfforts().then(efforts => polishEfforts(efforts)));

  return { efforts: data, isLoading: !data && !error, isError: error };
};

export default useEfforts;

const polishEfforts = (efforts: ClubEffortsFromApi): ClubEfforts => {
  return {
    ...efforts,
    invitationalEfforts: efforts.invitationalEfforts.map(invEffort => ({
      ...invEffort,
      efforts: invEffort.efforts.map(effort => {
        let durationInSeconds = parseDuration(effort.duration);
        if (durationInSeconds == null) {
          console.error(`Invalid duration: ${effort.duration}`);
          return { ...effort, duration: 1000069420 };
        }
        return { ...effort, duration: durationInSeconds };
      }),
    })),
  };
};

const parseDuration = (duration: string) => {
  const [mins, secsWithPossibleDecimals] = duration.split(':');
  try {
    const minsInSeconds = parseInt(mins, 10);
    const seconds = parseFloat(secsWithPossibleDecimals);
    return minsInSeconds * 60 + seconds;
  } catch {
    return null;
  }
};
