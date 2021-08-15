import useSWR from 'swr';
import * as api from '../api';

const useSignups = (event: string) => {
  const { data, error } = useSWR(`signup-${event}`, () => api.getSignups(event));

  return { signups: data, isLoading: !data && !error, isError: error };
};

export default useSignups;
