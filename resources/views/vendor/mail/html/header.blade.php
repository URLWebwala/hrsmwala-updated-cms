@props(['url'])
@php
    $logo = admin_setting('logo_dark');
    $imageUrlPrefix = getImageUrlPrefix();
    $logo_url = $logo ? $imageUrlPrefix . $logo : null;
@endphp
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if ($logo_url)
<img src="{{ $logo_url }}" class="logo" alt="{{ config('app.name') }}" style="height: 50px;">
@elseif (config('mail.logo_url'))
<img src="{{ config('mail.logo_url') }}" class="logo" alt="Logo" style="height: 50px;">
@else
{{ config('app.name') }}
@endif
</a>
</td>
</tr>
