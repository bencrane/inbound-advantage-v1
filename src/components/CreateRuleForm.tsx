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
import type { Rule } from '@/types';

interface CreateRuleFormProps {
    groupId: string;
    onRuleCreated: (newRule: Rule) => void;
}

export function CreateRuleForm({ groupId, onRuleCreated }: CreateRuleFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        trigger_type: '',
        field: '',
        operator: '',
        value: '',
        action_value: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.trigger_type || !formData.field || !formData.operator || !formData.value || !formData.action_value) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Get current max priority for this group to append to the end
            const { data: maxPriorityData } = await supabase
                .from('rules')
                .select('priority')
                .eq('rule_group_id', groupId)
                .order('priority', { ascending: false })
                .limit(1)
                .single();

            const nextPriority = maxPriorityData ? maxPriorityData.priority + 1 : 0;

            const { data, error } = await supabase
                .from('rules')
                .insert({
                    rule_group_id: groupId,
                    name: formData.name,
                    trigger_type: formData.trigger_type,
                    field: formData.field,
                    operator: formData.operator,
                    value: formData.value,
                    action_value: formData.action_value,
                    priority: nextPriority,
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                onRuleCreated(data as Rule);
                setFormData({
                    name: '',
                    trigger_type: '',
                    field: '',
                    operator: '',
                    value: '',
                    action_value: '',
                });
            }
        } catch (error: any) {
            alert('Error creating rule: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Add Workflow Rule</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rule Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Big companies -> Sarah"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full"
                    />
                </div>

                {/* Trigger */}
                <div className="space-y-2">
                    <Label htmlFor="trigger">Trigger</Label>
                    <Select
                        value={formData.trigger_type}
                        onValueChange={(val) => setFormData({ ...formData, trigger_type: val })}
                    >
                        <SelectTrigger id="trigger">
                            <SelectValue placeholder="Select trigger event" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Contact created">Contact created</SelectItem>
                            <SelectItem value="Form submitted">Form submitted</SelectItem>
                            <SelectItem value="Deal created">Deal created</SelectItem>
                            <SelectItem value="Property changed">Property changed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Condition Group */}
                <div className="space-y-3">
                    <div className="flex items-center">
                        <div className="h-px bg-border flex-1" />
                        <span className="px-2 text-xs font-semibold text-muted-foreground uppercase">Condition</span>
                        <div className="h-px bg-border flex-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="field">Field</Label>
                            <Select
                                value={formData.field}
                                onValueChange={(val) => setFormData({ ...formData, field: val })}
                            >
                                <SelectTrigger id="field">
                                    <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="employee_count">Employee Count</SelectItem>
                                    <SelectItem value="location">Location</SelectItem>
                                    <SelectItem value="industry">Industry</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="operator">Operator</Label>
                            <Select
                                value={formData.operator}
                                onValueChange={(val) => setFormData({ ...formData, operator: val })}
                            >
                                <SelectTrigger id="operator">
                                    <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value=">">{'>'} (Greater than)</SelectItem>
                                    <SelectItem value="<">{'<'} (Less than)</SelectItem>
                                    <SelectItem value="=">{'='} (Equals)</SelectItem>
                                    <SelectItem value=">=">{'>='} (Greater/Equal)</SelectItem>
                                    <SelectItem value="<=">{'<='} (Less/Equal)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value">Value</Label>
                            <Input
                                id="value"
                                placeholder="Value"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Group */}
                <div className="space-y-3">
                    <div className="flex items-center">
                        <div className="h-px bg-border flex-1" />
                        <span className="px-2 text-xs font-semibold text-muted-foreground uppercase">Action</span>
                        <div className="h-px bg-border flex-1" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="action_value">Action Value</Label>
                        <Input
                            id="action_value"
                            placeholder="e.g. John Doe, 'competitor' tag"
                            value={formData.action_value}
                            onChange={(e) => setFormData({ ...formData, action_value: e.target.value })}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    Add Rule
                </Button>
            </form>
        </div>
    );
}
