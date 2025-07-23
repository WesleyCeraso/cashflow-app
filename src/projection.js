import { format } from 'date-fns';



function getUTCDateString(date) {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const projectCashFlow = (accounts, recurringItems, selectedAccountId, projectionHorizonMonths) => {
  const selectedAccount = accounts.find(acc => acc.id === parseInt(selectedAccountId));
  if (!selectedAccount) return null;

  const projectionStartDate = new Date(new Date().toISOString().slice(0,10) + 'T00:00:00Z');
  const projectionEndDate = new Date(projectionStartDate);
  projectionEndDate.setUTCMonth(projectionStartDate.getUTCMonth() + projectionHorizonMonths);


  const projectedTransactions = [];

  recurringItems.forEach(item => {
    if (item.asset_id === selectedAccount.id || item.plaid_account_id === selectedAccount.id) {
      if (item.missing_dates_within_range) {
        item.missing_dates_within_range.forEach(date => {
          projectedTransactions.push({
            date: date,
            amount: -parseFloat(item.amount),
            description: item.payee || 'Recurring Transaction',
            is_income: item.is_income
          });
        });
      }
    }
  });

  projectedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  const dailyBalances = [];
  const negativeBalanceAlerts = [];
  const keyEvents = [
    {
      date: getUTCDateString(projectionStartDate),
      description: 'Starting Balance',
      amount: 0,
      is_subtotal: false,
      balance: parseFloat(selectedAccount.balance)
    }
  ];
  let currentBalance = parseFloat(selectedAccount.balance);
  let monthlyChange = 0;
  let monthlyCredit = 0;
  let monthlyDebit = 0;
  let currentMonth = projectionStartDate.getUTCMonth();
  let lastDayOfMonthBalance = currentBalance;

  for (let d = new Date(projectionStartDate); d <= projectionEndDate; d.setUTCDate(d.getUTCDate() + 1)) {
    const dateStr = getUTCDateString(d);
    const dayMonth = d.getUTCMonth();

    // Check for month change
    if (dayMonth !== currentMonth) {
      // Add subtotal for the previous month
      const prevDay = new Date(d);
      prevDay.setUTCDate(d.getUTCDate() - 1);

      keyEvents.push({
        date: getUTCDateString(prevDay),
        description: `Monthly Subtotal (${format(prevDay, 'MMMM yyyy')})`,
        amount: monthlyChange,
        monthlyCredit: monthlyCredit,
        monthlyDebit: monthlyDebit,
        is_subtotal: true,
        balance: lastDayOfMonthBalance
      });
      monthlyChange = 0; // Reset for the new month
      monthlyCredit = 0;
      monthlyDebit = 0;
      currentMonth = dayMonth;
    }
    
    const todaysTransactions = projectedTransactions.filter(t => t.date === dateStr);

    todaysTransactions.forEach(t => {
        currentBalance += parseFloat(t.amount);
        monthlyChange += parseFloat(t.amount);
        if (parseFloat(t.amount) > 0) {
          monthlyCredit += parseFloat(t.amount);
        } else {
          monthlyDebit += parseFloat(t.amount);
        }
        keyEvents.push({ ...t, balance: currentBalance });
    });

    // Check for negative balance after all transactions for the day
    if (currentBalance < 0 && todaysTransactions.length > 0) {
        negativeBalanceAlerts.push({ date: dateStr, balance: currentBalance, transaction: todaysTransactions[todaysTransactions.length - 1] || { description: 'Daily Activity' }});
    }

    dailyBalances.push({ date: dateStr, balance: currentBalance });
    lastDayOfMonthBalance = currentBalance;
  }

  // Add subtotal for the last month in the projection
  if (monthlyChange !== 0) {
    keyEvents.push({
      date: getUTCDateString(projectionEndDate),
      description: `Monthly Subtotal (${format(projectionEndDate, 'MMMM yyyy')})`,
      amount: monthlyChange,
      monthlyCredit: monthlyCredit,
      monthlyDebit: monthlyDebit,
      is_subtotal: true,
      balance: currentBalance
    });
  }

  return { dailyBalances, keyEvents, negativeBalanceAlerts };
};