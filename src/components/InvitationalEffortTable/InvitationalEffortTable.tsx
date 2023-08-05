import { HiChevronDown, HiChevronUp, HiChevronUpDown } from 'react-icons/hi2';
import React, { useState } from 'react';
import useEfforts from '../../hooks/efforts';
import {
  InvitationalAthlete,
  InvitationalEffort,
  Invitational,
  ClubEfforts,
  LeaderboardInvitationalEffort,
  InvitationalEffortGroup,
} from '../../types';
import { ActionIcon, Anchor, Box, Divider, Flex, Select, Stack, Table, Text, Tooltip } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { displayFilterMode, FilterMode, useFilterMode } from './FilterMode';

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
        console.log('aEffort:', aEffort);

        if (!aEffort && !bEffort) {
          return 0;
        } else if (aEffort && !bEffort) {
          return -1;
        } else if (!aEffort && bEffort) {
          return 1;
        } else {
          return aEffort.effort.duration - bEffort.effort.duration;
        }
      });
  }
};

const getIcon = (sortBy: SortBy, type: 'rank' | 'name') =>
  sortBy.type === type ? sortBy.inverted ? <HiChevronUp /> : <HiChevronDown /> : <HiChevronUpDown />;

const EffortTooltipLabel = (props: {
  effort: LeaderboardInvitationalEffort;
  allEfforts: InvitationalEffort[];
  distance: number;
}) => {
  const { effort, allEfforts, distance } = props;
  const effortsReversed = [...allEfforts].reverse();
  const extraInfo = (
    <>
      <Divider style={{ width: '100%' }} />
      {effortsReversed.map((curEffort, i) => (
        <Text key={curEffort.activity + i}>
          {curEffort.year}: {getDurationInMMSS(curEffort)}
          {distance && ` (${calculatePace(curEffort.duration, distance)})`}
        </Text>
      ))}
    </>
  );
  return (
    <Stack spacing="xs" align="flex-start">
      <Text>
        {effort.effort.year === undefined ? '' : `${effort.effort.year}: `}
        Rank: {effort.effort.localRank} – Points: {effort.points}
      </Text>
      {extraInfo}
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

const getRelevantInvitationals = (efforts: ClubEfforts, filterMode: FilterMode) => {
  switch (filterMode.type) {
    case 'alltime':
      return efforts.invitationalEfforts;
    case 'year':
      return efforts.invitationalEfforts.filter(effort => effort.invitational.year === filterMode.year);
    case 'race':
      return efforts.invitationalEfforts.filter(
        effort => effort.invitational.name === filterMode.name && effort.efforts.length > 0
      );
  }
};

const calculateLeaderboard = (invitationalEfforts: InvitationalEffortGroup[], filterMode: FilterMode) => {
  const athletes: { [profile: string]: InvitationalAthlete } = {};
  let filteredEfforts: InvitationalEffortGroup[];
  switch (filterMode.type) {
    case 'year':
      filteredEfforts = invitationalEfforts;
      break;
    case 'race':
      filteredEfforts = invitationalEfforts;
      break;
    case 'alltime':
      const allEfforts = groupAthleteEffortsByEvent(invitationalEfforts);

      filteredEfforts = invitationalEfforts.flatMap(event => {
        const res = allEfforts.get(event.invitational.name);
        if (res === undefined) {
          console.error(`${event.invitational.name} missing. Should not happen.`);
          return [];
        }
        const onlyBestEfforts = Array.from(res.values()).map(athleteEffort =>
          athleteEffort.reduce((prev, current) => (prev.duration < current.duration ? prev : current))
        );
        return {
          invitational: event.invitational,
          efforts: onlyBestEfforts,
        };
      });
      filteredEfforts = dedupInvitationalsAlltime(filteredEfforts);
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
    const isMajor = invitationalEffort.invitational.type === 'major';

    return invitationalEffort.efforts.map(effort => {
      const rank = effortRankMap[effort.duration];
      const scoreByRank = calculateScoreByRank(rank);
      const score = isMajor ? scoreByRank : Math.max(scoreByRank / 2, 1);

      return (athletes[effort.profile].efforts[invitationalEffort.invitational.id] = {
        points: score,
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

const InvitationalTooltipLabel = (props: { invitational: Invitational }) => {
  const { invitational } = props;
  const distanceWith2Decimals = (invitational.distance / 1000).toFixed(2);
  return (
    <>
      {invitational.description}
      <Divider style={{ width: '100%' }} />
      {distanceWith2Decimals} km
    </>
  );
};

type EventAthleteEffortsMap = Map<string, Map<string, InvitationalEffort[]>>;

const groupAthleteEffortsByEvent = (efforts: InvitationalEffortGroup[]): EventAthleteEffortsMap => {
  const bestEffortsForPersonEvent = new Map<string, Map<string, InvitationalEffort[]>>();

  //populate bestEffortsForPersonEvent
  efforts.forEach(inviEfforts => {
    const inviName = inviEfforts.invitational.name;
    const bestEffortsForEvent = bestEffortsForPersonEvent.get(inviName);
    let eventMap: Map<string, InvitationalEffort[]>;
    if (bestEffortsForEvent === undefined) {
      eventMap = new Map();
      bestEffortsForPersonEvent.set(inviName, eventMap);
    } else {
      eventMap = bestEffortsForEvent;
    }

    inviEfforts.efforts.forEach(effort => {
      const currentPersonBestEfforts = eventMap.get(effort.name);
      if (currentPersonBestEfforts === undefined) {
        eventMap.set(effort.name, [{ ...effort, year: inviEfforts.invitational.year }]);
      } else {
        eventMap.set(effort.name, [...currentPersonBestEfforts, { ...effort, year: inviEfforts.invitational.year }]);
      }
    });
  });

  return bestEffortsForPersonEvent;
};

type TitleType = 'initials' | 'short' | 'full';

const dedupInvitationals = (invitationals: Invitational[], filterMode: FilterMode) => {
  if (filterMode.type !== 'alltime') return invitationals;
  const uniqueInvitationalNames = new Map<string, Invitational>();
  invitationals.forEach(inv => uniqueInvitationalNames.set(inv.name, inv));
  return Array.from(uniqueInvitationalNames.values());
};

const dedupInvitationalsAlltime = (invitationals: InvitationalEffortGroup[]) => {
  const uniqueInvitationalNames = new Map<string, InvitationalEffortGroup>();
  invitationals.forEach(inv => uniqueInvitationalNames.set(inv.invitational.name, inv));
  return Array.from(uniqueInvitationalNames.values());
};

export const InvitationalEffortTable = () => {
  const [leaderboard, setLeaderboard] = React.useState([] as InvitationalAthlete[]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = React.useState(new Map() as EventAthleteEffortsMap);
  const [invitationals, setInvitationals] = React.useState([] as Invitational[]);

  const { width } = useViewportSize();
  const titleType: TitleType = width < 700 ? 'initials' : width < 1200 ? 'short' : 'full';

  const { filterMode, setFilterModeFromSelector, setFilterModeFromQuery } = useFilterMode();

  const { efforts } = useEfforts();

  React.useEffect(() => {
    setFilterModeFromQuery();
  }, []);

  React.useEffect(() => {
    if (efforts) {
      const relevantInvitationals = getRelevantInvitationals(efforts, filterMode);
      const leaderboard = calculateLeaderboard(relevantInvitationals, filterMode);
      setLeaderboard(leaderboard);
      setAllTimeLeaderboard(groupAthleteEffortsByEvent(efforts.invitationalEfforts));

      const invitationals = dedupInvitationals(
        relevantInvitationals.map(effort => effort.invitational),
        filterMode
      );

      setInvitationals(invitationals);
    }
  }, [efforts, filterMode]);

  const [sortBy, setSortBy] = useState({ type: 'rank' } as SortBy);

  const sortedLeaderboard = sortBy.inverted
    ? sortLeaderboard(leaderboard, sortBy).reverse()
    : sortLeaderboard(leaderboard, sortBy);

  const colorStrength = 6;
  const medalColors = ['yellow', 'gray', 'orange'];

  const racesSelectData = dedupInvitationalsAlltime(efforts?.invitationalEfforts || []).map(i => ({
    value: i.invitational.name,
    label: i.invitational.name,
    group: 'Races',
  }));

  return (
    <Stack>
      <Flex justify="center">
        <Box maw="500px">
          <Select
            onChange={value => {
              setFilterModeFromSelector(
                value,
                racesSelectData.map(s => s.value)
              );
            }}
            value={displayFilterMode(filterMode)}
            data={[
              { value: '2023', label: '2023', group: 'Year' },
              { value: '2022', label: '2022', group: 'Year' },
              { value: '2021', label: '2021', group: 'Year' },
              { value: '2020', label: '2020', group: 'Year' },
              { value: 'alltime', label: 'All-time', group: 'Other' },
              ...racesSelectData,
            ]}
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
                    <Tooltip
                      label={<InvitationalTooltipLabel invitational={invitational} />}
                      position="bottom"
                      fw="normal"
                    >
                      <Text style={{ textTransform: 'uppercase' }} fz="xs" fw="bolder">
                        <InvitationalTitle invitational={invitational} titleType={titleType} filterMode={filterMode} />
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
                        <Text sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {getDisplayedName(athlete, efforts?.invitationalEfforts)}
                        </Text>
                      </Tooltip>
                    </Anchor>
                  </td>
                  {invitationals.map((invitational, i) => {
                    const invitationalEffort = athlete.efforts[invitational.id];
                    if (!invitationalEffort) {
                      /* Display '–' for no recorded time */
                      return <td key={athlete.profile + '-seg-' + i}>-</td>;
                    }

                    const efforts = allTimeLeaderboard.get(invitational.name)?.get(athlete.name) || [];

                    const prTag = getPrTag(filterMode, efforts, invitationalEffort.effort.duration);

                    const invitationalRank = invitationalEffort.effort.localRank;
                    const invitationalRankColor =
                      invitationalRank && invitationalRank <= 3
                        ? `${medalColors[invitationalRank - 1]}.${colorStrength}`
                        : undefined;

                    return (
                      <td key={athlete.profile + '-seg-' + i}>
                        {invitationalEffort.effort.activity ? (
                          <Anchor href={`http://strava.com${invitationalEffort.effort.activity}`}>
                            <Tooltip
                              label={
                                <EffortTooltipLabel
                                  effort={invitationalEffort}
                                  allEfforts={efforts}
                                  distance={invitational.distance}
                                />
                              }
                              position="left"
                            >
                              <Text color={invitationalRankColor}>
                                {getDurationInMMSS(invitationalEffort.effort) + prTag}
                              </Text>
                            </Tooltip>
                          </Anchor>
                        ) : (
                          <Tooltip
                            label={
                              <EffortTooltipLabel
                                effort={invitationalEffort}
                                allEfforts={efforts}
                                distance={invitational.distance}
                              />
                            }
                            position="left"
                          >
                            <Text color={invitationalRankColor}>
                              {getDurationInMMSS(invitationalEffort.effort) + prTag}
                            </Text>
                          </Tooltip>
                        )}
                      </td>
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

const getPrTag = (filterMode: FilterMode, efforts: InvitationalEffort[], duration: number) => {
  if (filterMode.type === 'alltime') return '';
  if (efforts.length == 1) return '⁺';
  if (Math.min(...efforts.map(x => x.duration)) === duration) return '*';
  return '';
};

const InvitationalTitle = (props: { invitational: Invitational; titleType: TitleType; filterMode: FilterMode }) => {
  const { invitational, titleType, filterMode } = props;

  const title = (() => {
    if (filterMode.type === 'race') return `${invitational.year}`;
    else if (titleType === 'initials') return invitational.initials;
    else if (titleType === 'short') return invitational.shortName;
    else return invitational.name;
  })();

  if (!invitational.segment) return <>{title} </>;
  return <Anchor href={`http://www.strava.com${invitational.segment}`}>{title}</Anchor>;
};

const getDisplayedName = (athlete: InvitationalAthlete, allEfforts: InvitationalEffortGroup[] | undefined) => {
  const allNames = (allEfforts || []).flatMap(effortGroup => effortGroup.efforts.map(effort => effort.name));
  const { name } = athlete;
  const splitted = name.split(' ');
  const firstName = splitted[0];
  if (allNames.some(otherAthleteName => otherAthleteName.split(' ')[0] === firstName && name !== otherAthleteName))
    return `${firstName} ${splitted[splitted.length - 1]?.[0]}.`;
  return firstName;
};

const getDurationInMMSS = (effort: InvitationalEffort) => {
  const minutes = Math.floor(effort.duration / 60);
  const seconds = Math.floor(effort.duration % 60);
  const secondsPadding = seconds < 10 ? '0' : '';
  return `${minutes}:${secondsPadding}${seconds}`;
};

const calculatePace = (durationInSec: number, distanceInMeters: number) => {
  const secPerKM = (durationInSec * 1000) / distanceInMeters;
  const minutes = Math.floor(secPerKM / 60);
  const seconds = Math.floor(secPerKM % 60);
  const secondsPadding = seconds < 10 ? '0' : '';
  return `${minutes}:${secondsPadding}${seconds}/km`;
};
