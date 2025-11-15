// Format relative time (e.g., "2 hours ago", "Just now")
export const formatDistanceToNow = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  return past.toLocaleDateString();
};

// Format message time (e.g., "10:30 AM" or "Yesterday" or "Dec 25")
export const formatMessageTime = (date) => {
  const messageDate = new Date(date);
  const now = new Date();
  const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));

  // If today, show time
  if (diffInHours < 24 && now.getDate() === messageDate.getDate()) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // If yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.getDate() === yesterday.getDate()) {
    return "Yesterday";
  }

  // If within last week, show day name
  if (diffInHours < 168) {
    return messageDate.toLocaleDateString("en-US", { weekday: "short" });
  }

  // Otherwise show date
  return messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};
