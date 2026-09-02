<?php

namespace App\Http\Controllers;

use App\Models\ApiLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApiLogController extends Controller
{
    public function index(Request $request)
    {
        // Allow superadmin or users with manage permissions
        if (Auth::user()->type !== 'superadmin' && !Auth::user()->can('manage-settings')) {
            return redirect()->back()->with('error', __('Permission denied. Only Super Admin can view API Logs.'));
        }

        $query = ApiLog::query();

        // Filter by Search Query
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('url', 'like', "%{$search}%")
                  ->orWhere('error_message', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('user_email', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('route_name', 'like', "%{$search}%");
            });
        }

        // Filter by Type: all, errors, crashes, slow, success
        $type = $request->input('type', 'all');
        if ($type === 'errors') {
            $query->where(function ($q) {
                $q->where('status_code', '>=', 400)->orWhere('is_failed', true);
            });
        } elseif ($type === 'crashes') {
            $query->where(function ($q) {
                $q->where('status_code', '>=', 500)->orWhereNotNull('error_message');
            });
        } elseif ($type === 'slow') {
            $query->where(function ($q) {
                $q->where('duration_ms', '>=', 800)->orWhere('is_slow', true);
            });
        } elseif ($type === 'success') {
            $query->where('status_code', '<', 400)->where('is_failed', false);
        }

        // Filter by HTTP Method
        if ($request->filled('method') && $request->method !== 'all') {
            $query->where('method', strtoupper($request->method));
        }

        // Filter by Status Code
        if ($request->filled('status_code') && $request->status_code !== 'all') {
            $query->where('status_code', (int)$request->status_code);
        }

        // Filter by Date
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Calculate KPI Stats (using base table for quick aggregate)
        $totalLogs = ApiLog::count();
        $totalErrors = ApiLog::where(function ($q) {
            $q->where('status_code', '>=', 400)->orWhere('is_failed', true);
        })->count();
        $totalCrashes = ApiLog::where(function ($q) {
            $q->where('status_code', '>=', 500)->orWhereNotNull('error_message');
        })->count();
        $totalSlow = ApiLog::where(function ($q) {
            $q->where('duration_ms', '>=', 800)->orWhere('is_slow', true);
        })->count();
        $avgDuration = round((float)ApiLog::avg('duration_ms'), 2);
        $maxDuration = round((float)ApiLog::max('duration_ms'), 2);

        // Sorting & Pagination
        $sortField = $request->input('sort', 'id');
        $sortDirection = $request->input('direction', 'desc');
        $allowedSorts = ['id', 'method', 'status_code', 'duration_ms', 'created_at', 'ip_address'];
        if (!in_array($sortField, $allowedSorts, true)) {
            $sortField = 'id';
        }

        $perPage = (int)$request->input('per_page', 15);
        if ($perPage < 5 || $perPage > 100) {
            $perPage = 15;
        }

        $logs = $query->orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('api-logs/index', [
            'logs' => $logs,
            'stats' => [
                'total_logs' => $totalLogs,
                'total_errors' => $totalErrors,
                'total_crashes' => $totalCrashes,
                'total_slow' => $totalSlow,
                'avg_duration_ms' => $avgDuration,
                'max_duration_ms' => $maxDuration,
            ],
            'filters' => [
                'search' => $request->input('search', ''),
                'type' => $type,
                'method' => $request->input('method', ''),
                'status_code' => $request->input('status_code', ''),
                'date' => $request->input('date', ''),
                'sort' => $sortField,
                'direction' => $sortDirection,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function destroy(ApiLog $apiLog)
    {
        if (Auth::user()->type !== 'superadmin' && !Auth::user()->can('manage-settings')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $apiLog->delete();
        return redirect()->back()->with('success', __('API Log entry deleted successfully.'));
    }

    public function clear(Request $request)
    {
        if (Auth::user()->type !== 'superadmin' && !Auth::user()->can('manage-settings')) {
            return redirect()->back()->with('error', __('Permission denied.'));
        }

        $days = $request->input('days');
        if ($days && is_numeric($days)) {
            $cutoff = Carbon::now()->subDays((int)$days);
            ApiLog::where('created_at', '<', $cutoff)->delete();
            return redirect()->back()->with('success', __("API Logs older than :days days cleared successfully.", ['days' => $days]));
        }

        ApiLog::truncate();
        return redirect()->back()->with('success', __('All API Logs cleared successfully.'));
    }
}
