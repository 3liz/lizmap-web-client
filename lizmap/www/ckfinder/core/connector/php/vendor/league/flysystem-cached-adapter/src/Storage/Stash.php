<?php

namespace League\Flysystem\Cached\Storage;

use Stash\Pool;

class Stash extends AbstractCache
{
    /**
     * @var string storage key
     */
    protected $key;

    /**
     * @var int|null seconds until cache expiration
     */
    protected $expire;

    /**
     * @var \Stash\Pool Stash pool instance
     */
    protected $pool;

    /**
     * Constructor.
     *
     * @param \Stash\Pool $pool
     * @param string      $key    storage key
     * @param int|null    $expire seconds until cache expiration
     */
    public function __construct(Pool $pool, $key = 'flysystem', $expire = null)
    {
        $this->key = $key;
        $this->expire = $expire;
        $this->pool = $pool;
    }

    /**
     * {@inheritdoc}
     */
    public function load()
    {
        $item = $this->pool->getItem($this->key);
        $contents = $item->get();

        if ($item->isMiss() === false) {
            $this->setFromStorage($contents);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function save()
    {
        $contents = $this->getForStorage();
        $item = $this->pool->getItem($this->key);
        $item->set($contents, $this->expire);
    }
}
