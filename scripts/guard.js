import { isAuthenticated } from './api/auth.js';

if (!isAuthenticated()) {
  const inAdminFolder = location.pathname.includes('/admin/');
  const P = inAdminFolder ? '..' : '.';
  window.location.href = `${P}/login.html`;
}
