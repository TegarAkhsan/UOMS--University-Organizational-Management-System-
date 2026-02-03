<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    protected $tables = [
        'users', 'programs', 'transactions', 'meetings', 'assistances', 'tasks',
        'letters', 'letter_requests', 'recaps', 'rabs', 'rab_items',
        'cash_collections', 'cash_payments', 'settings'
    ];

    public function up(): void
    {
        // 1. Create Initial Period
        $periodId = DB::table('periods')->insertGetId([
            'name' => 'Periode Awal 2024-2025',
            'start_year' => 2024,
            'end_year' => 2025,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Add period_id to tables
        foreach ($this->tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->foreignId('period_id')
                          ->nullable()
                          ->after('id'); 
                });

                // Update existing records
                DB::table($tableName)->update(['period_id' => $periodId]);

                // Add foreign key
                Schema::table($tableName, function (Blueprint $table) {
                     $table->foreign('period_id')->references('id')->on('periods')->onDelete('cascade');
                });
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            if (Schema::hasTable($tableName)) {
                Schema::table($tableName, function (Blueprint $table) {
                     $table->dropForeign(['period_id']);
                     $table->dropColumn('period_id');
                });
            }
        }
    }
};
