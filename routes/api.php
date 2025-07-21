<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\QuotationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// For development - temporarily disable auth for testing
Route::apiResource('customers', CustomerController::class);
Route::apiResource('quotations', QuotationController::class);

// Custom route for updating quotation status
Route::post('quotations/{quotation}/status', [QuotationController::class, 'updateStatus']);

// For production - enable auth middleware
// Route::middleware('auth:sanctum')->group(function () {
//     Route::apiResource('customers', CustomerController::class);
//     Route::apiResource('quotations', QuotationController::class);
//     Route::post('quotations/{quotation}/status', [QuotationController::class, 'updateStatus']);
// });
