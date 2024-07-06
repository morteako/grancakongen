import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type FilterMode = { type: 'year'; year: number } | { type: 'alltime' } | { type: 'race'; name: string };

const filterModeUrlParam = 'filter';

export const useFilterMode = () => {
  const defaultYear2024Mode: FilterMode = { type: 'year', year: 2024 };
  const [filterMode, setFilterMode] = useState<FilterMode>(defaultYear2024Mode);

  const [searchParams, setSearchParams] = useSearchParams();

  const setFilterModeFromSelector = (string: string | null, segmentNames: string[]) => {
    const newFilterMode = parse(string, segmentNames) || defaultYear2024Mode;
    setFilterMode(newFilterMode);
    searchParams.set(filterModeUrlParam, filterModeToString(newFilterMode));
    setSearchParams(searchParams);
  };
  const setFilterModeFromQuery = (segmentNames: string[]) => {
    const filter = searchParams.get(filterModeUrlParam);
    setFilterMode(parse(filter, segmentNames) || defaultYear2024Mode);
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

const parse = (string: string | null, segmentNames: string[]): FilterMode | null => {
  if (string === null) return null;
  if (string === 'alltime') return { type: 'alltime' };
  if (years[string]) return { type: 'year', year: years[string] };
  if (segmentNames.includes(string)) return { type: 'race', name: string };
  return null;
};

const years = {
  '2020': 2020,
  '2021': 2021,
  '2022': 2022,
  '2023': 2023,
  '2024': 2024,
} as Record<string, number>;
