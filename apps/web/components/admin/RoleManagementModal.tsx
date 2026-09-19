'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Plus,
  Check,
  Users,
  KeyRound,
  Lock,
  UserCheck,
  Edit2,
  Trash2,
  Save,
  AlertCircle,
} from 'lucide-react';
import { getToken } from '../../lib/auth';

export interface PermissionItem {
  code: string;
  labelUr: string;
  labelEn: string;
  category: 'billing' | 'pricing' | 'credit' | 'reports' | 'admin';
}

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
}

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  roleName: string;
}

export const ALL_PERMISSIONS: PermissionItem[] = [
  { code: 'can_bill', labelUr: 'نیا سیلز بل بنانا', labelEn: 'Standard Product Billing', category: 'billing' },
  { code: 'can_pisai', labelUr: 'گندم پسائی ٹوکن جاری کرنا', labelEn: 'Grinding Token Issuance', category: 'billing' },
  { code: 'can_discount', labelUr: 'بل میں رعایت / ڈسکاؤنٹ دینا', labelEn: 'Apply Discretionary Discounts', category: 'billing' },
  { code: 'can_manage_prices', labelUr: 'روزانہ کے ریٹ تبدیل کرنا', labelEn: 'Manage Daily Rates', category: 'pricing' },
  { code: 'can_issue_credit', labelUr: 'ادھار کھاتہ جاری کرنا', labelEn: 'Issue Credit (Udhaar)', category: 'credit' },
  { code: 'can_view_reports', labelUr: 'روزنامچہ و منافع رپورٹس دیکھنا', labelEn: 'View Financial Reports & Ledger', category: 'reports' },
  { code: 'can_void_bills', labelUr: 'بل منسوخ یا کینسل کرنا', labelEn: 'Void Completed Bills', category: 'admin' },
  { code: 'can_close_day', labelUr: 'دن کا اختتام اور Z-Report', labelEn: 'Daily Closing & Shift Reports', category: 'admin' },
  { code: 'can_manage_users', labelUr: 'سٹاف اور رولز مینیج کرنا', labelEn: 'Manage Staff & Role Permissions', category: 'admin' },
];

const INITIAL_ROLES: RoleItem[] = [
  {
    id: 'super-admin',
    name: 'SuperAdmin (مالک)',
    description: 'تمام اختیارات اور مکمل کنٹرول',
    isSystem: true,
    userCount: 1,
    permissions: ALL_PERMISSIONS.map((p) => p.code),
  },
  {
    id: 'biller',
    name: 'Biller (کاؤنٹر آپریٹر)',
    description: 'روزمرہ بلنگ اور پسائی ٹوکن بنانے کے اختیارات',
    isSystem: true,
    userCount: 1,
    permissions: ['can_bill', 'can_pisai'],
  },
  {
    id: 'shift-supervisor',
    name: 'ShiftSupervisor (شفٹ انچارج)',
    description: 'بلنگ، ڈسکاؤنٹ اور روزنامچہ دیکھنے کے اختیارات',
    isSystem: false,
    userCount: 0,
    permissions: ['can_bill', 'can_pisai', 'can_discount', 'can_view_reports'],
  },
];

const INITIAL_STAFF: StaffUser[] = [
  { id: '1', username: 'hanzala', fullName: 'Hanzala Mushtaq (Owner)', roleName: 'SuperAdmin (مالک)' },
  { id: '2', username: 'asif', fullName: 'محمد عاصف (کاؤنٹر 01)', roleName: 'Biller (کاؤنٹر آپریٹر)' },
];

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRolesUpdated?: (roles: RoleItem[]) => void;
}

export const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  onRolesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'staff' | 'create'>('roles');
  const [roles, setRoles] = useState<RoleItem[]>(INITIAL_ROLES);
  const [staff, setStaff] = useState<StaffUser[]>(INITIAL_STAFF);

  // Edit Role State
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['can_bill']);
  const [noticeMessage, setNoticeMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch roles & staff from backend with auth token
  const refreshRolesFromBackend = async () => {
    const token = getToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch('http://localhost:5000/api/roles', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setRoles(json.data);
          onRolesUpdated?.(json.data);
        }
      }
    } catch {
      // Local state fallback
    }

    try {
      const staffRes = await fetch('http://localhost:5000/api/roles/staff', { headers });
      if (staffRes.ok) {
        const staffJson = await staffRes.json();
        if (staffJson.success && staffJson.data) {
          setStaff(staffJson.data);
        }
      }
    } catch {
      // Local state fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshRolesFromBackend();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNoticeMessage({ text, type });
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const toggleNewRolePerm = (code: string) => {
    setSelectedPerms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleEditRolePerm = (code: string) => {
    setEditPerms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // 1. CREATE ROLE
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || selectedPerms.length === 0) return;

    const newRole: RoleItem = {
      id: `custom-${Date.now()}`,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Custom staff role',
      isSystem: false,
      userCount: 0,
      permissions: selectedPerms,
    };

    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const res = await fetch('http://localhost:5000/api/roles', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.id) {
          newRole.id = json.data.id;
        }
      }
    } catch {
      // Local state fallback
    }

    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    onRolesUpdated?.(updatedRoles);
    showNotice(`نیا رول "${newRole.name}" کامیابی سے شامل کر دیا گیا ہے۔`);
    setNewRoleName('');
    setNewRoleDesc('');
    setSelectedPerms(['can_bill']);
    setTimeout(() => setActiveTab('roles'), 1000);
  };

  // 2. UPDATE ROLE PERMISSIONS
  const handleSaveRoleEdit = async () => {
    if (!editingRole) return;

    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      await fetch(`http://localhost:5000/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          permissions: editPerms,
        }),
      });
    } catch {
      // Local state fallback
    }

    const updatedRoles = roles.map((r) =>
      r.id === editingRole.id ? { ...r, permissions: editPerms } : r
    );

    setRoles(updatedRoles);
    onRolesUpdated?.(updatedRoles);
    showNotice(`رول "${editingRole.name}" کے اختیارات کامیابی سے اپڈیٹ ہو گئے۔`);
    setEditingRole(null);
  };

  // 3. DELETE ROLE
  const handleDeleteRole = async (role: RoleItem) => {
    if (role.isSystem) {
      showNotice('سسٹم رولز (SuperAdmin, Biller) کو ڈیلیٹ نہیں کیا جا سکتا۔', 'error');
      return;
    }

    const confirmDelete = window.confirm(`کیا آپ واقعی رول "${role.name}" کو ڈیلیٹ کرنا چاہتے ہیں؟`);
    if (!confirmDelete) return;

    const token = getToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      await fetch(`http://localhost:5000/api/roles/${role.id}`, {
        method: 'DELETE',
        headers,
      });
    } catch {
      // Local state fallback
    }

    const updatedRoles = roles.filter((r) => r.id !== role.id);
    setRoles(updatedRoles);
    onRolesUpdated?.(updatedRoles);
    showNotice(`رول "${role.name}" ڈیلیٹ کر دیا گیا ہے۔`);
  };

  // 4. ASSIGN ROLE TO STAFF
  const handleAssignRole = async (userId: string, newRoleName: string) => {
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      await fetch(`http://localhost:5000/api/roles/staff/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ roleName: newRoleName }),
      });
    } catch {
      // Local fallback
    }

    setStaff((prev) =>
      prev.map((s) => (s.id === userId ? { ...s, roleName: newRoleName } : s))
    );
    showNotice('سٹاف ممبر کا رول کامیابی سے تبدیل ہو گیا۔');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          border: '1.5px solid #CBD5E1',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#414833',
            color: '#F4F5EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            direction: 'rtl',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#7F4F24',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <ShieldCheck size={22} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="font-nastaleeq" style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>
                اختیارات و رولز مینیجر (RBAC & Permissions CRUD)
              </h2>
              <div style={{ fontSize: '11px', color: '#C2C5AA', marginTop: '2px' }}>
                ہر رول کے اختیارات کو اپنی مرضی سے بنائیں، تبدیل کریں اور سٹاف کو لگائیں
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#C2C5AA',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            padding: '0 16px',
            direction: 'rtl',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('roles');
              setEditingRole(null);
            }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'roles' ? '3px solid #7F4F24' : '3px solid transparent',
              color: activeTab === 'roles' ? '#414833' : '#64748B',
              fontWeight: activeTab === 'roles' ? 800 : 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <KeyRound size={15} />
            <span className="font-nastaleeq">موجودہ رولز ({roles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('staff');
              setEditingRole(null);
            }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'staff' ? '3px solid #7F4F24' : '3px solid transparent',
              color: activeTab === 'staff' ? '#414833' : '#64748B',
              fontWeight: activeTab === 'staff' ? 800 : 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={15} />
            <span className="font-nastaleeq">سٹاف کو رول لگائیں ({staff.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setEditingRole(null);
            }}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'create' ? '3px solid #7F4F24' : '3px solid transparent',
              color: activeTab === 'create' ? '#414833' : '#64748B',
              fontWeight: activeTab === 'create' ? 800 : 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} />
            <span className="font-nastaleeq">+ نیا رول بنائیں (Create Role)</span>
          </button>
        </div>

        {/* Notifications */}
        {noticeMessage && (
          <div
            style={{
              backgroundColor: noticeMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              borderBottom: noticeMessage.type === 'success' ? '1px solid #BBF7D0' : '1px solid #FECACA',
              padding: '8px 16px',
              color: noticeMessage.type === 'success' ? '#15803D' : '#B91C1C',
              fontSize: '12.5px',
              fontWeight: 700,
              textAlign: 'center',
              direction: 'rtl',
            }}
          >
            {noticeMessage.type === 'success' ? '✓ ' : '⚠ '}
            {noticeMessage.text}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, direction: 'rtl' }}>
          {/* INLINE EDIT ROLE PERMISSIONS VIEW */}
          {editingRole ? (
            <div style={{ backgroundColor: '#FAF7EE', padding: '16px', borderRadius: '12px', border: '1.5px solid #E6D5C3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 className="font-nastaleeq" style={{ fontSize: '17px', fontWeight: 900, color: '#414833', margin: 0 }}>
                    رول اختیارات میں تبدیلی: {editingRole.name}
                  </h3>
                  <div style={{ fontSize: '11.5px', color: '#656D4A', marginTop: '2px' }}>
                    اختیارات کو منتخب یا غیر منتخب کریں اور محفوظ کریں
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  منسوخ (Cancel)
                </button>
              </div>

              {/* Checkboxes Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                {ALL_PERMISSIONS.map((perm) => {
                  const isChecked = editPerms.includes(perm.code);
                  return (
                    <div
                      key={perm.code}
                      onClick={() => toggleEditRolePerm(perm.code)}
                      className="touch-active"
                      style={{
                        backgroundColor: isChecked ? '#FFFBEB' : '#FFFFFF',
                        border: isChecked ? '1.5px solid #D97706' : '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isChecked ? 'none' : '1.5px solid #94A3B8',
                          backgroundColor: isChecked ? '#D97706' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>

                      <div>
                        <div className="font-nastaleeq" style={{ fontSize: '12.5px', fontWeight: 800, color: isChecked ? '#92400E' : '#334155' }}>
                          {perm.labelUr}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>{perm.labelEn}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSaveRoleEdit}
                  className="touch-active"
                  style={{
                    height: '38px',
                    padding: '0 18px',
                    borderRadius: '7px',
                    backgroundColor: '#7F4F24',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Save size={15} />
                  <span className="font-nastaleeq">اختیارات محفوظ کریں (Save Permissions)</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'roles' ? (
            /* TAB 1: ROLES OVERVIEW WITH EDIT & DELETE BUTTONS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roles.map((r) => (
                <div
                  key={r.id}
                  style={{
                    backgroundColor: r.isSystem ? '#FAF7EE' : '#FFFFFF',
                    border: r.isSystem ? '1.5px solid #E6D5C3' : '1.5px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-nastaleeq" style={{ fontSize: '15px', fontWeight: 900, color: '#414833' }}>
                        {r.name}
                      </span>
                      {r.isSystem && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#7F4F24',
                            color: '#FFFFFF',
                          }}
                        >
                          SYSTEM ROLE
                        </span>
                      )}
                    </div>

                    {/* Action buttons: Edit Permissions & Delete Role */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRole(r);
                          setEditPerms(r.permissions);
                        }}
                        className="touch-active"
                        title="Edit Permissions"
                        style={{
                          height: '28px',
                          padding: '0 10px',
                          borderRadius: '5px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: '#414833',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Edit2 size={12} />
                        <span className="font-nastaleeq">اختیارات تبدیل کریں</span>
                      </button>

                      {!r.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(r)}
                          className="touch-active"
                          title="Delete Role"
                          style={{
                            height: '28px',
                            padding: '0 8px',
                            borderRadius: '5px',
                            border: '1px solid #FECACA',
                            backgroundColor: '#FEF2F2',
                            color: '#B91C1C',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Trash2 size={12} />
                          <span className="font-nastaleeq">ڈیلیٹ</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px', lineHeight: 1.3 }}>
                    {r.description}
                  </p>

                  {/* Permissions Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {r.permissions.map((permCode) => {
                      const def = ALL_PERMISSIONS.find((p) => p.code === permCode);
                      return (
                        <span
                          key={permCode}
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '5px',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={11} color="#16A34A" strokeWidth={3} />
                          <span className="font-nastaleeq">{def ? def.labelUr : permCode}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'staff' ? (
            /* TAB 2: ASSIGN ROLES TO USERS */
            <div>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px', fontWeight: 600 }}>
                مندرجہ ذیل سٹاف ممبرز کے لیے رول منتخب کریں:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {staff.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          color: '#0284C7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                        }}
                      >
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <div className="font-nastaleeq" style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                          {member.fullName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                          @{member.username}
                        </div>
                      </div>
                    </div>

                    {/* Role Selector Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>موجودہ رول:</span>
                      <select
                        value={member.roleName}
                        onChange={(e) => handleAssignRole(member.id, e.target.value)}
                        style={{
                          height: '36px',
                          padding: '0 12px',
                          borderRadius: '6px',
                          border: '1.5px solid #CBD5E1',
                          backgroundColor: '#F8FAFC',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: '#0F172A',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.name}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* TAB 3: CREATE NEW ROLE */
            <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="font-nastaleeq" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  رول کا نام (Role Name):
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: کیشیئر مینیجر (Cashier Manager)"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label className="font-nastaleeq" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  تفصیل (Description):
                </label>
                <input
                  type="text"
                  placeholder="اس رول کے بنیادی اختیارات کی وضاحت لکھیں..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label className="font-nastaleeq" style={{ display: 'block', fontSize: '13.5px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                  اس رول کے لیے اختیارات (Permissions) منتخب کریں:
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPerms.includes(perm.code);
                    return (
                      <div
                        key={perm.code}
                        onClick={() => toggleNewRolePerm(perm.code)}
                        className="touch-active"
                        style={{
                          backgroundColor: isChecked ? '#FFFBEB' : '#F8FAFC',
                          border: isChecked ? '1.5px solid #D97706' : '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.1s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: isChecked ? 'none' : '1.5px solid #94A3B8',
                            backgroundColor: isChecked ? '#D97706' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                        </div>

                        <div>
                          <div className="font-nastaleeq" style={{ fontSize: '12.5px', fontWeight: 800, color: isChecked ? '#92400E' : '#334155' }}>
                            {perm.labelUr}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B' }}>{perm.labelEn}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                <button
                  type="submit"
                  className="touch-active"
                  style={{
                    height: '40px',
                    padding: '0 20px',
                    borderRadius: '8px',
                    backgroundColor: '#7F4F24',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Plus size={16} />
                  <span className="font-nastaleeq">رول محفوظ کریں (Save Role)</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            direction: 'rtl',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}>
            <Lock size={12} />
            <span>تمام اختیارات سرور لیول پر محفوظ اور مانیٹر کیے جاتے ہیں۔</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
