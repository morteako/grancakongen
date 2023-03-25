import { HiChevronDown, HiChevronUp, HiChevronUpDown } from 'react-icons/hi2';
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
import { ActionIcon, Anchor, Box, Flex, Select, Stack, Table, Text, Tooltip } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';

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
  sortBy.type === type ? sortBy.inverted ? <HiChevronUp /> : <HiChevronDown /> : <HiChevronUpDown />;

const EffortTooltip = (effort: LeaderboardInvitationalEffort) => {
  return (
    <Stack spacing="xs" align="flex-start">
      <Text>Rank: {effort.effort.localRank}</Text>
      <Text>Points: {effort.points}</Text>
      {effort.effort.year === undefined ? <></> : <Text>Year: {effort.effort.year}</Text>}
    </Stack>
  );
};
const getInvitationalIcon = (sortBy: SortBy, invitationalId: string) =>
  sortBy.type === 'invitational' && sortBy.invitationalId === invitationalId ? (
    sortBy.inverted ? (
      <HiChevronUp />
    ) : (
      <HiChevronDown />
    )
  ) : (
    <HiChevronUpDown />
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

  /* TODO: Improve responsiveness */
  const { width } = useViewportSize();
  const titleType = width < 700 ? 'initials' : width < 1200 ? 'short' : 'full';

  const [year, setYear] = useState<number | null>(2023);

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

  const colorStrength = 6;
  const medalColors = ['yellow', 'gray', 'orange'];

  return (
    <Stack>
      <Flex justify="center">
        <Box maw="500px">
          <Select
            onChange={value => {
              history.push({ search: `filter=year&year=${value}` });
              setYear(value ? parseInt(value) : null);
            }}
            value={year ? `${year}` : null}
            data={[
              { value: '2023', label: '2023' },
              { value: '2022', label: '2022' },
              { value: '2021', label: '2021' },
              { value: '2020', label: '2020' },
              // { value: null, label: 'All time' },
            ]}
            placeholder="All time"
            clearable
          />
        </Box>
      </Flex>
      <Box w="100%" style={{ overflow: 'auto' }}>
        <Table verticalSpacing="sm" fontSize="md">
          <thead>
            <tr>
              <th>
                <Flex justify="space-between" align="center" style={{ textTransform: 'uppercase' }} fz="xs">
                  {/*titleType === 'full' ? 'Rank | Points' : '#|pts'*/}
                  {'#|pts'}
                  <ActionIcon
                    aria-label="sort"
                    size="xs"
                    onClick={() =>
                      setSortBy(
                        sortBy.type === 'rank'
                          ? { type: 'rank', inverted: !sortBy.inverted }
                          : { type: 'rank', inverted: false }
                      )
                    }
                  >
                    {getIcon(sortBy, 'rank')}
                  </ActionIcon>
                </Flex>
              </th>
              <th>
                <Flex justify="space-between" align="center" style={{ textTransform: 'uppercase' }} fz="xs">
                  Name
                  <ActionIcon
                    aria-label="sort"
                    size="xs"
                    onClick={() =>
                      setSortBy(
                        sortBy.type === 'name'
                          ? { type: 'name', inverted: !sortBy.inverted }
                          : { type: 'name', inverted: false }
                      )
                    }
                  >
                    {getIcon(sortBy, 'name')}
                  </ActionIcon>
                </Flex>
              </th>
              {invitationals.map(invitational => (
                <th key={'invitational-' + invitational.id}>
                  <Flex justify="space-between" align="center">
                    <Tooltip label={invitational.description} position="bottom" fw="normal">
                      <Text style={{ textTransform: 'uppercase' }} fz="xs" fw="bolder">
                        {invitational.segment ? (
                          <Anchor href={`http://www.strava.com${invitational.segment}`}>
                            {titleType === 'initials'
                              ? invitational.initials
                              : titleType === 'short'
                              ? invitational.shortName
                              : invitational.name}
                          </Anchor>
                        ) : titleType === 'initials' ? (
                          invitational.initials
                        ) : titleType === 'short' ? (
                          invitational.shortName
                        ) : (
                          invitational.name
                        )}
                      </Text>
                    </Tooltip>

                    <ActionIcon
                      aria-label="sort"
                      size="xs"
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
                    >
                      {getInvitationalIcon(sortBy, invitational.id)}
                    </ActionIcon>
                  </Flex>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard.map(athlete => {
              const rankColor = athlete.rank <= 3 ? `${medalColors[athlete.rank - 1]}.${colorStrength}` : undefined;
              return (
                <tr key={athlete.profile}>
                  <td>
                    <Flex justify="space-between">
                      <Text display="inline" fw="bold" color={rankColor}>
                        {athlete.rank}
                      </Text>
                      <Text display="inline" color={rankColor}>
                        {athlete.totalPoints}
                      </Text>
                    </Flex>
                  </td>
                  <td>
                    <Anchor href={`http://www.strava.com${athlete.profile}`}>
                      <Tooltip label={athlete.name} position="left">
                        <Text>{athlete.name.split(' ')[0]}</Text>
                      </Tooltip>
                    </Anchor>
                  </td>
                  {invitationals.map((invitational, i) => {
                    const invitationalEffort = athlete.efforts[invitational.id];
                    const invitationalRank = invitationalEffort ? invitationalEffort.effort.localRank : null;
                    const invitationalRankColor =
                      invitationalRank && invitationalRank <= 3
                        ? `${medalColors[invitationalRank - 1]}.${colorStrength}`
                        : undefined;
                    return invitationalEffort ? (
                      <td key={athlete.profile + '-seg-' + i}>
                        {invitationalEffort.effort.activity ? (
                          <Anchor href={`http://strava.com${invitationalEffort.effort.activity}`}>
                            <Tooltip label={EffortTooltip(invitationalEffort)} position="left">
                              <Text color={invitationalRankColor}>{getDurationInMMSS(invitationalEffort.effort)}</Text>
                            </Tooltip>
                          </Anchor>
                        ) : (
                          <Tooltip label={EffortTooltip(invitationalEffort)} position="left">
                            <Text color={invitationalRankColor}>{getDurationInMMSS(invitationalEffort.effort)}</Text>
                          </Tooltip>
                        )}
                      </td>
                    ) : (
                      <td key={athlete.profile + '-seg-' + i}>-</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Box>
    </Stack>
  );
};

const getDurationInMMSS = (effort: InvitationalEffort) => {
  const minutes = Math.floor(effort.duration / 60);
  const seconds = Math.floor(effort.duration % 60);
  const secondsPadding = seconds < 10 ? '0' : '';
  return `${minutes}:${secondsPadding}${seconds}`;
};
