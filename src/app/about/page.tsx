export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 space-y-12">
            <section className="text-center">
                <h1 className="text-4xl font-black text-white mb-4">About Do Pahiyaa</h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    India&apos;s first hybrid marketplace designed exclusively for superbike enthusiasts and premium dealers.
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-4xl font-bold text-brand-500 mb-2">10k+</div>
                    <div className="text-white font-bold">Verified Users</div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-4xl font-bold text-brand-500 mb-2">₹50Cr</div>
                    <div className="text-white font-bold">Transaction Volume</div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 text-center">
                    <div className="text-4xl font-bold text-brand-500 mb-2">500+</div>
                    <div className="text-white font-bold">Dealer Partners</div>
                </div>
            </div>

            <section className="space-y-6 text-slate-300 leading-relaxed">
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
                <p>
                    To bring trust, transparency, and speed to the pre-owned superbike market. We combine the convenience of online discovery with the reliability of offline inspection and verified dealers.
                </p>
                <p>
                    Whether you are buying your first Ducati or selling a cherished Harley, Do Pahiyaa ensures a seamless, secure, and premium experience.
                </p>
            </section>
        </div>
    );
}
