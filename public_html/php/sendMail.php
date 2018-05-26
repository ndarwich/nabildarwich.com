<?php
	$to = 'dnabil1996@gmail.com';
	$subject = 'NABILDARWICH.COM ' . $_POST['subject'];
	$headers = 'From: ' . $_POST['email'] . "\r\n" .
		'Reply-To: ' . $_POST['email'];
  $response = $_POST["g-recaptcha-response"];
  $url = 'https://www.google.com/recaptcha/api/siteverify';
  $data = array(
    'secret' => '6LeWHVsUAAAAAAcLySamR5oeIE2rm-25tZFMVXxu',
    'response' => $_POST["g-recaptcha-response"]
  );
  $options = array(
    'http' => array (
      'method' => 'POST',
      'content' => http_build_query($data)
    )
  );
  $context  = stream_context_create($options);
  $verify = file_get_contents($url, false, $context);
  $captcha_success=json_decode($verify);
  if ($captcha_success->success==false) {
	  $message = 'BOT ' . $_POST['name'] . " " . "wrote:" . "\n\n " . $_POST['message'];
  	mail($to, $subject, $message, $headers);
    echo "Since you Are a bot. I will not prioritize your message.";
  } else if ($captcha_success->success==true) {
  	$message = 'HUMAN ' . $_POST['name'] . " " . "wrote:" . "\n\n " . $_POST['message'];
  	mail($to, $subject, $message, $headers);
  	echo "Hello Human. Thanks a lot for contacting me! You will be redirected shortly";
  }
	header("refresh:5;url=../index.html" );
exit;
?>
