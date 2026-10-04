"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Edit2, Loader2, ArrowLeft } from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import StatusBadge from "@web/components/ui/StatusBadge";
import { createClient } from "@web/utils/supabase/client";

export default function OwnerListingsPage() {
  const [listings, setListings] = useState<Array<Record<string, unknown> & { id: string, title: string, address: string, status: string, priceRules?: Array<{amount: number}> }>>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchListings() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/listings/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setListings(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [supabase.auth]);

  return (
    <div className="min-h-screen bg-bg-void flex flex-col p-4 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/owner/dashboard" className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-white">Your Listings</h1>
            <p className="text-xs text-muted font-mono">Manage your parking spots</p>
          </div>
        </div>
        <Link href="/owner/listings/new">
          <NeonButton variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </NeonButton>
        </Link>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <GlassCard className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <MapPin className="w-12 h-12 text-muted mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">No listings yet</h2>
          <p className="text-sm text-muted font-mono mb-6 max-w-sm">
            You haven&apos;t added any parking spaces yet. Create your first listing to start earning!
          </p>
          <Link href="/owner/listings/new">
            <NeonButton variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Add First Listing
            </NeonButton>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <GlassCard key={listing.id} className="flex flex-col">
              <div className="h-32 bg-white/5 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
                <MapPin className="w-8 h-8 text-white/20" />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={listing.status === 'PUBLISHED' ? 'available' : 'occupied'} />
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-white text-lg mb-1">{listing.title}</h3>
                <p className="text-xs text-muted font-mono mb-4 line-clamp-2">{listing.address}</p>
                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm font-bold text-accent-cyan">
                    ₹{listing.priceRules?.[0]?.amount ? (listing.priceRules[0].amount / 100).toFixed(2) : '--'} <span className="text-[10px] text-muted font-mono">/hr</span>
                  </div>
                  <Link href={`/owner/listings/${listing.id}`}>
                    <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white hover:bg-white/10 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
