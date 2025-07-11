
export function formatCurrency(value) {
  if (typeof value !== 'number') {
    return '';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
