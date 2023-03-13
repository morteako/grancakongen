import * as React from 'react';
import { ChakraProvider, Text, Box, Grid } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { InvitationalEffortTable } from './components/InvitationalEffortTable/InvitationalEffortTable';
import { Logo } from './Logo';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import BackgroundGraphics from './BackgroundGraphics';
import Beermile from './components/Event/Beermile/Beermile';
import theme from './theme';
import useEfforts from './hooks/efforts';
import Admin from './components/Admin/Admin';
import Upcoming from './components/Upcoming/Upcoming';

export const App = () => {
  const { efforts } = useEfforts();
  return (
    <ChakraProvider theme={theme}>
      <BackgroundGraphics />

      <Box textAlign="center" fontSize="xl">
        <Grid templateColumns="1fr 2fr 1fr">
          <Text></Text>
          <Logo />
          <ColorModeSwitcher justifySelf="flex-end" />
        </Grid>
        {efforts ? (
          <BrowserRouter>
            <Switch>
              <Route exact path="/">
                <InvitationalEffortTable />
              </Route>
              <Route path="/upcoming">
                <Upcoming />
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
          <Text>Loading..</Text>
        )}
      </Box>
    </ChakraProvider>
  );
};
