<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\HtmlString;

class CustomVerifyEmail extends BaseVerifyEmail
{
    use Queueable;

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        if (static::$toMailCallback) {
            return call_user_func(static::$toMailCallback, $notifiable, $verificationUrl);
        }

        return (new MailMessage)
            ->subject(Lang::get('Verify Your Email Address'))
            ->greeting(Lang::get('Hello, ') . $notifiable->name . '!')
            ->line(Lang::get('Thank you for joining HRMswala SaaS. We are excited to have you on board!'))
            ->line(Lang::get('To get started, please confirm your email address by clicking the button below.'))
            ->action(Lang::get('Verify Email Address'), $verificationUrl)
            ->line(Lang::get('If you did not create an account, no further action is required.'))
            ->line(Lang::get('Best regards,'))
            ->salutation(new HtmlString('<strong>' . config('app.name') . ' Team</strong>'));
    }
}
