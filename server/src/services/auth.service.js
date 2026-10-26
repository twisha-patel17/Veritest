
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_MS,
} = require("../utils/tokens");

const REFRESH_COOKIE_NAME = "veritest_refresh";

const getRefreshExpiry = () => {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const createSession = async (userId, res) => {
  const sessionId = crypto.randomUUID();

  const refreshToken = generateRefreshToken(userId, sessionId);

  await prisma.refreshSession.create({
    data: {
      id: sessionId,
      userId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: getRefreshExpiry(),
    },
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  return {
    accessToken: generateAccessToken(userId),
  };
};

const register = async ({ name, email, password }, res) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let user;

  try {
    user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
    });
  } catch (error) {
    // Protect against two simultaneous registrations using the same email.
    if (error.code === "P2002") {
      const conflict = new Error("An account with this email already exists.");
      conflict.statusCode = 409;
      throw conflict;
    }

    throw error;
  }

  try {
    const tokens = await createSession(user.id, res);

    return {
      ...tokens,
      user: publicUser(user),
    };
  } catch (error) {
    // Avoid leaving a newly registered account without a usable session
    // if session creation fails.
    await prisma.user.delete({ where: { id: user.id } });
    throw error;
  }
};

const login = async ({ email, password }, res) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const tokens = await createSession(user.id, res);

  return {
    ...tokens,
    user: publicUser(user),
  };
};

const refreshSession = async (refreshToken, res) => {
  if (!refreshToken) {
    const error = new Error("Refresh token is required.");
    error.statusCode = 401;
    throw error;
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const error = new Error("Refresh token is invalid or expired.");
    error.statusCode = 401;
    throw error;
  }

  if (
    decoded.type !== "refresh" ||
    typeof decoded.userId !== "string" ||
    typeof decoded.sessionId !== "string"
  ) {
    const error = new Error("Invalid refresh token.");
    error.statusCode = 401;
    throw error;
  }

  const session = await prisma.refreshSession.findUnique({
    where: { id: decoded.sessionId },
  });

  if (
    !session ||
    session.userId !== decoded.userId ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    session.tokenHash !== hashRefreshToken(refreshToken)
  ) {
    const error = new Error("Refresh session is invalid or expired.");
    error.statusCode = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    const error = new Error("User account no longer exists.");
    error.statusCode = 401;
    throw error;
  }

  const nextSessionId = crypto.randomUUID();
  const nextRefreshToken = generateRefreshToken(user.id, nextSessionId);

  // Replace the old session atomically, so the old token cannot be reused.
  await prisma.$transaction(async (tx) => {
    const updated = await tx.refreshSession.updateMany({
      where: {
        id: session.id,
        tokenHash: hashRefreshToken(refreshToken),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      const error = new Error("Refresh token has already been used.");
      error.statusCode = 401;
      throw error;
    }

    await tx.refreshSession.create({
      data: {
        id: nextSessionId,
        userId: user.id,
        tokenHash: hashRefreshToken(nextRefreshToken),
        expiresAt: getRefreshExpiry(),
      },
    });
  });

  res.cookie(REFRESH_COOKIE_NAME, nextRefreshToken, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  return {
    accessToken: generateAccessToken(user.id),
    user: publicUser(user),
  };
};

const logout = async (refreshToken, res) => {
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      if (
        decoded.type === "refresh" &&
        typeof decoded.sessionId === "string"
      ) {
        await prisma.refreshSession.updateMany({
          where: {
            id: decoded.sessionId,
            tokenHash: hashRefreshToken(refreshToken),
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      // Even an expired or invalid refresh token should be cleared locally.
    }
  }

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/api/auth",
  });
};

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    const error = new Error("User account no longer exists.");
    error.statusCode = 401;
    throw error;
  }

  return user;
};

module.exports = {
  register,
  login,
  refreshSession,
  logout,
  getCurrentUser,
  REFRESH_COOKIE_NAME,
};
