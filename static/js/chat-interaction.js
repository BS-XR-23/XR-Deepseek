const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('state-send');
const messageBox = document.getElementById('message-box');
var selectedModel =localStorage.getItem('selectedModel') || "deepseek-r1:7b";

console.log(selectedModel);
let isUserScrolling = false;
let lastScrollTop = 0;
let responseStreamReader;
hljs.configure({ debug: false });
$(document).ready(function() {
    $("#deepseek-mode-dropdown").val(selectedModel);
})
userInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            // Allow new line in textarea
            return;
        }
        event.preventDefault(); // Prevent newline in textarea
        sendButton.click();
        $('#state-send').click();
    }
});


$('#state-writing').click(function () {
    $(this).hide();
    $('#state-idle').show();
    $('#state-send').hide();
    responseStreamReader.cancel();

});
$('#state-send').click(function () {
    $(this).hide();
    $('#state-writing').show();
    $('#state-idle').hide();
});

$('.copy-icon').on('click', function () {
    var codeText = $(this).parent("code").text();
    // Create a temporary textarea to copy the text
    var $temp = $('<textarea>');
    $('body').append($temp);
    $temp.val(codeText).select();
    document.execCommand('copy');
    $temp.remove();
    console.log("Copied to clipboard!");


});
$("#userInput").on("input", function () {

    if ($("#userInput").val().trim() !== '') {
        $('#state-writing').hide();
        $('#state-idle').hide();
        $('#state-send').show();
    }
    else {
        $('#state-writing').hide();
        $('#state-idle').show();
        $('#state-send').hide();
    }
    $(this).height('auto'); // Reset height to recalculate
    $(this).height(this.scrollHeight); // Set new height based on scroll height

});
$("#deepseek-mode-dropdown").on("input", function () {
    localStorage.setItem('selectedModel', $(this).val());
    selectedModel = $(this).val();
});
sendButton.onclick = async () => {
    const message = userInput.value;
    if (message.trim() === '') return;
    isUserScrolling = false;
    chatHistory.push({ role: "user", content: message });
    const userElement = document.createElement('div');
    $(chat).append(`<div class="user">${message}</div>`);
   
   
    var agentLoading = $(`<div class="agent">
                    <img src="/static/images/deepseek.png" class="fas fa-robot bot-icon">
                    <span class="loader"></span>
                </div>`);
    $(chat).append(agentLoading);

    messageBox.scrollTop = messageBox.scrollHeight;
    $('#userInput').val('').trigger('input');

    // Call the existing API to get a response
    const response = await fetch('http://172.18.102.223:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ model: 'deepseek-coder:6.7b', messages: chatHistory })
        body: JSON.stringify({ model: selectedModel, messages: chatHistory })
    });
    agentLoading.remove();

    responseStreamReader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let botReply = '';
    var agentElement = $(`<div class="agent"></div>`);
    $(chat).append(agentElement)
    while (true) {
        const { done, value } = await responseStreamReader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");
        for (const line of lines) {
            try {

                const parsedLine = JSON.parse(line);
                botReply += parsedLine.message.content;

                // Convert Markdown to HTML
                let formattedResponse = marked.parse(botReply);

                // Update chat UI with formatted response
                $(agentElement).html(`<img src="/static/images/deepseek.png" class="fas fa-robot bot-icon" ><div class="response-style" >${formattedResponse}</div>`);

                HighlightCode(agentElement)

                if (!isUserScrolling) messageBox.scrollTop = messageBox.scrollHeight;

                await new Promise(resolve => setTimeout(resolve, 30)); // Smooth streaming effect
            } catch (e) {
                console.error("Error parsing line:", line, e);
            }
        }

    }
    $('#state-writing').click();
    chatHistory.push({ role: "assistant", content: botReply });

    if (chatHistory.length<=3) 
    {
        let conversationName=message.split(" ").slice(0, 6).join(" ");
        if(currentConversation)
        {
            currentConversation.name = conversationName;
            conversationHistory.push(currentConversation);
            $(`#conversation-${currentConversation.id} input`).val(conversationName);

        }
        else{
            conversationId=conversationId+1;
            currentConversation={id:conversationId,name:conversationName,chatHistory:chatHistory}
            conversationHistory.push(currentConversation);
            AddConversationItem(currentConversation,"first");
        }

    }
    chatHistory.slice(-100);
    localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));

};

function HighlightCode(agentElement) {
    $(agentElement).find('pre code').each(function () {
      
        if ($(this).attr('data-highlighted') === 'yes') {
            return;
        }
        hljs.highlightElement(this);
        // console.log(this);
        // Mark as highlighted
        $(this).attr('data-highlighted', 'yes');
        var $pre = $(this).closest('pre')
        if ($pre.find('.copy-icon').length === 0) {
            var copyIcon = $('<span class="copy-icon"></span>'); // Using <i> for the icon
            $pre.append(copyIcon);
            $(copyIcon).on('click', function () {
                var codeText = $(this).parent().find("code").text();
                $(copyIcon).addClass("copied-icon")
                $(copyIcon).removeClass("copy-icon")
                setTimeout(function () {
                    $(copyIcon).removeClass("copied-icon");
                    $(copyIcon).addClass("copy-icon");
                }, 2000);
                // Create a temporary textarea to copy the text
                var $temp = $('<textarea>');
                $('body').append($temp);
                $temp.val(codeText).select();
                document.execCommand('copy');
                $temp.remove();
                console.log("Copied to clipboard!",codeText);
            });
        }
    });
}
$("#message-box").on("scroll", () => {
    const scrollHeight = messageBox.scrollHeight;
    const scrollTop = messageBox.scrollTop;
    const clientHeight = messageBox.clientHeight;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10; // Close to bottom

    // console.log("Scroll Info:", { scrollTop, clientHeight, scrollHeight });

    if (scrollTop < lastScrollTop) {
        isUserScrolling = true; // User is scrolling up
    } 
    else if(atBottom)
    {
        isUserScrolling = false; // User is at bottom, allow auto-scroll
    }

    lastScrollTop = scrollTop; // Update last scroll position
});
function AddMessage(message)
{
    if (message.role === "user") {
        $(chat).append(`<div class="user">${message.content}</div>`);
    } else if(message.role === "assistant") {
        let formattedResponse = marked.parse(message.content);

        var agentElement = $(`<div class="agent"></div>`);
        $(chat).append(agentElement)
       
       
        agentElement.html(`<img src="/static/images/deepseek.png" class="fas fa-robot bot-icon" ><div class="response-style" >${formattedResponse}</div>`);
        HighlightCode(agentElement)
        
    }
    messageBox.scrollTop = messageBox.scrollHeight;
}