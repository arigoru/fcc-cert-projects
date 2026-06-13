function ready(fn) {
  if (
    document.attachEvent
      ? document.readyState === "complete"
      : document.readyState !== "loading"
  ) {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}
ready(onDOMReady);

function onDOMReady() {
  document.getElementById("convertForm")
    .addEventListener("submit", formSubmitted);
    document.getElementById("show-info")
    .addEventListener("click", infoClicked);

}

function infoClicked(event){
  let infoSec = document.getElementById("userstories");
  if (infoSec.hasAttribute("class"))
    infoSec.removeAttribute('class');
   else infoSec.setAttribute('class','hidden');
}

function formSubmitted(event) {
  event.preventDefault();
  var url = "/api/convert?input=";
  url += document.getElementById("convertField").value;
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.setRequestHeader(
    "Content-Type",
    "application/x-www-form-urlencoded; charset=UTF-8"
  );

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var resp =  JSON.parse(request.responseText);
      document.getElementById("jsonResult").innerText = JSON.stringify(resp,null,"\t");
      document.getElementById("result").innerText = resp.string;
      document.getElementById('requestLabel').innerText = url;
      document.getElementById('requestLabel').href = url;

      document.getElementById("jsonResult").removeAttribute('class');
      document.getElementById("result").removeAttribute('class');


    } else {
      document.getElementById("jsonResult").innerText = "server error";
    }
  };

  request.onerror = function() {
    document.getElementById("jsonResult").innerText = "connection error";
  };


  request.send();
}
