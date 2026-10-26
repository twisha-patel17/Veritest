
const express = require("express");
const { z } = require("zod");

const authService = require("../services/auth.service");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

const REFRESH_COOKIE_NAME = authService.REFRESH_COOKIE_NAME;

const handleError = (error, res, next) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
};

router.post("/register", async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid name, email, and password.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const resultData = await authService.register(result.data, res);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      ...resultData,
    });
  } catch (error) {
    return handleError(error, res, next);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and password.",
      });
    }

    const resultData = await authService.login(result.data, res);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      ...resultData,
    });
  } catch (error) {
    return handleError(error, res, next);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    const resultData = await authService.refreshSession(
      refreshToken,
      res
    );

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully.",
      ...resultData,
    });
  } catch (error) {
    return handleError(error, res, next);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    await authService.logout(refreshToken, res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    return handleError(error, res, next);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return handleError(error, res, next);
  }
});

module.exports = router;
