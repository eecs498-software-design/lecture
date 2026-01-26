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
export function processOrder(order: Order): ProcessedOrder {
  validateOrder(order);
  const totals = calculateTotals(order);
  const processedOrder = finalizeOrder(order, totals);
  sendConfirmationEmail(processedOrder);
  return processedOrder;
}

function validateOrder(order: Order): void {
  validateOrderHasItems(order);
  validateItemQuantities(order);
  validateCustomerEmail(order);
}

function validateOrderHasItems(order: Order): void {
  if (order.items.length === 0) {
    throw new Error('Order must have at least one item');
  }
}

function validateItemQuantities(order: Order): void {
  for (const item of order.items) {
    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity for item: ${item.name}`);
    }
  }
}

function validateCustomerEmail(order: Order): void {
  if (!isValidEmail(order.customerEmail)) {
    throw new Error('Invalid customer email');
  }
}

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

/** Intermediate totals used during order processing */
interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

function calculateTotals(order: Order): OrderTotals {
  const subtotal = calculateSubtotal(order);
  const discountedSubtotal = applyDiscount(subtotal, order.discount);
  const tax = calculateTax(discountedSubtotal);
  const total = discountedSubtotal + tax;
  return { subtotal: discountedSubtotal, tax, total };
}

function calculateSubtotal(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );
}

function calculateItemTotal(item: OrderItem): number {
  return item.price * item.quantity;
}

function applyDiscount(subtotal: number, discount?: number): number {
  if (!discount) return subtotal;
  return subtotal * (1 - discount);
}

function calculateTax(amount: number): number {
  const TAX_RATE = 0.08; // Michigan combined state + local
  return amount * TAX_RATE;
}

function finalizeOrder(order: Order, totals: OrderTotals): ProcessedOrder {
  return {
    ...order,
    status: 'processed',
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    confirmationNumber: generateConfirmationNumber()
  };
}

function generateConfirmationNumber(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function sendConfirmationEmail(order: ProcessedOrder): void {
  const subject = buildEmailSubject(order);
  const body = buildEmailBody(order);
  sendEmail(order.customerEmail, subject, body);
}

function buildEmailSubject(order: ProcessedOrder): string {
  return `Order Confirmation: ${order.confirmationNumber}`;
}

function buildEmailBody(order: ProcessedOrder): string {
  const itemsList = formatItemsList(order.items);
  return `
Thank you for your order!

${formatOrderIdLine(order.id)}
${formatConfirmationLine(order.confirmationNumber)}

Items:
${itemsList}

${formatSubtotalLine(order.subtotal)}
${formatTaxLine(order.tax)}
${formatTotalLine(order.total)}
  `.trim();
}

function formatOrderIdLine(id: string): string {
  return `Order ID: ${id}`;
}

function formatConfirmationLine(confirmationNumber: string): string {
  return `Confirmation: ${confirmationNumber}`;
}

function formatSubtotalLine(subtotal: number): string {
  return `Subtotal: ${formatCurrency(subtotal)}`;
}

function formatTaxLine(tax: number): string {
  return `Tax: ${formatCurrency(tax)}`;
}

function formatTotalLine(total: number): string {
  return `Total: ${formatCurrency(total)}`;
}

function formatItemsList(items: OrderItem[]): string {
  return items
    .map(item => `  - ${item.name}: ${item.quantity} x ${formatCurrency(item.price)}`)
    .join('\n');
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// TODO: Replace with actual email service (SendGrid, SES, etc.)
function sendEmail(to: string, subject: string, body: string): void {
  console.log(`Sending email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
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
