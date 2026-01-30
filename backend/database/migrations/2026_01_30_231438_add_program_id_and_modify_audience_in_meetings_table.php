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
        Schema::table('meetings', function (Blueprint $table) {
            $table->unsignedBigInteger('program_id')->nullable()->after('audience');
            // Modifying enum to string directly might depend on DB version/driver, 
            // but standard 'change' works if doctrine/dbal is installed. 
            // If not, we can just alter it raw or use string if it was enum.
            // Since we can't easily rely on doctrine/dbal being present, 
            // let's drop and re-add or just use raw statement for safety if needed, 
            // BUT for simplicity in Laravel modern versions:
            $table->string('audience')->change(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            $table->dropColumn('program_id');
            // Reverting to enum is tricky without exact values, putting string back is safer or just leaving as string.
        });
    }
};
