export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

export function daysUntil(dateString) {
  return Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function getNextEligibleDate(lastDonationDate) {
  const last = new Date(lastDonationDate);
  return new Date(last.getTime() + 90 * 24 * 60 * 60 * 1000);
}

export function calculateLivesSaved(donationCount) {
  return donationCount * 2;
}

export function calculateTotalVolume(donations) {
  return donations.reduce((total, d) => total + d.quantityMl, 0);
}

export function isValidCambodianPhone(phone) {
  const clean = phone.replace(/[\s-]/g, '');
  return /^(\+855|0)[1-9]\d{7,8}$/.test(clean);
}

export function isValidDonorAge(dateOfBirth) {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return { valid: age >= 18 && age <= 65, age };
}

export function getUrgencyClass(urgency) {
  const classes = {
    critical: 'bg-red-600 text-white',
    urgent: 'bg-amber-500 text-white',
    normal: 'bg-blue-500 text-white',
  };
  return classes[urgency] || classes.normal;
}