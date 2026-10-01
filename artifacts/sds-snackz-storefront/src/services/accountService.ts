export interface UserAccount {
  id: string;
  accountType: 'business' | 'retail';
  email: string;
  fullName: string;
  businessName?: string;
  taxResaleId?: string;
  phone?: string;
  address?: {
    address1: string;
    city: string;
    province: string;
    zip: string;
  };
  net30Approved?: boolean;
  createdAt: string;
}

const STORAGE_KEY_USER = 'sds_snackz_user_account';

export function getStoredAccount(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read account from localStorage', e);
  }
  return null;
}

export function saveStoredAccount(account: UserAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(account));
  } catch (e) {
    console.error('Failed to save account to localStorage', e);
  }
}

export function clearStoredAccount(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch (e) {
    console.error('Failed to clear account', e);
  }
}
