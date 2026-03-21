import rateLimit from "express-rate-limit";

// Global rate limiter applied to all API requests
export const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 150, // Limit each IP to 150 requests per windowMs
	message: {
		message: "Too many requests from this IP, please try again after 15 minutes",
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for sensitive authentication routes
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 login/register attempts per windowMs
	message: {
		message: "Too many authentication attempts. Please try again after 15 minutes.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});
