<x-mail::message>
{{-- Body --}}
{!! $content !!}

{{-- Subcopy --}}
@isset($subcopy)
    <x-slot:subcopy>
        <x-mail::subcopy>
            {!! $subcopy !!}
        </x-mail::subcopy>
    </x-slot:subcopy>
@endisset
</x-mail::message>
