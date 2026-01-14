import z from 'zod';
import { normalizeAllNames } from './schemaPreprocessor';
//==========================================================================================================================================
//
//                                                USER SCHEMAS
//
//==========================================================================================================================================
export const UserRoleSchema = z.enum(['Admin', 'User', 'Guest']);
//==========================================================================================================================================
export const IdSchema = z.object({
    id: z.coerce.number('Id has to be a number').int('Id cannot contain a decimal point/s').min(1, 'Id cannot be 0').nonnegative('Id cannot be negative').nonoptional('Id is required')
});
//==========================================================================================================================================
export const PaymentSchemaBody = z.preprocess((data) => normalizeAllNames(data, { amount: ['amount'] }), z.object({
    amount: z.coerce.number('Amount has to be a number').int('Amount cannot contain decimal point/s').positive('Amount must be greater than 0').nonoptional('Amount is required')
}));
//==========================================================================================================================================
export const CreateUserSchema = z.preprocess((data) => normalizeAllNames(data, {
    user_name: ['name', 'user'],
    password_hash: ['pw', 'password']
}), z.object({
    user_name: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long'),
    email: z.email('Invalid email address').toLowerCase(),
    password_hash: z.string().min(8, 'Password must be at least 8 characters'),
    userRole: UserRoleSchema.default('User'),
    wallet: z.int('Wallet has to be a number').min(0, 'Wallet cannot be set to 0').positive('Wallet cannot be negative').optional().default(10000)
}));
//==========================================================================================================================================
export const DeleteUserSchemaBody = z.preprocess((data) => normalizeAllNames(data, { password_hash: ['pw', 'password'] }), z.object({
    email: z.email('Invalid email'),
    password_hash: z.string().min(1, 'Password is required for deletion'),
}));
//==========================================================================================================================================
export const LoginSchema = z.preprocess((data) => normalizeAllNames(data, { password_hash: ['pw', 'password'] }), z.object({
    email: z.email('Invalid email').nonoptional('Email required'),
    password_hash: z.string('Password has to be a string').min(8, 'Password must be at least 8 characters').nonoptional('Password required'),
}));
//==========================================================================================================================================
export const editUserSchema = z.preprocess((data) => normalizeAllNames(data, {
    user_name: ['name', 'user'],
    password_hash: ['pw', 'password']
}), z.object({
    user_name: z.string().max(30, 'Username too long').min(3, 'Username must be atleast 3 characters').optional(),
    email: z.email('Invalid email address').toLowerCase().optional(),
    password_hash: z.string().min(8, 'Passsword must be atelast 8 characters').optional()
}));
//==========================================================================================================================================
//
//                                                BOOKING SCHEMAS
//
//==========================================================================================================================================
export const CreateBookingSchemaQuery = z.preprocess((data) => normalizeAllNames(data, {
    user_id: ['userId', 'user_id'],
    event_id: ['eventId', 'event_id'],
    quantity: ['quantity']
}), z.object({
    user_id: z.coerce.number('User Id has to be a number').nonnegative('User Id cannot be negative').nonoptional('User Id is required'),
    event_id: z.coerce.number('Event Id has to be a number').nonnegative('Event Id cannot be negative').nonoptional('Event Id is required'),
    quantity: z.coerce.number('Quantity has to be a number').optional().default(1)
}));
//==========================================================================================================================================
export const CancelBookingSchema = z.preprocess((data) => normalizeAllNames(data, {
    user_id: ['userId', 'user_id'],
    booking_id: ['bookingId', 'booking_id']
}), z.object({
    user_id: z.coerce.number('User Id has to be a number').nonnegative('User Id cannot be negative').nonoptional('User Id is required'),
    booking_id: z.coerce.number('Booking Id has to be a number').int('Booking id cannot contain decimals').nonnegative('Booking Id cannot be negative').nonoptional('Booking Id is required'),
}));
//==========================================================================================================================================
//
//                                                EVENT SCHEMAS
//
//==========================================================================================================================================
export const eventFiltersSchema = z.object({
    category: z.coerce.number('category must be an number').positive('category must be a positive number').optional(),
    dateFrom: z.union([z.date(), z.string().pipe(z.coerce.date())]).optional().refine((val) => !val || (val instanceof Date && !isNaN(val.getTime())), 'dateFrom must be a valid date'),
    dateTo: z.union([z.date(), z.string().pipe(z.coerce.date())]).optional().refine((val) => !val || (val instanceof Date && !isNaN(val.getTime())), 'dateTo must be a valid date'),
    city: z.string().trim().optional(),
    venueId: z.coerce.number({ error: 'VenueId must be a number' }).int('VenueId cannot contain decimals').positive('VenueId cannot be a negitive number').optional(),
    sort: z.enum(['date', 'popularity', 'price'], 'sort must be one of: date, popularity, price').optional().default('date'),
    order: z.enum(['asc', 'desc'], 'order must be asc or desc').optional().default('asc'),
    limit: z.coerce.number('limit must be an number').positive('limit must be greater than 0').max(100, 'Limit max: 100').optional().default(50),
    page: z.coerce.number('page must be an number').positive('page must be 1 or greater than 0').max(100, 'Page max: 100').optional().default(1),
});
//==========================================================================================================================================
