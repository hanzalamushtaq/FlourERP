import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { hashPassword, hashPin } from '../utils/auth.js';

export const roleRouter = Router();

const CreateRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission must be assigned'),
});

const UpdateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

// GET /api/roles - List all roles with permissions
roleRouter.get('/', requireAuth, async (_req: Request, res: Response) => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: { users: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const formattedRoles = roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    userCount: r._count.users,
    permissions: r.permissions.map((rp) => rp.permission.code),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  res.json({
    success: true,
    data: formattedRoles,
  });
});

// POST /api/roles - Create custom role (requires 'can_manage_users')
roleRouter.post('/', requireAuth, requirePermission('can_manage_users'), async (req: Request, res: Response) => {
  const result = CreateRoleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: result.error.errors[0].message,
      },
    });
  }

  const { name, description, permissions } = result.data;

  // Check if role name already exists
  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'ROLE_EXISTS',
        message: `A role with name '${name}' already exists.`,
      },
    });
  }

  // Validate permission codes
  const validPermissions = await prisma.permission.findMany({
    where: { code: { in: permissions } },
  });

  if (validPermissions.length !== permissions.length) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PERMISSIONS',
        message: 'One or more permission codes are invalid.',
      },
    });
  }

  const newRole = await prisma.$transaction(async (tx) => {
    const role = await tx.role.create({
      data: {
        name,
        description,
        isSystem: false,
      },
    });

    for (const perm of validPermissions) {
      await tx.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }

    return role;
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'ROLE_CREATED',
      entityType: 'ROLE',
      entityId: newRole.id,
      details: JSON.stringify({ name, permissions }),
      ipAddress: req.ip,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      id: newRole.id,
      name: newRole.name,
      description: newRole.description,
      isSystem: false,
      permissions,
    },
  });
});

// Staff Management Schemas
const CreateStaffUserSchema = z.object({
  username: z
    .string()
    .min(2, 'صارف کا نام کم از کم 2 حروف پر مشتمل ہونا چاہیے (Username must be at least 2 chars)')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'صارف نام صرف حروف، ہندسے اور ڈیش پر مشتمل ہو سکتا ہے (Username letters, numbers, _ - only)'),
  fullName: z
    .string()
    .min(2, 'مکمل نام کم از کم 2 حروف پر مشتمل ہونا چاہیے (Full name must be at least 2 chars)'),
  roleId: z.string().optional(),
  roleName: z.string().optional(),
  password: z
    .string()
    .min(4, 'لاگ ان پاس ورڈ / کی کم از کم 4 ہندسوں یا حروف پر مشتمل ہونی چاہیے (Key must be at least 4 chars)'),
  pin: z
    .string()
    .regex(/^\d{4}$/, 'سکیورٹی پن لازمی 4 ہندسوں پر مشتمل ہونا چاہیے (PIN must be 4 digits)')
    .optional()
    .or(z.literal('')),
});

const UpdateStaffKeySchema = z.object({
  password: z.string().min(4, 'پاس ورڈ کم از کم 4 حروف پر مشتمل ہونا چاہیے').optional().or(z.literal('')),
  pin: z.string().regex(/^\d{4}$/, 'پن 4 ہندسوں پر مشتمل ہونا چاہیے').optional().or(z.literal('')),
});

// GET /api/roles/staff - List all staff users with their roles
roleRouter.get('/staff', requireAuth, async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      fullName: true,
      isActive: true,
      pinHash: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const staff = users.map((u) => ({
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    isActive: u.isActive,
    hasPin: !!u.pinHash,
    roleId: u.role?.id,
    roleName: u.role?.name || 'Biller',
    createdAt: u.createdAt,
  }));

  res.json({
    success: true,
    data: staff,
  });
});

// POST /api/roles/staff - Create new staff user with ID & Login Key (Admin feature)
roleRouter.post('/staff', requireAuth, requirePermission('can_manage_users'), async (req: Request, res: Response) => {
  const result = CreateStaffUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: result.error.errors[0].message,
      },
    });
  }

  const { username, fullName, roleId, roleName, password, pin } = result.data;
  const cleanUsername = username.trim().toLowerCase();

  // Check unique username
  const existing = await prisma.user.findFirst({
    where: { username: { equals: cleanUsername, mode: 'insensitive' } },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'USER_EXISTS',
        message: `صارف آئی ڈی '${cleanUsername}' پہلے سے موجود ہے۔ مختلف آئی ڈی چنیں۔`,
      },
    });
  }

  // Determine target role
  let targetRole = null;
  if (roleId) {
    targetRole = await prisma.role.findUnique({ where: { id: roleId } });
  } else if (roleName) {
    targetRole = await prisma.role.findUnique({ where: { name: roleName } });
  }

  if (!targetRole) {
    targetRole = await prisma.role.findFirst({ where: { name: 'Biller' } });
  }

  if (!targetRole) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ROLE_NOT_FOUND',
        message: 'منتخب کردہ رول سسٹم میں دستیاب نہیں ہے۔',
      },
    });
  }

  // Hash password and optional PIN
  const passwordHash = await hashPassword(password.trim());
  const pinHash = pin && pin.trim().length === 4 ? await hashPin(pin.trim()) : null;

  const newUser = await prisma.user.create({
    data: {
      username: cleanUsername,
      fullName: fullName.trim(),
      passwordHash,
      pinHash,
      roleId: targetRole.id,
      isActive: true,
    },
    select: {
      id: true,
      username: true,
      fullName: true,
      isActive: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: newUser.id,
      details: JSON.stringify({ username: cleanUsername, role: targetRole.name }),
      ipAddress: req.ip,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      roleId: newUser.role.id,
      roleName: newUser.role.name,
      isActive: newUser.isActive,
      hasPin: !!pinHash,
      createdAt: newUser.createdAt,
    },
  });
});

// PUT /api/roles/staff/:userId/key - Reset or update user password / PIN key
roleRouter.put('/staff/:userId/key', requireAuth, requirePermission('can_manage_users'), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = UpdateStaffKeySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: result.error.errors[0].message,
      },
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'صارف موجود نہیں ہے۔',
      },
    });
  }

  const { password, pin } = result.data;
  const updateData: any = {};

  if (password && password.trim()) {
    updateData.passwordHash = await hashPassword(password.trim());
  }

  if (pin !== undefined) {
    if (pin && pin.trim().length === 4) {
      updateData.pinHash = await hashPin(pin.trim());
    } else if (pin === '') {
      updateData.pinHash = null;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_UPDATES',
        message: 'نیا پاس ورڈ یا پن درج کریں۔',
      },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'USER_PASSWORD_RESET',
      entityType: 'USER',
      entityId: userId,
      details: JSON.stringify({ targetUser: user.username }),
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    data: {
      userId,
      message: 'پاس ورڈ / کی کامیابی سے اپ ڈیٹ ہو گئی۔',
    },
  });
});

// PUT /api/roles/staff/:userId - Assign a role to a staff member
roleRouter.put('/staff/:userId', requireAuth, requirePermission('can_manage_users'), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { roleId, roleName, fullName, isActive } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Staff user not found.',
      },
    });
  }

  const updateData: any = {};

  if (roleId) {
    const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!targetRole) {
      return res.status(404).json({
        success: false,
        error: { code: 'ROLE_NOT_FOUND', message: 'Specified role not found.' },
      });
    }
    updateData.roleId = targetRole.id;
  } else if (roleName) {
    const targetRole = await prisma.role.findUnique({ where: { name: roleName } });
    if (!targetRole) {
      return res.status(404).json({
        success: false,
        error: { code: 'ROLE_NOT_FOUND', message: 'Specified role not found.' },
      });
    }
    updateData.roleId = targetRole.id;
  }

  if (fullName && typeof fullName === 'string') {
    updateData.fullName = fullName.trim();
  }

  if (typeof isActive === 'boolean') {
    // Prevent deactivating own account or hanzala
    if (user.username === 'hanzala' && !isActive) {
      return res.status(400).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Cannot deactivate primary SuperAdmin.' },
      });
    }
    updateData.isActive = isActive;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { role: true },
  });

  res.json({
    success: true,
    data: {
      userId: updated.id,
      roleId: updated.role.id,
      roleName: updated.role.name,
      fullName: updated.fullName,
      isActive: updated.isActive,
      message: `Staff member updated successfully.`,
    },
  });
});

// DELETE /api/roles/staff/:userId - Delete or deactivate staff member
roleRouter.delete('/staff/:userId', requireAuth, requirePermission('can_manage_users'), async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          bills: true,
          dailyClosings: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'صارف موجود نہیں ہے۔' },
    });
  }

  if (user.username.toLowerCase() === 'hanzala' || req.user?.id === userId) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'مرکزی ایڈمنسٹریٹر کو حذف نہیں کیا جا سکتا۔' },
    });
  }

  // If user has bills or closing history, deactivate instead of hard delete to preserve financial ledger
  if (user._count.bills > 0 || user._count.dailyClosings > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    return res.json({
      success: true,
      message: 'صارف کے بلنگ ریکارڈ موجود ہیں، اس لیے صارف کو غیر فعال (Deactivate) کر دیا گیا ہے۔',
    });
  }

  await prisma.user.delete({ where: { id: userId } });
  res.json({
    success: true,
    message: 'صارف کامیابی سے حذف کر دیا گیا۔',
  });
});

// PUT /api/roles/:id - Update role (requires 'can_manage_users')
roleRouter.put('/:id', requireAuth, requirePermission('can_manage_users'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = UpdateRoleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: result.error.errors[0].message,
      },
    });
  }

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ROLE_NOT_FOUND',
        message: 'Role not found.',
      },
    });
  }

  const { name, description, permissions } = result.data;

  await prisma.$transaction(async (tx) => {
    if (name || description !== undefined) {
      await tx.role.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
      });
    }

    if (permissions) {
      // Replace role permissions
      const validPermissions = await tx.permission.findMany({
        where: { code: { in: permissions } },
      });

      await tx.rolePermission.deleteMany({ where: { roleId: id } });

      for (const perm of validPermissions) {
        await tx.rolePermission.create({
          data: {
            roleId: id,
            permissionId: perm.id,
          },
        });
      }
    }
  });

  res.json({
    success: true,
    data: {
      id,
      message: 'Role updated successfully.',
    },
  });
});

// DELETE /api/roles/:id - Delete custom role (cannot delete system roles)
roleRouter.delete('/:id', requireAuth, requirePermission('can_manage_users'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });

  if (!role) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ROLE_NOT_FOUND',
        message: 'Role not found.',
      },
    });
  }

  if (role.isSystem) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'CANNOT_DELETE_SYSTEM_ROLE',
        message: 'System roles (SuperAdmin, Biller) cannot be deleted.',
      },
    });
  }

  if (role._count.users > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ROLE_IN_USE',
        message: `Cannot delete role with ${role._count.users} active user(s) assigned. Reassign users first.`,
      },
    });
  }

  await prisma.role.delete({ where: { id } });

  res.json({
    success: true,
    data: {
      message: `Role '${role.name}' deleted successfully.`,
    },
  });
});
