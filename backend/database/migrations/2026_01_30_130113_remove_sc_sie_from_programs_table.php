<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Models\Program;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $programs = Program::all();
        foreach ($programs as $program) {
            if (!empty($program->sies)) {
                $sies = $program->sies;
                $newSies = array_values(array_filter($sies, function ($sie) {
                    return isset($sie['name']) && $sie['name'] !== 'Steering Committee (SC)';
                }));

                // Only update if changes were made
                if (count($sies) !== count($newSies)) {
                    $program->sies = $newSies;
                    $program->save();
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
