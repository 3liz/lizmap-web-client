<?php

$locales = array(

    'title'=>'Configuration de l\'envoi de mail',
    'title.webmaster'=>'Webmestre',
    'title.server'=>'Type d\'envoi de mail',

    'description.webmaster'=>'Courriel et nom de l\'expediteur sous lequel l\'application enverra des emails',
    'label.webmasterEmail'=>'Courriel',
    'label.webmasterName'=>'Nom',
    'label.mailerType'=>'Comment sont envoyés les Courriels ?',
    'label.hostname'=>'nom d\'hôte du serveur de courriel',
    'label.sendmailPath'=>'Chemin vers la commande \'sendmail\'',
    'label.sendmailPath.description'=>'exemple : /usr/bin/sendmail',
    'label.smtpHost'=>'Serveur(s) SMTP',
    'label.smtpHost.description'=>'Tous les serveur SMTP doivent être séparés par un point virgule exemple : "smtp1.example.com:25;smtp2.example.com"',
    'label.smtpPort'=>'Port du serveur SMTP',
    'label.smtpAuth'=>'Utiliser l\'authentification pour ce serveur SMTP ?',
    'label.smtpUsername'=>'identifiant de connexion au serveur SMTP',
    'label.smtpPassword'=>'mot de passe',
    'label.smtpTimeout'=>'Délai avant déconnexion au serveur SMTP',
    'label.smtpSecure'=>'Sécurité de la connexion',
    'label.smtpSecure.none'=>'aucune',
    'label.smtpSecure.ssl'=>'SSL',
    'label.smtpSecure.tls'=>'TLS',
    
    'error.missing.webmasterEmail'=>'Courriel de l\'expediteur manquant',
    'error.missing.sendmailPath'=>'Chemin de sendmail manquant',
    'error.missing.smtpHost'=>'nom d\'hôte du serveur SMTP manquant',
    'error.smtpPort'=>'Numéro de port du serveur SMTP invalide',
    'error.missing.smtpUsername'=>'identifiant de connexion SMTP manquant',
    'error.missing.smtpPassword'=>'mot de passe de connexion SMTP manquant',
);
