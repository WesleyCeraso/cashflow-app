import { useState } from 'react';
import { Box, Button, Input, VStack, Text, useColorModeValue } from '@chakra-ui/react';

const ApiKeyInput = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const bg = useColorModeValue('white', 'gray.700');

  const handleSubmit = () => {
    if (apiKey) {
      onApiKeySubmit(apiKey);
    } else {
      alert('Please enter your LunchMoney API key.');
    }
  };

  return (
    <Box p={8} bg={bg} borderRadius="lg" boxShadow="md" w="100%" maxW="md">
      <VStack spacing={6}>
        <Text fontSize="lg" fontWeight="semibold">Enter your LunchMoney API Key</Text>
        <Input 
          placeholder='Your LunchMoney API Key' 
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