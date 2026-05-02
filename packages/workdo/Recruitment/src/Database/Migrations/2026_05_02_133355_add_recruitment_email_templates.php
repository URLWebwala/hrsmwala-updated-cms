<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\EmailTemplate;
use App\Models\EmailTemplateLang;
use App\Models\Notification;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $admin = User::where('type', 'company')->first();
        if (!$admin) return;

        $templates = [
            'Application Received' => [
                'subject' => 'Application Received - {job_title}',
                'variables' => '{"Candidate Name":"candidate_name","Job Title":"job_title","Tracking ID":"tracking_id","Tracking Link":"tracking_link","Company Name":"company_name"}',
                'content' => '<p>Hello {candidate_name},</p><p>Thank you for applying for the <strong>{job_title}</strong> position at <strong>{company_name}</strong>!</p><p>We have successfully received your application and it is now under review.</p><div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"><p><strong>Tracking ID:</strong> {tracking_id}</p><p>You can track your application status here: <a href="{tracking_link}">{tracking_link}</a></p></div><p>Best regards,<br>{company_name}</p>'
            ],
            'Application Status Changed' => [
                'subject' => 'Update on your application - {job_title}',
                'variables' => '{"Candidate Name":"candidate_name","Job Title":"job_title","Status":"status","Tracking ID":"tracking_id","Company Name":"company_name"}',
                'content' => '<p>Hello {candidate_name},</p><p>The status of your application for <strong>{job_title}</strong> at <strong>{company_name}</strong> has been updated.</p><div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;"><p><strong>New Status:</strong> {status}</p><p><strong>Tracking ID:</strong> {tracking_id}</p></div><p>We will keep you informed of any further updates.</p><p>Best regards,<br>{company_name}</p>'
            ],
            'Application Shortlisted' => [
                'subject' => 'Great News! Your application for {job_title} has been shortlisted',
                'variables' => '{"Candidate Name":"candidate_name","Job Title":"job_title","Company Name":"company_name"}',
                'content' => '<p>Hello {candidate_name},</p><p>We are excited to inform you that your application for the <strong>{job_title}</strong> position at <strong>{company_name}</strong> has been shortlisted!</p><p>Our team will reach out to you shortly to schedule the next steps of the recruitment process.</p><p>Best regards,<br>HR Department<br>{company_name}</p>'
            ],
            'Interview Scheduled' => [
                'subject' => 'Interview Invitation: {job_title}',
                'variables' => '{"Candidate Name":"candidate_name","Job Title":"job_title","Interview Date":"interview_date","Interview Time":"interview_time","Interview Mode":"interview_mode","Interview Location":"interview_location","Interview Round":"interview_round","Interviewer Name":"interviewer_name","Meeting Link":"meeting_link","Company Name":"company_name"}',
                'content' => '<p>Hello {candidate_name},</p><p>We are pleased to invite you for an interview for the <strong>{job_title}</strong> position at <strong>{company_name}</strong>.</p><div style="background: #e9ecef; padding: 25px; border-radius: 10px; margin: 20px 0;"><h3 style="margin-top: 0;">Interview Details:</h3><ul style="list-style: none; padding: 0;"><li><strong>Round:</strong> {interview_round}</li><li><strong>Interviewer:</strong> {interviewer_name}</li><li><strong>Date:</strong> {interview_date}</li><li><strong>Time:</strong> {interview_time}</li><li><strong>Mode:</strong> {interview_mode}</li><li><strong>Location/Link:</strong> {interview_location}</li></ul></div><p>Please confirm your availability. We look forward to meeting you!</p><p>Best regards,<br>HR Department<br>{company_name}</p>'
            ],
            'Offer Letter' => [
                'subject' => 'Job Offer: {job_title} at {company_name}',
                'variables' => '{"Candidate Name":"candidate_name","Job Title":"job_title","Company Name":"company_name"}',
                'content' => '<p>Dear {candidate_name},</p><p>We are pleased to offer you the position of <strong>{job_title}</strong> at <strong>{company_name}</strong>!</p><p>We were very impressed with your skills and experience, and we believe you will be a great addition to our team.</p><p>Please find the attached offer letter for more details regarding the terms of your employment.</p><p>We look forward to welcoming you to the team!</p><p>Best regards,<br>{company_name}</p>'
            ],
            'Hired Notification' => [
                'subject' => 'Welcome to {company_name}!',
                'variables' => '{"Candidate Name":"candidate_name","Job Title":"job_title","Company Name":"company_name"}',
                'content' => '<p>Hello {candidate_name},</p><p>Welcome to the team! We are thrilled to have you join <strong>{company_name}</strong> as a <strong>{job_title}</strong>.</p><p>We are looking forward to working with you and seeing the great things we will achieve together.</p><p>Your onboarding process will begin soon. Welcome aboard!</p><p>Best regards,<br>{company_name} Team</p>'
            ],
            'Application Rejected' => [
                'subject' => 'Update on your application for {job_title}',
                'variables' => '{"Candidate Name":"candidate_name","Job Title":"job_title","Company Name":"company_name","Rejection Note":"rejection_note"}',
                'content' => '<p>Hello {candidate_name},</p><p>Thank you for your interest in the <strong>{job_title}</strong> position at <strong>{company_name}</strong> and for taking the time to apply.</p><p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p><div style=\'background: #fdf2f2; padding: 15px; border-radius: 5px; border: 1px solid #fee2e2; margin: 15px 0;\'><p><strong>Note from hiring team:</strong></p><p>{rejection_note}</p></div><p>We appreciate your interest in our company and wish you the best of luck in your job search.</p><p>Best regards,<br>Recruitment Team<br>{company_name}</p>'
            ]
        ];

        foreach ($templates as $name => $data) {
            $template = EmailTemplate::where('name', $name)->where('module_name', 'Recruitment')->first();
            if (!$template) {
                $template = EmailTemplate::create([
                    'name' => $name,
                    'from' => env('APP_NAME', 'HRM'),
                    'module_name' => 'Recruitment',
                    'created_by' => $admin->id,
                    'creator_id' => $admin->id,
                ]);
            }

            $lang = EmailTemplateLang::where('parent_id', $template->id)->where('lang', 'en')->first();
            if (!$lang) {
                EmailTemplateLang::create([
                    'parent_id' => $template->id,
                    'lang' => 'en',
                    'subject' => $data['subject'],
                    'variables' => $data['variables'],
                    'content' => $data['content'],
                ]);
            } else {
                // Update variables and content if it's one of the newly added ones
                $lang->update([
                    'variables' => $data['variables'],
                    'content' => $data['content'],
                ]);
            }

            // Register notification setting
            $ntfy = Notification::where('action', $name)->where('type', 'mail')->where('module', 'Recruitment')->first();
            if (!$ntfy) {
                Notification::create([
                    'action' => $name,
                    'status' => 'on',
                    'permissions' => 'manage-recruitment',
                    'module' => 'Recruitment',
                    'type' => 'mail',
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
