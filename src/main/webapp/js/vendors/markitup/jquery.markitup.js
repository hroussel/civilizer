// ----------------------------------------------------------------------------
// markItUp! Universal MarkUp Engine, JQuery plugin
// v 1.1.x
// Dual licensed under the MIT and GPL licenses.
// ----------------------------------------------------------------------------
// Copyright (C) 2007-2012 Jay Salvat
// http://markitup.jaysalvat.com/
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------
(function($) {
	$.fn.markItUp = function(settings, extraSettings) {
		var method, params, options, ctrlKey, shiftKey, altKey; ctrlKey = shiftKey = altKey = false;
		var selection = '';
		
		if (typeof settings == 'string') {
			method = settings;
			params = extraSettings;
		} 

		options = {	id:						'',
					nameSpace:				'',
					root:					'',
					onAlt:                  false,
					onShift:                false,
					onEnter:				{},
					onShiftEnter:			{},
					onCtrlEnter:			{},
					onTab:					{},
					onShiftTab:				{},
					markupSet:			[	{ /* set */ } ]
				};
		$.extend(options, settings, extraSettings);

		// compute markItUp! path
		if (!options.root) {
			$('script').each(function(a, tag) {
				miuScript = $(tag).get(0).src.match(/(.*)jquery\.markitup(\.pack)?\.js$/);
				if (miuScript !== null) {
					options.root = miuScript[1];
				}
			});
		}

		// Quick patch to keep compatibility with jQuery 1.9
		var uaMatch = function(ua) {
			ua = ua.toLowerCase();

			var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
				/(webkit)[ \/]([\w.]+)/.exec(ua) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
				/(msie) ([\w.]+)/.exec(ua) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
				[];

			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		};
		var matched = uaMatch( navigator.userAgent );
		var browser = {};

		if (matched.browser) {
			browser[matched.browser] = true;
			browser.version = matched.version;
		}
		if (browser.chrome) {
			browser.webkit = true;
		} else if (browser.webkit) {
			browser.safari = true;
		}

		return this.each(function() {
			var $$, textarea, levels, caretPosition, caretOffset,
				clicked, hash, header, footer, iFrame, abort;
			$$ = $(this);
			textarea = this;
			levels = [];
			abort = false;
			caretOffset = -1;

			if (method) {
				switch(method) {
					case 'remove':
						remove();
					break;
					case 'insert':
						markup(params);
					break;
					default: 
						$.error('Method ' +  method + ' does not exist on jQuery.markItUp');
				}
				return;
			}

			// apply the computed path to ~/
			function localize(data, inText) {
				if (inText) {
					return 	data.replace(/("|')~\//g, "$1"+options.root);
				}
				return 	data.replace(/^~\//, options.root);
			}

			// init and build editor
			function init() {
				id = ''; nameSpace = '';
				if (options.id) {
					id = 'id="'+options.id+'"';
				} else if ($$.attr("id")) {
					id = 'id="markItUp'+($$.attr("id").substr(0, 1).toUpperCase())+($$.attr("id").substr(1))+'"';

				}
				if (options.nameSpace) {
					nameSpace = 'class="'+options.nameSpace+'"';
				}
				$$.wrap('<div '+nameSpace+'></div>');
				$$.wrap('<div '+id+' class="markItUp"></div>');
				$$.wrap('<div class="markItUpContainer"></div>');
				$$.addClass("markItUpEditor");

				// add the header before the textarea
				header = $('<div class="markItUpHeader"></div>').insertBefore($$);
				$(dropMenus(options.markupSet)).appendTo(header);

				// add the footer after the textarea
				footer = $('<div class="markItUpFooter"></div>').insertAfter($$);

				// listen key events
				$$.off(".markItUp")
				.on('keydown.markItUp', keyPressed)
				.on('keyup.markItUp', keyPressed)				
				.on("insertion.markItUp", function(e, settings) {
				    // bind an event to catch external calls
					if (settings.target !== false) {
						get();
					}
					if (textarea === $.markItUp.focused) {
						markup(settings);
					}
				})
				.on('focus.markItUp', function() {
				    // remember the last focus
					$.markItUp.focused = this;
				});
			}

			// recursively build header with dropMenus from markupset
			function dropMenus(markupSet) {
				var ul = $('<ul></ul>'), i = 0;
				$('li:hover > ul', ul).css('display', 'block');
				$.each(markupSet, function() {
					var button = this, t = '', title, li, j;
					var leadKeys = "Ctrl+";
					if (button.onShift) leadKeys += "Shift+";
					if (button.onAlt) leadKeys += "Alt+";
					title = (button.key) ? (button.name||'')+' ['+leadKeys+button.key+']' : (button.name||'');
					key   = (button.key) ? 'accesskey="'+leadKeys+button.key+'"' : '';
					if (button.separator) {
						li = $('<li class="markItUpSeparator">'+(button.separator||'')+'</li>').appendTo(ul);
					} else {
						i++;
						for (j = levels.length -1; j >= 0; j--) {
							t += levels[j]+"-";
						}
						li = $('<li class="'+(button.className||'')+'"><a href="" '+key+' title="'+title+'"/></li>')
						.off(".markItUp")
						.on("contextmenu.markItUp", function() { // prevent contextmenu on mac and allow ctrl+click
							return false;
						}).on('click.markItUp', function(e) {
							e.preventDefault();
						}).on("focusin.markItUp", function(){
                            $$.focus();
						}).on('mouseup', function() {
							if (button.call) {
								eval(button.call)();
							}
							setTimeout(function() { markup(button) },1);
							return false;
						}).on('mouseenter.markItUp', function() {
								$('> ul', this).show();
								$(document).one('click', function() { // close dropmenu if click outside
										$('ul ul', header).hide();
									}
								);
						}).on('mouseleave.markItUp', function() {
								$('> ul', this).hide();
						}).appendTo(ul);
						if (button.dropMenu) {
							levels.push(i);
							$(li).addClass('markItUpDropMenu').append(dropMenus(button.dropMenu));
						}
					}
				}); 
				levels.pop();
				return ul;
			}

			// markItUp! markups
			function magicMarkups(string) {
				if (string) {
					string = string.toString();
					string = string.replace(/\(\!\(([\s\S]*?)\)\!\)/g,
						function(x, a) {
							var b = a.split('|!|');
							if (altKey === true) {
								return (b[1] !== undefined) ? b[1] : b[0];
							} else {
								return (b[1] === undefined) ? "" : b[0];
							}
						}
					);
					// [![prompt]!], [![prompt:!:value]!]
					string = string.replace(/\[\!\[([\s\S]*?)\]\!\]/g,
						function(x, a) {
							var b = a.split(':!:');
							if (abort === true) {
								return false;
							}
							value = prompt(b[0], (b[1]) ? b[1] : '');
							if (value) {
							    if (b[0] === "Url")
							        // Some URLs have ')' characters (e.g., many Wikipedia URLs)
							        // which don't work right with the Markdown inline link rule.
							        // So we convert any ')' character to its HTML character entity.
							        value = value.replace(")", "&#41;");
							}
							else
								abort = true;
							return value;
						}
					);
					return string;
				}
				return "";
			}

			// prepare action
			function prepare(action) {
				if ($.isFunction(action)) {
					action = action(hash);
				}
				return magicMarkups(action);
			}

			// build block to insert
			function build(string) {
				var openWith 			= prepare(clicked.openWith);
				var placeHolder 		= prepare(clicked.placeHolder);
				var replaceWith 		= prepare(clicked.replaceWith);
				var closeWith 			= prepare(clicked.closeWith);
				var openBlockWith 		= prepare(clicked.openBlockWith);
				var closeBlockWith 		= prepare(clicked.closeBlockWith);
				var multiline 			= clicked.multiline;
				var block;
				
				if (replaceWith !== "") {
					block = openWith + replaceWith + closeWith;
				} else if (selection === '' && placeHolder !== '') {
					block = openWith + placeHolder + closeWith;
				} else {
					string = string || selection;

					var lines = [string], blocks = [];
					
					if (multiline === true) {
						lines = string.split(/\r?\n/);
					}
					
					if (clicked.indent) {
					    var i = 0;
					    for (openWith='';i<clicked.indent; ++i) openWith += ' ';
					}
					
					for (var l = 0; l < lines.length; l++) {
						var line = lines[l];
						if (clicked.outdent == 1)
						    line = line.replace(/^[ \t]/, '');
                        else if (clicked.outdent == 4)
                            line = line.replace(/(^ {1,4})|(^\t)/, '');
						var trailingSpaces;
						if (trailingSpaces = line.match(/ *$/)) {
							blocks.push(openWith + line.replace(/ *$/g, '') + closeWith + trailingSpaces);
						} else {
							blocks.push(openWith + line + closeWith);
						}
					}
					
					block = blocks.join("\n");
				}

				block = openBlockWith + block + closeBlockWith;

				return {	block:block, 
							openBlockWith:openBlockWith,
							openWith:openWith, 
							replaceWith:replaceWith, 
							placeHolder:placeHolder,
							closeWith:closeWith,
							closeBlockWith:closeBlockWith
					};
			}
            
			function getPrevNewlineOffset(text, startIdx) {
			    return text.substring(0, startIdx).lastIndexOf('\n');
			}
			
            function getNextNewlineOffset(text, startIdx) {
                var pos = text.substring(startIdx).indexOf('\n');
                return pos < 0 ?  text.length : pos + startIdx;
            }
            
            function selectEntireLines(text) {
                // This function extends the text selection
                // so that it covers from the start of the first line
                // to the end of the last line.
                var prevNewlinePos = getPrevNewlineOffset(text, caretPosition);
                var oldCaretPos = caretPosition;
                caretPosition = prevNewlinePos + 1; // move the caret to the start of the line
                var nextNewlinePos;
                if (selection.length) { // text selected
                    var selectionEnd = oldCaretPos + selection.length - 1;
                    nextNewlinePos = getNextNewlineOffset(text, selectionEnd);
                }
                else { // none selected
                    nextNewlinePos = getNextNewlineOffset(text, caretPosition);
                }
                // reselect the text;
                set(caretPosition, nextNewlinePos - caretPosition);
                get();
            }
            
            function swapLines(upDir) {
                selectEntireLines(textarea.value);
                var text = textarea.value;
                if (text[text.length-1] != '\n')
                    text += '\n';
                var selectionEnd = caretPosition + selection.length;
                if (upDir && caretPosition <= 0 || !upDir && text.length-1 <= selectionEnd)
                    return text;
                var oldCaretPos = caretPosition;
                var tgtLineStart, tgtLineEnd;
                if (upDir) {
                    tgtLineEnd = oldCaretPos - 1;
                    tgtLineStart = getPrevNewlineOffset(text, tgtLineEnd - 1) + 1;
                    caretPosition = tgtLineStart;
                    textarea.value = text.substring(0, tgtLineStart) +
                            selection + '\n' +
                            text.substring(tgtLineStart, tgtLineEnd) +
                            text.substring(selectionEnd);
                }
                else {
                    tgtLineStart = selectionEnd + 1;
                    tgtLineEnd = getNextNewlineOffset(text, tgtLineStart);
                    caretPosition = caretPosition + (tgtLineEnd - tgtLineStart) + 1;
                    textarea.value = text.substring(0, oldCaretPos) +
                            text.substring(tgtLineStart, tgtLineEnd) + '\n' +
                            selection +
                            text.substring(tgtLineEnd);
                }
                set(caretPosition, selection.length);
                get();
            }

            function duplicateLines(upDir) {
                selectEntireLines(textarea.value);
                var text = textarea.value;
                if (text[text.length-1] != '\n')
                    text += '\n';
                textarea.value = text.substring(0, caretPosition) +
                    selection + '\n' +
                    text.substring(caretPosition);
                if (!upDir)
                    caretPosition = caretPosition + selection.length + 1;
                set(caretPosition, selection.length);
                get();
            }

			// define markup to insert
			function markup(button) {
				var len, j, n, i;
				hash = clicked = button;
				get();

				if (button.selectAssist) {
                    // special care for outdenting lines
                    selectEntireLines(textarea.value);
                }
				else if (button.swapLineUp!=undefined) {
				    swapLines(button.swapLineUp);
				}
				else if (button.dupLineUp!=undefined) {
				    duplicateLines(button.dupLineUp);
				}
                
				$.extend(hash, { 
						 			root:options.root,
									textarea:textarea, 
									selection:(selection||''), 
									caretPosition:caretPosition,
									ctrlKey:ctrlKey, 
									shiftKey:shiftKey, 
									altKey:altKey
								}
							);
				
				string = build(selection);
				start = caretPosition;
				len = string.block.length;
				len -= fixIeBug(string.block);
				
				if ((selection === '' && string.replaceWith === '')) {
					caretOffset += fixOperaBug(string.block);
					
					start = caretPosition + string.openBlockWith.length + string.openWith.length;
					len = string.block.length - string.openBlockWith.length - string.openWith.length - string.closeWith.length - string.closeBlockWith.length;

					caretOffset = $$.val().substring(caretPosition,  $$.val().length).length;
					caretOffset -= fixOperaBug($$.val().substring(0, caretPosition));
				}
				$.extend(hash, { caretPosition:caretPosition } );

				if (string.block !== selection && abort === false) {
					insert(string.block);
					set(start, len);
				} else {
					caretOffset = -1;
				}
				get();

				$.extend(hash, { selection:selection });

				// reinit keyevent
				shiftKey = altKey = ctrlKey = abort = false;
			}

			// Substract linefeed in Opera
			function fixOperaBug(string) {
				if (browser.opera) {
					return string.length - string.replace(/\n*/g, '').length;
				}
				return 0;
			}
			// Substract linefeed in IE
			function fixIeBug(string) {
				if (browser.msie) {
					return string.length - string.replace(/\r*/g, '').length;
				}
				return 0;
			}
				
			// add markup
			function insert(block) {	
				if (document.selection) {
					var newSelection = document.selection.createRange();
					newSelection.text = block;
				} else {
					textarea.value =  textarea.value.substring(0, caretPosition)  + block + textarea.value.substring(caretPosition + selection.length, textarea.value.length);
				}
			}
			
			// scroll to the selection "approximately"
			function scroll(start) {
			    var $textarea = $(textarea);
                var caretPos = getCaretCoordinates(textarea, start);
                $textarea.scrollTop(caretPos.top - $textarea.height()*0.5);
            }

			// set a selection
			function set(start, len) {
				if (textarea.createTextRange){
					// quick fix to make it work on Opera 9.5
					if (browser.opera && browser.version >= 9.5 && len == 0) {
						return false;
					}
					range = textarea.createTextRange();
					range.collapse(true);
					range.moveStart('character', start); 
					range.moveEnd('character', len); 
					range.select();
				} else if (textarea.setSelectionRange ){
					textarea.setSelectionRange(start, start + len);
				}
				scroll(start);
				textarea.focus();
			}

			// get the selection
			function get() {
				textarea.focus();

				if (document.selection) {
					selection = document.selection.createRange().text;
					if (browser.msie) { // ie
						var range = document.selection.createRange(), rangeCopy = range.duplicate();
						rangeCopy.moveToElementText(textarea);
						caretPosition = -1;
						while(rangeCopy.inRange(range)) {
							rangeCopy.moveStart('character');
							caretPosition ++;
						}
						selection = selection.replace(/\r*/g, '');
					} else { // opera
						caretPosition = textarea.selectionStart;
					}
				} else { // gecko & webkit
					caretPosition = textarea.selectionStart;

					selection = textarea.value.substring(caretPosition, textarea.selectionEnd);
				} 
				return selection;
			}
			
			var keyCode = $.ui.keyCode;

			var specialKeyNames = {};
	        specialKeyNames[keyCode.BACKSPACE] = "Backspace";
	        specialKeyNames[keyCode.COMMA] = ",";
	        specialKeyNames[keyCode.DELETE] = "Delete";
	        specialKeyNames[keyCode.DOWN] = "Down";
	        specialKeyNames[keyCode.END] = "End";
	        specialKeyNames[keyCode.ENTER] = "Enter";
	        specialKeyNames[keyCode.ESCAPE] = "Escape";
	        specialKeyNames[keyCode.HOME] = "Home";
	        specialKeyNames[keyCode.LEFT] = "Left";
	        specialKeyNames[keyCode.PAGE_DOWN] = "Page_down";
	        specialKeyNames[keyCode.PAGE_UP] = "Page_up";
	        specialKeyNames[keyCode.PERIOD] = ".";
	        specialKeyNames[keyCode.RIGHT] = "Right";
	        specialKeyNames[keyCode.SPACE] = "Space";
	        specialKeyNames[keyCode.TAB] = "Tab";
	        specialKeyNames[keyCode.UP] = "Up"; 

			// set keys pressed
			function keyPressed(e) { 
				shiftKey = e.shiftKey;
				altKey = e.altKey;
				ctrlKey = e.ctrlKey;

				if (e.type === 'keydown') {
				    if (ctrlKey === true) {
	                    if (altKey === true) {
	                        if (e.keyCode == keyCode.UP || e.keyCode == keyCode.DOWN) {
	                            markup({dupLineUp:e.keyCode == keyCode.UP});
	                            return false;
	                        }
	                    }
	                    
				        var keySequence = "Ctrl+" + (shiftKey ? "Shift+" : "") + (altKey ? "Alt+" : "");
				        keySequence += specialKeyNames[e.keyCode] || String.fromCharCode(e.keyCode);
					    li = $('a[accesskey="'+keySequence+'"]', header).parent('li');
						if (li.length !== 0) {
							ctrlKey = false;
							setTimeout(function() {
								li.triggerHandler('mouseup');
							},1);
							return false;
						}
					}
				    if (altKey === true) {
				        if (e.keyCode == keyCode.UP || e.keyCode == keyCode.DOWN) {
				            markup({swapLineUp:e.keyCode == keyCode.UP});
				            return false;
				        }
				    }
					if (e.keyCode === 13 || e.keyCode === 10) { // Enter key
						if (ctrlKey === true) {  // Enter + Ctrl
							ctrlKey = false;
							markup(options.onCtrlEnter);
							return options.onCtrlEnter.keepDefault;
						} else if (shiftKey === true) { // Enter + Shift
							shiftKey = false;
							markup(options.onShiftEnter);
							return options.onShiftEnter.keepDefault;
						} else { // only Enter
							markup(options.onEnter);
							return options.onEnter.keepDefault;
						}
					}
					if (e.keyCode === 9) { // Tab key
						if (ctrlKey == true || altKey == true) {
							return false; 
						}
						markup(shiftKey ? options.onShiftTab : options.onTab);
						return options.onTab.keepDefault;
					}
				}
			}

			function remove() {
				$$.unbind(".markItUp").removeClass('markItUpEditor');
				$$.parent('div').parent('div.markItUp').parent('div').replaceWith($$);
				$$.data('markItUp', null);
			}

			init();
		});
	};

	$.fn.markItUpRemove = function() {
		return this.each(function() {
				$(this).markItUp('remove');
			}
		);
	};

	$.markItUp = function(settings) {
		var options = { target:false };
		$.extend(options, settings);
		if (options.target) {
			return $(options.target).each(function() {
				$(this).focus();
				$(this).trigger('insertion', [options]);
			});
		} else {
			$('textarea').trigger('insertion', [options]);
		}
	};
})(jQuery);
