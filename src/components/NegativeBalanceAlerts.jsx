import { Box, Heading, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { formatCurrency } from '../utils.js';

const NegativeBalanceAlerts = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <Box w="100%">
      <Heading size="lg" mb={4}>Negative Balance Alerts</Heading>
      {alerts.map((alert, index) => (
        <Alert status="error" key={index} borderRadius="md" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Potential Negative Balance on {alert.date}</AlertTitle>
            <AlertDescription>
              Daily Balance: {formatCurrency(alert.balance)} - Occurred after "{alert.transaction.description}".
            </AlertDescription>
          </Box>
        </Alert>
      ))}
    </Box>
  );
};

export default NegativeBalanceAlerts;