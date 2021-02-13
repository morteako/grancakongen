import * as React from "react";
import {
  ChakraProvider,
  Text,
  theme,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

export const App = () => (
  <ChakraProvider theme={theme}>
    {/* <Box textAlign="center" fontSize="xl"> */}
    {/* <Grid minH="100vh" p={3}> */}
    <ColorModeSwitcher justifySelf="flex-end" />
    <Tabs colorScheme="orange" isFitted>
      <TabList>
        <Tab>Run</Tab>
        <Tab isDisabled>Ride</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <Text>Runs</Text>
        </TabPanel>
        <TabPanel>
          <Text>Ride</Text>
        </TabPanel>
      </TabPanels>
    </Tabs>
    <Text>Stravaknugen</Text>

    {/* </Grid> */}
    {/* </Box> */}
  </ChakraProvider>
);
