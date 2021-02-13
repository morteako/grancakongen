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
  //   const segments = leaderboard.reduce((segments, athlete) => [...segments, ...Object.values(athlete.efforts).filter(seg => seg.))

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Rank</Th>
          <Th>Points</Th>
          <Th>Name</Th>
          {segments.map((segment) => (
            <Th>
              <Link href={`http://www.strava.com/segments/${segment.id}`}>
                {segment.name}
              </Link>
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {leaderboard.map((athlete) => (
          <Tr>
            <Td>N/A</Td>
            <Td>{athlete.totalPoints}</Td>
            <Td>
              <Link href={`http://www.strava.com${athlete.profile}`}>
                {athlete.name}
              </Link>
            </Td>
            {segments.map((segment) => {
              const effort = athlete.efforts[segment.id];
              return effort ? (
                <Td>
                  <Link href={`http://strava.com${effort.effort.effort}`}>
                    {effort.effort.duration}
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
