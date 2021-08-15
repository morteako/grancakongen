import { BeermileSignup, ClubEfforts } from './types';

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

const post = async <T, U>(url: string, body: U): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
};

export const fetchEfforts = () => {
  return get<ClubEfforts>(`${baseUrl}/efforts`);
};

export const signupBeermile = (body: BeermileSignup) => {
  return post<{}, BeermileSignup>(`${baseUrl}/signup/beermile`, body);
};
