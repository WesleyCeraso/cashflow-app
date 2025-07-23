import { Box, Heading, VStack, HStack, Button, useColorModeValue, Text as ChakraText } from '@chakra-ui/react';
import { formatCurrency } from '../utils';
import { format, parse } from 'date-fns';

const LocalTransactionList = ({ transactions, onEdit: onEditLocalTransaction, onDelete: onDeleteLocalTransaction }) => {
  const itemBg = useColorModeValue('gray.50', 'gray.700');

  if (transactions.length === 0) {
    return (
      <Box p={4} bg={itemBg} borderRadius="md" boxShadow="sm" w="100%">
        <ChakraText>No local transactions added yet.</ChakraText>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch" w="100%">
      <Heading size="md">Local Transactions</Heading>
      {transactions.map(transaction => (
        <Box key={transaction.id} p={3} bg={itemBg} borderRadius="md" boxShadow="xs">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <ChakraText fontWeight="bold">{transaction.description}</ChakraText>
              <ChakraText fontSize="sm" color="gray.500">
                {format(parse(transaction.date, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd')} | 
                {transaction.amount < 0 ? 'Expense' : 'Income'} | 
                {formatCurrency(transaction.amount)}
              </ChakraText>
            </VStack>
            <HStack>
              <Button size="xs" onClick={() => onEditLocalTransaction(transaction)}>Edit</Button>
              <Button size="xs" colorScheme="red" onClick={() => onDeleteLocalTransaction(transaction.id)}>Delete</Button>
            </HStack>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default LocalTransactionList;
