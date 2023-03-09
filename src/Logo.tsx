import { Image } from '@mantine/core';
import * as React from 'react';
import logoBlack from './logo_black.svg';
import logoWhite from './logo_white.svg';

interface Props {
  variant?: 'black' | 'white';
}

export const Logo: React.FC<Props> = props => {
  const themeLogo = logoWhite;

  const logo = !props.variant
    ? themeLogo
    : props.variant === 'black'
    ? logoBlack
    : props.variant === 'white'
    ? logoWhite
    : themeLogo;
  return <Image src={logo} {...props} />;
};
