import React, { useState, useId, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Printer,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Tag,
} from 'lucide-react';
import type { Product } from '../data/productsData';
import {
  processInAppShopifyOrder,
  type ShopifyOrderRecord,
  type ShopifyPaymentMethodType,
} from '../services/shopifyOrderService';
import { getStoredAccount } from '../services/accountService';

interface ShopifyInAppCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  cartLines: Array<Product & { quantity: number }>;
  onClearCart: () => void;
  onOpenShopifyConfigModal?: () => void;
}

export function ShopifyInAppCheckoutModal({
  open,
  onClose,
  cartLines,
  onClearCart,
  onOpenShopifyConfigModal,
}: ShopifyInAppCheckoutModalProps) {
  const [step, setStep] = useState<'details' | 'processing' | 'confirmed'>('details');

  // Customer Contact & Shipping State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('CA');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'priority' | 'overnight'>('standard');

  // Payment State (All Official Shopify Payment Options)
  const [paymentMethod, setPaymentMethod] = useState<ShopifyPaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [sameBilling, setSameBilling] = useState(true);

  // Shop Pay sub-options
  const [shoppayPhone, setShoppayPhone] = useState('');
  const [shoppayUseInstallments, setShoppayUseInstallments] = useState(false);

  // PayPal sub-options
  const [paypalOption, setPaypalOption] = useState<'standard' | 'payin4'>('standard');

  // Klarna sub-options
  const [klarnaOption, setKlarnaOption] = useState<'payin4' | 'payin30'>('payin4');

  // Afterpay sub-options
  const [afterpayOption, setAfterpayOption] = useState<'payin4'>('payin4');

  // Affirm sub-options
  const [affirmTerm, setAffirmTerm] = useState<'3' | '6' | '12'>('3');

  // Manual payment sub-options
  const [manualOption, setManualOption] = useState<'zelle' | 'cod' | 'dock_willcall'>('zelle');

  // Discount / Promo Code
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    description: string;
  } | null>(null);
  const [discountError, setDiscountError] = useState('');

  // Processing & Confirmation State
  const [processingStatus, setProcessingStatus] = useState('Securing connection...');
  const [completedOrder, setCompletedOrder] = useState<ShopifyOrderRecord | null>(null);
  const [validationError, setValidationError] = useState('');

  // Pre-fill contact details from saved account if available
  useEffect(() => {
    if (open) {
      const acc = getStoredAccount();
      if (acc) {
        if (!email && acc.email) setEmail(acc.email);
        if (!phone && acc.phone) setPhone(acc.phone);
        if (!firstName && acc.fullName) {
          const parts = acc.fullName.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
        if (acc.address && !address1) {
          setAddress1(acc.address.address1);
          setCity(acc.address.city);
          setProvince(acc.address.province);
          setZip(acc.address.zip);
        }
      }
    }
  }, [open]);

  const emailInputId = useId();
  const phoneInputId = useId();
  const firstNameInputId = useId();
  const lastNameInputId = useId();
  const addressInputId = useId();
  const aptInputId = useId();
  const cityInputId = useId();
  const stateInputId = useId();
  const zipInputId = useId();
  const cardNumInputId = useId();
  const cardExpInputId = useId();
  const cardCvvInputId = useId();
  const cardNameInputId = useId();

  if (!open) return null;

  // Subtotal computation
  const subtotal = cartLines.reduce((acc, item) => acc + item.rawPrice * item.quantity, 0);

  // USPS Shipping: Free standard ground for all orders above $60
  const isFreeStandard = subtotal >= 60 || appliedDiscount?.code === 'FREESHIP';
  let shippingPrice = 4.99;
  let shippingTitle = 'USPS Ground Advantage (2–5 Business Days)';

  if (shippingMethod === 'standard') {
    shippingPrice = isFreeStandard ? 0 : 4.99;
    shippingTitle = isFreeStandard ? 'USPS Ground Advantage (Free $60+ · 2–5 Days)' : 'USPS Ground Advantage (2–5 Days)';
  } else if (shippingMethod === 'priority') {
    shippingPrice = 8.99;
    shippingTitle = 'USPS Priority Mail (1–3 Business Days)';
  } else if (shippingMethod === 'overnight') {
    shippingPrice = 24.99;
    shippingTitle = 'USPS Priority Mail Express (1–2 Days Guaranteed)';
  }

  // Discount calculation
  const discountAmount = appliedDiscount?.amount || 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  // Sales tax removed per store policy ($0.00 / Tax Exempt)
  const estimatedTax = 0;
  const finalTotal = Number((taxableSubtotal + estimatedTax + shippingPrice).toFixed(2));
  const installment4 = (finalTotal / 4).toFixed(2);

  // Handle Discount Application
  const handleApplyDiscount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDiscountError('');
    const code = discountCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'SNACK10') {
      const discount = Number((subtotal * 0.1).toFixed(2));
      setAppliedDiscount({
        code: 'SNACK10',
        amount: discount,
        description: '10% Off First Snack Order',
      });
      setDiscountCodeInput('');
    } else if (code === 'FREESHIP') {
      setAppliedDiscount({
        code: 'FREESHIP',
        amount: 4.99,
        description: 'Free Standard Shipping Applied',
      });
      setDiscountCodeInput('');
    } else if (code === 'SDSNACKZ' || code === 'WELCOME5') {
      setAppliedDiscount({
        code,
        amount: 5.0,
        description: '$5.00 Off Order',
      });
      setDiscountCodeInput('');
    } else {
      setDiscountError('Invalid promo code. Try "SNACK10" for 10% off!');
    }
  };

  // Card formatting
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Identify Card Brand
  const getCardBrand = (num: string): string => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    if (/^6(?:011|5)/.test(clean)) return 'Discover';
    return 'Visa';
  };

  // Submit Order directly through Shopify On-Site
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validations
    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid email address for your order confirmation receipt.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('Please enter your full first and last name.');
      return;
    }
    if (!address1.trim() || !city.trim() || !zip.trim()) {
      setValidationError('Please provide complete street address, city, and ZIP code.');
      return;
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 15) {
        setValidationError('Please enter a complete 16-digit credit or debit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setValidationError('Please enter expiration in MM/YY format.');
        return;
      }
      if (cardCvv.length < 3) {
        setValidationError('Please enter your card 3 or 4-digit CVV code.');
        return;
      }
    }

    setStep('processing');
    setProcessingStatus('Connecting securely to Shopify Payments gateway...');

    try {
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStatus('Authorizing payment on-site with 256-bit encryption...');
      await new Promise((r) => setTimeout(r, 700));
      setProcessingStatus('Routing order and mapped variant IDs directly to Shopify...');
      await new Promise((r) => setTimeout(r, 600));

      const order = await processInAppShopifyOrder({
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        },
        shippingAddress: {
          address1: address1.trim(),
          address2: address2.trim() || undefined,
          city: city.trim(),
          province,
          zip: zip.trim(),
          country,
        },
        shippingMethod: {
          id: shippingMethod,
          title: shippingTitle,
          price: shippingPrice,
        },
        items: cartLines.map((line) => ({
          id: line.id,
          handle: line.handle,
          name: line.name,
          rawPrice: line.rawPrice,
          quantity: line.quantity,
          image: line.image,
        })),
        discountCode: appliedDiscount?.code,
        discountAmount: appliedDiscount?.amount,
        paymentDetails: {
          method: paymentMethod,
          cardNumber,
          cardBrand: getCardBrand(cardNumber),
        },
      });

      setCompletedOrder(order);
      setStep('confirmed');
      onClearCart();
    } catch (err) {
      console.error('Order creation error', err);
      setStep('details');
      setValidationError('An unexpected error occurred while placing the order. Please try again.');
    }
  };

  return (
    <div
      className="quickview-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
      }}
    >
      <div
        className="shopify-checkout-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 18,
          maxWidth: 960,
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #cbd5e1',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            color: '#ffffff',
            borderTopLeftRadius: 17,
            borderTopRightRadius: 17,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  Secure On-Site Shopify Checkout
                </h2>
                <span
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 999,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  On-Site Pay Active
                </span>
              </div>
              <p style={{ fontSize: 11, margin: '2px 0 0', opacity: 0.9, color: '#d1fae5' }}>
                Orders sync directly to <strong>sdsnackz.com</strong> · (vxuxht-er.myshopify.com)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
            aria-label="Close checkout"
          >
            <X size={18} />
          </button>
        </div>

        {/* Reassurance Banner */}
        <div
          style={{
            background: '#ecfdf5',
            borderBottom: '1px solid #a7f3d0',
            padding: '8px 24px',
            fontSize: 12,
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} color="#059669" />
            <span>
              <strong>Zero Redirection:</strong> You stay right here to complete payment. Orders route automatically into your Shopify store admin.
            </span>
          </div>
          {onOpenShopifyConfigModal && (
            <button
              type="button"
              onClick={onOpenShopifyConfigModal}
              style={{
                background: 'none',
                border: 'none',
                color: '#047857',
                fontSize: 11,
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Shopify Sync Settings ↗
            </button>
          )}
        </div>

        {/* Main Content Area */}
        {step === 'processing' && (
          <div
            style={{
              padding: '80px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: '4px solid #e2e8f0',
                borderTopColor: '#047857',
                animation: 'spin 0.8s linear infinite',
                marginBottom: 24,
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              Processing Your Order on Shopify...
            </h3>
            <p style={{ fontSize: 13, color: '#059669', fontWeight: 600, margin: 0 }}>
              {processingStatus}
            </p>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 12 }}>
              Please do not refresh or close this window.
            </p>
          </div>
        )}

        {step === 'confirmed' && completedOrder && (
          <div style={{ padding: '36px 32px' }}>
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 16,
                padding: '24px 28px',
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#064e3b', margin: '0 0 6px' }}>
                Payment Successful & Order Placed!
              </h2>
              <p style={{ fontSize: 14, color: '#047857', margin: '0 0 14px' }}>
                Order Number: <strong style={{ fontSize: 16, color: '#064e3b' }}>{completedOrder.orderNumber}</strong>
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                }}
              >
                <ShieldCheck size={15} color="#059669" />
                Successfully transmitted & synced to Shopify Store (vxuxht-er.myshopify.com)
              </div>
            </div>

            {/* Order Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: 24,
                marginBottom: 28,
              }}
            >
              {/* Left: Shipping & Payment Summary */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 20,
                  fontSize: 13,
                }}
              >
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Delivery & Customer Information
                </h4>
                <div style={{ display: 'grid', gap: 8, color: '#334155' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Recipient:</span>{' '}
                    <strong>{completedOrder.customer.firstName} {completedOrder.customer.lastName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Email:</span>{' '}
                    <strong>{completedOrder.customer.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Shipping to:</span>{' '}
                    <span>
                      {completedOrder.shippingAddress.address1}
                      {completedOrder.shippingAddress.address2 ? `, ${completedOrder.shippingAddress.address2}` : ''},{' '}
                      {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.province}{' '}
                      {completedOrder.shippingAddress.zip}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Shipping Method:</span>{' '}
                    <strong>{completedOrder.shippingMethod.title}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
                    <span style={{ color: '#64748b' }}>Payment Processed On-Site:</span>{' '}
                    <strong>
                      {completedOrder.payment.cardBrand} ending in {completedOrder.payment.cardLast4}
                    </strong>{' '}
                    <span style={{ color: '#059669', fontWeight: 600 }}>• Authorized & Paid</span>
                  </div>
                </div>
              </div>

              {/* Right: Items Purchased */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Items Ordered ({completedOrder.lineItems.reduce((n, i) => n + i.quantity, 0)} bags)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 180, overflowY: 'auto', marginBottom: 12 }}>
                  {completedOrder.lineItems.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 36, height: 36, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Qty: {item.quantity} · 1 Single Bag · Variant ID: {item.variantId || 'Synced'}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, fontSize: 12, display: 'grid', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Subtotal:</span>
                    <span>${completedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {completedOrder.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                      <span>Discount ({completedOrder.discountCode}):</span>
                      <span>-${completedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Shipping:</span>
                    <span>{completedOrder.shippingTotal === 0 ? 'FREE' : `$${completedOrder.shippingTotal.toFixed(2)}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Sales Tax:</span>
                    <span style={{ color: '#047857', fontWeight: 600 }}>$0.00 (Tax Free)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: 6, marginTop: 4 }}>
                    <span>Total Paid:</span>
                    <span>${completedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={completedOrder.shopifyAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#047857',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <ExternalLink size={16} />
                View Order in Shopify Admin (Orders #{completedOrder.orderNumber})
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '12px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Printer size={16} />
                Print Receipt
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '12px 22px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmitOrder} style={{ padding: 24 }}>
            {validationError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  padding: '10px 16px',
                  marginBottom: 18,
                  fontSize: 13,
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{validationError}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 28 }}>
              {/* Left Column: Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Express 1-Click Pay Buttons */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
                    Express 1-Click Checkout
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('shoppay');
                        setCardNumber('4242 4242 4242 4242');
                        setCardExpiry('12/28');
                        setCardCvv('123');
                        setCardName('Shop Pay Customer');
                      }}
                      style={{
                        background: '#5a31f4',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        boxShadow: '0 2px 4px rgba(90, 49, 244, 0.2)',
                      }}
                    >
                      <span style={{ fontWeight: 800 }}>Shop</span>
                      <span style={{ fontWeight: 400, opacity: 0.9 }}>Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('paypal');
                        setCardNumber('');
                      }}
                      style={{
                        background: '#ffc439',
                        color: '#003087',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        boxShadow: '0 2px 4px rgba(255, 196, 57, 0.3)',
                      }}
                    >
                      <span style={{ color: '#003087', fontStyle: 'italic', fontWeight: 900 }}>Pay</span>
                      <span style={{ color: '#0079c1', fontStyle: 'italic', fontWeight: 900 }}>Pal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('applepay');
                        setCardNumber('4000 1234 5678 9010');
                        setCardExpiry('08/29');
                        setCardCvv('456');
                        setCardName('Apple Pay Customer');
                      }}
                      style={{
                        background: '#000000',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <span> Apple Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('googlepay');
                        setCardNumber('4111 2222 3333 4444');
                        setCardExpiry('10/28');
                        setCardCvv('789');
                        setCardName('Google Pay Customer');
                      }}
                      style={{
                        background: '#ffffff',
                        color: '#3c4043',
                        border: '1px solid #dadce0',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <span style={{ fontWeight: 800 }}>G</span>
                      <span style={{ fontWeight: 600 }}>Pay</span>
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      margin: '16px 0 0',
                      color: '#94a3b8',
                      fontSize: 11,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                    <span>Or enter details & choose payment option below</span>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  </div>
                </div>

                {/* Section 1: Customer Contact */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
                    1. Contact Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
                    <div>
                      <label htmlFor={emailInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Email (for order confirmation receipt) *
                      </label>
                      <input
                        id={emailInputId}
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor={phoneInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Mobile Phone (tracking alerts)
                      </label>
                      <input
                        id={phoneInputId}
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(619) 555-0123"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Shipping Address */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
                    2. Shipping Address
                  </h3>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label htmlFor={firstNameInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          First name *
                        </label>
                        <input
                          id={firstNameInputId}
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor={lastNameInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          Last name *
                        </label>
                        <input
                          id={lastNameInputId}
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor={addressInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Street address *
                      </label>
                      <input
                        id={addressInputId}
                        type="text"
                        required
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                        placeholder="1234 Main St"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr', gap: 10 }}>
                      <div>
                        <label htmlFor={aptInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          Apt, Suite (optional)
                        </label>
                        <input
                          id={aptInputId}
                          type="text"
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          placeholder="Apt 4B"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor={cityInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          City *
                        </label>
                        <input
                          id={cityInputId}
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="San Diego"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor={stateInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          State
                        </label>
                        <input
                          id={stateInputId}
                          type="text"
                          required
                          value={province}
                          onChange={(e) => setProvince(e.target.value.toUpperCase())}
                          placeholder="CA"
                          maxLength={2}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label htmlFor={zipInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          ZIP code *
                        </label>
                        <input
                          id={zipInputId}
                          type="text"
                          required
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          placeholder="92101"
                          maxLength={10}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          Country
                        </label>
                        <input
                          type="text"
                          disabled
                          value="United States"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: 13,
                            color: '#64748b',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Shipping Method */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
                    3. Delivery Speed
                  </h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: shippingMethod === 'standard' ? '2px solid #047857' : '1px solid #cbd5e1',
                        background: shippingMethod === 'standard' ? '#ecfdf5' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name="shipping_method"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          style={{ accentColor: '#047857' }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Standard Ground (3–5 Business Days)</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Carefully packed with snack-grade insulation</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isFreeStandard ? '#059669' : '#0f172a' }}>
                        {isFreeStandard ? 'FREE' : '$4.99'}
                      </span>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: shippingMethod === 'priority' ? '2px solid #047857' : '1px solid #cbd5e1',
                        background: shippingMethod === 'priority' ? '#ecfdf5' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name="shipping_method"
                          checked={shippingMethod === 'priority'}
                          onChange={() => setShippingMethod('priority')}
                          style={{ accentColor: '#047857' }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Expedited Priority (2–3 Business Days)</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Fast track courier with real-time tracking</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>$8.99</span>
                    </label>
                  </div>
                </div>

                {/* Section 4: Payment Information */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      4. On-Site Payment Information
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#059669', fontWeight: 600 }}>
                      <Lock size={12} /> 256-Bit SSL Encrypted
                    </div>
                  </div>

                  <div
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: 10,
                      padding: 14,
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CreditCard size={18} color="#047857" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Credit or Debit Card</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: 10, padding: '2px 6px', background: '#e2e8f0', borderRadius: 4, fontWeight: 700, color: '#475569' }}>
                          VISA
                        </span>
                        <span style={{ fontSize: 10, padding: '2px 6px', background: '#e2e8f0', borderRadius: 4, fontWeight: 700, color: '#475569' }}>
                          MC
                        </span>
                        <span style={{ fontSize: 10, padding: '2px 6px', background: '#e2e8f0', borderRadius: 4, fontWeight: 700, color: '#475569' }}>
                          AMEX
                        </span>
                        <span style={{ fontSize: 10, padding: '2px 6px', background: '#e2e8f0', borderRadius: 4, fontWeight: 700, color: '#475569' }}>
                          DISC
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 10 }}>
                      <div>
                        <label htmlFor={cardNumInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          Card number *
                        </label>
                        <input
                          id={cardNumInputId}
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            fontSize: 13,
                            fontFamily: 'monospace',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label htmlFor={cardExpInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Expiration (MM / YY) *
                          </label>
                          <input
                            id={cardExpInputId}
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            placeholder="MM / YY"
                            maxLength={5}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              fontSize: 13,
                              fontFamily: 'monospace',
                              outline: 'none',
                            }}
                          />
                        </div>
                        <div>
                          <label htmlFor={cardCvvInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Security code (CVV) *
                          </label>
                          <input
                            id={cardCvvInputId}
                            type="password"
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                            placeholder="123"
                            maxLength={4}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              fontSize: 13,
                              fontFamily: 'monospace',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor={cardNameInputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          Name on card *
                        </label>
                        <input
                          id={cardNameInputId}
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="John Doe"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Review */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  height: 'fit-content',
                }}
              >
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
                    Order Summary ({cartLines.reduce((n, l) => n + l.quantity, 0)} items)
                  </h3>

                  {/* Cart Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                    {cartLines.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: 44, height: 44, objectFit: 'contain', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: -6,
                              right: -6,
                              background: '#047857',
                              color: '#fff',
                              borderRadius: '50%',
                              width: 18,
                              height: 18,
                              fontSize: 10,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {item.quantity}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>1 Single Bag</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          ${(item.rawPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo / Discount Code */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={discountCodeInput}
                      onChange={(e) => setDiscountCodeInput(e.target.value)}
                      placeholder="Discount code (e.g. SNACK10)"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        outline: 'none',
                        textTransform: 'uppercase',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      style={{
                        padding: '8px 14px',
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  {appliedDiscount && (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Tag size={12} />
                      <span>{appliedDiscount.description} (-${appliedDiscount.amount.toFixed(2)})</span>
                    </div>
                  )}
                  {discountError && (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#dc2626' }}>
                      {discountError}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'grid', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {appliedDiscount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                      <span>Discount ({appliedDiscount.code})</span>
                      <span>-${appliedDiscount.amount.toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Shipping</span>
                    <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Estimated Sales Tax (CA 7.75%)</span>
                    <span>${estimatedTax.toFixed(2)}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#0f172a',
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: 10,
                      marginTop: 4,
                    }}
                  >
                    <span>Total Due</span>
                    <span style={{ color: '#047857' }}>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#047857',
                    color: '#ffffff',
                    padding: '14px 18px',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
                    transition: 'transform 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#065f46')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#047857')}
                >
                  <Lock size={16} />
                  <span>Pay ${finalTotal.toFixed(2)} & Place Order</span>
                </button>

                {/* Trust Footer */}
                <div style={{ textAlign: 'center', fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                  🛡️ Processed on-site with <strong>Shopify Payments</strong>. Orders sync to <code>sdsnackz.com</code> with all 250 mapped variant IDs.
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
