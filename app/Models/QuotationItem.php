<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationItem extends Model
{
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'quotation_id',
        'description',
        'quantity',
        'unit_price',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
    ];

    /**
     * Get the quotation that owns the quotation item.
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Calculate the total amount for this line item.
     */
    public function getLineTotal(): float
    {
        return (float) ($this->quantity * $this->unit_price);
    }

    /**
     * Get the line total as an attribute.
     */
    public function getLineTotalAttribute(): float
    {
        return $this->getLineTotal();
    }
}
