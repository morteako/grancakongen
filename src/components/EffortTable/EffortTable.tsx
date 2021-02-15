import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Center,
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
import { Athlete, Effort, Segment } from "../../types";

interface Props {
  leaderboard: Athlete[];
  segments: Segment[];
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
      type: "segment";
      inverted: boolean;
      segmentId: string;
    };

const sortLeaderboard = (leaderboard: Athlete[], sortBy: SortBy) => {
  switch (sortBy.type) {
    case "name":
      return leaderboard.sort((a, b) => a.name.localeCompare(b.name));
    case "rank":
      return leaderboard.sort((a, b) => a.rank - b.rank);
    case "segment":
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

const EffortTooltip = (effort: Effort) => {
  return (
    <Flex flexDir="column">
      <Text>Rank: {effort.localRank}</Text>
      <Text>Date: {effort.date}</Text>
      <Text>HR: {effort.bpm}</Text>
    </Flex>
  );
};
const getSegmentIcon = (sortBy: SortBy, segmentId: string) =>
  sortBy.type === "segment" && sortBy.segmentId === segmentId ? (
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
  console.log("params:", params);
};

export const EffortTable = ({ leaderboard, segments }: Props) => {
  const timeFilter = useLocation().search;
  const history = useHistory();

  getTimeFilter(useLocation().search);
  console.log("timeFilter:", timeFilter);

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
            console.log("new val", e.target.value);
            history.push({ search: `filter=${e.target.value}` });
          }}
        >
          <option value="all_time">All-time</option>
          <option value="year&year=2021">2021</option>
          <option value="year&year=2020">2020</option>
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
            {segments.map((segment) => (
              <Th key={"segment-" + segment.id}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Link href={`http://www.strava.com/segments/${segment.id}`}>
                    {segment.name}
                  </Link>

                  <IconButton
                    aria-label="sort"
                    size="xs"
                    icon={getSegmentIcon(sortBy, segment.id)}
                    onClick={() =>
                      setSortBy(
                        sortBy.type === "segment" &&
                          sortBy.segmentId === segment.id
                          ? {
                              type: "segment",
                              inverted: !sortBy.inverted,
                              segmentId: segment.id,
                            }
                          : {
                              type: "segment",
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
              {segments.map((segment, i) => {
                const segmentEffort = athlete.efforts[segment.id];
                const segmentRank = segmentEffort
                  ? segmentEffort.effort.localRank
                  : null;
                return segmentEffort ? (
                  <Td
                    key={athlete.profile + "-seg-" + i}
                    color={
                      segmentRank && segmentRank <= 3
                        ? `${medalColors[segmentRank - 1]}.${colorStrength}`
                        : undefined
                    }
                  >
                    <Link
                      href={`http://strava.com${segmentEffort.effort.effort}`}
                    >
                      <Tooltip
                        label={EffortTooltip(segmentEffort.effort)}
                        placement="left"
                      >
                        {segmentEffort.effort.duration}
                      </Tooltip>
                    </Link>
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
