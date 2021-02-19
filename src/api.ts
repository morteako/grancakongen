import { ClubEfforts } from './types';

const baseUrl = process.env.REACT_APP_BASE_URL;

const get = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
};

export const fetchEfforts = (clubLinkName: string) => {
  return get<ClubEfforts>(`${baseUrl}/efforts/${clubLinkName}`);
};
