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
} from 'chart.js';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react';
import { formatCurrency } from '../utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CashFlowChart = ({ data, keyEvents }) => {
  const bg = useColorModeValue('white', 'gray.700');

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
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
  };

  return (
    <Box w="100%" bg={bg} borderRadius="lg" boxShadow="md" p={6}>
      <Heading size="lg" mb={4}>Cash Flow Projection</Heading>
      <Line options={options} data={data} />
    </Box>
  );
};

export default CashFlowChart;