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
        Schema::table('letters', function (Blueprint $table) {
            if (!Schema::hasColumn('letters', 'no')) {
                $table->string('no')->nullable();
            }
            if (!Schema::hasColumn('letters', 'subject')) {
                $table->string('subject')->nullable();
            }
            if (!Schema::hasColumn('letters', 'sender')) {
                $table->string('sender')->nullable();
            }
            if (!Schema::hasColumn('letters', 'recipient')) {
                $table->string('recipient')->nullable();
            }
            if (!Schema::hasColumn('letters', 'date')) {
                $table->date('date')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letters', function (Blueprint $table) {
            // We don't drop them to avoid data loss if they existed before
        });
    }
};
