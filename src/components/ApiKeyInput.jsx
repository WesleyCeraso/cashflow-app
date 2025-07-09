import { useState } from 'react';
import { Box, Button, Input, VStack, Text } from '@chakra-ui/react';

const ApiKeyInput = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = () => {
    if (apiKey) {
      onApiKeySubmit(apiKey);
    } else {
      // Temporarily removed toast notification
      alert('Please enter your LunchMoney API key.');
    }
  };

  return (
    <Box w="100%">
      <VStack spacing={4}>
        <Text>Enter your LunchMoney API Key:</Text>
        <Input 
          placeholder='Your LunchMoney API Key' 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)} 
        />
        <Button colorScheme='blue' onClick={handleSubmit}>Set API Key</Button>
      </VStack>
    </Box>
  );
};

export default ApiKeyInput;