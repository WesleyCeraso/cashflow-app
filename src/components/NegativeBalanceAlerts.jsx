import { Box, Heading } from '@chakra-ui/react';

const NegativeBalanceAlerts = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <Box w="100%">
        <Heading size="md" mb={4}>Negative Balance Alerts</Heading>
        {alerts.map((alert, index) => (
            <div key={index} style={{ border: '1px solid red', padding: '8px', marginBottom: '8px' }}>
                <Box flex="1">
                    <h3>Potential Negative Balance on {alert.date}</h3>
                    <p>Daily Balance: ${alert.balance.toFixed(2)} - Occurred after "{alert.transaction.description}".</p>
                </Box>
            </div>
        ))}
    </Box>
  );
};

export default NegativeBalanceAlerts;