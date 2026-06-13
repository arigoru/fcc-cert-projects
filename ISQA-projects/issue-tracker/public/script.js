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
  document.getElementById("testForm").addEventListener("submit", formSubmit);
  document.getElementById("testForm2").addEventListener("submit", formSubmit);
  document.getElementById("testForm3").addEventListener("submit", formSubmit);
  document.getElementById("show-info")
    .addEventListener("click", infoClicked);
}

function formSubmit(e) {
  let url = "/api/issues/apitest";
  let method;
  switch (e.target.id) {
    case "testForm":
      method = "POST";
      break;
    case "testForm2":
      method = "PUT";
      break;
    case "testForm3":
      method = "DELETE";
      break;
    default:
      method = "GET";
      break;
  }
  var request = new XMLHttpRequest();
  request.open(method, url, true);
  request.onload = function() {
    var resp = JSON.parse(request.responseText);
    document.getElementById("jsonResult").innerText = JSON.stringify(
      resp,
      null,
      "\t"
    );
  };
  request.onerror = function() {
    console.log("fail");
  };
  request.send(new FormData(e.target));
  e.preventDefault();
}

function infoClicked(event){
  let infoSec = document.getElementById("userstories");
  if (infoSec.hasAttribute("class")){
    infoSec.removeAttribute('class');
    location.href = "#userstories";  
  }
   else infoSec.setAttribute('class','hidden');

}