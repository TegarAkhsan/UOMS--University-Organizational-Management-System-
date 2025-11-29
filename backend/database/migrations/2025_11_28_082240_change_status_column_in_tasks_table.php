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
            // Change enum to string to support dynamic statuses
            $table->string('status')->default('ready')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Revert back to enum (might lose data if invalid values exist)
            // For safety in dev, we can just change back to string or leave it
            // But strictly reversing:
            // $table->enum('status', ['Pending', 'Done'])->default('Pending')->change();
        });
    }
};
