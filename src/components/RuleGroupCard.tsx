'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateRuleForm } from './CreateRuleForm';
import { ChevronDown, ChevronUp, Trash2, GripVertical } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { RuleGroup, Rule } from '@/types';

interface RuleGroupCardProps {
    group: RuleGroup;
    rules: Rule[];
    onRuleCreated: (newRule: Rule) => void;
    onRuleDeleted: (ruleId: string) => void;
}

export function RuleGroupCard({ group, rules, onRuleCreated, onRuleDeleted }: RuleGroupCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isAddingRule, setIsAddingRule] = useState(false);

    // Sort rules by priority
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;

        try {
            const { error } = await supabase.from('rules').delete().eq('id', ruleId);
            if (error) throw error;
            onRuleDeleted(ruleId);
        } catch (error: any) {
            alert('Error deleting rule: ' + error.message);
        }
    };

    return (
        <Card className="mb-6 border-l-4 border-l-primary">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {group.action_type}
                                </Badge>
                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                    {group.evaluation_mode.replace('_', ' ')}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent>
                    <div className="mb-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30px]"></TableHead>
                                    <TableHead>Rule Name</TableHead>
                                    <TableHead>Trigger</TableHead>
                                    <TableHead>Condition</TableHead>
                                    <TableHead>Action Value</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedRules.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-16 text-center text-muted-foreground text-sm">
                                            No rules in this group.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedRules.map((rule) => (
                                        <TableRow key={rule.id}>
                                            <TableCell>
                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                            </TableCell>
                                            <TableCell className="font-medium">{rule.name}</TableCell>
                                            <TableCell>{rule.trigger_type}</TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                                                    {rule.field} {rule.operator} {rule.value}
                                                </span>
                                            </TableCell>
                                            <TableCell>{rule.action_value}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {!isAddingRule ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-dashed"
                            onClick={() => setIsAddingRule(true)}
                        >
                            + Add Rule
                        </Button>
                    ) : (
                        <div className="bg-muted/10 p-4 rounded-lg border border-dashed">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold">New Rule</h4>
                                <Button variant="ghost" size="sm" onClick={() => setIsAddingRule(false)}>
                                    Cancel
                                </Button>
                            </div>
                            <CreateRuleForm
                                groupId={group.id}
                                onRuleCreated={(rule) => {
                                    onRuleCreated(rule);
                                    setIsAddingRule(false);
                                }}
                            />
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
