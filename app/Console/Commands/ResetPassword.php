<?php

namespace App\Console\Commands;

use App\Models\Employee;
use Illuminate\Console\Command;

class ResetPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-password';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    public function resetPassword($id)
    {
        try {
            $crypt = bcrypt('123456');
            $user = Employee::find($id);
            $user->password = bcrypt($crypt);
            $user->save();
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'status' => 'done',
        ]);
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $employees = Employee::select('id', 'password')
            ->where('type', 'User')
            ->where('status', 'Approved')
            ->get();

        foreach ($employees as $employee) {
            $this->resetPassword($employee->id);
        }

        $this->info('Password reset successfully');
        return 0;
    }
}
