function onDOMReady() {
  document.getElementById("testForm").addEventListener("submit", formSubmit );
  document.getElementById("testForm2").addEventListener("submit", formSubmit );
};

function formSubmit(event) {
  const METHOD = "GET";
  let url = "/api/stock-prices?";
  url += getQueryString(event.target);
  
  sendRequest(url,METHOD,null,stockDataReceived);
  event.preventDefault();
}

function getQueryString(form) {
  let query = "stock=";
  if ((form.stock.length!==undefined)&&(form.stock.length===2)){
    query += form.stock[0].value
     + "&stock="
    +form.stock[1].value;
  } else {
    query += form.stock.value;
  }
  if (form.like.checked) {
   query += "&liked=true";
  }

  return query;
}

function stockDataReceived(request) {
  let stockData = JSON.parse(request.responseText);
  document.getElementById("jsonResult").innerText = JSON.stringify(stockData,null,"\t");
}

function sendRequest(url, method, data, onLoad, onError = () => {}) {
  var request = new XMLHttpRequest();
  request.open(method, url, true);

  request.onload = function() {
    onLoad(request);
  };
  request.onerror = function() {
    onError(request);
  };

  request.send(data);
}


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