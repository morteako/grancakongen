import { Box, Center, Grid, Loader, Stack, Title, Text, List } from '@mantine/core';
import useSignups from '../../hooks/signups';

const LoggedInAdmin = () => {
  const { signups } = useSignups('beermile');

  if (!signups) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }
  return (
    <>
      <Grid columns={4}>
        <Grid.Col span={1} />
        <Grid.Col span={2}>
          <Stack>
            <Title>BEER MILE 2021</Title>
            {signups.map((signup, i) => (
              <Box p="sm" key={i} bg={'dark'}>
                <Text>{signup.name}</Text>
                <Text>{signup.mail}</Text>
                <Text>Estimate: {signup.timeEstimate}</Text>
                {signup.team ? (
                  <>
                    <Text fw="bold">Teamname: {signup.team.teamName}</Text>
                    <List>
                      {signup.team.teamMembers.map((member, j) => (
                        <List.Item key={j}>
                          <Text>
                            {member.name} ({member.mail})
                          </Text>
                        </List.Item>
                      ))}
                    </List>
                  </>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Grid.Col>
        <Grid.Col span={1} />
      </Grid>
    </>
  );
};
export default LoggedInAdmin;
