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
            if (!Schema::hasColumn('letters', 'category')) {
                $table->string('category')->nullable()->after('type');
            }
            // Make program_id nullable if it exists
            if (Schema::hasColumn('letters', 'program_id')) {
                $table->foreignId('program_id')->nullable()->change();
            }
            // Ensure title/subject consistency if needed, but for now just add category
        });

        Schema::table('programs', function (Blueprint $table) {
            if (!Schema::hasColumn('programs', 'proposal_status')) {
                $table->string('proposal_status')->default('not_started')->after('status');
            }
            if (!Schema::hasColumn('programs', 'lpj_status')) {
                $table->string('lpj_status')->default('not_started')->after('proposal_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letters', function (Blueprint $table) {
            if (Schema::hasColumn('letters', 'category')) {
                $table->dropColumn('category');
            }
            // Reverting nullable is risky if data exists, skipping for now
        });

        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['proposal_status', 'lpj_status']);
        });
    }
};
