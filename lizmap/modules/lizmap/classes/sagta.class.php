<?php
/**
 * SAGTA authentication
 *
 * @author    Kartoza
 * @copyright 2022 Kartoza
 *
 * @see      http://kartoza.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

$GLOBALS['SAGTA_URL'] = getEnv('SAGTA_URL');
$GLOBALS['CLIENT_ID'] = getEnv('CLIENT_ID');
$GLOBALS['SECRET_ID'] = getEnv('SECRET_ID');
$GLOBALS['REDIRECT_URI'] = getEnv('REDIRECT_URI');

class sagta
{

    public static function clearTokenCache()
    {
        unset($_SESSION['at']);
        unset($_SESSION['rt']);
    }

    public static function setTokenCache($auth_token)
    {
        $_SESSION['at'] = $auth_token['access_token'];
        $_SESSION['rt'] = $auth_token['refresh_token'];
    }

    public static function getTokenCache()
    {
        $access_token = null;
        $refresh_token = null;

        if (array_key_exists('at', $_SESSION)) {
            $access_token = $_SESSION['at'];
        }
        if (array_key_exists('rt', $_SESSION)) {
            $refresh_token = $_SESSION['rt'];
        }
        $auth_token = array(
            "access_token"      => $access_token,
            "refresh_token"     => $refresh_token
        );

        return $auth_token;
    }

    public static function CallAPI($method, $url, $data = false, $headers = null)
    {
        try {
            $ch = curl_init();

            switch ($method){
                case "POST":
                    curl_setopt($ch, CURLOPT_POST, 1);
                    if ($data)
                        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
                    break;
                case "PUT":
                    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
                    if ($data)
                        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
                    break;
                default:
                    if ($data)
                        $url = sprintf("%s?%s", $url, http_build_query($data));
           }

            if ($headers) {
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            }

            // Check if initialization had gone wrong*
            if ($ch === false) {
                throw new Exception('failed to initialize');
            }

            // Better to explicitly set URL
            curl_setopt($ch, CURLOPT_URL, $url);
            // That needs to be set; content will spill to STDOUT otherwise
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

            $content = curl_exec($ch);

            // Check the return value of curl_exec(), too
            if ($content === false) {
                throw new Exception(curl_error($ch), curl_errno($ch));
            }

            // Check HTTP return code, too; might be something else than 200
            $httpReturnCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            /* Process $content here */

        } catch(Exception $e) {

            return null;

        } finally {
            // Close curl handle unless it failed to initialize
            if (is_resource($ch)) {
                curl_close($ch);
            }
            return $content;
        }
    }

    /**
    * Request authorization token from authorization server using code.
    *
    * @param string $code. Single-use token from the server.
    *
    * @return authorization token and refresh token
    */
    public static function getAuthToken($code) {

        $url = "{$GLOBALS['SAGTA_URL']}/o/token/";

        $data_array = array(
            "grant_type"    => "authorization_code",
            "code"          => $code,
            "client_id"     => $GLOBALS['CLIENT_ID'],
            "redirect_uri"  => $GLOBALS['REDIRECT_URI'],
            "client_secret" => $GLOBALS['SECRET_ID']
        );

        $result = self::CallAPI('POST', $url, $data_array);
        $result_obj = json_decode($result);

        $auth_token = array(
            "access_token"      => "",
            "refresh_token"     => ""
        );

        if (property_exists($result_obj, 'access_token')) {
           // Save access_token and refresh_token to redis
            $auth_token = array(
                "access_token"      => $result_obj->access_token,
                "refresh_token"     => $result_obj->refresh_token
            );
        }

        return $auth_token;
    }

    public static function checkLogin()
    {
        $auth_code = null;
        $auth_token = self::getTokenCache();
        $userSession = jAuth::getUserSession();

        if (array_key_exists('code', $_GET)) {
            $auth_code = $_GET['code'];
        }

        if ($auth_code and empty($auth_token['access_token'])) {
            $auth_token = self::getAuthToken($auth_code);
        }

        if (empty($auth_token['access_token']) == false) {
            $headers = array(
                "Authorization: Bearer {$auth_token['access_token']}",
            );
            $is_member = self::CallAPI(
                'GET',
                "{$GLOBALS['SAGTA_URL']}/user_info/",
                false,
                $headers);
            $is_member = json_decode($is_member);

            if (property_exists($is_member, 'username')) {
                if ($userSession->login) {
                    // logged in
                } else {
                    self::setTokenCache($auth_token);
                    jAuth::login(getEnv('MEMBER_USERNAME'), getEnv('MEMBER_PASSWORD'));
                }
            } else {
                jAuth::logout();
                self::clearTokenCache();
                unset($_SESSION['JELIX_AUTH_LASTTIME']);
            }
        }
    }
}