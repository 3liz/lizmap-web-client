<?php

$locales = array(

    'title'=>'Configuration of the mailer',
    'title.webmaster'=>'Webmaster',
    'title.server'=>'Mailer',

    'description.webmaster'=>'The email and name under which emails will be sent by the application',
    'label.webmasterEmail'=>'Email',
    'label.webmasterName'=>'Name',
    'label.mailerType'=>'How to send mail ?',
    'label.hostname'=>'Hostname of your mail server',
    'label.sendmailPath'=>'path to the \'sendmail\'  command',
    'label.sendmailPath.description'=>'example : /usr/bin/sendmail',
    'label.smtpHost'=>'SMTP Server(s)',
    'label.smtpHost.description'=>'All hosts must be separated by a semicolon : "smtp1.example.com:25;smtp2.example.com"',
    'label.smtpPort'=>'SMTP Server Port',
    'label.smtpAuth'=>'Use Authentication for the SMTP server ?',
    'label.smtpUsername'=>'Login to connect to SMTP server',
    'label.smtpPassword'=>'Password',
    'label.smtpTimeout'=>'Timeout of the SMTP connection',
    'label.smtpSecure'=>'Security for the connection',
    'label.smtpSecure.none'=>'none',
    'label.smtpSecure.ssl'=>'SSL',
    'label.smtpSecure.tls'=>'TLS',


    'error.missing.webmasterEmail'=>'webmaster email is missing',
    'error.missing.sendmailPath'=>'sendmail path is missing',
    'error.missing.smtpHost'=>'SMTP host is missing',
    'error.smtpPort'=>'SMTP port should be a number',
    'error.missing.smtpUsername'=>'SMTP login is missing',
    'error.missing.smtpPassword'=>'SMTP password is missing',

);
