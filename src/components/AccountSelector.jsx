const AccountSelector = ({ accounts, onAccountSelect }) => {
  return (
    <select onChange={(e) => onAccountSelect(e.target.value)}>
      <option value="">Select account</option>
      {accounts.map(account => (
        <option key={account.id} value={account.id}>
          {account.display_name || account.name}
        </option>
      ))}
    </select>
  );
};

export default AccountSelector;