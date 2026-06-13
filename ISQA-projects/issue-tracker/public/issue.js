var url;
var currentProject;
var issuesList;

function onDOMReady() {
  currentProject = window.location.pathname.replace(/\//g, "");
  url = "/api/issues/" + currentProject;

  document.getElementById("projectTitle").innerText =
    "Issues tracker for project " + currentProject;
  getIssues(data => {
    issuesList = JSON.parse(data).list.reverse();
    renderIssues(issuesList);
  });

  document.getElementById("newIssue").addEventListener("submit", formSubmit);
  document.getElementById("updateIssue").addEventListener("submit", formSubmit);
  document.getElementById("issueDisplay").addEventListener("click", issueClick);
  document.getElementById("cancelUpdate").addEventListener("click", hideUpdateForm);
}

function getIssues(next) {
  sendRequest(url, "GET", null, request => {
    next(request.responseText);
  });
}

function renderIssues(list) {
  const DATEOPTIONS = { year: 'numeric', month: 'numeric', day: 'numeric' };
  var issues = [];
  list.forEach(function(ele) {
    var openstatus;
    ele.open ? (openstatus = "open") : (openstatus = "closed");

      var single = `
      <tr data-id="${ele._id}" class="issue ${openstatus}">
          <th>${openstatus}</th>
          <th>${ele._id}</th>
          <th>${ele.issue_title}</th>
          <th>${ele.issue_text}</th>
          <th>${ele.status_text}</th>
          <th>${ele.created_by}</th>
          <th>${ele.assigned_to}</th>
          <th>${(new Date(ele.created_on)).toLocaleString()}</th>
          <th>${(new Date(ele.updated_on)).toLocaleString()}</th>
          <th><a href="#" 
      <tr data-id="${ele._id}" class="closeIssue">close?</a></th>
          <th><a href="#" 
      <tr data-id="${ele._id}" class="updateIssue">edit</a></th>
          <th><a href="#" 
      <tr data-id="${ele._id}" class="deleteIssue">delete?</a></th>
      </tr>`;
    issues.push(single);
  });
  let tableStr = `
  <h2 class="issues-title">Issues list</h2>
  <table class="issues-table">
  <tr>
    <th></th>
    <th>_id</th>
    <th>Title</th>
    <th>Description</th>
    <th>Current status</th>
    <th>Created by</th>
    <th>Assigned to</th>
    <th>Created at</th>
    <th>Last update</th>
  </tr>`;
  document.getElementById("issueDisplay").innerHTML = tableStr + issues.join("") + "</table>";
}

function issueClick(event) {
  switch (event.target.className) {
    case "closeIssue":
      closeIssue(event);
      break;
    case "deleteIssue":
      deleteIssue(event);
      break;
    case "updateIssue":
      updateIssueForm(event);
      break;
    default:
      // console.log(event);
      updateIssueForm(event);
      break;
  }
}

function hideUpdateForm(){
  document.getElementById("updateIssue").hidden = true;
  document.getElementById("newIssue").hidden = false;
}

function updateIssueForm(event) {
  document.getElementById("updateIssue").hidden = false;
  document.getElementById("newIssue").hidden = true;
  let id = (event.target.dataset.id===undefined)
    ? event.target.parentNode.dataset.id
    : event.target.dataset.id;

  let issue = issuesList.find((e)=>e._id===id);
  let elements = document.getElementById("updateIssue").elements;
  for (let i=0;i<elements.length;i++){
    // console.log(elements[i]);
    if (issue[elements[i].name]!==undefined){
      if (elements[i].name==='open'){
        elements[i].checked = !issue[elements[i].name];
      } else 
      elements[i].value = issue[elements[i].name];

    }

  }
}

function deleteIssue(event) {
  let requestData = { _id: event.target.dataset.id };
  sendRequest(url, "DELETE", getFormDataFromObject(requestData), req => {
    console.log(req.responseText);
    window.location.reload(true);
  });
  event.preventDefault();
}

function closeIssue(event) {
  let requestData = { _id: event.target.dataset.id, open: false };
  sendRequest(url, "PUT", getFormDataFromObject(requestData), req => {
    console.log(req.responseText);
    window.location.reload(true);
  });
  event.preventDefault();
}

function getFormDataFromObject(object) {
  const formData = new FormData();
  Object.keys(object).forEach(key => formData.append(key, object[key]));
  return formData;
}

function formSubmit(e) {
  switch (e.target.id) {
    case "newIssue":
      e.target.setAttribute("action", url);
      sendRequest(
        url,
        "POST",
        new FormData(e.target),
        issueCreated,
        issueCreationError
      );
      break;
    case "updateIssue":
      e.target.setAttribute("action", url);
      sendRequest(
        url,
        "PUT",
        new FormData(e.target),
        issueCreated,
        issueCreationError
      );
      hideUpdateForm();
      break;
    default:
      break;
  }
  e.preventDefault();
}

function issueCreated(request) {
  window.location.reload(true);
}

function issueCreationError(request) {
  console.log("fail");
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
