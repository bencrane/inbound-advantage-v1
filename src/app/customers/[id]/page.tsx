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
    // We should treat it as 'domain'.

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

    // Fetch rule groups with nested rules
    const { data: groups, error: groupsError } = await supabase
        .from('rule_groups')
        .select(`
            *,
            rules (*)
        `)
        .eq('customer_domain', id)
        .order('priority', { ascending: true }); // Groups ordered by priority (if we add priority to groups, currently schema has it)

    if (groupsError) {
        console.error('Error fetching groups:', groupsError);
    }

    // Transform null rules to empty array if needed, but Supabase returns empty array for left join usually
    // However, if the join returns null for rules it might be an issue, but standard Supabase select rules(*) returns [] if empty.

    return (
        <main className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900">
            <CustomerDetail
                customer={customer as Customer}
                initialGroups={(groups as unknown as RuleGroupWithRules[]) || []}
            />
        </main>
    );
}
