import { z } from 'zod';
import { insertUserSchema, insertAttendanceSchema, insertLeaveSchema, insertPayrollSchema, users, attendance, leaves, payroll } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      },
    },
    signup: {
      method: 'POST' as const,
      path: '/api/auth/signup',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/employees/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/employees',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/employees/:id',
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  attendance: {
    list: {
      method: 'GET' as const,
      path: '/api/attendance',
      input: z.object({ employeeId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof attendance.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/attendance',
      input: insertAttendanceSchema,
      responses: {
        201: z.custom<typeof attendance.$inferSelect>(),
      },
    },
  },
  leaves: {
    list: {
      method: 'GET' as const,
      path: '/api/leaves',
      input: z.object({ employeeId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof leaves.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leaves',
      input: insertLeaveSchema,
      responses: {
        201: z.custom<typeof leaves.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/leaves/:id',
      input: insertLeaveSchema.partial(),
      responses: {
        200: z.custom<typeof leaves.$inferSelect>(),
      },
    },
  },
  payroll: {
    list: {
      method: 'GET' as const,
      path: '/api/payroll',
      input: z.object({ employeeId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof payroll.$inferSelect>()),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
