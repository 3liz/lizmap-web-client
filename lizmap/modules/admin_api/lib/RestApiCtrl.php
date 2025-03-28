<?php

namespace LizmapApi;

class RestApiCtrl extends \jController implements \jIRestController
{
    public function get(): object
    {
        $rep = $this->getResponse('json');

        return Error::setError($rep, 501);
    }

    public function post(): object
    {
        $rep = $this->getResponse('json');

        return Error::setError($rep, 501);
    }

    public function put()
    {
        $rep = $this->getResponse('json');

        return Error::setError($rep, 501);
    }

    public function delete()
    {
        $rep = $this->getResponse('json');

        return Error::setError($rep, 501);
    }
}
