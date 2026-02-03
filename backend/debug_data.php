<?php
use App\Models\Period;
use App\Models\Program;
use App\Models\User;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$period1 = Period::find(1);
$count1 = Program::withoutGlobalScopes()->where('period_id', 1)->count(); // Bypass Global Scope

echo "Period 1 (ID: " . ($period1 ? $period1->id : 'null') . ") - Active: " . ($period1 ? $period1->is_active : 'null') . " - Programs: {$count1}\n";

$period2 = Period::find(2);
if ($period2) {
    $count2 = Program::withoutGlobalScopes()->where('period_id', 2)->count(); // Bypass Global Scope
    echo "Period 2 (ID: {$period2->id}) - Active: {$period2->is_active} - Programs: {$count2}\n";
} else {
    echo "Period 2 NOT FOUND\n";
}
