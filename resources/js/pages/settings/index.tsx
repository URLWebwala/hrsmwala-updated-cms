import { useState, Suspense, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allSettingsItems } from '@/utils/settings';
import { getSettingsComponent } from '@/utils/settings-components';

export default function Settings() {
  const { t } = useTranslation();
  const { auth, globalSettings = {}, emailProviders = {}, cacheSize = '0.00' } = usePage().props as any;

  const sidebarNavItems = allSettingsItems();
  const navKey = sidebarNavItems.map((i) => i.href).join('|');

  const [activeSection, setActiveSection] = useState<string>(
    () => sidebarNavItems[0]?.href.replace('#', '') ?? ''
  );

  useEffect(() => {
    const ids = sidebarNavItems.map((item) => item.href.replace('#', ''));
    if (ids.length === 0) {
      return;
    }
    setActiveSection((prev) => (prev && ids.includes(prev) ? prev : ids[0]));
  }, [navKey]);

  const handleNavClick = (href: string) => {
    setActiveSection(href.replace('#', ''));
  };

  const activeItem = sidebarNavItems.find((item) => item.href.replace('#', '') === activeSection);
  const ActiveComponent = activeItem ? getSettingsComponent(activeItem.component) : null;

  return (
    <AuthenticatedLayout
      breadcrumbs={[{ label: t('Settings') }]}
      pageTitle={t('Settings')}
    >
      <Head title={t('Settings')} />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="pr-4 space-y-1">
                {sidebarNavItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn('w-full justify-start', {
                      'bg-muted font-medium': activeSection === item.href.replace('#', ''),
                    })}
                    onClick={() => handleNavClick(item.href)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Content — single section matching sidebar selection */}
        <div className="flex-1 min-w-0">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="pr-4 pb-8">
              {ActiveComponent && activeItem ? (
                <section key={activeSection} id={activeSection} className="mb-8">
                  <Suspense fallback={<div className="p-4">Loading...</div>}>
                    <ActiveComponent
                      userSettings={globalSettings}
                      auth={auth}
                      emailProviders={emailProviders}
                      cacheSize={cacheSize}
                    />
                  </Suspense>
                </section>
              ) : (
                <p className="text-sm text-muted-foreground py-8">{t('No settings available.')}</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
