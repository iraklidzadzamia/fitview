import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export function hashPassword(value: string) {
  return bcrypt.hash(value, BCRYPT_ROUNDS);
}

export function verifyPassword(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}
