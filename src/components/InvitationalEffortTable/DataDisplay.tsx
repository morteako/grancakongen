import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type DataDisplay = 'duration' | 'pace' | 'behindWinner';

const dataDisplayUrlParam = 'data';

export const useDataDisplay = () => {
  const defaultDuration: DataDisplay = 'duration';
  const [dataDisplay, setDataDisplay] = useState<DataDisplay>(defaultDuration);

  const [searchParams, setSearchParams] = useSearchParams();

  const setDataDisplayFromSelector = (string: string | null) => {
    const newDataDisplay = parse(string) || defaultDuration;
    setDataDisplay(newDataDisplay);
    searchParams.set(dataDisplayUrlParam, newDataDisplay);
    setSearchParams(searchParams);
  };
  const setDataDisplayFromQuery = () => {
    const filter = searchParams.get(dataDisplayUrlParam);
    setDataDisplay(parse(filter) || defaultDuration);
  };

  return { dataDisplay, setDataDisplayFromSelector, setDataDisplayFromQuery };
};

const parse = (str: string | null): DataDisplay | null => {
  switch (str) {
    case 'duration':
      return 'duration';
    case 'pace':
      return 'pace';
    case 'behindWinner':
      return 'behindWinner';
    default:
      return null;
  }
};
