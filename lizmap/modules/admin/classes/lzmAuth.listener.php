<?php
class lzmAuthListener extends jEventListener
{

    function onjcommunity_registration_prepare_save($event)
    {
        $event->user->comment = $event->form->getData('comment');
        $event->user->firstname = $event->form->getData('firstname');
        $event->user->lastname = $event->form->getData('lastname');
        $event->user->organization = $event->form->getData('organization');
    }

    function onjcommunity_registration_after_save($event) {

        $services = lizmap::getServices();
        if( $email = filter_var($services->adminContactEmail, FILTER_VALIDATE_EMAIL) ){
            $mail = new jMailer();
            $mail->Subject = jLocale::get("admin~user.email.admin.subject");
            $mail->Body = jLocale::get("admin~user.email.admin.body",
                array($event->user->login, $event->user->email));
            $mail->AddAddress( $email, 'Lizmap Notifications');
            $mail->Send();
        }
    }

    function onjauthdbAdminGetViewInfo(jEvent $event) {
        $form = $event->form;
        if ($event->himself || !jAcl2::check('auth.users.view')) {
            $form->deactivate('status');
            $form->deactivate('create_date');
        }
        $form->deactivate('keyactivate');
        $form->deactivate('request_date');
    }


    function onjauthdbAdminPrepareUpdate(jEvent $event)
    {
        $this->onjauthdbAdminGetViewInfo($event);
    }

    function onjauthdbAdminEditUpdate(jEvent $event)
    {
        $this->onjauthdbAdminGetViewInfo($event);
    }

    function onjauthdbAdminPrepareCreate(jEvent $event)
    {
        $form = $event->form;
        $form->deactivate('status');
        $form->deactivate('create_date');
        $form->deactivate('keyactivate');
        $form->deactivate('request_date');
    }

    function onjauthdbAdminEditCreate(jEvent $event)
    {
        $this->onjauthdbAdminPrepareCreate($event);
    }

    function onjauthdbAdminCheckCreateForm(jEvent $event)
    {
        $event->form->setData('status', \Jelix\JCommunity\Account::STATUS_VALID);
    }

}