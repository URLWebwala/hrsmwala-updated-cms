import { PaginatedData, ModalState, AuthContext } from '@/types/common';

export interface Branch {
    id: number;
    branch_name: string;
}

export interface Department {
    id: number;
    branch_id: number;
    department_name: string;
}

export interface User {
    id: number;
    name: string;
    avatar?: string;
    is_disable?: number;
}

export interface Designation {
    id: number;
    department_id: number;
    designation_name: string;
}

export interface Termination {
    id: number;
    employee_id: number;
    termination_type_id?: number;
    termination_type?: { id: number; termination_type: string; };
    notice_date?: string;
    termination_date?: string;
    rejoin_date?: string;
    reason: string;
    description?: string;
    document?: string;
    status: string;
}

export interface Employee {
    id: number;
    employee_id: string;
    date_of_birth?: string;
    gender: string;
    shift_id?: number;
    shift?: { id: number; shift_name: string; };
    date_of_joining: string;
    rejoin_date?: string;
    employment_type: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    emergency_contact_name?: string;
    emergency_contact_relationship?: string;
    emergency_contact_number?: string;
    bank_name?: string;
    account_holder_name?: string;
    account_number?: string;
    bank_identifier_code?: string;
    bank_branch?: string;
    tax_payer_id?: string;
    basic_salary?: number;
    hours_per_day?: number;
    days_per_week?: number;
    rate_per_hour?: number;
    user_id?: number;
    user?: User;
    branch_id?: number;
    branch?: Branch;
    department_id?: number;
    department?: Department;
    designation_id?: number;
    designation?: Designation;
    latest_termination?: Termination;
    latestTermination?: Termination;
    created_at: string;
}

export interface CreateEmployeeFormData {
    employee_id: string;
    date_of_birth: string;
    gender: string;
    shift_id: string;
    date_of_joining: string;
    employment_type: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    emergency_contact_name: string;
    emergency_contact_relationship: string;
    emergency_contact_number: string;
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    bank_identifier_code: string;
    bank_branch: string;
    tax_payer_id: string;
    basic_salary: string;
    hours_per_day: string;
    days_per_week: string;
    rate_per_hour: string;
    user_id: string;
    branch_id: string;
    department_id: string;
    designation_id: string;
    documents: any[];
    [key: string]: any;
}

export interface EditEmployeeFormData {
    employee_id: string;
    date_of_birth: string;
    gender: string;
    shift_id: string;
    date_of_joining: string;
    employment_type: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    emergency_contact_name: string;
    emergency_contact_relationship: string;
    emergency_contact_number: string;
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    bank_identifier_code: string;
    bank_branch: string;
    tax_payer_id: string;
    basic_salary: string;
    hours_per_day: string;
    days_per_week: string;
    rate_per_hour: string;
    user_id: string;
    branch_id: string;
    department_id: string;
    designation_id: string;
    documents: any[];
    [key: string]: any;
}

export interface EmployeeFilters {
    employee_id: string;
    user_name: string;
    branch_id: string;
    department_id: string;
    employment_type: string;
    gender: string;
}

export type PaginatedEmployees = PaginatedData<Employee>;
export type EmployeeModalState = ModalState<Employee>;

export interface EmployeesIndexProps {
    employees: PaginatedEmployees;
    auth: AuthContext;
    users: any[];
    branches: any[];
    departments: any[];
    designations: any[];
    terminationtypes?: any[];
    [key: string]: unknown;
}

export interface CreateEmployeeProps {
    onSuccess: () => void;
}

export interface EditEmployeeProps {
    employee: Employee;
    onSuccess: () => void;
}

export interface EmployeeShowProps {
    employee: Employee;
    [key: string]: unknown;
}
