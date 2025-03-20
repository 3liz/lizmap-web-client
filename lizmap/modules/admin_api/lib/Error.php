<?php

namespace LizmapApi;

use Lizmap\Request\Proxy;

class Error {

    /**
     * Sets the error in the provided response object based on the given error code.
     *
     * @param object $rep The response object to which the error details will be assigned.
     * @param mixed $errorCode The error code used to identify the error details from the predefined array.
     * @return object Returns the updated response object containing the error details.
     */
    public static function setError(object $rep, mixed $errorCode): object
    {

        // This structure is made like this id we want to add custom error codes
        // which would not be defined by a traditional HTTP Error code
        $errorsArray = array(
            "401" => array(
                "code" => 401,
                "message" => "Unauthorized. Basic authentication is required to access this resource.",
                "http" => true,
            ),
            "404" => array(
                "code" => 404,
                "message" => "Repository not found. Please provide a valid repository.",
                "http" => true,
            ),
            "501" => array(
                "code" => 501,
                "message" => "This action is not implemented.",
                "http" => true,
            ),
        );

        $error = $errorsArray["".$errorCode];

        // HTTP status code
        if ($error["http"]) {
            $rep->setHttpStatus(
                $error["code"],
                Proxy::getHttpStatusMsg($error["code"]),
            );
        }

        $rep->data = array(
            'error code' => $error["code"],
            'error message' => $error["message"],
        );

        return $rep;
    }
}
