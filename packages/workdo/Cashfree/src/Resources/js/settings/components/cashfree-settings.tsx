import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Save, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CashfreeSettings {
  cashfree_enabled: string;
  cashfree_client_id: string;
  cashfree_client_secret: string;
  cashfree_environment: string;
  [key: string]: any;
}

interface CashfreeSettingsProps {
  userSettings?: Record<string, string>;
  auth?: any;
}

export default function CashfreeSettings({ userSettings, auth }: CashfreeSettingsProps) {
  const { t } = useTranslation();
  const { is_demo } = usePage().props as any;
  const [isLoading, setIsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  
  // Use generic permission if module-specific one doesn't exist yet
  const canEdit = auth?.user?.permissions?.includes('manage-system-settings') || auth?.user?.permissions?.includes('edit-cashfree-settings');

  const [settings, setSettings] = useState<CashfreeSettings>({
    cashfree_enabled: userSettings?.cashfree_enabled || 'off',
    cashfree_client_id: userSettings?.cashfree_client_id || '',
    cashfree_client_secret: userSettings?.cashfree_client_secret || '',
    cashfree_environment: userSettings?.cashfree_environment || 'sandbox',
  });

  useEffect(() => {
    if (userSettings) {
      setSettings({
        cashfree_enabled: userSettings?.cashfree_enabled || 'off',
        cashfree_client_id: userSettings?.cashfree_client_id || '',
        cashfree_client_secret: userSettings?.cashfree_client_secret || '',
        cashfree_environment: userSettings?.cashfree_environment || 'sandbox',
      });
    }
  }, [userSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({ ...prev, [name]: checked ? 'on' : 'off' }));
  };

  const saveSettings = () => {
    setIsLoading(true);

    router.post(route('cashfree.settings.update'), {
      settings: settings
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsLoading(false);
        router.reload({ only: ['globalSettings'] });
      },
      onError: () => {
        setIsLoading(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-6">
        <div className="order-1 rtl:order-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            {t('Cashfree Settings')}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t('Configure Cashfree payment gateway for your transactions')}
          </p>
        </div>
        {canEdit && (
          <Button className="order-2 rtl:order-1" onClick={saveSettings} disabled={isLoading} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? t('Saving...') : t('Save Changes')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Enable/Disable Cashfree */}
          <div className="flex items-center justify-between p-5 border rounded-xl bg-muted/30">
            <div>
              <Label htmlFor="cashfree_enabled" className="text-base font-semibold">
                {t('Enable Cashfree')}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t('Activate or deactivate Cashfree as a payment option')}
              </p>
            </div>
            <Switch
              id="cashfree_enabled"
              checked={settings.cashfree_enabled === 'on'}
              onCheckedChange={(checked) => handleSwitchChange('cashfree_enabled', checked)}
              disabled={!canEdit}
            />
          </div>

          {settings.cashfree_enabled === 'on' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Environment Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="cashfree_environment">{t('Environment')}</Label>
                    <Select 
                      value={settings.cashfree_environment} 
                      onValueChange={(value) => handleSelectChange('cashfree_environment', value)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('Select environment')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">{t('Sandbox / Testing')}</SelectItem>
                        <SelectItem value="production">{t('Production / Live')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {t('Toggle between testing and live payment processing')}
                    </p>
                  </div>

                  {/* Cashfree Client ID */}
                  <div className="space-y-3">
                    <Label htmlFor="cashfree_client_id">{t('Client ID / App ID')}</Label>
                    <Input
                      id="cashfree_client_id"
                      name="cashfree_client_id"
                      value={is_demo ? '****************' : settings.cashfree_client_id}
                      onChange={handleInputChange}
                      placeholder={t('Enter your Cashfree Client ID')}
                      disabled={is_demo || !canEdit}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('The App ID provided by Cashfree dashboard')}
                    </p>
                  </div>

                  {/* Cashfree Client Secret */}
                  <div className="space-y-3">
                    <Label htmlFor="cashfree_client_secret">{t('Client Secret')}</Label>
                    <div className="relative">
                      <Input
                        id="cashfree_client_secret"
                        name="cashfree_client_secret"
                        type={showSecret ? 'text' : 'password'}
                        value={is_demo ? '****************' : settings.cashfree_client_secret}
                        onChange={handleInputChange}
                        placeholder={t('Enter your Cashfree Client Secret')}
                        disabled={is_demo || !canEdit}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('The Secret Key provided by Cashfree dashboard')}
                    </p>
                  </div>
                </div>

                {/* Integration Guide */}
                <div className="lg:col-span-1 border rounded-xl p-5 bg-card/50 shadow-sm border-primary/10">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-primary">
                    <ExternalLink className="h-4 w-4" />
                    {t('How to get API keys')}
                  </h4>
                  <div className="space-y-4 text-sm leading-relaxed">
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                      <span>{t('Login to your')} <a href="https://merchant.cashfree.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary">{t('Cashfree Merchant Dashboard')}</a></span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                      <span>{t('Switch to Payment Gateway and navigate to settings')}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                      <span>{t('Go to API Keys → Generate Keys')}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center shrink-0 font-bold text-[10px]">4</span>
                      <span>{t('Copy the App ID and Secret Key to the fields on the left')}</span>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200/50 text-xs text-amber-700 dark:text-amber-300">
                      <strong>{t('Note:')}</strong> {t('Ensure you are using Sandbox keys for testing before switching to Live keys.')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
