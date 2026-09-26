'use strict';
'use client';

import React, { useState } from 'react';
import {
  Wheat,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShoppingCart,
  LogIn,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Delete,
  ChevronDown,
} from 'lucide-react';
import { UserSession, saveSession, PRESET_USERS } from '../../lib/auth';
import { getApiBaseUrl } from '../../lib/api';
import { useGeneralInfo } from '../../lib/generalInfo';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const generalInfo = useGeneralInfo();
  const [username, setUsername] = useState<string>('asif');
  const [password, setPassword] = useState<string>('biller123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick 1-touch preset login
  const handleQuickLogin = async (userKey: 'asif' | 'hanzala') => {
    const preset = PRESET_USERS[userKey];
    if (!preset) return;
    setUsername(preset.username);
    setPassword(preset.pass);
    await executeLogin(preset.username, preset.pass);
  };

  const executeLogin = async (uname: string, pass: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    const cleanUname = uname.trim().toLowerCase();
    const cleanPass = pass.trim();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUname,
          password: cleanPass,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const session: UserSession = {
            id: json.data.user.id,
            username: json.data.user.username,
            fullName: json.data.user.fullName,
            role: json.data.user.role,
            permissions: json.data.user.permissions,
            token: json.data.token,
            hasPin: json.data.user.hasPin,
          };
          saveSession(session);
          onLoginSuccess(session);
          return;
        }
      }

      if (res.status === 401) {
        setErrorMessage('غلط صارف نام یا پاس ورڈ/پن! (Invalid username or password/PIN)');
        setIsLoading(false);
        return;
      }

      // If server returned 500 or other unexpected error, attempt preset fallback
      const presetKey = Object.keys(PRESET_USERS).find(
        (k) =>
          PRESET_USERS[k].username.toLowerCase() === cleanUname &&
          (PRESET_USERS[k].pass === cleanPass || PRESET_USERS[k].pin === cleanPass)
      );

      if (presetKey) {
        const matched = PRESET_USERS[presetKey];
        const localSession: UserSession = {
          id: `local-${matched.username}`,
          username: matched.username,
          fullName: matched.name,
          role: matched.role,
          permissions: matched.permissions,
          token: `local-token-${Date.now()}`,
          hasPin: true,
        };
        saveSession(localSession);
        onLoginSuccess(localSession);
        return;
      }

      const errJson = await res.json().catch(() => null);
      setErrorMessage(errJson?.error?.message || 'سرور سے رابطہ ممکن نہیں ہو سکا۔ دوبارہ کوشش کریں۔');
      setIsLoading(false);
    } catch {
      clearTimeout(timeoutId);
      // Offline fallback
      const presetKey = Object.keys(PRESET_USERS).find(
        (k) =>
          PRESET_USERS[k].username.toLowerCase() === cleanUname &&
          (PRESET_USERS[k].pass === cleanPass || PRESET_USERS[k].pin === cleanPass)
      );

      if (presetKey) {
        const matched = PRESET_USERS[presetKey];
        const localSession: UserSession = {
          id: `local-${matched.username}`,
          username: matched.username,
          fullName: matched.name,
          role: matched.role,
          permissions: matched.permissions,
          token: `local-token-${Date.now()}`,
          hasPin: true,
        };
        saveSession(localSession);
        onLoginSuccess(localSession);
        return;
      }

      setErrorMessage('سرور آف لائن ہے یا لاگ ان کی معلومات درست نہیں ہیں۔');
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('صارف کا نام اور پاس ورڈ درج کریں۔');
      return;
    }
    executeLogin(username, password);
  };

  const handleKeypadPress = (val: string) => {
    setPassword((prev) => prev + val);
  };

  const handleKeypadBackspace = () => {
    setPassword((prev) => prev.slice(0, -1));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(#E2E8F0 1.2px, #F8FAFC 1.2px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        direction: 'rtl',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
          border: '1.5px solid #E2E8F0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 24px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: generalInfo.logo_url ? '#FFFFFF' : 'linear-gradient(135deg, #0E8A54 0%, #065F46 100%)',
              border: generalInfo.logo_url ? '1.5px solid #E2E8F0' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(14, 138, 84, 0.15)',
              marginBottom: '12px',
              overflow: 'hidden',
            }}
          >
            {generalInfo.logo_url ? (
              <img src={generalInfo.logo_url} alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
            ) : (
              <Wheat size={28} color="#FFFFFF" strokeWidth={2.4} />
            )}
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
            {generalInfo.mill_name || 'FlourERP POS'}
          </h1>
          <p className="font-nastaleeq" style={{ fontSize: '15px', fontWeight: 800, color: '#64748B', margin: 0 }}>
            {generalInfo.tagline || (generalInfo.mill_name ? `${generalInfo.mill_name} - کاؤنٹر ٹرمینل` : 'المدینہ فلور ملز و گندم چکی - کاؤنٹر ٹرمینل')}
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 12px', borderRadius: '20px', marginTop: '10px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800, color: '#065F46' }}>سسٹم آن لائن و فعال ہے</span>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              marginBottom: '16px',
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FECACA',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#DC2626',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 700 }}>
              {errorMessage}
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Username Input */}
          <div>
            <label
              className="font-nastaleeq"
              style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}
            >
              صارف کا نام / آپریٹر آئی ڈی:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: asif یا hanzala"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 38px 0 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  textAlign: 'right',
                  backgroundColor: '#F8FAFC',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0E8A54';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 138, 84, 0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <User
                size={17}
                color="#94A3B8"
                style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label
                className="font-nastaleeq"
                style={{ fontSize: '14px', fontWeight: 800, color: '#334155' }}
              >
                پاس ورڈ یا سکیورٹی پن:
              </label>
              <button
                type="button"
                onClick={() => setShowKeypad(!showKeypad)}
                style={{
                  fontSize: '11px',
                  color: '#64748B',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <KeyRound size={12} />
                <span className="font-nastaleeq">{showKeypad ? 'کی پیڈ بند کریں' : 'ٹچ کی پیڈ'}</span>
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="پاس ورڈ یا 4-ہندسوں کا پن"
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 38px 0 40px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  textAlign: 'right',
                  backgroundColor: '#F8FAFC',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0E8A54';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 138, 84, 0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <Lock
                size={17}
                color="#94A3B8"
                style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '2px',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* On-Screen Touch Keypad */}
          {showKeypad && (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '10px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
              }}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="touch-active"
                  style={{
                    height: '38px',
                    borderRadius: '7px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPassword('')}
                className="touch-active"
                style={{
                  height: '38px',
                  borderRadius: '7px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                صاف
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="touch-active"
                style={{
                  height: '38px',
                  borderRadius: '7px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadBackspace}
                className="touch-active"
                style={{
                  height: '38px',
                  borderRadius: '7px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <Delete size={17} />
              </button>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="button"
            onClick={() => {
              if (!username.trim() || !password.trim()) {
                setErrorMessage('صارف کا نام اور پاس ورڈ درج کریں۔');
                return;
              }
              executeLogin(username, password);
            }}
            disabled={isLoading}
            className="touch-active"
            style={{
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0E8A54 0%, #065F46 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 900,
              fontSize: '15px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 16px rgba(14, 138, 84, 0.28)',
              marginTop: '4px',
              opacity: isLoading ? 0.75 : 1,
            }}
          >
            <LogIn size={18} />
            <span className="font-nastaleeq" style={{ fontSize: '17px' }}>
              {isLoading ? 'تصدیق ہو رہی ہے، براہ کرم انتظار کریں...' : 'ٹرمینل میں لاگ ان کریں'}
            </span>
          </button>
        </form>

        {/* Quick Demo Credentials Accordion (Picture Two Style in Urdu) */}
        <div style={{ marginTop: '18px', width: '100%' }}>
          <button
            type="button"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 16px',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: showDemoAccounts ? '14px 14px 0 0' : '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
              direction: 'ltr',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={17} color="#2563EB" />
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#1E293B' }}>
                فوری ڈیمو اکاؤنٹس (Quick Demo Credentials)
              </span>
            </div>
            <ChevronDown
              size={17}
              color="#64748B"
              style={{
                transform: showDemoAccounts ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {showDemoAccounts && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderTop: 'none',
                borderRadius: '0 0 14px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                direction: 'rtl',
              }}
            >
              {/* Account 1: Biller */}
              <div
                onClick={() => handleQuickLogin('asif')}
                className="touch-active"
                style={{
                  backgroundColor: '#F0F9FF',
                  border: '1.5px solid #BAE6FD',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #BAE6FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284C7',
                    }}
                  >
                    <ShoppingCart size={17} />
                  </div>
                  <div>
                    <div className="font-nastaleeq" style={{ fontWeight: 900, fontSize: '14.5px', color: '#0369A1', lineHeight: 1.2 }}>
                      محمد عاصف (کاؤنٹر آپریٹر)
                    </div>
                    <div style={{ fontSize: '11px', color: '#0284C7', fontFamily: 'var(--font-mono)' }}>
                      ID: asif | PIN: 0001 / biller123
                    </div>
                  </div>
                </div>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                  }}
                >
                  فوری داخل ہوں
                </span>
              </div>

              {/* Account 2: SuperAdmin */}
              <div
                onClick={() => handleQuickLogin('hanzala')}
                className="touch-active"
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '1.5px solid #FDE68A',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #FDE68A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#D97706',
                    }}
                  >
                    <ShieldCheck size={17} />
                  </div>
                  <div>
                    <div className="font-nastaleeq" style={{ fontWeight: 900, fontSize: '14.5px', color: '#92400E', lineHeight: 1.2 }}>
                      حنظلہ مشتاق (مالک چکی / ایڈمن)
                    </div>
                    <div style={{ fontSize: '11px', color: '#B45309', fontFamily: 'var(--font-mono)' }}>
                      ID: hanzala | PIN: 1234 / admin123
                    </div>
                  </div>
                </div>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                  }}
                >
                  فوری داخل ہوں
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div
          style={{
            marginTop: '18px',
            paddingTop: '12px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#64748B',
          }}
        >
          <CheckCircle2 size={14} color="#16A34A" />
          <span className="font-nastaleeq">
            محفوظ ٹرمینل سیشن • پرمیشنز کا خودکار اطلاق
          </span>
        </div>
      </div>
    </div>
  );
};
