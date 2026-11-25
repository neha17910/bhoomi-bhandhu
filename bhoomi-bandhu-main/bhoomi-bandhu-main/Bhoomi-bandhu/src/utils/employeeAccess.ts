export interface EmployeeProvisionInput {
  name: string;
  email: string;
  tempPassword: string;
  department?: string;
}

export interface PasswordChangeInput {
  currentTempPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AutomatedNoReplyEmailPayload {
  fromAddress: string;
  replyTo: string;
  toEmail: string;
  employeeName: string;
  subject: string;
  bodyText: string;
}

export function generateOneTimePassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "@#$%&*";
  const all = `${upper}${lower}${digits}${symbols}`;

  const safeLen = Math.max(8, Math.min(24, length));
  const randomBytes = new Uint32Array(safeLen);
  globalThis.crypto.getRandomValues(randomBytes);

  const chars: string[] = [
    upper[randomBytes[0] % upper.length],
    lower[randomBytes[1] % lower.length],
    digits[randomBytes[2] % digits.length],
    symbols[randomBytes[3] % symbols.length],
  ];

  for (let i = 4; i < safeLen; i++) {
    chars.push(all[randomBytes[i] % all.length]);
  }

  // Deterministic Fisher-Yates shuffle using remaining crypto entropy
  const shuffleBytes = new Uint32Array(chars.length);
  globalThis.crypto.getRandomValues(shuffleBytes);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1);
    const tmp = chars[i];
    chars[i] = chars[j];
    chars[j] = tmp;
  }

  return chars.join("");
}

export function isValidEmailFormat(email: string): boolean {
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 160) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function validateEmployeeProvisionInput(
  input: EmployeeProvisionInput
): { valid: boolean; error?: string } {
  const cleanName = input.name.trim();
  const cleanEmail = input.email.trim();
  const tempPassword = input.tempPassword;

  if (cleanName.length < 2 || cleanName.length > 100) {
    return {
      valid: false,
      error: "Please enter the employee's full name (2 to 100 characters).",
    };
  }
  if (!isValidEmailFormat(cleanEmail)) {
    return {
      valid: false,
      error: "Please enter a valid company or work email address.",
    };
  }
  if (tempPassword.length < 6 || tempPassword.length > 64) {
    return {
      valid: false,
      error: "One-time password must be between 6 and 64 characters.",
    };
  }
  if (
    input.department !== undefined &&
    input.department.trim().length > 80
  ) {
    return {
      valid: false,
      error: "Department name must be 80 characters or fewer.",
    };
  }
  return { valid: true };
}

export function validateFirstLoginPasswordChange(
  input: PasswordChangeInput
): { valid: boolean; error?: string } {
  const { currentTempPassword, newPassword, confirmPassword } = input;
  if (newPassword.length < 6 || newPassword.length > 64) {
    return {
      valid: false,
      error: "Your new password must be at least 6 characters long.",
    };
  }
  if (currentTempPassword && newPassword === currentTempPassword) {
    return {
      valid: false,
      error:
        "Your new password must be different from your one-time temporary password.",
    };
  }
  if (newPassword !== confirmPassword) {
    return {
      valid: false,
      error: "New password and confirmation do not match.",
    };
  }
  return { valid: true };
}

export function buildNoReplyAccessEmail(params: {
  employeeName: string;
  employeeEmail: string;
  tempPassword: string;
  department?: string;
  portalUrl?: string;
}): AutomatedNoReplyEmailPayload {
  const cleanName = params.employeeName.trim();
  const cleanEmail = params.employeeEmail.trim().toLowerCase();
  const dept = (params.department || "Farmer Help & Operations Desk").trim();
  const url = (params.portalUrl || "https://bhoomibandhu.in").trim();

  const subject =
    "Access Granted — BhoomiBandhu Support Desk (One-Time Login)";

  const bodyText = [
    `Hello ${cleanName},`,
    "",
    `Your BhoomiBandhu Support Desk access has been granted by the Administrator for the ${dept} team.`,
    "",
    "One-Time Login Credentials:",
    `- Portal URL: ${url}`,
    `- Login Email: ${cleanEmail}`,
    `- One-Time Password: ${params.tempPassword}`,
    "",
    "IMPORTANT SECURITY REQUIREMENT:",
    "You must change this one-time password immediately after your first login before accessing support tickets.",
    "",
    "This is an automated no-reply message from BhoomiBandhu Support Administration. Please do not reply directly to this email.",
  ].join("\n");

  return {
    fromAddress: "BhoomiBandhu Support Access <noreply@bhoomibandhu.in>",
    replyTo: "noreply@bhoomibandhu.in",
    toEmail: cleanEmail,
    employeeName: cleanName,
    subject,
    bodyText,
  };
}
