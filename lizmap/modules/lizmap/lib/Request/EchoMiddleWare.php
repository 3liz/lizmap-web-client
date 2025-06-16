<?php

namespace Lizmap\Request;

use GuzzleHttp\Psr7\Utils;
use Lizmap\App;
use Lizmap\App\AppContextInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

class EchoMiddleWare
{
    /**
     * encoded "__echo__&".
     */
    public const ENCODED_ECHO_PARAM = '%5F%5Fecho%5F%5F=&';

    private AppContextInterface $appContext;

    public function __construct(AppContextInterface $appContext)
    {
        $this->appContext = $appContext;
    }

    /**
     * check if $body contains a '__echo__=&' param.
     *
     * @return bool
     */
    public function hasEchoInBody(string $body)
    {
        return strstr($body, self::ENCODED_ECHO_PARAM);
    }

    protected function buildResponseCallable($content): callable
    {
        return function (ResponseInterface $response) use ($content) {

            return $response
                ->withBody(Utils::streamFor($content))
                ->withHeader('Content-Type', 'text/json')
            ;
        };
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
            // key : md5 , value : useful content
            foreach ($nLastLines as $line) {
                $words = explode("\t", $line);
                if (count($words) > 4
                    && $md5ToSearch == $words[3]) {
                    // return the Url submitted to server
                    return $words[4];
                }
            }

            return $md5ToSearch.' not found';
        }

        return 'echoproxy.log not found';
    }

    /**
     * Log the URL and its body in the 'echoproxy' log file
     * We add a md5 hash of the string to help retrieving it later
     * NOTE : currently we log only the url & body, thus it doesn't really need to be logged
     * because the same url & body are needed to retrieve the content
     * but the function will be useful when it will log additional content.
     */
    public function logRequestToEcho(string $url, string $body)
    {
        $md5 = md5($url.'|'.$body);
        $this->appContext->logMessage($md5."\t".$url.'?'.$body, 'echoproxy');
    }

    public function __invoke(callable $handler)
    {
        return function (RequestInterface $request, array $options) use ($handler) {
            // invoke the initial handler
            $promise = $handler($request, $options);

            if ($this->hasEchoInBody($request->getBody())) {
                $content = $this->getEchoFromRequest($request->getUri(), $request->getBody());

                return $promise->then($this->buildResponseCallable($content));
            }
            // All requests are logged
            $this->logRequestToEcho($request->getUri(), $request->getBody());

            return $promise;
        };
    }
}
