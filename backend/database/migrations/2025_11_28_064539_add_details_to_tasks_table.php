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
            $table->string('assigned_to')->nullable();
            $table->text('description')->nullable();
            $table->date('deadline')->nullable();
            $table->string('submission_file')->nullable();
            $table->string('submission_link')->nullable();
            $table->text('revision_note')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'assigned_to',
                'description',
                'deadline',
                'submission_file',
                'submission_link',
                'revision_note'
            ]);
        });
    }
};
