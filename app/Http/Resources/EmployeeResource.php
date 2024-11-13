<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        //print_r($this->runningapps);
        return [
            'id' => $this->id,
            //'user_image' => $this->user_image,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'position' => $this->position,
            'department' => $this->department,
            'username' => $this->username,
            'email' => $this->email,
            'type' => $this->type,
            'status' => $this->status,
            //'categories' => $this->categories,
            'runningapps' => $this->runningapps,
            //'runningapps' => RunningAppsResource::collection($this->runningapps),
            //'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
