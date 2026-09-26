'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Save,
  Upload,
  X,
  RefreshCw,
  Facebook,
  Twitter,
  Instagram,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getSession, ensureValidToken } from '../../lib/auth';

import {
  GeneralInfo,
  EMPTY_GENERAL_INFO as EMPTY_INFO,
  getGeneralInfo as loadFromStorage,
  saveGeneralInfo as saveToStorage,
} from '../../lib/generalInfo';

/* ─────────────────────────────────────────────────────────────
   Helper: compress image on canvas (max 800×800)
───────────────────────────────────────────────────────────── */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width,
          h = img.height;
        if (w > 800 || h > 800) {
          if (w > h) { h = Math.round((800 * h) / w); w = 800; }
          else { w = Math.round((800 * w) / h); h = 800; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(e.target?.result as string); return; }
        ctx.drawImage(img, 0, 0, w, h);
        const isPng = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/svg+xml';
        resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.92));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/* ─────────────────────────────────────────────────────────────
   Section Card Wrapper
───────────────────────────────────────────────────────────── */
const SectionCard = ({
  icon,
  titleEn,
  titleUr,
  children,
  isUrdu,
}: {
  icon: React.ReactNode;
  titleEn: string;
  titleUr: string;
  children: React.ReactNode;
  isUrdu: boolean;
}) => {
  const { isDark } = useTheme();
  return (
    <div
      style={{
        background: isDark ? '#1E293B' : '#FFFFFF',
        borderRadius: '16px',
        border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
        marginBottom: '20px',
        overflow: 'hidden',
        boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.25)' : '0 1px 4px rgba(15,23,42,0.04)',
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px 20px',
          borderBottom: isDark ? '1.5px solid #334155' : '1.5px solid #F1F5F9',
          background: isDark ? '#151D2F' : 'linear-gradient(to right, #FFFFFF, #F8FAFC)',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
            border: isDark ? '1px solid #2563EB' : '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <h3
          className={isUrdu ? 'font-nastaleeq' : ''}
          style={{
            fontSize: isUrdu ? '20px' : '15px',
            fontWeight: 700,
            color: isDark ? '#FFFFFF' : '#0F172A',
            margin: 0,
          }}
        >
          {isUrdu ? titleUr : titleEn}
        </h3>
      </div>
      {/* Card Body */}
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Form Field
───────────────────────────────────────────────────────────── */
const Field = ({
  label,
  labelUr,
  isUrdu,
  children,
  fullWidth = false,
}: {
  label: string;
  labelUr: string;
  isUrdu: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}) => {
  const { isDark } = useTheme();
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <label
        className={isUrdu ? 'font-nastaleeq' : ''}
        style={{
          display: 'block',
          fontSize: isUrdu ? '17px' : '13px',
          fontWeight: 700,
          color: isDark ? '#E2E8F0' : '#374151',
          marginBottom: '6px',
          direction: isUrdu ? 'rtl' : 'ltr',
        }}
      >
        {isUrdu ? labelUr : label}
      </label>
      {children}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  fontSize: '14px',
  color: '#0F172A',
  backgroundColor: '#F8FAFC',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxSizing: 'border-box',
};

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export const GeneralInfoView: React.FC = () => {
  const { isUrdu, t } = useLanguage();
  const { isDark } = useTheme();
  const [info, setInfo] = useState<GeneralInfo>({ ...EMPTY_INFO });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved data on mount
  useEffect(() => {
    const saved = loadFromStorage();
    setInfo(saved);
    if (saved.logo_url) setLogoPreview(saved.logo_url);
  }, []);

  // Auto-dismiss save message
  useEffect(() => {
    if (saveMsg) {
      const t = setTimeout(() => setSaveMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [saveMsg]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setSaveMsg({ type: 'error', text: t('فائل کا سائز 20 MB سے زیادہ ہے۔', 'File size exceeds the 20 MB limit.') });
      return;
    }
    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      setLogoPreview(compressed);
      setInfo((prev) => ({ ...prev, logo_url: compressed }));
      setSaveMsg({ type: 'success', text: t('لوگو اپ لوڈ ہو گیا — سیو کریں۔', 'Logo uploaded — click Save to apply.') });
    } catch {
      setSaveMsg({ type: 'error', text: t('لوگو اپ لوڈ نہیں ہوا۔', 'Logo upload failed.') });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setInfo((prev) => ({ ...prev, logo_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info.mill_name.trim()) {
      setSaveMsg({ type: 'error', text: t('مل کا نام لازمی ہے۔', 'Mill name is required.') });
      return;
    }
    setIsSaving(true);
    try {
      saveToStorage(info);
      setSaveMsg({ type: 'success', text: t('معلومات محفوظ ہو گئیں ✓', 'Information saved successfully ✓') });
    } catch {
      setSaveMsg({ type: 'error', text: t('محفوظ کرنے میں خرابی۔', 'Failed to save.') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const saved = loadFromStorage();
    setInfo(saved);
    setLogoPreview(saved.logo_url || '');
    setSaveMsg(null);
  };

  const getFocusStyle = (name: string): React.CSSProperties =>
    focusedField === name
      ? { borderColor: '#1877F2', boxShadow: '0 0 0 3px rgba(24,119,242,0.2)', backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }
      : {};

  const inputProps = (name: keyof GeneralInfo, type = 'text', placeholder = '') => ({
    type,
    name,
    value: (info[name] as string) || '',
    onChange: handleChange,
    onFocus: () => setFocusedField(name),
    onBlur: () => setFocusedField(null),
    placeholder,
    style: {
      width: '100%',
      padding: '10px 12px',
      border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
      borderRadius: '10px',
      fontSize: '14px',
      color: isDark ? '#F8FAFC' : '#0F172A',
      backgroundColor: isDark ? '#111827' : '#F8FAFC',
      outline: 'none',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      boxSizing: 'border-box' as const,
      ...getFocusStyle(name),
      direction: isUrdu ? ('rtl' as const) : ('ltr' as const),
    },
  });

  /* ── grid helper ── */
  const grid2: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  };
  const grid3: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 20px 60px' }}>

      {/* ── Page Header ── */}
      <div
        style={{
          marginBottom: '28px',
          paddingBottom: '16px',
          borderBottom: isDark ? '1.5px solid #1E293B' : '1.5px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{ fontSize: isUrdu ? '30px' : '22px', fontWeight: 900, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}
          >
            {t('عمومی معلومات', 'General Information')}
          </h2>
          <p
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{ fontSize: isUrdu ? '18px' : '13px', color: isDark ? '#CBD5E1' : '#64748B', margin: '4px 0 0' }}
          >
            {t('مل کی بنیادی معلومات اور پبلک پروفائل ترتیب دیں۔', "Manage your flour mill's primary details and public profile.")}
          </p>
        </div>

        {/* Inline Save & Reset buttons (top) */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleReset}
            className="touch-active"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', borderRadius: '10px',
              border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              fontSize: '13px', fontWeight: 600,
              color: isDark ? '#E2E8F0' : '#374151',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <RefreshCw size={15} />
            {t('ری سیٹ', 'Reset')}
          </button>
        </div>
      </div>

      {/* ── Toast / Save message ── */}
      {saveMsg && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
            backgroundColor: saveMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1.5px solid ${saveMsg.type === 'success' ? '#86EFAC' : '#FECACA'}`,
            color: saveMsg.type === 'success' ? '#15803D' : '#DC2626',
            fontSize: '14px', fontWeight: 600,
          }}
        >
          <span>{saveMsg.type === 'success' ? '✓' : '⚠'}</span>
          <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '17px' : '14px' }}>
            {saveMsg.text}
          </span>
          <button
            type="button"
            onClick={() => setSaveMsg(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <form onSubmit={handleSave}>

        {/* ─────────── 1. Mill Logo ─────────── */}
        <SectionCard
          icon={<Upload size={18} color="#1877F2" />}
          titleEn="Mill Logo"
          titleUr="مل کا لوگو"
          isUrdu={isUrdu}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Logo Preview Box */}
            <div
              style={{
                width: '110px', height: '110px',
                border: isDark ? '2px dashed #475569' : '2px dashed #CBD5E1',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDark ? '#111827' : '#F8FAFC', overflow: 'hidden', flexShrink: 0,
              }}
            >
              {isUploading ? (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '3px solid #E2E8F0', borderTopColor: '#1877F2',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : logoPreview ? (
                <img src={logoPreview} alt="Mill Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Building2 size={40} color={isDark ? '#475569' : '#CBD5E1'} />
              )}
            </div>

            {/* Upload Controls */}
            <div>
              <p style={{ fontSize: '13px', color: isDark ? '#CBD5E1' : '#64748B', marginBottom: '10px', lineHeight: 1.6 }}>
                {t(
                  'PNG، JPG، WEBP یا SVG — زیادہ سے زیادہ 20 MB۔ یہ لوگو رسیدوں اور رپورٹوں پر ظاہر ہو گا۔',
                  'Upload PNG, JPG, WEBP or SVG. Max 20 MB. This logo will appear on receipts and reports.'
                )}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleLogoUpload}
                />
                <button
                  type="button"
                  className="touch-active"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 18px', borderRadius: '10px',
                    border: isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1',
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    fontSize: '13px', fontWeight: 600,
                    color: isDark ? '#F8FAFC' : '#374151',
                    cursor: isUploading ? 'not-allowed' : 'pointer', outline: 'none',
                    opacity: isUploading ? 0.7 : 1,
                  }}
                >
                  <Upload size={15} />
                  {isUploading
                    ? t('اپ لوڈ ہو رہا ہے...', 'Uploading...')
                    : logoPreview
                    ? t('لوگو تبدیل کریں', 'Change Logo')
                    : t('لوگو اپ لوڈ کریں', 'Upload Logo')}
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      background: 'none', border: 'none',
                      color: '#DC2626', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', padding: '9px 4px',
                    }}
                  >
                    <X size={14} /> {t('ہٹائیں', 'Remove')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─────────── 2. Mill Identity ─────────── */}
        <SectionCard
          icon={<Building2 size={18} color="#1877F2" />}
          titleEn="Mill Identity"
          titleUr="مل کی شناخت"
          isUrdu={isUrdu}
        >
          <div style={{ ...grid2, marginBottom: '16px' }}>
            <Field label="Mill Name" labelUr="مل کا نام" isUrdu={isUrdu}>
              <input {...inputProps('mill_name', 'text', t('مثلاً: نعمان فلور مل', 'e.g. Nouman Flour Mill'))} required />
            </Field>
            <Field label="Tagline / Motto" labelUr="سلوگن / نعرہ" isUrdu={isUrdu}>
              <input {...inputProps('tagline', 'text', t('مثلاً: خالص آٹا، بہتر زندگی', 'e.g. Pure Flour, Better Life'))} />
            </Field>
            <Field label="Owner / Proprietor Name" labelUr="مالک / پروپرائٹر کا نام" isUrdu={isUrdu}>
              <input {...inputProps('owner_name', 'text', t('مثلاً: چودھری نعمان', 'e.g. Ch. Nouman'))} />
            </Field>
            <Field label="Established Year" labelUr="قیام کا سال" isUrdu={isUrdu}>
              <input {...inputProps('established_year', 'text', '2005')} maxLength={4} />
            </Field>
            <Field label="NTN / Tax Number" labelUr="قومی ٹیکس نمبر (NTN)" isUrdu={isUrdu}>
              <input {...inputProps('ntn_number', 'text', '1234567-8')} />
            </Field>
            <Field label="License / Registration Number" labelUr="لائسنس / رجسٹریشن نمبر" isUrdu={isUrdu}>
              <input {...inputProps('license_number', 'text', 'LIC-2005-PB-0234')} />
            </Field>
          </div>
        </SectionCard>

        {/* ─────────── 3. Contact Information ─────────── */}
        <SectionCard
          icon={<Phone size={18} color="#1877F2" />}
          titleEn="Contact Information"
          titleUr="رابطہ معلومات"
          isUrdu={isUrdu}
        >
          <div style={{ ...grid2, marginBottom: '16px' }}>
            <Field label="Primary Phone" labelUr="بنیادی فون نمبر" isUrdu={isUrdu}>
              <input {...inputProps('phone_primary', 'tel', '+92-300-0000000')} />
            </Field>
            <Field label="Secondary Phone" labelUr="متبادل فون نمبر" isUrdu={isUrdu}>
              <input {...inputProps('phone_secondary', 'tel', '+92-42-0000000')} />
            </Field>
            <Field label="Email Address" labelUr="ای میل ایڈریس" isUrdu={isUrdu}>
              <input {...inputProps('email', 'email', 'info@flourmill.com')} />
            </Field>
            <Field label="City" labelUr="شہر" isUrdu={isUrdu}>
              <input {...inputProps('city', 'text', t('مثلاً: لاہور، فیصل آباد', 'e.g. Lahore, Faisalabad'))} />
            </Field>
            <Field label="Full Address" labelUr="مکمل پتہ" isUrdu={isUrdu} fullWidth>
              <textarea
                name="address"
                value={info.address}
                onChange={handleChange}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
                placeholder={t('مکمل گلی محلہ، شہر، ضلع...', 'Full street, area, city, district...')}
                rows={3}
                style={{
                  ...inputStyle,
                  ...getFocusStyle('address'),
                  resize: 'vertical',
                  minHeight: '80px',
                  direction: isUrdu ? 'rtl' : 'ltr',
                  fontFamily: 'inherit',
                }}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ─────────── 4. Digital & Social ─────────── */}
        <SectionCard
          icon={<Globe size={18} color="#1877F2" />}
          titleEn="Digital & Social"
          titleUr="آن لائن اور سوشل میڈیا"
          isUrdu={isUrdu}
        >
          <div style={{ marginBottom: '16px' }}>
            <Field label="Official Website" labelUr="سرکاری ویب سائٹ" isUrdu={isUrdu}>
              <input {...inputProps('website', 'url', 'https://yourflourmill.com')} />
            </Field>
          </div>
          <div style={{ ...grid3 }}>
            <Field label="Facebook" labelUr="فیس بک" isUrdu={isUrdu}>
              <div style={{ position: 'relative' }}>
                <Facebook size={15} color="#1877F2" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  {...inputProps('facebook_link', 'url', 'Profile URL')}
                  style={{ ...inputStyle, ...getFocusStyle('facebook_link'), paddingLeft: '32px', direction: 'ltr' }}
                />
              </div>
            </Field>
            <Field label="Twitter (X)" labelUr="ٹوئٹر (X)" isUrdu={isUrdu}>
              <div style={{ position: 'relative' }}>
                <Twitter size={15} color="#0EA5E9" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  {...inputProps('twitter_link', 'url', 'Profile URL')}
                  style={{ ...inputStyle, ...getFocusStyle('twitter_link'), paddingLeft: '32px', direction: 'ltr' }}
                />
              </div>
            </Field>
            <Field label="Instagram" labelUr="انسٹاگرام" isUrdu={isUrdu}>
              <div style={{ position: 'relative' }}>
                <Instagram size={15} color="#E11D48" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  {...inputProps('instagram_link', 'url', 'Profile URL')}
                  style={{ ...inputStyle, ...getFocusStyle('instagram_link'), paddingLeft: '32px', direction: 'ltr' }}
                />
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* ─────────── Info Notice ─────────── */}
        <div
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '12px 16px', borderRadius: '12px', marginBottom: '24px',
            backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE',
          }}
        >
          <Info size={16} color="#1877F2" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p
            className={isUrdu ? 'font-nastaleeq' : ''}
            style={{ fontSize: isUrdu ? '17px' : '13px', color: '#1E40AF', margin: 0, lineHeight: 1.6, direction: isUrdu ? 'rtl' : 'ltr' }}
          >
            {t(
              'یہ معلومات مقامی طور پر آپ کے براؤزر میں محفوظ ہوتی ہیں اور رسیدوں، رپورٹس اور پرنٹ آؤٹ پر ظاہر ہوتی ہیں۔',
              'This information is saved locally in your browser and will appear on receipts, reports, and printouts.'
            )}
          </p>
        </div>

        {/* ─────────── Save Button ─────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={handleReset}
            className="touch-active"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '12px 22px', borderRadius: '12px',
              border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC',
              fontSize: '14px', fontWeight: 600, color: '#374151',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <RefreshCw size={16} />
            {t('ری سیٹ', 'Reset Changes')}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="touch-active"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '12px 28px', borderRadius: '12px',
              border: 'none',
              backgroundColor: isSaving ? '#93C5FD' : '#1877F2',
              fontSize: '14px', fontWeight: 700, color: '#FFFFFF',
              cursor: isSaving ? 'not-allowed' : 'pointer', outline: 'none',
              boxShadow: isSaving ? 'none' : '0 4px 12px rgba(24,119,242,0.28)',
              transition: 'all 0.15s ease',
            }}
          >
            <Save size={16} />
            {isSaving ? t('محفوظ ہو رہا ہے...', 'Saving...') : t('معلومات محفوظ کریں', 'Save Configuration')}
          </button>
        </div>
      </form>

      {/* Spin animation for logo upload */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .gi-grid-2 { grid-template-columns: 1fr !important; }
          .gi-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
