import { RRule } from 'rrule-alt';
import { addMonths, format, formatISO } from 'date-fns';

export const projectCashFlow = (accounts, recurringItems, selectedAccountId, projectionHorizonMonths) => {
  const selectedAccount = accounts.find(acc => acc.id === parseInt(selectedAccountId));
  if (!selectedAccount) return null;

  const projectionStartDate = new Date(new Date().toISOString().slice(0,10) + 'T00:00:00Z');
  const projectionEndDate = addMonths(projectionStartDate, projectionHorizonMonths);

  const projectedTransactions = [];

  recurringItems.forEach(item => {
    if (item.asset_id === selectedAccount.id || item.plaid_account_id === selectedAccount.id) {
      let freq;
      switch (item.granularity) {
        case 'day': freq = RRule.DAILY; break;
        case 'week': freq = RRule.WEEKLY; break;
        case 'month': freq = RRule.MONTHLY; break;
        case 'year': freq = RRule.YEARLY; break;
        default: return; // Skip if cadence is not recognized
      }

      const dateToUse = item.billing_date || item.start_date;
      const [year, month, day] = dateToUse.split('-').map(Number);
      const dtstart = new Date(Date.UTC(year, month - 1, day)); // Month is 0-indexed in Date.UTC

      const ruleOptions = {
        freq: freq,
        dtstart: dtstart,
        interval: item.quantity || 1,
      };
      
      if (freq === RRule.MONTHLY) {
        const dtstartDay = dtstart.getUTCDate();
        if (dtstartDay >= 29) { // If the start day is 29, 30, or 31
          ruleOptions.bymonthday = [28, 29, 30, 31];
          ruleOptions.bysetpos = -1; // Take the last day from the set
        } else {
          ruleOptions.bymonthday = dtstartDay;
        }
      }

      if (item.end_date) {
        ruleOptions.until = new Date(item.end_date + 'T23:59:59Z');
      }

      const rule = new RRule(ruleOptions);
      const occurrences = rule.between(projectionStartDate, projectionEndDate);

      occurrences.forEach(date => {
        const formattedDate = formatISO(date, { representation: 'date' });

        // Check if this projected occurrence has already happened
        // Assuming item.occurrences is an array of objects, each with a 'date' property
        const hasOccurred = item.occurrences && item.occurrences[formattedDate] && item.occurrences[formattedDate].length > 0;

        if (!hasOccurred) {
          projectedTransactions.push({
            date: formattedDate,
            amount: -parseFloat(item.amount),
            description: item.payee || 'Recurring Transaction',
            is_income: item.is_income
          });
        }
      });
    }
  });

  projectedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  const dailyBalances = [];
  const negativeBalanceAlerts = [];
  const keyEvents = [
    {
      date: format(projectionStartDate, 'yyyy-MM-dd'),
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
  let currentMonth = projectionStartDate.getMonth();
  let lastDayOfMonthBalance = currentBalance;

  for (let d = new Date(projectionStartDate); d <= projectionEndDate; d.setDate(d.getDate() + 1)) {
    const dateStr = formatISO(d, { representation: 'date' });
    const dayMonth = d.getMonth();

    // Check for month change
    if (dayMonth !== currentMonth) {
      // Add subtotal for the previous month
      keyEvents.push({
        date: formatISO(addMonths(d, -1), { representation: 'date' }),
        description: `Monthly Subtotal (${format(addMonths(d, -1), 'MMMM yyyy')})`,
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
      date: formatISO(projectionEndDate, { representation: 'date' }),
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