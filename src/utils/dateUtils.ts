
// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Extract time from date
export const getTimeFromDate = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  
  return `${formattedHours}:${minutes} ${period}`;
};
