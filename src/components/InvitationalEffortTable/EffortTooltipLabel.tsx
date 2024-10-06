import { Divider, Stack, Text } from '@mantine/core';
import { InvitationalEffort, LeaderboardInvitationalEffort } from '../../types';
import { formatSecondsToMMSS, getFormattedPace } from './utils';
import { useDataMode } from '../../hooks/DataModeContext';
import React from 'react';

export const EffortTooltipLabel = (props: {
  leaderboardEffort: LeaderboardInvitationalEffort;
  allAthleteEffortsForInvitational: InvitationalEffort[];
}) => {
  const { leaderboardEffort, allAthleteEffortsForInvitational } = props;
  const effortsReversed = [...allAthleteEffortsForInvitational].reverse();
  const extraInfo = (
    <>
      <Divider style={{ width: '100%' }} />
      {effortsReversed.map((curEffort, i) => (
        <Text key={curEffort.activity + i}>
          {curEffort.invitational.year}: {formatSecondsToMMSS(curEffort.duration)}
          {curEffort.invitational.distance &&
            ` (${getFormattedPace(curEffort.duration, curEffort.invitational.distance)})`}{' '}
          {getVamString(curEffort)}
        </Text>
      ))}
      {getEstimates(leaderboardEffort.effort)}
    </>
  );
  return (
    <Stack spacing="xs" align="flex-start">
      <Text>
        {`${leaderboardEffort.effort.invitational.year}: `}
        Rank: {leaderboardEffort.effort.localRank} – Points: {leaderboardEffort.points}
      </Text>
      {extraInfo}
    </Stack>
  );
};

const getVamString = (effort: InvitationalEffort): string | null => {
  const { dataMode } = useDataMode();
  if (!dataMode || !effort.invitational.elevation) {
    return null;
  }
  const vam = (effort.invitational.elevation / effort.duration) * 3600;
  return `- ${vam.toFixed(0)} VAM`;
};

const getEstimates = (invitationalEffort: InvitationalEffort) => {
  const { dataMode } = useDataMode();
  if (!dataMode) {
    return null;
  }
  const invitational = invitationalEffort.invitational;

  const estimateInvitationals = [hillInvitationals, trackInvitationals].find(invitationalGroup =>
    invitationalGroup.some(x => x.name === invitational.name)
  );

  if (!estimateInvitationals) {
    return null;
  }

  return (
    <>
      <Divider style={{ width: '100%' }} />
      Estimates
      {estimateInvitationals
        .filter(estimateInvitationals => estimateInvitationals.name !== invitational.name)
        .map(estimateInvitationals => {
          const estimatedDuration =
            invitationalEffort.duration * Math.pow(estimateInvitationals.distance / invitational.distance, 1.08);

          return (
            <Text key={estimateInvitationals.distance + invitationalEffort.name + invitationalEffort.invitational.id}>
              {`${estimateInvitationals.name}: ${formatSecondsToMMSS(estimatedDuration)}`}
              {` (${getFormattedPace(estimatedDuration, estimateInvitationals.distance)})`}
            </Text>
          );
        })}
    </>
  );
};

const trackInvitationals = [
  {
    name: '1500m',
    distance: 1500,
  },
  {
    name: '3000m',
    distance: 3000,
  },
  {
    name: '5000m',
    distance: 5000,
  },
];

const hillInvitationals = [
  {
    name: 'Grefsenkollen opp',
    distance: 3770.75,
  },
  {
    name: 'Voksen skog',
    distance: 1969.4,
  },
  {
    name: 'Tryvann',
    distance: 5649.5,
  },
];
