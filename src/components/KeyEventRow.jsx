import { Tr, Td, Button, useColorModeValue } from '@chakra-ui/react';
import { formatCurrency } from '../utils';
import { format, parse } from 'date-fns';

const KeyEventRow = ({ event, isNewDay, dailyBalance, dailyEventsCount, headerBg }) => {

  return (
    <Tr
      fontWeight={event.is_subtotal ? 'bold' : 'normal'}
      bg={event.is_subtotal ? headerBg : 'transparent'}
    >
      {isNewDay && !event.is_subtotal && (
        <Td p={2} rowSpan={dailyEventsCount} whiteSpace="nowrap">{format(parse(event.date, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd')}</Td>
      )}
      {event.is_subtotal && (
        <Td p={2} whiteSpace="nowrap">{format(parse(event.date, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd')}</Td>
      )}
      <Td p={2} color={event.is_local ? useColorModeValue('blue.600', 'blue.300') : 'inherit'}>{event.description}</Td>
      <Td p={2} isNumeric color="green.500">
        {event.is_subtotal && event.monthlyCredit !== undefined ? `+${formatCurrency(event.monthlyCredit)}` : (event.amount > 0 ? `+${formatCurrency(event.amount)}` : '')}
      </Td>
      <Td p={2} isNumeric color="red.500">
        {event.is_subtotal && event.monthlyDebit !== undefined ? `-${formatCurrency(Math.abs(event.monthlyDebit))}` : (event.amount < 0 ? `-${formatCurrency(Math.abs(event.amount))}` : '')}
      </Td>
      {isNewDay && !event.is_subtotal && (
        <Td p={2} isNumeric rowSpan={dailyEventsCount}>
          {formatCurrency(dailyBalance)}
        </Td>
      )}
      {event.is_subtotal && (
        <Td p={2} isNumeric>{formatCurrency(event.balance)}</Td>
      )}
    </Tr>
  );
};

export default KeyEventRow;
