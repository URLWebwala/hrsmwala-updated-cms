import { Download } from 'lucide-react';

export const trackerSuperAdminSetting = (t: (key: string) => string) => [
  {
    order: 90,
    title: t('Tracker App'),
    href: '#tracker-app-settings',
    icon: Download,
    permission: 'manage-system-settings',
    component: 'tracker-app-settings'
  }
];
