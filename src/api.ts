import { BeermileSignup, ClubEffortsFromApi, Event } from './types';

// const baseUrl = process.env.REACT_APP_BASE_URL;
const baseUrl = import.meta.env.VITE_BASE_URL;

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

const authPost = async <T, U>(url: string, body: U): Promise<T> => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
};
const authGet = async <T>(url: string): Promise<T> => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
};

export const fetchEfforts = () => {
  return get<ClubEffortsFromApi>(`${baseUrl}/efforts`);
};

export const fetchEvents = () => {
  return get<Event[]>(`${baseUrl}/events`);
};

export const signupBeermile = (body: BeermileSignup) => {
  return post<{}, BeermileSignup>(`${baseUrl}/signup/beermile`, body);
};

export const adminLogin = (body: { username: string; password: string }) => {
  return post<{}, { username: string; password: string }>(`${baseUrl}/login`, body);
};

export const authenticateToken = () => {
  return authPost<{}, {}>(`${baseUrl}/authenticate`, {});
};

export const getSignups = (event: string) => {
  return authGet<
    {
      name: string;
      mail: string;
      timeEstimate: string;
      team?: { teamName: string; teamMembers: { name: string; mail: string }[] };
    }[]
  >(`${baseUrl}/signups/${event}`);
};
