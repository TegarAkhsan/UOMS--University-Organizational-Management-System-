<?php
/**
 * Artisan Web Runner
 * Script untuk menjalankan Artisan commands via browser (untuk hosting tanpa SSH)
 * 
 * PERHATIAN: Hapus file ini setelah selesai setup production untuk keamanan!
 * 
 * URL: https://yourdomain.com/api/artisan-web.php
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);
set_time_limit(300);

$laravelPath = dirname(__DIR__, 2) . '/laravel';

echo "<h2>Laravel Artisan Web Runner</h2>";
echo "<p>Laravel Path: " . $laravelPath . "</p>";

// Check if Laravel exists
if (!file_exists($laravelPath . '/vendor/autoload.php')) {
    die("<p style='color:red;'>ERROR: Laravel not found at $laravelPath</p>");
}

// Available commands (whitelist for security)
$allowed = [
    'migrate' => 'Run database migrations',
    'migrate:fresh' => 'Drop all tables and re-run migrations',
    'migrate:status' => 'Show migration status',
    'db:seed' => 'Run database seeders',
    'cache:clear' => 'Clear application cache',
    'config:clear' => 'Clear config cache',
    'route:clear' => 'Clear route cache',
    'view:clear' => 'Clear view cache',
    'config:cache' => 'Cache config',
    'route:cache' => 'Cache routes',
    'route:list' => 'List all routes',
];

$cmd = $_GET['cmd'] ?? null;

if (!$cmd) {
    echo "<h3>Available Commands:</h3><ul>";
    foreach ($allowed as $c => $desc) {
        echo "<li><a href='?cmd=$c'>$c</a> - $desc</li>";
    }
    echo "</ul>";
    echo "<p><strong>Security Warning:</strong> Delete this file after production setup!</p>";
    exit;
}

if (!array_key_exists($cmd, $allowed)) {
    die("<p style='color:red;'>Command not allowed!</p>");
}

try {
    require $laravelPath . '/vendor/autoload.php';
    $app = require_once $laravelPath . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

    echo "<h3>Running: $cmd</h3>";
    echo "<pre>";

    // Add --force for production commands
    if (str_starts_with($cmd, 'migrate') || $cmd === 'db:seed') {
        $kernel->call($cmd, ['--force' => true]);
    } else {
        $kernel->call($cmd);
    }

    echo $kernel->output();
    echo "</pre>";
    echo "<p><strong>Done!</strong></p>";
    echo "<p><a href='?'>← Back to commands</a></p>";

} catch (Throwable $e) {
    echo "<pre style='color:red;'>ERROR: " . $e->getMessage() . "\n\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    echo $e->getTraceAsString();
    echo "</pre>";
}
