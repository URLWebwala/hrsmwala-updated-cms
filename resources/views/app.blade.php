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
          },
          {
            "@@context": "https://schema.org",
            "@@type": "WebSite",
            "name": "HRMswala SaaS",
            "url": "https://hrmswala.com",
            "potentialAction": {
              "@@type": "SearchAction",
              "target": "https://hrmswala.com/blogs?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@@context": "https://schema.org",
            "@@type": "ItemList",
            "name": "Main Navigation",
            "itemListElement": [
              {
                "@@type": "SiteNavigationElement",
                "position": 1,
                "name": "Home",
                "url": "https://hrmswala.com/"
              },
              {
                "@@type": "SiteNavigationElement",
                "position": 2,
                "name": "About Us",
                "url": "https://hrmswala.com/page/about-us"
              },
              {
                "@@type": "SiteNavigationElement",
                "position": 3,
                "name": "Help Center",
                "url": "https://hrmswala.com/page/help-center"
              },
              {
                "@@type": "SiteNavigationElement",
                "position": 4,
                "name": "Blog",
                "url": "https://hrmswala.com/blog"
              },
              {
                "@@type": "SiteNavigationElement",
                "position": 5,
                "name": "Pricing",
                "url": "https://hrmswala.com/pricing"
              }
            ]
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
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #ffffff;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: opacity 0.4s ease;
            }

            .premium-loader {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .premium-dot {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6366f1, #a855f7);
                animation: premium-bounce 1.4s infinite ease-in-out both;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            }

            .premium-dot:nth-child(1) { animation-delay: -0.32s; }
            .premium-dot:nth-child(2) { animation-delay: -0.16s; }
            .premium-dot:nth-child(3) { animation-delay: 0s; }

            .premium-loader-text {
                margin-top: 20px;
                font-size: 15px;
                font-weight: 500;
                color: #475569;
                letter-spacing: 0.5px;
                animation: pulse-text 2s infinite;
            }

            @keyframes premium-bounce {
                0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
                40% { transform: scale(1); opacity: 1; }
            }

            @keyframes pulse-text {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
        </style>
        <div id="app-loader">
            <div class="premium-loader">
                <div class="premium-dot"></div>
                <div class="premium-dot"></div>
                <div class="premium-dot"></div>
            </div>
            <div class="premium-loader-text">{{ __('Loading HRMswala...') }}</div>
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
