<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class PostAnomaly extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:post-anomaly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Anomaly Posting EOD';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('test');
    }
}
