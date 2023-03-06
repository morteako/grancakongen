import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from '@chakra-ui/icons';
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
  useBreakpointValue,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import useEfforts from '../../hooks/efforts';
import {
  InvitationalAthlete,
  InvitationalEffort,
  Invitational,
  ClubEfforts,
  LeaderboardInvitationalEffort,
  InvitationalEffortGroup,
} from '../../types';

type SortBy =
  | {
      type: 'rank';
      inverted: boolean;
    }
  | {
      type: 'name';
      inverted: boolean;
    }
  | {
      type: 'invitational';
      inverted: boolean;
      invitationalId: string;
    };

const sortLeaderboard = (leaderboard: InvitationalAthlete[], sortBy: SortBy) => {
  switch (sortBy.type) {
    case 'name':
      return leaderboard.sort((a, b) => a.name.localeCompare(b.name));
    case 'rank':
      return leaderboard.sort((a, b) => a.rank - b.rank);
    case 'invitational':
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

const getIcon = (sortBy: SortBy, type: 'rank' | 'name') =>
  sortBy.type === type ? sortBy.inverted ? <ArrowUpIcon /> : <ArrowDownIcon /> : <ArrowUpDownIcon />;

const EffortTooltip = (effort: LeaderboardInvitationalEffort) => {
  return (
    <Flex flexDir="column">
      <Text>Rank: {effort.effort.localRank}</Text>
      <Text>Points: {effort.points}</Text>
      {effort.effort.year === undefined ? <></> : <Text>Year: {effort.effort.year}</Text>}
    </Flex>
  );
};
const getInvitationalIcon = (sortBy: SortBy, invitationalId: string) =>
  sortBy.type === 'invitational' && sortBy.invitationalId === invitationalId ? (
    sortBy.inverted ? (
      <ArrowUpIcon />
    ) : (
      <ArrowDownIcon />
    )
  ) : (
    <ArrowUpDownIcon />
  );

const getEffortRankMap = (efforts: InvitationalEffort[]) => {
  const times = efforts.map(e => e.duration).sort((a, b) => a - b);

  return times.reduce((map, time, i) => (map[time] ? map : { ...map, [time]: i }), {} as { [time: number]: number });
};

const calculateScore = (efforts: LeaderboardInvitationalEffort[]) =>
  efforts.reduce((sum, effort) => sum + effort.points, 0);

const calculateScoreByRank = (rank: number) => {
  // Zero-indexed rank
  const maxPoints = 25;
  const firstDecrement = 5;

  let decrementVal = firstDecrement;
  let points = maxPoints;

  for (let i = 0; i < rank; i++) {
    points -= decrementVal;

    if (decrementVal !== 1) {
      decrementVal--;
    }

    if (points <= 0) {
      points = 1;
      break;
    }
  }

  return points;
};

const getRelevantInvitationals = (efforts: ClubEfforts, year: number | null) => {
  return efforts.invitationalEfforts.filter(effort => (year ? effort.invitational.year === year : true));
};

const calculateLeaderboard = (invitationalEfforts: InvitationalEffortGroup[], year: number | null) => {
  const athletes: { [profile: string]: InvitationalAthlete } = {};
  let filteredEfforts: InvitationalEffortGroup[];
  if (year) {
    filteredEfforts = invitationalEfforts;
  } else {
    const bestEfforts = calculateBestEffortsForPersonEvent(invitationalEfforts);

    filteredEfforts = invitationalEfforts.flatMap(event => {
      const res = bestEfforts.get(event.invitational.name);
      if (res === undefined) {
        console.error(`${event.invitational.name} missing. Should not happen.`);
        return [];
      }
      return {
        invitational: event.invitational,
        efforts: Array.from(res.values()),
      };
    });
    filteredEfforts = dedupInvitationals(filteredEfforts, x => x.invitational, year);
  }
  // Set/count athletes

  filteredEfforts.forEach(invitationalEffort =>
    invitationalEffort.efforts.forEach(
      effort =>
        (athletes[effort.profile] = {
          name: effort.name,
          profile: effort.profile,
          efforts: {},
          totalPoints: 0,
          rank: 0,
        })
    )
  );

  filteredEfforts.map(invitationalEffort => {
    const effortRankMap = getEffortRankMap(invitationalEffort.efforts);

    return invitationalEffort.efforts.map(effort => {
      const rank = effortRankMap[effort.duration];
      return (athletes[effort.profile].efforts[invitationalEffort.invitational.id] = {
        points: calculateScoreByRank(rank),
        effort: { ...effort, localRank: rank + 1 },
      });
    });
  });

  // Reversed
  const leaderboard = Object.values(athletes)
    .map(athlete => ({
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

const calculateBestEffortsForPersonEvent = (efforts: InvitationalEffortGroup[]) => {
  const bestEffort = (a: InvitationalEffort, b: InvitationalEffort) => (a.duration < b.duration ? a : b);

  const bestEffortsForPersonEvent = new Map<string, Map<string, InvitationalEffort>>();

  //populate bestEffortsForPersonEvent
  efforts.forEach(inviEfforts => {
    const name = inviEfforts.invitational.name;
    const bestEffortsForEvent = bestEffortsForPersonEvent.get(name);
    let eventMap: Map<string, InvitationalEffort>;
    if (bestEffortsForEvent === undefined) {
      eventMap = new Map();
      bestEffortsForPersonEvent.set(name, eventMap);
    } else {
      eventMap = bestEffortsForEvent;
    }

    inviEfforts.efforts.forEach(effort => {
      const currentPersonBestEffort = eventMap.get(effort.name);
      if (currentPersonBestEffort === undefined) {
        eventMap.set(effort.name, { ...effort, year: inviEfforts.invitational.year });
      } else {
        eventMap.set(
          effort.name,
          bestEffort({ ...effort, year: inviEfforts.invitational.year }, currentPersonBestEffort)
        );
      }
    });
  });

  return bestEffortsForPersonEvent;
};

const dedupInvitationals = <T,>(invitationals: T[], getInv: (x: T) => Invitational, year: number | null) => {
  if (year) return invitationals;
  const uniqueInvitationalNames = new Map<string, T>();
  invitationals.forEach(inv => uniqueInvitationalNames.set(getInv(inv).name, inv));
  return Array.from(uniqueInvitationalNames.values());
};

export const InvitationalEffortTable = () => {
  const [leaderboard, setLeaderboard] = React.useState([] as InvitationalAthlete[]);
  const [invitationals, setInvitationals] = React.useState([] as Invitational[]);

  const titleType = useBreakpointValue({ base: 'initials', md: 'short', xl: 'full' });

  const [year, setYear] = useState<number | null>(2022);

  const { efforts } = useEfforts();

  React.useEffect(() => {
    if (efforts) {
      const relevantInvitationals = getRelevantInvitationals(efforts, year);
      const leaderboard = calculateLeaderboard(relevantInvitationals, year);
      setLeaderboard(leaderboard);

      const invitationals = dedupInvitationals(
        relevantInvitationals.map(effort => effort.invitational),
        x => x,
        year
      );

      setInvitationals(invitationals);
    }
  }, [efforts, year]);

  const history = useHistory();

  const [sortBy, setSortBy] = useState({ type: 'rank' } as SortBy);

  const sortedLeaderboard = sortBy.inverted
    ? sortLeaderboard(leaderboard, sortBy).reverse()
    : sortLeaderboard(leaderboard, sortBy);

  const colorStrength = 400;
  const medalColors = ['yellow', 'gray', 'orange'];

  return (
    <Flex flexDir="column">
      <Flex justifyContent="center">
        <Box width={['100%', '40%', '20%']}>
          <Select
            onChange={e => {
              history.push({ search: `filter=year&year=${e.target.value}` });
              setYear(e.target.value === '' ? null : parseInt(e.target.value));
            }}
            value={year || ''}
          >
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="">All-time</option>
          </Select>
        </Box>
      </Flex>
      <Box width="100%" overflow="auto">
        <Table>
          <Thead>
            <Tr>
              <Th>
                <Flex justifyContent="space-between" alignItems="center">
                  {titleType === 'full' ? 'Rank | Points' : '#|pts'}
                  <IconButton
                    aria-label="sort"
                    size="xs"
                    icon={getIcon(sortBy, 'rank')}
                    onClick={() =>
                      setSortBy(
                        sortBy.type === 'rank'
                          ? { type: 'rank', inverted: !sortBy.inverted }
                          : { type: 'rank', inverted: false }
                      )
                    }
                  />
                </Flex>
              </Th>
              <Th>
                <Flex justifyContent="space-between" alignItems="center">
                  Name
                  <IconButton
                    aria-label="sort"
                    size="xs"
                    icon={getIcon(sortBy, 'name')}
                    onClick={() =>
                      setSortBy(
                        sortBy.type === 'name'
                          ? { type: 'name', inverted: !sortBy.inverted }
                          : { type: 'name', inverted: false }
                      )
                    }
                  />
                </Flex>
              </Th>
              {invitationals.map(invitational => (
                <Th key={'invitational-' + invitational.id}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Tooltip label={invitational.description} placement="bottom">
                      {invitational.segment ? (
                        <Link href={`http://www.strava.com${invitational.segment}`}>
                          {titleType === 'initials'
                            ? invitational.initials
                            : titleType === 'short'
                            ? invitational.shortName
                            : invitational.name}
                        </Link>
                      ) : titleType === 'initials' ? (
                        invitational.initials
                      ) : titleType === 'short' ? (
                        invitational.shortName
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
                          sortBy.type === 'invitational' && sortBy.invitationalId === invitational.id
                            ? {
                                type: 'invitational',
                                inverted: !sortBy.inverted,
                                invitationalId: invitational.id,
                              }
                            : {
                                type: 'invitational',
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
            {sortedLeaderboard.map(athlete => (
              <Tr key={athlete.profile}>
                <Td>
                  <Flex
                    justifyContent="space-between"
                    color={athlete.rank <= 3 ? `${medalColors[athlete.rank - 1]}.${colorStrength}` : undefined}
                  >
                    <Text display="inline" fontWeight="semibold">
                      {athlete.rank}
                    </Text>
                    <Text display="inline">{athlete.totalPoints}</Text>
                  </Flex>
                </Td>
                <Td>
                  <Link href={`http://www.strava.com${athlete.profile}`}>
                    <Tooltip label={athlete.name} placement="left">
                      {athlete.name.split(' ')[0]}
                    </Tooltip>
                  </Link>
                </Td>
                {invitationals.map((invitational, i) => {
                  const invitationalEffort = athlete.efforts[invitational.id];
                  const invitationalRank = invitationalEffort ? invitationalEffort.effort.localRank : null;
                  return invitationalEffort ? (
                    <Td
                      key={athlete.profile + '-seg-' + i}
                      color={
                        invitationalRank && invitationalRank <= 3
                          ? `${medalColors[invitationalRank - 1]}.${colorStrength}`
                          : undefined
                      }
                    >
                      {invitationalEffort.effort.activity ? (
                        <Link href={`http://strava.com${invitationalEffort.effort.activity}`}>
                          <Tooltip label={EffortTooltip(invitationalEffort)} placement="left">
                            {getDurationInMMSS(invitationalEffort.effort)}
                          </Tooltip>
                        </Link>
                      ) : (
                        <Tooltip label={EffortTooltip(invitationalEffort)} placement="left">
                          {getDurationInMMSS(invitationalEffort.effort)}
                        </Tooltip>
                      )}
                    </Td>
                  ) : (
                    <Td key={athlete.profile + '-seg-' + i}>-</Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

const getDurationInMMSS = (effort: InvitationalEffort) => {
  const minutes = Math.floor(effort.duration / 60);
  const seconds = Math.floor(effort.duration % 60);
  const secondsPadding = seconds < 10 ? '0' : '';
  return `${minutes}:${secondsPadding}${seconds}`;
};
