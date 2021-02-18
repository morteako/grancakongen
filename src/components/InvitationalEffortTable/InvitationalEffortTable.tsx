import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  IconButton,
  Link,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  InvitationalAthlete,
  InvitationalEffort,
  Invitational,
  ClubEfforts,
  LeaderboardInvitationalEffort,
} from "../../types";

interface Props {
  clubEfforts: ClubEfforts;
}

type SortBy =
  | {
      type: "rank";
      inverted: boolean;
    }
  | {
      type: "name";
      inverted: boolean;
    }
  | {
      type: "invitational";
      inverted: boolean;
      invitationalId: string;
    };

const sortLeaderboard = (
  leaderboard: InvitationalAthlete[],
  sortBy: SortBy
) => {
  switch (sortBy.type) {
    case "name":
      return leaderboard.sort((a, b) => a.name.localeCompare(b.name));
    case "rank":
      return leaderboard.sort((a, b) => a.rank - b.rank);
    case "invitational":
      return leaderboard.sort((a, b) => {
        const aEffort = a.efforts[sortBy.invitationalId];
        const bEffort = b.efforts[sortBy.invitationalId];

        if (!aEffort && !bEffort) {
          return 0;
        } else if (aEffort && !bEffort) {
          return -1;
        } else if (!aEffort && bEffort) {
          return 1;
        } else {
          return bEffort.points - aEffort.points;
        }
      });
  }
};

const getIcon = (sortBy: SortBy, type: "rank" | "name") =>
  sortBy.type === type ? (
    sortBy.inverted ? (
      <ArrowUpIcon />
    ) : (
      <ArrowDownIcon />
    )
  ) : (
    <ArrowUpDownIcon />
  );

const EffortTooltip = (effort: LeaderboardInvitationalEffort) => {
  return (
    <Flex flexDir="column">
      <Text>Rank: {effort.effort.localRank}</Text>
      <Text>Points: {effort.points}</Text>
    </Flex>
  );
};
const getInvitationalIcon = (sortBy: SortBy, invitationalId: string) =>
  sortBy.type === "invitational" && sortBy.invitationalId === invitationalId ? (
    sortBy.inverted ? (
      <ArrowUpIcon />
    ) : (
      <ArrowDownIcon />
    )
  ) : (
    <ArrowUpDownIcon />
  );

const getTimeFilter = (searchParams: string) => {
  const params = searchParams.split("&");
};

const correctDuration = (duration: string) => {
  if (duration.includes("s")) {
    const seconds = parseInt(duration.replace("s", ""));
    return "0:" + (seconds < 10 ? "0" + seconds : seconds);
  } else {
    return duration;
  }
};

const getEffortRankMap = (efforts: InvitationalEffort[]) => {
  const times = efforts.map((e) => {
    return correctDuration(e.duration);
  });

  return times.reduce(
    (map, time, i) => (map[time] ? map : { ...map, [time]: i }),
    {} as { [time: string]: number }
  );
};

const calculateScore = (efforts: LeaderboardInvitationalEffort[]) =>
  efforts.reduce((sum, effort) => sum + effort.points, 0);

const calculateLeaderboard = (efforts: ClubEfforts, year: number) => {
  const athletes: { [profile: string]: InvitationalAthlete } = {};

  const filteredEfforts = efforts.invitationalEfforts.filter(
    (effort) => effort.invitational.year === year
  );
  // Set/count athletes

  filteredEfforts.map((invitationalEffort) => {
    return invitationalEffort.efforts.map((effort) => {
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

  filteredEfforts.map((invitationalEffort) => {
    const effortRankMap = getEffortRankMap(invitationalEffort.efforts);

    return invitationalEffort.efforts.map((effort) => {
      const rank = effortRankMap[correctDuration(effort.duration)];
      return (athletes[effort.profile].efforts[
        invitationalEffort.invitational.id
      ] = {
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
export const InvitationalEffortTable = ({ clubEfforts }: Props) => {
  const [leaderboard, setLeaderboard] = React.useState(
    [] as InvitationalAthlete[]
  );
  const [invitationals, setInvitationals] = React.useState(
    [] as Invitational[]
  );

  const [year, setYear] = useState(2020);

  React.useEffect(() => {
    if (clubEfforts) {
      const leaderboard = calculateLeaderboard(clubEfforts, year);
      setLeaderboard(leaderboard);

      const invitationals = clubEfforts.invitationalEfforts
        .filter((effort) => effort.invitational.year === year)
        .map((effort) => effort.invitational);
      setInvitationals(invitationals);
    }
  }, [clubEfforts, year]);

  const timeFilter = useLocation().search;
  const history = useHistory();

  getTimeFilter(useLocation().search);

  const [sortBy, setSortBy] = useState({ type: "rank" } as SortBy);

  const sortedLeaderboard = sortBy.inverted
    ? sortLeaderboard(leaderboard, sortBy).reverse()
    : sortLeaderboard(leaderboard, sortBy);

  const colorStrength = 400;
  const medalColors = ["yellow", "gray", "orange"];

  return (
    <Flex flexDir="column" alignItems="center">
      <Box width={["100%", "40%", "20%"]}>
        <Select
          onChange={(e) => {
            history.push({ search: `filter=year&year=${e.target.value}` });
            setYear(parseInt(e.target.value));
          }}
          value={year}
        >
          <option value="2021">2021</option>
          <option value="2020">2020</option>
        </Select>
      </Box>
      <Table>
        <Thead>
          <Tr>
            <Th>
              <Flex justifyContent="space-between" alignItems="center">
                Rank
                <IconButton
                  aria-label="sort"
                  size="xs"
                  icon={getIcon(sortBy, "rank")}
                  onClick={() =>
                    setSortBy(
                      sortBy.type === "rank"
                        ? { type: "rank", inverted: !sortBy.inverted }
                        : { type: "rank", inverted: false }
                    )
                  }
                />
              </Flex>
            </Th>
            <Th>Points</Th>
            <Th>
              <Flex justifyContent="space-between" alignItems="center">
                Name
                <IconButton
                  aria-label="sort"
                  size="xs"
                  icon={getIcon(sortBy, "name")}
                  onClick={() =>
                    setSortBy(
                      sortBy.type === "name"
                        ? { type: "name", inverted: !sortBy.inverted }
                        : { type: "name", inverted: false }
                    )
                  }
                />
              </Flex>
            </Th>
            {invitationals.map((invitational) => (
              <Th key={"invitational-" + invitational.id}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Tooltip label={invitational.description} placement="bottom">
                    {invitational.segment ? (
                      <Link
                        href={`http://www.strava.com${invitational.segment}`}
                      >
                        {invitational.name}
                      </Link>
                    ) : (
                      invitational.name
                    )}
                  </Tooltip>

                  <IconButton
                    aria-label="sort"
                    size="xs"
                    icon={getInvitationalIcon(sortBy, invitational.id)}
                    onClick={() =>
                      setSortBy(
                        sortBy.type === "invitational" &&
                          sortBy.invitationalId === invitational.id
                          ? {
                              type: "invitational",
                              inverted: !sortBy.inverted,
                              invitationalId: invitational.id,
                            }
                          : {
                              type: "invitational",
                              inverted: false,
                              invitationalId: invitational.id,
                            }
                      )
                    }
                  />
                </Flex>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sortedLeaderboard.map((athlete) => (
            <Tr key={athlete.profile}>
              <Td
                color={
                  athlete.rank <= 3
                    ? `${medalColors[athlete.rank - 1]}.${colorStrength}`
                    : undefined
                }
              >
                {athlete.rank}
              </Td>
              <Td>{athlete.totalPoints}</Td>
              <Td>
                <Link href={`http://www.strava.com${athlete.profile}`}>
                  <Tooltip label={athlete.name} placement="left">
                    {athlete.name.split(" ")[0]}
                  </Tooltip>
                </Link>
              </Td>
              {invitationals.map((invitational, i) => {
                const invitationalEffort = athlete.efforts[invitational.id];
                const invitationalRank = invitationalEffort
                  ? invitationalEffort.effort.localRank
                  : null;
                return invitationalEffort ? (
                  <Td
                    key={athlete.profile + "-seg-" + i}
                    color={
                      invitationalRank && invitationalRank <= 3
                        ? `${
                            medalColors[invitationalRank - 1]
                          }.${colorStrength}`
                        : undefined
                    }
                  >
                    {invitationalEffort.effort.activity ? (
                      <Link
                        href={`http://strava.com${invitationalEffort.effort.activity}`}
                      >
                        <Tooltip
                          label={EffortTooltip(invitationalEffort)}
                          placement="left"
                        >
                          {invitationalEffort.effort.duration}
                        </Tooltip>
                      </Link>
                    ) : (
                      <Tooltip
                        label={EffortTooltip(invitationalEffort)}
                        placement="left"
                      >
                        {invitationalEffort.effort.duration}
                      </Tooltip>
                    )}
                  </Td>
                ) : (
                  <Td key={athlete.profile + "-seg-" + i}>-</Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};
