import { HiChevronDown, HiChevronUp, HiChevronUpDown } from 'react-icons/hi2';
import React, { useState } from 'react';
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

const sortLeaderboard = (unclonedLeaderboard: InvitationalAthlete[], sortBy: SortBy): InvitationalAthlete[] => {
  let clonedLeaderboard = [...unclonedLeaderboard];
  let sortedLeaderboard: InvitationalAthlete[];
  switch (sortBy.type) {
    case 'name':
      sortedLeaderboard = clonedLeaderboard.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'rank':
      sortedLeaderboard = clonedLeaderboard.sort((a, b) => a.rank - b.rank);
      break;
    case 'invitational':
      sortedLeaderboard = clonedLeaderboard.sort((a, b) => {
        const aEffort = a.efforts[sortBy.invitationalId];
        const bEffort = b.efforts[sortBy.invitationalId];

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
      break;
  }
  return sortBy.inverted ? sortedLeaderboard.reverse() : sortedLeaderboard;
};

const getIcon = (sortBy: SortBy, type: 'rank' | 'name') =>
  sortBy.type === type ? sortBy.inverted ? <HiChevronUp /> : <HiChevronDown /> : <HiChevronUpDown />;

const EffortTooltipLabel = (props: {
  leaderboardEffort: LeaderboardInvitationalEffort;
  allAthleteEffortsForInvitatinal: InvitationalEffort[];
}) => {
  const { leaderboardEffort, allAthleteEffortsForInvitatinal } = props;
  const effortsReversed = [...allAthleteEffortsForInvitatinal].reverse();
  const extraInfo = (
    <>
      <Divider style={{ width: '100%' }} />
      {effortsReversed.map((curEffort, i) => (
        <Text key={curEffort.activity + i}>
          {curEffort.invitational.year}: {getDurationInMMSS(curEffort)}
          {curEffort.invitational.distance &&
            ` (${calculatePace(curEffort.duration, curEffort.invitational.distance)})`}
        </Text>
      ))}
    </>
  );
  return (
    <Stack spacing="xs" align="flex-start">
      <Text>
        {`${leaderboardEffort.effort.invitational.year}: `}
        Rank: {leaderboardEffort.effort.localRank} – Points: {leaderboardEffort.points}
      </Text>
      {extraInfo}
    </Stack>
  );
};

const PointsTooltipLabel = (props: { athlete: InvitationalAthlete; invitationals: Invitational[] }) => {
  const { athlete, invitationals } = props;
  const style = { color: 'black' };
  return (
    <Stack spacing="xs" align="center">
      <Table fontSize="xs" style={style}>
        <thead>
          <tr>
            <th style={style}>Race</th>
            <th style={style}>#</th>
            <th style={style}>PTS</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(athlete.efforts).map(([invitationalId, curEffort]) => (
            <tr key={invitationalId}>
              <td>{invitationals.find(inv => inv.id === invitationalId)?.name || invitationalId}</td>
              <td>{curEffort.effort.localRank}</td>
              <td>{curEffort.points} PTS</td>
            </tr>
          ))}
        </tbody>
      </Table>
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

  const getInfoText = () => {
    if (!invitational.elevation) {
      return `${distanceWith2Decimals} km`;
    }
    const avgGradient = (100 * invitational.elevation) / invitational.distance;
    return `${distanceWith2Decimals} km - ${invitational.elevation} m - ${avgGradient.toFixed(1)} %`;
  };

  return (
    <>
      {invitational.description}
      <Divider style={{ width: '100%' }} />
      {getInfoText()}
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
        eventMap.set(effort.name, [effort]);
      } else {
        eventMap.set(effort.name, [...currentPersonBestEfforts, effort]);
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

type DataDisplay = 'duration' | 'pace' | 'behindWinner';

type Props = { allEfforts: ClubEfforts };

export const InvitationalEffortTable = (props: Props) => {
  const { allEfforts } = props;
  const [leaderboard, setLeaderboard] = React.useState([] as InvitationalAthlete[]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = React.useState(new Map() as EventAthleteEffortsMap);
  const [invitationals, setInvitationals] = React.useState([] as Invitational[]);

  const { width } = useViewportSize();
  const titleType: TitleType = width < 700 ? 'initials' : width < 1200 ? 'short' : 'full';

  const { filterMode, setFilterModeFromSelector, setFilterModeFromQuery } = useFilterMode();

  React.useEffect(() => {
    setFilterModeFromQuery();
  }, []);

  React.useEffect(() => {
    const relevantInvitationals = getRelevantInvitationals(allEfforts, filterMode);
    const leaderboard = calculateLeaderboard(relevantInvitationals, filterMode);
    setLeaderboard(leaderboard);
    setAllTimeLeaderboard(groupAthleteEffortsByEvent(allEfforts.invitationalEfforts));

    const invitationals = dedupInvitationals(
      relevantInvitationals.map(effort => effort.invitational),
      filterMode
    );

    setInvitationals(invitationals);
  }, [allEfforts, filterMode]);

  const [sortBy, setSortBy] = useState({ type: 'rank' } as SortBy);
  const [dataDisplay, setDataDisplay] = useState('duration' as DataDisplay);

  const sortedLeaderboard = sortLeaderboard(leaderboard, sortBy);

  const colorStrength = 6;
  const medalColors = ['yellow', 'gray', 'orange'];

  const racesSelectData = dedupInvitationalsAlltime(allEfforts.invitationalEfforts).map(i => ({
    value: i.invitational.name,
    label: i.invitational.name,
    group: 'Races',
  }));

  return (
    <Stack>
      <Flex justify="center" gap={'10px'}>
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
              { value: '2024', label: '2024', group: 'Year' },
              { value: '2023', label: '2023', group: 'Year' },
              { value: '2022', label: '2022', group: 'Year' },
              { value: '2021', label: '2021', group: 'Year' },
              { value: '2020', label: '2020', group: 'Year' },
              { value: 'alltime', label: 'All-time', group: 'Other' },
              ...racesSelectData,
            ]}
          />
        </Box>
        <Box maw="500px">
          <Select
            onChange={value => {
              if (value === 'duration' || value === 'pace' || value == 'behindWinner') {
                setDataDisplay(value);
              }
            }}
            value={dataDisplay}
            data={[
              { value: 'duration', label: 'Duration' },
              { value: 'pace', label: 'Pace' },
              { value: 'behindWinner', label: '% Behind winner' },
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
                      <Tooltip
                        label={<PointsTooltipLabel athlete={athlete} invitationals={invitationals} />}
                        position="right"
                      >
                        <Text display="inline" color={rankColor}>
                          {athlete.totalPoints}
                        </Text>
                      </Tooltip>
                    </Flex>
                  </td>
                  <td>
                    <Anchor href={`http://www.strava.com${athlete.profile}`}>
                      <Tooltip label={athlete.name} position="left">
                        <Text sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {getDisplayedName(athlete, allEfforts.invitationalEfforts)}
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

                    const allAthleteEffortsForInvitatinal =
                      allTimeLeaderboard.get(invitational.name)?.get(athlete.name) || [];

                    const prTag = getPrTag(
                      filterMode,
                      allAthleteEffortsForInvitatinal,
                      invitationalEffort.effort.duration
                    );

                    const invitationalRank = invitationalEffort.effort.localRank;
                    const invitationalRankColor =
                      invitationalRank && invitationalRank <= 3
                        ? `${medalColors[invitationalRank - 1]}.${colorStrength}`
                        : undefined;

                    const getMetricToDisplay: () => string = () => {
                      switch (dataDisplay) {
                        case 'duration':
                          return getDurationInMMSS(invitationalEffort.effort) + prTag;
                        case 'pace':
                          return calculatePace(invitationalEffort.effort.duration, invitational.distance, '') + prTag;
                        case 'behindWinner':
                          return calculatePctBehindWinner(invitationalEffort.effort, allEfforts);
                      }
                    };

                    return (
                      <td key={athlete.profile + '-seg-' + i}>
                        {invitationalEffort.effort.activity ? (
                          <Anchor href={`http://strava.com${invitationalEffort.effort.activity}`}>
                            <Tooltip
                              label={
                                <EffortTooltipLabel
                                  leaderboardEffort={invitationalEffort}
                                  allAthleteEffortsForInvitatinal={allAthleteEffortsForInvitatinal}
                                />
                              }
                              position="left"
                            >
                              <Text color={invitationalRankColor}>{getMetricToDisplay()}</Text>
                            </Tooltip>
                          </Anchor>
                        ) : (
                          <Tooltip
                            label={
                              <EffortTooltipLabel
                                leaderboardEffort={invitationalEffort}
                                allAthleteEffortsForInvitatinal={allAthleteEffortsForInvitatinal}
                              />
                            }
                            position="left"
                          >
                            <Text color={invitationalRankColor}>{getMetricToDisplay()}</Text>
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

const getDisplayedName = (athlete: InvitationalAthlete, allEfforts: InvitationalEffortGroup[]) => {
  const allNames = allEfforts.flatMap(effortGroup => effortGroup.efforts.map(effort => effort.name));
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

const calculatePace = (durationInSec: number, distanceInMeters: number, postfix: string = '/km') => {
  const secPerKM = (durationInSec * 1000) / distanceInMeters;
  const minutes = Math.floor(secPerKM / 60);
  const seconds = Math.floor(secPerKM % 60);
  const secondsPadding = seconds < 10 ? '0' : '';
  return `${minutes}:${secondsPadding}${seconds}${postfix}`;
};

const calculatePctBehindWinner = (currentEffort: InvitationalEffort, efforts: ClubEfforts) => {
  const effortsForInvitational =
    efforts.invitationalEfforts.find(effort => effort.invitational.id === currentEffort.invitational.id)?.efforts || [];
  const winningTime = Math.min(...effortsForInvitational.map(effort => effort.duration));
  // subtract 1 to go from f.ex 121% to 21%
  const pctBehindWinner = (currentEffort.duration / winningTime - 1) * 100;
  return `${pctBehindWinner.toFixed(1)}%`;
};
