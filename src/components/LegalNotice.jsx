import { Box, Text as ChakraText } from '@chakra-ui/react';

const LegalNotice = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box textAlign="center" fontSize="sm" color="gray.500">
      <ChakraText mb={2}>
        <strong>Disclaimer:</strong> This application is not affiliated with, endorsed by, or in any way officially connected with Lunch Money or its developers. All Lunch Money trademarks and copyrights are the property of their respective owners.
      </ChakraText>
      <ChakraText mb={2}>
        <strong>Use at Your Own Risk:</strong> This application is provided "as is", without warranty of any kind, express or implied. In no event shall the authors or copyright holders be liable for any claim, damages or other liability.
      </ChakraText>
      <ChakraText mb={2}>
        <strong>Privacy:</strong> Your Lunch Money API key and financial data are stored locally in your browser and are never transmitted to any third-party servers.
      </ChakraText>
      <ChakraText>
        &copy; {currentYear} CashFlow. All Rights Reserved.
      </ChakraText>
    </Box>
  );
};

export default LegalNotice;