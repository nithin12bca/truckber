const { calculateDistance } = require('../src/utils/distance');

describe('Distance Calculation (Haversine Formula)', () => {
  test('Distance between same point should be 0', () => {
    expect(calculateDistance(11.0168, 76.9558, 11.0168, 76.9558)).toBe(0);
  });

  test('Distance between Coimbatore and Chennai should be ~500 km', () => {
    const dist = calculateDistance(11.0168, 76.9558, 13.0827, 80.2707);
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(550);
  });

  test('Distance between Delhi and Mumbai should be ~1150 km', () => {
    const dist = calculateDistance(28.6139, 77.2090, 19.0760, 72.8777);
    expect(dist).toBeGreaterThan(1100);
    expect(dist).toBeLessThan(1250);
  });

  test('Should return number type', () => {
    expect(typeof calculateDistance(0, 0, 1, 1)).toBe('number');
  });
});
