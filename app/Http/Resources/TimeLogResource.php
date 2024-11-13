<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TimeLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'emp_id' => $this->emp_id,
            'session_id' => $this->session_id,
            'action' => $this->action,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
