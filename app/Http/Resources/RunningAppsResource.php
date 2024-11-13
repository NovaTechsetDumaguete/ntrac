<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

use Carbon\Carbon;

class RunningAppsResource extends JsonResource
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
            'description' => $this->description,
            'category_id' => $this->category_id,
            'taskid' => $this->taskid,
            'userid' => $this->userid,
            'date' => $this->date,
            'time' => $this->time,
            'epoch' => Carbon::createFromFormat('Y-m-d H:m:s', $this->date . ' ' . $this->time)->timestamp,
            'status' => $this->status,
            //'employee' => new EmployeeResource($this->employee),
            //'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
