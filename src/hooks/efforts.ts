import useSWR from 'swr';
import * as api from '../api';

const useEfforts = () => {
  const { data: efforts } = useSWR('efforts', () => api.fetchEfforts());

  return efforts;
};

export default useEfforts;
