<?php

namespace App\Console\Commands;

use App\Events\ReportExported;
use App\Models\User;
use Illuminate\Console\Command;

class UpdateEmpId extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-emp-id';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user = User::find(1);
        ReportExported::dispatch($user);
        // echo json_encode($user);
        return true;
    }
}
