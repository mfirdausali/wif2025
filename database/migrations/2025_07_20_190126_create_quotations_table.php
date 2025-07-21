<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->date('quotation_date');
            $table->string('status')->default('Draft');
            $table->decimal('total_amount', 10, 2)->default(0.00);
            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index('customer_id');
            $table->index('status');
            $table->index('quotation_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
