
/**
 * Format a number as currency (EGP)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Filter orders by date range
 */
export const filterOrdersByDate = (
  orders: any[], 
  startDate?: Date | null, 
  endDate?: Date | null
): any[] => {
  if (!startDate && !endDate) return orders;

  return orders.filter(order => {
    const orderDate = new Date(order.date || order.created_at);
    
    if (startDate && endDate) {
      // Set endDate to the end of the day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      return orderDate >= startDate && orderDate <= endOfDay;
    } else if (startDate) {
      return orderDate >= startDate;
    } else if (endDate) {
      // Set endDate to the end of the day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      return orderDate <= endOfDay;
    }
    
    return true;
  });
};

/**
 * Format an ID with dashes for better readability
 */
export const formatId = (id: string, pattern: number[] = [4, 4, 4]): string => {
  if (!id) return '';
  
  let result = '';
  let currentIndex = 0;
  
  for (let i = 0; i < pattern.length; i++) {
    const segment = id.substring(currentIndex, currentIndex + pattern[i]);
    if (segment) {
      result += (i > 0 ? '-' : '') + segment;
      currentIndex += pattern[i];
    }
  }
  
  // Add remaining characters if any
  if (currentIndex < id.length) {
    result += '-' + id.substring(currentIndex);
  }
  
  return result;
};

/**
 * Get status badge variant based on order status
 */
export const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
  switch (status) {
    case "delivered": return "success";
    case "processing": 
    case "shipped": return "default";
    case "pending": return "secondary";
    case "cancelled": return "destructive";
    default: return "outline";
  }
};
