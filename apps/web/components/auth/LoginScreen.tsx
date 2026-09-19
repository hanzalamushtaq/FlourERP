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
  HelpCircle,
  KeyRound,
  Delete,
} from 'lucide-react';
import { UserSession, saveSession, PRESET_USERS } from '../../lib/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('asif');
  const [password, setPassword] = useState<string>('biller123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);
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

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: uname.trim().toLowerCase(),
          password: pass.trim(),
        }),
      });

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

      // If backend returned 401 or failed validation
      if (res.status === 401) {
        setErrorMessage('غلط صارف نام یا پاس ورڈ! برائے مہربانی درست معلومات درج کریں۔');
        setIsLoading(false);
        return;
      }
    } catch {
      // Backend not running or offline: fallback to local preset
      const presetKey = Object.keys(PRESET_USERS).find(
        (k) =>
          PRESET_USERS[k].username.toLowerCase() === uname.trim().toLowerCase() &&
          (PRESET_USERS[k].pass === pass || PRESET_USERS[k].pin === pass)
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

      setErrorMessage('لاگ ان کی معلومات درست نہیں ہیں یا سرور آف لائن ہے۔');
      setIsLoading(false);
      return;
    }

    setErrorMessage('لاگ ان کی تفصیلات درست نہیں ہیں۔');
    setIsLoading(false);
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
        backgroundColor: '#F4F5EE', // Clean Light Canvas
        backgroundImage: 'radial-gradient(#B6AD90 0.75px, #F4F5EE 0.75px)',
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
          maxWidth: '880px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(65, 72, 51, 0.12), 0 8px 10px -6px rgba(65, 72, 51, 0.08)',
          border: '2px solid #C2C5AA',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Brand Banner */}
        <div
          style={{
            backgroundColor: '#414833', // Deep Forest Olive
            padding: '20px 24px',
            color: '#F4F5EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #7F4F24',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#7F4F24', // Warm Timber
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <Wheat size={26} color="#FFFFFF" strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.2px' }}>
                FlourERP POS
              </div>
              <div
                className="font-nastaleeq"
                style={{ fontSize: '16px', fontWeight: 700, color: '#C2C5AA', lineHeight: 1.1 }}
              >
                المدینہ فلور ملز و گندم چکی - کاؤنٹر ٹرمینل لاگ ان
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#656D4A',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#F4F5EE',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
              }}
            />
            <span>سسٹم تیار ہے</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Column 1: Quick 1-Click Role Login Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h2
                className="font-nastaleeq"
                style={{ fontSize: '18px', fontWeight: 900, color: '#414833', margin: 0 }}
              >
                فوری لاگ ان (Quick Role Login)
              </h2>
              <p
                className="font-nastaleeq"
                style={{ fontSize: '13px', color: '#656D4A', marginTop: '2px' }}
              >
                اپنی ذمہ داری کے مطابق متعلقہ رول منتخب کر کے فوری داخل ہوں:
              </p>
            </div>

            {/* Biller Role Card */}
            <div
              style={{
                border: username === 'asif' ? '2px solid #656D4A' : '1.5px solid #CBD5E1',
                borderRadius: '14px',
                padding: '16px',
                backgroundColor: username === 'asif' ? '#F4F5EE' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onClick={() => handleQuickLogin('asif')}
              className="touch-active"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#656D4A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShoppingCart size={22} />
                  </div>
                  <div>
                    <div
                      className="font-nastaleeq"
                      style={{ fontSize: '16px', fontWeight: 900, color: '#414833' }}
                    >
                      محمد عاصف (کاؤنٹر آپریٹر)
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', direction: 'ltr', textAlign: 'right' }}>
                      Role: <strong>Biller</strong> | ID: <strong>asif</strong>
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#C2C5AA',
                    color: '#414833',
                  }}
                >
                  کاؤنٹر #01
                </span>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#E8EAE0',
                    color: '#414833',
                  }}
                >
                  ✓ پروڈکٹ سیلز بلنگ (F8)
                </span>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#E8EAE0',
                    color: '#414833',
                  }}
                >
                  ✓ گندم پسائی ٹوکن (F2)
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickLogin('asif');
                }}
                disabled={isLoading}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '9px',
                  borderRadius: '8px',
                  backgroundColor: '#656D4A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <LogIn size={15} />
                <span className="font-nastaleeq">بطور کاؤنٹر بلر لاگ ان کریں</span>
              </button>
            </div>

            {/* Admin / Owner Role Card */}
            <div
              style={{
                border: username === 'hanzala' ? '2px solid #7F4F24' : '1.5px solid #CBD5E1',
                borderRadius: '14px',
                padding: '16px',
                backgroundColor: username === 'hanzala' ? '#FBF7F2' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onClick={() => handleQuickLogin('hanzala')}
              className="touch-active"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#7F4F24',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div
                      className="font-nastaleeq"
                      style={{ fontSize: '16px', fontWeight: 900, color: '#414833' }}
                    >
                      Hanzala Mushtaq (مالک چکی)
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', direction: 'ltr', textAlign: 'right' }}>
                      Role: <strong>SuperAdmin</strong> | ID: <strong>hanzala</strong>
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#7F4F24',
                    color: '#FFFFFF',
                  }}
                >
                  ایڈمنسٹریٹر
                </span>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#F3E8DC',
                    color: '#7F4F24',
                  }}
                >
                  ✓ مکمل مالیاتی روزنامچہ
                </span>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#F3E8DC',
                    color: '#7F4F24',
                  }}
                >
                  ✓ روزانہ کے ریٹس کنٹرول
                </span>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#F3E8DC',
                    color: '#7F4F24',
                  }}
                >
                  ✓ رولز و اختیارات مینیجمنٹ (RBAC)
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickLogin('hanzala');
                }}
                disabled={isLoading}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '9px',
                  borderRadius: '8px',
                  backgroundColor: '#7F4F24',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <LogIn size={15} />
                <span className="font-nastaleeq">بطور ایڈمن لاگ ان کریں</span>
              </button>
            </div>
          </div>

          {/* Column 2: Manual Credentials Form & Touch Keypad */}
          <div
            style={{
              backgroundColor: '#FAFAF8',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3
                  className="font-nastaleeq"
                  style={{ fontSize: '17px', fontWeight: 900, color: '#414833', margin: 0 }}
                >
                  دستی لاگ ان (Manual Entry)
                </h3>

                <button
                  type="button"
                  onClick={() => setShowKeypad(!showKeypad)}
                  style={{
                    fontSize: '12px',
                    color: '#656D4A',
                    backgroundColor: '#F4F5EE',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <KeyRound size={13} />
                  <span className="font-nastaleeq">{showKeypad ? 'کی پیڈ چھپائیں' : 'ٹچ کی پیڈ'}</span>
                </button>
              </div>

              {errorMessage && (
                <div
                  style={{
                    marginTop: '12px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #F87171',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#991B1B',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span className="font-nastaleeq" style={{ fontSize: '13px', fontWeight: 700 }}>
                    {errorMessage}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Username / Operator ID */}
                <div>
                  <label
                    className="font-nastaleeq"
                    style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#414833', marginBottom: '4px' }}
                  >
                    صارف نام / آپریٹر آئی ڈی:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. asif or hanzala"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 36px 0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        textAlign: 'right',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <User
                      size={16}
                      color="#94A3B8"
                      style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }}
                    />
                  </div>
                </div>

                {/* Password or PIN */}
                <div>
                  <label
                    className="font-nastaleeq"
                    style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#414833', marginBottom: '4px' }}
                  >
                    پاس ورڈ یا 4-ہندسوں کا سکیورٹی پن:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="پاس ورڈ یا پن درج کریں"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 36px 0 40px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '15px',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        textAlign: 'right',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <Lock
                      size={16}
                      color="#94A3B8"
                      style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '11px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Optional On-Screen Keypad for Touch Monitors */}
                {showKeypad && (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
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
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: 'pointer',
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
                        borderRadius: '6px',
                        border: '1px solid #FCA5A5',
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B',
                        fontSize: '11px',
                        fontWeight: 700,
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
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: 'pointer',
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
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Delete size={16} />
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="touch-active"
                  style={{
                    height: '44px',
                    borderRadius: '8px',
                    backgroundColor: '#7F4F24', // Warm Timber Primary
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '4px',
                    boxShadow: '0 2px 4px rgba(127, 79, 36, 0.25)',
                  }}
                >
                  <LogIn size={18} />
                  <span className="font-nastaleeq">
                    {isLoading ? 'لاگ ان ہو رہا ہے...' : 'ٹرمینل میں لاگ ان کریں'}
                  </span>
                </button>
              </form>
            </div>

            {/* Security Notice */}
            <div
              style={{
                marginTop: '18px',
                paddingTop: '12px',
                borderTop: '1px solid #E2E8F0',
                fontSize: '11.5px',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={14} color="#16A34A" />
              <span className="font-nastaleeq">
                محفوظ ٹرمینل سیشن • رول پرمیشنز خودکار لاگو ہوتی ہیں
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
