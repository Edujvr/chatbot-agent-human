$(function () {
    var socket = io('/customer');

    // When the form is submitted, send a customer message to the server
    $('form').submit(function(){
      var messageText = $('#m').val();
      var userMessageRow = jQuery('<div/>',{
        class:'row'
        });
      var div = jQuery('<div/>', {
        text: $("#m").val(),
        'class': "rounded-div",
        tabindex:1
        });
      $(userMessageRow).append(div);
      $('#messages').append(userMessageRow);
//      $('#messages').append($('<li class="customer-message">').text(messageText));
      socket.emit('customer message', messageText);
      $('#m').val('');
      return false;
    });

    // When we receive a customer message, display it
    socket.on('customer message', function(response){
        $("#m").removeAttr("disabled");
	var speech ='';
	var converter = new showdown.Converter();	    
        msg=response.queryResult.fulfillmentMessages;
	var i,len = response.queryResult.fulfillmentMessages.length;
    	for(i=0;i<len;i++){
		var obj = msg[i]['text'];
		if(msg[i]['message']==='text'){
                	 speech=obj['text'][i].textToSpeech;
            }
	}  	  
	var messages=response.queryResult.fulfillmentMessages; 
        if(response.queryResult.diagnosticInfo!=null){
            eoc=response.queryResult.diagnosticInfo.fields.end_conversation;
        }else{
            eoc=false
        }
            var answerRow = jQuery('<div/>',{
                'class':'row'
            });
        var answerCol = jQuery('<div/>',{
                'class':'col'
            });
        var answerContainerDiv = jQuery('<div/>',{
                'class':"float-right",
                tabindex:0
            });
        $("#messages").append(answerRow);
        $(answerRow).append(answerCol);
        $(answerCol).append(answerContainerDiv);
        var textFromDefaultResponse = speech;
        if (textFromDefaultResponse.trim()!==''){
            renderDefaultResponse(textFromDefaultResponse,answerContainerDiv);
        }
	renderRichControls(messages, answerContainerDiv);
        var isDisabled = $('#m').prop('disabled');
        if(eoc){
            $('#m').attr("disabled","disabled");
            $('#messages').append('<hr/>');
            var divMessage = $('<div/>',{
                class:'d-flex justify-content-center'
            });
            var btnStartOver = $('<button/>',{
                class:'btn btn-sm btn-danger',
                text:'Comenzar de nuevo'
            });
            var textStartOver = $('<h3/>',{
                html:'Fin de la conversación'
            });
            $(divMessage).append(textStartOver);
            $(btnStartOver).css('margin-left','10px');
            $(divMessage).append(btnStartOver);
            $('#messages').append(divMessage);
            $(btnStartOver).click(function(){
                var textToSubmit = 'Comenzar de nuevo';
                $("#m").val(textToSubmit);
                $( "form" ).trigger( "submit" );
                $(divMessage).addClass('disabledbutton')
            });
        }
        var objDiv = document.getElementById("messages");
        objDiv.scrollTop = objDiv.scrollHeight;
/*
        $(answerContainerDiv).append(simpleResponseRow);
        $(simpleResponseRow).append(simpleResponseDiv);
        $(simpleResponseDiv).html(markdown.toHTML(msg));
      //$('#messages').append($('<li>').text(msg));
      //$('#messages').append(markdown.toHTML(msg));
*/      
    });

    // When we receive a system error, display it
    socket.on('system error', function(error) {
      var errorText = error.type + ' - ' + error.message;
      console.log(errorText);
      $('#messages').append($('<li class="customer-error">').text(errorText));
    });
  });

/*
$(function () {

    window.initialMessageDisplayed = false;
	
    var guid = ($("#sessionId").text()).trim();


    $('form').on('submit', function (e) {
        var query = $("#message").val();
        showUserText();
        e.preventDefault();


        $.ajax({
            type: 'post',
            url: 'process.php',
            data: {submit:true, message:query, sessionid: guid},
            success: function (response) {
                $("#message").removeAttr("disabled");
                $('#message').focus();
                var responseObj = JSON.parse(response);
                var speech = responseObj.speech;
                var messages = responseObj.messages;
                var eoc = responseObj.isEndOfConversation;

                var answerRow = jQuery('<div/>',{
                    'class':'row'
                });
                var answerCol = jQuery('<div/>',{
                    'class':'col'
                });
                var answerContainerDiv = jQuery('<div/>',{
                    'class':"float-right",
                    tabindex:0
                });

                $('#chat-text').append(answerRow);
                $(answerRow).append(answerCol);
                $(answerCol).append(answerContainerDiv);


                var textFromDefaultResponse = speech;
                if (textFromDefaultResponse.trim()!==''){
                    renderDefaultResponse(textFromDefaultResponse,answerContainerDiv);
                }
                renderRichControls(messages, answerContainerDiv);


                var isDisabled = $('#message').prop('disabled');
                if(eoc){
                    $('#message').attr("disabled","disabled");
                    $('#chat-text').append('<hr/>');
                    var divMessage = $('<div/>',{
                        class:'d-flex justify-content-center'
                    });
                    var btnStartOver = $('<button/>',{
                        class:'btn btn-sm btn-danger',
                        text:'Comenzar de nuevo'
                    });
                    var textStartOver = $('<h3/>',{
                        html:'Fin de la conversación'
                    });
                    $(divMessage).append(textStartOver);
                    $(btnStartOver).css('margin-left','10px');
                    $(divMessage).append(btnStartOver);
                    $('#chat-text').append(divMessage);
                    $(btnStartOver).click(function(){
                        var textToSubmit = 'Comenzar de nuevo';
                        $("#message").val(textToSubmit);
                        $( "form" ).trigger( "submit" );
                        $(divMessage).addClass('disabledbutton')
                    });
                }
                var objDiv = document.getElementById("chat-text");
                objDiv.scrollTop = objDiv.scrollHeight;
            }
        });
    });
});

*/

function renderDefaultResponse(textFromDefaultResponse,parent){
    var converter = new showdown.Converter();
    var simpleResponseRow = jQuery('<div/>',{
        class:'row'
    });
    var simpleResponseDiv = jQuery('<div/>',{
        class:'textResponse'
    });
    $(simpleResponseRow).append(simpleResponseDiv);
    $(simpleResponseDiv).html(converter.makeHtml(textFromDefaultResponse));
    parent.append(simpleResponseRow);
}

function renderRichControls(data, parent){

    var i,len = data.length;
    for(i=0;i<len;i++){
        if(data[i] && data[i].hasOwnProperty('message')){
            if(data[i]['message']==='link_out_chip' &&
                data[i]['platform']==='ACTIONS_ON_GOOGLE'){
                renderLinkOutSuggestion(data[i],parent);
            }/*
            if(data[i]['message']==='simpleResponses' &&
                data[i]['platform']==='ACTIONS_ON_GOOGLE'){
                renderSimpleResponse(data[i],parent);
            }*/
            if(data[i]['message']==='basic_card' &&
                data[i]['platform']==='ACTIONS_ON_GOOGLE'){
                renderBasicCard(data[i],parent);
            }
            if(data[i]['message']==='listSelect' &&
                data[i]['platform']==='ACTIONS_ON_GOOGLE'){
                renderList(data[i],parent);
            }
            if(data[i]['message']==='carousel_card' &&
                data[i]['platform']==='ACTIONS_ON_GOOGLE'){
                renderCarousel(data[i],parent);
            }
        }
    }

    for(i=0;i<len;i++){
        if(data[i]['message']==='suggestions' &&
           data[i]['platform']==='ACTIONS_ON_GOOGLE'){
           renderSuggestionChips(data[i],parent);
        }
    }

}

function renderList(data,parent){

    var i, len = data.listSelect['items'].length;
    var listGroup = jQuery('<div/>',{
        'class':'list-group card gaListGroup'
    });
    if(data.listSelect['title']){
        var titleOfCard = data.listSelect['title'];
        var listGroupHeading = jQuery('<div/>',{
            'class':'gaListHeader card-header deep-orange lighten-1 white-text',
            'html':titleOfCard
        });
        listGroup.append(listGroupHeading);
    }
    for(i=0;i<len;i++){
        var item = data.listSelect['items'][i];
        if(item){
            var optionTitle = item["title"];
            var optionDescription = item["description"];
            var optionKey = item["info"]["key"];
            var imageUrl;
            if(item["image"]){
                imageUrl = item["image"]["url"];
            }
            var anchor = jQuery('<a/>',{
                'data-key':optionKey,
                'class':'gaListItem list-group-item list-group-item-action flex-column ' +
                'align-items-start'
            });
            anchor.click(function(){
                if(window.currentSuggestionChips){
                    var buttonRow = window.currentSuggestionChips;
                    buttonRow.remove();
                    window.currentSuggestionChips = null;
                    $("#m").removeAttr("disabled");
                }
                var textToSubmit = $(this).attr('data-key');
                $("#m").val(textToSubmit);
                $( "form" ).trigger( "submit" );
                $(listGroup).addClass('disabledbutton');
            });
            var headingDiv = jQuery('<div/>',{
            });
            var heading = jQuery('<div/>',{
                'class':'card-title',
                'text':optionTitle
            });
            heading.css("font-weight","bold");
            var row = jQuery('<div/>',{
                'class':'row'
            });
            var colSpanText = 'col';
            if(imageUrl) colSpanText = 'col-8';
            var colText = jQuery('<div/>',{
                'class':colSpanText
            });
            var colImage =jQuery('<div/>',{
                'class':'col-4'
            });
            var para = jQuery('<p/>',{
                'class':'mb-1',
                'html':optionDescription
            });

            if(imageUrl){
                var img = jQuery('<img/>',{
                    'class':'img-fluid',
                    'src':imageUrl,
                    'width':'50px'
                });
                colImage.append(img);
            }
            row.append(colText);
            if(imageUrl) row.append(colImage);
            headingDiv.append(heading);
            headingDiv.append(para);
            colText.append(headingDiv);
            anchor.append(row);
            listGroup.append(anchor);
        }
    }
    parent.append(listGroup);
    $("#m").attr("disabled","disabled");
}

function renderCarousel(data,parent){
    var i, len = data['items'].length;
    var carouselContainer = jQuery('<div/>',{
        'width':'550px'
    });
    $(carouselContainer).addClass('gaCarousel');
    var listGroup = jQuery('<ul/>',{

    });
    for(i=0;i<len;i++){
        var item = data['items'][i];
        if(item){
            var optionTitle = truncateString(item["title"],20);
            var optionDescription = item["description"];
            var optionKey = item["optionInfo"]["key"];
            var imageUrl = item["image"]["url"];
            var listItem = jQuery('<li/>',{});
            var cardDiv = jQuery('<div/>',{
                'width':'200px'
            });
            $(cardDiv).addClass('gaCarouselItem');
            var anchor = jQuery('<a/>',{
                'data-key':optionKey,
                'class':'list-group-item list-group-item-action flex-column '+
                'align-items-start'
            });
            anchor.click(function(){
                if(window.currentSuggestionChips){
                    var buttonRow = window.currentSuggestionChips;
                    buttonRow.remove();
                    window.currentSuggestionChips = null;
                    $("#message").removeAttr("disabled");
                }
                var textToSubmit = $(this).attr('data-key');
                $("#message").val(textToSubmit);
                $( "form" ).trigger( "submit" );
                $(carouselContainer).addClass('disabledbutton');
            });
            var heading = jQuery('<div/>',{
                'class':'card-title',
                'text':optionTitle
            });
            heading.css("font-weight","bold");
            var para = jQuery('<p/>',{
                'class':'mb-1',
                'html':optionDescription
            });
            var divForImage = jQuery('<div/>',{
                'class':'card-title'
            });
            divForImage.css("height","100px");
            var img = jQuery('<img/>',{
                'class':'img-fluid',
                'src':imageUrl,
                'width':'100px'
            });
            img.css("margin-left","auto");
            img.css("margin-right","auto");
            img.css("display","block");
            divForImage.append(img);

            cardDiv.append(divForImage);
            anchor.append(heading);
            anchor.append(para);
            cardDiv.append(anchor);
            listItem.append(cardDiv);
            listGroup.append(listItem);
        }
    }
    parent.append(carouselContainer);
    carouselContainer.append(listGroup);
    $(listGroup).lightSlider({
        autoWidth:true
    });
    $("#message").attr("disabled","disabled");
}

function renderBasicCard(data,parent){
    var cardDiv = jQuery('<div/>',{
        'class':'card gaCard'
    });
    var img = jQuery('<img/>',{
        'class':'gaCardImage',
        'src':data['image']['url']
    });
    var cardBodyDiv = jQuery('<div/>',{
        'class':'card-body'
    });
    var strTitle = truncateString(data['title'],28);
    var cardTitleContainerDiv = jQuery('<h5/>',{
        'class':'card-title',
        'html':strTitle
    });

    var textContainerPara = jQuery('<p/>',{
        'class':'card-text',
        'html':data['formattedText']
    });

    var linkDiv = $('<div/>');
    var link = $("<a>");
    link.attr('href',(data['buttons'][0])['openUrlAction']['url']);
    link.attr("title",(data['buttons'][0])['title']);
    link.text((data['buttons'][0])['title']);
    link.addClass("card-link");
    linkDiv.append(link);

    cardDiv.append(img);
    cardBodyDiv.append(cardTitleContainerDiv);
    cardBodyDiv.append(textContainerPara);
    cardBodyDiv.append(linkDiv);
    cardDiv.append(cardBodyDiv);
    parent.append(cardDiv);
}

function renderSimpleResponse(data, parent){
    var i, len = data.simpleResponses['simpleResponses'].length;
    for (i = 0; i < len; i++) {	
    var simpleResponseDiv = jQuery('<div/>',{
        'class':'row'
    });
    var simpleResponseInnerDiv = jQuery('<div/>',{
        'class':'textResponse gaSimpleResponse'
    });
    var simpleResponseText = jQuery('<p/>',{
        html:data.simpleResponses.simpleResponses[i]['textToSpeech'],
        tabindex:1
    });
    simpleResponseDiv.append(simpleResponseInnerDiv);
    simpleResponseInnerDiv.append(simpleResponseText);
    parent.append(simpleResponseDiv);
    }
}

function renderLinkOutSuggestion(data, parent){
    var linkoutDiv = jQuery('<div/>', {
        tabindex:1,
        'class': "card gaLinkOutSuggestion"
    });
    var linkoutInnerDiv = jQuery('<div/>',{
        'class':'card-body'
    });
    var linkOutAnchor = jQuery('<a/>',{
        text:data['destinationName']
    });
    $(linkOutAnchor).attr("href",data['url']);
    $(linkOutAnchor).attr("target","_blank");
    $(linkOutAnchor).attr("title",data['destinationName']);
    linkoutDiv.append(linkoutInnerDiv);
    linkoutInnerDiv.append(linkOutAnchor);
    parent.append(linkoutDiv);
}

function renderSuggestionChips(data,parent){
    var i, len = data['suggestions']['suggestions'].length;
    var buttonRowDiv = jQuery('<div/>',{
        class:'row'
    });
    var suggestionChipRowDiv = jQuery('<div/>',{
        class:'gaSuggestionChipRow'
    });
    for (i = 0; i < len; i++) {
        if (data["suggestions"]["suggestions"][i]) {
            //make a button for it
            var buttonText = data["suggestions"]["suggestions"][i]['title'];
            var button = jQuery('<button/>',{
                //type:'button',
                class:'btn btn-primary btn-sm gaSuggestionChipButton',
                text:buttonText
            });

            button.click(function(){
                var textToSubmit = this.textContent;
                suggestionChipRowDiv.remove();
                window.currentSuggestionChips = null;
                $("#m").removeAttr("disabled");
                $("#m").val(textToSubmit);
                $( "form" ).trigger( "submit" );
            });
        }
        suggestionChipRowDiv.append(button);
    }

    $(buttonRowDiv).append(suggestionChipRowDiv);
    $(parent).append(buttonRowDiv);
    window.currentSuggestionChips = suggestionChipRowDiv;
    //also disable the manual input
    $("#message").attr("disabled","disabled");
}

function showUserText(){
    var userMessageRow = jQuery('<div/>',{
        class:'row'
    });
    var div = jQuery('<div/>', {
        text: $("#message").val(),
        'class': "rounded-div",
        tabindex:1
    });
    $(userMessageRow).append(div);
    $("#chat-text" ).append(userMessageRow);
    $("#message").val('');
}

function truncateString(input, charLimit){
    if(input.length > charLimit) {
        return input.truncate(charLimit)+"...";
    }
    else{
        return input;
    }
}

String.prototype.truncate = String.prototype.truncate ||
    function (n){
        return this.slice(0,n);
    };
