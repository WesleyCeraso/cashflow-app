import { Box, Heading, VStack, HStack, Button, useColorModeValue, Text as ChakraText } from '@chakra-ui/react';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';

const OneOffTransactionList = ({ transactions, onEdit, onDelete }) => {
  const itemBg = useColorModeValue('gray.50', 'gray.700');

  if (transactions.length === 0) {
    return (
      <Box p={4} bg={itemBg} borderRadius="md" boxShadow="sm" w="100%">
        <ChakraText>No one-off transactions added yet.</ChakraText>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch" w="100%">
      <Heading size="md">Your One-Off Transactions</Heading>
      {transactions.map(transaction => (
        <Box key={transaction.id} p={3} bg={itemBg} borderRadius="md" boxShadow="xs">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <ChakraText fontWeight="bold">{transaction.description}</ChakraText>
              <ChakraText fontSize="sm" color="gray.500">
                {format(new Date(transaction.date), 'yyyy-MM-dd')} | 
                {transaction.amount < 0 ? 'Expense' : 'Income'} | 
                {formatCurrency(transaction.amount)}
              </ChakraText>
            </VStack>
            <HStack>
              <Button size="xs" onClick={() => onEdit(transaction)}>Edit</Button>
              <Button size="xs" colorScheme="red" onClick={() => onDelete(transaction.id)}>Delete</Button>
            </HStack>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default OneOffTransactionList;
