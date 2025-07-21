<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuotationRequest;
use App\Http\Requests\UpdateQuotationStatusRequest;
use App\Models\Quotation;
use App\Models\QuotationItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuotationController extends Controller
{
    /**
     * Display a listing of quotations with pagination and filtering.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Quotation::with(['customer', 'items']);

            // Apply filters if provided
            if ($request->has('status')) {
                $query->withStatus($request->status);
            }

            if ($request->has('customer_id')) {
                $query->forCustomer($request->customer_id);
            }

            // Apply date range filter
            if ($request->has('date_from')) {
                $query->where('quotation_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('quotation_date', '<=', $request->date_to);
            }

            // Order by latest first
            $query->orderBy('created_at', 'desc');

            $quotations = $query->paginate(15);

            return response()->json($quotations);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve quotations: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve quotations.',
                'error' => 'An unexpected error occurred.'
            ], 500);
        }
    }

    /**
     * Store a newly created quotation with complete data integrity.
     */
    public function store(StoreQuotationRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            // Create the quotation with validated data
            $quotation = Quotation::create([
                'customer_id' => $request->customer_id,
                'quotation_date' => $request->quotation_date,
                'status' => $request->status ?? 'Draft',
                'total_amount' => 0.00, // Will be calculated from items
            ]);

            // Create quotation items
            $totalAmount = 0;
            foreach ($request->items as $itemData) {
                $item = QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                ]);

                // Calculate running total
                $totalAmount += ($item->quantity * $item->unit_price);
            }

            // Update quotation with calculated total
            $quotation->update(['total_amount' => $totalAmount]);

            // Load relationships for response
            $quotation->load(['customer', 'items']);

            DB::commit();

            return response()->json($quotation, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create quotation: ' . $e->getMessage(), [
                'request_data' => $request->validated(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to create quotation.',
                'error' => 'An unexpected error occurred while creating the quotation.'
            ], 500);
        }
    }

    /**
     * Display the specified quotation with eager-loaded relationships.
     */
    public function show(Quotation $quotation): JsonResponse
    {
        try {
            // Eager load relationships to prevent N+1 queries
            $quotation->load(['customer', 'items']);

            return response()->json($quotation);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve quotation: ' . $e->getMessage(), [
                'quotation_id' => $quotation->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve quotation.',
                'error' => 'An unexpected error occurred.'
            ], 500);
        }
    }

    /**
     * Update the specified quotation with complete data integrity.
     */
    public function update(StoreQuotationRequest $request, Quotation $quotation): JsonResponse
    {
        DB::beginTransaction();

        try {
            // Update quotation header
            $quotation->update([
                'customer_id' => $request->customer_id,
                'quotation_date' => $request->quotation_date,
                'status' => $request->status ?? $quotation->status,
            ]);

            // Delete existing items
            $quotation->items()->delete();

            // Create new items and calculate total
            $totalAmount = 0;
            foreach ($request->items as $itemData) {
                $item = QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                ]);

                $totalAmount += ($item->quantity * $item->unit_price);
            }

            // Update quotation with new total
            $quotation->update(['total_amount' => $totalAmount]);

            // Load relationships for response
            $quotation->load(['customer', 'items']);

            DB::commit();

            return response()->json($quotation);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update quotation: ' . $e->getMessage(), [
                'quotation_id' => $quotation->id,
                'request_data' => $request->validated(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to update quotation.',
                'error' => 'An unexpected error occurred while updating the quotation.'
            ], 500);
        }
    }

    /**
     * Update only the status of the specified quotation.
     */
    public function updateStatus(UpdateQuotationStatusRequest $request, Quotation $quotation): JsonResponse
    {
        try {
            $quotation->update([
                'status' => $request->status
            ]);

            // Load relationships for response
            $quotation->load(['customer', 'items']);

            return response()->json($quotation);

        } catch (\Exception $e) {
            Log::error('Failed to update quotation status: ' . $e->getMessage(), [
                'quotation_id' => $quotation->id,
                'new_status' => $request->status,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to update quotation status.',
                'error' => 'An unexpected error occurred while updating the status.'
            ], 500);
        }
    }

    /**
     * Remove the specified quotation from storage (soft delete).
     */
    public function destroy(Quotation $quotation): JsonResponse
    {
        try {
            $quotation->delete(); // Soft delete due to SoftDeletes trait

            return response()->json(null, 204);

        } catch (\Exception $e) {
            Log::error('Failed to delete quotation: ' . $e->getMessage(), [
                'quotation_id' => $quotation->id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to delete quotation.',
                'error' => 'An unexpected error occurred while deleting the quotation.'
            ], 500);
        }
    }
}
