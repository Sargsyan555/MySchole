import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const ADMIN_COOKIE_NAME = 'school_admin';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * @param {string} jwtSecret
 */
export function requireAdmin(jwtSecret) {
  return (req, res, next) => {
    const token = req.cookies?.[ADMIN_COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      jwt.verify(token, jwtSecret);
      next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {{ jwtSecret: string; adminEmail: string; passwordHash?: string; plainPassword?: string }} opts
 */
export async function handleAdminLogin(req, res, opts) {
  const { email, password } = req.body || {};
  const wantEmail = String(opts.adminEmail || '').toLowerCase().trim();
  const gotEmail = String(email || '')
    .toLowerCase()
    .trim();
  if (!password || !gotEmail || gotEmail !== wantEmail) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  let ok = false;
  if (opts.passwordHash) {
    ok = await bcrypt.compare(String(password), opts.passwordHash);
  } else if (opts.plainPassword != null && opts.plainPassword !== '') {
    ok = String(password) === String(opts.plainPassword);
    if (ok) {
      console.warn('[auth] Using ADMIN_PASSWORD (plaintext). Set ADMIN_PASSWORD_HASH for production.');
    }
  } else {
    console.error('[auth] No ADMIN_PASSWORD_HASH or ADMIN_PASSWORD in environment — login disabled.');
    return res.status(503).json({ error: 'Server auth not configured' });
  }

  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ sub: 'admin' }, opts.jwtSecret, { expiresIn: '7d' });
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  });
  res.json({ ok: true });
}

/** @param {import('express').Response} res */
export function handleAdminLogout(_req, res) {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} jwtSecret
 */
export function handleAdminSession(req, res, jwtSecret) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(token, jwtSecret);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
