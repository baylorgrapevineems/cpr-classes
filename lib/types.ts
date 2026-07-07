export interface CPRClass {
  id: number;
  title: string;
  course_type: string;
  class_date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  address: string | null;
  instructor_name: string | null;
  max_seats: number;
  description: string | null;
  is_public: boolean;
  is_cancelled: boolean;
  created_at: string;
  registered_count?: number;
}

export interface Registration {
  id: number;
  class_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  registered_at: string;
  attended: boolean | null;
  passed: boolean | null;
  card_number: string | null;
  card_issued_at: string | null;
  card_expires_at: string | null;
  notes: string | null;
}

export interface ClassWithRegistrations extends CPRClass {
  registrations: Registration[];
}
