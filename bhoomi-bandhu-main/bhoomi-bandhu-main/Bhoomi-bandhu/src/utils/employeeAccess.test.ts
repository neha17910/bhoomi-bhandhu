import test from "node:test";
import assert from "node:assert/strict";
import {
  buildNoReplyAccessEmail,
  generateOneTimePassword,
  isValidEmailFormat,
  validateEmployeeProvisionInput,
  validateFirstLoginPasswordChange,
} from "./employeeAccess";

test("generateOneTimePassword produces diverse random passwords meeting complexity", () => {
  const p1 = generateOneTimePassword(12);
  const p2 = generateOneTimePassword(12);
  assert.equal(p1.length, 12);
  assert.equal(p2.length, 12);
  assert.notEqual(p1, p2);
  assert.match(p1, /[A-Z]/);
  assert.match(p1, /[a-z]/);
  assert.match(p1, /[0-9]/);
});

test("validateEmployeeProvisionInput enforces valid name, email, and one-time password", () => {
  assert.equal(
    validateEmployeeProvisionInput({
      name: "Meera Nair",
      email: "meera.support@bhoomibandhu.in",
      tempPassword: "TempPass@91",
      department: "Farmer Help",
    }).valid,
    true
  );

  assert.equal(
    validateEmployeeProvisionInput({
      name: "M",
      email: "meera@bhoomibandhu.in",
      tempPassword: "TempPass@91",
    }).valid,
    false
  );

  assert.equal(isValidEmailFormat("invalid-email"), false);
  assert.equal(
    validateEmployeeProvisionInput({
      name: "Meera Nair",
      email: "bad",
      tempPassword: "TempPass@91",
    }).valid,
    false
  );
  assert.equal(
    validateEmployeeProvisionInput({
      name: "Meera Nair",
      email: "meera@bhoomibandhu.in",
      tempPassword: "123",
    }).valid,
    false
  );
});

test("validateFirstLoginPasswordChange rejects reusing temp password or mismatched confirm", () => {
  assert.equal(
    validateFirstLoginPasswordChange({
      currentTempPassword: "OneTime@99",
      newPassword: "OneTime@99",
      confirmPassword: "OneTime@99",
    }).valid,
    false
  );

  assert.equal(
    validateFirstLoginPasswordChange({
      currentTempPassword: "OneTime@99",
      newPassword: "MySecureNewPassword@1",
      confirmPassword: "DifferentPassword@1",
    }).valid,
    false
  );

  assert.equal(
    validateFirstLoginPasswordChange({
      currentTempPassword: "OneTime@99",
      newPassword: "MySecureNewPassword@1",
      confirmPassword: "MySecureNewPassword@1",
    }).valid,
    true
  );
});

test("buildNoReplyAccessEmail generates noreply mail containing email, temp password, and change notice", () => {
  const mail = buildNoReplyAccessEmail({
    employeeName: "Meera Nair",
    employeeEmail: "Meera.Support@bhoomibandhu.in",
    tempPassword: "Xy7@pQ92",
    department: "Kisan Helpline",
    portalUrl: "https://bhoomibandhu.in",
  });

  assert.match(mail.fromAddress, /noreply@bhoomibandhu\.in/);
  assert.equal(mail.replyTo, "noreply@bhoomibandhu.in");
  assert.equal(mail.toEmail, "meera.support@bhoomibandhu.in");
  assert.match(mail.subject, /Access Granted/);
  assert.match(mail.bodyText, /meera\.support@bhoomibandhu\.in/);
  assert.match(mail.bodyText, /Xy7@pQ92/);
  assert.match(mail.bodyText, /change this one-time password/i);
});
