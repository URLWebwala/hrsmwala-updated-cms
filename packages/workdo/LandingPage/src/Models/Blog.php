<?php

namespace Workdo\LandingPage\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Blog extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'category',
        'author_name',
        'content',
        'image',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'read_count',
        'is_active',
        'published_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected $appends = [
        'image_url',
    ];

    public function reads(): HasMany
    {
        return $this->hasMany(BlogRead::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image)) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        $path = ltrim((string) $this->image, '/');

        if (str_starts_with($path, 'storage/')) {
            return rtrim(url('/'), '/') . '/' . $path;
        }

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->url($path);
        }

        if (!str_contains($path, '/')) {
            foreach (['blogs/', 'media/'] as $prefix) {
                $candidatePath = $prefix . $path;
                if (Storage::disk('public')->exists($candidatePath)) {
                    return Storage::disk('public')->url($candidatePath);
                }
            }
        }

        return rtrim(url('/'), '/') . '/storage/' . $path;
    }
}
