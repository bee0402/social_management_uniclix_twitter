<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactEmailController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    public function sendEmail(Request $request)
    {
        try {
            $validation = Validator::make($request->all(), [
                'email' => 'required|max:255',
                'name' => 'required|max:255',
                'subject' => 'required|max:255',
                'message' => 'required',
            ]);


            if ($validation->fails()) {
                $errors = $validation->errors();
                return response()->json(["errors" => $errors], 200);
            }

            $mailer = app()['mailer'];
            $templatename = 'email.contactEmail';
            $from = $request->input('email') ?  $request->input('email') : 'info@uniclixapp.com';
            $name = $request->input('name') != null ? $request->input('name') : '';
            $data = array(
                'email' => 'info@uniclixapp.com',
                'from' => $from,
                'subject' => $request->input('subject'),
                'name' => $name,
                'message' => $request->input('message')
            );

            $send_mail = $mailer->send(['html' => $templatename], ['data' => $data], function ($msg) use ($data) {
                $msg->to($data['email']);
                $msg->subject($data['subject']);
                $msg->from($data['from'], 'Uniclix');
            });

            return response()->json(["message" => "Success"], 200);
        } catch (\Exception $e) {
            throw $e;
        }
    }
}
