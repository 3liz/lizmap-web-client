<?php

/**
 * @author     Laurent Jouanneau
 * @copyright  2020-2021 3liz
 */

namespace Lizmap\Logger;

/**
 * Message class for metrics, to use with jLog.
 */
class MetricsLogMessage implements \jILogMessage
{
    /**
     * @var string the category of the message
     */
    protected $category;

    /**
     * @var array the message
     */
    protected $content;

    /**
     * rmqSaasLogMessage constructor.
     *
     * @param array  $content
     * @param string $category
     */
    public function __construct($content, $category = 'default')
    {
        $this->category = $category;
        $this->content = $content;
    }

    public function addContent(array $data)
    {
        $this->content = array_merge($this->content, $data);
    }

    public function getCategory()
    {
        return $this->category;
    }

    public function getMessage()
    {
        return json_encode($this->content);
    }

    public function getFormatedMessage()
    {
        return json_encode($this->content, JSON_PRETTY_PRINT);
    }
}
