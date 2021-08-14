import { Center, Heading, Link, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import * as React from 'react';
import Signup from '../Signup/Signup';

const Schous2021 = () => {
  const stackWidth = useBreakpointValue({ base: '100%', md: '75%', xl: '50%' });
  const stackPadding = useBreakpointValue({ base: '3', md: '0' });

  return (
    <Center>
      <Stack w={stackWidth} paddingLeft={stackPadding} paddingRight={stackPadding} marginBottom="20">
        <Stack textAlign="left">
          <Heading as="h1" size="2xl">
            BEER MILE 2021
          </Heading>
          <Text fontWeight="bold">Lørdag 11. september 2021 kl 15:00</Text>
          <Heading as="h2">Regler</Heading>
          <Text>
            Beer mile går ut på at man skal løpe en engelsk mil (1609 meter) og drikke fire øl så fort som mulig. En
            runde består av at man drikker en enhet, for så å løpe 400m; dette skal gjøres fire ganger. Det vil være
            oppført en drikkesone på 9 meter. Ølen skal åpnes og drikkes innenfor denne sonen hver runde. Hjelpemidler
            som sugerør eller kopper er ikke tillatt.
          </Text>
          <Heading as="h3" size="md" pl="2">
            Drikke
          </Heading>
          <Text pl="5">
            Offisielle regler tilsier at hver enhet må være 355ml øl og ha en alkoholprosent på minst 5%. I og med at vi
            er i Norge osv., tillater vi øl på 330ml med minst 4.5% alkohol. Vær obs på at du ikke kan registrere
            resultatet som et offisielt resultat med mindre du følger de offisielle reglene.
          </Text>
          <Text pl="5">
            Dersom du av en eller annen grunn ikke kan drikke øl, tillater vi deltakelse med annen drikke. Resultatet
            vil ikke telle i den offisielle{' '}
            <Link href="/invitationals" color="strava.500">
              Invitational-scoringen
            </Link>
            , og resultatet vil ha en merknad.
          </Text>
          <Heading as="h3" size="md" pl="2">
            Oppkast
          </Heading>
          <Text pl="5">
            Oppkast er et kjent fenomen innen beer mile. Vanligvis ville oppkast ført til diskvalifikasjon, men i og med
            at dette i hovedsak er for moroskyld, fører oppkast kun til en ekstrarunde (kun løp) for hver runde det
            kastes opp i, og en merknad i resultatlisten.
          </Text>
          <Heading as="h3" size="md" pl="2">
            Deltakelse som lag
          </Heading>
          <Text pl="5">
            Vi legger opp til et lagheat ala stafett etter de ordinære heatene. Dette er en fin mulighet til å få
            deltatt dersom du enten ikke er megagira på å styrte fire øl på kort tid, eller om du er usikker på om beina
            holder i 1609 meter.
          </Text>
          <Text pl="5">
            Vi anbefaler å enten være to eller fire per lag, sånn at alle deltakere får løpt og drukket like mye.
          </Text>
          <Text pl="5">
            I og med at lagheatet arrangeres etter de individuelle heatene, er det altså mulig å delta både individuelt
            og med et lag.
          </Text>
          <Heading>Løypekart</Heading>
          <Text>
            Løypen er ennå ikke avklart, men det vil bli et sted i Oslo. Vi skulle gjerne ha løpt på bane for optimal
            løype, men vi tviler på at vi klarer å arrangere det på en forsvarlig måte. Vi har alternativer til
            vurdering, men vi tar gjerne mot flere forslag!
          </Text>
          <Heading>Påmelding</Heading>
          <Text>
            Vi ønsker å sette sammen heat, og vi skal muligens få ordnet noen startnummer. Meld deg på så tidlig som
            mulig, og si fra om du av en eller annen grunn ikke lenger har mulighet til å stille!
          </Text>
        </Stack>
        <Signup />
      </Stack>
    </Center>
  );
};

export default Schous2021;
