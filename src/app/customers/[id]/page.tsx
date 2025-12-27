import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CustomerDetail, RuleGroupWithRules } from '@/components/CustomerDetail';
import type { Customer } from '@/types';

// Disable caching for admin tool
export const revalidate = 0;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CustomerPage({ params }: PageProps) {
    const { id } = await params;
    // id is now the domain because of the folder structure [id], effectively it captures the path segment.

    // Fetch customer
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('domain', id)
        .single();

    if (customerError || !customer) {
        console.error('Error fetching customer:', customerError);
        notFound();
    }

    // Parallel fetching for performance
    const [groupsRes, motionsRes, routingRulesRes] = await Promise.all([
        supabase
            .from('rule_groups')
            .select(`*, rules (*)`)
            .eq('customer_domain', id)
            .order('priority', { ascending: true }),
        supabase
            .from('gtm_motions')
            .select('*')
            .eq('customer_domain', id)
            .order('created_at', { ascending: true }),
        supabase
            .from('form_routing_rules')
            .select(`
                *,
                gtm_motion:gtm_motions(name)
            `)
            .eq('customer_domain', id)
            .order('priority', { ascending: false }), // Highest priority first
    ]);

    if (groupsRes.error) console.error('Error fetching groups:', groupsRes.error);
    if (motionsRes.error) console.error('Error fetching motions:', motionsRes.error);
    if (routingRulesRes.error) console.error('Error fetching routing rules:', routingRulesRes.error);

    return (
        <main className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900">
            <CustomerDetail
                customer={customer as Customer}
                initialGroups={(groupsRes.data as unknown as RuleGroupWithRules[]) || []}
                initialMotions={(motionsRes.data as any[]) || []}
                initialRoutingRules={(routingRulesRes.data as any[]) || []}
            />
        </main>
    );
}
