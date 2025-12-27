import { supabase } from '@/lib/supabase';
import { CustomerList } from '@/components/CustomerList';
import type { Customer } from '@/types';

export const revalidate = 0; // Disable caching for admin tool

export default async function Home() {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading customers: {error.message}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900">
      <CustomerList customers={(customers as Customer[]) || []} />
    </main>
  );
}
