import * as React from "react";
import * as api from "./api";
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
import useSWR from "swr";
import { Athlete, ClubEfforts, Effort, LeaderboardEffort } from "./types";

const clubLinkName = "invitationals";

const correctDuration = (duration: string) => {
  if (duration.includes("s")) {
    const seconds = parseInt(duration.replace("s", ""));
    return "0:" + (seconds < 10 ? "0" + seconds : seconds);
  } else {
    return duration;
  }
};

const getEffortRankMap = (efforts: Effort[]) => {
  const times = efforts.map((e) => {
    return correctDuration(e.duration);
  });

  return times.reduce(
    (map, time, i) => (map[time] ? map : { ...map, [time]: i }),
    {} as { [time: string]: number }
  );
};

const calculateScore = (efforts: LeaderboardEffort[]) =>
  efforts.reduce((sum, effort) => sum + effort.points, 0);

const calculateLeaderboard = (efforts: ClubEfforts) => {
  const athletes: { [profile: string]: Athlete } = {};

  // Set/count athletes on the athletes

  efforts.efforts.map((segmentEffort) => {
    segmentEffort.efforts.map((effort) => {
      athletes[effort.profile] = {
        name: effort.name,
        profile: effort.profile,
        efforts: {},
        totalPoints: 0,
      };
    });
    console.log("athletes:", athletes);
  });

  const numAthletes = Object.entries(athletes).length;

  efforts.efforts.map((segmentEffort) => {
    const effortRankMap = getEffortRankMap(segmentEffort.efforts);

    segmentEffort.efforts.map((effort) => {
      athletes[effort.profile].efforts[segmentEffort.segment.id] = {
        points: numAthletes - effortRankMap[correctDuration(effort.duration)],
        effort,
      };
    });
  });

  // Reversed
  const leaderboard = Object.values(athletes)
    .map((athlete) => ({
      ...athlete,
      totalPoints: calculateScore(Object.values(athlete.efforts)),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return leaderboard;
};

export const App = () => {
  const { data: efforts } = useSWR("efforts", () =>
    api.fetchEfforts(clubLinkName)
  );

  console.log("efforts:", efforts);

  React.useEffect(() => {
    if (efforts) {
      const leaderboard = calculateLeaderboard(efforts);

      console.log("leaderboard:", leaderboard);
    }
  }, [efforts]);

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <ColorModeSwitcher justifySelf="flex-end" />
        {efforts ? (
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
        ) : (
          <Text>Loading..</Text>
        )}
      </Box>
    </ChakraProvider>
  );
};
