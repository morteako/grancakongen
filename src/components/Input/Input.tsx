import * as React from 'react';
import { forwardRef, Input as ChakraInput, InputProps, useColorModeValue } from '@chakra-ui/react';

const Input = forwardRef<InputProps, 'input'>((props, ref) => {
  const bgColor = useColorModeValue('gray.100', 'gray.900');

  return <ChakraInput bg={bgColor} ref={ref} {...props} />;
});

export default Input;
