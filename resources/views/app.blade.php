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

            // Build canonical URL reliably (works even when url()->current() returns base URL behind proxies)
            $appBase = rtrim(config('app.url', 'https://hrmswala.com'), '/');
            try { $reqPath = request()->path(); } catch (\Throwable $e) { $reqPath = '/'; }
            if (empty($reqPath) || $reqPath === '/') {
                $reqPath = '';
            } else {
                $reqPath = '/' . ltrim($reqPath, '/');
            }
            // Fallback to $_SERVER['REQUEST_URI'] if request()->path() returns empty
            if ($reqPath === '' && !empty($_SERVER['REQUEST_URI']) && $_SERVER['REQUEST_URI'] !== '/') {
                $raw = strtok($_SERVER['REQUEST_URI'], '?');
                if (!empty($raw) && $raw !== '/') {
                    $reqPath = '/' . ltrim($raw, '/');
                }
            }
            $currentFullUrl = $reqPath === '' ? $appBase . '/' : $appBase . $reqPath;
            $defaultOgImage = asset('logo.png');
            $appName = config('app.name', 'HRMswala SaaS');

            // Per-page SEO defaults (so non-JS crawlers see correct title/description on initial HTML)
            $routePath = ltrim($reqPath, '/');
            $seoTitle = null;
            $seoDescription = $metaDesc;
            if ($routePath === '' || $routePath === '/') {
                $seoTitle = 'HRMSwala - HRM, Payroll & Employee Management Software';
                $seoDescription = 'HRMSwala is a cloud-based HRM and payroll software to manage employees, attendance, leave, payroll, and business operations efficiently.';
            } elseif ($routePath === 'pricing') {
                $seoTitle = 'HRMSwala Pricing | Affordable HRM & Payroll Plans';
                $seoDescription = 'Explore affordable HRMSwala pricing plans for HR management, payroll, attendance tracking, and employee management software.';
            } elseif ($routePath === 'blog') {
                $seoTitle = 'HRMSwala Blog | HR, Payroll & Employee Management Tips';
                $seoDescription = 'Read HRMSwala blogs about HR management, payroll processing, employee attendance, productivity, and business growth strategies.';
            } elseif (str_starts_with($routePath, 'blog/')) {
                $blogSlug = substr($routePath, 5);
                try {
                    $blogPost = \Workdo\LandingPage\Models\Blog::where('slug', $blogSlug)->first();
                    if ($blogPost) {
                        $seoTitle = $blogPost->meta_title ?: $blogPost->title;
                        $seoDescription = $blogPost->meta_description ?: \Illuminate\Support\Str::limit(strip_tags($blogPost->description ?? $blogPost->content ?? ''), 155);
                    }
                } catch (\Throwable $e) {
                    // Silent fallback to defaults if model not available
                }
            } elseif ($routePath === 'page/about-us') {
                $seoTitle = 'About HRMSwala | HRM & Payroll Software Company';
                $seoDescription = 'HRMSwala is a leading cloud-based HRM and payroll software company helping businesses streamline employee, attendance and workforce management.';
            } elseif ($routePath === 'page/help-center') {
                $seoTitle = 'Help Center | HRMSwala Support & Guides';
                $seoDescription = 'Find answers, guides, and support for HRMSwala HR and payroll software. Get help with onboarding, attendance, payroll, and more.';
            } elseif (str_starts_with($routePath, 'page/')) {
                $pageSlug = substr($routePath, 5);
                try {
                    $customPage = \Workdo\LandingPage\Models\CustomPage::where('slug', $pageSlug)->first();
                    if ($customPage) {
                        $seoTitle = $customPage->meta_title ?: $customPage->title;
                        $seoDescription = $customPage->meta_description ?: \Illuminate\Support\Str::limit(strip_tags($customPage->content ?? ''), 155);
                    }
                } catch (\Throwable $e) {
                    // Silent fallback
                }
            }
            $seoDescription = trim((string) $seoDescription) ?: $metaDesc;
            $finalTitle = $seoTitle ? ($seoTitle . ' - ' . $appName) : $appName;
        ?>

        <!-- SEO Meta Tags (page-specific values are replaced by Inertia Head when set) -->
        <meta inertia name="description" content="{{ $seoDescription }}">
        <meta name="keywords" content="{{ $metaKeywords }}">
        <meta name="author" content="{{ $landingSettings->company_name ?? 'HRMswala SaaS' }}">
        <meta name="robots" content="index, follow">
        <link rel="alternate" type="text/plain" href="{{ url('/llms.txt') }}" title="LLMs policy">

        <!-- Canonical Tag -->
        <link inertia rel="canonical" href="{{ $currentFullUrl }}" />

        <!-- Open Graph / Social Media -->
        <meta property="og:type" content="website">
        <meta inertia property="og:url" content="{{ $currentFullUrl }}">
        <meta inertia property="og:title" content="{{ $finalTitle }}">
        <meta inertia property="og:description" content="{{ $seoDescription }}">
        <meta inertia property="og:image" content="{{ $defaultOgImage }}">
        <meta property="og:site_name" content="{{ $appName }}">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:domain" content="hrmswala.com">
        <meta inertia name="twitter:url" content="{{ $currentFullUrl }}">
        <meta inertia name="twitter:title" content="{{ $finalTitle }}">
        <meta inertia name="twitter:description" content="{{ $seoDescription }}">
        <meta inertia name="twitter:image" content="{{ $defaultOgImage }}">

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
              "target": "https://hrmswala.com/blog?search={search_term_string}",
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

        <title inertia>{{ $finalTitle }}</title>

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
