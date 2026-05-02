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
            'Application Status Changed' => [
                'subject' => 'Update on your application - {job_title}',
                'variables' => '{
                    "Candidate Name": "candidate_name",
                    "Job Title": "job_title",
                    "Status": "status",
                    "Tracking ID": "tracking_id",
                    "Company Name": "company_name"
                  }',
                'content' => '<p>Hello {candidate_name},</p><p>The status of your application for <strong>{job_title}</strong> at <strong>{company_name}</strong> has been updated.</p><div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;"><p><strong>New Status:</strong> {status}</p><p><strong>Tracking ID:</strong> {tracking_id}</p></div><p>We will keep you informed of any further updates.</p><p>Best regards,<br>{company_name}</p>'
            ],
            'Interview Scheduled' => [
                'subject' => 'Interview Invitation: {job_title}',
                'variables' => '{
                    "Candidate Name": "candidate_name",
                    "Job Title": "job_title",
                    "Interview Date": "interview_date",
                    "Interview Time": "interview_time",
                    "Interview Mode": "interview_mode",
                    "Interview Location": "interview_location",
                    "Interview Round": "interview_round",
                    "Meeting Link": "meeting_link",
                    "Company Name": "company_name"
                  }',
                'content' => '<p>Hello {candidate_name},</p><p>We are pleased to invite you for an interview for the <strong>{job_title}</strong> position at <strong>{company_name}</strong>.</p><div style="background: #e9ecef; padding: 25px; border-radius: 10px; margin: 20px 0;"><h3 style="margin-top: 0;">Interview Details:</h3><ul style="list-style: none; padding: 0;"><li><strong>Round:</strong> {interview_round}</li><li><strong>Date:</strong> {interview_date}</li><li><strong>Time:</strong> {interview_time}</li><li><strong>Mode:</strong> {interview_mode}</li><li><strong>Location/Link:</strong> {interview_location}</li></ul>{meeting_link !== "-" ? "<p><strong>Meeting Link:</strong> <a href=\'{meeting_link}\'>{meeting_link}</a></p>" : ""}</div><p>Please confirm your availability. We look forward to meeting you!</p><p>Best regards,<br>HR Department<br>{company_name}</p>'
            ]
        ];

        foreach ($templates as $name => $data) {
            $exists = EmailTemplate::where('name', $name)->where('module_name', 'Recruitment')->exists();
            if (!$exists) {
                $template = EmailTemplate::create([
                    'name' => $name,
                    'from' => env('APP_NAME', 'HRM'),
                    'module_name' => 'Recruitment',
                    'created_by' => $admin->id,
                    'creator_id' => $admin->id,
                ]);

                EmailTemplateLang::create([
                    'parent_id' => $template->id,
                    'lang' => 'en',
                    'subject' => $data['subject'],
                    'variables' => $data['variables'],
                    'content' => $data['content'],
                ]);
            }

            // Register notification setting
            $ntfy = Notification::where('action', $name)->where('type', 'mail')->where('module', 'Recruitment')->exists();
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
