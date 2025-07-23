import { Select, useColorModeValue } from '@chakra-ui/react';

const AccountSelector = ({ accounts, onAccountSelect, selectedAccountId }) => {
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const bgColor = useColorModeValue('white', 'gray.700');

  return (
    <Select 
      value={selectedAccountId || ""}
      onChange={(e) => onAccountSelect(e.target.value)}
      size="lg"
      bg={bgColor}
      color={textColor}
    >
      {accounts.map(account => (
        <option key={account.id} value={String(account.id)}>
          {account.display_name || account.name}
        </option>
      ))}
    </Select>
  );
};

export default AccountSelector;