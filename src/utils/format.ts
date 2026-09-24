// ==========================================
// PENNY PAY ADMIN — Utility Functions
// ==========================================

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSDT(amount: number): string {
  return `${amount.toFixed(2)} USDT`;
}

export function formatPricePerUSDT(price: number): string {
  return `${formatINR(price)} / USDT`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} · ${formatTime(dateStr)}`;
}

export function timeAgo(dateStr: string): string {
  const now = new Date('2026-09-23T14:35:00');
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function maskMobile(mobile: string): string {
  // Keep +91 and last 4 digits
  const parts = mobile.split(' ');
  if (parts.length === 2) {
    const countryCode = parts[0];
    const number = parts[1].replace(/\d/g, 'X').replace(/X{4}$/, parts[1].slice(-4));
    return `${countryCode} ${number}`;
  }
  return mobile;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    resolve();
  });
}
