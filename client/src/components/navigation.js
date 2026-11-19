export const NAV_LINKS = {
  STUDENT: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/pass', label: 'Digital pass' },
    { to: '/payments', label: 'Payments' },
    { to: '/maintenance', label: 'Maintenance' },
  ],
  WARDEN: [
    { to: '/warden/dashboard', label: 'Overview' },
    { to: '/warden/verify', label: 'Payments' },
    { to: '/warden/allocation', label: 'Allocation' },
    { to: '/warden/maintenance', label: 'Maintenance' },
  ],
  GATE_STAFF: [{ to: '/scanner', label: 'Scanner' }],
  ADMIN: [{ to: '/admin/staff', label: 'Admin center' }],
};
