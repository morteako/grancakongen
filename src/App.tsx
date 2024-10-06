import { InvitationalEffortTable } from './components/InvitationalEffortTable/InvitationalEffortTable';
import { Logo } from './Logo';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BackgroundGraphics } from './BackgroundGraphics';
import Beermile from './components/Event/Beermile/Beermile';
import useEfforts from './hooks/efforts';
import Admin from './components/Admin/Admin';
import { AppShell, Center, Footer, Loader, MantineProvider, Stack, Switch } from '@mantine/core';
import React from 'react';
import { DataModeContextProvider, useDataMode } from './hooks/DataModeContext';

export const App = () => {
  const { efforts } = useEfforts();

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark', primaryColor: 'gray' }}>
      <DataModeContextProvider>
        <AppShell footer={<DataModeFooter />}>
          <BackgroundGraphics />
          <Stack>
            <Center>
              <Logo />
            </Center>
            {efforts ? (
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<InvitationalEffortTable allEfforts={efforts} />} />
                  <Route path="/beermile" element={<Beermile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<Navigate to={'/'} replace />} />
                </Routes>
              </BrowserRouter>
            ) : (
              <Center>
                <Loader />
              </Center>
            )}
          </Stack>
        </AppShell>
      </DataModeContextProvider>
    </MantineProvider>
  );
};

const DataModeFooter = () => {
  const { dataMode, setDataMode, disabled } = useDataMode();
  if (disabled) {
    return null;
  }
  return (
    <Footer height={50} p="md">
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
    </Footer>
  );
};
