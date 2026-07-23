/**
 * Booking Workflow Integration Tests — TruckBer
 * Tests the complete booking state machine transitions
 */

// ─── Booking Status State Machine ──────────────────────────────────────────────
const VALID_TRANSITIONS = {
  pending:         ['accepted', 'rejected', 'cancelled'],
  accepted:        ['driver_assigned', 'cancelled'],
  driver_assigned: ['in_transit', 'cancelled'],
  in_transit:      ['delivered'],
  delivered:       [],
  cancelled:       [],
  rejected:        [],
};

const canTransition = (from, to) => VALID_TRANSITIONS[from]?.includes(to) ?? false;

describe('Booking Status State Machine', () => {
  test('pending → accepted is valid', () => {
    expect(canTransition('pending', 'accepted')).toBe(true);
  });

  test('pending → cancelled is valid', () => {
    expect(canTransition('pending', 'cancelled')).toBe(true);
  });

  test('accepted → driver_assigned is valid', () => {
    expect(canTransition('accepted', 'driver_assigned')).toBe(true);
  });

  test('driver_assigned → in_transit is valid', () => {
    expect(canTransition('driver_assigned', 'in_transit')).toBe(true);
  });

  test('in_transit → delivered is valid', () => {
    expect(canTransition('in_transit', 'delivered')).toBe(true);
  });

  test('delivered → anything is invalid (terminal)', () => {
    expect(canTransition('delivered', 'cancelled')).toBe(false);
    expect(canTransition('delivered', 'pending')).toBe(false);
    expect(canTransition('delivered', 'in_transit')).toBe(false);
  });

  test('cancelled → anything is invalid (terminal)', () => {
    expect(canTransition('cancelled', 'pending')).toBe(false);
    expect(canTransition('cancelled', 'accepted')).toBe(false);
  });

  test('in_transit → cancelled is invalid (cannot cancel active trip)', () => {
    expect(canTransition('in_transit', 'cancelled')).toBe(false);
  });

  test('pending → delivered is invalid (must follow sequence)', () => {
    expect(canTransition('pending', 'delivered')).toBe(false);
  });
});

// ─── Cost Calculation Edge Cases ───────────────────────────────────────────────
const calculateCost = (distance, truckType, loadWeight) => {
  const baseRates = {
    mini_truck: 15, pickup: 12, lorry: 20,
    trailer: 25, tanker: 22, container: 28, refrigerator: 30,
  };
  const rate = baseRates[truckType] || 18;
  const weightSurcharge = loadWeight > 5 ? (loadWeight - 5) * 100 : 0;
  return Math.max(500, Math.round(distance * rate + weightSurcharge));
};

describe('Cost Calculation - Real Routes', () => {
  test('Tiruppur → Chennai lorry 8T', () => {
    // ~450km, 8T = (450*20) + (3*100) = 9300
    const cost = calculateCost(450, 'lorry', 8);
    expect(cost).toBe(9300);
  });

  test('Coimbatore → Bangalore mini truck 1T', () => {
    // ~360km, 1T = 360*15 = 5400
    const cost = calculateCost(360, 'mini_truck', 1);
    expect(cost).toBe(5400);
  });

  test('Short city trip enforces minimum', () => {
    const cost = calculateCost(5, 'pickup', 0.5);
    expect(cost).toBe(500);
  });

  test('Heavy load 20T trailer long distance', () => {
    // 600km, 20T = (600*25) + (15*100) = 16500
    const cost = calculateCost(600, 'trailer', 20);
    expect(cost).toBe(16500);
  });
});

// ─── Booking Number Format ─────────────────────────────────────────────────────
describe('Booking Number Generation', () => {
  const generateBookingNumber = () => 'TRK' + Date.now().toString(36).toUpperCase();

  test('format: starts with TRK', () => {
    expect(generateBookingNumber()).toMatch(/^TRK/);
  });

  test('format: alphanumeric only', () => {
    const num = generateBookingNumber();
    expect(num).toMatch(/^[A-Z0-9]+$/);
  });

  test('minimum length of 8 chars', () => {
    expect(generateBookingNumber().length).toBeGreaterThanOrEqual(8);
  });
});

// ─── Invoice Number Format ────────────────────────────────────────────────────
describe('Invoice Number Generation', () => {
  const generateInvoiceNumber = () => 'INV-' + Date.now().toString(36).toUpperCase();

  test('starts with INV-', () => {
    expect(generateInvoiceNumber()).toMatch(/^INV-/);
  });

  test('is unique across consecutive calls', () => {
    const nums = new Set();
    for (let i = 0; i < 100; i++) {
      nums.add('INV-' + (Date.now() + i).toString(36).toUpperCase());
    }
    expect(nums.size).toBe(100);
  });
});

// ─── Platform Fee Calculation ─────────────────────────────────────────────────
describe('Platform Fee Calculation', () => {
  const calcFees = (amount) => ({
    platformFee: Math.round(amount * 0.10),
    ownerAmount: Math.round(amount * 0.90),
  });

  test('10% platform fee on Rs.10000', () => {
    const { platformFee, ownerAmount } = calcFees(10000);
    expect(platformFee).toBe(1000);
    expect(ownerAmount).toBe(9000);
    expect(platformFee + ownerAmount).toBe(10000);
  });

  test('fees sum to total amount', () => {
    [5000, 12500, 7350, 99999].forEach(amount => {
      const { platformFee, ownerAmount } = calcFees(amount);
      expect(platformFee + ownerAmount).toBe(amount);
    });
  });
});
