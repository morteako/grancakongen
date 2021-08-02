import * as React from 'react';
import { chakra, ImageProps, forwardRef, useColorModeValue } from '@chakra-ui/react';
import logoBlack from './logo_black.svg';
import logoWhite from './logo_white.svg';

interface Props {
  variant?: 'black' | 'white';
}

export const Logo = forwardRef<ImageProps & Props, 'img'>((props, ref) => {
  const themeLogo = useColorModeValue(logoBlack, logoWhite);

  const logo = !props.variant
    ? themeLogo
    : props.variant === 'black'
    ? logoBlack
    : props.variant === 'white'
    ? logoWhite
    : themeLogo;
  return <chakra.img src={logo} ref={ref} {...props} />;
});
