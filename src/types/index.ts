export interface Customer {
    id: string;
    domain: string;
    company_name: string;
    primary_contact_name: string;
    primary_contact_email: string;
    hubspot_access_token: string;
    created_at: string;
    updated_at: string;
}

export type TriggerType = 'Contact created' | 'Form submitted' | 'Deal created' | 'Property changed';

export interface Rule {
    id: string;
    rule_group_id: string;
    name: string;
    trigger_type?: TriggerType;
    field: string;
    operator: string;
    value: string;
    action_value: string;
    priority: number;
    created_at: string;
}

export interface RuleGroup {
    id: string;
    customer_domain: string;
    name: string;
    action_type: 'assign' | 'tag' | 'notify' | 'enroll_sequence';
    evaluation_mode: 'first_match' | 'all_match';
    priority: number;
    created_at: string;
}
