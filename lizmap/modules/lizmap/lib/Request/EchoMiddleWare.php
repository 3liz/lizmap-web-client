<?php

namespace Lizmap\Request;

use GuzzleHttp\Psr7\Response;
use Lizmap\App;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

class EchoMiddleWare
{
    /**
     * encoded "__echo__&".
     */
    public const ENCODED_ECHO_PARAM = '%5F%5Fecho%5F%5F=&';

    /**
     * check if $body contains a '__echo__=&' param.
     *
     * @return bool
     */
    public function hasEchoInBody(string $body)
    {
        return strstr($body, self::ENCODED_ECHO_PARAM);
    }

    /**
     * Try to find the content stored in log for a previous request.
     *
     * @param string $url  request URL
     * @param string $body request body
     */
    public function getEchoFromRequest(string $url, string $body): string
    {
        // md5 hash to search in the file
        $md5ToSearch = md5($url.'|'.str_replace(self::ENCODED_ECHO_PARAM, '', $body));

        $logPath = \jApp::logPath('echoproxy.log');
        if (is_file($logPath)) {
            // retrieve the 50 last lines
            $nLastLines = preg_split("/\r\n|\n|\r/", App\FileTools::tail($logPath, 50));
            // key : md5 , value : usefull content
            foreach ($nLastLines as $line) {
                $words = explode("\t", $line);
                if (count($words) > 4
                    && $md5ToSearch == $words[3]) {
                    // return the Url submitted to server
                    return $words[4];
                }
            }

            return 'unfound '.$md5ToSearch;
        }

        return 'unfound echoproxy.log';
    }

    /**
     * Log the URL and its body in the 'echoproxy' log file
     * We add a md5 hash of the string to help retrieving it later
     * NOTE : currently we log only the url & body, thus it doesn't really need to be logged
     * because the same url & body are needed to retreive the content
     * but the function will be useful when it will log additionnal content.
     */
    public function logRequestToEcho(string $url, string $body)
    {
        $md5 = md5($url.'|'.$body);
        \jLog::log($md5."\t".$url.'?'.$body, 'echoproxy');
    }

    public function __invoke(callable $handler)
    {
        return function (RequestInterface $request, array $options) use ($handler) {
            if ($this->hasEchoInBody($request->getBody())) {
                $content = $this->getEchoFromRequest($request->getUri(), $request->getBody());

                $promise = $handler($request, $options);

                return $promise->then(
                    function (ResponseInterface $response) use ($content) {
                        // We do not perform the request, but return the content previously logged
                        return new Response(
                            200,
                            array('Content-Type' => 'text/json'),
                            $content
                        );
                    }
                );
            }
            // All requests are logged
            $this->logRequestToEcho($request->getUri(), $request->getBody());

            // invoke the initial handler
            return $handler($request, $options);
        };
    }
}
