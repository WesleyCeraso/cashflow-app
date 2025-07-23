const STORAGE_KEY = 'oneOffTransactions';

export const getOneOffTransactions = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addOneOffTransaction = (transaction) => {
  const transactions = getOneOffTransactions();
  transactions.push({ ...transaction, id: new Date().getTime(), is_one_off: true, account_id: parseInt(transaction.account_id) });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const updateOneOffTransaction = (updatedTransaction) => {
  let transactions = getOneOffTransactions();
  transactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const deleteOneOffTransaction = (transactionId) => {
  let transactions = getOneOffTransactions();
  transactions = transactions.filter(t => t.id !== transactionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};