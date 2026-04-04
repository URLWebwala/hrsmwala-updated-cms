import { NavItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { getSuperAdminMenu } from './menus/superadmin-menu';
import { getCompanyMenu } from './menus/company-menu';
import * as LucideIcons from 'lucide-react';

// Get role-based core menu items
const getCoreMenuItems = (userRoles: string[], userType: string, t: (key: string) => string): NavItem[] => {
    if (userRoles.includes('super admin') || userRoles.includes('superadmin') || userType === 'superadmin') {
        return getSuperAdminMenu(t);
    }
    return getCompanyMenu(t);
};

// Auto-load package menus based on activated packages
const getPackageMenuItems = (userRoles: string[], activatedPackages: string[], t: (key: string) => string): NavItem[] => {
    const menuItems: NavItem[] = [];
    const menuType = userRoles.includes('superadmin') ? 'superadmin-menu' : 'company-menu';

    const allModules = import.meta.glob('../../../packages/workdo/*/src/Resources/js/menus/*.ts', { eager: true });

    const packageCandidates = Array.isArray(activatedPackages) ? [...activatedPackages] : [];
    // Ensure TimeTracker is included in the candidates list
    if (!packageCandidates.includes('TimeTracker')) {
        packageCandidates.push('TimeTracker');
    }

    packageCandidates.forEach(packageName => {
        const menuPathSuffix = `packages/workdo/${packageName}/src/Resources/js/menus/${menuType}.ts`;
        const module = Object.entries(allModules).find(([key]) => key.endsWith(menuPathSuffix))?.[1] as any;

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

// Get custom menu items from database
const getCustomMenuItems = (userRoles: string[], t: (key: string) => string): NavItem[] => {
    const { auth } = usePage().props as any;
    const customMenus = auth?.customMenus || [];
    
    return customMenus.map((menu: any) => {
        // Convert string icon to Lucide icon component
        let iconComponent = null;
        if (menu.icon && typeof menu.icon === 'string') {
            const IconComponent = (LucideIcons as any)[menu.icon];
            if (IconComponent) {
                iconComponent = IconComponent;
            }
        }
        
        return {
            ...menu,
            icon: iconComponent,
        };
    });
};

// Group menu items by parent
const groupMenusByParent = (menuItems: NavItem[], packageMenuItems: NavItem[]): NavItem[] => {
    const groupedItems = [...menuItems];

    packageMenuItems.forEach(packageItem => {
        if (packageItem.parent) {
            const parentMenu = groupedItems.find(item =>
                item.name === packageItem.parent
            );

            if (parentMenu) {
                if (!parentMenu.children) {
                    parentMenu.children = [];
                }
                parentMenu.children.push({
                    ...packageItem,
                    parent: undefined
                });

                // Sort children by order
                if (parentMenu.children) {
                    parentMenu.children.sort((a, b) => (a.order || 999) - (b.order || 999));
                }
            } else {
                groupedItems.push(packageItem);
            }
        } else {
            groupedItems.push(packageItem);
        }
    });

    return groupedItems;
};

// Filter menu items based on permissions
const filterByPermission = (items: NavItem[], userPermissions: string[]): NavItem[] => {
    return items.filter(item => {
        if (!item.permission) {
            if (item.children) {
                item.children = filterByPermission(item.children, userPermissions);
            }
            return true;
        }

        const { auth } = usePage().props as any;
        const isCompany = auth?.user?.type === 'company' || auth?.user?.roles?.includes('company');

        if (!userPermissions.includes(item.permission)) {
            // Bypass permission check for Time Tracker root menus for company owners
            if (isCompany && (item.permission === 'manage-timetracker' || item.name === 'timetracker')) {
                // allow
            } else {
                return false;
            }
        }

        if (item.children) {
            item.children = filterByPermission(item.children, userPermissions);
            return item.children.length > 0;
        }

        return true;
    });
};

// Main function to get filtered menu items
export const allMenuItems = (): NavItem[] => {
    const { auth } = usePage().props as any;
    const { t } = useTranslation();
    const userPermissions = auth?.user?.permissions || [];
    const userRoles = auth?.user?.roles || [];
    const activatedPackages = auth?.user?.activatedPackages || [];

    const coreMenuItems = getCoreMenuItems(userRoles, auth?.user?.type, t);

    const packageMenuItems = getPackageMenuItems(userRoles, activatedPackages, t);
    
    const customMenuItems = getCustomMenuItems(userRoles, t);
    
    // Separate custom menus into parents and children
    const customParentMenus = customMenuItems.filter(menu => !menu.parent);
    const customChildMenus = customMenuItems.filter(menu => menu.parent);
    
    // First add custom parent menus to core menus
    const coreWithCustomParents = [...coreMenuItems, ...customParentMenus];
    
    // Then group all children (package + custom children) with their parents
    const allChildMenus = [...packageMenuItems, ...customChildMenus];
    const finalGroupedMenuItems = groupMenusByParent(coreWithCustomParents, allChildMenus);

    const sortedMenuItems = finalGroupedMenuItems.sort((a, b) => (a.order || 999) - (b.order || 999));

    const finalMenuItems = filterByPermission(sortedMenuItems, userPermissions);

    // Manual Injection Fallback for HRM Monthly Attendance
    const hrmMenu = finalMenuItems.find(m => m.title === t('Hrm'));
    if (hrmMenu && hrmMenu.children) {
        // Fix spelling if misspelled in current load
        const attMenu = hrmMenu.children.find(c => c.title === t('Attedance') || c.title === t('Attendance'));
        if (attMenu) {
            attMenu.title = t('Attendance'); // Force correct spelling
            if (attMenu.children && !attMenu.children.find(cc => cc.title === t('Monthly Attendance'))) {
                attMenu.children.push({
                    title: t('Monthly Attendance'),
                    href: route('hrm.attendances.monthly'),
                    permission: 'manage-attendances',
                });
            }
        }
    }

    // Final Global Force-Injection (Ultimate Fallback for Company users)
    const isCompany = auth?.user?.type === 'company';
    if (isCompany) {
        const exists = finalMenuItems.some(m => m.title === 'Monthly Attendance' || m.title === t('Monthly Attendance'));
        if (!exists) {
            finalMenuItems.push({
                title: 'Monthly Attendance',
                href: route('hrm.attendances.monthly'),
                icon: LucideIcons.Calendar,
                permission: 'manage-attendances', // Use real permission
                order: 451, // Near HRM
                name: 'monthly-attendance',
            });
        }
    }

    return finalMenuItems;
};