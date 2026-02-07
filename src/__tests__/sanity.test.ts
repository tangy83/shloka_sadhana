// Sanity test to verify Jest is working
describe('Jest Setup', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should have access to global objects', () => {
    expect(global).toBeDefined();
  });

  it('should be able to do basic math', () => {
    expect(1 + 1).toBe(2);
  });
});
