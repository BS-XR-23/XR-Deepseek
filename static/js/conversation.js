var targetedConversation;
var targetInputField;
var currentConversation;
var conversationId=0;
var messageCount = 0;
var maxHistoryLength=20;
var chatHistory;
var conversationHistory = JSON.parse(localStorage.getItem("conversationHistory")) || [];
clearConversation();
conversationId=conversationHistory.length>0?conversationHistory[0].id:1;

conversationHistory.forEach(chat => {
    AddConversationItem({id:chat.id,name:chat.name,chatHistory:chat.chatHistory});
});

chatHistory=[{ role: "system", content: "You are an AI code assistant." }]


$(".new-conversation").on("click", function () {
    chatHistory=[{ role: "system", content: "You are an AI code assistant." }]
    conversationId=conversationId+1
    currentConversation={id:conversationId,name:`New conversation-${conversationId}`,chatHistory:chatHistory}
    AddConversationItem(currentConversation,"first");
});

function showActionMenu(e) {
    if ($("#action-menu").css("display") === "flex") {
        $("#action-menu").css("display", "none");
        return;
    }
    $("#action-menu").css("display", "flex");
    targetedConversation = $(e).closest('.conversation-list-item');
  

    $("#action-menu").offset({
        top: $(e).offset().top + $("#action-menu").height() - 55,
        left: $(e).offset().left
    });
}
$("#rename").on("click", function (e) {
    e.stopPropagation();

    targetInputField = targetedConversation.find('.conversation-list-item-name');
  
    targetInputField.on('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            targetInputField.attr('readonly', true);
            SaveConversationName(targetInputField)
        }
    });
    targetInputField.removeAttr('readonly');
    const len = targetInputField.val().length;
    targetInputField.focus();
    targetInputField[0].setSelectionRange(len, len);
    $("#action-menu").css("display", "none");
   
   
})
$("#delete").on("click", function () {
    console.log(targetedConversation);
    
    $("#action-menu").css("display", "none");
    const id = targetedConversation.attr('conversation-id');
    const index = conversationHistory.findIndex((chat) => chat.id == id);
    if(index>=0)
    {
        conversationHistory.splice(index, 1);
        localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    }
    targetedConversation.remove();
});
$(document).on("click", function (event) {
    if (!$(event.target).closest("#action-menu").length && !$(event.target).closest(".update-option").length) {
        $("#action-menu").css("display", "none");
    }
    if (targetInputField && !$(event.target).closest(targetInputField).length && !targetInputField.attr('readonly')) {
        targetInputField.attr('readonly', true);
    }
});
function SaveConversationName(targetInputField)
{
    const newName = targetInputField.val();
    const id = targetedConversation.attr('conversation-id');
    console.log(id);
    const index = conversationHistory.findIndex((chat) => chat.id == id);
    if(index>=0) 
    {
        conversationHistory[index].name = newName;
        conversationHistory=conversationHistory.filter((chat) => chat.chatHistory.length>1);
        localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
    }
    else
    {
        currentConversation.name = newName;
    }
    
}
function AddConversationItem(conversation,position="last") {
    let item=`<div onclick="ShowConversation(this)" id="conversation-${conversation.id}" conversation-id="${conversation.id}" class="conversation-list-item deactive" style="display: flex;align-items: center;justify-content: space-between;padding: 9px 15px;border-radius:7px;">
            <input readonly class="conversation-list-item-name" style="font-size: .85em;" value="${conversation.name}">
            <div style="display: flex;align-items: center;">
                <i class="fa-solid fa-ellipsis update-option" onclick="showActionMenu(this)" style="cursor: pointer;"></i>
            </div>
        </div>`
    if(position=="last") $("#conversation-list").append(item)
    else
    {
        $("#conversation-list").prepend(item)
        $("#conversation-list").children().first().click();
    } 

}
function clearConversation()
{
    conversationHistory=conversationHistory.filter((chat) => chat.chatHistory.length>1);
    conversationHistory= conversationHistory.sort((a, b) => b.id - a.id);
    conversationHistory=conversationHistory.slice(0,maxHistoryLength);
    // localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
}
function ShowConversation(e)
{
    $(chat).empty();
    $(".conversation-list-item").removeClass("active");
    $(".conversation-list-item").addClass("deactive");
    $(e).addClass("active");

    const id = $(e).attr('conversation-id');

    const index = conversationHistory.findIndex((chat) => chat.id == id);
    if(index>=0){
        currentConversation=conversationHistory[index];
        console.log(conversationHistory[index]);
        chatHistory=currentConversation.chatHistory;
    } 
    else
    {
        chatHistory=[{ role: "system", content: "You are an AI code assistant." }]
        currentConversation={id:conversationId,name:`New conversation-${conversationId}`,chatHistory:chatHistory}
    }
   
    chatHistory.forEach(message => {
        AddMessage(message);
    });
   
}
