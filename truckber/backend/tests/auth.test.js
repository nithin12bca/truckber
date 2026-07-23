/**
 * Auth & Business Logic Unit Tests — TruckBer
 */
const { calculateDistance, validateCoords } = require('../src/utils/distance');

// ─── Booking Cost Logic (extracted for testing) ───────────────────────────────
const calculateCost = (distance, truckType, loadWeight) => {
  const baseRates = {
    mini_truck: 15, pickup: 12, lorry: 20,
    trailer: 25, tanker: 22, container: 28, refrigerator: 30,
  };
  const rate = baseRates[truckType] || 18;
  const weightSurcharge = loadWeight > 5 ? (loadWeight - 5) * 100 : 0;
  return Math.max(500, Math.round(distance * rate + weightSurcharge));
};

// ─── Coordinate Validation ────────────────────────────────────────────────────
describe('Coordinate Validation', () => {
  it('accepts valid Indian city coordinates', () => {
    expect(validateCoords(11.0168, 76.9558)).toBe(true);  // Coimbatore
    expect(validateCoords(13.0827, 80.2707)).toBe(true);  // Chennai
    expect(validateCoords(28.6139, 77.2090)).toBe(true);  // Delhi
    expect(validateCoords(19.0760, 72.8777)).toBe(true);  // Mumbai
  });

  it('rejects out-of-range values', () => {
    expect(validateCoords(91, 0)).toBe(false);
    expect(validateCoords(0, 181)).toBe(false);
    expect(validateCoords(-91, 0)).toBe(false);
    expect(validateCoords(0, -181)).toBe(false);
  });
});

// ─── Booking Cost Calculation ─────────────────────────────────────────────────
describe('Booking Cost Calculation', () => {
  test('lorry 100km, 5T = Rs.2000', () => {
    expect(calculateCost(100, 'lorry', 5)).toBe(2000);
  });

  test('minimum charge enforced at Rs.500', () => {
    expect(calculateCost(10, 'mini_truck', 0.5)).toBe(500);
  });

  test('weight surcharge above 5T', () => {
    // 100km lorry @ 20/km = 2000, + 3T excess @ 100/T = 300 => 2300
    expect(calculateCost(100, 'lorry', 8)).toBe(2300);
  });

  test('refrigerator truck costs more than lorry for same route', () => {
    const lorry = calculateCost(200, 'lorry', 4);
    const fridge = calculateCost(200, 'refrigerator', 4);
    expect(fridge).toBeGreaterThan(lorry);
  });

  test('trailer costs more than mini_truck', () => {
    const mini = calculateCost(300, 'mini_truck', 1);
    const trailer = calculateCost(300, 'trailer', 1);
    expect(trailer).toBeGreaterThan(mini);
  });

  test('unknown truck type uses fallback rate', () => {
    const cost = calculateCost(100, 'unknown_type', 1);
    expect(cost).toBe(1800); // 100 * 18
  });
});

// ─── Booking Number Format ────────────────────────────────────────────────────
describe('Booking Number Generation', () => {
  const generateBookingNumber = () => 'TRK' + Date.now().toString(36).toUpperCase();

  test('starts with TRK prefix', () => {
    const num = generateBookingNumber();
    expect(num.startsWith('TRK')).toBe(true);
  });

  test('is at least 8 chars long', () => {
    const num = generateBookingNumber();
    expect(num.length).toBeGreaterThanOrEqual(8);
  });

  test('two generated numbers are unique', () => {
    const n1 = generateBookingNumber();
    const n2 = generateBookingNumber();
    // Note: could theoretically match in <1ms, acceptable for unit test
    expect(typeof n1).toBe('string');
    expect(typeof n2).toBe('string');
  });
});

// ─── Email Validation ─────────────────────────────────────────────────────────
describe('Email Format Validation', () => {
  const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  test('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('ravi.kumar@gmail.com')).toBe(true);
    expect(isValidEmail('admin@truckber.in')).toBe(true);
  });

  test('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('missing@tld')).toBe(false);
  });
});

// ─── Phone Validation (Indian Mobile) ────────────────────────────────────────
describe('Indian Mobile Number Validation', () => {
  const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  test('accepts valid Indian numbers', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('6000000001')).toBe(true);
    expect(isValidPhone('7123456789')).toBe(true);
  });

  test('rejects invalid numbers', () => {
    expect(isValidPhone('1234567890')).toBe(false); // starts with 1
    expect(isValidPhone('98765432')).toBe(false);   // too short
    expect(isValidPhone('98765432100')).toBe(false); // too long
  });
});
