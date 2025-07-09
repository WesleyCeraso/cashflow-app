import { RRule } from 'rrule-alt';
import { addMonths, format } from 'date-fns';

export const projectCashFlow = (accounts, recurringItems, selectedAccountId, projectionHorizonMonths) => {
  const selectedAccount = accounts.find(acc => acc.id === parseInt(selectedAccountId));
  if (!selectedAccount) return null;

  const projectionStartDate = new Date();
  const projectionEndDate = addMonths(projectionStartDate, projectionHorizonMonths);

  const projectedTransactions = [];

  recurringItems.forEach(item => {
    if (item.asset_id === selectedAccount.id || item.plaid_account_id === selectedAccount.id) {
      // Map cadence to RRule frequency
      let freq;
      switch (item.cadence) {
        case 'daily': freq = RRule.DAILY; break;
        case 'weekly': freq = RRule.WEEKLY; break;
        case 'every 2 weeks': freq = RRule.WEEKLY; break; // interval will be 2
        case 'monthly': freq = RRule.MONTHLY; break;
        case 'every 2 months': freq = RRule.MONTHLY; break; // interval will be 2
        case 'every 3 months': freq = RRule.MONTHLY; break; // interval will be 3
        case 'twice a year': freq = RRule.MONTHLY; break; // interval will be 6
        case 'yearly': freq = RRule.YEARLY; break;
        default: return; // Skip if cadence is not recognized
      }

      const ruleOptions = {
        freq: freq,
        dtstart: new Date(item.billing_date || item.start_date),
        interval: item.quantity || 1,
      };

      if (item.end_date) {
        ruleOptions.until = new Date(item.end_date);
      }

      const rule = new RRule(ruleOptions);
      const occurrences = rule.between(projectionStartDate, projectionEndDate);

      occurrences.forEach(date => {
        projectedTransactions.push({
          date: format(date, 'yyyy-MM-dd'),
          amount: item.is_income ? Math.abs(parseFloat(item.amount)) : -Math.abs(parseFloat(item.amount)),
          description: item.payee || 'Recurring Transaction',
          is_income: item.is_income
        });
      });
    }
  });

  projectedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  const dailyBalances = [];
  const negativeBalanceAlerts = [];
  const keyEvents = [];
  let currentBalance = parseFloat(selectedAccount.balance);

  for (let d = new Date(projectionStartDate); d <= projectionEndDate; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, 'yyyy-MM-dd');
    
    const todaysTransactions = projectedTransactions.filter(t => t.date === dateStr);

    todaysTransactions.forEach(t => {
        currentBalance += parseFloat(t.amount);
        keyEvents.push(t);
        if (currentBalance < 0) {
            negativeBalanceAlerts.push({ date: dateStr, balance: currentBalance, transaction: t});
        }
    });

    dailyBalances.push({ date: dateStr, balance: currentBalance });
  }

  return { dailyBalances, keyEvents, negativeBalanceAlerts };
};