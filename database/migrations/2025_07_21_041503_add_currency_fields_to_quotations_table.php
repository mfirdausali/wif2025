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
        Schema::table('quotations', function (Blueprint $table) {
            $table->string('currency', 3)->default('MYR')->after('status');
            $table->decimal('conversion_rate', 8, 4)->default(1.0000)->after('currency');
            $table->string('payment_terms')->default('Net 30 Days')->after('conversion_rate');
            $table->json('notes')->nullable()->after('payment_terms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->dropColumn(['currency', 'conversion_rate', 'payment_terms', 'notes']);
        });
    }
};
