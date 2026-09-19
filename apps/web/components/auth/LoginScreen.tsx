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

      if (res.status === 401) {
        setErrorMessage('غلط صارف نام یا پاس ورڈ! برائے مہربانی درست معلومات درج کریں۔');
        setIsLoading(false);
        return;
      }
    } catch {
      // Offline fallback
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
        backgroundImage: 'radial-gradient(#CBD5E1 0.75px, #F4F5EE 0.75px)',
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
          maxWidth: '860px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(65, 72, 51, 0.08), 0 8px 10px -6px rgba(65, 72, 51, 0.04)',
          border: '1.5px solid #C2C5AA',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 1. Light Clean Brand Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1.5px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#7F4F24', // Warm Timber
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(127, 79, 36, 0.2)',
              }}
            >
              <Wheat size={24} color="#FFFFFF" strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#414833', letterSpacing: '-0.2px' }}>
                FlourERP POS
              </div>
              <div
                className="font-nastaleeq"
                style={{ fontSize: '14px', fontWeight: 800, color: '#656D4A', lineHeight: 1.1 }}
              >
                المدینہ فلور ملز و گندم چکی - کاؤنٹر ٹرمینل لاگ ان
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                boxShadow: '0 0 5px #16a34a',
              }}
            />
            <span className="font-nastaleeq">سسٹم آن لائن و تیار</span>
          </div>
        </div>

        {/* 2. Main Body Grid */}
        <div
          style={{
            padding: '22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Column 1: Quick 1-Click Role Login Cards (Relative Color Fills) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h2
                className="font-nastaleeq"
                style={{ fontSize: '17px', fontWeight: 900, color: '#414833', margin: 0 }}
              >
                فوری لاگ ان (Quick Role Login)
              </h2>
              <p
                className="font-nastaleeq"
                style={{ fontSize: '13px', color: '#656D4A', marginTop: '2px', fontWeight: 600 }}
              >
                اپنا کاؤنٹر یا ایڈمنسٹریٹر رول منتخب کر کے فوری داخل ہوں:
              </p>
            </div>

            {/* Biller Role Card - Relative Soft Blue */}
            <div
              onClick={() => handleQuickLogin('asif')}
              className="touch-active"
              style={{
                backgroundColor: '#f0f9ff', // Relative soft blue
                border: '1.5px solid #bae6fd',
                borderRadius: '12px',
                padding: '14px 16px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #bae6fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <div
                      className="font-nastaleeq"
                      style={{ fontSize: '16px', fontWeight: 900, color: '#075985', lineHeight: 1.2 }}
                    >
                      محمد عاصف (کاؤنٹر آپریٹر)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 600 }}>
                      Role: Biller | ID: asif
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    color: '#0284c7',
                    border: '1px solid #bae6fd',
                  }}
                >
                  کاؤنٹر #01
                </span>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '5px',
                    backgroundColor: '#ffffff',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                  }}
                >
                  ✓ سیلز بلنگ (F8)
                </span>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '5px',
                    backgroundColor: '#ffffff',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
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
                  marginTop: '12px',
                  padding: '8px',
                  borderRadius: '7px',
                  backgroundColor: '#0284c7',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)',
                }}
              >
                <LogIn size={15} />
                <span className="font-nastaleeq">بطور کاؤنٹر بلر داخل ہوں</span>
              </button>
            </div>

            {/* Admin Role Card - Relative Soft Amber */}
            <div
              onClick={() => handleQuickLogin('hanzala')}
              className="touch-active"
              style={{
                backgroundColor: '#fffbeb', // Relative soft amber
                border: '1.5px solid #fde68a',
                borderRadius: '12px',
                padding: '14px 16px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d97706',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div
                      className="font-nastaleeq"
                      style={{ fontSize: '16px', fontWeight: 900, color: '#92400e', lineHeight: 1.2 }}
                    >
                      Hanzala Mushtaq (مالک چکی)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#b45309', fontWeight: 600 }}>
                      Role: SuperAdmin | ID: hanzala
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    color: '#d97706',
                    border: '1px solid #fde68a',
                  }}
                >
                  ایڈمنسٹریٹر
                </span>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '5px',
                    backgroundColor: '#ffffff',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                  }}
                >
                  ✓ مالیاتی روزنامچہ
                </span>
                <span
                  className="font-nastaleeq"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '5px',
                    backgroundColor: '#ffffff',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                  }}
                >
                  ✓ ریٹس و پرمیشنز کنٹرول (RBAC)
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
                  marginTop: '12px',
                  padding: '8px',
                  borderRadius: '7px',
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
                  boxShadow: '0 1px 2px rgba(127, 79, 36, 0.2)',
                }}
              >
                <LogIn size={15} />
                <span className="font-nastaleeq">بطور ایڈمن داخل ہوں</span>
              </button>
            </div>
          </div>

          {/* Column 2: Manual Credentials Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3
                  className="font-nastaleeq"
                  style={{ fontSize: '16px', fontWeight: 900, color: '#414833', margin: 0 }}
                >
                  دستی لاگ ان (Manual Entry)
                </h3>

                <button
                  type="button"
                  onClick={() => setShowKeypad(!showKeypad)}
                  style={{
                    fontSize: '11.5px',
                    color: '#656D4A',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <KeyRound size={12} />
                  <span className="font-nastaleeq">{showKeypad ? 'کی پیڈ چھپائیں' : 'ٹچ کی پیڈ'}</span>
                </button>
              </div>

              {errorMessage && (
                <div
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '7px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#be123c',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span className="font-nastaleeq" style={{ fontSize: '12.5px', fontWeight: 700 }}>
                    {errorMessage}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Username Input */}
                <div>
                  <label
                    className="font-nastaleeq"
                    style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#414833', marginBottom: '3px' }}
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
                        height: '38px',
                        padding: '0 34px 0 10px',
                        borderRadius: '7px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        textAlign: 'right',
                        backgroundColor: '#F8FAFC',
                      }}
                    />
                    <User
                      size={15}
                      color="#94A3B8"
                      style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none' }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label
                    className="font-nastaleeq"
                    style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#414833', marginBottom: '3px' }}
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
                        height: '38px',
                        padding: '0 34px 0 36px',
                        borderRadius: '7px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        textAlign: 'right',
                        backgroundColor: '#F8FAFC',
                      }}
                    />
                    <Lock
                      size={15}
                      color="#94A3B8"
                      style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '10px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* On-Screen Keypad */}
                {showKeypad && (
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '5px',
                    }}
                  >
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleKeypadPress(digit)}
                        className="touch-active"
                        style={{
                          height: '34px',
                          borderRadius: '5px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#ffffff',
                          fontSize: '15px',
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
                        height: '34px',
                        borderRadius: '5px',
                        border: '1px solid #fecdd3',
                        backgroundColor: '#fff1f2',
                        color: '#be123c',
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
                        height: '34px',
                        borderRadius: '5px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#ffffff',
                        fontSize: '15px',
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
                        height: '34px',
                        borderRadius: '5px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Delete size={15} />
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="touch-active"
                  style={{
                    height: '40px',
                    borderRadius: '7px',
                    backgroundColor: '#7F4F24', // Warm Timber Primary
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(127, 79, 36, 0.2)',
                  }}
                >
                  <LogIn size={16} />
                  <span className="font-nastaleeq">
                    {isLoading ? 'لاگ ان ہو رہا ہے...' : 'ٹرمینل میں لاگ ان کریں'}
                  </span>
                </button>
              </form>
            </div>

            {/* Security Guarantee */}
            <div
              style={{
                marginTop: '14px',
                paddingTop: '10px',
                borderTop: '1px solid #E2E8F0',
                fontSize: '11px',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={13} color="#16A34A" />
              <span className="font-nastaleeq">
                محفوظ ٹرمینل سیشن • پرمیشنز کا خودکار اطلاق
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
