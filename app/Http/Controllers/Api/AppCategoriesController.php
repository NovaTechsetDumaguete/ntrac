<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppCategories;
use App\Models\RunningApps;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class AppCategoriesController extends Controller
{
    private $disabled_categories = [90];
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = AppCategories::whereNotIn('id', $this->disabled_categories)
            ->orderBy('priority_id', 'ASC')
            ->orderBy('id', 'ASC')
            ->get();

        Redis::set('categories', $categories, 'EX', 21600);
        return response()->json([
            'data' => $categories,
            'message' => 'Successfully retrieved all categories',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // return $request->all();
            $request->validate([
                'name' => 'required|string|max:255|unique:tblapp_categories,name',
                'header_name' => 'required|string|max:255',
                'is_productive' => 'required|in:0,1,2',
                'priority_id' => 'required|in:0,1,2,3',
            ]);

            $category = AppCategories::create([
                'name' => $request->name,
                'header_name' => $request->header_name,
                'is_productive' => $request->is_productive,
                'priority_id' => $request->priority_id,
                'abbreviation' => $request->abbreviation ?? strtoupper(substr($request->name, 0, 2)),
                'description' => $request->description,
            ]);

            $message = 'Successfully created category ' . $category->name;
            if ($request->apply_changes) {
                $update = RunningApps::whereIn('category_id', [6])
                    ->whereDate('created_at', '>=', Carbon::now()->subDays(7))
                    ->where('description', 'LIKE', "%{$request->name}%")
                    ->update([
                        'category_id' => $category->id,
                    ]);
                $message = "Successfully updated {$update} apps to category {$category->name}";
            }
        } catch (\Throwable $th) {
            return response()->json([
                'error' => $th->getMessage(),
            ], 400);
        }
        return response()->json([
            'data' => $category,
            'message' => $message,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            Validator::validate(['id' => $id], [
                'id' => 'required|exists:tblapp_categories,id',
            ]);
            $category = AppCategories::findOrFail($id);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => $th->getMessage(),
            ], 400);
        }

        return response()->json([
            'data' => $category,
            'message' => 'Successfully retrieved category',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $category = AppCategories::findOrFail($id);
            $category->update($request->all());
        } catch (\Throwable $th) {
            return response()->json([
                'error' => $th->getMessage(),
            ], 400);
        }

        return response()->json([
            'message' => 'Successfully updated category',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            Validator::validate(['id' => $id], [
                'id' => 'required|exists:tblapp_categories,id',
            ]);
            AppCategories::destroy($id);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => $th->getMessage(),
            ], 400);
        }

        return response()->json([
            'message' => 'Successfully deleted category'
        ]);
    }
}
