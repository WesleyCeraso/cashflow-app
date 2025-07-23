const STORAGE_KEY = 'localTransactions';

export const getLocalTransactions = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addLocalTransaction = (transaction) => {
  const transactions = getLocalTransactions();
  transactions.push({ ...transaction, id: new Date().getTime(), is_local: true, account_id: parseInt(transaction.account_id) });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const updateLocalTransaction = (updatedTransaction) => {
  let transactions = getLocalTransactions();
  transactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const deleteLocalTransaction = (transactionId) => {
  let transactions = getLocalTransactions();
  transactions = transactions.filter(t => t.id !== transactionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};