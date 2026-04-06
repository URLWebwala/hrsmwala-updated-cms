import { Monitor } from 'lucide-react';

export const trackerCompanyMenu = (t: (key: string) => string) => [
    {
        title: t('Time Tracker'),
        icon: Monitor,
        permission: 'manage-timetracker',
        order: 500,
        name: 'timetracker',
        children: [
            {
                title: t('Tracking Summary'),
                href: route('timetracker.admin.summary'),
                permission: 'manage-timetracker',
                order: 5,
            },
            {
                title: t('Screenshots'),
                href: route('timetracker.admin.screenshots'),
                permission: 'manage-timetracker',
                order: 10,
            },
        ],
    },
];
