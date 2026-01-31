<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\AssistanceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LetterController;
use App\Http\Controllers\RabController;
use App\Http\Controllers\StandardPriceController;
use App\Http\Controllers\RecapController;
use App\Http\Controllers\LetterRequestController;
use App\Http\Controllers\DocumentTemplateController;
use App\Http\Controllers\BudgetCodeController;
use App\Http\Controllers\TaskController;

use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('letters', LetterController::class);
    Route::apiResource('programs', ProgramController::class);
    Route::get('/transaction-summary', [TransactionController::class, 'summary']);
    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('meetings', MeetingController::class);
    Route::apiResource('assistances', AssistanceController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('tasks', TaskController::class);

    Route::apiResource('recaps', RecapController::class)->only(['store', 'destroy']);
    Route::get('/programs/{programId}/recaps', [RecapController::class, 'index']);

    Route::apiResource('letter-requests', LetterRequestController::class);
    Route::apiResource('document-templates', DocumentTemplateController::class);
    Route::apiResource('budget-codes', BudgetCodeController::class);
    Route::apiResource('standard-prices', StandardPriceController::class);

    Route::get('/rabs/{programId}', [RabController::class, 'index']);
    Route::get('/rabs', [RabController::class, 'getAll']);
    Route::post('/rabs', [RabController::class, 'store']);
    Route::put('/rabs/{id}', [RabController::class, 'update']);

    Route::get('/settings', [App\Http\Controllers\SettingController::class, 'index']);
    Route::put('/settings', [App\Http\Controllers\SettingController::class, 'update']);

    Route::get('/cash-summary', [App\Http\Controllers\CashController::class, 'summary']);
    Route::get('/cash-collections', [App\Http\Controllers\CashController::class, 'index']);
    Route::post('/cash-collections', [App\Http\Controllers\CashController::class, 'store']);
    Route::put('/cash-collections/{id}', [App\Http\Controllers\CashController::class, 'update']);
    Route::delete('/cash-collections/{id}', [App\Http\Controllers\CashController::class, 'destroy']);
    Route::get('/cash-collections/{id}/payments', [App\Http\Controllers\CashController::class, 'getPayments']);
    Route::post('/cash-payments/toggle', [App\Http\Controllers\CashController::class, 'togglePayment']);
});
