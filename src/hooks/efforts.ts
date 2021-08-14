import useSWR from 'swr';
import * as api from '../api';

const useEfforts = () => {
  const { data, error } = useSWR('efforts', () => api.fetchEfforts());

  return { efforts: data, isLoading: !data && !error, isError: error };
};

export default useEfforts;
