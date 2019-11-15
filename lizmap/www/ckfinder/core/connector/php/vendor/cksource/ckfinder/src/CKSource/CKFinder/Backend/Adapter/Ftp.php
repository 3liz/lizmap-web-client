<?php
/*
 * CKFinder
 * ========
 * http://cksource.com/ckfinder
 * Copyright (C) 2007-2016, CKSource - Frederico Knabben. All rights reserved.
 *
 * The software, this file and its contents are subject to the CKFinder
 * License. Please read the license.txt file before using, installing, copying,
 * modifying or distribute this file or part of its contents. The contents of
 * this file is part of the Source Code of CKFinder.
 */
namespace CKSource\CKFinder\Backend\Adapter;

use League\Flysystem\AdapterInterface;

/**
 * Class Ftp
 *
 * Customized FTP adapter to avoid performance issue introduced with following change:
 * https://github.com/thephpleague/flysystem/commit/846ed144d2c888b68884b6ac9a6c8b0e74d87073
 *
 */
class Ftp extends \League\Flysystem\Adapter\Ftp
{
    /**
     * Normalize a file entry.
     *
     * @param string $item
     * @param string $base
     *
     * @return array normalized file array
     */
    protected function normalizeObject($item, $base)
    {
        $item = preg_replace('#\s+#', ' ', trim($item), 7);
        list($permissions, /* $number */, /* $owner */, /* $group */, $size,  $month, $day, $time, $name) = explode(' ', $item, 9);
        $type = $this->detectType($permissions);
        $path = empty($base) ? $name : $base.$this->separator.$name;

        /**
         * This date will be less accurate, but it will avoid additional requests to the FTP server.
         */
        $timestamp = strtotime($month.' '.$day.' '.$time);

        if ($type === 'dir') {
            return compact('type', 'path', 'timestamp');
        }

        $permissions = $this->normalizePermissions($permissions);
        $visibility = $permissions & 0044 ? AdapterInterface::VISIBILITY_PUBLIC : AdapterInterface::VISIBILITY_PRIVATE;
        $size = (int) $size;

        return compact('type', 'path', 'visibility', 'size', 'timestamp');
    }
}
