import { useState } from 'react';
import { Box, Button, Input, VStack, Text as ChakraText, useColorModeValue, Link } from '@chakra-ui/react';

const ApiKeyInput = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const bg = useColorModeValue('white', 'gray.700');

  const handleSubmit = () => {
    if (apiKey) {
      onApiKeySubmit(apiKey);
    } else {
      alert('Please enter your Lunch Money API key.');
    }
  };

  return (
    <Box p={8} bg={bg} borderRadius="lg" boxShadow="md" w="100%" maxW="md">
      <VStack spacing={6}>
        <ChakraText fontSize="lg" fontWeight="semibold">Enter your Lunch Money API Key</ChakraText>
        <ChakraText fontSize="sm" color="gray.500" mt={2}>
            You can find your API key in Lunch Money under Settings &gt; Developer.
            <Link href="https://lunchmoney.app/settings/developer" isExternal color="blue.500"> Click here to go to Lunch Money.</Link>
          </ChakraText>
        <Input 
          placeholder='Your Lunch Money API Key' 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)} 
          size="lg"
        />
        <Button colorScheme='blue' onClick={handleSubmit} size="lg" width="100%">Set API Key</Button>
      </VStack>
    </Box>
  );
};

export default ApiKeyInput;