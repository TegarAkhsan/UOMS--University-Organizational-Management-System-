<?php
/**
 * PRODUCTION VERSION
 * File ini akan di-copy ke /home/himy9571/laravel/bootstrap/app.php saat deployment
 * Perbedaan dengan app.php lokal: apiPrefix: '' karena diakses dari folder /api/
 */

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: '',  // PRODUCTION: Empty karena sudah diakses dari /api/ folder
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register middleware aliases
        $middleware->alias([
            'sanitize' => \App\Http\Middleware\SanitizeInput::class,
        ]);

        // Append to API middleware group
        $middleware->api(append: [
            \App\Http\Middleware\SanitizeInput::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
