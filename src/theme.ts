import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    useSystemColorMode: true,
  },

  components: {
    Input: {
      defaultProps: { focusBorderColor: 'strava.300' },
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
      // defaultProps: { focusBorderColor: 'strava.300' },

      baseStyle: {
        // backgroundColor: 'red',
        _focus: {
          boxShadow: '0 0 0 2px #ff9955',
        },
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
      900: '#101010',
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
