<?php

namespace App\Http\Requests;

use App\Models\Quotation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuotationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Quotation header validation
            'customer_id' => [
                'required',
                'integer',
                'exists:customers,id'
            ],
            'quotation_date' => [
                'required',
                'date',
                'after_or_equal:today'
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(Quotation::STATUSES)
            ],

            // Quotation items validation using dot notation
            'items' => [
                'required',
                'array',
                'min:1'
            ],
            'items.*.description' => [
                'required',
                'string',
                'max:255'
            ],
            'items.*.quantity' => [
                'required',
                'numeric',
                'min:0.01',
                'max:999999.99'
            ],
            'items.*.unit_price' => [
                'required',
                'numeric',
                'min:0.01',
                'max:99999999.99'
            ],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Please select a customer for this quotation.',
            'customer_id.exists' => 'The selected customer does not exist.',
            'quotation_date.required' => 'Quotation date is required.',
            'quotation_date.after_or_equal' => 'Quotation date cannot be in the past.',
            'items.required' => 'At least one quotation item is required.',
            'items.min' => 'At least one quotation item is required.',
            'items.*.description.required' => 'Item description is required.',
            'items.*.description.max' => 'Item description cannot exceed 255 characters.',
            'items.*.quantity.required' => 'Item quantity is required.',
            'items.*.quantity.min' => 'Item quantity must be greater than 0.',
            'items.*.quantity.max' => 'Item quantity cannot exceed 999,999.99.',
            'items.*.unit_price.required' => 'Item unit price is required.',
            'items.*.unit_price.min' => 'Item unit price must be greater than 0.',
            'items.*.unit_price.max' => 'Item unit price cannot exceed 99,999,999.99.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'customer_id' => 'customer',
            'quotation_date' => 'quotation date',
            'items.*.description' => 'item description',
            'items.*.quantity' => 'item quantity',
            'items.*.unit_price' => 'item unit price',
        ];
    }
}
