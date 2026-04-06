import { Download } from 'lucide-react';

export const trackerSuperAdminMenu = (t: (key: string) => string) => [
    {
        title: t('Time Tracker'),
        icon: Download,
        permission: 'manage-timetracker',
        order: 500,
        name: 'timetracker',
        children: [
            {
                title: t('App Versions'),
                href: route('app-versions.index'),
                permission: 'manage-timetracker',
                order: 5,
            },
        ],
    },
];
