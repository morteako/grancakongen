import * as React from 'react';
import * as api from './api';
import { ChakraProvider, Text, Box, Grid, extendTheme, theme as defaultTheme } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { SegmentEffortTable } from './components/SegmentEffortTable/SegmentEffortTable';
import { InvitationalEffortTable } from './components/InvitationalEffortTable/InvitationalEffortTable';
import useSWR from 'swr';
import { Logo } from './Logo';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { NavBar } from './components/NavBar/NavBar';
import Event from './components/Event/Event';
import { BG } from './BG';

const clubLinkName = 'invitationals';

const theme = extendTheme({
  config: {
    useSystemColorMode: true,
  },

  colors: {
    gray: {
      100: '#fafafa',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      700: '#424242',
      800: '#212121',
      900: '#101010',
    },
    blue: {
      100: '#ffddc6',
      200: '#ffbb8e',
      300: '#ff9955',
      400: '#ff8839',
      500: '#ff771c',
      600: '#ff6600',
      700: '#df5900',
      800: '#be4d00',
      900: '#9e4000',
    },
    strava: {
      100: '#ffddc6',
      200: '#ffbb8e',
      300: '#ff9955',
      400: '#ff8839',
      500: '#ff771c',
      600: '#ff6600',
      700: '#df5900',
      800: '#be4d00',
      900: '#9e4000',
    },
  },
});

export const App = () => {
  const { data } = useSWR('efforts', () => api.fetchEfforts());

  return (
    <ChakraProvider theme={theme}>
      <BG />

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
