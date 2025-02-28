<?php

namespace LizmapApi;

use Lizmap\Request\Proxy;

class ErrorHttp {
    public static function setError($rep) {
        // HTTP status code
        $rep->setHttpStatus(
            501,
            Proxy::getHttpStatusMsg(501)
        );

        return $rep;
    }
}
