var contextsManager = new ContextsManager();
var extensionsManager = new ExtensionsManager();

$(document).ready(function(){
	//gather information about extension that was just installed
	var extdata = chrome.extension.getBackgroundPage().getNewestExtension();

	if(!extdata || !extdata.name || !extdata.id) {
		window.close();
	} else {
		$('#extensionName').text(extdata.name);
		displayContexts();
		
		$('ul').bind("mousedown", function(e) {
			e.metaKey = true;
		}).selectable({
			filter: 'div',
			selected: function(event, ui) {
				$('#always_enabled').removeClass('ui-selected');
			}
		});

		$('#notification').bind("mousedown", function(e) {
			e.metaKey = true;
		}).selectable({
			filter: '#always_enabled',
			selected: function(event, ui) {
				$('div.ui-selected').removeClass('ui-selected');
			}
		});

		$('button').button();

		$('#do_nothing').click(function(){
			window.close();
		});

		$('#save').click(function(){
			if( $('#always_enabled').is('.ui-selected') ) {
				extensionsManager.init();
				extensionsManager.addExtensionToAlwaysEnabled( extdata.id );
				extensionsManager.save();

				chrome.extension.getBackgroundPage().configUpdated();
			} else {
				addToContexts(extdata.id, $('div.ui-selected'));
			}
			window.close();
		});
	}
});

function displayContexts() {
	//load and display avaiable contexts
	var contexts = contextsManager.getContextsList();

	$.each(contexts, function(i, context) {
		$('ul').append(createContextLi(context.name, context.name, context.imgSrc));
	});
}

function createContextLi(name, title, imgSrc) {
	var img = $('<img>').attr('src', imgSrc);
	var span = $('<span>').append(title);

	var context = $('<div>').attr('class', 'list-context ui-widget-content ui-corner-all').append(img).append(span).data('contextName', name);

	return $('<li>').append(context);
}

//add extension to selected contexts
function addToContexts(extid, selectedContexts) {
	//reload contexts list - just in case
	contextsManager.init();

	if(selectedContexts.length > 0) {
		$.each($(selectedContexts), function(idx, contextElem){
			contextsManager.addExtensionToContext( $(contextElem).data('contextName'), extid );
		});

		contextsManager.save();
		chrome.extension.getBackgroundPage().configUpdated();
	}
}