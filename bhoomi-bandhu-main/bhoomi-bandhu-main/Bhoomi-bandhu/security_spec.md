# BhoomiBandhu Firestore Security Specification

## 1. Data Invariants
- **PII Isolation**: User profile documents (`/users/{userId}`) contain email, phone, and location and are readable and writable ONLY by the authenticated owner (`request.auth.uid == userId`) or verified admin.
- **Role Escalation Prevention**: Users may only register with `role` in `['farmer', 'warehouse_owner', 'psychiatrist', 'support_staff']` and cannot self-assign `'admin'` on `/users/{userId}` or modify their `role` after creation (only verified admins can alter roles). Admin status is verified solely via `/admins/{uid}` or verified admin email (`pranav25dhiman1107@gmail.com` with `email_verified == true`).
- **Admin-Only Partner Catalog Writes**: `/partner_companies/{companyId}` (loan and crop insurance companies) can only be created, updated, or deleted by verified admins.
- **Consultation Privacy**: `/psychiatrist_consultations/{consultationId}` is readable/writable strictly by the requesting farmer (`farmerId`), assigned psychiatrist (`psychiatristId`), or verified admin.
- **Support Desk Scoped Access**: `/support_tickets/{ticketId}` is accessible to the ticket creator (`userId`), verified admins, and users whose `/users/{uid}.role == 'support_staff'` (who may only transition `status` / reply / claim assignment, never alter `userId` or `message`).
- **Terminal State Locking**: Bookings in `'rejected'` or `'cancelled'` state, consultations in `'completed'` or `'cancelled'` state, and support tickets in `'resolved'` state cannot transition further by non-admins.
- **Temporal Integrity**: `createdAt` and `updatedAt` must match `request.time` on creation/update, and `createdAt` + owner UID fields are immutable after creation.
- **Admin-Only Support Employee Provisioning**: Only verified admins may create `/users/{uid}` with `role == 'support_staff'`, create/list/delete `/support_employees/{employeeId}`, or read/write `/mail_outbox/{mailId}`. Newly provisioned employees may only clear `mustChangePassword` to `false` (and transition their own `/support_employees/{uid}` from `pending_first_login` to `active`) upon completing their mandatory first-login password update.

## 2. Dirty Dozen Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated read of `/users/u1`**: No `request.auth` -> denied.
2. **Cross-user read of `/users/u2` by `u1`**: `u1 != u2` -> denied.
3. **Self-assigned admin or support_staff role on `/users/u1`**: `{ role: 'admin' | 'support_staff', ... }` -> denied by non-admin create rule.
4. **User escalating own role to `support_staff` via update**: `role` omitted from user update `affectedKeys().hasOnly(...)` -> denied.
5. **Non-admin adding a partner loan/insurance company in `/partner_companies`**: Denied (`isAdmin()` required).
6. **Non-admin creating/listing `/support_employees` or reading `/mail_outbox`**: Denied (`isAdmin()` required).
7. **Farmer reading another farmer's `/psychiatrist_consultations/c2`**: Denied (`farmerId != uid && psychiatristId != uid && !isAdmin()`).
8. **Farmer marking own consultation `completed`**: Only assigned psychiatrist or admin can set `'completed'` -> denied.
9. **Shadow field injection on `/support_tickets/t1`**: `{ ..., approvedBypass: true }` -> denied by `keys().hasOnly(...)`.
10. **Support staff altering ticket owner `userId` or `message`**: Restricted to `['status', 'assignedEmployeeId', 'assignedEmployeeName', 'employeeReply', 'priority', 'updatedAt']` -> denied.
11. **Oversized document ID poisoning**: Path ID > 128 chars or containing invalid symbols -> denied by `isValidId()`.
12. **Forged `createdAt` timestamp / Unverified email spoofing admin access**: Denied by `request.time` and `email_verified == true`.
