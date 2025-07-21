<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quotation extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'quotation_date',
        'status',
        'total_amount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quotation_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * The possible status values for quotations.
     *
     * @var array<string>
     */
    public const STATUSES = [
        'Draft',
        'Sent',
        'Accepted',
        'Declined',
        'Expired',
    ];

    /**
     * Get the customer that owns the quotation.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the quotation items for the quotation.
     */
    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    /**
     * Calculate and update the total amount based on quotation items.
     */
    public function calculateTotal(): void
    {
        $total = $this->items()
            ->selectRaw('SUM(quantity * unit_price) as total')
            ->value('total') ?? 0;

        $this->update(['total_amount' => $total]);
    }

    /**
     * Scope a query to only include quotations with a specific status.
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include quotations for a specific customer.
     */
    public function scopeForCustomer($query, int $customerId)
    {
        return $query->where('customer_id', $customerId);
    }
}
