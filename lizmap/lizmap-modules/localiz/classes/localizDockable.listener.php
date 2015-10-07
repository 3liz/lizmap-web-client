<?php

class localizDockableListener extends jEventListener
{
	function onmapMiniDockable($event) 
	{
		// creation du mini dock
		// id, titre, contenu html, index, [chemin vers css], [chemin vers js]
		$bp = jApp::config()->urlengine["basePath"];
		$tpl = new jTpl();
		$tpl->assign(array("depts"=>$depts));
		$dock = new lizmapMapDockItem("localiz", "Se localiser", $tpl->fetch("localiz~map_localiz"), 10, $bp."css/localiz.css", $bp."js/localiz.js");
		$event->add($dock);
	}
}
