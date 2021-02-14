import { Link, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";
import { Athlete, Segment } from "../../types";

interface Props {
  leaderboard: Athlete[];
  segments: Segment[];
}

export const EffortTable = ({ leaderboard, segments }: Props) => {
  console.log("leaderboard:", leaderboard);
  console.log("segments:", segments);

  const colorStrength = 400;
  const medalColors = ["yellow", "gray", "orange"];
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Rank</Th>
          <Th>Points</Th>
          <Th>Name</Th>
          {segments.map((segment) => (
            <Th key={segment.id}>
              <Link href={`http://www.strava.com/segments/${segment.id}`}>
                {segment.name}
              </Link>
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {leaderboard.map((athlete) => (
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
