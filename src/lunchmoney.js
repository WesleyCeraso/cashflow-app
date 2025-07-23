import axios from 'axios';

const API_URL = 'https://dev.lunchmoney.app/v1';

export const getAccounts = async (apiKey) => {
  const response = await axios.get(`${API_URL}/assets`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return response.data;
};

export const getRecurringItems = async (apiKey, startDate, endDate) => {
  const response = await axios.get(`${API_URL}/recurring_items`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    params: {
        start_date: startDate,
        end_date: endDate,
    }
  });
  console.log('Raw recurring items API response:', response.data);
  return response.data;
};

export const getPlaidAccounts = async (apiKey) => {
  const response = await axios.get(`${API_URL}/plaid_accounts`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return response.data;
};