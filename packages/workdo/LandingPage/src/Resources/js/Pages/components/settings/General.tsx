import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInputComponent } from '@/components/ui/phone-input';
import { Type } from 'lucide-react';

interface GeneralProps {
    data: any;
    updateSectionData: (field: string, value: any) => void;
    updateConfigSection: (key: string, updates: any) => void;
}

export default function General({ data, updateSectionData, updateConfigSection }: GeneralProps) {
    const { t } = useTranslation();

    const socialLinks = data.config_sections?.sections?.social || {};

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Type className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle>{t('Company Information')}</CardTitle>
                            <p className="text-sm text-gray-500">{t('Basic company details for your landing page')}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('Company Name')}</Label>
                            <Input 
                                value={data.company_name || ''}
                                onChange={(e) => updateSectionData('company_name', e.target.value)}
                                placeholder={t('Your Company Name')} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('Contact Email')}</Label>
                            <Input 
                                type="email" 
                                value={data.contact_email || ''}
                                onChange={(e) => updateSectionData('contact_email', e.target.value)}
                                placeholder="support@company.com" 
                            />
                        </div>
                        <div className="space-y-2">
                            <PhoneInputComponent
                                label={t('Contact Phone')}
                                value={data.contact_phone || ''}
                                onChange={(value) => updateSectionData('contact_phone', value)}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('Contact Address')}</Label>
                            <Input 
                                value={data.contact_address || ''}
                                onChange={(e) => updateSectionData('contact_address', e.target.value)}
                                placeholder="123 Business Ave, City, State" 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                            <svg className="h-5 w-5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </div>
                        <div>
                            <CardTitle>{t('Social Media Links')}</CardTitle>
                            <p className="text-sm text-gray-500">{t('Your social media profiles')}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('Facebook Link')}</Label>
                            <Input 
                                value={socialLinks.facebook || ''}
                                onChange={(e) => updateConfigSection('social', { facebook: e.target.value })}
                                placeholder="https://facebook.com/yourcompany" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('Instagram Link')}</Label>
                            <Input 
                                value={socialLinks.instagram || ''}
                                onChange={(e) => updateConfigSection('social', { instagram: e.target.value })}
                                placeholder="https://instagram.com/yourcompany" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('Twitter Link')}</Label>
                            <Input 
                                value={socialLinks.twitter || ''}
                                onChange={(e) => updateConfigSection('social', { twitter: e.target.value })}
                                placeholder="https://twitter.com/yourcompany" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('LinkedIn Link')}</Label>
                            <Input 
                                value={socialLinks.linkedin || ''}
                                onChange={(e) => updateConfigSection('social', { linkedin: e.target.value })}
                                placeholder="https://linkedin.com/company/yourcompany" 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}