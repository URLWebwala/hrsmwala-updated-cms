<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', $page['props']['auth']['lang'] ?? substr(app()->getLocale(), 0, 2)) }}" >
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <?php
            $landingSettings = \Workdo\LandingPage\Models\LandingPageSetting::first();
            $metaDesc = $landingSettings->meta_description ?? 'The Complete Cloud HRM Platform for Modern Enterprises. Manage employees, attendance, payroll, and more with HRMswala SaaS.';
            $metaKeywords = $landingSettings->meta_keywords ?? 'HRM SaaS, Cloud Payroll, Attendance Tracker, Employee Management, HRMswala, Business ERP';
        ?>

        <!-- SEO Meta Tags -->
        <meta name="description" content="{{ $metaDesc }}">
        <meta name="keywords" content="{{ $metaKeywords }}">
        <meta name="author" content="{{ $landingSettings->company_name ?? 'HRMswala SaaS' }}">
        <meta name="robots" content="index, follow">
        <link rel="alternate" type="text/plain" href="{{ url('/llms.txt') }}" title="LLMs policy">

        <!-- Canonical Tag -->
        <link rel="canonical" href="{{ url()->current() }}" />

        <!-- Open Graph / Social Media -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ config('app.name', 'HRMswala SaaS') }} - All-in-One Business Management Solution">
        <meta property="og:description" content="{{ $metaDesc }}">
        <meta property="og:image" content="{{ asset('logo.png') }}">
        <meta property="og:site_name" content="{{ config('app.name', 'HRMswala SaaS') }}">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:domain" content="hrmswala.com">
        <meta name="twitter:url" content="{{ url()->current() }}">
        <meta name="twitter:title" content="{{ config('app.name', 'HRMswala SaaS') }} - Modern HR Management">
        <meta name="twitter:description" content="{{ $metaDesc }}">
        <meta name="twitter:image" content="{{ asset('logo.png') }}">

        <!-- JSON-LD Structured Data for Google -->
        <script type="application/ld+json">
        [
          {
            "@@context": "https://schema.org",
            "@@type": "Organization",
            "name": "{{ $landingSettings->company_name ?? 'HRMswala' }}",
            "url": "https://hrmswala.com",
            "logo": "{{ asset('logo.png') }}",
            "sameAs": [
              "https://www.facebook.com/hrmswala",
              "https://www.linkedin.com/company/hrmswala",
              "https://twitter.com/hrmswala"
            ],
            "contactPoint": {
              "@@type": "ContactPoint",
              "telephone": "{{ $landingSettings->contact_phone ?? '' }}",
              "contactType": "customer service",
              "email": "{{ $landingSettings->contact_email ?? '' }}"
            }
          },
          {
            "@@context": "https://schema.org",
            "@@type": "SoftwareApplication",
            "name": "HRMswala SaaS",
            "operatingSystem": "Web, Windows, macOS, Linux, Mobile",
            "applicationCategory": "BusinessApplication",
            "description": "{{ $metaDesc }}",
            "offers": {
              "@@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1024"
            }
          }
        ]
        </script>

        <!-- Google Analytics (G-SSK2G4XLS3) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SSK2G4XLS3"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-SSK2G4XLS3');
        </script>

        <title inertia>{{ config('app.name', 'HRMswala SaaS') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <script src="{{ asset('js/jquery.min.js') }}"></script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        <style>
            #app-loader {
                position: fixed;
                inset: 0;
                background: #f8fafc;
                z-index: 9999;
                overflow: hidden;
            }

            #app-loader .skeleton-shell {
                display: grid;
                grid-template-columns: 240px 1fr;
                height: 100%;
            }

            #app-loader .skeleton-sidebar {
                background: #ffffff;
                border-right: 1px solid #e5e7eb;
                padding: 16px 12px;
            }

            #app-loader .skeleton-main {
                padding: 16px 20px;
            }

            #app-loader .skeleton-topbar {
                height: 56px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                margin-bottom: 16px;
            }

            #app-loader .skeleton-cards {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 12px;
                margin-bottom: 16px;
            }

            #app-loader .skeleton-card {
                height: 96px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 12px;
            }

            #app-loader .skeleton-panel {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 14px;
            }

            #app-loader .skeleton-line {
                height: 12px;
                border-radius: 6px;
                background: #e5e7eb;
                margin-bottom: 10px;
            }

            #app-loader .skeleton-line.sm { width: 38%; }
            #app-loader .skeleton-line.md { width: 62%; }
            #app-loader .skeleton-line.lg { width: 84%; }
            #app-loader .skeleton-line.full { width: 100%; }

            #app-loader .skeleton-row {
                display: grid;
                grid-template-columns: 1.1fr 1.1fr 1fr 1fr 0.8fr;
                gap: 10px;
                margin-top: 10px;
            }

            #app-loader .shimmer {
                position: relative;
                overflow: hidden;
            }

            #app-loader .shimmer::after {
                content: '';
                position: absolute;
                top: 0;
                left: -150%;
                width: 120%;
                height: 100%;
                background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.7) 50%, rgba(255,255,255,0) 100%);
                animation: shimmer 1.25s infinite;
            }

            #app-loader .loading-label {
                position: absolute;
                right: 20px;
                bottom: 16px;
                font-size: 12px;
                color: #64748b;
                background: rgba(255, 255, 255, 0.85);
                padding: 6px 10px;
                border-radius: 999px;
                border: 1px solid #e5e7eb;
            }

            @@keyframes shimmer {
                100% {
                    left: 130%;
                }
            }

            @media (max-width: 1024px) {
                #app-loader .skeleton-shell {
                    grid-template-columns: 1fr;
                }
                #app-loader .skeleton-sidebar {
                    display: none;
                }
                #app-loader .skeleton-cards {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
            }
        </style>
        <div id="app-loader">
            <div class="skeleton-shell">
                <aside class="skeleton-sidebar">
                    <div class="skeleton-line lg shimmer"></div>
                    <div class="skeleton-line md shimmer"></div>
                    <div class="skeleton-line full shimmer"></div>
                    <div class="skeleton-line full shimmer"></div>
                    <div class="skeleton-line md shimmer"></div>
                    <div class="skeleton-line full shimmer"></div>
                    <div class="skeleton-line full shimmer"></div>
                </aside>

                <main class="skeleton-main">
                    <div class="skeleton-topbar shimmer"></div>

                    <div class="skeleton-cards">
                        <div class="skeleton-card">
                            <div class="skeleton-line sm shimmer"></div>
                            <div class="skeleton-line md shimmer"></div>
                            <div class="skeleton-line lg shimmer"></div>
                        </div>
                        <div class="skeleton-card">
                            <div class="skeleton-line sm shimmer"></div>
                            <div class="skeleton-line md shimmer"></div>
                            <div class="skeleton-line lg shimmer"></div>
                        </div>
                        <div class="skeleton-card">
                            <div class="skeleton-line sm shimmer"></div>
                            <div class="skeleton-line md shimmer"></div>
                            <div class="skeleton-line lg shimmer"></div>
                        </div>
                        <div class="skeleton-card">
                            <div class="skeleton-line sm shimmer"></div>
                            <div class="skeleton-line md shimmer"></div>
                            <div class="skeleton-line lg shimmer"></div>
                        </div>
                    </div>

                    <section class="skeleton-panel">
                        <div class="skeleton-line md shimmer"></div>
                        <div class="skeleton-line lg shimmer"></div>
                        <div class="skeleton-row">
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                        </div>
                        <div class="skeleton-row">
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                        </div>
                        <div class="skeleton-row">
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                            <div class="skeleton-line full shimmer"></div>
                        </div>
                    </section>
                </main>

                <div class="loading-label">{{ __('Loading your dashboard...') }}</div>
            </div>
            <div style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden">
                {{ __('Loading the interactive application...') }}
            </div>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded',()=>{
                const loader=document.getElementById('app-loader');
                const checkApp=()=>{
                    if(document.querySelector('#app').children.length>0){
                        if(loader){
                            loader.style.display='none';
                        }
                    }else{
                        setTimeout(checkApp,50);
                    }
                };
                checkApp();
            });
        </script>
    </body>
</html>
