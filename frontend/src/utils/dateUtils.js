// frontend/src/utils/dateUtils.js (COMPLETE)

/**
 * Format a timestamp to relative time (e.g., "2m ago", "1h ago")
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";

  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - messageDate;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  // Less than 1 minute ago
  if (diffInMinutes < 1) {
    return "Just now";
  }

  // Less than 1 hour ago
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  // Less than 24 hours ago
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Less than 7 days ago
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // More than a week ago - show date
  return messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      messageDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Format distance to now (used by ChatList)
 * Returns formats like "2 minutes ago", "3 hours ago", "yesterday", etc.
 */
export const formatDistanceToNow = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  // Just now (less than 30 seconds)
  if (diffInSeconds < 30) {
    return "just now";
  }

  // Seconds ago (30-59 seconds)
  if (diffInSeconds < 60) {
    return "a moment ago";
  }

  // Minutes ago (1-59 minutes)
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  }

  // Hours ago (1-23 hours)
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  // Yesterday
  if (diffInDays === 1) {
    return "yesterday";
  }

  // Days ago (2-6 days)
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  // Weeks ago
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
  }

  // Months ago
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  }

  // Years ago
  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
};

/**
 * Format full date and time
 */
export const formatFullDateTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format time only (e.g., "2:30 PM")
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format date only (e.g., "Jan 15, 2024")
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();

  // Today
  if (date.toDateString() === now.toDateString()) {
    return "Today";
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // This year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Other years
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Check if a date is today
 */
export const isToday = (timestamp) => {
  if (!timestamp) return false;

  const date = new Date(timestamp);
  const today = new Date();

  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is yesterday
 */
export const isYesterday = (timestamp) => {
  if (!timestamp) return false;

  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return date.toDateString() === yesterday.toDateString();
};

/**
 * Get a short relative time (used in chat lists)
 * Returns: "now", "2m", "1h", "3d", "Jan 15"
 */
export const getShortRelativeTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  // Just now
  if (diffInMinutes < 1) {
    return "now";
  }

  // Minutes (1-59)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Hours (1-23)
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  // Days (1-6)
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  // Week or older - show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
