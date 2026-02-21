export default function PrivacyPage() {
    return (
        <div className="container max-w-4xl py-12 mx-auto">
            <div className="glass-panel p-8 md:p-12">
                <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
                <div className="prose prose-invert max-w-none text-slate-300">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, list a bike, or contact customer support. This includes your name, email, phone number, and government ID (for KYC).</p>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use your information to facilitate transactions, verify identities (KYC), process payments, and improve our platform.</p>

                    <h3>3. Information Sharing</h3>
                    <p>We share your information with trusted third parties like Supabase (hosting), Razorpay (payments), and WhatsApp (notifications) strictly for service delivery.</p>

                    <h3>4. Data Security</h3>
                    <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>

                    <h3>5. Your Rights</h3>
                    <p>You have the right to access, correct, or delete your personal information. Contact us at support@dopahiyaa.com for assistance.</p>

                    <h3>6. Cookies</h3>
                    <p>We use cookies to enhance your experience and analyze usage. By using our site, you consent to our use of cookies.</p>
                </div>
            </div>
        </div>
    );
}
