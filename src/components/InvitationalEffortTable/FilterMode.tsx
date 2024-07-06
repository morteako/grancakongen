import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type FilterMode = { type: 'year'; year: number } | { type: 'alltime' } | { type: 'race'; name: string };

const filterModeUrlParam = 'filter';

export const useFilterMode = () => {
  const defaultYear2024Mode: FilterMode = { type: 'year', year: 2024 };
  const [filterMode, setFilterMode] = useState<FilterMode>(defaultYear2024Mode);

  const [searchParams, setSearchParams] = useSearchParams();

  const setFilterModeFromSelector = (string: string | null, segmentNames: string[]) => {
    const newFilterMode = parseUrlParam(string, segmentNames) || defaultYear2024Mode;
    setFilterMode(newFilterMode);
    searchParams.set(filterModeUrlParam, filterModeToString(newFilterMode));
    setSearchParams(searchParams);
  };
  const setFilterModeFromQuery = (segmentNames: string[]) => {
    const filter = searchParams.get(filterModeUrlParam);
    setFilterMode(parseUrlParam(filter, segmentNames) || defaultYear2024Mode);
  };

  return { filterMode, setFilterModeFromSelector, setFilterModeFromQuery };
};

export const filterModeToString = (filterMode: FilterMode): string => {
  switch (filterMode.type) {
    case 'alltime':
      return 'alltime';
    case 'year':
      return `${filterMode.year}`;
    case 'race':
      return filterMode.name;
  }
};

const parseUrlParam = (key: string | null, segmentNames: string[]): FilterMode | null => {
  if (key === null) return null;
  if (key === 'alltime') return { type: 'alltime' };
  if (years[key]) return { type: 'year', year: years[key] };
  if (segmentNames.includes(key)) return { type: 'race', name: key };
  return null;
};

export const years = {
  '2020': 2020,
  '2021': 2021,
  '2022': 2022,
  '2023': 2023,
  '2024': 2024,
} as Record<string, number>;
