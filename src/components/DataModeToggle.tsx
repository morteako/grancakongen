import { Switch } from '@mantine/core';
import { useDataMode } from '../hooks/DataModeContext';
import { useMediaQuery } from '@mantine/hooks';

export const DataModeToggle = () => {
  const { dataMode, setDataMode } = useDataMode();

  const isTouchScreen = useMediaQuery('(pointer: coarse)');
  if (isTouchScreen) {
    return null;
  }

  return (
    <Switch
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
      checked={dataMode}
      onChange={event => setDataMode(event.currentTarget.checked)}
      size={'lg'}
      onLabel="Pro"
      offLabel="Basic"
    />
  );
};
