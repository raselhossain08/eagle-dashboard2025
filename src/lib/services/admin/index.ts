// Admin Services Barrel Export
export { default as RoleService } from './role.service';
export { auditLogService as AuditLogService } from './auditLog.service';
export { default as UserService } from './user.service';
export { systemSettingsService as SystemSettingsService } from './systemSettings.service';
export { invoiceService as InvoiceService } from './invoice.service';
export { subscriberProfileService as SubscriberProfileService } from './subscriberProfile.service';
export * from './role.service';
export * from './auditLog.service';
export * from './user.service';
export * from './systemSettings.service';
export * from './invoice.service';
export * from './subscriberProfile.service';

// Re-export the default service (using RoleService as primary)
import RoleServiceDefault from './role.service';
export default RoleServiceDefault;