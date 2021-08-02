import * as React from 'react';
import { chakra, ImageProps, forwardRef, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import bgNormal from './bg_black.svg';
import bgInverted from './bg_inverted.svg';

interface Props {
  variant?: 'normal' | 'inverted';
}

export const BG = forwardRef<ImageProps & Props, 'img'>((props, ref) => {
  const themeBG = useColorModeValue(bgNormal, bgNormal);
  const opacity = useColorModeValue('0.1', '0.2');

  const size = useBreakpointValue({ base: '200%', lg: '100%' });

  const bg = !props.variant
    ? themeBG
    : props.variant === 'normal'
    ? bgNormal
    : props.variant === 'inverted'
    ? bgInverted
    : themeBG;
  return (
    <chakra.img
      minWidth={size}
      position="absolute"
      bottom="0"
      right="0"
      opacity={opacity}
      zIndex="-20"
      src={bg}
      ref={ref}
      {...props}
    />
  );
});
