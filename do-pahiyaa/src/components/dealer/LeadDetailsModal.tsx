"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Calendar, MessageSquare, Bike } from "lucide-react";

interface LeadDetailsModalProps {
    lead: any;
}

export function LeadDetailsModal({ lead }: LeadDetailsModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full border-white/10 text-white hover:bg-white/5 h-8 text-xs">
                    View Details
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Lead Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                    {/* Buyer Info */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                        <div className="h-12 w-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold border border-brand-500/20">
                            {lead.buyer.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{lead.buyer.full_name}</h3>
                            <p className="text-sm text-slate-400">Potential Buyer</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1">
                            <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Phone className="h-3 w-3" /> Phone
                            </div>
                            <div className="text-sm font-medium">
                                <a href={`tel:${lead.buyer.phone}`} className="hover:text-brand-400 transition-colors">
                                    {lead.buyer.phone}
                                </a>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1">
                            <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Mail className="h-3 w-3" /> Email
                            </div>
                            <div className="text-sm font-medium truncate" title={lead.buyer.email}>
                                <a href={`mailto:${lead.buyer.email}`} className="hover:text-brand-400 transition-colors">
                                    {lead.buyer.email}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Interest Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Interested In</h4>
                        <div className="flex items-start gap-4 p-3 rounded-lg bg-slate-950 border border-white/5">
                            {lead.listing.images?.[0] ? (
                                <img src={lead.listing.images[0]} alt="" className="h-16 w-24 object-cover rounded-lg border border-white/10" />
                            ) : (
                                <div className="h-16 w-24 bg-slate-900 rounded-lg flex items-center justify-center border border-white/10">
                                    <Bike className="h-6 w-6 text-slate-600" />
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-white">{lead.listing.title}</p>
                                <p className="text-sm text-slate-500">{lead.listing.make} • {lead.listing.year} • {lead.listing.city}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs border-brand-500/20 text-brand-400 bg-brand-500/5">
                                        ID: {lead.listing.id.slice(0, 8)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    {lead.message && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" /> Message
                            </h4>
                            <div className="p-3 rounded-lg bg-slate-800/30 border border-white/5 text-sm text-slate-300 italic">
                                &ldquo;{lead.message}&rdquo;
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
