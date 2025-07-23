import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Heading, VStack, Spinner, Alert, Button, Flex, Image, SimpleGrid, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, useColorMode, IconButton, Text as ChakraText, HStack } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { MdError } from 'react-icons/md';
import { FaSun, FaMoon } from 'react-icons/fa';
import ApiKeyInput from './components/ApiKeyInput';
import AccountSelector from './components/AccountSelector';
import ProjectionHorizonSelector from './components/ProjectionHorizonSelector';
import CashFlowChart from './components/CashFlowChart';
import KeyEvents from './components/KeyEvents';
import NegativeBalanceAlerts from './components/NegativeBalanceAlerts';
import LegalNotice from './components/LegalNotice';
import { getAccounts, getRecurringItems, getPlaidAccounts } from './lunchmoney';
import { projectCashFlow } from './projection';
import { getLocalTransactions, addLocalTransaction, updateLocalTransaction, deleteLocalTransaction } from './localTransactions';
import LocalTransactionForm from './components/LocalTransactionForm';
import LocalTransactionList from './components/LocalTransactionList';

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('lm_api_key'));
  const [accounts, setAccounts] = useState([]);
  
  const [selectedAccountId, setSelectedAccountId] = useState(() => localStorage.getItem('lm_selected_account_id'));
  const [projectionHorizon, setProjectionHorizon] = useState(() => {
    const storedHorizon = localStorage.getItem('lm_projection_horizon');
    return storedHorizon ? parseInt(storedHorizon, 10) : 3;
  });
  const [projection, setProjection] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAccountId) {
      localStorage.setItem('lm_selected_account_id', selectedAccountId);
    } else {
      localStorage.removeItem('lm_selected_account_id');
    }
  }, [selectedAccountId]);

  useEffect(() => {
    localStorage.setItem('lm_projection_horizon', projectionHorizon.toString());
  }, [projectionHorizon]);
  const [error, setError] = useState(null);
  const [localTransactions, setLocalTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isAddingLocalTransaction, setIsAddingLocalTransaction] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  const bg = useColorModeValue('brand.100', 'brand.900');
  const headerBg = useColorModeValue('brand.200', 'brand.800');

  useEffect(() => {
    if (apiKey) {
      setLoading(true);
      console.log('API Key found, fetching accounts...');
      Promise.all([getAccounts(apiKey), getPlaidAccounts(apiKey)])
        .then(([accountsData, plaidAccountsData]) => {
          console.log('Raw Plaid accounts data:', plaidAccountsData);
          const allAccounts = [...accountsData.assets, ...plaidAccountsData.plaid_accounts];
          setAccounts(allAccounts);
          setLocalTransactions(getLocalTransactions());

          const storedAccountId = localStorage.getItem('lm_selected_account_id');
          if (storedAccountId && allAccounts.some(account => String(account.id) === storedAccountId)) {
            setSelectedAccountId(storedAccountId);
          } else if (allAccounts.length > 0) {
            setSelectedAccountId(String(allAccounts[0].id));
          }
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
    setSelectedAccountId(null);
    localStorage.removeItem('lm_selected_account_id');
    setProjection(null);
    setError(null);
    localStorage.removeItem('lm_projection_horizon');
    setLocalTransactions([]);
    localStorage.removeItem('one_off_transactions');
  };

  const handleSaveLocalTransaction = (transaction) => {
    if (editingTransaction) {
      updateLocalTransaction(transaction);
    } else {
      addLocalTransaction(transaction);
    }
    setLocalTransactions(getLocalTransactions());
    setEditingTransaction(null);
    onClose(); // Close modal after saving
    handleGenerateProjection();
  };

  const handleDeleteLocalTransaction = (transactionId) => {
    deleteLocalTransaction(transactionId);
    setLocalTransactions(getLocalTransactions());
    handleGenerateProjection();
  };

  const handleEditLocalTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsAddingLocalTransaction(false);
    onOpen(); // Open modal for editing
  };

  const handleGenerateProjection = useCallback(() => {
    if (selectedAccountId && projectionHorizon) {
      setLoading(true);
      const today = new Date();
      const startDate = today.toISOString().slice(0, 10);
      const endDate = new Date(new Date().setMonth(today.getMonth() + projectionHorizon)).toISOString().slice(0, 10);

      getRecurringItems(apiKey, startDate, endDate)
        .then(recurringItemsData => {
          const projectionData = projectCashFlow(accounts, recurringItemsData, selectedAccountId, projectionHorizon, localTransactions.map(t => ({...t, date: new Date(t.date)})));
          setProjection(projectionData);
        })
        .catch(err => {
          console.error('Error generating projection:', err);
          setError('Error generating projection. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  }, [apiKey, accounts, selectedAccountId, projectionHorizon, localTransactions]);

  useEffect(() => {
    if (selectedAccountId && projectionHorizon && accounts.length > 0) {
      handleGenerateProjection();
    }
  }, [selectedAccountId, projectionHorizon, accounts, handleGenerateProjection]);

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
          <HStack spacing={2}>
              <IconButton
                aria-label="Toggle theme"
                icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
                onClick={toggleColorMode}
                variant="ghost"
              />
              {apiKey && (
                <Button colorScheme='red' onClick={handleClearApiKey}>Clear API Key</Button>
              )}
            </HStack>
        </Flex>
      </Box>

      <Container maxW="container.xl" p={8}>
        {!apiKey ? (
          <VStack spacing={6} p={8} borderWidth="1px" borderRadius="lg" boxShadow="md" bg={useColorModeValue('white', 'gray.700')}>
            <Heading size="xl" textAlign="center">Welcome to Lunch Money Cash Flow!</Heading>
            <ChakraText fontSize="lg" textAlign="center">
              Visualize your financial future by projecting your Lunch Money transactions.
              Enter your Lunch Money API key below to get started.
            </ChakraText>
            <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
            <ChakraText fontSize="sm" color="gray.500" textAlign="center">
              Your API key is stored locally in your browser and is never sent to any third-party servers.
            </ChakraText>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1 }} spacing={8} w="100%">
            <VStack spacing={8} w="100%" align="stretch">
              {loading && <Spinner size="xl" />}
              {error && <Alert status='error'><Icon as={MdError} mr={2} />{error}</Alert>}
              {accounts.length > 0 && (
                <VStack spacing={8} w="100%" align="stretch">
                  <AccountSelector accounts={accounts} onAccountSelect={setSelectedAccountId} selectedAccountId={selectedAccountId} />
                  <ProjectionHorizonSelector onHorizonSelect={setProjectionHorizon} currentHorizon={projectionHorizon} />
                  

                  <Button onClick={() => { setEditingTransaction(null); setIsAddingLocalTransaction(false); onOpen(); }} colorScheme="purple" size="md" mt={4}>
                    Manage Local Transactions
                  </Button>
                </VStack>
              )}
              {accounts.length === 0 && !loading && !error && apiKey && (
                <ChakraText fontSize="md" color="gray.500" textAlign="center">
                  No accounts found. Please ensure your API key is correct and you have accounts in Lunch Money.
                </ChakraText>
              )}
            </VStack>
            {projection ? (
              <VStack spacing={8} w="100%" align="stretch">
                <CashFlowChart data={chartData} keyEvents={projection.keyEvents} />
                <NegativeBalanceAlerts alerts={projection.negativeBalanceAlerts} />
                <KeyEvents events={projection.keyEvents} />
              </VStack>
            ) : (
              <VStack spacing={8} w="100%" align="center" justify="center" minH="300px" borderWidth="1px" borderRadius="lg" boxShadow="md" bg={useColorModeValue('white', 'gray.700')}>
                <ChakraText fontSize="xl" color="gray.500">
                  Generate a projection to see your cash flow chart and key events.
                </ChakraText>
              </VStack>
            )}
          </SimpleGrid>
        )}
      </Container>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Local Transactions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ChakraText fontSize="sm" color="gray.500" mb={4}>
              Local transactions are stored only in your browser and are not synced with Lunch Money.
            </ChakraText>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Button size="sm" onClick={() => { setEditingTransaction(null); setIsAddingLocalTransaction(true); }}>Add New</Button>
              </Flex>
              {isAddingLocalTransaction || editingTransaction ? (
                <LocalTransactionForm
                  onSave={handleSaveLocalTransaction}
                  onCancel={() => { setEditingTransaction(null); setIsAddingLocalTransaction(false); }}
                  transaction={editingTransaction}
                  accounts={accounts}
                  selectedAccountId={selectedAccountId}
                  isAdding={isAddingLocalTransaction}
                />
              ) : (
                <LocalTransactionList
                  transactions={localTransactions}
                  onEdit={handleEditLocalTransaction}
                  onDelete={handleDeleteLocalTransaction}
                />
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Box as="footer" py={8} px={8} mt={8} textAlign="center">
        <LegalNotice />
      </Box>
    </Box>
  );
}

export default App;

