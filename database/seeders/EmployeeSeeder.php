<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $employees = [
            new Account("Jed", "Zerna", "Software Engineer", "IT Department", "a", "a", "jzerna@novatechset.com", "Admin", "Active"),
            new Account("Daisy", "Lago", "Master", "IT Department", "dlago", "b", "dlago@novatechset.com", "", "Pending"),
            new Account("Daisy Jane", "Lago", "Proof Collator", "Production", "dalagoo", "aa", "dalagoo@novatechset.com", "User", "Pending"),
            new Account("Mon", "Mon", "Senior Software Engineer", "IT Department", "mmon", "s", "mon@mon.com", "User", "Pending"),
            new Account("Dave", "Omandam", "IT Support Engineer", "IT Department", "domandam", "do", "domandam@novatechset.com", "User", "Pending"),
            new Account("Jerol", "Adorable", "Software Engineer", "IT Department", "jerol", "j", "jadorable@novatechset.com", "User", "Active")
        ];

        foreach ($employees as $employee) {
            \App\Models\Employee::factory()->create([
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'position' => $employee->position,
                'department' => $employee->department,
                'username' => $employee->username,
                'password' => $employee->password,
                'email' => $employee->email,
                'type' => $employee->type,
                'status' => $employee->status
            ]);
        }
    }
}

# Account class to hold employee data
class Account
{
    public $first_name;
    public $last_name;
    public $position;
    public $department;
    public $username;
    public $password;
    public $email;
    public $type;
    public $status;

    function __construct(
        $first_name,
        $last_name,
        $position,
        $department,
        $username,
        $password,
        $email,
        $type,
        $status
    ) {
        $this->first_name = $first_name;
        $this->last_name = $last_name;
        $this->position = $position;
        $this->department = $department;
        $this->username = $username;
        $this->password = $password;
        $this->email = $email;
        $this->type = $type;
        $this->status = $status;
    }
}
