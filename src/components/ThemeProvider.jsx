import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from '../theme';

export function ThemeProvider({ children }) {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      {children}
    </ChakraProvider>
  );
}
