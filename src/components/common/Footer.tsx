"use client";

import Link from "next/link";
import {
    Facebook,
    Twitter, // Retained as it was in the original import, though not explicitly used in the provided Footer snippet
    Instagram,
    Linkedin,
    Youtube,
    Mail,
    MapPin,
    Phone,
    Send
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-white/5 pt-12 pb-8 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-2 space-y-4">
                        <Link href="/" className="text-xl font-black tracking-tighter text-white">
                            DO <span className="text-brand-500 uppercase">Pahiyaa</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                            India&apos;s leading hybrid marketplace for certified pre-owned superbikes.
                            Verified documents, transparent pricing, and instant financing.
                        </p>
                        <div className="flex gap-3">
                            <SocialLink icon={Instagram} href="https://www.instagram.com/dopahiyaa" />
                            <SocialLink icon={Facebook} href="https://www.facebook.com/share/1FHuRrzBBK/" />
                            <SocialLink icon={Linkedin} href="#" />
                        </div>
                    </div>

                    {/* Quick links flattened */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest opacity-50">Market</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/search" className="hover:text-brand-400">Buy Bike</Link></li>
                            <li><Link href="/sell" className="hover:text-brand-400">Sell Bike</Link></li>
                            <li><Link href="/auctions" className="hover:text-brand-400">Auctions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest opacity-50">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-brand-400">About</Link></li>
                            <li><Link href="/blog" className="hover:text-brand-400">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-brand-400">Support</Link></li>
                        </ul>
                    </div>

                    {/* Compact Contact */}
                    <div className="col-span-2 md:col-span-1">
                        <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-widest opacity-50">Contact</h4>
                        <div className="space-y-2 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-brand-500" />
                                <span>+91 888-999-0000</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-brand-500" />
                                <span>care@dopahiyaa.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 uppercase tracking-widest">
                    <p>© 2026 Do Pahiyaa. Powered by Harun Shaikh.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
                        <Link href="/sitemap" className="hover:text-slate-400 transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon: Icon, href }: { icon: any, href: string }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-brand-400 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all"
        >
            <Icon className="w-5 h-5" />
        </a>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="hover:text-brand-400 transition-colors block w-fit">
                {children}
            </Link>
        </li>
    );
}
