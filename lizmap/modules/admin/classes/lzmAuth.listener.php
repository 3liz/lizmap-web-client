<?php

class lzmAuthListener extends jEventListener
{
    public function onjcommunity_registration_prepare_save($event)
    {
        $event->user->comment = $event->form->getData('comment');
        $event->user->firstname = $event->form->getData('firstname');
        $event->user->lastname = $event->form->getData('lastname');
        $event->user->organization = $event->form->getData('organization');
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
