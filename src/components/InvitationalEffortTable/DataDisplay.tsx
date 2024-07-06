import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type DataDisplay = 'duration' | 'pace' | 'behindWinner';

const dataDisplayUrlParam = 'data';

export const useDataDisplay = () => {
  const defaultDuration: DataDisplay = 'duration';
  const [dataDisplay, setDataDisplay] = useState<DataDisplay>(defaultDuration);

  const [searchParams, setSearchParams] = useSearchParams();

  const setDataDisplayFromSelector = (string: string | null) => {
    const newDataDisplay = parseUrlParam(string) || defaultDuration;
    setDataDisplay(newDataDisplay);
    searchParams.set(dataDisplayUrlParam, newDataDisplay);
    setSearchParams(searchParams);
  };
  const setDataDisplayFromQuery = () => {
    const filter = searchParams.get(dataDisplayUrlParam);
    setDataDisplay(parseUrlParam(filter) || defaultDuration);
  };

  return { dataDisplay, setDataDisplayFromSelector, setDataDisplayFromQuery };
};

const parseUrlParam = (key: string | null): DataDisplay | null => {
  switch (key) {
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
