"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="max-w-5xl mx-auto py-12 grid grid-cols-1 md:grid-cols-2 gap-12">

            <div>
                <h1 className="text-4xl font-black text-white mb-4">Get in Touch</h1>
                <p className="text-slate-400 mb-8">
                    Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
                </p>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-brand-500">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Chat with us</h3>
                            <p className="text-slate-400 text-sm">support@dopahiyaa.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-brand-500">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Call us</h3>
                            <p className="text-slate-400 text-sm">+91 888-999-0000</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-brand-500">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Visit us</h3>
                            <p className="text-slate-400 text-sm">Indiranagar, Bengaluru, KA</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8">
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Name</label>
                        <input type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Email</label>
                        <input type="email" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Message</label>
                        <textarea rows={4} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50" placeholder="How can we help?" />
                    </div>
                    <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                        <Send className="w-4 h-4" /> Send Message
                    </button>
                </form>
            </div>

        </div>
    );
}
