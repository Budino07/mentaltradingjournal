/**
 * Generates options for month selection in the Mental Wrapped feature.
 * In a real implementation, this would filter only completed months with data.
 */
export function generateMonthOptions() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Generate the last 12 months (excluding current month)
  const months = [];
  
  for (let i = 1; i <= 12; i++) {
    const monthIndex = (currentMonth - i + 12) % 12;
    let year = currentYear;
    
    if (monthIndex > currentMonth) {
      year -= 1;
    }
    
    const date = new Date(year, monthIndex, 1);
    const monthValue = date.toISOString().substring(0, 7); // YYYY-MM format
    const monthLabel = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    months.push({ value: monthValue, label: monthLabel });
  }
  
  return months;
}
