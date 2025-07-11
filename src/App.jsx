import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Heading, VStack, Spinner, Alert, Button, Flex, Image, Grid, useColorModeValue } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { MdError } from 'react-icons/md';
import ApiKeyInput from './components/ApiKeyInput';
import AccountSelector from './components/AccountSelector';
import ProjectionHorizonSelector from './components/ProjectionHorizonSelector';
import CashFlowChart from './components/CashFlowChart';
import KeyEvents from './components/KeyEvents';
import NegativeBalanceAlerts from './components/NegativeBalanceAlerts';
import LegalNotice from './components/LegalNotice';
import { getAccounts, getRecurringItems, getPlaidAccounts } from './lunchmoney';
import { projectCashFlow } from './projection';

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('lm_api_key'));
  const [accounts, setAccounts] = useState([]);
  const [recurringItems, setRecurringItems] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [projectionHorizon, setProjectionHorizon] = useState(3);
  const [projection, setProjection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bg = useColorModeValue('brand.100', 'brand.900');
  const headerBg = useColorModeValue('brand.200', 'brand.800');

  useEffect(() => {
    if (apiKey) {
      setLoading(true);
      console.log('API Key found, fetching data...');
      Promise.all([getAccounts(apiKey), getRecurringItems(apiKey), getPlaidAccounts(apiKey)])
        .then(([accountsData, recurringItemsData, plaidAccountsData]) => {
          console.log('Raw Plaid accounts data:', plaidAccountsData);
          const allAccounts = [...accountsData.assets, ...plaidAccountsData.plaid_accounts];
          setAccounts(allAccounts);
          setRecurringItems(recurringItemsData || []);
        })
        .catch(err => {
          console.error('Error fetching data:', err);
          setError('Error fetching data from Lunch Money. Please check your API key.');
        })
        .finally(() => setLoading(false));
    }
  }, [apiKey]);

  const handleApiKeySubmit = (key) => {
    localStorage.setItem('lm_api_key', key);
    setApiKey(key);
  };
  
  const handleClearApiKey = () => {
    localStorage.removeItem('lm_api_key');
    setApiKey(null);
    setAccounts([]);
    setRecurringItems([]);
    setSelectedAccountId(null);
    setProjection(null);
    setError(null);
  };

  const handleGenerateProjection = useCallback(() => {
    if(selectedAccountId && projectionHorizon) {
        const projectionData = projectCashFlow(accounts, recurringItems, selectedAccountId, projectionHorizon);
        setProjection(projectionData);
    }
  }, [accounts, recurringItems, selectedAccountId, projectionHorizon]);

  const chartData = projection ? {
    labels: projection.dailyBalances.map(d => d.date),
    datasets: [
      {
        label: 'Projected Balance',
        data: projection.dailyBalances.map(d => d.balance),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  } : null;

  return (
    <Box bg={bg} minH="100vh">
      <Box as="header" bg={headerBg} py={4} px={8} boxShadow="md">
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Image src="./logo/favicon-32x32.png" alt="CashFlow Logo" boxSize="48px" mr={3} />
            <Heading as="h1" size="lg">Lunch Money Cash Flow</Heading>
          </Flex>
          {apiKey && (
            <Button colorScheme='red' onClick={handleClearApiKey}>Clear API Key</Button>
          )}
        </Flex>
      </Box>

      <Container maxW="container.xl" p={8}>
        <VStack spacing={8} w="100%">
          {!apiKey ? (
            <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
          ) : (
            <VStack spacing={8} w="100%">
              {loading && <Spinner size="xl" />}
              {error && <Alert status='error'><Icon as={MdError} mr={2} />{error}</Alert>}
              {accounts.length > 0 && (
                <>
                  <AccountSelector accounts={accounts} onAccountSelect={setSelectedAccountId} />
                  <ProjectionHorizonSelector onHorizonSelect={setProjectionHorizon} />
                  <Button colorScheme='blue' onClick={handleGenerateProjection} size="lg">Generate Projection</Button>
                </>
              )}
              {projection && (
                  <VStack spacing={8} w="100%">
                      <CashFlowChart data={chartData} keyEvents={projection.keyEvents} />
                      <NegativeBalanceAlerts alerts={projection.negativeBalanceAlerts} />
                      <KeyEvents events={projection.keyEvents} />
                  </VStack>
              )}
            </VStack>
          )}
        </VStack>
      </Container>

      <Box as="footer" py={8} px={8} mt={8} textAlign="center">
        <LegalNotice />
      </Box>
    </Box>
  );
}

export default App;

