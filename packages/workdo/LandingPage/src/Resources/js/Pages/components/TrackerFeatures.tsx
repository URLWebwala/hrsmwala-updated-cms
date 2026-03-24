import React from 'react';
import { useTranslation } from 'react-i18next';

interface TrackerFeaturesProps {
    settings?: any;
}

export default function TrackerFeatures({ settings }: TrackerFeaturesProps) {
    const { t } = useTranslation();
    const colors = {
        primary: settings?.config_sections?.colors?.primary || '#3b82f6'
    };

    const features = [
        {
            title: 'Time Tracking',
            description: 'Track exact working hours with our automated desktop application.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: 'Screenshot Monitoring',
            description: 'Get periodic screenshots of your team\'s workspace to ensure productivity.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            title: 'Activity Tracking',
            description: 'Monitor keyboard and mouse activity levels to identify idle time.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
            )
        },
        {
            title: 'Productivity Reports',
            description: 'Generate detailed reports on how much time is spent on each project.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        }
    ];

    return (
        <section id="tracker-features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {t('TopTracker Features')}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('Comprehensive time tracking and productivity monitoring for your remote team.')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{t(feature.title)}</h3>
                            <p className="text-gray-600 leading-relaxed">{t(feature.description)}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <div className="inline-block p-1 rounded-2xl bg-white shadow-xl border border-gray-100">
                        <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                            <div className="flex-1 text-left">
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">{t('Secure Desktop App')}</h4>
                                <p className="text-gray-600">{t('Available for Windows. Lightweight and runs in the background.')}</p>
                            </div>
                            <a 
                                href="/get-latest-desktop-app" 
                                className="px-8 py-4 rounded-xl font-bold text-white transition-transform hover:scale-105"
                                style={{ backgroundColor: colors.primary }}
                            >
                                {t('Download Tracker App (.exe)')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
