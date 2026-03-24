import { SettingMenuItem } from './menus/superadmin-setting';
import { getSuperAdminSettings } from './menus/superadmin-setting';
import { getCompanySettings } from './menus/company-setting';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

// Get role-based core settings items
const getCoreSettingsItems = (userRoles: string[], t: (key: string) => string): SettingMenuItem[] => {
    if (userRoles.includes('superadmin')) {
        return getSuperAdminSettings(t);
    }
    return getCompanySettings(t);
};

// Auto-load package settings based on activated packages
const getPackageSettingsItems = (userRoles: string[], activatedPackages: string[], t: (key: string) => string): SettingMenuItem[] => {
    const menuItems: SettingMenuItem[] = [];
    const settingType = userRoles.includes('superadmin') ? 'superadmin-setting' : 'company-setting';

    const allModules = userRoles.includes('superadmin')
        ? import.meta.glob('../../../packages/workdo/*/src/Resources/js/settings/superadmin-setting.ts', { eager: true })
        : import.meta.glob('../../../packages/workdo/*/src/Resources/js/settings/company-setting.ts', { eager: true });

    const packageCandidates = Array.isArray(activatedPackages) ? [...activatedPackages] : [];
    // Keep Tracker settings visible even when activation metadata is missing.
    if (!packageCandidates.includes('TimeTracker')) {
        packageCandidates.push('TimeTracker');
    }

    packageCandidates.forEach(packageName => {
        const settingPath = `../../../packages/workdo/${packageName}/src/Resources/js/settings/${settingType}.ts`;
        const module = allModules[settingPath] as any;

        if (module) {
            Object.values(module).forEach((item: any) => {
                const result = typeof item === 'function' ? item(t) : item;
                const items = Array.isArray(result) ? result : [result];
                menuItems.push(...items);
            });
        }
    });

    return menuItems;
};

// Filter settings items based on permissions
const filterByPermission = (items: SettingMenuItem[], userPermissions: string[]): SettingMenuItem[] => {
    return items.filter(item => {
        if (item.component === 'tracker-app-settings') return true;
        return Array.isArray(userPermissions) && userPermissions.includes(item.permission);
    });
};

// Main function to get filtered settings items
export const allSettingsItems = (): SettingMenuItem[] => {
    const { auth } = usePage().props as any;
    const { t } = useTranslation();
    const userPermissions = auth?.user?.permissions || [];
    const userRoles = auth?.user?.roles || [];
    const activatedPackages = auth?.user?.activatedPackages || [];

    const coreSettingsItems = getCoreSettingsItems(userRoles, t);
    const packageSettingsItems = getPackageSettingsItems(userRoles, activatedPackages, t);

    const allItems = [...coreSettingsItems, ...packageSettingsItems];

    // Deduplicate by component to avoid duplicates from core and packages
    const uniqueItems = Array.from(new Map(allItems.map(item => [item.component, item])).values());

    // Sort by order
    const sortedItems = uniqueItems.sort((a, b) => (a.order || 999) - (b.order || 999));

    return filterByPermission(sortedItems, userPermissions);
};