<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        if (Auth::user()->can('manage-profile') || Auth::id() === $request->user()->id) {
            return Inertia::render('profile/edit', [
                'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                'status' => session('status'),
            ]);
        }

        return redirect()->back()->with('error', __('Permission denied'));
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        if ((Auth::user()->can('edit-profile') || Auth::id() === $request->user()->id) && Auth::id() === $request->user()->id) {
            $user = $request->user();
            $validated = $request->validated();

            if (isset($validated['avatar']) && $validated['avatar']) {
                $validated['avatar'] = basename($validated['avatar']);
            }

            $user->fill($validated);
            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            $user->save();

            return Redirect::route('profile.edit')->with('success', __('The profile details are updated successfully.'));
        }

        return Redirect::route('profile.edit')->with('error', __('Permission denied'));
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required'],
        ]);

        $user = $request->user();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'password' => __('The provided password does not match our records.'),
            ]);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
