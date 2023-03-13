import { Box, Image, ImageProps } from '@mantine/core';
import * as React from 'react';
import bg from './bg.svg';

export const BackgroundGraphics: React.FC<ImageProps> = props => {
  /*TODO: Fix responsiveness – set 100% width for desktop */
  return (
    <Image pos="absolute" bottom="0" right="0" opacity={0.2} miw="200%" style={{ zIndex: -20 }} src={bg} {...props} />
  );
};
