'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { RuleGroup } from '@/types';

interface CreateRuleGroupFormProps {
    customerDomain: string;
    onGroupCreated: (newGroup: RuleGroup) => void;
    onCancel: () => void;
}

export function CreateRuleGroupForm({ customerDomain, onGroupCreated, onCancel }: CreateRuleGroupFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        action_type: 'assign',
        evaluation_mode: 'first_match',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Please enter a group name');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('rule_groups')
                .insert({
                    customer_domain: customerDomain,
                    name: formData.name,
                    action_type: formData.action_type,
                    evaluation_mode: formData.evaluation_mode,
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                onGroupCreated(data as RuleGroup);
                setFormData({
                    name: '',
                    action_type: 'assign',
                    evaluation_mode: 'first_match',
                });
            }
        } catch (error: any) {
            alert('Error creating group: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add Rule Group</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Lead Assignment"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="action_type">Action Type</Label>
                        <Select
                            value={formData.action_type}
                            onValueChange={(val) => setFormData({ ...formData, action_type: val })}
                        >
                            <SelectTrigger id="action_type">
                                <SelectValue placeholder="Select action type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="assign">Assignment</SelectItem>
                                <SelectItem value="tag">Tagging</SelectItem>
                                <SelectItem value="notify">Notify</SelectItem>
                                <SelectItem value="enroll_sequence">Enroll in Sequence</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="evaluation_mode">Evaluation Mode</Label>
                        <Select
                            value={formData.evaluation_mode}
                            onValueChange={(val) => setFormData({ ...formData, evaluation_mode: val })}
                        >
                            <SelectTrigger id="evaluation_mode">
                                <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="first_match">First Match</SelectItem>
                                <SelectItem value="all_match">All Match</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Group'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
