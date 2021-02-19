import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Link, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from '@chakra-ui/react';
import React, { useState } from 'react';
import { SegmentAthlete, SegmentEffort, Segment, ClubEfforts, LeaderboardSegmentEffort } from '../../types';

interface Props {
  clubEfforts: ClubEfforts;
}

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
      type: 'segment';
      inverted: boolean;
      segmentId: string;
    };

const sortLeaderboard = (leaderboard: SegmentAthlete[], sortBy: SortBy) => {
  switch (sortBy.type) {
    case 'name':
      return leaderboard.sort((a, b) => a.name.localeCompare(b.name));
    case 'rank':
      return leaderboard.sort((a, b) => a.rank - b.rank);
    case 'segment':
      return leaderboard.sort((a, b) => {
        const aEffort = a.efforts[sortBy.segmentId];
        const bEffort = b.efforts[sortBy.segmentId];

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

const EffortTooltip = (effort: LeaderboardSegmentEffort) => {
  return (
    <Flex flexDir="column">
      <Text>Rank: {effort.effort.localRank}</Text>
      <Text>Points: {effort.points}</Text>
      <Text>Date: {effort.effort.date}</Text>
      <Text>HR: {effort.effort.bpm}</Text>
    </Flex>
  );
};
const getSegmentIcon = (sortBy: SortBy, segmentId: string) =>
  sortBy.type === 'segment' && sortBy.segmentId === segmentId ? (
    sortBy.inverted ? (
      <ArrowUpIcon />
    ) : (
      <ArrowDownIcon />
    )
  ) : (
    <ArrowUpDownIcon />
  );

const correctDuration = (duration: string) => {
  if (duration.includes('s')) {
    const seconds = parseInt(duration.replace('s', ''));
    return '0:' + (seconds < 10 ? '0' + seconds : seconds);
  } else {
    return duration;
  }
};

const getEffortRankMap = (efforts: SegmentEffort[]) => {
  const times = efforts.map(e => {
    return correctDuration(e.duration);
  });

  return times.reduce((map, time, i) => (map[time] ? map : { ...map, [time]: i }), {} as { [time: string]: number });
};

const calculateScore = (efforts: LeaderboardSegmentEffort[]) => efforts.reduce((sum, effort) => sum + effort.points, 0);

const calculateLeaderboard = (efforts: ClubEfforts, activityType: 'run' | 'ride') => {
  const athletes: { [profile: string]: SegmentAthlete } = {};

  const filteredEfforts = efforts.segmentEfforts.filter(e => e.segment.type === activityType);

  // Set/count athletes

  filteredEfforts.map(segmentEffort => {
    return segmentEffort.efforts.map(effort => {
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

  filteredEfforts.map(segmentEffort => {
    const effortRankMap = getEffortRankMap(segmentEffort.efforts);

    return segmentEffort.efforts.map(effort => {
      const rank = effortRankMap[correctDuration(effort.duration)];
      return (athletes[effort.profile].efforts[segmentEffort.segment.id] = {
        points: numAthletes - rank,
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
export const SegmentEffortTable = ({ clubEfforts }: Props) => {
  const [leaderboard, setLeaderboard] = React.useState([] as SegmentAthlete[]);
  const [segments, setSegments] = React.useState([] as Segment[]);

  React.useEffect(() => {
    if (clubEfforts) {
      const leaderboard = calculateLeaderboard(clubEfforts, 'run');
      setLeaderboard(leaderboard);

      const segments = clubEfforts.segmentEfforts
        .map(effort => effort.segment)
        .filter(segment => segment.type === 'run');
      setSegments(segments);
    }
  }, [clubEfforts]);

  const [sortBy, setSortBy] = useState({ type: 'rank' } as SortBy);

  const sortedLeaderboard = sortBy.inverted
    ? sortLeaderboard(leaderboard, sortBy).reverse()
    : sortLeaderboard(leaderboard, sortBy);

  const colorStrength = 400;
  const medalColors = ['yellow', 'gray', 'orange'];

  return (
    <Flex flexDir="column" alignItems="center">
      <Table>
        <Thead>
          <Tr>
            <Th>
              <Flex justifyContent="space-between" alignItems="center">
                Rank
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
            <Th>Points</Th>
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
            {segments.map(segment => (
              <Th key={'segment-' + segment.id}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Link href={`http://www.strava.com/segments/${segment.id}`}>{segment.name}</Link>

                  <IconButton
                    aria-label="sort"
                    size="xs"
                    icon={getSegmentIcon(sortBy, segment.id)}
                    onClick={() =>
                      setSortBy(
                        sortBy.type === 'segment' && sortBy.segmentId === segment.id
                          ? {
                              type: 'segment',
                              inverted: !sortBy.inverted,
                              segmentId: segment.id,
                            }
                          : {
                              type: 'segment',
                              inverted: false,
                              segmentId: segment.id,
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
              <Td color={athlete.rank <= 3 ? `${medalColors[athlete.rank - 1]}.${colorStrength}` : undefined}>
                {athlete.rank}
              </Td>
              <Td>{athlete.totalPoints}</Td>
              <Td>
                <Link href={`http://www.strava.com${athlete.profile}`}>
                  <Tooltip label={athlete.name} placement="left">
                    {athlete.name.split(' ')[0]}
                  </Tooltip>
                </Link>
              </Td>
              {segments.map((segment, i) => {
                const segmentEffort = athlete.efforts[segment.id];
                const segmentRank = segmentEffort ? segmentEffort.effort.localRank : null;
                return segmentEffort ? (
                  <Td
                    key={athlete.profile + '-seg-' + i}
                    color={
                      segmentRank && segmentRank <= 3 ? `${medalColors[segmentRank - 1]}.${colorStrength}` : undefined
                    }
                  >
                    <Link href={`http://strava.com${segmentEffort.effort.effort}`}>
                      <Tooltip label={EffortTooltip(segmentEffort)} placement="left">
                        {segmentEffort.effort.duration}
                      </Tooltip>
                    </Link>
                  </Td>
                ) : (
                  <Td key={athlete.profile + '-seg-' + i}>-</Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};
