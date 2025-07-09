import { Box, Heading, Text, VStack } from '@chakra-ui/react';

const KeyEvents = ({ events }) => {
  return (
    <Box w="100%">
      <Heading size="md" mb={4}>Key Events</Heading>
      <VStack spacing={2} align="stretch">
        {events.map((event, index) => (
          <Box key={index} p={2} shadow="md" borderWidth="1px">
            <Text>{event.date}: {event.description} ({event.amount > 0 ? '+' : ''}${event.amount.toFixed(2)})</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default KeyEvents;