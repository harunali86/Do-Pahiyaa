export default function TermsPage() {
    return (
        <div className="container max-w-4xl py-12 mx-auto">
            <div className="glass-panel p-8 md:p-12">
                <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
                <div className="prose prose-invert max-w-none text-slate-300">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing or using Dopahiyaa (&ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service.</p>

                    <h3>2. User Accounts</h3>
                    <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>

                    <h3>3. Buying and Selling</h3>
                    <p>Dopahiyaa is a marketplace connecting buyers and sellers. We are not a party to any transaction between users. Sellers are responsible for the accuracy of their listings.</p>

                    <h3>4. Fees and Payments</h3>
                    <p>We may charge fees for certain services (e.g., premium listings). All fees are non-refundable unless otherwise stated. Payments are processed securely via Razorpay.</p>

                    <h3>5. Content Guidelines</h3>
                    <p>Users must not post false, misleading, or illegal content. We reserve the right to remove any listing that violates our policies.</p>

                    <h3>6. Limitation of Liability</h3>
                    <p>To the fullest extent permitted by law, Dopahiyaa shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>

                    <h3>7. Governing Law</h3>
                    <p>These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</p>
                </div>
            </div>
        </div>
    );
}
