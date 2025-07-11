import { Box, Heading } from '@chakra-ui/react';
import { formatCurrency } from '../utils';

const KeyEvents = ({ events }) => {
  return (
    <Box w="100%">
      <Heading size="md" mb={4}>Key Events</Heading>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Credit</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Debit</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => {
            const isNewDay = index === 0 || event.date !== events[index - 1].date;
            const dailyEventsCount = events.filter(e => e.date === event.date && !e.is_subtotal).length;
            const nextEvent = events[index + 1];
            const isLastEventOfDay = !nextEvent || nextEvent.date !== event.date;

            return (
              <tr key={index} style={{ borderBottom: '1px solid #eee', fontWeight: event.is_subtotal ? 'bold' : 'normal', background: event.is_subtotal ? '#777' : 'none' }}>
                {isNewDay && !event.is_subtotal && (
                  <td style={{ padding: '8px' }} rowSpan={events.filter(e => e.date === event.date && !e.is_subtotal).length}>{event.date}</td>
                )}
                {event.is_subtotal && (
                  <td style={{ padding: '8px' }}>{event.date}</td>
                )}
                <td style={{ padding: '8px' }}>{event.description}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {event.is_subtotal && event.monthlyCredit !== undefined ? `+${formatCurrency(event.monthlyCredit)}` : (event.amount > 0 ? `+${formatCurrency(event.amount)}` : '')}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {event.is_subtotal && event.monthlyDebit !== undefined ? `-${formatCurrency(Math.abs(event.monthlyDebit))}` : (event.amount < 0 ? `-${formatCurrency(Math.abs(event.amount))}` : '')}
                </td>
                {isNewDay && !event.is_subtotal && (
                  <td style={{ padding: '8px', textAlign: 'right' }} rowSpan={dailyEventsCount}>
                    {formatCurrency(events.filter(e => e.date === event.date && !e.is_subtotal).pop()?.balance)}
                  </td>
                )}
                {event.is_subtotal && (
                  <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(event.balance)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

export default KeyEvents;