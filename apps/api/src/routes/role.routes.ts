import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

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

// GET /api/roles/staff - List all staff users with their roles
roleRouter.get('/staff', requireAuth, async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      fullName: true,
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
    roleId: u.role.id,
    roleName: u.role.name,
  }));

  res.json({
    success: true,
    data: staff,
  });
});

// PUT /api/roles/staff/:userId - Assign a role to a staff member
roleRouter.put('/staff/:userId', requireAuth, requirePermission('can_manage_users'), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { roleId, roleName } = req.body;

  let targetRole = null;
  if (roleId) {
    targetRole = await prisma.role.findUnique({ where: { id: roleId } });
  } else if (roleName) {
    targetRole = await prisma.role.findUnique({ where: { name: roleName } });
  }

  if (!targetRole) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ROLE_NOT_FOUND',
        message: 'Specified role not found.',
      },
    });
  }

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

  await prisma.user.update({
    where: { id: userId },
    data: { roleId: targetRole.id },
  });

  res.json({
    success: true,
    data: {
      userId,
      roleId: targetRole.id,
      roleName: targetRole.name,
      message: `Role assigned successfully.`,
    },
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
