import * as React from 'react';
import { chakra, ImageProps, forwardRef, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import bg from './bg.svg';

const BackgroundGraphics = forwardRef<ImageProps, 'img'>((props, ref) => {
  const opacity = useColorModeValue('0.1', '0.2');

  const size = useBreakpointValue({ base: '200%', lg: '100%' });
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

export default BackgroundGraphics;
