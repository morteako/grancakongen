import { Center, Stack, Text } from '@chakra-ui/react';
import * as React from 'react';
import useEvents from '../../hooks/events';
import SurroundLinkIfHref from '../SurroundLinkIfHref';

const Upcoming = () => {
  const { events } = useEvents();
  if (!events) return null;

  const leading0 = (n: number) => (n < 10 ? '0' + n : '' + n);
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${year}.${leading0(month)}.${leading0(day)} ${leading0(hours)}:${leading0(minutes)}`;
  };

  return (
    <Center>
      <Stack>
        {events.map((event, i) => (
          <Stack key={i} textAlign="left" spacing="1">
            <Stack direction={['column', 'row']} alignItems={['inherit', 'center']}>
              <SurroundLinkIfHref href={event.stravaLink}>
                <Text fontWeight="bold" fontSize="3xl">
                  {event.name.toUpperCase()}
                </Text>
              </SurroundLinkIfHref>
              <Text>{formatDate(new Date(event.date))}</Text>
            </Stack>
            <Text fontWeight="thin">{event.description}</Text>
          </Stack>
        ))}
      </Stack>
    </Center>
  );
};

export default Upcoming;
