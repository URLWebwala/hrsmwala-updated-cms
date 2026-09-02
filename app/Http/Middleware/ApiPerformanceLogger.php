<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\ApiLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

class ApiPerformanceLogger
{
    /**
     * Paths/endpoints to ignore from logging.
     */
    protected array $ignoredPaths = [
        'build/*',
        'storage/*',
        'assets/*',
        'up',
        'livewire/*',
        '__clockwork/*',
        '_ignition/*',
        'api/notifications/count',
    ];

    /**
     * Fields to redact/mask from request payloads for security.
     */
    protected array $sensitiveKeys = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
        'token',
        'access_token',
        'refresh_token',
        'authorization',
        'secret',
        'api_key',
        'credit_card',
        'card_number',
        'cvv',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldIgnore($request)) {
            return $next($request);
        }

        $startTime = microtime(true);
        $exception = null;
        $response = null;

        try {
            $response = $next($request);
        } catch (Throwable $e) {
            $exception = $e;
            throw $e;
        } finally {
            $durationMs = round((microtime(true) - $startTime) * 1000, 2);
            $this->logRequest($request, $response, $durationMs, $exception);
        }

        return $response;
    }

    /**
     * Determine if the request should be skipped.
     */
    protected function shouldIgnore(Request $request): bool
    {
        foreach ($this->ignoredPaths as $pattern) {
            if ($request->is($pattern)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Record log entry to database.
     */
    protected function logRequest(Request $request, ?Response $response, float $durationMs, ?Throwable $exception = null): void
    {
        try {
            $statusCode = 500;
            $statusText = 'Internal Server Error';

            if ($response) {
                $statusCode = $response->getStatusCode();
                if (method_exists($response, 'statusText')) {
                    $statusText = Response::$statusTexts[$statusCode] ?? (string)$statusCode;
                }
            } elseif ($exception) {
                $statusText = 'Exception: ' . get_class($exception);
            }

            $isSlow = $durationMs >= 800; // Flag as slow if > 800ms
            $isFailed = $statusCode >= 400 || $exception !== null;

            // Log all API requests, slow requests, and failures/crashes
            // To ensure database doesn't bloat with trivial fast 200 web page clicks, prioritize all /api/* requests and any slow/failed requests
            $isApiRoute = $request->is('api/*') || $request->expectsJson() || $request->isXmlHttpRequest();

            if (!$isApiRoute && !$isSlow && !$isFailed) {
                return; // Skip normal fast web page loads
            }

            $user = $request->user() ?: Auth::user();

            $sanitizedBody = $this->sanitizePayload($request->all());
            $sanitizedHeaders = $this->sanitizeHeaders($request->headers->all());

            $responseBody = null;
            if ($response) {
                $content = $response->getContent();
                if ($content && is_string($content)) {
                    // Truncate response to maximum 5KB for database safety
                    $responseBody = mb_substr($content, 0, 5000);
                }
            }

            $errorMessage = null;
            $errorTrace = null;

            if ($exception) {
                $errorMessage = $exception->getMessage();
                $errorTrace = $exception->getTraceAsString();
            } elseif ($statusCode >= 400 && $response) {
                // If JSON response contains message or errors, extract it
                $decoded = json_decode($response->getContent(), true);
                if (is_array($decoded)) {
                    $errorMessage = $decoded['message'] ?? ($decoded['error'] ?? null);
                }
            }

            ApiLog::create([
                'method' => strtoupper($request->method()),
                'url' => mb_substr($request->fullUrl(), 0, 1000),
                'route_name' => $request->route()?->getName(),
                'status_code' => $statusCode,
                'status_text' => $statusText,
                'duration_ms' => $durationMs,
                'ip_address' => $request->ip(),
                'user_id' => $user?->id,
                'user_name' => $user?->name,
                'user_email' => $user?->email,
                'request_headers' => $sanitizedHeaders,
                'request_body' => $sanitizedBody,
                'response_body' => $responseBody,
                'error_message' => $errorMessage,
                'error_trace' => $errorTrace,
                'is_slow' => $isSlow,
                'is_failed' => $isFailed,
            ]);
        } catch (Throwable $loggingError) {
            Log::warning('ApiPerformanceLogger failed to record log: ' . $loggingError->getMessage());
        }
    }

    /**
     * Recursively mask sensitive payload fields.
     */
    protected function sanitizePayload(mixed $data): mixed
    {
        if (!is_array($data)) {
            return $data;
        }

        $sanitized = [];
        foreach ($data as $key => $value) {
            if (in_array(strtolower((string)$key), $this->sensitiveKeys, true)) {
                $sanitized[$key] = '******** [REDACTED]';
            } elseif (is_array($value)) {
                $sanitized[$key] = $this->sanitizePayload($value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    /**
     * Filter and mask sensitive headers.
     */
    protected function sanitizeHeaders(array $headers): array
    {
        $safe = [];
        $keepHeaders = ['host', 'user-agent', 'accept', 'content-type', 'referer', 'x-requested-with', 'origin', 'authorization'];

        foreach ($headers as $key => $values) {
            $lowerKey = strtolower($key);
            if (!in_array($lowerKey, $keepHeaders, true)) {
                continue;
            }

            if ($lowerKey === 'authorization') {
                $safe[$key] = 'Bearer ******** [REDACTED]';
            } else {
                $safe[$key] = is_array($values) ? implode(', ', $values) : $values;
            }
        }

        return $safe;
    }
}
