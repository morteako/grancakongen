import React from 'react';
import { useLocalStorage, useMediaQuery } from '@mantine/hooks';

const DataModeContext = React.createContext<{
  disabled: boolean;
  dataMode: boolean;
  setDataMode: (b: boolean) => void;
} | null>(null);

export const DataModeContextProvider = (props: { children: React.ReactNode }) => {
  const [dataMode, setDataMode] = useLocalStorage<boolean>({
    key: 'dataMode',
    defaultValue: false,
  });
  const isTouchScreen = useMediaQuery('(pointer: coarse)');
  return (
    <DataModeContext.Provider value={{ disabled: isTouchScreen, dataMode, setDataMode }}>
      {props.children}
    </DataModeContext.Provider>
  );
};

export const useDataMode = () => {
  const context = React.useContext(DataModeContext);
  if (context === null) {
    throw new Error('useData must be used within a DataContextProvider');
  }
  return context;
};
