<?php

namespace Workdo\Account\Http\Controllers;

use App\Models\SalesInvoiceReturn;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Workdo\Account\Models\Customer;
use Workdo\Account\Models\Vendor;
use Workdo\Account\Models\CustomerPayment;
use Workdo\Account\Models\VendorPayment;
use Workdo\Account\Models\Revenue;
use Workdo\Account\Models\Expense;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if(Auth::user()->can('manage-account-dashboard')){
            $user = Auth::user();
            $userType = $user->type;

            switch ($userType) {
                case 'company':
                    return $this->companyDashboard($request);
                case 'vendor':
                    return $this->vendorDashboard();
                case 'client':
                    return $this->clientDashboard();
                case 'staff':
                default:
                    return $this->staffDashboard();
            }
        }
        return back()->with('error', __('Permission denied'));
    }

    private function companyDashboard(Request $request)
    {
        $creatorId = creatorId();

        $totalClients = Customer::where('created_by', $creatorId)->count();
        $totalVendors = Vendor::where('created_by', $creatorId)->count();
        $totalRevenue = Revenue::where('created_by', $creatorId)->sum('amount');
        $totalExpense = Expense::where('created_by', $creatorId)->sum('amount');
        $totalCustomerPayments = CustomerPayment::whereHas('customer', function($q) use ($creatorId) {
            $q->where('created_by', $creatorId);
        })->sum('payment_amount');
        $totalVendorPayments = VendorPayment::whereHas('vendor', function($q) use ($creatorId) {
            $q->where('created_by', $creatorId);
        })->sum('payment_amount');
        
        $netProfit = $totalRevenue - $totalExpense;

        $isDemo = config('app.is_demo');
        $now = Carbon::now();

        $filterYear = (int) $request->query('year', $now->year);
        $filterMonth = (int) $request->query('month', $now->month);
        if ($filterYear < 2000 || $filterYear > 2100) {
            $filterYear = (int) $now->year;
        }
        if ($filterMonth < 1 || $filterMonth > 12) {
            $filterMonth = (int) $now->month;
        }

        $filterMonthName = Carbon::create($filterYear, $filterMonth, 1)
            ->locale(app()->getLocale())
            ->translatedFormat('F');

        $dashboardYearOptions = range($now->year - 9, $now->year + 1);
        $dashboardYearOptions = array_values(array_unique(array_map('intval', $dashboardYearOptions)));
        if (! in_array($filterYear, $dashboardYearOptions, true)) {
            $dashboardYearOptions[] = $filterYear;
            sort($dashboardYearOptions);
        }

        if ($isDemo) {
            $yearPostedRevenue = rand(200000, 800000) + rand(0, 99) / 100;
            $yearPostedExpense = rand(150000, min(650000, (int) $yearPostedRevenue)) + rand(0, 99) / 100;
            $filterMonthRevenue = rand(10000, 120000) + rand(0, 99) / 100;
            $filterMonthExpense = rand(5000, (int) min(80000, $filterMonthRevenue * 0.9)) + rand(0, 99) / 100;
        } else {
            $yearPostedRevenue = Revenue::where('created_by', $creatorId)
                ->where('status', 'posted')
                ->whereYear('revenue_date', $filterYear)
                ->sum('amount');

            $yearPostedExpense = Expense::where('created_by', $creatorId)
                ->where('status', 'posted')
                ->whereYear('expense_date', $filterYear)
                ->sum('amount');

            $filterMonthRevenue = Revenue::where('created_by', $creatorId)
                ->where('status', 'posted')
                ->whereMonth('revenue_date', $filterMonth)
                ->whereYear('revenue_date', $filterYear)
                ->sum('amount');

            $filterMonthExpense = Expense::where('created_by', $creatorId)
                ->where('status', 'posted')
                ->whereMonth('expense_date', $filterMonth)
                ->whereYear('expense_date', $filterYear)
                ->sum('amount');
        }

        $recentRevenues = Revenue::where('created_by', $creatorId)
            ->whereMonth('revenue_date', $filterMonth)
            ->whereYear('revenue_date', $filterYear)
            ->orderByDesc('revenue_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->revenue_number,
                    'description' => $item->description ?? 'Revenue transaction',
                    'amount' => $item->amount,
                    'date' => $item->revenue_date ?? $item->created_at
                ];
            });

        $recentExpenses = Expense::where('created_by', $creatorId)
            ->whereMonth('expense_date', $filterMonth)
            ->whereYear('expense_date', $filterYear)
            ->orderByDesc('expense_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->expense_number,
                    'description' => $item->description ?? 'Expense transaction',
                    'amount' => $item->amount,
                    'date' => $item->expense_date ?? $item->created_at
                ];
            });

        $monthlyCustomerPayments = [];
        $monthlyVendorPayments = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->format('M');
            
            if ($isDemo) {
                $customerPayments = rand(15000, 45000) + rand(0, 99) / 100;
                $vendorPayments = rand(5000, 25000) + rand(0, 99) / 100;
            } else {
                $customerPayments = CustomerPayment::whereHas('customer', function($q) use ($creatorId) {
                    $q->where('created_by', $creatorId);
                })
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('payment_amount');
                
                $vendorPayments = VendorPayment::whereHas('vendor', function($q) use ($creatorId) {
                    $q->where('created_by', $creatorId);
                })
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('payment_amount');
            }
            
            $monthlyCustomerPayments[] = [
                'month' => $monthName,
                'customer_payments' => $customerPayments
            ];
            
            $monthlyVendorPayments[] = [
                'month' => $monthName,
                'vendor_payments' => $vendorPayments
            ];
        }

        $monthlyBookedRevenues = [];
        $monthlyBookedExpenses = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->format('M');

            if ($isDemo) {
                $bookedRevenue = rand(8000, 35000) + rand(0, 99) / 100;
                $bookedExpense = rand(4000, 22000) + rand(0, 99) / 100;
            } else {
                $bookedRevenue = Revenue::where('created_by', $creatorId)
                    ->where('status', 'posted')
                    ->whereMonth('revenue_date', $date->month)
                    ->whereYear('revenue_date', $date->year)
                    ->sum('amount');

                $bookedExpense = Expense::where('created_by', $creatorId)
                    ->where('status', 'posted')
                    ->whereMonth('expense_date', $date->month)
                    ->whereYear('expense_date', $date->year)
                    ->sum('amount');
            }

            $monthlyBookedRevenues[] = [
                'month' => $monthName,
                'booked_revenue' => (float) $bookedRevenue,
            ];
            $monthlyBookedExpenses[] = [
                'month' => $monthName,
                'booked_expense' => (float) $bookedExpense,
            ];
        }

        $profitLossYear = $filterYear;
        $yearlyProfitLoss = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthLabel = Carbon::create($profitLossYear, $m, 1)->format('M');

            if ($isDemo) {
                $plRevenue = rand(18000, 42000) + rand(0, 99) / 100;
                $plExpenses = rand(12000, (int) min(32000, $plRevenue * 0.85)) + rand(0, 99) / 100;
            } else {
                $plRevenue = Revenue::where('created_by', $creatorId)
                    ->where('status', 'posted')
                    ->whereMonth('revenue_date', $m)
                    ->whereYear('revenue_date', $profitLossYear)
                    ->sum('amount');

                $plExpenses = Expense::where('created_by', $creatorId)
                    ->where('status', 'posted')
                    ->whereMonth('expense_date', $m)
                    ->whereYear('expense_date', $profitLossYear)
                    ->sum('amount');
            }

            $yearlyProfitLoss[] = [
                'month' => $monthLabel,
                'revenue' => (float) $plRevenue,
                'expenses' => (float) $plExpenses,
            ];
        }

        return Inertia::render('Account/Dashboard/CompanyDashboard', [
            'stats' => [
                'total_clients' => $totalClients,
                'total_vendors' => $totalVendors,
                'total_revenue' => $totalRevenue,
                'total_expense' => $totalExpense,
                'total_customer_payment' => $totalCustomerPayments,
                'total_vendor_payment' => $totalVendorPayments,
                'net_profit' => $netProfit,
                'year_posted_revenue' => (float) $yearPostedRevenue,
                'year_posted_expense' => (float) $yearPostedExpense,
                'filter_month_revenue' => (float) $filterMonthRevenue,
                'filter_month_expense' => (float) $filterMonthExpense,
                'filter_month_name' => $filterMonthName,
                'dashboard_report_year' => $filterYear,
            ],
            'dashboard_filter' => [
                'year' => $filterYear,
                'month' => $filterMonth,
            ],
            'dashboard_year_options' => $dashboardYearOptions,
            'monthlyCustomerPayments' => $monthlyCustomerPayments,
            'monthlyVendorPayments' => $monthlyVendorPayments,
            'monthlyBookedRevenues' => $monthlyBookedRevenues,
            'monthlyBookedExpenses' => $monthlyBookedExpenses,
            'yearlyProfitLoss' => $yearlyProfitLoss,
            'profit_loss_year' => $profitLossYear,
            'recentRevenues' => $recentRevenues,
            'recentExpenses' => $recentExpenses
        ]);
    }

    private function vendorDashboard()
    {
        $user = Auth::user();

        $totalPayments = VendorPayment::where('vendor_id', $user->id)->sum('payment_amount');
        $totalExpenses = Expense::where('created_by', $user->created_by)->sum('amount');
        $paymentCount = VendorPayment::where('vendor_id', $user->id)->count();

        $isDemo = config('app.is_demo');
        $monthlyPayments = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->format('M');

            if ($isDemo) {
                $monthPayments = rand(1000, 10000) + rand(0, 99) / 100;
            } else {
                $monthPayments = VendorPayment::where('vendor_id', $user->id)
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->sum('payment_amount');
            }

            $monthlyPayments[] = [
                'month' => $monthName,
                'payments' => $monthPayments
            ];
        }

        // Dynamic return purchase invoices
        $recentReturnInvoices = collect();
        if (class_exists('\\App\Models\\PurchaseReturn')) {
            $recentReturnInvoices = \App\Models\PurchaseReturn::where('vendor_id', $user->id)
                ->latest()
                ->limit(5)
                ->get()
                ->map(function($return) {
                    return [
                        'id' => $return->id,
                        'invoice_number' => $return->return_number ?? 'PUR-RET-' . $return->id,
                        'amount' => $return->total_amount ?? 0,
                        'date' => $return->created_at->format('M d, Y'),
                        'status' => $return->status ?? 'Pending'
                    ];
                });
        }

        // Dynamic debit notes
        $recentDebitNotes = collect();
        if (class_exists('\\Workdo\\Account\\Models\\DebitNote')) {
            $recentDebitNotes = \Workdo\Account\Models\DebitNote::where('vendor_id', $user->id)
                ->latest()
                ->limit(5)
                ->get()
                ->map(function($note) {
                    return [
                        'id' => $note->id,
                        'debit_note_number' => $note->debit_note_number ?? 'DN-' . $note->id,
                        'amount' => $note->total_amount ?? 0,
                        'date' => $note->created_at->format('M d, Y'),
                        'status' => $note->status ?? 'Pending'
                    ];
                });
        }

        return Inertia::render('Account/Dashboard/VendorDashboard', [
            'stats' => [
                'total_payments' => $totalPayments,
                'total_expenses' => $totalExpenses,
                'payment_count' => $paymentCount
            ],
            'monthlyPayments' => $monthlyPayments,
            'recentReturnInvoices' => $recentReturnInvoices,
            'recentDebitNotes' => $recentDebitNotes,
            'vendor' => ['name' => $user->name]
        ]);
    }

    private function clientDashboard()
    {
        $user = Auth::user();

        $totalPayments = CustomerPayment::where('customer_id', $user->id)->sum('payment_amount');
        $totalRevenues = Revenue::where('created_by', $user->created_by)->sum('amount');
        $paymentCount = CustomerPayment::where('customer_id', $user->id)->count();

        $isDemo = config('app.is_demo');
        $monthlyPayments = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthName = $date->format('M');

            if ($isDemo) {
                $monthPayments = rand(2000, 15000) + rand(0, 99) / 100;
            } else {
                $monthPayments = CustomerPayment::where('customer_id', $user->id)
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->sum('payment_amount');
            }

            $monthlyPayments[] = [
                'month' => $monthName,
                'payments' => $monthPayments
            ];
        }

        // Dynamic return invoices from SalesReturns
        $recentReturnInvoices = collect();
        if (class_exists('\\App\Models\\SalesInvoiceReturn')) {
            $recentReturnInvoices = SalesInvoiceReturn::where('customer_id', $user->id)
                ->latest()
                ->limit(5)
                ->get()
                ->map(function($return) {
                    return [
                        'id' => $return->id,
                        'invoice_number' => $return->return_number ?? 'RET-' . $return->id,
                        'amount' => $return->total_amount ?? 0,
                        'date' => $return->created_at->format('M d, Y'),
                        'status' => $return->status ?? 'Pending'
                    ];
                });
        }

        // Dynamic credit notes
        $recentCreditNotes = collect();
        if (class_exists('\\Workdo\\Account\\Models\\CreditNote')) {
            $recentCreditNotes = \Workdo\Account\Models\CreditNote::where('customer_id', $user->id)
                ->latest()
                ->limit(5)
                ->get()
                ->map(function($note) {
                    return [
                        'id' => $note->id,
                        'credit_note_number' => $note->credit_note_number ?? 'CN-' . $note->id,
                        'amount' => $note->total_amount ?? 0,
                        'date' => $note->created_at->format('M d, Y'),
                        'status' => $note->status ?? 'Pending'
                    ];
                });
        }

        return Inertia::render('Account/Dashboard/ClientDashboard', [
            'stats' => [
                'total_payments' => $totalPayments,
                'total_revenues' => $totalRevenues,
                'payment_count' => $paymentCount
            ],
            'monthlyPayments' => $monthlyPayments,
            'recentReturnInvoices' => $recentReturnInvoices,
            'recentCreditNotes' => $recentCreditNotes,
            'customer' => ['name' => $user->name]
        ]);
    }

    private function staffDashboard()
    {
        $user = Auth::user();
        $creatorId = $user->created_by;

        $totalClients = Customer::where('created_by', $creatorId)->count();
        $totalVendors = Vendor::where('created_by', $creatorId)->count();
        $monthlyRevenue = Revenue::where('created_by', $creatorId)
            ->whereMonth('created_at', Carbon::now()->month)
            ->sum('amount');
        $monthlyExpense = Expense::where('created_by', $creatorId)
            ->whereMonth('created_at', Carbon::now()->month)
            ->sum('amount');

        $recentActivities = collect()
            ->merge(Revenue::where('created_by', $creatorId)->latest()->limit(3)->get()->map(function($item) {
                return ['type' => 'Revenue', 'title' => $item->revenue_number, 'amount' => $item->amount, 'date' => $item->created_at];
            }))
            ->merge(Expense::where('created_by', $creatorId)->latest()->limit(3)->get()->map(function($item) {
                return ['type' => 'Expense', 'title' => $item->expense_number, 'amount' => $item->amount, 'date' => $item->created_at];
            }))
            ->sortByDesc('date')
            ->take(6)
            ->values();

        return Inertia::render('Account/Dashboard/StaffDashboard', [
            'stats' => [
                'total_clients' => $totalClients,
                'total_vendors' => $totalVendors,
                'monthly_revenue' => $monthlyRevenue,
                'monthly_expense' => $monthlyExpense
            ],
            'recentActivities' => $recentActivities
        ]);
    }
}
