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

        <!-- Open Graph / Social Media -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ config('app.name', 'HRMswala SaaS') }} - Complete HRM Solutions">
        <meta property="og:description" content="Streamline your HR operations with the world's most intuitive cloud platform.">
        <meta property="og:image" content="{{ asset('logo.png') }}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="HRMswala SaaS - Modern HR Management">
        <meta property="twitter:description" content="Manage your entire team from one centralized dashboard. Free trial available.">

        <!-- JSON-LD Structured Data for Google -->
        <script type="application/ld+json">
        {
          "@@context": "https://schema.org",
          "@@type": "SoftwareApplication",
          "name": "HRMswala SaaS",
          "operatingSystem": "Web, Windows, macOS, Linux, Mobile",
          "applicationCategory": "BusinessApplication",
          "offers": {
            "@@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1024"
          }
        }
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
            #app-loader{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#fff}
            #app-loader>div{display:flex;flex-direction:column;align-items:center;gap:1rem}
            #app-loader .spinner{position:relative;width:3rem;height:3rem}
            #app-loader .spinner>div:first-child{width:3rem;height:3rem;border:4px solid #e5e7eb;border-radius:50%;animation:spin 1s linear infinite;border-top-color:#2563eb}
            #app-loader .spinner>div:last-child{position:absolute;inset:0;width:3rem;height:3rem;border:4px solid transparent;border-radius:50%;animation:ping 1s cubic-bezier(0,0,.2,1) infinite;border-top-color:#60a5fa;opacity:.2}
            @@keyframes spin{to{transform:rotate(360deg)}}
            @@keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        </style>
        <div id="app-loader">
            <div>
                <div class="spinner"><div></div><div></div></div>
                <div style="text-align:center">
                    <h3 style="font-size:1.125rem;font-weight:600;color:#374151">{{ __('Loading...') }}</h3>
                    <p style="font-size:0.875rem;color:#6b7280">{{ __('Please wait while we prepare your webapp...') }}</p>
                </div>
            </div>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded',()=>{
                const loader=document.getElementById('app-loader');
                const checkApp=()=>{
                    if(document.querySelector('#app').children.length>0){
                        if(loader)loader.remove();
                    }else{
                        setTimeout(checkApp,50);
                    }
                };
                checkApp();
            });
        </script>
    </body>
</html>
