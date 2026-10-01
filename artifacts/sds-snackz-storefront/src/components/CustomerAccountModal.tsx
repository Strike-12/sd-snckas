import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Sparkles,
  ShoppingBag,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import {
  getStoredAccount,
  saveStoredAccount,
  clearStoredAccount,
  type UserAccount,
} from '../services/accountService';

interface CustomerAccountModalProps {
  open: boolean;
  onClose: () => void;
  onAccountChange?: (account: UserAccount | null) => void;
  initialType?: 'business' | 'retail';
}

export function CustomerAccountModal({
  open,
  onClose,
  onAccountChange,
  initialType = 'business',
}: CustomerAccountModalProps) {
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [accountType, setAccountType] = useState<'business' | 'retail'>(initialType);

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [taxResaleId, setTaxResaleId] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('CA');
  const [zip, setZip] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      const existing = getStoredAccount();
      setCurrentAccount(existing);
      if (existing) {
        setAccountType(existing.accountType);
        setEmail(existing.email);
        setFullName(existing.fullName);
        setBusinessName(existing.businessName || '');
        setTaxResaleId(existing.taxResaleId || '');
        setPhone(existing.phone || '');
        if (existing.address) {
          setAddress1(existing.address.address1);
          setCity(existing.address.city);
          setProvince(existing.address.province);
          setZip(existing.address.zip);
        }
      } else {
        setAccountType(initialType);
      }
    }
  }, [open, initialType]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;

    const newAccount: UserAccount = {
      id: currentAccount?.id || `acc_${Date.now()}`,
      accountType,
      email: email.trim(),
      fullName: fullName.trim(),
      businessName: accountType === 'business' ? businessName.trim() : undefined,
      taxResaleId: accountType === 'business' ? taxResaleId.trim() : undefined,
      phone: phone.trim() || undefined,
      address: address1.trim()
        ? {
            address1: address1.trim(),
            city: city.trim(),
            province: province.trim(),
            zip: zip.trim(),
          }
        : undefined,
      net30Approved: accountType === 'business' ? true : false,
      createdAt: currentAccount?.createdAt || new Date().toISOString(),
    };

    saveStoredAccount(newAccount);
    setCurrentAccount(newAccount);
    if (onAccountChange) onAccountChange(newAccount);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleLogout = () => {
    clearStoredAccount();
    setCurrentAccount(null);
    setEmail('');
    setFullName('');
    setBusinessName('');
    setTaxResaleId('');
    setPhone('');
    setAddress1('');
    setCity('');
    setZip('');
    if (onAccountChange) onAccountChange(null);
  };

  return (
    <div
      className="quickview-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="customer-account-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 16,
          maxWidth: 580,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#047857',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {accountType === 'business' ? <Building2 size={20} /> : <User size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                {currentAccount ? 'Your SD Snackz Account' : 'Create Free Account / Sign In'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                Optional · Save carts, track shipments & pre-fill wholesale POs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: 6,
              borderRadius: 6,
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Optional Reassurance Banner */}
        <div
          style={{
            background: '#ecfdf5',
            padding: '10px 24px',
            borderBottom: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#065f46',
          }}
        >
          <Sparkles size={15} color="#047857" />
          <span>
            <strong>Never required:</strong> You can always check out as a guest anytime without an account!
          </span>
        </div>

        {currentAccount && !savedSuccess ? (
          /* Profile Overview */
          <div style={{ padding: 24 }}>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 18,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      background: currentAccount.accountType === 'business' ? '#047857' : '#2563eb',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 999,
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    }}
                  >
                    {currentAccount.accountType === 'business' ? 'Business Wholesale Account' : 'Retail Snack Member'}
                  </span>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    {currentAccount.fullName}
                  </h4>
                  {currentAccount.businessName ? (
                    <p style={{ margin: '3px 0 0', fontSize: 13, color: '#334155', fontWeight: 600 }}>
                      🏢 {currentAccount.businessName}
                    </p>
                  ) : null}
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>
                    ✉️ {currentAccount.email} {currentAccount.phone ? `· 📞 ${currentAccount.phone}` : ''}
                  </p>
                  {currentAccount.taxResaleId ? (
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: '#047857', fontWeight: 500 }}>
                      ✓ Resale Tax ID: {currentAccount.taxResaleId} (Tax-Exempt Approved)
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#047857',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Create or Edit Form */
          <form onSubmit={handleSubmit} style={{ padding: 24 }}>
            {/* Account Type Selector Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                background: '#f1f5f9',
                padding: 4,
                borderRadius: 10,
                marginBottom: 20,
              }}
            >
              <button
                type="button"
                onClick={() => setAccountType('business')}
                style={{
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: accountType === 'business' ? '#ffffff' : 'transparent',
                  color: accountType === 'business' ? '#047857' : '#64748b',
                  boxShadow: accountType === 'business' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Building2 size={16} /> Business / Store Owner
              </button>
              <button
                type="button"
                onClick={() => setAccountType('retail')}
                style={{
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: accountType === 'retail' ? '#ffffff' : 'transparent',
                  color: accountType === 'retail' ? '#0f172a' : '#64748b',
                  boxShadow: accountType === 'retail' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <User size={16} /> Individual Customer
              </button>
            </div>

            {accountType === 'business' ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 12,
                  color: '#166534',
                }}
              >
                💡 <strong>Convenience stores, bodegas, gas stations & snack vendors:</strong> Creating a business account lets you save your Resale Permit ID for tax-free wholesale invoices, pre-fill receiving dock info, and get fast-tracked for Net 30 terms!
              </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: accountType === 'business' ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Contact Name *
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {accountType === 'business' ? (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Store / Company Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Pacific Coast Snacks LLC"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(619) 000-0000"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {accountType === 'business' ? (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Resale Permit / Tax ID # (Optional · For Tax-Exempt Wholesale)
                </label>
                <input
                  type="text"
                  value={taxResaleId}
                  onChange={(e) => setTaxResaleId(e.target.value)}
                  placeholder="e.g. CA-RES-10492850"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ) : null}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Delivery Address (Optional)
              </label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Street Address"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  boxSizing: 'border-box',
                  marginBottom: 8,
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="State"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="ZIP"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {savedSuccess ? (
              <div
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <CheckCircle2 size={16} /> Account saved successfully!
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Continue without account
              </button>

              <button
                type="submit"
                style={{
                  background: '#047857',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '11px 22px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)',
                }}
              >
                Save Account & Cart
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
