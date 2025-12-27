'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { GtmMotion } from '@/types';

interface CreateGtmMotionFormProps {
    customerDomain: string;
    onMotionCreated: (motion: GtmMotion) => void;
    onCancel: () => void;
}

export function CreateGtmMotionForm({ customerDomain, onMotionCreated, onCancel }: CreateGtmMotionFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        booking_url: '',
        redirect_slug: '',
        messaging: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Please enter a name for the motion');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('gtm_motions')
                .insert({
                    customer_domain: customerDomain,
                    name: formData.name,
                    booking_url: formData.booking_url || null,
                    redirect_slug: formData.redirect_slug || null,
                    messaging: formData.messaging || null,
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                onMotionCreated(data as GtmMotion);
            }
        } catch (error: any) {
            alert('Error creating motion: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-muted/10 p-4 rounded-lg border border-dashed mb-4">
            <h4 className="font-semibold mb-4">Add GTM Motion</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Motion Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Enterprise, Priority"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="booking_url">Booking URL (Optional)</Label>
                        <Input
                            id="booking_url"
                            placeholder="https://cal.com/..."
                            value={formData.booking_url}
                            onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="redirect_slug">Redirect Slug (Optional)</Label>
                        <Input
                            id="redirect_slug"
                            placeholder="e.g. /thank-you"
                            value={formData.redirect_slug}
                            onChange={(e) => setFormData({ ...formData, redirect_slug: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="messaging">Messaging (Optional)</Label>
                    <Textarea
                        id="messaging"
                        placeholder="Custom message for this motion..."
                        value={formData.messaging}
                        onChange={(e) => setFormData({ ...formData, messaging: e.target.value })}
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Motion'}</Button>
                </div>
            </form>
        </div>
    );
}
