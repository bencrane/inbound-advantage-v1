'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import type { FormRoutingRule, GtmMotion } from '@/types';

interface CreateRoutingRuleFormProps {
    customerDomain: string;
    motions: GtmMotion[];
    onRuleCreated: (rule: FormRoutingRule) => void;
    onCancel: () => void;
}

export function CreateRoutingRuleForm({ customerDomain, motions, onRuleCreated, onCancel }: CreateRoutingRuleFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        scope: 'company',
        size_min: '',
        size_max: '',
        country: '',
        company_type: '',
        is_hot_account: false,
        gtm_motion_id: '',
        priority: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.gtm_motion_id) {
            alert('Please select a GTM Motion');
            return;
        }

        setLoading(true);
        try {
            // Get max priority
            const { data: maxPriorityData } = await supabase
                .from('form_routing_rules')
                .select('priority')
                .eq('customer_domain', customerDomain)
                .order('priority', { ascending: false })
                .limit(1)
                .single();

            const nextPriority = formData.priority || (maxPriorityData ? maxPriorityData.priority + 10 : 10);


            const { data, error } = await supabase
                .from('form_routing_rules')
                .insert({
                    customer_domain: customerDomain,
                    name: formData.name,
                    scope: formData.scope,
                    size_min: formData.size_min ? parseInt(formData.size_min) : null,
                    size_max: formData.size_max ? parseInt(formData.size_max) : null,
                    country: formData.country || null,
                    company_type: formData.company_type || null,
                    is_hot_account: formData.is_hot_account,
                    gtm_motion_id: formData.gtm_motion_id,
                    priority: nextPriority,
                })
                .select(`
                    *,
                    gtm_motion:gtm_motions(*)
                `)
                .single();

            if (error) throw error;
            if (data) {
                onRuleCreated(data as FormRoutingRule);
            }
        } catch (error: any) {
            alert('Error creating rule: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-muted/10 p-4 rounded-lg border border-dashed mb-4">
            <h4 className="font-semibold mb-4">Add Routing Rule</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Rule Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Large Enterprise (US)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="scope">Scope</Label>
                        <Select
                            value={formData.scope}
                            onValueChange={(val) => setFormData({ ...formData, scope: val })}
                        >
                            <SelectTrigger id="scope">
                                <SelectValue placeholder="Select scope" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="company">Company</SelectItem>
                                <SelectItem value="person">Person</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {formData.scope === 'company' && (
                    <div className="space-y-4 border-l-2 border-primary/20 pl-4 py-2">
                        <h5 className="text-sm font-medium text-muted-foreground">Company Conditions</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="size_min">Min Employees</Label>
                                <Input
                                    id="size_min"
                                    type="number"
                                    placeholder="0"
                                    value={formData.size_min}
                                    onChange={(e) => setFormData({ ...formData, size_min: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="size_max">Max Employees</Label>
                                <Input
                                    id="size_max"
                                    type="number"
                                    placeholder="Unlimited"
                                    value={formData.size_max}
                                    onChange={(e) => setFormData({ ...formData, size_max: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    placeholder="e.g. United States"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company_type">Company Type</Label>
                                <Input
                                    id="company_type"
                                    placeholder="e.g. Public Company"
                                    value={formData.company_type}
                                    onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_hot_account"
                                checked={formData.is_hot_account}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_hot_account: checked as boolean })}
                            />
                            <Label htmlFor="is_hot_account">Is Hot Account?</Label>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="gtm_motion">Route to GTM Motion</Label>
                    <Select
                        value={formData.gtm_motion_id}
                        onValueChange={(val) => setFormData({ ...formData, gtm_motion_id: val })}
                    >
                        <SelectTrigger id="gtm_motion" className="border-primary/50">
                            <SelectValue placeholder="Select a motion..." />
                        </SelectTrigger>
                        <SelectContent>
                            {motions.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority">Priority Override (Optional)</Label>
                    <Input
                        id="priority"
                        type="number"
                        className="w-24"
                        placeholder="Auto"
                        value={formData.priority || ''}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Higher numbers processed first.</p>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Rule'}</Button>
                </div>
            </form>
        </div>
    );
}
