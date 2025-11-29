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
        Schema::table('rabs', function (Blueprint $table) {
            $table->text('revision_note')->nullable()->after('status');
        });

        Schema::table('rab_items', function (Blueprint $table) {
            $table->string('type')->default('Pengeluaran')->after('category'); // Pemasukan, Pengeluaran
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rabs', function (Blueprint $table) {
            $table->dropColumn('revision_note');
        });

        Schema::table('rab_items', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
