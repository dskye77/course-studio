// src/middleware/csrf.js
import csrf from 'csrf';
const tokens = new csrf();

export function validateCsrf(req) {
  const token = req.headers['x-csrf-token'];
  const secret = req.cookies['csrf-secret'];
  return tokens.verify(secret, token);
}