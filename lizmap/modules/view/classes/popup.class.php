<?php

/**
 * Class with methods relative to Lizmap Popups.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 */

use Lizmap\Request\RemoteStorageRequest;

class popup
{
    /**
     * Replace a feature attribute value by its html representation.
     *
     * @param string $attributeName        feature Attribute name
     * @param string $attributeValue       feature Attribute value
     * @param string $repository           lizmap Repository
     * @param string $project              name of the project
     * @param string $popupFeatureContent  Content of the popup template (created by lizmap plugin) and passed several times. IF false, return only modified attribute.
     * @param array  $remoteStorageProfile webDav profile
     *
     * @return string the html for the feature attribute
     */
    public function getHtmlFeatureAttribute($attributeName, $attributeValue, $repository, $project, $popupFeatureContent = null, $remoteStorageProfile = null)
    {

        // Force $attributeValue to be a string
        $attributeName = (string) $attributeName;
        $attributeValue = (string) $attributeValue;
        if ($attributeValue == 'NULL') {
            $attributeValue = '';
        }

        // Regex to replace links, medias and images
        $urlRegex = '/^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/';
        $emailRegex = '/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/';
        $imageRegex = '/\.(jpg|jpeg|png|gif|bmp)$/i';
        $mediaRegex = '/^(..\/|\/)?media\//';
        $mediaTextRegex = '/\.(txt|htm|html)$/i';

        $isWebDav = false;
        if ($remoteStorageProfile && preg_match('#'.$remoteStorageProfile['baseUri'].'#', $attributeValue)) {
            $attributeValue = preg_replace('#'.$remoteStorageProfile['baseUri'].'#', RemoteStorageRequest::$davUrlRootPrefix, $attributeValue);
            $isWebDav = true;
        }

        // Remote urls and images
        if (preg_match($urlRegex, $attributeValue) && !$isWebDav) {
            if (preg_match($imageRegex, $attributeValue)) {
                $attributeValue = '<img src="'.$attributeValue.'" border="0"/>';
            } elseif (!$popupFeatureContent) { // only if no template is passed by the user
                $attributeValue = '<a href="'.$attributeValue.'" target="_blank">'.$attributeValue.'</a>';
            }
        }

        // E-mail
        if (preg_match($emailRegex, $attributeValue)) {
            if (!$popupFeatureContent) { // only if no template is passed by the user
                $attributeValue = '<a href="mailto:'.$attributeValue.'"</td></tr>';
            }
        }

        // Media = file stored in the repository media folder
        if (preg_match($mediaRegex, $attributeValue) || $isWebDav) {
            $sharps = array();
            preg_match('/(.+)#(page=[0-9]+)$/i', $attributeValue, $sharps);
            if (count($sharps) == 3) {
                $pathVal = $sharps[1];
                $sharp = $sharps[2];
            } else {
                $pathVal = $attributeValue;
                $sharp = '';
            }
            $req = jApp::coord()->request;
            $mediaUrl = jUrl::getFull(
                'view~media:getMedia',
                array('repository' => $repository, 'project' => $project, 'path' => $pathVal),
                0,
                $req->getDomainName().$req->getPort()
            );
            if ($sharp) {
                $mediaUrl .= '#'.$sharp;
            }

            // Display if it is an image
            if (preg_match($imageRegex, $attributeValue)) {
                if (!$popupFeatureContent) { // only if no template is passed by the user
                    $attributeValue = '<a href="'.$mediaUrl.'" target="_blank"><img src="'.$mediaUrl.'" border="0"/></a>';
                } else {
                    $attributeValue = $mediaUrl;
                }
            }

            // If a file containing text or html : get its content
            elseif (preg_match($mediaTextRegex, $attributeValue)) {
                $data = '';
                // Get full path to the file
                $lrep = lizmap::getRepository($repository);
                $repositoryPath = realpath($lrep->getPath());
                $abspath = realpath($repositoryPath.'/'.$attributeValue);

                $n_repositoryPath = str_replace('\\', '/', $repositoryPath);
                $n_abspath = $n_repositoryPath.'/'.trim($attributeValue, '/');
                // manually canonize path to authorize symlink
                $n_abspath = explode('/', $n_abspath);
                $n_keys = array_keys($n_abspath, '..');
                foreach ($n_keys as $keypos => $key) {
                    array_splice($n_abspath, $key - ($keypos * 2 + 1), 2);
                }
                $n_abspath = implode('/', $n_abspath);
                $n_abspath = str_replace('./', '', $n_abspath);

                if (preg_match('#^'.$n_repositoryPath.'(/)?media/#', $n_abspath) and file_exists($abspath)) {
                    $data = jFile::read($abspath);
                }

                // Replace images src by full path
                $iUrl = jUrl::get(
                    'view~media:getMedia',
                    array('repository' => $repository, 'project' => $project)
                );
                $data = preg_replace(
                    '#src="(.+(jpg|jpeg|gif|png))"?#i',
                    'src="'.$iUrl.'&path=$1"',
                    $data
                );
                $attributeValue = $data;
            }

            // Else just write a link to the file
            else {
                if (!$popupFeatureContent) {
                    // only if no template is passed by the user
                    $attributeParts = explode('/', $attributeValue);
                    $attributeValueLabel = preg_replace('#_|-#', ' ', end($attributeParts));
                    $attributeValue = '<a href="'.$mediaUrl.'" target="_blank">'.$attributeValueLabel.'</a>';
                } else {
                    $attributeValue = $mediaUrl;
                }
            }
        } else {
            $attributeValue = preg_replace('#\n#', '<br>', $attributeValue);
        }

        // Return the modified template or only the resulted attribute value
        if ($popupFeatureContent) {
            // Replace {$mycol} by the processed column value
            return preg_replace(
                '#\{\$'.$attributeName.'\}#i',
                $attributeValue,
                $popupFeatureContent
            );
        }

        // Return the modified attributeValue
        return $attributeValue;
    }
}
