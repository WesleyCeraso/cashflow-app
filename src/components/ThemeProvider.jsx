import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class">
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </NextThemesProvider>
  );
}