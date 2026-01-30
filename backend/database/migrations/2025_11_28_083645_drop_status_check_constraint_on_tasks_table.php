<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Explicitly drop the check constraint for Postgres
            try {
                DB::statement('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check');
            } catch (\Throwable $e) {
                // Ignore error if constraint doesn't exist or syntax isn't supported
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Re-adding it is tricky without knowing exact original definition, 
            // but for now we just want to remove it.
        });
    }
};
