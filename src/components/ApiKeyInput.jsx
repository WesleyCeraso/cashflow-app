import { useState } from 'react';
import { Box, Button, Input, VStack, Text, useColorModeValue, Link } from '@chakra-ui/react';

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
        <Text fontSize="lg" fontWeight="semibold">Enter your Lunch Money API Key</Text>
        <Text fontSize="sm" color="gray.500" textAlign="center">
          You can generate an API key from your Lunch Money developer settings:
          <Link href="https://my.lunchmoney.app/developers" isExternal color="blue.500"> https://my.lunchmoney.app/developers</Link>
        </Text>
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