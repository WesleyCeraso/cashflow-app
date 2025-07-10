import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Heading, VStack, Spinner, Alert, Button, Flex, Image } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { MdError } from 'react-icons/md';
import ApiKeyInput from './components/ApiKeyInput';
import AccountSelector from './components/AccountSelector';
import ProjectionHorizonSelector from './components/ProjectionHorizonSelector';
import CashFlowChart from './components/CashFlowChart';
import KeyEvents from './components/KeyEvents';
import NegativeBalanceAlerts from './components/NegativeBalanceAlerts';
import { getAccounts, getRecurringItems, getPlaidAccounts } from './lunchmoney';
import { projectCashFlow } from './projection';

function App() {
  const [apiKey, setApiKey] = useState(sessionStorage.getItem('lm_api_key'));
  const [accounts, setAccounts] = useState([]);
  const [recurringItems, setRecurringItems] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [projectionHorizon, setProjectionHorizon] = useState(3);
  const [projection, setProjection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (apiKey) {
      setLoading(true);
      console.log('API Key found, fetching data...');
      Promise.all([getAccounts(apiKey), getRecurringItems(apiKey), getPlaidAccounts(apiKey)])
        .then(([accountsData, recurringItemsData, plaidAccountsData]) => {
          console.log('Raw Plaid accounts data:', plaidAccountsData);
          const allAccounts = [...accountsData.assets, ...plaidAccountsData.plaid_accounts];
          console.log('All combined accounts:', allAccounts);
          setAccounts(allAccounts);
          setRecurringItems(recurringItemsData || []);
        })
        .catch(err => {
          console.error('Error fetching data:', err);
          setError('Error fetching data from LunchMoney. Please check your API key.');
        })
        .finally(() => setLoading(false));
    }
  }, [apiKey]);

  const handleApiKeySubmit = (key) => {
    sessionStorage.setItem('lm_api_key', key);
    setApiKey(key);
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
    <Container maxW="container.xl" p={4}>
      <VStack spacing={8}>
        <Flex align="center" justify="center">
          <Image src="/logo/favicon-32x32.png" alt="CashFlow Logo" boxSize="32px" mr={2} />
          <Heading as="h1" size="xl">LunchMoney Cash Flow Projector</Heading>
        </Flex>
        {!apiKey ? (
          <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
        ) : (
          <VStack spacing={4} w="100%">
            {loading && <Spinner />}
            {error && <Alert status='error'><Icon as={MdError} mr={2} />{error}</Alert>}
            {accounts.length > 0 && (
              <>
                <AccountSelector accounts={accounts} onAccountSelect={setSelectedAccountId} />
                <ProjectionHorizonSelector onHorizonSelect={setProjectionHorizon} />
                <Button colorScheme='blue' onClick={handleGenerateProjection}>Generate Projection</Button>
              </>
            )}
            {projection && (
                <VStack spacing={4} w="100%">
                    <CashFlowChart data={chartData} keyEvents={projection.keyEvents} />
                    <NegativeBalanceAlerts alerts={projection.negativeBalanceAlerts} />
                    <KeyEvents events={projection.keyEvents} />
                </VStack>
            )}
          </VStack>
        )}
      </VStack>
    </Container>
  );
}

export default App;

