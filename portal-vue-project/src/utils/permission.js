// src/utils/permission.js
export function hasPermission(permission) {
  const list = JSON.parse(
    localStorage.getItem('userPermissions') || '[]'
  );
  return list.includes(permission);
}
