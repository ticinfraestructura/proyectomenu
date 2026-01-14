import { hashPassword, comparePassword } from '../../src/utils/password';
import { generateAccessToken, verifyToken } from '../../src/utils/jwt';

describe('Password Utils', () => {
  const testPassword = 'TestPassword123!';

  it('should hash a password', async () => {
    const hash = await hashPassword(testPassword);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(testPassword);
  });

  it('should compare password correctly', async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await comparePassword(testPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should reject wrong password', async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await comparePassword('WrongPassword', hash);
    expect(isValid).toBe(false);
  });
});

describe('JWT Utils', () => {
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    roles: ['ADMIN'],
  };

  it('should generate a valid token', () => {
    const token = generateAccessToken(testPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should verify a valid token', () => {
    const token = generateAccessToken(testPayload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(testPayload.userId);
    expect(decoded.email).toBe(testPayload.email);
    expect(decoded.roles).toEqual(testPayload.roles);
  });

  it('should throw on invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });
});
