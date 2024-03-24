import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export type FilterMode = { type: 'year'; year: number } | { type: 'alltime' } | { type: 'race'; name: string };

export const useFilterMode = () => {
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);

  const defaultYear2024Mode: FilterMode = { type: 'year', year: 2024 };
  const [filterMode, setFilterMode] = useState<FilterMode>(defaultYear2024Mode);

  const history = useHistory();

  const setFilterModeFromSelector = (string: string | null, segmentNames: string[]) => {
    const newFilterMode = parseFromSelect(string, segmentNames) || defaultYear2024Mode;
    setFilterMode(newFilterMode);
    history.push({ search: encodeToParams(newFilterMode) });
  };

  const setFilterModeFromQuery = () => {
    setFilterMode(parseFromParams(urlParams) || defaultYear2024Mode);
  };

  return { filterMode, setFilterModeFromSelector, setFilterModeFromQuery };
};

export const displayFilterMode = (filterMode: FilterMode): string => {
  switch (filterMode.type) {
    case 'alltime':
      return 'alltime';
    case 'year':
      return `${filterMode.year}`;
    case 'race':
      return filterMode.name;
  }
};

const encodeToParams = (filterMode: FilterMode) => {
  const base = `filter=${filterMode.type}`;
  switch (filterMode.type) {
    case 'alltime':
      return `${base}`;
    case 'year':
      return `${base}&year=${filterMode.year}`;
    case 'race':
      return `${base}&name=${filterMode.name}`;
  }
};

const parseFromSelect = (string: string | null, segmentNames: string[]): FilterMode | null => {
  if (string === null) return null;
  if (string === 'alltime') return { type: 'alltime' };
  if (years[string]) return { type: 'year', year: years[string] };
  if (segmentNames.includes(string)) return { type: 'race', name: string };
  return null;
};

const parseFromParams = (urlParams: URLSearchParams): FilterMode | null => {
  const filter = urlParams.get('filter');
  if (filter === 'year') {
    const year = years[urlParams.get('year') || ''];
    return year ? { type: 'year', year: year } : null;
  }
  if (filter === 'alltime') {
    return { type: 'alltime' };
  }
  if (filter === 'race') {
    const raceName = urlParams.get('name');
    return { type: 'race', name: raceName || '' };
  }
  return null;
};

const years = {
  '2020': 2020,
  '2021': 2021,
  '2022': 2022,
  '2023': 2023,
  '2024': 2024,
} as Record<string, number>;
