<?php

/**
 * Log lizmap actions.
 *
 * @author    3liz
 * @copyright 2012 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapLogListener extends jEventListener
{
    /**
     * When a user logs in.
     *
     * @param mixed $event
     */
    public function onAuthCanLogin($event)
    {
        $key = 'login';
        $data = array(
            'key' => $key,
            'user' => $event->getParam('login'),
            'repository' => null,
            'project' => null,
        );

        $this->addLog($key, $data);
    }

    /**
     * Event emitted by lizmap controllers.
     *
     * @param mixed $event
     */
    public function onLizLogItem($event)
    {
        $key = $event->getParam('key');

        // Build data array from event params
        $logConfig = lizmap::getLogConfig();
        $logItem = $logConfig->getLogItem($key);
        $data = array();
        if ($logItem) {
            foreach ($logItem->getRecordKeys() as $rk) {
                if ($event->getParam($rk)) {
                    $data[$rk] = $event->getParam($rk);
                }
            }

            // Add log to the database
            $this->addLog($key, $data);
        }
    }

    /**
     * Add log when needed.
     *
     * @param string $key  key of the log item to handle
     * @param array  $data array of data to log for this item
     */
    public function addLog($key, $data)
    {

        // Get log item properties
        $logConfig = lizmap::getLogConfig();
        $logItem = $logConfig->getLogItem($key);

        // Optionnaly log detail
        if ($logItem->getData('logDetail')) {

            // user who modified the line
            if (!array_key_exists('user', $data)) {
                $juser = jAuth::getUserSession();
                $data['user'] = $juser->login;
            }

            // Add IP if needed
            if ($logItem->getData('logIp')) {
                $data['ip'] = jApp::coord()->request->getIP();
            }

            // Insert log
            $logItem->insertLogDetail($data);

            // Send an email
            if ($logItem->getData('logEmail')
                && in_array($key, array('editionSaveFeature', 'editionDeleteFeature'))
            ) {
                $this->sendEmail($key, $data);
            }
        }

        // Optionnaly log count
        if ($logItem->getData('logCounter')) {
            $logItem->increaseLogCounter($data['repository'], $data['project']);
        }
    }

    /**
     * Send an email to the administrator.
     *
     * @param mixed $key
     * @param mixed $data
     */
    private function sendEmail($key, $data)
    {
        $services = lizmap::getServices();
        // Build subject and body
        $subject = '['.$services->appName.'] '.jLocale::get('admin~admin.logs.email.subject');

        $body = jLocale::get("admin~admin.logs.email.{$key}.body");

        foreach ($data as $k => $v) {
            if (empty($v)) {
                continue;
            }
            if ($k == 'key') {
                continue;
            }
            if ($k == 'content') {
                if ($key == 'editionSaveFeature' or $key == 'editionDeleteFeature') {
                    $content = array_map('trim', explode(',', $v));
                    foreach ($content as $item) {
                        $itemdata = array_map('trim', explode('=', $item));
                        if (count($itemdata) == 2) {
                            $body .= "\r\n".'  * '.$itemdata[0].' = '.$itemdata[1];
                        }
                    }
                }
            } else {
                $body .= "\r\n  * {$k} = {$v}";
            }
        }

        // Send email
        $services->sendNotificationEmail($subject, $body);
    }
}
