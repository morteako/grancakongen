import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import Schous2021 from './Schous2021/Schous2021';

interface RouteParams {
  event: string;
}

interface Props {}
const Event = ({}: Props) => {
  const { event } = useParams<RouteParams>();
  switch (event) {
    case 'schous2021':
      return <Schous2021 />;
    default:
      return <Text>Event not found.</Text>;
  }
};

export default Event;
