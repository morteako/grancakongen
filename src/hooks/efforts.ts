import useSWR from 'swr';
import * as api from '../api';
import { ClubEfforts, ClubEffortsFromApi } from '../types';

const useEfforts = () => {
  // const { data, error } = useSWR('efforts', () => api.fetchEfforts().then(efforts => polishEfforts(efforts)));

  return { efforts: polishEfforts(clubEfforts), isLoading:false, isError:false };
};

export default useEfforts;

const polishEfforts = (efforts: ClubEffortsFromApi): ClubEfforts => {
  return {
    ...efforts,
    invitationalEfforts: efforts.invitationalEfforts.map(invEffort => ({
      invitational: invEffort.invitational,
      efforts: invEffort.efforts.map(effort => {
        let durationInSeconds = parseDuration(effort.duration);
        if (durationInSeconds == null) {
          console.error(`Invalid duration: ${effort.duration}`);
          return { ...effort, invitational: invEffort.invitational, duration: 1000069420 };
        }
        return { ...effort, invitational: invEffort.invitational, duration: durationInSeconds };
      }),
    })),
  };
};

const parseDuration = (duration: string) => {
  const [mins, secsWithPossibleDecimals] = duration.split(':');
  try {
    const minsInSeconds = parseInt(mins, 10);
    const seconds = parseFloat(secsWithPossibleDecimals);
    return minsInSeconds * 60 + seconds;
  } catch {
    return null;
  }
};

const clubEfforts: ClubEffortsFromApi = {
  club: {
    name: 'Team Invitationals',
    linkName: 'invitationals',
    id: '853414',
  },
  invitationalEfforts: [
    {
      invitational: {
        name: 'Soriaxx',
        shortName: 'Soria',
        initials: 'SO',
        id: 'Soria2024',
        description: 'Soria-bakken',
        segment: 'https://www.strava.com/segments/4580190',
        type: 'major',
        year: 2024,
        distance: 5600,
        elevation: 441
      },
      efforts: [
        {
          name: 'Erik Kolstad',
          profile: 'https://www.strava.com/athletes/2653611',
          activity: 'https://www.strava.com/segment_efforts/3158524864501427098',
          duration: '26:51',
        },
        {
          name: 'Sivert Schou Olsen',
          profile: 'https://www.strava.com/athletes/40209415',
          activity: 'https://www.strava.com/segment_efforts/3158411318139219646',
          duration: '24:08',
        },
        {
          name: 'Jon Eskild Mostue Sæther',
          profile: 'https://www.strava.com/athletes/16621456',
          activity: 'https://www.strava.com/segment_efforts/3158411875680118462',
          duration: '25:40',
        },
        {
          name: 'Morten Kolstad',
          profile: 'https://www.strava.com/athletes/1880565',
          activity: 'https://www.strava.com/segment_efforts/3030174483721426408',
          duration: '30:35',
        },
        {
          name: 'Sondre Lunde',
          profile: 'https://www.strava.com/athletes/52324848',
          activity: 'https://www.strava.com/segment_efforts/3158123601696854718',
          duration: '29:45',
        },

      ],
    },
    {
      invitational: {
        name: 'Serenity climb',
        shortName: 'Serenity',
        initials: 'SER',
        id: 'Serenity2024',
        description: 'Serenity climb',
        segment: 'https://www.strava.com/segments/2976759',
        type: 'major',
        year: 2024,
        distance: 8560,
        elevation:557
      },
      efforts: [
        {
          name: 'Erik Kolstad',
          profile: 'https://www.strava.com/athletes/2653611',
          activity: 'https://www.strava.com/segment_efforts/3159866418165394892',
          duration: '35:11',
        },
        {
          name: 'Sivert Schou Olsen',
          profile: 'https://www.strava.com/athletes/40209415',
          activity: 'https://www.strava.com/segment_efforts/3158411318139219646',
          duration: '24:08',
        },
        {
          name: 'Jon Eskild Mostue Sæther',
          profile: 'https://www.strava.com/athletes/16621456',
          activity: 'https://www.strava.com/segment_efforts/3158411875680118462',
          duration: '25:40',
        },
        {
          name: 'Morten Kolstad',
          profile: 'https://www.strava.com/athletes/1880565',
          activity: 'https://www.strava.com/segment_efforts/3030174483721426408',
          duration: '30:35',
        },
        {
          name: 'Sondre Lunde',
          profile: 'https://www.strava.com/athletes/52324848',
          activity: 'https://www.strava.com/segment_efforts/3158123601696854718',
          duration: '29:45',
        },

      ],
    },
  ],
};
