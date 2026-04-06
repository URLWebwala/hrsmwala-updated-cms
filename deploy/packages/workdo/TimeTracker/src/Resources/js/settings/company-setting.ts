import { Monitor } from 'lucide-react';

export const trackerCompanySetting = (t: (key: string) => string) => [
  {
    order: 90,
    title: t('Tracker App'),
    href: '#tracker-app-settings',
    icon: Monitor,
    permission: 'manage-timetracker',
    component: 'tracker-app-settings'
  }
];
