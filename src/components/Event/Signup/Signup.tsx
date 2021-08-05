import { ArrowUpIcon, SmallAddIcon, SmallCloseIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  useToast,
} from '@chakra-ui/react';
import * as React from 'react';
import * as api from '../../../api';
import Input from '../../Input/Input';

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
  onBlur: () => void;
}

const placeholderNames = ['Ola Nordmann', 'Kari Nordmann', 'Ask Nordmann', 'Embla Nordmann'];
const getPlaceholderMail = (name: string) => `${name.toLowerCase().replace(' ', '.')}@invitationals.no`;
const TeamMemberEntry = ({ index, onChange, member, remove, memberCount, onBlur }: TeamMemberEntryProps) => {
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
        onBlur={() => onBlur()}
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
        onBlur={() => onBlur()}
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

const Signup = () => {
  const [name, setName] = React.useState('');
  const [nameIsTouched, setNameIsTouched] = React.useState(false);
  const [mail, setMail] = React.useState('');
  const [mailIsTouched, setMailIsTouched] = React.useState(false);
  const [timeEstimate, setTimeEstimate] = React.useState('');
  const [timeEstimateIsTouched, setTimeEstimateIsTouched] = React.useState(false);
  const [isTeam, setIsTeam] = React.useState(false);
  const [teamName, setTeamName] = React.useState('');
  const [teamNameIsTouched, setTeamNameIsTouched] = React.useState(false);
  const [teamMembers, setTeamMembers] = React.useState([{ name: '', mail: '' }] as TeamMember[]);
  const [teamMembersAreTouched, setTeamMembersAreTouched] = React.useState(false);
  const [dataAgreementAccepted, setDataAgreementAccepted] = React.useState(false);
  const duDere = isTeam ? 'dere' : 'du';
  const degDere = isTeam ? 'dere' : 'deg';

  const toast = useToast();

  const teamMembersAreValid = () => teamMembers.every(({ name, mail }) => name && mail) || false;

  const resetForm = () => {
    setName('');
    setNameIsTouched(false);
    setMail('');
    setMailIsTouched(false);
    setTimeEstimate('');
    setTimeEstimateIsTouched(false);
    setIsTeam(false);
    setTeamName('');
    setTeamNameIsTouched(false);
    setTeamMembers([]);
    setTeamMembersAreTouched(false);
    setDataAgreementAccepted(false);
  };

  const submit = () => {
    const team = isTeam ? { team: { teamName, teamMembers } } : undefined;

    const data = { name, mail, timeEstimate, ...team };

    api
      .signupBeermile(data)
      .then(e => {
        toast({
          title: 'Påmelding registrert!',
          description: `Vi gleder oss til å se ${degDere} 11. september! 🍻`,
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
        resetForm();
      })
      .catch(e =>
        toast({
          title: 'Noe gikk galt',
          description: `Noe gikk galt under påmeldingen. Prøv igjen senere.`,
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      );
  };

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
        <FormErrorMessage>Vi trenger navnet ditt.</FormErrorMessage>
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
        <FormErrorMessage>Vi trenger e-posten din for å kunne kontakte deg om det skulle trengs.</FormErrorMessage>
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
        <>
          <FormControl isInvalid={teamNameIsTouched && !teamName}>
            <FormLabel>Lagnavn</FormLabel>
            <Input
              placeholder={'Megachuggers'}
              isRequired
              value={teamName}
              onChange={e => {
                setTeamName(e.target.value);
              }}
              onBlur={() => setTeamNameIsTouched(true)}
            />
            <FormErrorMessage>Dere må gi laget deres et navn.</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={teamMembersAreTouched && !teamMembersAreValid()}>
            <FormLabel>Lagkamerater</FormLabel>
            {teamMembers.map((member, i) => (
              <TeamMemberEntry
                key={i}
                index={i}
                onChange={(teamMemberEntry: TeamMember) => {
                  const copy = [...teamMembers];
                  copy[i] = teamMemberEntry;
                  setTeamMembers(copy);
                  setTeamMembersAreTouched(false);
                }}
                member={member}
                remove={() => {
                  setTeamMembers([...teamMembers].filter((_m, idx) => idx !== i));
                  setTeamMembersAreTouched(false);
                }}
                onBlur={() => {
                  setTeamMembersAreTouched(true);
                }}
                memberCount={teamMembers.length}
              />
            ))}
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
            <FormHelperText>
              Legg inn lagkameratene dine. Vi anbefaler å være lag av enten 2 eller 4 personer.
            </FormHelperText>
            <FormErrorMessage>Vi trenger navn og eposten til alle lagkameratene dine.</FormErrorMessage>
          </FormControl>
        </>
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
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="data-storage" mb="0">
          Jeg godtar at påmeldingsdataen (navn og e-post) lagres frem til og med arrangementet (11. september) og 30
          dager etter det, og at resultat med navn og eventuell stravaprofil publiseres på denne siden.
        </FormLabel>
        <Switch
          id="data-storage"
          onChange={e => setDataAgreementAccepted(e.target.checked)}
          isChecked={dataAgreementAccepted}
        />
      </FormControl>
      <FormControl>
        <Button
          type="submit"
          colorScheme="strava"
          onClick={submit}
          isDisabled={
            !(name && mail && timeEstimate && dataAgreementAccepted && ((isTeam && teamMembersAreValid()) || !isTeam))
          }
          mt="2"
          leftIcon={<ArrowUpIcon />}
        >
          Send påmelding!
        </Button>
      </FormControl>
    </Stack>
  );
};

export default Signup;
