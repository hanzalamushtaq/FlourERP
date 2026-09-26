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
  Eye,
  EyeOff,
  UserPlus,
  Key,
} from 'lucide-react';
import { getToken } from '../../lib/auth';
import { getApiBaseUrl } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';

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
  roleId?: string;
  isActive?: boolean;
  hasPin?: boolean;
}

export const ALL_PERMISSIONS: PermissionItem[] = [
  { code: 'can_bill', labelUr: 'نیا سیلز بل بنانا', labelEn: 'Standard Product Billing', category: 'billing' },
  { code: 'can_pisai', labelUr: 'گندم پسائی ٹوکن جاری کرنا', labelEn: 'Grinding Token Issuance', category: 'billing' },
  { code: 'can_discount', labelUr: 'بل میں رعایت دینا', labelEn: 'Apply Discretionary Discounts', category: 'billing' },
  { code: 'can_manage_prices', labelUr: 'روزانہ کے ریٹ تبدیل کرنا', labelEn: 'Manage Daily Rates', category: 'pricing' },
  { code: 'can_issue_credit', labelUr: 'ادھار کھاتہ جاری کرنا', labelEn: 'Issue Credit (Udhaar)', category: 'credit' },
  { code: 'can_view_reports', labelUr: 'روزنامچہ و منافع رپورٹس دیکھنا', labelEn: 'View Financial Reports & Ledger', category: 'reports' },
  { code: 'can_void_bills', labelUr: 'بل منسوخ کرنا', labelEn: 'Void Completed Bills', category: 'admin' },
  { code: 'can_close_day', labelUr: 'دن کا اختتام اور اختتامی رپورٹ', labelEn: 'Daily Closing & Shift Reports', category: 'admin' },
  { code: 'can_manage_users', labelUr: 'سٹاف اور رولز مینیج کرنا', labelEn: 'Manage Staff & Role Permissions', category: 'admin' },
];

const INITIAL_ROLES: RoleItem[] = [
  {
    id: 'super-admin',
    name: 'SuperAdmin',
    description: 'تمام اختیارات اور مکمل کنٹرول',
    isSystem: true,
    userCount: 1,
    permissions: ALL_PERMISSIONS.map((p) => p.code),
  },
  {
    id: 'biller',
    name: 'Biller',
    description: 'روزمرہ بلنگ اور پسائی ٹوکن بنانے کے اختیارات',
    isSystem: true,
    userCount: 1,
    permissions: ['can_bill', 'can_pisai'],
  },
  {
    id: 'shift-supervisor',
    name: 'ShiftSupervisor',
    description: 'بلنگ، ڈسکاؤنٹ اور روزنامچہ دیکھنے کے اختیارات',
    isSystem: false,
    userCount: 0,
    permissions: ['can_bill', 'can_pisai', 'can_discount', 'can_view_reports'],
  },
];

const INITIAL_STAFF: StaffUser[] = [
  { id: '1', username: 'hanzala', fullName: 'Hanzala Mushtaq', roleName: 'SuperAdmin' },
  { id: '2', username: 'asif', fullName: 'محمد عاصف', roleName: 'Biller' },
];

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRolesUpdated?: (roles: RoleItem[]) => void;
  initialTab?: 'roles' | 'staff' | 'create' | 'add_user';
}

export const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  onRolesUpdated,
  initialTab = 'roles',
}) => {
  const { isUrdu, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'roles' | 'staff' | 'create' | 'add_user'>(initialTab);
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

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Biller');
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Key Reset Modal State
  const [keyResetTarget, setKeyResetTarget] = useState<StaffUser | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isSubmittingResetKey, setIsSubmittingResetKey] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Fetch roles & staff from backend with auth token
  const refreshRolesFromBackend = async () => {
    const token = getToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/roles`, { headers });
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
      const staffRes = await fetch(`${getApiBaseUrl()}/api/roles/staff`, { headers });
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
      const res = await fetch(`${getApiBaseUrl()}/api/roles`, {
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
      await fetch(`${getApiBaseUrl()}/api/roles/${editingRole.id}`, {
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
      await fetch(`${getApiBaseUrl()}/api/roles/${role.id}`, {
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
      await fetch(`${getApiBaseUrl()}/api/roles/staff/${userId}`, {
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

  // 5. CREATE NEW STAFF USER (ADMIN)
  const handleCreateStaffUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUname = newUsername.trim().toLowerCase();
    const cleanFull = newFullName.trim();
    const cleanPass = newPassword.trim();
    const cleanPin = newPin.trim();

    if (!cleanUname || !cleanFull || !cleanPass) {
      showNotice('برائے مہربانی یوزر آئی ڈی، مکمل نام اور پاس ورڈ لازمی درج کریں۔', 'error');
      return;
    }

    if (cleanPin && cleanPin.length !== 4) {
      showNotice('سکیورٹی پن لازمی 4 ہندسوں پر مشتمل ہونا چاہیے۔', 'error');
      return;
    }

    setIsSubmittingUser(true);
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/roles/staff`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username: cleanUname,
          fullName: cleanFull,
          roleName: newUserRole,
          password: cleanPass,
          pin: cleanPin || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showNotice(
          isUrdu
            ? `نیا صارف "${json.data.fullName}" (@${json.data.username}) کامیابی سے شامل ہو گیا اور لاگ ان کی تفویض ہو گئی!`
            : `User "${json.data.fullName}" created with login key successfully!`,
          'success'
        );
        setNewUsername('');
        setNewFullName('');
        setNewPassword('');
        setNewPin('');
        await refreshRolesFromBackend();
        setActiveTab('staff');
      } else {
        showNotice(json.error?.message || 'صارف بنانے میں ناکامی ہوئی۔', 'error');
      }
    } catch {
      showNotice('سرور سے رابطہ ممکن نہیں ہو سکا۔', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // 6. RESET STAFF LOGIN KEY / PIN (ADMIN)
  const handleResetStaffKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyResetTarget) return;

    if (!resetPassword.trim() && !resetPin.trim()) {
      showNotice('نیا پاس ورڈ یا پن درج کریں۔', 'error');
      return;
    }

    if (resetPin.trim() && resetPin.trim().length !== 4) {
      showNotice('پن لازمی 4 ہندسوں پر مشتمل ہونا چاہیے۔', 'error');
      return;
    }

    setIsSubmittingResetKey(true);
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/roles/staff/${keyResetTarget.id}/key`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          password: resetPassword.trim() || undefined,
          pin: resetPin.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showNotice(
          isUrdu
            ? `@${keyResetTarget.username} کی لاگ ان کی / پاس ورڈ کامیابی سے تبدیل ہو گئی۔`
            : `Login key for @${keyResetTarget.username} updated successfully!`,
          'success'
        );
        setKeyResetTarget(null);
        setResetPassword('');
        setResetPin('');
        await refreshRolesFromBackend();
      } else {
        showNotice(json.error?.message || 'کی تبدیل کرنے میں ناکامی ہوئی۔', 'error');
      }
    } catch {
      showNotice('سرور سے رابطہ ممکن نہیں ہو سکا۔', 'error');
    } finally {
      setIsSubmittingResetKey(false);
    }
  };

  // 7. DELETE / DEACTIVATE STAFF USER (ADMIN)
  const handleDeleteStaffUser = async (member: StaffUser) => {
    if (member.username.toLowerCase() === 'hanzala') {
      showNotice('مرکزی ایڈمن کو ڈیلیٹ نہیں کیا جا سکتا۔', 'error');
      return;
    }

    const confirmed = window.confirm(
      isUrdu
        ? `کیا آپ واقعی صارف "${member.fullName}" (@${member.username}) کو حذف یا غیر فعال کرنا چاہتے ہیں؟`
        : `Are you sure you want to remove user "${member.fullName}" (@${member.username})?`
    );
    if (!confirmed) return;

    const token = getToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/roles/staff/${member.id}`, {
        method: 'DELETE',
        headers,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showNotice(json.message || 'صارف کامیابی سے حذف کر دیا گیا', 'success');
        await refreshRolesFromBackend();
      } else {
        showNotice(json.error?.message || 'صارف حذف کرنے میں خرابی۔', 'error');
      }
    } catch {
      showNotice('سرور سے رابطہ ممکن نہیں ہو سکا۔', 'error');
    }
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
            padding: '14px 20px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1.5px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#fffbeb',
                border: '1.5px solid #fde68a',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} strokeWidth={2.4} color="#d97706" />
            </div>
            <div>
              <h2 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '22px' : '18px', fontWeight: 900, margin: 0, color: '#0F172A' }}>
                {t('اختیارات و رولز مینیجر', 'Roles & Permissions Manager')}
              </h2>
              <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '14px' : '12px', color: '#64748B', marginTop: '2px', fontWeight: 700 }}>
                {t(
                  'ہر رول کے اختیارات کو اپنی مرضی سے بنائیں، تبدیل کریں اور سٹاف کو لگائیں',
                  'Customize role permissions and assign them to staff members'
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1.5px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            padding: '0 20px',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('roles');
              setEditingRole(null);
            }}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'roles' ? '3px solid #2563EB' : '3px solid transparent',
              color: activeTab === 'roles' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'roles' ? 900 : 700,
              fontSize: isUrdu ? '17px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <KeyRound size={17} color={activeTab === 'roles' ? '#2563EB' : '#64748B'} />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {isUrdu ? `موجودہ رولز (${roles.length})` : `Existing Roles (${roles.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('staff');
              setEditingRole(null);
            }}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'staff' ? '3px solid #2563EB' : '3px solid transparent',
              color: activeTab === 'staff' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'staff' ? 900 : 700,
              fontSize: isUrdu ? '17px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Users size={17} color={activeTab === 'staff' ? '#2563EB' : '#64748B'} />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {isUrdu ? `سٹاف اکاؤنٹس (${staff.length})` : `Staff Accounts (${staff.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('add_user');
              setEditingRole(null);
            }}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'add_user' ? '3px solid #10B981' : '3px solid transparent',
              color: activeTab === 'add_user' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'add_user' ? 900 : 700,
              fontSize: isUrdu ? '17px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <UserPlus size={17} color={activeTab === 'add_user' ? '#10B981' : '#64748B'} />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {isUrdu ? '+ نیا صارف و لاگ ان کی' : '+ Add User & Key'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setEditingRole(null);
            }}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'create' ? '3px solid #2563EB' : '3px solid transparent',
              color: activeTab === 'create' ? '#0F172A' : '#64748B',
              fontWeight: activeTab === 'create' ? 900 : 700,
              fontSize: isUrdu ? '17px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={17} color={activeTab === 'create' ? '#2563EB' : '#64748B'} />
            <span className={isUrdu ? 'font-nastaleeq' : ''}>
              {t('+ نیا رول بنائیں', '+ Create Role')}
            </span>
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
            }}
          >
            {noticeMessage.type === 'success' ? '✓ ' : '⚠ '}
            {noticeMessage.text}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
          {/* INLINE EDIT ROLE PERMISSIONS VIEW */}
          {editingRole ? (
            <div style={{ backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '14px', border: '1.5px solid #CBD5E1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '20px' : '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    {t('رول کے اختیارات:', 'Edit Role Permissions:')} {editingRole.name}
                  </h3>
                  <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '14px' : '12px', color: '#64748B', marginTop: '3px', fontWeight: 700 }}>
                    {t('اختیارات کو منتخب یا غیر منتخب کریں اور محفوظ کریں', 'Check or uncheck permissions and save')}
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
                  {t('منسوخ کریں', 'Cancel')}
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
                        <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 800, color: isChecked ? '#92400E' : '#334155' }}>
                          {isUrdu ? perm.labelUr : perm.labelEn}
                        </div>
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
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('اختیارات محفوظ کریں', 'Save Permissions')}</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'roles' ? (
            /* TAB 1: ROLES OVERVIEW WITH EDIT & DELETE BUTTONS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roles.map((r) => {
                const isSuperAdmin = r.name.toLowerCase().includes('admin');
                const isBiller = r.name.toLowerCase().includes('biller');
                const cardBg = isSuperAdmin ? '#fffbeb' : isBiller ? '#f0f9ff' : '#f8fafc';
                const cardBorder = isSuperAdmin ? '#fde68a' : isBiller ? '#bae6fd' : '#e2e8f0';

                return (
                  <div
                    key={r.id}
                    style={{
                      backgroundColor: cardBg,
                      border: `1.5px solid ${cardBorder}`,
                      borderRadius: '10px',
                      padding: '14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-nastaleeq" style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A' }}>
                          {r.name}
                        </span>
                        {r.isSystem && (
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#ffffff',
                              color: isSuperAdmin ? '#92400e' : '#0369a1',
                              border: `1px solid ${cardBorder}`,
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
                          height: '32px',
                          padding: '0 12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Edit2 size={12} />
                        <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('اختیارات تبدیل کریں', 'Edit Permissions')}</span>
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
                          <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('ڈیلیٹ', 'Delete')}</span>
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
                          <span className={isUrdu ? 'font-nastaleeq' : ''}>{def ? (isUrdu ? def.labelUr : def.labelEn) : permCode}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            </div>
          ) : activeTab === 'staff' ? (
            /* TAB 2: STAFF LIST & USER MANAGEMENT */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: isUrdu ? '17px' : '14px', fontWeight: 900, color: '#0F172A' }}>
                    {t(`سٹاف اور لاگ ان اکاؤنٹس (${staff.length})`, `Staff & Login Accounts (${staff.length})`)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {t('سٹاف کے لیے رول منتخب کریں یا لاگ ان کی / پاس ورڈ تبدیل کریں', 'Assign roles, change login keys or manage staff members')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('add_user')}
                  className="touch-active"
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <UserPlus size={16} />
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('+ نیا صارف شامل کریں', '+ Add Staff User')}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {staff.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: member.roleName === 'SuperAdmin' ? '#FFFBEB' : '#F0FDF4',
                          border: member.roleName === 'SuperAdmin' ? '1px solid #FDE68A' : '1px solid #BBF7D0',
                          color: member.roleName === 'SuperAdmin' ? '#D97706' : '#16A34A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                        }}
                      >
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                            {member.fullName}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              color: '#0369A1',
                              backgroundColor: '#E0F2FE',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                          >
                            @{member.username}
                          </span>
                          {member.hasPin && (
                            <span
                              style={{
                                fontSize: '10.5px',
                                color: '#16A34A',
                                backgroundColor: '#DCFCE7',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 700,
                              }}
                            >
                              PIN ✓
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          {member.isActive !== false ? 'فعال صارف (Active)' : 'غیر فعال (Inactive)'}
                        </div>
                      </div>
                    </div>

                    {/* Actions on Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Role Selector Dropdown */}
                      <select
                        value={member.roleName}
                        onChange={(e) => handleAssignRole(member.id, e.target.value)}
                        style={{
                          height: '34px',
                          padding: '0 10px',
                          borderRadius: '6px',
                          border: '1.5px solid #CBD5E1',
                          backgroundColor: '#F8FAFC',
                          fontSize: '12px',
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

                      {/* Reset Password / Key Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setKeyResetTarget(member);
                          setResetPassword('');
                          setResetPin('');
                        }}
                        className="touch-active"
                        title={t('کی / پاس ورڈ تبدیل کریں', 'Change Login Key')}
                        style={{
                          height: '34px',
                          padding: '0 10px',
                          borderRadius: '6px',
                          border: '1.5px solid #FDE68A',
                          backgroundColor: '#FFFBEB',
                          color: '#B45309',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Key size={14} color="#D97706" />
                        <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('کی تبدیل کریں', 'Reset Key')}</span>
                      </button>

                      {/* Delete / Deactivate Button (Hidden for primary SuperAdmin) */}
                      {member.username.toLowerCase() !== 'hanzala' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteStaffUser(member)}
                          className="touch-active"
                          title={t('صارف حذف کریں', 'Delete Staff')}
                          style={{
                            height: '34px',
                            width: '34px',
                            borderRadius: '6px',
                            border: '1.5px solid #FECACA',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'add_user' ? (
            /* TAB 3: CREATE NEW USER & ASSIGN KEY */
            <form onSubmit={handleCreateStaffUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1.5px solid #BBF7D0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <UserPlus size={20} color="#16A34A" />
                <div>
                  <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '15px', fontWeight: 900, color: '#166534' }}>
                    {t('نیا سٹاف صارف اور لاگ ان کی تفویض', 'Add New Staff User & Assign Login Key')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803D' }}>
                    {t('ایڈمنسٹریٹر یہاں سے نیا آپریٹر شامل کر سکتا ہے اور اس کی لاگ ان آئی ڈی اور پاس ورڈ/پن سیٹ کر سکتا ہے۔', 'Admin can register a new operator with login ID and password/PIN key.')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* 1. Username / Login ID */}
                <div>
                  <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    {t('صارف آئی ڈی / لاگ ان نام (Login Username / ID):', 'Login Username / User ID:')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. khalid یا cashier1"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      required
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px 0 28px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        direction: 'ltr',
                      }}
                    />
                    <span style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8', fontWeight: 800 }}>@</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {t('لاگ ان سکرین پر یہ آئی ڈی درج کی جائے گی (صرف انگریزی حروف و اعداد)', 'Used on login screen (letters & numbers only)')}
                  </span>
                </div>

                {/* 2. Full Name */}
                <div>
                  <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    {t('مکمل نام (Staff Full Name):', 'Staff Full Name:')} *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. خالد محمود (سیلز کاؤنٹر)"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {t('بلز، رپورٹس اور ٹرمینل پر ظاہر ہونے والا نام', 'Display name on bills and receipts')}
                  </span>
                </div>

                {/* 3. Assign Role */}
                <div>
                  <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    {t('رول منتخب کریں (Assign Role):', 'Assign Role:')} *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.description || 'اختیارات'})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {t('اس صارف کے مجاز اختیارات (بلنگ، ڈسکاؤنٹ، رپورٹس وغیرہ)', 'Permission level for this operator')}
                  </span>
                </div>

                {/* 4. Login Password / Key */}
                <div>
                  <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    {t('لاگ ان کی / پاس ورڈ (Login Key / Password):', 'Login Key / Password:')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewUserPassword ? 'text' : 'password'}
                      placeholder="کم از کم 4 ہندسے یا حروف (e.g. khalid123)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 36px 0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13.5px',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        direction: 'ltr',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '10px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                      }}
                    >
                      {showNewUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {t('یہ کی صارف لاگ ان کے وقت پاس ورڈ کے خانے میں درج کرے گا', 'Key used by operator to log into terminal')}
                  </span>
                </div>

                {/* 5. Optional PIN */}
                <div>
                  <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13.5px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    {t('سکیورٹی پن (Optional 4-Digit Quick PIN):', 'Quick PIN (Optional 4-Digits):')}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="4 ہندسوں کا پن (e.g. 1234)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '14px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      direction: 'ltr',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {t('ٹرمینل کے ٹچ کی پیڈ پر فوری انٹری کے لیے (اختیاری)', 'For touch keypad quick enter (optional)')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="touch-active"
                  style={{
                    height: '42px',
                    padding: '0 24px',
                    borderRadius: '10px',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: isSubmittingUser ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    opacity: isSubmittingUser ? 0.7 : 1,
                  }}
                >
                  <UserPlus size={18} />
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>
                    {isSubmittingUser ? 'صارف بنایا جا رہا ہے...' : t('صارف بنائیں اور لاگ ان کی تفویض کریں', 'Create User & Assign Key')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('staff')}
                  style={{
                    height: '42px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t('منسوخ کریں', 'Cancel')}
                </button>
              </div>
            </form>
          ) : (
            /* TAB 4: CREATE NEW ROLE */
            <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  {t('رول کا نام:', 'Role Name:')}
                </label>
                <input
                  type="text"
                  placeholder={t('مثلاً: کیشیئر مینیجر', 'e.g. Cashier Manager')}
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
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  {t('تفصیل:', 'Description:')}
                </label>
                <input
                  type="text"
                  placeholder={t('اس رول کے بنیادی اختیارات کی وضاحت لکھیں...', 'Enter role description...')}
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
                <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13.5px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
                  {t('اس رول کے لیے اختیارات منتخب کریں:', 'Select permissions for this role:')}
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
                          <div className={isUrdu ? 'font-nastaleeq' : ''} style={{ fontSize: '13px', fontWeight: 800, color: isChecked ? '#92400E' : '#334155' }}>
                            {isUrdu ? perm.labelUr : perm.labelEn}
                          </div>
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
                  <span className={isUrdu ? 'font-nastaleeq' : ''}>{t('رول محفوظ کریں', 'Save Role')}</span>
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}>
            <Lock size={12} />
            <span>{t('تمام اختیارات سرور لیول پر محفوظ اور مانیٹر کیے جاتے ہیں۔', 'All permissions are securely verified and audited.')}</span>
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
            {t('بند کریں', 'Close')}
          </button>
        </div>
        {/* Key Reset Modal Dialog */}
        {keyResetTarget && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                width: '100%',
                maxWidth: '420px',
                padding: '22px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                border: '1.5px solid #CBD5E1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#D97706',
                    }}
                  >
                    <Key size={18} />
                  </div>
                  <div>
                    <h3 className={isUrdu ? 'font-nastaleeq' : ''} style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
                      {t('لاگ ان کی / پاس ورڈ تبدیل کریں', 'Change Login Key / Password')}
                    </h3>
                    <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                      @{keyResetTarget.username} ({keyResetTarget.fullName})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setKeyResetTarget(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleResetStaffKey} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    {t('نیا پاس ورڈ / لاگ ان کی:', 'New Password / Login Key:')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      placeholder="کم از کم 4 حروف یا ہندسے"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 34px 0 10px',
                        borderRadius: '6px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        direction: 'ltr',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '9px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                      }}
                    >
                      {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={isUrdu ? 'font-nastaleeq' : ''} style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    {t('نیا 4-ہندسوں کا پن (اختیاری):', 'New 4-Digit PIN (Optional):')}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="مثلاً: 1234"
                    value={resetPin}
                    onChange={(e) => setResetPin(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '14px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                      direction: 'ltr',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="submit"
                    disabled={isSubmittingResetKey}
                    className="touch-active"
                    style={{
                      flex: 1,
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: isSubmittingResetKey ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmittingResetKey ? 'محفوظ ہو رہا ہے...' : t('محفوظ کریں', 'Save Key')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyResetTarget(null)}
                    style={{
                      padding: '0 14px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {t('منسوخ', 'Cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
