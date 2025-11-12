import { isSpoofedBot } from "@arcjet/inspect";

export const createRateLimitMiddleware = (arcjetInstance) => {
  return async (req, res, next) => {
    try {
      // Use user ID if authenticated, otherwise use IP
      const identifier = req.user?.id || req.ip;

      const decision = await arcjetInstance.protect(req, {
        userId: identifier,
        requested: 1,
      });

      console.log("Arcjet decision:", decision.conclusion);

      // Check if request is denied
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({
            error: "Too many requests. Please try again later.",
          });
        }

        if (decision.reason.isBot()) {
          return res.status(403).json({
            error: "No bots allowed",
          });
        }

        // Generic denial (Shield blocked it)
        return res.status(403).json({
          error: "Forbidden",
        });
      }

      // Check for hosting IPs (VPN, proxies, cloud providers)
      // These are often used by bots or malicious actors
      if (decision.ip.isHosting()) {
        return res.status(403).json({
          error: "Requests from hosting providers are not allowed",
        });
      }

      // Check for spoofed bots (paid Arcjet feature)
      // Verifies if a bot is legitimate using IP data
      if (decision.results.some(isSpoofedBot)) {
        return res.status(403).json({
          error: "Bot verification failed",
        });
      }

      // Request is allowed
      next();
    } catch (error) {
      console.error("❌ Arcjet error:", error.message);
      // Fail open - allow request if Arcjet has an error
      next();
    }
  };
};
