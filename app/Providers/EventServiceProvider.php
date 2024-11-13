<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Console\Events\CommandFinished;
use Illuminate\Console\Events\CommandStarting;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Command starting time
     */
    public $starting_time;

    /**
     * Command finished time
     */
    public $finished_time;

    /**
     * Log these commands
     */
    private $exec_commands = [
        'budol:time-log',
        'app:dupe-login',
        'app:fix-category',
    ];

    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        Event::listen(CommandStarting::class, function (CommandStarting $event) {
            $this->starting_time = microtime(true);
        });

        Event::listen(CommandFinished::class, function (CommandFinished $event) {
            $this->finished_time = microtime(true);
            $time = (($this->finished_time - $this->starting_time)); // time in seconds

            // here you can store, display or log time for future use.
            if(in_array($event->command, $this->exec_commands)) {
                Log::info("Command [$event->command] takes $time seconds.");
            }
        });
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     *
     * @return bool
     */
    public function shouldDiscoverEvents()
    {
        return false;
    }
}
