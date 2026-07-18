export type Role = 'Super Admin' | 'HR Manager' | 'Employee';
export type Status = 'Active' | 'Inactive';

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: Status;
  role: Role;
  reportingManager?: { _id: string; name: string; employeeId: string; designation: string } | string | null;
  profileImage?: string;
  createdAt?: string;
}

export interface OrgNode extends Omit<Employee, 'reportingManager'> {
  directReports: OrgNode[];
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCount: number;
  byDepartment: { department: string; count: number }[];
}

export interface PaginatedEmployees {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Employee[];
}
