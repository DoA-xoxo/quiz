export function isAdminRequest(request) {
  const expected = process.env.ADMIN_PASSWORD;
  const supplied = request.headers.get("x-admin-password");
  return Boolean(expected && supplied && supplied === expected);
}
