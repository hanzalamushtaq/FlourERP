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
import { useTheme } from '../../context/ThemeContext';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const generalInfo = useGeneralInfo();
  const { isDark, isNightMode } = useTheme();
  const dark = isDark || isNightMode;

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
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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

      // Check preset users before throwing 401 error
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

      if (res.status === 401) {
        setErrorMessage('غلط صارف نام یا پاس ورڈ/پن! (Invalid username or password/PIN)');
        setIsLoading(false);
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
      className="login-screen-root"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: dark ? '#0B0F19' : '#F8FAFC',
        backgroundImage: dark
          ? 'radial-gradient(#1E293B 1.2px, #0B0F19 1.2px)'
          : 'radial-gradient(#CBD5E1 1.2px, #F8FAFC 1.2px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        direction: 'rtl',
      }}
    >
      <div
        className="login-card-container"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: dark ? '#1E293B' : '#FFFFFF',
          borderRadius: '20px',
          boxShadow: dark
            ? '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(51, 65, 85, 0.5)'
            : '0 20px 40px -15px rgba(15, 23, 42, 0.1), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
          border: dark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
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
              background: generalInfo.logo_url ? (dark ? '#0F172A' : '#FFFFFF') : 'linear-gradient(135deg, #0E8A54 0%, #065F46 100%)',
              border: generalInfo.logo_url ? (dark ? '1.5px solid #334155' : '1.5px solid #E2E8F0') : 'none',
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

          <h1
            className="login-brand-title"
            style={{
              fontSize: '24px',
              fontWeight: 900,
              color: dark ? '#F8FAFC' : '#0F172A',
              margin: '0 0 4px 0',
              letterSpacing: '-0.3px',
            }}
          >
            {generalInfo.mill_name || 'FlourERP POS'}
          </h1>
          <p
            className="font-nastaleeq login-brand-subtitle"
            style={{
              fontSize: '15px',
              fontWeight: 800,
              color: dark ? '#94A3B8' : '#64748B',
              margin: 0,
            }}
          >
            {generalInfo.tagline || (generalInfo.mill_name ? `${generalInfo.mill_name} - کاؤنٹر ٹرمینل` : 'المدینہ فلور ملز و گندم چکی - کاؤنٹر ٹرمینل')}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: dark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
              border: dark ? '1px solid #065F46' : '1px solid #A7F3D0',
              padding: '4px 12px',
              borderRadius: '20px',
              marginTop: '10px',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span className="font-nastaleeq" style={{ fontSize: '12px', fontWeight: 800, color: dark ? '#34D399' : '#065F46' }}>
              سسٹم آن لائن و فعال ہے
            </span>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              marginBottom: '16px',
              backgroundColor: dark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
              border: dark ? '1.5px solid #EF4444' : '1.5px solid #FECACA',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: dark ? '#FCA5A5' : '#DC2626',
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
              className="font-nastaleeq login-field-label"
              style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: 900,
                color: dark ? '#F8FAFC' : '#0F172A',
                marginBottom: '6px',
              }}
            >
              صارف کا نام / آپریٹر آئی ڈی:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: asif یا hanzala"
                className="login-input-field"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 38px 0 12px',
                  borderRadius: '10px',
                  border: dark ? '1.5px solid #334155' : '1.5px solid #CBD5E1',
                  fontSize: '15px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  textAlign: 'right',
                  backgroundColor: dark ? '#0F172A' : '#F8FAFC',
                  color: dark ? '#F8FAFC' : '#0F172A',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#10B981';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.18)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = dark ? '#334155' : '#CBD5E1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <User
                size={17}
                color={dark ? '#64748B' : '#94A3B8'}
                style={{ position: 'absolute', right: '12px', top: '14px', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label
                className="font-nastaleeq login-field-label"
                style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  color: dark ? '#F8FAFC' : '#0F172A',
                }}
              >
                پاس ورڈ یا سکیورٹی پن:
              </label>
              <button
                type="button"
                onClick={() => setShowKeypad(!showKeypad)}
                style={{
                  fontSize: '11px',
                  color: dark ? '#94A3B8' : '#64748B',
                  backgroundColor: dark ? '#0F172A' : '#F1F5F9',
                  border: dark ? '1px solid #334155' : '1px solid #CBD5E1',
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
                className="login-input-field"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 38px 0 40px',
                  borderRadius: '10px',
                  border: dark ? '1.5px solid #334155' : '1.5px solid #CBD5E1',
                  fontSize: '15px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  textAlign: 'right',
                  backgroundColor: dark ? '#0F172A' : '#F8FAFC',
                  color: dark ? '#F8FAFC' : '#0F172A',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#10B981';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.18)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = dark ? '#334155' : '#CBD5E1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <Lock
                size={17}
                color={dark ? '#64748B' : '#94A3B8'}
                style={{ position: 'absolute', right: '12px', top: '14px', pointerEvents: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '13px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: dark ? '#64748B' : '#94A3B8',
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
                backgroundColor: dark ? '#0F172A' : '#F8FAFC',
                padding: '10px',
                borderRadius: '10px',
                border: dark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
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
                    height: '40px',
                    borderRadius: '7px',
                    border: dark ? '1px solid #334155' : '1px solid #CBD5E1',
                    backgroundColor: dark ? '#1E293B' : '#FFFFFF',
                    color: dark ? '#F8FAFC' : '#0F172A',
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
                  height: '40px',
                  borderRadius: '7px',
                  border: dark ? '1px solid #7F1D1D' : '1px solid #FECACA',
                  backgroundColor: dark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2',
                  color: dark ? '#FCA5A5' : '#DC2626',
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
                  height: '40px',
                  borderRadius: '7px',
                  border: dark ? '1px solid #334155' : '1px solid #CBD5E1',
                  backgroundColor: dark ? '#1E293B' : '#FFFFFF',
                  color: dark ? '#F8FAFC' : '#0F172A',
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
                  height: '40px',
                  borderRadius: '7px',
                  border: dark ? '1px solid #334155' : '1px solid #CBD5E1',
                  backgroundColor: dark ? '#1E293B' : '#FFFFFF',
                  color: dark ? '#F8FAFC' : '#0F172A',
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
            type="submit"
            disabled={isLoading}
            className="touch-active"
            style={{
              height: '48px',
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

        {/* Quick Demo Credentials Accordion */}
        <div style={{ marginTop: '18px', width: '100%' }}>
          <button
            type="button"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="login-demo-accordion"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 16px',
              backgroundColor: dark ? '#0F172A' : '#F8FAFC',
              border: dark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
              borderRadius: showDemoAccounts ? '14px 14px 0 0' : '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
              direction: 'ltr',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={17} color="#2563EB" />
              <span style={{ fontWeight: 800, fontSize: '13px', color: dark ? '#F8FAFC' : '#1E293B' }}>
                فوری ڈیمو اکاؤنٹس (Quick Demo Credentials)
              </span>
            </div>
            <ChevronDown
              size={17}
              color={dark ? '#94A3B8' : '#64748B'}
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
                backgroundColor: dark ? '#0F172A' : '#FFFFFF',
                border: dark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
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
                  backgroundColor: dark ? 'rgba(3, 105, 161, 0.16)' : '#F0F9FF',
                  border: dark ? '1.5px solid #0369A1' : '1.5px solid #BAE6FD',
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
                      backgroundColor: dark ? '#0F172A' : '#FFFFFF',
                      border: dark ? '1px solid #0369A1' : '1px solid #BAE6FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: dark ? '#38BDF8' : '#0284C7',
                    }}
                  >
                    <ShoppingCart size={17} />
                  </div>
                  <div>
                    <div className="font-nastaleeq" style={{ fontWeight: 900, fontSize: '14.5px', color: dark ? '#38BDF8' : '#0369A1', lineHeight: 1.2 }}>
                      محمد عاصف (کاؤنٹر آپریٹر)
                    </div>
                    <div style={{ fontSize: '11px', color: dark ? '#7DD3FC' : '#0284C7', fontFamily: 'var(--font-mono)' }}>
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
                  backgroundColor: dark ? 'rgba(180, 83, 9, 0.16)' : '#FFFBEB',
                  border: dark ? '1.5px solid #B45309' : '1.5px solid #FDE68A',
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
                      backgroundColor: dark ? '#0F172A' : '#FFFFFF',
                      border: dark ? '1px solid #B45309' : '1px solid #FDE68A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: dark ? '#FBBF24' : '#D97706',
                    }}
                  >
                    <ShieldCheck size={17} />
                  </div>
                  <div>
                    <div className="font-nastaleeq" style={{ fontWeight: 900, fontSize: '14.5px', color: dark ? '#FBBF24' : '#92400E', lineHeight: 1.2 }}>
                      حنظلہ مشتاق (مالک چکی / ایڈمن)
                    </div>
                    <div style={{ fontSize: '11px', color: dark ? '#FDE68A' : '#B45309', fontFamily: 'var(--font-mono)' }}>
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
            borderTop: dark ? '1px solid #334155' : '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '12px',
            color: dark ? '#94A3B8' : '#64748B',
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
