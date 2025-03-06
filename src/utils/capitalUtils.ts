
// Default initial trading capital (used if user hasn't set a custom value)
const DEFAULT_INITIAL_CAPITAL = 10000;

// LocalStorage key for saving the user's initial capital
const INITIAL_CAPITAL_KEY = 'tradingJournal_initialCapital';

/**
 * Get the user's initial capital amount from localStorage
 * Returns the default value if not set
 */
export const getInitialCapital = (): number => {
  const savedCapital = localStorage.getItem(INITIAL_CAPITAL_KEY);
  if (savedCapital) {
    const parsed = parseFloat(savedCapital);
    return isNaN(parsed) ? DEFAULT_INITIAL_CAPITAL : parsed;
  }
  return DEFAULT_INITIAL_CAPITAL;
};

/**
 * Save the user's initial capital amount to localStorage
 */
export const setInitialCapital = (amount: number): void => {
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Initial capital must be a positive number');
  }
  localStorage.setItem(INITIAL_CAPITAL_KEY, amount.toString());
};

/**
 * Format a currency value for display
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
