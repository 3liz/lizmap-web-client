<?php

class lzmAuthListener extends jEventListener
{
    public function onjcommunity_registration_prepare_save($event)
    {
        /** @var jFormsBase $form */
        $form = $event->form;
        $event->user->comment = $form->getData('comment');
        $event->user->firstname = $form->getData('firstname');
        $event->user->lastname = $form->getData('lastname');
        $event->user->organization = $form->getData('organization');
    }

    public function onjcommunity_registration_after_save($event)
    {
        $services = lizmap::getServices();
        $services->sendNotificationEmail(
            jLocale::get('admin~user.email.admin.subject'),
            jLocale::get(
                'admin~user.email.admin.body',
                array($event->user->login, $event->user->email)
            )
        );
    }
}
