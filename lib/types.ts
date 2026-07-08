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
  is_completed: boolean;
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
  address: string | null;
  organization: string | null;
  registered_at: string;
  attended: boolean | null;
  passed: boolean | null;
  card_number: string | null;
  card_issued_at: string | null;
  card_expires_at: string | null;
  notes: string | null;
  eval_token: string | null;
  eval_sent_at: string | null;
  eval_submitted?: boolean;
}

export interface Evaluation {
  id: number;
  registration_id: number;
  submitted_at: string;
  inst_q1: string | null; inst_q2: string | null; inst_q3: string | null;
  content_q1: string | null; content_q2: string | null; content_q3: string | null;
  content_q4: string | null; content_q5: string | null;
  skill_q1: string | null; skill_q2: string | null; skill_q3: string | null; skill_q4: string | null;
  comment_learning: string | null; comment_strengths: string | null; comment_future: string | null;
}

export interface ClassWithRegistrations extends CPRClass {
  registrations: Registration[];
}

export interface CardRequest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  class_id: number | null;
  class_title?: string | null;
  class_date?: string | null;
}
