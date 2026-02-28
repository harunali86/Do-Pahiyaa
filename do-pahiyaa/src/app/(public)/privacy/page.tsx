import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Do Pahiyaa",
    description: "Privacy policy detailing how Do Pahiyaa collects, uses, and safeguards your personal information.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-xl backdrop-blur-sm">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Privacy Policy</h1>

                    <div className="space-y-8 text-slate-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                            <p>
                                At Dopahiyaa.com we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
                            </p>
                            <p className="mt-2 font-medium text-amber-400/90">
                                By using our services, you agree to this Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
                            <p className="mb-4">We may collect the following information:</p>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-white mb-2">Personal Information</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Full Name</li>
                                        <li>Mobile Number</li>
                                        <li>Email Address</li>
                                        <li>Address</li>
                                        <li>Government ID (Aadhar / PAN / Driving License – if required)</li>
                                        <li>Bank details (for payment processing)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-medium text-white mb-2">Vehicle Information</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Bike registration number</li>
                                        <li>RC details</li>
                                        <li>Engine & chassis number</li>
                                        <li>Vehicle photos & videos</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-medium text-white mb-2">Technical Information (if website used)</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>IP address</li>
                                        <li>Device type</li>
                                        <li>Browser information</li>
                                        <li>Cookies</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
                            <p className="mb-2">We use your information to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Provide vehicle valuation and purchase services</li>
                                <li>Process payments</li>
                                <li>Complete RTO transfer formalities</li>
                                <li>Issue scrap certificate (if applicable)</li>
                                <li>Communicate regarding your vehicle</li>
                                <li>Prevent fraud and illegal activity</li>
                                <li>Improve our services</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Information Sharing</h2>
                            <p className="text-amber-400/90 font-medium mb-3">We do NOT sell your personal data.</p>
                            <p className="mb-2">Your information may be shared with:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>RTO authorities (for ownership transfer)</li>
                                <li>Scrap vendors (for vehicle processing)</li>
                                <li>Payment partners</li>
                                <li>Law enforcement (if legally required)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Data Protection</h2>
                            <p>
                                We take reasonable security measures to protect your information from unauthorized access, misuse, or disclosure. However, no online system is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
                            <p className="mb-2">We retain your data only as long as necessary for:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Transaction records</li>
                                <li>Legal compliance</li>
                                <li>Accounting purposes</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
                            <p className="mb-2">You may:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Request access to your data</li>
                                <li>Request correction of incorrect information</li>
                                <li>Request deletion (subject to legal requirements)</li>
                            </ul>
                            <p className="mt-3 text-sm text-slate-400">To request this, contact us using the details below.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Cookies Policy (If Website Used)</h2>
                            <p className="mb-2">Dopahiyaa.com may use cookies to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Improve user experience</li>
                                <li>Track website traffic</li>
                                <li>Store user preferences</li>
                            </ul>
                            <p className="mt-2 text-sm text-slate-400">You can disable cookies in your browser settings.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. Third-Party Links</h2>
                            <p>
                                Our website may contain links to third-party platforms (Facebook, Instagram, WhatsApp). We are not responsible for their privacy practices.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. Updated versions will be posted on our website.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
