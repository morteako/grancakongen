import { Switch } from '@mantine/core';
import { useDataMode } from '../hooks/DataModeContext';

export const DataModeToggle = () => {
  const { dataMode, setDataMode, disabled } = useDataMode();
  if (disabled) {
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
