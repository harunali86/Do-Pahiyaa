"use client";

import Link from "next/link";
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    Mail,
    MapPin,
    Phone
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-24 md:pb-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
                            DO <span className="text-brand-500">PAHIYAA</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            India&apos;s first hybrid marketplace for premium pre-owned superbikes.
                            Bid, Buy, and Sell with confidence.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialLink icon={Twitter} href="#" />
                            <SocialLink icon={Instagram} href="#" />
                            <SocialLink icon={Linkedin} href="#" />
                            <SocialLink icon={Youtube} href="#" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Marketplace</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <FooterLink href="/search">Buy a Bike</FooterLink>
                            <FooterLink href="/sell">Sell Your Bike</FooterLink>
                            <FooterLink href="/auctions">Live Auctions</FooterLink>
                            <FooterLink href="/dealer/join">Become a Dealer</FooterLink>
                            <FooterLink href="/compare">Compare Models</FooterLink>
                        </ul>
                    </div>

                    {/* Company & Support */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Company</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <FooterLink href="/about">About Us</FooterLink>
                            <FooterLink href="/careers">Careers</FooterLink>
                            <FooterLink href="/blog">Blog & News</FooterLink>
                            <FooterLink href="/contact">Contact Support</FooterLink>
                            <FooterLink href="/trust-safety">Trust & Safety</FooterLink>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Stay Updated</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Get the latest auction alerts and market trends.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white w-full focus:outline-none focus:border-brand-500/50"
                            />
                            <button className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-lg transition-colors">
                                <Mail className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-8 space-y-2 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-brand-500" />
                                <span>Indiranagar, Bengaluru</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-brand-500" />
                                <span>+91 888-999-0000</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                    <p>© 2026 Do Pahiyaa. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
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
