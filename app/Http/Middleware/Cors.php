<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;

class Cors
{
    public function handle($request, Closure $next)
    {
        header("Access-Control-Allow-Origin: *");
        //ALLOW OPTIONS METHOD
        $headers = [
            'Access-Control-Allow-Methods' => 'POST,GET,OPTIONS,PUT,DELETE',
            'Access-Control-Allow-Headers' => 'Authorization,Accept,Origin,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range',
        ];

        $response = $next($request);
        foreach ($headers as $key => $value) {
            $response->header($key, $value);
        }

        if ($request->getMethod() != "OPTIONS") {
            //The client-side application can set only headers allowed in Access-Control-Allow-Headers
            // return response()->json('OK', 200, $headers);
            $details = [
                'ip' => $request->header('x-forwarded-for'),
                'user' => $request->user(),
                'method' => $request->method(),
                'referer' => url()->full(),
                'mac_address' => exec('getmac'),
            ];
            // Log::channel('accesslog')->info(json_encode($details, JSON_PRETTY_PRINT));
        }

        return $response;
    }
}
