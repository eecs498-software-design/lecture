/**
 * Order Processing Module
 * 
 * Handles validation, pricing calculations, and confirmation
 * emails for customer orders.
 * 
 * @module order-processing
 */

export interface OrderItem {
  name: string;
  /** Unit price in USD */
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerEmail: string;
  items: OrderItem[];
  status: 'pending' | 'processed' | 'shipped';
  /** Discount as a decimal (e.g., 0.1 for 10% off) */
  discount?: number;
}

export interface ProcessedOrder extends Order {
  subtotal: number;
  tax: number;
  total: number;
  confirmationNumber: string;
}

/**
 * Processes a pending order: validates, calculates totals,
 * and sends a confirmation email to the customer.
 * 
 * @throws {Error} If order validation fails
 */
function processOrder(order: Order): ProcessedOrder {
  // Validate order
  if (order.items.length === 0) {
    throw new Error('Order must have at least one item');
  }
  
  for (const item of order.items) {
    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity for item: ${item.name}`);
    }
  }
  
  if (!order.customerEmail.includes('@') || !order.customerEmail.includes('.')) {
    throw new Error('Invalid customer email');
  }
  
  // Calculate subtotal
  let subtotal = 0;
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
  }
  
  // Apply discount
  if (order.discount) {
    subtotal = subtotal * (1 - order.discount);
  }
  
  // Calculate tax
  const TAX_RATE = 0.08; // Michigan combined state + local
  const tax = subtotal * TAX_RATE;
  
  // Calculate total
  const total = subtotal + tax;
  
  // Generate confirmation number
  const confirmationNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  // Create processed order
  const processedOrder: ProcessedOrder = {
    id: order.id,
    customerEmail: order.customerEmail,
    items: order.items,
    status: 'processed',
    ...(order.discount !== undefined && { discount: order.discount }),
    subtotal: subtotal,
    tax: tax,
    total: total,
    confirmationNumber: confirmationNumber
  };
  
  // Build and send email
  const subject = `Order Confirmation: ${confirmationNumber}`;
  
  let itemsList = '';
  let isFirst = true;
  for (const item of order.items) {
    if (!isFirst) {
      itemsList += '\n';
    }
    itemsList += `  - ${item.name}: ${item.quantity} x $${item.price.toFixed(2)}`;
    isFirst = false;
  }
  
  const body = `Thank you for your order!

Order ID: ${order.id}
Confirmation: ${confirmationNumber}

Items:
${itemsList}

Subtotal: $${subtotal.toFixed(2)}
Tax: $${tax.toFixed(2)}
Total: $${total.toFixed(2)}`;
  
  // TODO: Replace with actual email service (SendGrid, SES, etc.)
  console.log(`Sending email to ${order.customerEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
  
  return processedOrder;
}

// ============================================
// USAGE EXAMPLE
// ============================================

const sampleOrder: Order = {
  id: '12345',
  customerEmail: 'customer@example.com',
  items: [
    { name: 'Widget', price: 29.99, quantity: 2 },
    { name: 'Gadget', price: 49.99, quantity: 1 }
  ],
  status: 'pending',
  discount: 0.1
};

const result = processOrder(sampleOrder);
console.log('\nProcessed Order:', result);
