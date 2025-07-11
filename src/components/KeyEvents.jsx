import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue } from '@chakra-ui/react';
import { formatCurrency } from '../utils';

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
              <Th>Date</Th>
              <Th>Name</Th>
              <Th isNumeric>Credit</Th>
              <Th isNumeric>Debit</Th>
              <Th isNumeric>Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            {events.map((event, index) => {
              const isNewDay = index === 0 || event.date !== events[index - 1].date;
              const dailyEventsCount = events.filter(e => e.date === event.date && !e.is_subtotal).length;

              return (
                <Tr key={index} fontWeight={event.is_subtotal ? 'bold' : 'normal'} bg={event.is_subtotal ? headerBg : 'transparent'}>
                  {isNewDay && !event.is_subtotal && (
                    <Td rowSpan={dailyEventsCount}>{event.date}</Td>
                  )}
                  {event.is_subtotal && (
                    <Td>{event.date}</Td>
                  )}
                  <Td>{event.description}</Td>
                  <Td isNumeric color="green.500">
                    {event.is_subtotal && event.monthlyCredit !== undefined ? `+${formatCurrency(event.monthlyCredit)}` : (event.amount > 0 ? `+${formatCurrency(event.amount)}` : '')}
                  </Td>
                  <Td isNumeric color="red.500">
                    {event.is_subtotal && event.monthlyDebit !== undefined ? `-${formatCurrency(Math.abs(event.monthlyDebit))}` : (event.amount < 0 ? `-${formatCurrency(Math.abs(event.amount))}` : '')}
                  </Td>
                  {isNewDay && !event.is_subtotal && (
                    <Td isNumeric rowSpan={dailyEventsCount}>
                      {formatCurrency(events.filter(e => e.date === event.date && !e.is_subtotal).pop()?.balance)}
                    </Td>
                  )}
                  {event.is_subtotal && (
                    <Td isNumeric>{formatCurrency(event.balance)}</Td>
                  )}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default KeyEvents;