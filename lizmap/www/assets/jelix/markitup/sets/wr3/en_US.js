// -------------------------------------------------------------------
// markItUp!
// -------------------------------------------------------------------
// Copyright (C) 2008 Jay Salvat
// http://markitup.jaysalvat.com/
// Adapted by foxmask http://foxmask.info
// -------------------------------------------------------------------
// WR3 engine for WikiRender
// -------------------------------------------------------------------
// Feel free to add more tags
// -------------------------------------------------------------------
markitup_wr3_settings = {
	previewParserPath:	'', // path to your Wiki parser
	onShiftEnter:		{keepDefault:false, replaceWith:'\n\n'},
	markupSet: [
		{name:'Titre 3', key:'3', openWith:'!!! ', closeWith:'', placeHolder:'Your title here...' },
		{name:'Titre 4', key:'4', openWith:'!! ', closeWith:'', placeHolder:'Your title here...' },
		{name:'Titre 5', key:'5', openWith:'! ', closeWith:'', placeHolder:'Your title here...' },
		{separator:'---------------' },		
		{name:'Strong', key:'B', openWith:"__", closeWith:"__"}, 
		{name:'Italic', key:'I', openWith:"''", closeWith:"''"}, 
		{separator:'---------------' },
		{name:'List', openWith:'(!(* |!|*)!)'}, 
		{name:'Numbered List', openWith:'(!(# |!|#)!)'}, 
		{separator:'---------------' },
		{name:'Image', key:"P", replaceWith:'(([![Link:!:http://]!]|[![Alternative Text]!]|[![Position (R=right L=left C=center)]!]|[![Longue Description]!]))'}, 
		{name:'Link', key:"L", replaceWith:'[[[![Link name]!]|[![Link:!:http://]!]',closeWith:']]' },
		{name:'Complete Link', replaceWith:'[[[![Link name]!]|[![Link:!:http://]!]|[![Language]!]|[![description]!]]',closeWith:']' },
		{separator:'---------------' },
		{name:'Quote', openWith:'>', placeHolder:''},
		{name:'Code', openWith:'@@', closeWith:'@@'},
		{name:'Block of source code', openWith:'<code>', closeWith:'</code>'},
		{separator:'---------------' },
		{name:'New line', openWith:'%%%'}, 
		{separator:'---------------' },
		{name:'Preview', call:'preview', className:'preview'}
	]
}