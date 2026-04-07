<?php

namespace Workdo\LandingPage\Database\Seeders;

use Illuminate\Database\Seeder;
use Workdo\LandingPage\Models\CustomPage;

class CustomPageSeeder extends Seeder
{
    public function run()
    {
        $pages = [
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'content' => '<div class="space-y-6">
                    <h2 class="text-3xl font-bold text-gray-900 border-b pb-4">Privacy Policy</h2>
                    <p class="text-lg text-gray-600 leading-relaxed italic">At HRMSWALA, we value your privacy. This policy explains how we collect, use, and protect your information.</p>
                    
                    <div class="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <span class="w-2 h-8 bg-primary rounded-full mr-3" style="background-color: var(--color-primary);"></span>
                            Information We Collect:
                        </h3>
                        <ul class="list-disc list-inside text-gray-600 space-y-3 pl-4">
                            <li>Name, email address, phone number</li>
                            <li>Company details and employee data entered into the system</li>
                        </ul>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <span class="w-2 h-8 bg-primary rounded-full mr-3" style="background-color: var(--color-primary);"></span>
                            How We Use Information:
                        </h3>
                        <ul class="list-disc list-inside text-gray-600 space-y-3 pl-4">
                            <li>To provide and improve our HRMS services</li>
                            <li>To communicate with users regarding updates and support</li>
                            <li>To process payments securely</li>
                        </ul>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-xl font-semibold text-gray-900">Data Protection:</h3>
                        <p class="text-gray-600 leading-relaxed">We implement industry-standard security measures to protect your data. We do not sell or share your personal information with third parties except as required for service delivery.</p>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-xl font-semibold text-gray-900">Third-Party Services:</h3>
                        <p class="text-gray-600 leading-relaxed">We may use trusted third-party services such as payment gateways and analytics tools.</p>
                    </div>

                    <div class="mt-12 p-6 rounded-2xl bg-primary/5 text-center border border-primary/10" style="background-color: color-mix(in srgb, var(--color-primary) 5%, white);">
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Contact:</h3>
                        <p class="text-gray-600">For any queries, contact us at <a href="mailto:support@hrmswala.com" class="font-medium underline" style="color: var(--color-primary);">support@hrmswala.com</a></p>
                    </div>
                </div>',
                'meta_title' => 'Privacy Policy - HRMSWALA',
                'meta_description' => 'Our privacy policy explains how we collect, use, and protect your information.',
                'is_active' => true,
                'is_disabled' => true
            ],
            [
                'title' => 'Terms & Conditions',
                'slug' => 'terms-and-conditions',
                'content' => '<div class="space-y-6">
                    <h2 class="text-3xl font-bold text-gray-900 border-b pb-4">Terms & Conditions</h2>
                    <p class="text-lg text-gray-600 leading-relaxed">By using HRMSWALA, you agree to the following terms:</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="p-6 rounded-xl border border-gray-100 shadow-sm bg-white">
                            <h3 class="text-lg font-bold text-gray-900 mb-3" style="color: var(--color-primary);">Service Usage:</h3>
                            <p class="text-gray-600">Users must provide accurate information and use the platform responsibly.</p>
                        </div>
                        <div class="p-6 rounded-xl border border-gray-100 shadow-sm bg-white">
                            <h3 class="text-lg font-bold text-gray-900 mb-3" style="color: var(--color-primary);">Account Responsibility:</h3>
                            <p class="text-gray-600">Users are responsible for maintaining account confidentiality.</p>
                        </div>
                        <div class="p-6 rounded-xl border border-gray-100 shadow-sm bg-white">
                            <h3 class="text-lg font-bold text-gray-900 mb-3" style="color: var(--color-primary);">Subscription & Billing:</h3>
                            <p class="text-gray-600">Services are provided on a subscription basis. Fees must be paid in advance.</p>
                        </div>
                        <div class="p-6 rounded-xl border border-gray-100 shadow-sm bg-white">
                            <h3 class="text-lg font-bold text-gray-900 mb-3" style="color: var(--color-primary);">Termination:</h3>
                            <p class="text-gray-600">We reserve the right to suspend or terminate accounts in case of misuse.</p>
                        </div>
                    </div>

                    <div class="mt-8 p-6 rounded-xl bg-gray-900 text-white">
                        <h3 class="text-xl font-semibold mb-3 text-white">Limitation of Liability:</h3>
                        <p class="text-gray-300 opacity-90">HRMSWALA is not liable for any indirect damages arising from the use of the service.</p>
                    </div>
                </div>',
                'meta_title' => 'Terms & Conditions - HRMSWALA',
                'meta_description' => 'Read our terms and conditions for using the HRMSWALA platform.',
                'is_active' => true,
                'is_disabled' => true
            ],
            [
                'title' => 'Refund & Cancellation Policy',
                'slug' => 'refund-policy',
                'content' => '<div class="space-y-8">
                    <h2 class="text-3xl font-bold text-gray-900 border-b pb-4">Refund & Cancellation Policy</h2>
                    
                    <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                        <p class="text-lg font-semibold text-red-800 italic">All payments made for HRMSWALA services are non-refundable.</p>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white mr-4" style="background-color: var(--color-primary);">
                                <span class="font-bold">1</span>
                            </div>
                            <p class="text-gray-600 text-lg leading-relaxed pt-1">Once a subscription is activated, no refunds will be provided under any circumstances.</p>
                        </div>
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white mr-4" style="background-color: var(--color-primary);">
                                <span class="font-bold">2</span>
                            </div>
                            <p class="text-gray-600 text-lg leading-relaxed pt-1">Users can cancel their subscription at any time, but no partial or full refunds will be issued for the remaining period.</p>
                        </div>
                        <div class="flex items-start">
                            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white mr-4" style="background-color: var(--color-primary);">
                                <span class="font-bold">3</span>
                            </div>
                            <p class="text-gray-600 text-lg leading-relaxed pt-1">In case of duplicate payment, users may contact support for resolution.</p>
                        </div>
                    </div>

                    <div class="mt-12 text-center p-8 rounded-2xl border-2 border-dashed border-gray-200">
                        <p class="text-gray-500 mb-2 font-medium">Need help with your subscription?</p>
                        <a href="mailto:support@hrmswala.com" class="text-xl font-bold" style="color: var(--color-primary);">support@hrmswala.com</a>
                    </div>
                </div>',
                'meta_title' => 'Refund & Cancellation Policy - HRMSWALA',
                'meta_description' => 'Important information about our refund and cancellation policy.',
                'is_active' => true,
                'is_disabled' => true
            ],
            [
                'title' => 'Contact Us',
                'slug' => 'contact-us',
                'content' => '<div class="space-y-12">
                    <div class="text-center">
                        <h2 class="text-4xl font-extrabold text-gray-900 mb-4">Contact Us</h2>
                        <p class="text-xl text-gray-600">We are here to help you. Reach out to us through any of these channels.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-6">
                            <div class="flex items-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                <div class="w-14 h-14 rounded-xl flex items-center justify-center mr-6 text-2xl group-hover:scale-110 transition-transform" style="background-color: var(--color-primary); color: white;">
                                    🏢
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Business Name</h4>
                                    <p class="text-xl font-bold text-gray-900">HRMSWALA</p>
                                </div>
                            </div>

                            <div class="flex items-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                <div class="w-14 h-14 rounded-xl flex items-center justify-center mr-6 text-2xl group-hover:scale-110 transition-transform" style="background-color: var(--color-primary); color: white;">
                                    📧
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Email Support</h4>
                                    <p class="text-xl font-bold text-gray-900">support@hrmswala.com</p>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="flex items-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                <div class="w-14 h-14 rounded-xl flex items-center justify-center mr-6 text-2xl group-hover:scale-110 transition-transform" style="background-color: var(--color-primary); color: white;">
                                    📞
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Phone Number</h4>
                                    <p class="text-xl font-bold text-gray-900">+91 XXXXXXXX</p>
                                </div>
                            </div>

                            <div class="flex items-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                <div class="w-14 h-14 rounded-xl flex items-center justify-center mr-6 text-2xl group-hover:scale-110 transition-transform" style="background-color: var(--color-primary); color: white;">
                                    📍
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Our Address</h4>
                                    <p class="text-xl font-bold text-gray-900">Ahmedabad, Gujarat, India</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-12 p-10 rounded-3xl bg-gray-900 text-white text-center relative overflow-hidden">
                        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full opacity-10" style="background-color: var(--color-primary);"></div>
                        <div class="relative z-10">
                            <h3 class="text-2xl font-bold mb-4">Support & Inquiries</h3>
                            <p class="text-gray-400 text-lg max-w-2xl mx-auto mb-0">For support or inquiries, please email us or call during business hours. We aim to respond within 24-48 hours.</p>
                        </div>
                    </div>
                </div>',
                'meta_title' => 'Contact Us - HRMSWALA',
                'meta_description' => 'Get in touch with the HRMSWALA team for support and inquiries.',
                'is_active' => true,
                'is_disabled' => false
            ],
            [
                'title' => 'About Us',
                'slug' => 'about-us',
                'content' => '<div class="space-y-8">
                    <div class="text-center">
                        <h2 class="text-3xl font-bold text-gray-900 mb-4">Empowering Business Growth</h2>
                        <p class="text-lg text-gray-600 max-w-3xl mx-auto">HRMSWALA is dedicated to providing robust business solutions that help companies streamline their operations and achieve sustainable growth.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 class="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                            <p class="text-gray-600 leading-relaxed">To democratize access to enterprise-grade business tools, enabling companies of all sizes to manage their operations with precision and ease.</p>
                        </div>
                        <div class="bg-gray-100 rounded-lg p-8">
                            <h3 class="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h3>
                            <p class="text-gray-600 leading-relaxed">To be the global standard for cloud-based business management, where every operation is transparent, connected, and efficient.</p>
                        </div>
                    </div>
                </div>',
                'meta_title' => 'About Us - HRMSWALA',
                'meta_description' => 'Discover our story, mission, and vision.',
                'is_active' => true,
                'is_disabled' => false
            ],
            [
                'title' => 'FAQ',
                'slug' => 'faq',
                'content' => '<div class="space-y-8">
                    <div class="text-center">
                        <h2 class="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p class="text-lg text-gray-600">Find answers to the most common questions about our services.</p>
                    </div>
                    <div class="space-y-6">
                        <div class="bg-white border rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">What is HRMSWALA?</h3>
                            <p class="text-gray-600 leading-relaxed">HRMSWALA is a comprehensive HR management platform that helps companies streamline their operations and improve productivity.</p>
                        </div>
                    </div>
                </div>',
                'meta_title' => 'FAQ - HRMSWALA',
                'meta_description' => 'Find answers to common questions.',
                'is_active' => true,
                'is_disabled' => false
            ],
            [
                'title' => 'Help Center',
                'slug' => 'help-center',
                'content' => '<div class="space-y-8">
                    <div class="text-center">
                        <h2 class="text-3xl font-bold text-gray-900 mb-4">Help Center</h2>
                        <p class="text-lg text-gray-600">Find guides and tutorials to help you get the most out of our platform.</p>
                    </div>
                </div>',
                'meta_title' => 'Help Center - HRMSWALA',
                'meta_description' => 'Access our comprehensive help center.',
                'is_active' => true,
                'is_disabled' => false
            ]
        ];

        foreach ($pages as $pageData) {
            CustomPage::updateOrCreate(
                ['slug' => $pageData['slug']],
                $pageData
            );
        }
    }
}