// -------------------------------------------------------------------
// markItUp!
// -------------------------------------------------------------------
// Copyright (C) 2008 Jay Salvat
// http://markitup.jaysalvat.com/
// -------------------------------------------------------------------
// MarkDown tags example
// http://en.wikipedia.org/wiki/Markdown
// http://daringfireball.net/projects/markdown/
// -------------------------------------------------------------------
// Feel free to add more tags
// -------------------------------------------------------------------
markItUpSettings = {
	previewParserPath:	'',
	onShiftEnter:		{keepDefault:false, openWith:'\n\n'},
	onTab:    		{keepDefault:false, multiline:true, openWith:'\t'},
	resizeHandle: false,
	markupSet: [
		{name:'First Level Heading', key:'1', placeHolder:'Your title here...', multiline:true, closeWith:function(markItUp) { return miu.markdownTitle(markItUp, '=') } },
		{name:'Second Level Heading', key:'2', placeHolder:'Your title here...', multiline:true, closeWith:function(markItUp) { return miu.markdownTitle(markItUp, '-') } },
		{name:'Heading 3', key:'3', openWith:'### ', placeHolder:'Your title here...', multiline:true },
		{name:'Heading 4', key:'4', openWith:'#### ', placeHolder:'Your title here...', multiline:true },
		{name:'Heading 5', key:'5', openWith:'##### ', placeHolder:'Your title here...', multiline:true },
		{name:'Heading 6', key:'6', openWith:'###### ', placeHolder:'Your title here...', multiline:true },
		{separator:'---------------' },		
		{name:'Bold', key:'B', openWith:'**', closeWith:'**', multiline:true},
		{name:'Italic', key:'I', openWith:'_', closeWith:'_', multiline:true},
		{name:'Strike through', key:'S', openWith:'{{[st]', closeWith:'}}', multiline:true},
		{separator:'---------------' },
		{name:'Bulleted List', openWith:'- ', multiline:true },
		{name:'Numeric List', multiline:true, openWith:function(markItUp) {
			return markItUp.line+'. ';
		}},
		{separator:'---------------' },
		{name:'Picture', key:'P', replaceWith:'![[![Alternative text]!]]([![Url:!:http://]!] "[![Title]!]")'},
		{name:'Link', key:'L', openWith:'[', closeWith:']([![Url:!:http://]!] "[![Title]!]")', placeHolder:'Your text to link here...' },
		{separator:'---------------'},	
		{name:'Quotes', key:'Q', openWith:'> ', closeWith:'  ', multiline:true},
        {name:'Code Block / Code', multiline:true, openWith:'(!(\t|!|`)!)', closeWith:'(!(`)!)'},
		{separator:'---------------'},
//		{name:'Preview', call:'preview', className:"preview"}
	]
}

// mIu nameSpace to avoid conflict.
miu = {
	markdownTitle: function(markItUp, char) {
		heading = '';
		n = $.trim(markItUp.selection||markItUp.placeHolder).length;
		for(i = 0; i < n; i++) {
			heading += char;
		}
		return '\n'+heading;
	}
}
