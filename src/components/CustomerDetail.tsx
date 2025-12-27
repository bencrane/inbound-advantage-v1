'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RuleGroupCard } from './RuleGroupCard';
import { CreateRuleGroupForm } from './CreateRuleGroupForm';
import { CreateGtmMotionForm } from './CreateGtmMotionForm';
import { CreateRoutingRuleForm } from './CreateRoutingRuleForm';
import type { Customer, RuleGroup, Rule, GtmMotion, FormRoutingRule } from '@/types';

export type RuleGroupWithRules = RuleGroup & { rules: Rule[] };

interface CustomerDetailProps {
    customer: Customer;
    initialGroups: RuleGroupWithRules[];
    initialMotions: GtmMotion[];
    initialRoutingRules: FormRoutingRule[];
}

export function CustomerDetail({ customer, initialGroups, initialMotions, initialRoutingRules }: CustomerDetailProps) {
    const [groups, setGroups] = useState<RuleGroupWithRules[]>(initialGroups);
    const [motions, setMotions] = useState<GtmMotion[]>(initialMotions);
    const [routingRules, setRoutingRules] = useState<FormRoutingRule[]>(initialRoutingRules);

    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [isCreatingMotion, setIsCreatingMotion] = useState(false);
    const [isCreatingRoutingRule, setIsCreatingRoutingRule] = useState(false);

    // --- Handlers: Workflow Rules ---
    const handleGroupCreated = (newGroup: RuleGroup) => {
        setGroups([...groups, { ...newGroup, rules: [] }]);
        setIsCreatingGroup(false);
    };

    const handleRuleCreated = (newRule: Rule) => {
        setGroups(
            groups.map((group) => {
                if (group.id === newRule.rule_group_id) {
                    return { ...group, rules: [...group.rules, newRule] };
                }
                return group;
            })
        );
    };

    const handleRuleDeleted = (ruleId: string) => {
        setGroups(
            groups.map((group) => ({
                ...group,
                rules: group.rules.filter((r) => r.id !== ruleId),
            }))
        );
    };

    // --- Handlers: GTM Motions ---
    const handleMotionCreated = (newMotion: GtmMotion) => {
        setMotions([...motions, newMotion]);
        setIsCreatingMotion(false);
    };

    const handleDeleteMotion = async (motionId: string) => {
        if (!confirm('Are you sure? This will fail if any rules currently link to this motion.')) return;
        try {
            const { error } = await supabase.from('gtm_motions').delete().eq('id', motionId);
            if (error) throw error;
            setMotions(motions.filter(m => m.id !== motionId));
        } catch (error: any) {
            alert('Error deleting motion: ' + error.message);
        }
    };

    // --- Handlers: Form Routing Rules ---
    const handleRoutingRuleCreated = (newRule: FormRoutingRule) => {
        // Since we insert with high priority first, we can just sort locally or re-fetch.
        // For simple UI, we'll prepend it if it's high priority, but complex sort is better.
        // Let's just add it and sort the array by priority desc
        const updatedRules = [...routingRules, newRule].sort((a, b) => b.priority - a.priority);
        setRoutingRules(updatedRules);
        setIsCreatingRoutingRule(false);
    };

    const handleDeleteRoutingRule = async (ruleId: string) => {
        if (!confirm('Delete this routing rule?')) return;
        try {
            const { error } = await supabase.from('form_routing_rules').delete().eq('id', ruleId);
            if (error) throw error;
            setRoutingRules(routingRules.filter(r => r.id !== ruleId));
        } catch (error: any) {
            alert('Error deleting rule: ' + error.message);
        }
    };


    return (
        <div className="max-w-4xl mx-auto mt-8 px-4 pb-20">
            {/* Header / Nav */}
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customers
                </Link>
            </div>

            {/* Customer Info Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl">{customer.company_name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Domain</p>
                            <p className="font-medium">{customer.domain}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Primary Contact</p>
                            <p className="font-medium">
                                {customer.primary_contact_name} ({customer.primary_contact_email})
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 1: GTM MOTIONS */}
            <div className="space-y-6 mb-12">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">GTM Motions</h2>
                    {!isCreatingMotion && (
                        <Button onClick={() => setIsCreatingMotion(true)} variant="secondary">
                            + Add Motion
                        </Button>
                    )}
                </div>

                {isCreatingMotion && (
                    <CreateGtmMotionForm
                        customerDomain={customer.domain}
                        onMotionCreated={handleMotionCreated}
                        onCancel={() => setIsCreatingMotion(false)}
                    />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {motions.length === 0 && !isCreatingMotion ? (
                        <div className="col-span-2 text-center py-6 bg-slate-50 rounded-lg border border-dashed text-muted-foreground">
                            No GTM Motions defined. Add one to start (e.g. Enterprise).
                        </div>
                    ) : (
                        motions.map(motion => (
                            <Card key={motion.id} className="relative">
                                <CardContent className="pt-6">
                                    <div className="absolute top-4 right-4">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMotion(motion.id)} className="h-6 w-6 text-muted-foreground hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">{motion.name}</h3>
                                    <div className="text-sm space-y-1 text-muted-foreground">
                                        {motion.redirect_slug && <p>Redirect: <span className="font-mono text-xs bg-muted px-1 rounded">{motion.redirect_slug}</span></p>}
                                        {motion.booking_url && <p>Booking: <span className="text-blue-600 underline text-xs">{motion.booking_url}</span></p>}
                                        {motion.messaging && <p className="italic mt-2">"{motion.messaging}"</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>


            {/* SECTION 2: FORM ROUTING RULES */}
            <div className="space-y-6 mb-12">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Form Routing Rules</h2>
                    {!isCreatingRoutingRule && (
                        <Button onClick={() => setIsCreatingRoutingRule(true)} variant="secondary" disabled={motions.length === 0}>
                            + Add Routing Rule
                        </Button>
                    )}
                </div>

                {motions.length === 0 && (
                    <p className="text-sm text-amber-600">You must create at least one GTM Motion before creating routing rules.</p>
                )}

                {isCreatingRoutingRule && (
                    <CreateRoutingRuleForm
                        customerDomain={customer.domain}
                        motions={motions}
                        onRuleCreated={handleRoutingRuleCreated}
                        onCancel={() => setIsCreatingRoutingRule(false)}
                    />
                )}

                <div className="space-y-3">
                    {routingRules.length === 0 && !isCreatingRoutingRule ? (
                        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed text-muted-foreground">
                            No routing rules configured.
                        </div>
                    ) : (
                        routingRules.map(rule => (
                            <div key={rule.id} className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="font-mono text-xs">{rule.priority}</Badge>
                                        <span className="font-medium">{rule.name || 'Untitled Rule'}</span>
                                        <Badge variant={rule.scope === 'company' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                                            {rule.scope}
                                        </Badge>
                                        {rule.is_hot_account && <Badge variant="destructive" className="text-[10px]">HOT</Badge>}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                                        <span>If match:</span>
                                        {rule.company_type && <Badge variant="outline" className="text-xs font-normal bg-muted/50">Type: {rule.company_type}</Badge>}
                                        {rule.country && <Badge variant="outline" className="text-xs font-normal bg-muted/50">Country: {rule.country}</Badge>}
                                        {(rule.size_min || rule.size_max) && (
                                            <Badge variant="outline" className="text-xs font-normal bg-muted/50">
                                                Size: {rule.size_min || 0} - {rule.size_max || '∞'}
                                            </Badge>
                                        )}
                                        {/* Fallback description if no conditions */}
                                        {!rule.company_type && !rule.country && !rule.size_min && !rule.size_max && !rule.is_hot_account && (
                                            <span className="italic">Always matches scope</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground block uppercase tracking-wider">Route To</span>
                                        <span className="font-semibold text-primary">{(rule.gtm_motion as any)?.name || 'Unknown Motion'}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRoutingRule(rule.id)} className="text-muted-foreground hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SECTION 3: WORKFLOW RULES (Existing) */}
            <div className="space-y-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Workflow Rules</h2>
                        <p className="text-sm text-muted-foreground">Post-submission CRM actions.</p>
                    </div>

                    {!isCreatingGroup && (
                        <Button onClick={() => setIsCreatingGroup(true)}>
                            + Add Rule Group
                        </Button>
                    )}
                </div>

                {isCreatingGroup && (
                    <CreateRuleGroupForm
                        customerDomain={customer.domain}
                        onGroupCreated={handleGroupCreated}
                        onCancel={() => setIsCreatingGroup(false)}
                    />
                )}

                <div className="space-y-4">
                    {groups.length === 0 && !isCreatingGroup ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No rule groups defined.</p>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <RuleGroupCard
                                key={group.id}
                                group={group}
                                rules={group.rules}
                                onRuleCreated={handleRuleCreated}
                                onRuleDeleted={handleRuleDeleted}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
