import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
  },

  components: {
    Input: {
      defaultProps: { variant: 'outline', colorScheme: 'strava' },
    },
    Button: {
      baseStyle: {
        _focus: {
          boxShadow: '0 0 0 2px #ff9955',
        },
      },
    },
    Link: {
      baseStyle: {
        _focus: {
          boxShadow: '0 0 0 2px #ff9955',
        },
      },
    },
    Radio: {
      defaultProps: {
        colorScheme: 'strava',
      },
    },
  },

  colors: {
    gray: {
      100: '#fafafa',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      700: '#424242',
      800: '#212121',
      // 900: '#101010',
      900: '#1a1a1a',
    },
    blue: {
      100: '#ffddc6',
      // 200: '#ffbb8e',
      200: '#ff9955',

      300: '#ff8839',
      400: '#ff8839',
      500: '#ff771c',
      600: '#ff6600',
      700: '#df5900',
      800: '#be4d00',
      900: '#9e4000',
    },
    strava: {
      100: '#ffddc6',
      // 200: '#ffbb8e',
      200: '#ff9955',

      300: '#ff8839',
      400: '#ff8839',
      500: '#ff771c',
      600: '#ff6600',
      700: '#df5900',
      800: '#be4d00',
      900: '#9e4000',
    },
  },
});

export default theme;
