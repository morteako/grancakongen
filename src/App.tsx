import * as React from 'react';
import { ChakraProvider, Text, Box, Grid } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { SegmentEffortTable } from './components/SegmentEffortTable/SegmentEffortTable';
import { InvitationalEffortTable } from './components/InvitationalEffortTable/InvitationalEffortTable';
import { Logo } from './Logo';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { NavBar } from './components/NavBar/NavBar';
import BackgroundGraphics from './BackgroundGraphics';
import Schous2021 from './components/Event/Schous2021/Schous2021';
import theme from './theme';
import useEfforts from './hooks/efforts';
import Admin from './components/Admin/Admin';

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
              <Route exact path="/" render={() => <Redirect to="/invitationals" />} />
              <Route path="/invitationals">
                <NavBar activePath="/invitationals" />
                <InvitationalEffortTable />
              </Route>
              <Route path="/segments">
                <NavBar activePath="/segments" />
                <SegmentEffortTable />
              </Route>
              <Route path="/beermile">
                <Schous2021 />
              </Route>
              <Route path="/admin">
                <Admin />
              </Route>
            </Switch>
          </BrowserRouter>
        ) : (
          <Text>Loading..</Text>
        )}
      </Box>
    </ChakraProvider>
  );
};
