import {
  Box,
  Center,
  Grid,
  Heading,
  ListItem,
  OrderedList,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import * as React from 'react';
import useSignups from '../../hooks/signups';

const LoggedInAdmin = () => {
  const { signups } = useSignups('beermile');

  const backgroundColor = useColorModeValue('gray.100', 'gray.900');

  if (!signups) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }
  return (
    <>
      <Grid templateColumns="1fr 2fr 1fr" textAlign="left">
        <Text />
        <Stack>
          <Heading as="h1" size="xl" textAlign="left">
            BEER MILE 2021
          </Heading>
          {signups.map((signup, i) => (
            <Box mb="2" bg={backgroundColor} padding="2" key={i}>
              <Text>{signup.name}</Text>
              <Text>{signup.mail}</Text>
              <Text>Estimate: {signup.timeEstimate}</Text>
              {signup.team ? (
                <>
                  <Text fontWeight="bold">Teamname: {signup.team.teamName}</Text>
                  <OrderedList>
                    {signup.team.teamMembers.map((member, j) => (
                      <ListItem key={j}>
                        <Text>
                          {member.name} ({member.mail})
                        </Text>
                      </ListItem>
                    ))}
                  </OrderedList>
                </>
              ) : null}
            </Box>
          ))}
        </Stack>
        <Text />
      </Grid>
    </>
  );
};
export default LoggedInAdmin;
