import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Button } from '@chakra-ui/react';
import { formatCurrency } from '../utils';
import { format, parse } from 'date-fns';
import KeyEventRow from './KeyEventRow';

const KeyEvents = ({ events }) => {
  const bg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('gray.100', 'gray.600');

  return (
    <Box w="100%" bg={bg} borderRadius="lg" boxShadow="md" p={6}>
      <Heading size="lg" mb={4}>Key Events</Heading>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr bg={headerBg}>
              <Th p={2}>Date</Th>
              <Th p={2}>Name</Th>
              <Th p={2} isNumeric>Credit</Th>
              <Th p={2} isNumeric>Debit</Th>
              <Th p={2} isNumeric>Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            {events.map((event, index) => {
              const isNewDay = index === 0 || event.date !== events[index - 1].date;
              const dailyEventsCount = events.filter(e => e.date === event.date && !e.is_subtotal).length;

              return (
                <KeyEventRow
                  key={index}
                  event={event}
                  index={index}
                  isNewDay={isNewDay}
                  dailyEventsCount={dailyEventsCount}
                  headerBg={headerBg}
                />
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default KeyEvents;