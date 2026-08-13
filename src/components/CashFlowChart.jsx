import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react';
import { formatCurrency } from '../utils';
import { format, parse } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const parseChartDate = (date) => parse(date, 'yyyy-MM-dd', new Date());

const formatXAxisLabel = (labels, index) => {
  const date = labels[index];
  if (!date) return '';

  const parsedDate = parseChartDate(date);
  const isShortRange = labels.length <= 45;

  if (isShortRange) {
    return index % 4 === 0 || index === labels.length - 1 ? format(parsedDate, 'MMM d') : '';
  }

  const previousDate = labels[index - 1];
  const previousMonth = previousDate ? parseChartDate(previousDate).getMonth() : null;
  return index === 0 || parsedDate.getMonth() !== previousMonth ? format(parsedDate, 'MMM') : '';
};

const CashFlowChart = ({ data, keyEvents }) => {
  const bg = useColorModeValue('white', 'gray.700');
  const positiveFillColor = useColorModeValue('rgba(66, 153, 225, 0.2)', 'rgba(144, 205, 244, 0.2)');
  const negativeFillColor = useColorModeValue('rgba(229, 62, 62, 0.2)', 'rgba(235, 100, 100, 0.2)');
  const positiveBorderColor = useColorModeValue('#4299E1', '#90CDF4');
  const negativeBorderColor = useColorModeValue('rgb(229, 62, 62)', 'rgb(235, 100, 100)');
  const oneOffPointColor = useColorModeValue('#805AD5', '#D6BCFA'); // Purple for local transactions
  const recurringIncomePointColor = useColorModeValue('#38A169', '#68D391');
  const neutralSegmentColor = useColorModeValue('#A0AEC0', '#718096');

  const hasRecurringIncome = (date) => keyEvents.some(event =>
    event.date === date &&
    !event.is_subtotal &&
    parseFloat(event.amount) > 0 &&
    (event.type === 'recurring-projected' || event.recurringId != null || event.is_income)
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        onClick: null,
      },
      title: {
        display: false, // Hide default title, use Chakra Heading instead
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
          afterLabel: function(context) {
            const date = context.label;
            const transactionsForDate = keyEvents.filter(event => event.date === date && !event.is_subtotal);
            if (transactionsForDate.length > 0) {
              let details = ['', 'Transactions:'];
              transactionsForDate.forEach(transaction => {
                details.push(`${transaction.description}: ${transaction.amount > 0 ? '+' : ''}${formatCurrency(parseFloat(transaction.amount))}`);
              });
              return details;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          callback: function(value, index) {
            return formatXAxisLabel(this.chart.data.labels, index);
          },
        },
      },
      y: {
        beginAtZero: true
      }
    }
  };

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      fill: {
        target: 'origin',
        above: positiveFillColor,
        below: negativeFillColor,
      },
      segment: {
        borderColor: neutralSegmentColor,
      },
      pointBackgroundColor: context => {
        const date = context.chart.data.labels[context.dataIndex];
        const isLocal = keyEvents.some(event => event.date === date && event.is_local);
        if (isLocal) {
          return oneOffPointColor;
        }
        if (hasRecurringIncome(date)) {
          return recurringIncomePointColor;
        }
        const value = context.parsed && context.parsed.y !== undefined ? context.parsed.y : 0;
        return value >= 0 ? positiveBorderColor : negativeBorderColor;
      },
      pointBorderColor: context => {
        const date = context.chart.data.labels[context.dataIndex];
        const isLocal = keyEvents.some(event => event.date === date && event.is_local);
        if (isLocal) {
          return oneOffPointColor;
        }
        if (hasRecurringIncome(date)) {
          return recurringIncomePointColor;
        }
        const value = context.parsed && context.parsed.y !== undefined ? context.parsed.y : 0;
        return value >= 0 ? positiveBorderColor : negativeBorderColor;
      },
      pointRadius: context => {
        const date = context.chart.data.labels[context.dataIndex];
        const hasTransactions = keyEvents.some(event => event.date === date && !event.is_subtotal);
        return hasRecurringIncome(date) ? 5 : (hasTransactions ? 3 : 0);
      },
      pointHitRadius: context => {
        const date = context.chart.data.labels[context.dataIndex];
        const hasTransactions = keyEvents.some(event => event.date === date && !event.is_subtotal);
        return hasTransactions ? 3 : 0;
      },
    })),
  };

  return (
    <Box w="100%" bg={bg} borderRadius="lg" boxShadow="md" p={6}>
      <Heading size="lg" mb={4}>Cash Flow Projection</Heading>
      <Line options={options} data={chartData} key={JSON.stringify(chartData.datasets)} />
    </Box>
  );
};

export default CashFlowChart;
