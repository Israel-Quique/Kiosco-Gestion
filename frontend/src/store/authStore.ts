const DAILY_SESSION_KEY = 'kiosco_agbc_daily_session';

function todayKey(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

export function hasDailySession(): boolean {
  return localStorage.getItem(DAILY_SESSION_KEY) === todayKey();
}

export function startDailySession(): void {
  localStorage.setItem(DAILY_SESSION_KEY, todayKey());
}

export function clearDailySession(): void {
  localStorage.removeItem(DAILY_SESSION_KEY);
  localStorage.removeItem('userRole');
}