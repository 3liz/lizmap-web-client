<?php
class lzmAuthListener extends jEventListener
{

    function onjcommunity_registration_prepare_save($event)
    {
        $event->user->comment = $event->form->getData('comment');
    }



}