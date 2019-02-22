

function $(id) {
  return document.getElementById(id);
}

function openForm() {
  $("myForm").style.display = "block";
}

function closeForm() {
  $("myForm").style.display = "none";
}

function onSend() {
  var newMsg = document.createElement("li");
  newMsg.classList.add("msg", "client-msg");
  newMsg.appendChild(document.createTextNode($("current-msg").value));
  $("msg-list").appendChild(newMsg);
  scrollToBottom();
  sendMessage(newMsg.textContent);
  $("current-msg").value = "";
  
}

function onResponse() {
  
  var req = this;
  
  if (req.readyState == 4 && req.status == 200) {
    var newMsg = document.createElement("li");
    newMsg.classList.add("msg", "bot-msg");
    newMsg.appendChild(document.createTextNode(req.responseText));
    $("msg-list").appendChild(newMsg);
    scrollToBottom();
  }
  
}

function scrollToBottom() {
  var list = $("msg-list");
  list.scrollTop = list.scrollHeight - list.clientHeight;
}

function sendMessage(content) {
  var url = "https://chatbot-bdx-dialogflow1.glitch.me/sendMsg";
  var data = "message="+content;
  var req = new XMLHttpRequest();
  
  req.open("POST",url, true);
  req.onreadystatechange = onResponse;
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.send(data);
}
