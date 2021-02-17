import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import * as React from "react";
import { Link } from "react-router-dom";

interface NavBarItemProps {
  path: string;
  activePath: string;
  title: string;
}
const NavBarItem = ({ path, activePath, title }: NavBarItemProps) => {
  const isActive = activePath === path;
  const nonActiveColor = useColorModeValue("darkgray", "gray");
  const activeColor = "#fc5200";
  const color = isActive ? activeColor : nonActiveColor;

  return (
    <Box borderBottom={`2px solid ${color}`} flex="1">
      <Link to={path}>
        <Text color={color} width="100%">
          {title}
        </Text>
      </Link>
    </Box>
  );
};

interface NavBarProps {
  activePath: string;
}
export const NavBar = ({ activePath }: NavBarProps) => (
  <Flex paddingBottom="5">
    <NavBarItem
      path="/invitationals"
      activePath={activePath}
      title="Invitationals"
    />
    <NavBarItem path="/segments" activePath={activePath} title="Segments" />
  </Flex>
);
