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
		{name:'Titre 3', key:'3', openWith:'!!! ', closeWith:'', placeHolder:'Votre titre ici...' },
		{name:'Titre 4', key:'4', openWith:'!! ', closeWith:'', placeHolder:'Votre titre ici...' },
		{name:'Titre 5', key:'5', openWith:'! ', closeWith:'', placeHolder:'Votre titre ici...' },
		{separator:'---------------' },		
		{name:'Forte Emphase', key:'B', openWith:"__", closeWith:"__"}, 
		{name:'Emphase', key:'I', openWith:"''", closeWith:"''"}, 
		{separator:'---------------' },
		{name:'Liste', openWith:'(!(* |!|*)!)'}, 
		{name:'Liste Numérotée', openWith:'(!(# |!|#)!)'}, 
		{separator:'---------------' },
		{name:'Image', key:"P", replaceWith:'(([![Lien:!:http://]!]|[![Texte Alternatif]!]|[![Position (D=droite G=gauche C=centre)]!]|[![Longue Description]!]))'}, 
		{name:'Lien', key:"L", replaceWith:'[[[![Nom du lien]!]|[![Lien:!:http://]!]',closeWith:']]' },
		{name:'Lien complet', replaceWith:'[[[![Nom du lien]!]|[![Lien:!:http://]!]|[![Langue]!]|[![description]!]]',closeWith:']' },
		{separator:'---------------' },
		{name:'Citer', openWith:'>', placeHolder:''},
		{name:'Code', openWith:'@@', closeWith:'@@'},
		{name:'Bloc de Code source', openWith:'<code>', closeWith:'</code>'},
		{separator:'---------------' },
		{name:'Retour à la ligne', openWith:'%%%'}, 
		{separator:'---------------' },
		{name:'Preview', call:'preview', className:'preview'}
	]
}