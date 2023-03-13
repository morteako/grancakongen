import { Button, Center, Stack, TextInput, Text } from '@mantine/core';
import * as React from 'react';
import * as api from '../../api';
import LoggedInAdmin from './LoggedInAdmin';

const Admin = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isError, setIsError] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const signIn = () => {
    api
      .adminLogin({ username, password })
      .then(res => {
        if (res) {
          localStorage.setItem('token', '' + res);
          setIsLoggedIn(true);
        }
      })
      .catch(e => setIsError(true));
  };

  React.useEffect(() => {
    api
      .authenticateToken()
      .then(() => setIsLoggedIn(true))
      .catch(e => setIsLoggedIn(false));
  }, []);
  return !isLoggedIn ? (
    <Center>
      <Stack>
        <TextInput
          placeholder="Username"
          value={username}
          onChange={e => {
            setUsername(e.target.value);
            setIsError(false);
          }}
        />
        <TextInput
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setIsError(false);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              signIn();
            }
          }}
        />
        <Button disabled={!username || !password} onClick={signIn}>
          Sign in
        </Button>
        {isError ? <Text>Noe gikk galt</Text> : null}
      </Stack>
    </Center>
  ) : (
    <LoggedInAdmin />
  );
};
export default Admin;
