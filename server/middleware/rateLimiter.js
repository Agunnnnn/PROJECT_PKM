// Rate Limiter in-memory untuk autentikasi (mencegah brute force attack)
const loginAttempts = new Map();

export const rateLimitLogin = (req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 menit
  const maxRequests = 10; // Maksimal 10 request login per window

  const record = loginAttempts.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }
  loginAttempts.set(ip, record);

  const remaining = Math.max(0, maxRequests - record.count);
  res.set("X-RateLimit-Limit", maxRequests.toString());
  res.set("X-RateLimit-Remaining", remaining.toString());
  res.set("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000).toString());

  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.set("Retry-After", retryAfter.toString());
    return res.status(429).json({
      message: "Terlalu banyak percobaan login. Silakan coba beberapa saat lagi.",
    });
  }

  next();
};
