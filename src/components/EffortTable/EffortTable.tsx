import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";

export const EffortTable = () => {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Rank</Th>
          <Th>Points</Th>
          <Th>Name</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>1</Td>
          <Td>20</Td>
          <Td>Sivert</Td>
        </Tr>
        <Tr>
          <Td>2</Td>
          <Td>12</Td>
          <Td>Morten</Td>
        </Tr>
      </Tbody>
    </Table>
  );
};
