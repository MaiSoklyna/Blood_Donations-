// Admin emails list - add emails that should have admin access
export const ADMIN_EMAILS = [
  'nadrayoky000@gmail.com',
  // Add more admin emails here
];

// Check if email is admin
export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};