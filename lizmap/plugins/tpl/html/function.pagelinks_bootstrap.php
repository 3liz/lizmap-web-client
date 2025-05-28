<?php

/**
 * @author     Laurent Jouanneau
 * @copyright  2007 Laurent Jouanneau
 *
 * @contributor Christian Tritten (christian.tritten@laposte.net), Bruno PERLES
 *
 * @copyright  2007 Christian Tritten
 * @copyright  2011 Bruno Perles
 *
 * @see        http://www.jelix.org
 *
 * @licence    GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 *
 * @param mixed $tpl
 * @param mixed $action
 * @param mixed $actionParams
 * @param mixed $itemsTotal
 * @param mixed $offset
 * @param mixed $pageSize
 * @param mixed $paramName
 * @param mixed $displayProperties
 */

/**
 * displays page links for the twitter bootstrap.
 *
 * @param jTpl   $tpl               template engine
 * @param string $action            selector of the action
 * @param array  $actionParams      parameters for the action
 * @param int    $itemsTotal        number of items
 * @param int    $offset            index of the first item to display
 * @param int    $pageSize          items number in a page
 * @param string $paramName         name of the parameter in the actionParams which will content a page offset
 * @param array  $displayProperties properties for the links display
 *  */
function jtpl_function_html_pagelinks_bootstrap(
    $tpl,
    $action,
    $actionParams,
    $itemsTotal,
    $offset,
    $pageSize = 15,
    $paramName = 'offset',
    $displayProperties = array()
) {
    $offset = intval($offset);
    if ($offset <= 0) {
        $offset = 0;
    }

    $itemsTotal = intval($itemsTotal);

    $pageSize = intval($pageSize);
    if ($pageSize < 1) {
        $pageSize = 1;
    }

    // If there are at least two pages of results
    if ($itemsTotal > $pageSize) {
        $jUrlEngine = jUrl::getEngine();

        $urlaction = jUrl::get($action, $actionParams, jUrl::JURLACTION);

        $defaultDisplayProperties = array('start-label' => '|&lt;',
            'prev-label' => '&lt;',
            'next-label' => '&gt;',
            'end-label' => '&gt;|',
            'area-size' => 0, );

        if (is_array($displayProperties) && count($displayProperties) > 0) {
            $displayProperties = array_merge($defaultDisplayProperties, $displayProperties);
        } else {
            $displayProperties = $defaultDisplayProperties;
        }

        $pages = array();

        $currentPage = 1;

        $numpage = 1;

        $prevBound = 0;

        $nextBound = 0;

        // Generates list of page offsets
        for ($curidx = 0; $curidx < $itemsTotal; $curidx += $pageSize) {
            if ($offset >= $curidx && $offset < $curidx + $pageSize) {
                $pages[$numpage] = '<li class="pagelinks-current active"><a href="#">'.$numpage.'</a></li>';
                $prevBound = $curidx - $pageSize;
                $nextBound = $curidx + $pageSize;
                $currentPage = $numpage;
            } else {
                $urlaction->params[$paramName] = $curidx;
                $url = $jUrlEngine->create($urlaction);
                $pages[$numpage] = '<li><a href="'.$url->toString(true).'">'.$numpage.'</a></li>';
            }
            ++$numpage;
        }

        // Calculate start page url
        $urlaction->params[$paramName] = 0;
        $urlStartPage = $jUrlEngine->create($urlaction);

        // Calculate previous page url
        $urlaction->params[$paramName] = $prevBound;
        $urlPrevPage = $jUrlEngine->create($urlaction);

        // Calculate next page url
        $urlaction->params[$paramName] = $nextBound;
        $urlNextPage = $jUrlEngine->create($urlaction);

        // Calculate end page url
        $urlaction->params[$paramName] = (count($pages) - 1) * $pageSize;
        $urlEndPage = $jUrlEngine->create($urlaction);

        // Links display
        echo '<div class="pagination"><ul class="pagelinks">';

        // Start link
        if (!empty($displayProperties['start-label'])) {
            echo '<li class="pagelinks-start prev';
            if ($prevBound >= 0) {
                echo '"><a href="', $urlStartPage->toString(true), '">', $displayProperties['start-label'], '</a>';
            } else {
                echo ' pagelinks-disabled disabled"><a href="#">',$displayProperties['start-label'],'</a>';
            }
            echo '</li>', "\n";
        }

        // Previous link
        if (!empty($displayProperties['prev-label'])) {
            echo '<li class="pagelinks-prev';
            if ($prevBound >= 0) {
                echo '"><a href="', $urlPrevPage->toString(true), '">', $displayProperties['prev-label'], '</a>';
            } else {
                echo ' pagelinks-disabled disabled"><a href="#">',$displayProperties['prev-label'],'</a>';
            }
            echo '</li>', "\n";
        }

        // Pages links
        foreach ($pages as $key => $page) {
            if ($displayProperties['area-size'] == 0 || ($currentPage - $displayProperties['area-size'] <= $key)
                && ($currentPage + $displayProperties['area-size'] >= $key)) {
                echo $page, "\n";
            }
        }

        // Next link
        if (!empty($displayProperties['next-label'])) {
            echo '<li class="pagelinks-next';
            if ($nextBound < $itemsTotal) {
                echo '"><a href="', $urlNextPage->toString(true), '">', $displayProperties['next-label'], '</a>';
            } else {
                echo ' pagelinks-disabled disabled"><a href="#">',$displayProperties['next-label'],'</a>';
            }
            echo '</li>', "\n";
        }

        // End link
        if (!empty($displayProperties['end-label'])) {
            echo '<li class="pagelinks-end next';
            if ($nextBound < $itemsTotal) {
                echo '"><a href="', $urlEndPage->toString(true), '">', $displayProperties['end-label'], '</a>';
            } else {
                echo ' pagelinks-disabled disabled"><a href="#">',$displayProperties['end-label'],'</a>';
            }
            echo '</li>', "\n";
        }

        echo '</ul></div>';
    } else {
        echo '<div class="pagination"><ul class="pagelinks"><li class="pagelinks-current"><a href="#">1</a></li></ul></div>';
    }
}
