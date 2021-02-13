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
  Box,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { EffortTable } from "./components/EffortTable/EffortTable";

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl">
      <ColorModeSwitcher justifySelf="flex-end" />
      <Tabs colorScheme="orange" isFitted>
        <TabList>
          <Tab>Runs</Tab>
          <Tab isDisabled>Rides</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <EffortTable />
          </TabPanel>
          <TabPanel>
            <Text>Ride</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  </ChakraProvider>
);
