import { InvitationalEffortTable } from './components/InvitationalEffortTable/InvitationalEffortTable';
import { Logo } from './Logo';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BackgroundGraphics } from './BackgroundGraphics';
import Beermile from './components/Event/Beermile/Beermile';
import useEfforts from './hooks/efforts';
import Admin from './components/Admin/Admin';
import { Center, Loader, MantineProvider, Stack } from '@mantine/core';

export const App = () => {
  const { efforts } = useEfforts();
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark', primaryColor: 'gray' }}>
      {<BackgroundGraphics />}

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
    </MantineProvider>
  );
};
