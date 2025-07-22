import { RRule } from 'rrule';
import { format } from 'date-fns';

function generateRangeArray(endValue) {
  const startValue = 28;
  const length = endValue - startValue + 1;
  return Array.from({ length: length }, (_, i) => startValue + i);
}

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
      let dtstart = projectionStartDate;
      if (item.start_date) {
        const [year, month, day] = item.start_date.split('-').map(Number);
        const start_date = new Date(Date.UTC(year, month - 1, day));
        if (start_date > dtstart) {
          dtstart = start_date;
        }
      }

      const ruleOptions = {
        dtstart: dtstart,
        interval: item.quantity || 1,
      };

      const [anchorYear, anchorMonth, anchorDay] = item.billing_date.split('-').map(Number);
      const anchorDate = new Date(Date.UTC(anchorYear, anchorMonth - 1, anchorDay));

      switch (item.granularity) {
        case 'day': {
          ruleOptions.freq = RRule.DAILY;
          // RRule doesn't have a concept of an anchor date, so we adjust dtstart
          // to be the first occurrence on or after the projection start date.
          const timeDiff = anchorDate.getTime() - ruleOptions.dtstart.getTime();
          // Use Math.round to handle potential DST edge cases, although dates are UTC.
          const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));
          const interval = ruleOptions.interval;
          const remainder = daysDiff % interval;
          if (remainder !== 0) {
          const daysToAdd = remainder;
            const newStartDate = new Date(ruleOptions.dtstart);
          newStartDate.setUTCDate(ruleOptions.dtstart.getUTCDate() + daysToAdd);
            ruleOptions.dtstart = newStartDate;
          }
          break;
        }
        case 'week': {
          ruleOptions.freq = RRule.WEEKLY;
          ruleOptions.byweekday = (anchorDate.getUTCDay() + 6) % 7;
          const timeDiff = anchorDate.getTime() - ruleOptions.dtstart.getTime();
          const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 7));
          const interval = ruleOptions.interval;
          const remainder = weeksDiff % interval;
          if (remainder !== 0) {
            const weeksToAdd = interval - remainder;
            const newStartDate = new Date(ruleOptions.dtstart);
            newStartDate.setUTCDate(ruleOptions.dtstart.getUTCDate() + weeksToAdd * 7);
            ruleOptions.dtstart = newStartDate;
          }
          break;
        }
        case 'month': {
          ruleOptions.freq = RRule.MONTHLY;
          ruleOptions.bymonthday = anchorDay;
          if (ruleOptions.dtstart < projectionStartDate) {
            const monthDiff = (anchorDate.getUTCFullYear() - ruleOptions.dtstart.getUTCFullYear()) * 12 + (anchorDate.getUTCMonth() - ruleOptions.dtstart.getUTCMonth());
            const interval = ruleOptions.interval;
            const remainder = monthDiff % interval;
            if (remainder !== 0) {
              const monthsToAdd = interval - remainder;
              const newStartDate = new Date(ruleOptions.dtstart);
              newStartDate.setUTCMonth(ruleOptions.dtstart.getUTCMonth() + monthsToAdd);
              ruleOptions.dtstart = newStartDate;
            }
          }
          break;
        }
        case 'year': {
          ruleOptions.freq = RRule.YEARLY;
          ruleOptions.bymonthday = anchorDay;
          ruleOptions.bymonth = anchorMonth;
          if (ruleOptions.dtstart < projectionStartDate) {
            const yearDiff = projectionStartDate.getUTCFullYear() - ruleOptions.dtstart.getUTCFullYear();
            const interval = ruleOptions.interval;
            const remainder = yearDiff % interval;
            if (remainder !== 0) {
              const yearsToAdd = interval - remainder;
              const newStartDate = new Date(ruleOptions.dtstart);
              newStartDate.setUTCFullYear(ruleOptions.dtstart.getUTCFullYear() + yearDiff + yearsToAdd);
              ruleOptions.dtstart = newStartDate;
            }
          }
          break;
        }
        default:
          return; // Skip if cadence is not recognized
      }

      if (ruleOptions.bymonthday >= 29) { // If the start day is 29, 30, or 31
        ruleOptions.bymonthday = generateRangeArray(ruleOptions.bymonthday);
        ruleOptions.bysetpos = -1; // Take the last day from the set
      }

      if (item.cadence === 'twice a month') {
        let secondDate;
        if (anchorDay >= 15) {
          secondDate = Math.min(15, anchorDay - 14)
        } else {
          secondDate = anchorDay + 14
        }
        if (Array.isArray(ruleOptions.bymonthday)) {
          ruleOptions.bymonthday.unshift(secondDate)
          ruleOptions.bysetpos = [1, -1]
        } else {
          ruleOptions.bymonthday = [ruleOptions.bymonthday, secondDate]
        }
      }

      if (item.end_date) {
        const [endYear, endMonth, endDay] = item.end_date.split('-').map(Number);
        ruleOptions.until = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59));
      }

      const rule = new RRule(ruleOptions);
      const occurrences = rule.between(projectionStartDate, projectionEndDate);

      occurrences.forEach(date => {
        const formattedDate = getUTCDateString(date);

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