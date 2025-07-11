import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue } from '@chakra-ui/react';
import { formatCurrency } from '../utils';
import { lastDayOfMonth, format, parseISO } from 'date-fns';

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

              let displayDate = event.date;
              if (event.is_subtotal) {
                const parsedDate = parseISO(event.date);
                displayDate = format(lastDayOfMonth(parsedDate), 'yyyy-MM-dd');
                console.log(`Subtotal: Original Date: ${event.date}, Parsed Date: ${parsedDate}, Display Date: ${displayDate}`);
              }

              return (
                <Tr key={index} fontWeight={event.is_subtotal ? 'bold' : 'normal'} bg={event.is_subtotal ? headerBg : 'transparent'}>
                  {isNewDay && !event.is_subtotal && (
                    <Td p={2} rowSpan={dailyEventsCount} whiteSpace="nowrap">{event.date}</Td>
                  )}
                  {event.is_subtotal && (
                    <Td p={2} whiteSpace="nowrap">{displayDate}</Td>
                  )}
                  <Td p={2}>{event.description}</Td>
                  <Td p={2} isNumeric color="green.500">
                    {event.is_subtotal && event.monthlyCredit !== undefined ? `+${formatCurrency(event.monthlyCredit)}` : (event.amount > 0 ? `+${formatCurrency(event.amount)}` : '')}
                  </Td>
                  <Td p={2} isNumeric color="red.500">
                    {event.is_subtotal && event.monthlyDebit !== undefined ? `-${formatCurrency(Math.abs(event.monthlyDebit))}` : (event.amount < 0 ? `-${formatCurrency(Math.abs(event.amount))}` : '')}
                  </Td>
                  {isNewDay && !event.is_subtotal && (
                    <Td p={2} isNumeric rowSpan={dailyEventsCount}>
                      {formatCurrency(events.filter(e => e.date === event.date && !e.is_subtotal).pop()?.balance)}
                    </Td>
                  )}
                  {event.is_subtotal && (
                    <Td p={2} isNumeric>{formatCurrency(event.balance)}</Td>
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