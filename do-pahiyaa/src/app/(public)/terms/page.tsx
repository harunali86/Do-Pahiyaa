import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions | Do Pahiyaa",
    description: "Terms and conditions for buying, selling, evaluating, or scrapping bikes on Do Pahiyaa.",
};

export default function TermsAndConditionsPage() {
    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-xl backdrop-blur-sm">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Terms & Conditions</h1>

                    <div className="space-y-8 text-slate-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                            <p>
                                Welcome to Dopahiyaa.com. By using our services (buying, selling, evaluating, or scrapping bikes), you agree to comply with the following Terms & Conditions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Services Provided</h2>
                            <p className="mb-2">Dopahiyaa offers:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Buying used two-wheelers</li>
                                <li>Selling pre-owned bikes</li>
                                <li>Vehicle inspection & valuation</li>
                                <li>Scrap vehicle pickup & processing</li>
                            </ul>
                            <p className="mt-3 text-slate-400 italic">We reserve the right to accept or reject any vehicle at our discretion.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Seller Terms</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Seller must be the legal owner of the vehicle.</li>
                                <li>Valid RC (Registration Certificate) is mandatory.</li>
                                <li>
                                    Seller must disclose:
                                    <ul className="list-circle pl-5 mt-1 space-y-1 text-slate-400">
                                        <li>Accident history</li>
                                        <li>Engine or major repair issues</li>
                                        <li>Pending loans (if any)</li>
                                    </ul>
                                </li>
                                <li>Any pending traffic challans must be cleared before final payment or will be deducted.</li>
                                <li>Offer price is subject to physical inspection.</li>
                            </ul>
                            <p className="mt-3 text-amber-400/80 text-sm">If the vehicle condition differs from photos/videos shared, the offer may be revised.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Buyer Terms</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Buyer must verify vehicle documents before purchase.</li>
                                <li>Transfer of ownership must be completed within RTO guidelines.</li>
                                <li>Dopahiyaa is not responsible for misuse after delivery.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Payment Terms</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Instant payment may be provided after final inspection & documentation approval.</li>
                                <li>Payment mode: Bank transfer / UPI / Cheque (as applicable).</li>
                                <li>Payment may be delayed if documents are incomplete.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Scrap Vehicle Policy</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Vehicle must not be stolen or under dispute.</li>
                                <li>Original RC & ID proof required.</li>
                                <li>Certificate of Destruction (if applicable) will be provided as per rules.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Liability Limitation</h2>
                            <p className="mb-2">Dopahiyaa shall not be liable for:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Hidden mechanical defects not disclosed</li>
                                <li>Loss due to incorrect documents</li>
                                <li>Delays caused by RTO or government processes</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Privacy Policy</h2>
                            <p>
                                Customer information (name, phone number, address, documents) will be used only for transaction purposes and will not be shared without consent, except as required by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. Modification of Terms</h2>
                            <p>
                                Dopahiyaa reserves the right to update these Terms & Conditions at any time without prior notice.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
