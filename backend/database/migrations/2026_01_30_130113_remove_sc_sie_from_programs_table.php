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
        $programs = \Illuminate\Support\Facades\DB::table('programs')->get();
        foreach ($programs as $program) {
            if (!empty($program->sies)) {
                $sies = json_decode($program->sies, true);
                if (!is_array($sies)) continue;

                $newSies = array_values(array_filter($sies, function ($sie) {
                    return isset($sie['name']) && $sie['name'] !== 'Steering Committee (SC)';
                }));

                // Only update if changes were made
                if (count($sies) !== count($newSies)) {
                    \Illuminate\Support\Facades\DB::table('programs')
                        ->where('id', $program->id)
                        ->update(['sies' => json_encode($newSies)]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No simple reverse without backing up previous data
    }
};
