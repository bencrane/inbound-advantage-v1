'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Customer } from '@/types';

interface CustomerListProps {
    customers: Customer[];
}

export function CustomerList({ customers }: CustomerListProps) {
    const [search, setSearch] = useState('');

    const filteredCustomers = customers.filter((customer) => {
        const term = search.toLowerCase();
        return (
            customer.company_name.toLowerCase().includes(term) ||
            customer.primary_contact_name?.toLowerCase().includes(term) ||
            customer.domain?.toLowerCase().includes(term)
        );
    });

    return (
        <Card className="w-full max-w-4xl mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Inbound Advantage Customers</CardTitle>
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead>Domain</TableHead>
                                <TableHead>Primary Contact</TableHead>
                                <TableHead>Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.domain} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <Link href={`/customers/${customer.domain}`} className="block w-full h-full">
                                                {customer.company_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/customers/${customer.domain}`} className="block w-full h-full">
                                                {customer.domain}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/customers/${customer.domain}`} className="block w-full h-full">
                                                {customer.primary_contact_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/customers/${customer.domain}`} className="block w-full h-full">
                                                {customer.primary_contact_email}
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
