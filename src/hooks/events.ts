import useSWR from 'swr';
import * as api from '../api';

const useEvents = () => {
  const { data, error } = useSWR('events', () => api.fetchEvents());

  return { events: data, isLoading: !data && !error, isError: error };
};

export default useEvents;
