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
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Cash Flow Projection',
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
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
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

  return <Line options={options} data={data} />;
};

export default CashFlowChart;