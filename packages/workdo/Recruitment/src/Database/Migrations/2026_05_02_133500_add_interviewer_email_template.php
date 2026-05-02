<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\EmailTemplate;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $template = [
            'name' => 'Interview Assigned to Interviewer',
            'from' => 'Recruitment',
            'content' => '
                <p>Hello {interviewer_name},</p>
                <p>You have been assigned to conduct an interview for the position of <strong>{job_title}</strong>.</p>
                
                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Interview Details:</h3>
                    <p><strong>Candidate:</strong> {candidate_name}</p>
                    <p><strong>Date:</strong> {interview_date}</p>
                    <p><strong>Time:</strong> {interview_time}</p>
                    <p><strong>Round(s):</strong> {interview_rounds}</p>
                    <p><strong>Mode:</strong> {interview_mode}</p>
                    <p><strong>Location/Link:</strong> {interview_location}</p>
                </div>

                <div style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Candidate Information:</h3>
                    <p><strong>Email:</strong> {candidate_email}</p>
                    <p><strong>Phone:</strong> {candidate_phone}</p>
                    <p><strong>Experience:</strong> {candidate_experience} years</p>
                    <p><strong>Skills:</strong> {candidate_skills}</p>
                </div>

                <p>Please review the candidate profile and prepare accordingly.</p>
                <p>Best regards,<br>HR Department<br>{company_name}</p>
            ',
            'variables' => '{interviewer_name},{candidate_name},{candidate_email},{candidate_phone},{candidate_experience},{candidate_skills},{job_title},{interview_date},{interview_time},{interview_rounds},{interview_mode},{interview_location},{company_name}',
            'module' => 'Recruitment',
            'created_by' => 1,
        ];

        // Register the template type if it doesn\'t exist
        $templateObj = EmailTemplate::firstOrCreate(
            ['name' => $template['name']],
            [
                'from' => $template['from'],
                'module' => $template['module'],
                'created_by' => $template['created_by']
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to delete templates usually
    }
};
