<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\EmailTemplate;
use App\Models\Setting;
use Workdo\LandingPage\Models\CustomPage;
use Workdo\LandingPage\Models\LandingPageSetting;
use Workdo\LandingPage\Models\MarketplaceSetting;

class BrandReplaceCommand extends Command
{
    protected $signature = 'brand:replace {from=ERPGo SaaS} {to=Hrmswala SaaS} {--dry-run}';

    protected $description = 'Replace stored brand strings in DB (landing page / marketplace / custom pages).';

    public function handle(): int
    {
        $from = (string) $this->argument('from');
        $to = (string) $this->argument('to');
        $dryRun = (bool) $this->option('dry-run');

        $this->info("Replacing '{$from}' => '{$to}'" . ($dryRun ? ' (dry-run)' : ''));

        $replace = function ($value) use ($from, $to) {
            if (is_string($value)) {
                return str_replace($from, $to, $value);
            }

            if (is_array($value)) {
                foreach ($value as $k => $v) {
                    $value[$k] = ($this->replaceAny($v, $from, $to));
                }
                return $value;
            }

            return $value;
        };

        $updated = [
            'settings' => 0,
            'email_templates' => 0,
            'landing_page_settings' => 0,
            'marketplace_settings' => 0,
            'custom_pages' => 0,
        ];

        DB::transaction(function () use ($from, $to, $dryRun, &$updated) {
            $settings = Setting::all();
            foreach ($settings as $s) {
                $newValue = $this->replaceAny($s->value, $from, $to);
                if ($newValue !== $s->value) {
                    $s->value = $newValue;
                    if (!$dryRun) {
                        $s->save();
                    }
                    $updated['settings']++;
                }
            }

            $templates = EmailTemplate::all();
            foreach ($templates as $t) {
                $newFrom = $this->replaceAny($t->from, $from, $to);
                if ($newFrom !== $t->from) {
                    $t->from = $newFrom;
                    if (!$dryRun) {
                        $t->save();
                    }
                    $updated['email_templates']++;
                }
            }

            $lp = LandingPageSetting::first();
            if ($lp) {
                $lp->company_name = $this->replaceAny($lp->company_name, $from, $to);
                $lp->config_sections = $this->replaceAny($lp->config_sections, $from, $to);
                if (!$dryRun) {
                    $lp->save();
                }
                $updated['landing_page_settings'] = 1;
            }

            $mps = MarketplaceSetting::all();
            foreach ($mps as $mp) {
                $mp->title = $this->replaceAny($mp->title, $from, $to);
                $mp->subtitle = $this->replaceAny($mp->subtitle, $from, $to);
                $mp->config_sections = $this->replaceAny($mp->config_sections, $from, $to);
                if (!$dryRun) {
                    $mp->save();
                }
                $updated['marketplace_settings']++;
            }

            $pages = CustomPage::all();
            foreach ($pages as $p) {
                $p->title = $this->replaceAny($p->title, $from, $to);
                $p->content = $this->replaceAny($p->content, $from, $to);
                $p->meta_title = $this->replaceAny($p->meta_title, $from, $to);
                $p->meta_description = $this->replaceAny($p->meta_description, $from, $to);
                if (!$dryRun) {
                    $p->save();
                }
                $updated['custom_pages']++;
            }
        });

        $this->line('Updated counts:');
        foreach ($updated as $k => $v) {
            $this->line("- {$k}: {$v}");
        }

        return self::SUCCESS;
    }

    private function replaceAny($value, string $from, string $to)
    {
        if (is_string($value)) {
            return str_replace($from, $to, $value);
        }

        if (is_array($value)) {
            foreach ($value as $k => $v) {
                $value[$k] = $this->replaceAny($v, $from, $to);
            }
            return $value;
        }

        return $value;
    }
}

