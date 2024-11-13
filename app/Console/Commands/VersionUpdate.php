<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;

class VersionUpdate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:version-update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Release Updates';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $latest = DB::table('tblappversion')->orderBy('id', 'desc')->first();
        Redis::set('latest:version', json_encode($latest), 'EX', 86400);
    }
}
