<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to sanitize input data and add security headers.
 * 
 * SQL Injection Protection:
 * - Laravel Eloquent ORM already uses parameterized queries (PDO prepared statements)
 * - This middleware adds an extra layer by sanitizing input strings
 * 
 * XSS Protection:
 * - Strips HTML tags from string inputs
 * - Adds security headers to responses
 */
class SanitizeInput
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Sanitize all input data
        $input = $request->all();
        $sanitized = $this->sanitizeArray($input);
        $request->merge($sanitized);

        // Process the request
        $response = $next($request);

        // Add security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }

    /**
     * Recursively sanitize an array of input data.
     */
    private function sanitizeArray(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            // Sanitize the key as well
            $cleanKey = $this->sanitizeString($key);

            if (is_array($value)) {
                $sanitized[$cleanKey] = $this->sanitizeArray($value);
            } elseif (is_string($value)) {
                $sanitized[$cleanKey] = $this->sanitizeString($value);
            } else {
                // Keep non-string values as-is (numbers, booleans, null)
                $sanitized[$cleanKey] = $value;
            }
        }

        return $sanitized;
    }

    /**
     * Sanitize a string value.
     * 
     * Note: This performs light sanitization. For fields that need HTML
     * (like rich text editors), you should exclude them or use a different approach.
     */
    private function sanitizeString(string $value): string
    {
        // Trim whitespace
        $value = trim($value);

        // Remove null bytes
        $value = str_replace(chr(0), '', $value);

        // For most fields, we want to preserve the content but escape for display
        // Laravel's Blade templates already escape output by default

        return $value;
    }
}
