export interface Scholarship {
  id: string;
  initials: string;
  name: string;
  program: string;
  school: string;
  raised: number;
  target: number;
  deadline: string;
  color: string;
  verified: boolean;
  studentAddress: string;
}

export const scholarships: Scholarship[] = []
