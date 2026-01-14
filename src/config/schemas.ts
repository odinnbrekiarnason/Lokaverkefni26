import z from 'zod'
//==========================================================================================================================================
//
//                                                USER SCHEMAS
//
//==========================================================================================================================================
export const UserRoleSchema = z.enum(['Admin', 'User', 'Guest']); 
export type user_role = z.infer<typeof UserRoleSchema>;
//==========================================================================================================================================
export const IdSchema = z.object({
  id: z.coerce.number('Id has to be a number').int('Id cannot contain a decimal point/s').min(1, 'Id cannot be 0').nonnegative('Id cannot be negative').nonoptional('Id is required')
});
export type IdParam = z.infer<typeof IdSchema>;
//==========================================================================================================================================
export const PaymentSchemaBody = z.object({
  amount: z.coerce.number('Amount has to be a number').int('Amount cannot contain decimal point/s').positive('Amount must be greater than 0').nonoptional('Amount is required')
});

export type paymentTypeBody = z.infer<typeof PaymentSchemaBody>;
//==========================================================================================================================================
export const CreateUserSchema = z.preprocess(
  (input: any) => {
    if (typeof input !== 'object' || input === null) return input;
    return {
      user_name: input.user_name ?? input.user ?? input.name,
      email: input.email,
      password_hash: input.password_hash ?? input.password ?? input.pw,
      userRole: input.userRole,
      wallet: input.wallet
    };
  },
  z.object({
    user_name: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long'),
    email: z.email('Invalid email address').toLowerCase(),
    password_hash: z.string().min(8, 'Password must be at least 8 characters'),
    userRole: UserRoleSchema.default('User'),
    wallet: z.int('Wallet has to be a number').min(0, 'Wallet cannot be set to 0').positive('Wallet cannot be negative').optional().default(10000)
  })
);

export type CreateUserType = z.infer<typeof CreateUserSchema>;
//==========================================================================================================================================
export const DeleteUserSchemaBody = z.preprocess(
  (input: any) => {
    if (typeof input !== 'object' || input === null) return input;
    return {
      email: input.email,
      password_hash: input.password_hash ?? input.password ?? input.pw
    };
  },
  z.object({
    email: z.email('Invalid email'),
    password_hash: z.string().min(1, 'Password is required for deletion'),
  })
);

export type deleteUserTypeBody = z.infer<typeof DeleteUserSchemaBody>;
//==========================================================================================================================================
export const LoginSchema = z.preprocess(
  (input: any) => {
    if (typeof input !== 'object' || input === null) return input;
    return {
      email: input.email,
      password_hash: input.password_hash ?? input.password ?? input.pw
    };
  },
  z.object({
    email: z.email('Invalid email').nonoptional('Email required'),
    password_hash: z.string('Password has to be a string').min(8, 'Password must be at least 8 characters').nonoptional('Password required'),
  })
);

export type LoginType = z.infer<typeof LoginSchema>;
//==========================================================================================================================================
export const editUserSchema = z.preprocess(
  (input: any) => {
    if (typeof input !== 'object' || input === null) return input;
    const result: any = {};
    const userName = input.user_name ?? input.user ?? input.name;
    if (userName !== undefined) result.user_name = userName;
    if (input.email !== undefined) result.email = input.email;
    const passwordHash = input.password_hash ?? input.password ?? input.pw;
    if (passwordHash !== undefined) result.password_hash = passwordHash;
    return result;
  },
  z.object({
    user_name: z.string().max(30, 'Username too long').min(3, 'Username must be atleast 3 characters').optional(),
    email: z.email('Invalid email address').toLowerCase().optional(),
    password_hash: z.string().min(8, 'Passsword must be atelast 8 characters').optional()
  })
);

export type EditUserType = z.infer<typeof editUserSchema>;
//==========================================================================================================================================
//
//                                                BOOKING SCHEMAS
//
//==========================================================================================================================================
export const CreateBookingSchema = z.object({
  event_id: z.coerce.number('Event Id has to be a number').int().nonnegative('Event Id cannot be negative'),
  quantity: z.coerce.number('Quantity has to be a number').int().optional().default(1)
});
export type CreateBookingType = z.infer<typeof CreateBookingSchema>
//==========================================================================================================================================
export const CancelBookingSchema = z.object({
  user_id: z.coerce.number('User Id has to be a number').int().nonnegative('User Id cannot be negative').nonoptional('User Id is required'),
  booking_id: z.coerce.number('Booking Id has to be a number').int('Booking id cannot contain decimals').nonnegative('Booking Id cannot be negative').nonoptional('Booking Id is required'),
});
export type DeleteBookingType = z.infer<typeof CancelBookingSchema>
//==========================================================================================================================================
//
//                                                EVENT SCHEMAS
//
//==========================================================================================================================================
export const eventFiltersSchema = z.object({
  category: z.coerce.number( 'category must be an number' ).positive( 'category must be a positive number' ).optional(),
  dateFrom: z.union([z.date(), z.string().pipe(z.coerce.date())]).optional().refine((val) => !val || (val instanceof Date && !isNaN(val.getTime())),  'dateFrom must be a valid date' ),
  dateTo: z.union([z.date(), z.string().pipe(z.coerce.date())]).optional().refine((val) => !val || (val instanceof Date && !isNaN(val.getTime())),  'dateTo must be a valid date' ),
  city: z.string().trim().optional(),
  venueId: z.coerce.number({error: 'VenueId must be a number'}).int('VenueId cannot contain decimals').positive('VenueId cannot be a negitive number').optional(),
  sort: z.enum(['date', 'popularity', 'price'],  'sort must be one of: date, popularity, price' ).optional().default('date'),
  order: z.enum(['asc', 'desc'],  'order must be asc or desc' ).optional().default('asc'),
  limit: z.coerce.number( 'limit must be an number' ).positive( 'limit must be greater than 0' ).max(100,  'Limit max: 100' ).optional().default(50),
  page: z.coerce.number( 'page must be an number' ).positive( 'page must be 1 or greater than 0' ).max(100,  'Page max: 100' ).optional().default(1),
});

export type EventFilters = z.infer<typeof eventFiltersSchema>;
//==========================================================================================================================================