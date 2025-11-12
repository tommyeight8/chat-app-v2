import { isSpoofedBot } from "@arcjet/inspect";

export const createRateLimitMiddleware = (arcjetInstance) => {
  return async (req, res, next) => {
    try {
      // Get the real client IP (trust proxy or forwarded header)
      const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;

      // Use user ID if authenticated, otherwise fallback to IP
      const identifier = req.user?.id || clientIp;

      // ✅ Explicitly tell Arcjet the correct IP
      const decision = await arcjetInstance.protect(req, {
        ip: clientIp, // <-- The missing piece
        userId: identifier,
        requested: 1,
      });

      console.log(
        "Arcjet decision:",
        decision.conclusion,
        "| IP:",
        clientIp,
        "| isHosting:",
        decision.ip?.isHosting()
      );

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

      // ✅ Check for hosting IPs (VPNs, proxies, cloud providers)
      // Only block in production, never in dev/testing
      if (process.env.ARCJET_ENV === "production" && decision.ip.isHosting()) {
        console.log("❌ Denied due to hosting IP:", clientIp);
        return res.status(403).json({
          error: "Requests from hosting providers are not allowed",
        });
      }

      // Check for spoofed bots (paid Arcjet feature)
      if (decision.results.some(isSpoofedBot)) {
        return res.status(403).json({
          error: "Bot verification failed",
        });
      }

      // ✅ Request is allowed
      next();
    } catch (error) {
      console.error("❌ Arcjet error:", error.message);
      // Fail open - allow request if Arcjet has an error
      next();
    }
  };
};
