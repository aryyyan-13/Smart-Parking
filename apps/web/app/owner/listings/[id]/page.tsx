"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import { createClient } from "@web/utils/supabase/client";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    latitude: 0,
    longitude: 0,
    vehicleType: "FOUR_WHEELER",
    slotLabel: "",
    pricePerHour: "",
    status: "DRAFT",
    approvalMode: "AUTO",
  });

  useEffect(() => {
    async function fetchListing() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/listings/me`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const listings = await res.json();
          const target = listings.find((l: Record<string, unknown> & { id: string }) => l.id === id);
          if (target) {
            setFormData({
              title: target.title,
              description: target.description || "",
              address: target.address,
              latitude: target.latitude,
              longitude: target.longitude,
              vehicleType: target.vehicleType,
              slotLabel: target.slotLabel || "",
              pricePerHour: target.priceRules?.[0]?.amount ? (target.priceRules[0].amount / 100).toString() : "",
              status: target.status,
              approvalMode: target.approvalMode,
            });
          } else {
            setError("Listing not found");
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [id, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/listings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          pricePerHour: formData.pricePerHour ? Math.round(parseFloat(formData.pricePerHour) * 100) : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.[0]?.message || err.error || "Failed to update listing");
      }

      router.push("/owner/listings");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-void flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-void flex flex-col p-4 lg:p-8">
      <header className="flex items-center gap-3 mb-8">
        <Link href="/owner/listings" className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-white">Edit Listing</h1>
          <p className="text-xs text-muted font-mono">{formData.title}</p>
        </div>
      </header>

      <div className="max-w-2xl w-full">
        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-mono">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">Status</label>
                <select
                  className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="UNPUBLISHED">Unpublished</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">Approval Mode</label>
                <select
                  className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                  value={formData.approvalMode}
                  onChange={(e) => setFormData({ ...formData, approvalMode: e.target.value })}
                >
                  <option value="AUTO">Instant Book (Auto)</option>
                  <option value="MANUAL">Requires Approval (Manual)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">Title</label>
                <input
                  required
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">Full Address</label>
                <input
                  required
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted mb-1.5">Latitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50 font-mono"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-1.5">Longitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50 font-mono"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted mb-1.5">Vehicle Type</label>
                  <select
                    className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  >
                    <option value="FOUR_WHEELER">Four Wheeler</option>
                    <option value="TWO_WHEELER">Two Wheeler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-1.5">Slot Label</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50 font-mono uppercase"
                    value={formData.slotLabel}
                    onChange={(e) => setFormData({ ...formData, slotLabel: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted mb-1.5">Price / Hour (₹)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan/50 font-mono"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <Link href="/owner/listings">
                <button type="button" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                  Cancel
                </button>
              </Link>
              <NeonButton variant="primary" type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : "Save Changes"}
              </NeonButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
