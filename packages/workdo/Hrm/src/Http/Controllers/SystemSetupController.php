<?php

namespace Workdo\Hrm\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class SystemSetupController extends Controller
{
    public function index()
    {
        return redirect()->route('hrm.branches.index');
    }
}
