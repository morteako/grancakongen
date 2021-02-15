import * as React from "react";
import * as api from "./api";
import {
  ChakraProvider,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Box,
  Grid,
  extendTheme,
  Flex,
  Center,
  system,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { EffortTable } from "./components/EffortTable/EffortTable";
import useSWR from "swr";
import {
  Athlete,
  ClubEfforts,
  Effort,
  LeaderboardEffort,
  Segment,
} from "./types";
import { Logo } from "./Logo";
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import { NavBar } from "./components/NavBar/NavBar";

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

const calculateLeaderboard = (
  efforts: ClubEfforts,
  activityType: "run" | "ride"
) => {
  const athletes: { [profile: string]: Athlete } = {};

  const filteredEfforts = efforts.efforts.filter(
    (e) => e.segment.type === activityType
  );

  // Set/count athletes

  filteredEfforts.map((segmentEffort) => {
    return segmentEffort.efforts.map((effort) => {
      athletes[effort.profile] = {
        name: effort.name,
        profile: effort.profile,
        efforts: {},
        totalPoints: 0,
        rank: 0,
      };
      return null;
    });
  });

  const numAthletes = Object.entries(athletes).length;

  filteredEfforts.map((segmentEffort) => {
    const effortRankMap = getEffortRankMap(segmentEffort.efforts);

    return segmentEffort.efforts.map((effort) => {
      const rank = effortRankMap[correctDuration(effort.duration)];
      return (athletes[effort.profile].efforts[segmentEffort.segment.id] = {
        points: numAthletes - rank,
        effort: { ...effort, localRank: rank + 1 },
      });
    });
  });

  // Reversed
  const leaderboard = Object.values(athletes)
    .map((athlete) => ({
      ...athlete,
      totalPoints: calculateScore(Object.values(athlete.efforts)),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  let lastNumPoints = 0;
  for (let i = 0; i < leaderboard.length; i++) {
    const athlete = leaderboard[i];
    if (i !== 0 && athlete.totalPoints === lastNumPoints) {
      athlete.rank = leaderboard[i - 1].rank;
    } else {
      athlete.rank = i + 1;
      lastNumPoints = athlete.totalPoints;
    }
  }

  return leaderboard;
};

const theme = extendTheme({
  config: {
    useSystemColorMode: true,
  },
  colors: {
    strava: {
      100: "#fc5200",
      200: "#fc5200",
      300: "#fc5200",
      400: "#fc5200",
      500: "#fc5200",
      600: "#fc5200",
      700: "#fc5200",
      800: "#fc5200",
      900: "#fc5200",
    },
  },
});

export const App = () => {
  const { data: efforts } = useSWR("efforts", () =>
    api.fetchEfforts(clubLinkName)
  );

  const [leaderboard, setLeaderboard] = React.useState([] as Athlete[]);
  const [segments, setSegments] = React.useState([] as Segment[]);

  React.useEffect(() => {
    if (efforts) {
      const leaderboard = calculateLeaderboard(efforts, "run");
      setLeaderboard(leaderboard);

      const segments = efforts.efforts
        .map((effort) => effort.segment)
        .filter((segment) => segment.type === "run");
      setSegments(segments);
    }
  }, [efforts]);

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid templateColumns="1fr 2fr 1fr">
          <Text></Text>
          <Logo />
          <ColorModeSwitcher justifySelf="flex-end" />
        </Grid>
        {efforts ? (
          <BrowserRouter>
            <Switch>
              <Route path="/segments">
                <NavBar activePath="/segments" />
                <EffortTable leaderboard={leaderboard} segments={segments} />
              </Route>
              <Route path="/invitationals">
                <NavBar activePath="/invitationals" />
                <Text>Invitationals</Text>
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
