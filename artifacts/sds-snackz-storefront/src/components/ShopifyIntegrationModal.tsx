import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShoppingBag, Download, Globe, ShieldCheck } from 'lucide-react';

interface ShopifyIntegrationModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShopifyIntegrationModal({ open, onClose }: ShopifyIntegrationModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'checkout' | 'embed' | 'download'>('checkout');

  if (!open) return null;

  const appUrl = 'https://ais-pre-ydz55jxle5hs5nsbjjyv6b-131425706807.us-east1.run.app';
  const iframeCode = `<iframe src="${appUrl}" width="100%" height="950" frameborder="0" style="border:none; border-radius:12px; min-height:100vh; width:100%;" title="SD Snackz Storefront"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
        className="shopify-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 16,
          maxWidth: 680,
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
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            color: '#ffffff',
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Shopify Live Checkout & Deployment
              </h2>
              <p style={{ fontSize: 12, margin: '2px 0 0', opacity: 0.9, color: '#d1fae5' }}>
                Store: <strong>www.sdsnackz.com</strong> · (vxuxht-er.myshopify.com)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            padding: '0 16px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('checkout')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              color: activeTab === 'checkout' ? '#047857' : '#64748b',
              borderBottom: activeTab === 'checkout' ? '2px solid #047857' : '2px solid transparent',
            }}
          >
            1. Live Shopify Checkout
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              color: activeTab === 'embed' ? '#047857' : '#64748b',
              borderBottom: activeTab === 'embed' ? '2px solid #047857' : '2px solid transparent',
            }}
          >
            2. Embed in Shopify Store
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('download')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              color: activeTab === 'download' ? '#047857' : '#64748b',
              borderBottom: activeTab === 'download' ? '2px solid #047857' : '2px solid transparent',
            }}
          >
            3. Download & Export
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: 24 }}>
          {activeTab === 'checkout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <ShieldCheck size={24} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#065f46' }}>
                    Shopify Checkout is Live and Active!
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#047857', lineHeight: 1.5 }}>
                    Customers can add any snack to their cart and click <strong>Checkout</strong>. The cart
                    automatically builds a direct Shopify cart permalink syncing all 250 product variant IDs,
                    routing buyers directly to your official checkout on <strong>sdsnackz.com</strong>.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
                  Connected Store Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Custom Domain:</span>
                    <strong style={{ color: '#0f172a' }}>https://www.sdsnackz.com</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Shopify Mystore ID:</span>
                    <strong style={{ color: '#0f172a' }}>vxuxht-er.myshopify.com</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Mapped Product Variants:</span>
                    <strong style={{ color: '#059669' }}>250 Variants Synced</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Payment Processors:</span>
                    <strong style={{ color: '#0f172a' }}>Shop Pay, Apple Pay, Cards</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <a
                  href="https://www.sdsnackz.com/cart"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: '#047857',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    flex: 1,
                  }}
                >
                  <ExternalLink size={16} />
                  Test Live Shopify Cart (sdsnackz.com/cart)
                </a>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  How to Add This Storefront to Your Shopify Site
                </h3>
                <p style={{ margin: '4px 0 12px', fontSize: 13, color: '#64748b' }}>
                  You can embed this interactive storefront into any page on your Shopify store in 3 simple steps:
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      background: '#047857',
                      color: '#fff',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    1
                  </span>
                  <div>
                    Log in to your <strong>Shopify Admin</strong> &gt; go to <strong>Online Store</strong> &gt; <strong>Pages</strong> &gt; click <strong>Add page</strong>.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      background: '#047857',
                      color: '#fff',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    2
                  </span>
                  <div>
                    In the page content box, click the <strong>&lt;&gt; (Show HTML)</strong> button in the top-right of the editor toolbar.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      background: '#047857',
                      color: '#fff',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    3
                  </span>
                  <div>
                    Paste the embed snippet below and click <strong>Save</strong>!
                  </div>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div
                style={{
                  background: '#0f172a',
                  color: '#f8fafc',
                  borderRadius: 8,
                  padding: 14,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  position: 'relative',
                  overflowX: 'auto',
                }}
              >
                <code>{iframeCode}</code>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: copied ? '#059669' : '#0f172a',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background 0.2s',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Shopify Embed Code'}
              </button>
            </div>
          )}

          {activeTab === 'download' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Download or Export the Full Source Code
                </h3>
                <p style={{ margin: '4px 0 12px', fontSize: 13, color: '#64748b' }}>
                  You have full ownership of this web application code. Here is how to download it:
                </p>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Download size={20} color="#047857" />
                  <div>
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>Direct ZIP Download in AI Studio:</strong>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Click the <strong>Settings (gear icon)</strong> in the top-right corner of Google AI Studio and select <strong>Download ZIP</strong>.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Globe size={20} color="#047857" />
                  <div>
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>GitHub Export:</strong>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Select <strong>Export to GitHub</strong> in the Settings menu to push directly to your private or public GitHub repository.
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 12,
                  color: '#1e40af',
                }}
              >
                💡 <strong>Custom Subdomain Tip:</strong> You can host this app on Vercel, Cloud Run, or Netlify and map your DNS to <code>shop.sdsnackz.com</code> or <code>b2b.sdsnackz.com</code>!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#059669', fontWeight: 600 }}>
            <ShieldCheck size={14} />
            Single Bag Pricing Active · Confusing multi-packs eliminated
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
