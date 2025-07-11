import { Select, useColorModeValue } from '@chakra-ui/react';

const AccountSelector = ({ accounts, onAccountSelect }) => {
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const bgColor = useColorModeValue('white', 'gray.700');

  return (
    <Select 
      placeholder="Select account"
      onChange={(e) => onAccountSelect(e.target.value)}
      size="lg"
      bg={bgColor}
      color={textColor}
    >
      {accounts.map(account => (
        <option key={account.id} value={account.id}>
          {account.display_name || account.name}
        </option>
      ))}
    </Select>
  );
};

export default AccountSelector;