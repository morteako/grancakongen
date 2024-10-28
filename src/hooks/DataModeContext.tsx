import React from 'react';
import { useLocalStorage } from '@mantine/hooks';

const DataModeContext = React.createContext<{
  dataMode: boolean;
  setDataMode: (b: boolean) => void;
} | null>(null);

export const DataModeContextProvider = (props: { children: React.ReactNode }) => {
  const [dataMode, setDataMode] = useLocalStorage<boolean>({
    key: 'dataMode',
    defaultValue: false,
  });
  return <DataModeContext.Provider value={{ dataMode, setDataMode }}>{props.children}</DataModeContext.Provider>;
};

export const useDataMode = () => {
  const context = React.useContext(DataModeContext);
  if (context === null) {
    throw new Error('useData must be used within a DataContextProvider');
  }
  return context;
};
