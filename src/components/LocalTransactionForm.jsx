import { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, Select, Stack, useColorModeValue, Heading } from '@chakra-ui/react';

const LocalTransactionForm = ({ transaction, onSave, onCancel, accounts, selectedAccountId: propSelectedAccountId, isAdding }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState('');
  const [type, setType] = useState('expense');
  const [selectedAccountId, setSelectedAccountId] = useState(propSelectedAccountId || '');

  useEffect(() => {
    if (isAdding) {
      setDescription('');
      setAmount(0);
      setDate(new Date().toISOString().slice(0, 10));
      setType('expense');
      setSelectedAccountId(propSelectedAccountId || '');
    } else if (transaction) {
      setDescription(transaction.description || '');
      setAmount(Math.abs(transaction.amount || 0));
      setDate(transaction.date || '');
      setType(transaction.amount < 0 ? 'expense' : 'income');
      setSelectedAccountId(transaction.account_id || '');
    }
  }, [transaction, propSelectedAccountId, isAdding]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    onSave({ description, amount: finalAmount, date, id: transaction?.id, account_id: selectedAccountId });
  };

  const bg = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} bg={bg} borderRadius="md" boxShadow="sm" w="100%">
      <Heading size="md" mb={4}>{isAdding ? 'Add' : 'Edit'} Local Transaction</Heading>
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <NumberInput value={amount} onChange={(_, valueAsNumber) => setAmount(valueAsNumber || 0)} min={0}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Date</FormLabel>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Account</FormLabel>
          <Select value={selectedAccountId} onChange={(e) => setSelectedAccountId(parseInt(e.target.value))}>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.display_name || account.name}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Type</FormLabel>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
        </FormControl>
        <Stack direction="row" spacing={4}>
          <Button type="submit" colorScheme="blue">{isAdding ? 'Add' : 'Update'}</Button>
          {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        </Stack>
      </Stack>
    </Box>
  );
};

export default LocalTransactionForm;