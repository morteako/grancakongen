import * as React from 'react';
import * as api from './api';
import { ChakraProvider, Text, Box, Grid, extendTheme } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { SegmentEffortTable } from './components/SegmentEffortTable/SegmentEffortTable';
import { InvitationalEffortTable } from './components/InvitationalEffortTable/InvitationalEffortTable';
import useSWR from 'swr';
import { Logo } from './Logo';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { NavBar } from './components/NavBar/NavBar';
import Event from './components/Event/Event';

const clubLinkName = 'invitationals';

const theme = extendTheme({
  config: {
    useSystemColorMode: true,
  },
  colors: {
    strava: {
      100: '#fc5200',
      200: '#fc5200',
      300: '#fc5200',
      400: '#fc5200',
      500: '#fc5200',
      600: '#fc5200',
      700: '#fc5200',
      800: '#fc5200',
      900: '#fc5200',
    },
  },
});

export const App = () => {
  const { data } = useSWR('efforts', () => api.fetchEfforts());

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid templateColumns="1fr 2fr 1fr">
          <Text></Text>
          <Logo />
          <ColorModeSwitcher justifySelf="flex-end" />
        </Grid>
        {data ? (
          <BrowserRouter>
            <Switch>
              <Route exact path="/" render={() => <Redirect to="/invitationals" />} />
              <Route path="/invitationals">
                <NavBar activePath="/invitationals" />
                <InvitationalEffortTable clubEfforts={data} />
              </Route>
              <Route path="/segments">
                <NavBar activePath="/segments" />
                <SegmentEffortTable clubEfforts={data} />
              </Route>
              <Route path="/event/:event">
                <Event />
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
