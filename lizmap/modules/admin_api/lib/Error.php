<?php

namespace LizmapApi;

use Lizmap\Request\Proxy;

class Error
{
    /**
     * Sets the error in the provided response object based on the given error code.
     *
     * @param object $rep                the response object to which the error details will be assigned
     * @param mixed  $errorCode          the error code used to identify the error details from the predefined array
     * @param string $errorCustomMessage custom message, for example about specific vars that would be bad written
     *
     * @return object returns the updated response object containing the error details
     */
    public static function setError(object $rep, mixed $errorCode, string $errorCustomMessage = ''): object
    {
        $error = Error::getErrorFromCode($errorCode);

        // HTTP status code
        if ($error['http']) {
            $rep->setHttpStatus(
                $error['code'],
                Proxy::getHttpStatusMsg($error['code']),
            );
        }

        $errorMessage = $error['message'];

        if (!empty($errorCustomMessage)) {
            $errorMessage = $errorMessage.' '.$errorCustomMessage;
        }

        $rep->data = array(
            'code' => Proxy::getHttpStatusMsg($error['code']),
            'status' => $error['code'],
            'message' => $errorMessage,
        );

        return $rep;
    }

    public static function getErrorFromCode(string $errorCode): array
    {
        // This structure is made like this id we want to add custom error codes
        // which would not be defined by a traditional HTTP Error code
        $errorsArray = array(
            '400' => array(
                'code' => 400,
                'message' => 'The request cannot be fulfilled due to bad syntax.',
                'http' => true,
            ),
            '401' => array(
                'code' => 401,
                'message' => 'Unauthorized. Basic authentication is required to access this resource.',
                'http' => true,
            ),
            '404' => array(
                'code' => 404,
                'message' => 'Resource not found. Please provide a valid entry.',
                'http' => true,
            ),
            '409' => array(
                'code' => 409,
                'message' => 'The request cannot be fulfilled due to conflict.',
                'http' => true,
            ),
            '500' => array(
                'code' => 500,
                'message' => 'The server encountered an error.',
                'http' => true,
            ),
            '501' => array(
                'code' => 501,
                'message' => 'This action is not implemented.',
                'http' => true,
            ),
        );

        return $errorsArray[''.$errorCode];
    }
}
