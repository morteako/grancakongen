import { SmallAddIcon, SmallCloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import * as React from 'react';

interface TeamMember {
  name: string;
  mail: string;
}

interface TeamMemberEntryProps {
  index: number;
  onChange: (teamMember: TeamMember) => void;
  member: TeamMember;
  remove: () => void;
  memberCount: number;
}

const placeholderNames = ['Ola Nordmann', 'Kari Nordmann', 'Ask Nordmann', 'Embla Nordmann'];
const getPlaceholderMail = (name: string) => `${name.toLowerCase().replace(' ', '.')}@invitationals.no`;
const TeamMemberEntry = ({ index, onChange, member, remove, memberCount }: TeamMemberEntryProps) => {
  const name = placeholderNames[index + 1];
  return (
    <Flex marginBottom="2">
      <Input
        marginRight="1"
        placeholder={name}
        isRequired
        value={member.name}
        onChange={e => {
          //   setName(e.target.value);
          onChange({ ...member, name: e.target.value });
        }}
      />
      <Input
        marginLeft="1"
        placeholder={getPlaceholderMail(name)}
        isRequired
        value={member.mail}
        onChange={e => {
          //   setMail(e.target.value);
          onChange({ ...member, mail: e.target.value });
        }}
      />
      {memberCount > 1 ? (
        <IconButton
          marginLeft="1"
          p="0"
          variant="ghost"
          aria-label="Toggle password visibility"
          icon={<SmallCloseIcon />}
          onClick={remove}
        >
          Remove
        </IconButton>
      ) : null}
    </Flex>
  );
};

interface Props {}
const Signup = ({}: Props) => {
  const [name, setName] = React.useState('');
  const [nameIsTouched, setNameIsTouched] = React.useState(false);
  const [mail, setMail] = React.useState('');
  const [mailIsTouched, setMailIsTouched] = React.useState(false);
  const [timeEstimate, setTimeEstimate] = React.useState('');
  const [timeEstimateIsTouched, setTimeEstimateIsTouched] = React.useState(false);
  const [isTeam, setIsTeam] = React.useState(false);
  const [teamMembers, setTeamMembers] = React.useState([{ name: '', mail: '' }] as TeamMember[]);

  const duDere = isTeam ? 'dere' : 'du';
  return (
    <Stack>
      <FormControl isInvalid={nameIsTouched && !name}>
        <FormLabel>Navn</FormLabel>
        <Input
          placeholder={placeholderNames[0]}
          isRequired
          value={name}
          onChange={e => {
            setName(e.target.value);
          }}
          onBlur={() => setNameIsTouched(true)}
        />
        <FormErrorMessage>Vi trenger navnet ditt for å vite hvem det er som bestiller.</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={mailIsTouched && !mail}>
        <FormLabel>E-post</FormLabel>
        <Input
          placeholder={getPlaceholderMail(placeholderNames[0])}
          isRequired
          value={mail}
          onChange={e => {
            setMail(e.target.value);
          }}
          onBlur={() => setMailIsTouched(true)}
        />
        <FormErrorMessage>Vi E-posten din for å kunne kontakte deg om det skulle trengs.</FormErrorMessage>
      </FormControl>
      <FormControl>
        <FormLabel>Stiller du alene eller som et lag?</FormLabel>

        <RadioGroup onChange={e => (e === 'true' ? setIsTeam(true) : setIsTeam(false))} value={`${isTeam}`}>
          <Stack direction="row">
            <Radio value="false">Jeg stiller alene</Radio>
            <Radio value="true">Jeg stiller som en del av et lag</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>

      {isTeam ? (
        <FormControl>
          <FormLabel>Lagmedlemmer</FormLabel>
          {teamMembers.map((member, i) => (
            <TeamMemberEntry
              index={i}
              onChange={(teamMemberEntry: TeamMember) => {
                const copy = [...teamMembers];
                copy[i] = teamMemberEntry;
                setTeamMembers(copy);
              }}
              member={member}
              remove={() => setTeamMembers([...teamMembers].filter((_m, idx) => idx !== i))}
              memberCount={teamMembers.length}
            />
          ))}
          {/* <FormErrorMessage>Vi E-posten din for å kunne kontakte deg om det skulle trengs.</FormErrorMessage> */}
          {teamMembers.length < 3 ? (
            <Button
              leftIcon={<SmallAddIcon />}
              colorScheme="gray"
              variant="solid"
              onClick={() => {
                setTeamMembers([...teamMembers, { name: '', mail: '' }]);
              }}
            >
              Legg til medlem
            </Button>
          ) : null}
        </FormControl>
      ) : null}
      <FormControl isInvalid={timeEstimateIsTouched && !timeEstimate}>
        <FormLabel>Hvor lang tid regner {duDere} med å bruke?</FormLabel>
        <Input
          placeholder="ca 10 min"
          isRequired
          value={timeEstimate}
          onChange={e => {
            setTimeEstimate(e.target.value);
          }}
          onBlur={() => setTimeEstimateIsTouched(true)}
        />
        <FormErrorMessage>Vi trenger å vite ca hvor lang tid {duDere} regner med å bruke.</FormErrorMessage>
        <FormHelperText>
          Her trenger {duDere} bare å komme med et veldig røft estimat sånn at vi kan sette sammen heat.
        </FormHelperText>
      </FormControl>
    </Stack>
  );
};

export default Signup;
