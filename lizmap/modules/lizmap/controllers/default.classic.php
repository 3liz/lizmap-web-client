<?php

/**
 * Redirect to the default repository project list page.
 *
 * @author    3liz
 * @copyright 2011-2019 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class defaultCtrl extends jController
{
    /**
     * Redirect to the default repository project list.
     *
     * @return jResponseRedirect Redirection to the default repository list
     */
    public function index()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        // Get repository data
        $repository = $this->param('repository');
        // Get the corresponding repository
        $lrep = lizmap::getRepository($repository);

        // Set the redirection parameters
        if ($lrep) {
            $rep->params = array('repository' => $lrep->getKey());
        }

        $rep->action = 'view~default:index';

        return $rep;
    }
}
