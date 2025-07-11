import { Box, Heading, Alert, AlertIcon, AlertTitle, AlertDescription, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Badge } from '@chakra-ui/react';
import { formatCurrency } from '../utils.js';

const NegativeBalanceAlerts = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <Box w="100%">
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" display="flex" alignItems="center">
                <Heading size="lg">Negative Balance Alerts</Heading>
                {alerts.length > 0 && (
                  <Badge ml="2" colorScheme="red" fontSize="0.8em" p="1" borderRadius="md">
                    {alerts.length}
                  </Badge>
                )}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
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
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default NegativeBalanceAlerts;