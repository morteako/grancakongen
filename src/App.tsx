import { InvitationalEffortTable } from './components/InvitationalEffortTable/InvitationalEffortTable';
import { Logo } from './Logo';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
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
            <Switch>
              <Route exact path="/">
                <InvitationalEffortTable allEfforts={efforts} />
              </Route>
              <Route path="/beermile">
                <Beermile />
              </Route>
              <Route path="/admin">
                <Admin />
              </Route>
              <Route path="*" render={() => <Redirect to="/" />} />
            </Switch>
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
