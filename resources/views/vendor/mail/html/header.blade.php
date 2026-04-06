@props(['url'])
@php
    $logo = admin_setting('logo_dark');
    $imageUrlPrefix = getImageUrlPrefix();
    $logo_url = $logo ? $imageUrlPrefix . $logo : null;
    $company_name = admin_setting('titleText') ?: config('app.name');
@endphp
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if ($logo_url)
<img src="{{ $logo_url }}" class="logo" alt="{{ $company_name }}" style="max-height: 70px; width: auto; display: block; margin: 0 auto;">
@elseif (config('mail.logo_url'))
<img src="{{ config('mail.logo_url') }}" class="logo" alt="{{ $company_name }}" style="max-height: 70px; width: auto; display: block; margin: 0 auto;">
@else
<strong style="font-size: 24px; color: #3d4852;">{{ $company_name }}</strong>
@endif
</a>
</td>
</tr>
