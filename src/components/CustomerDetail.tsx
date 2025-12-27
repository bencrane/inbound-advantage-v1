'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RuleGroupCard } from './RuleGroupCard';
import { CreateRuleGroupForm } from './CreateRuleGroupForm';
import type { Customer, RuleGroup, Rule } from '@/types';

export type RuleGroupWithRules = RuleGroup & { rules: Rule[] };

interface CustomerDetailProps {
    customer: Customer;
    initialGroups: RuleGroupWithRules[];
}

export function CustomerDetail({ customer, initialGroups }: CustomerDetailProps) {
    const [groups, setGroups] = useState<RuleGroupWithRules[]>(initialGroups);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

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

    // Sort groups by priority (if we had it editable) or created_at for now, or just trust initial order
    // The query should sort them.

    return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customers
                </Link>
            </div>

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

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Workflow Rules</h2>
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
                            <Button variant="link" onClick={() => setIsCreatingGroup(true)}>
                                Create your first group
                            </Button>
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
