<?php

namespace Workdo\Cashfree\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Plan;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class CashfreeController extends Controller
{
    public function planPayWithCashfree(Request $request)
    {
        $plan = Plan::find($request->plan_id);
        $user = User::find($request->user_id);
        $admin_settings = getAdminAllSetting();
        
        $cashfree_client_id = $admin_settings['cashfree_client_id'] ?? '';
        $cashfree_client_secret = $admin_settings['cashfree_client_secret'] ?? '';
        $cashfree_environment = $admin_settings['cashfree_environment'] ?? 'sandbox';
        $admin_currency = !empty($admin_settings['defaultCurrency']) ? $admin_settings['defaultCurrency'] : 'INR';

        if (empty($cashfree_client_id) || empty($cashfree_client_secret)) {
            return redirect()->back()->with('error', __('Cashfree API keys are not set.'));
        }

        $user_module = !empty($request->user_module_input) ? $request->user_module_input : '';
        $duration = !empty($request->time_period) ? $request->time_period : 'Month';
        $user_module_price = 0;

        if (!empty($user_module)) {
            $user_module_array = explode(',', $user_module);
            foreach ($user_module_array as $key => $value) {
                $temp = ($duration == 'Year') ? ModulePriceByName($value)['yearly_price'] : ModulePriceByName($value)['monthly_price'];
                $user_module_price = $user_module_price + $temp;
            }
        }

        $plan_price = ($duration == 'Year') ? $plan->package_price_yearly : $plan->package_price_monthly;
        $price = $plan_price + $user_module_price;

        if ($request->coupon_code) {
            $validation = applyCouponDiscount($request->coupon_code, $price, auth()->id());
            if ($validation['valid']) {
                $price = $validation['final_amount'];
            }
        }

        $orderID = strtoupper(substr(uniqid(), -12));
        
        if ($price <= 0) {
            $counter = [
                'user_counter' => $plan->number_of_users,
                'storage_counter' => $plan->storage_limit,
            ];
            $assignPlan = assignPlan($plan->id, $duration, $user_module, $counter, $request->user_id);
            if ($assignPlan['is_success']) {
                return redirect()->route('plans.index')->with('success', __('Plan activated Successfully!'));
            } else {
                return redirect()->route('plans.index')->with('error', __('Something went wrong, Please try again,'));
            }
        }

        // Cashfree Order Creation API
        $url = ($cashfree_environment == 'production') 
            ? "https://api.cashfree.com/pg/orders" 
            : "https://sandbox.cashfree.com/pg/orders";

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                "Content-Type" => "application/json",
                "x-api-version" => "2023-08-01",
                "x-client-id" => trim($cashfree_client_id),
                "x-client-secret" => trim($cashfree_client_secret)
            ])->post($url, $data);

            if ($response->failed()) {
                return redirect()->back()->with('error', $response->json()['message'] ?? 'Authentication or Order creation failed.');
            }

            $result = json_decode($response->body());

            if (isset($result->payment_session_id)) {
                Order::create([
                    'order_id' => $orderID,
                    'name' => $user->name,
                    'email' => $user->email,
                    'plan_name' => $plan->name,
                    'plan_id' => $plan->id,
                    'price' => $price,
                    'currency' => $admin_currency,
                    'txn_id' => '',
                    'payment_type' => 'Cashfree',
                    'payment_status' => 'pending',
                    'receipt' => json_encode([
                        'user_module' => $user_module,
                        'duration' => $duration,
                        'coupon_code' => $request->coupon_code,
                        'user_id' => $user->id
                    ]),
                    'created_by' => $user->id,
                ]);

                return Inertia::render('Cashfree/CashfreePayment', [
                    'payment_session_id' => $result->payment_session_id,
                    'environment' => $cashfree_environment,
                    'order_id' => $orderID,
                    'plan_id' => $plan->id,
                    'return_url' => route('plan.cashfree.status', ['order_id' => $orderID])
                ]);
            } else {
                return redirect()->back()->with('error', $result->message ?? 'Order creation failed.');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function planGetCashfreeStatus(Request $request)
    {
        $admin_settings = getAdminAllSetting();
        $cashfree_client_id = $admin_settings['cashfree_client_id'] ?? '';
        $cashfree_client_secret = $admin_settings['cashfree_client_secret'] ?? '';
        $cashfree_environment = $admin_settings['cashfree_environment'] ?? 'sandbox';

        $orderID = $request->order_id;
        if (empty($orderID)) {
             $orderID = $request->get('cf_id') ?? $request->get('cf_order_id');
        }

        if (empty($orderID)) {
            return redirect()->route('plans.index')->with('error', __('Order ID missing in redirection.'));
        }

        $url = ($cashfree_environment == 'production') 
            ? "https://api.cashfree.com/pg/orders/{$orderID}" 
            : "https://sandbox.cashfree.com/pg/orders/{$orderID}";

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                "Content-Type" => "application/json",
                "x-api-version" => "2023-08-01",
                "x-client-id" => trim($cashfree_client_id),
                "x-client-secret" => trim($cashfree_client_secret)
            ])->get($url);

            $result = json_decode($response->body());

            if (isset($result->order_status) && in_array($result->order_status, ['PAID', 'SUCCESS', 'COMPLETED'])) {
                $order = Order::where('order_id', $orderID)->first();
                if ($order && $order->payment_status != 'succeeded') {
                    $metadata = !empty($order->receipt) ? json_decode($order->receipt, true) : [];
                    
                    $order->payment_status = 'succeeded';
                    $order->txn_id = $result->cf_order_id ?? $orderID;
                    $order->save();

                    $plan = Plan::find($order->plan_id);
                    $counter = [
                        'user_counter' => $plan->number_of_users ?? -1,
                        'storage_counter' => $plan->storage_limit ?? 0,
                    ];
                    
                    $duration = $metadata['duration'] ?? 'Month';
                    $user_module = $metadata['user_module'] ?? '';
                    $user_id = $metadata['user_id'] ?? $order->created_by;

                    assignPlan($plan->id, $duration, $user_module, $counter, $user_id);
                    
                    if (!empty($metadata['coupon_code'])) {
                        $coupon = Coupon::where('code', $metadata['coupon_code'])->first();
                        if ($coupon) {
                            recordCouponUsage($coupon->id, $user_id, $orderID);
                        }
                    }

                    return redirect()->route('plans.index')->with('success', __('Plan activated Successfully!'));
                }
            }
            
            return redirect()->route('plans.index')->with('error', __('Payment failed or order not found.'));
        } catch (\Exception $e) {
            return redirect()->route('plans.index')->with('error', $e->getMessage());
        }
    }
}
