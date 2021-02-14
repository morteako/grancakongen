import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  MinusIcon,
  UpDownIcon,
} from "@chakra-ui/icons";
import {
  Button,
  Flex,
  IconButton,
  Link,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Athlete, Segment } from "../../types";

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

export const EffortTable = ({ leaderboard, segments }: Props) => {
  console.log("leaderboard:", leaderboard);
  console.log("segments:", segments);

  const [sortBy, setSortBy] = useState({ type: "rank" } as SortBy);

  const sortedLeaderboard = sortBy.inverted
    ? sortLeaderboard(leaderboard, sortBy).reverse()
    : sortLeaderboard(leaderboard, sortBy);

  const colorStrength = 400;
  const medalColors = ["yellow", "gray", "orange"];
  return (
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
              Name{" "}
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
            <Th key={segment.id}>
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
                {athlete.name}
              </Link>
            </Td>
            {segments.map((segment) => {
              const segmentEffort = athlete.efforts[segment.id];
              const segmentRank = segmentEffort
                ? segmentEffort.effort.localRank
                : null;
              return segmentEffort ? (
                <Td
                  key={segment.id + athlete.profile}
                  color={
                    segmentRank && segmentRank <= 3
                      ? `${medalColors[segmentRank - 1]}.${colorStrength}`
                      : undefined
                  }
                >
                  <Link
                    href={`http://strava.com${segmentEffort.effort.effort}`}
                  >
                    {segmentEffort.effort.duration}
                  </Link>
                </Td>
              ) : (
                <Td>-</Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
