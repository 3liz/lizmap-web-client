<?php
/**
 * Wikirenderer is a wiki text parser. It can transform a wiki text into xhtml or other formats
 * @package WikiRenderer
 * @author Laurent Jouanneau
 * @copyright 2003-2016 Laurent Jouanneau
 * @link http://wikirenderer.jelix.org
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public 2.1
 * License as published by the Free Software Foundation.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */
define('WIKIRENDERER_PATH', __DIR__.'/');
define('WIKIRENDERER_VERSION', trim(file_get_contents(__DIR__.'/VERSION')));

require_once('WikiTag.class.php');
require_once('WikiInlineParser.class.php');
require_once('WikiRendererBloc.class.php');
require_once('WikiRendererConfig.class.php');
require_once('WikiRenderer.class.php');
require_once('WikiTextLine.lib.php');
require_once('WikiTagXhtml.class.php');
