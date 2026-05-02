import { PaginatedData, ModalState, AuthContext } from '@/types/common';

export interface Candidate {
    id: number;
    name?: string;
    first_name?: string;
    last_name?: string;
}

export interface JobPosting {
    id: number;
    name?: string;
    title?: string;
}

export interface InterviewRound {
    id: number;
    name: string;
}

export interface InterviewType {
    id: number;
    name: string;
}

export interface Interview {
    id: number;
    scheduled_date: any;
    scheduled_time: any;
    duration?: number;
    location?: string;
    meeting_link?: any;
    interview_mode?: string;
    interviewers?: string;
    interviewer_ids?: any;
    interviewer_names?: string;
    status: any;
    feedback_submitted?: any;
    candidate_id?: number;
    candidate?: Candidate;
    job_id?: number;
    jobPosting?: JobPosting;
    job_posting?: JobPosting;
    round_id?: number;
    round_ids?: any;
    round_names?: string;
    interviewRound?: InterviewRound;
    interview_round?: InterviewRound;
    interview_type_id?: number;
    interviewType?: InterviewType;
    interview_type?: InterviewType;
    created_at: string;
}

export interface CreateInterviewFormData {
    scheduled_date: any;
    scheduled_time: any;
    duration: string;
    location: string;
    meeting_link: any;
    interview_mode: string;
    interviewer_ids: string[];
    status: string;
    feedback_submitted: boolean;
    candidate_id: string;
    job_id: string;
    round_id: string;
    round_ids: string[];
    interview_type_id: string;
    sync_to_google_calendar: boolean;
}

export interface EditInterviewFormData {
    scheduled_date: any;
    scheduled_time: any;
    duration: string;
    location: string;
    meeting_link: any;
    interview_mode: string;
    interviewer_ids: string[];
    status: string;
    feedback_submitted: boolean;
    candidate_id: string;
    job_id: string;
    round_id: string;
    round_ids: string[];
    interview_type_id: string;
}

export interface InterviewFilters {
    location: string;
    interview_date: string;
    feedback: string;
    status: string;
    interview_type_id: string;
}

export type PaginatedInterviews = PaginatedData<Interview>;
export type InterviewModalState = ModalState<Interview>;

export interface InterviewsIndexProps {
    interviews: PaginatedInterviews;
    auth: AuthContext;
    candidates: any[];
    jobpostings: any[];
    interviewrounds: any[];
    interviewtypes: any[];
    [key: string]: unknown;
}

export interface CreateInterviewProps {
    onSuccess: () => void;
    candidateId?: string | number;
}

export interface EditInterviewProps {
    interview: Interview;
    onSuccess: () => void;
}

export interface InterviewShowProps {
    interview: Interview;
    [key: string]: unknown;
}