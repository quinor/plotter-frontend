const defaultValues = {
  "input-scale": 1,
  "input-hatch": false,
  "input-hatch-density": 2,
}

const updateInfo = (text) => {
  document.getElementById("info").innerHTML = text
}

const uploadSVG = () => {
  var input = document.getElementById("load-svg")
  const fd = new FormData()
  fd.append("file", input.files[0])
  fetch('/upload', {
    method: 'POST',
    body: fd
  }).then((res) => {
    if(res.status=="422"){
      updateInfo("the file extention is incorrect")
    } else if (res.status=="500"){
      updateInfo("ouh shit you broke the server")
    } else if (res.status=="200"){
      let elt = document.querySelector("#load-svg+.big-button-label p:nth-child(2)");
      elt.innerHTML = input.files[0].name
      showOriginal();
      document.getElementById("render").disabled = false;
      document.getElementById("show-original").disabled = true;
      document.getElementById("show-preview").disabled = true;
      document.getElementById("draw-box").disabled = true;
      document.getElementById("draw-dry-run").disabled = true;
      document.getElementById("draw-final").disabled = true;
    } else if (res.status=="400"){
      updateInfo("no file loaded")
    } else {
      updateInfo("unknown error code " + res.status)
    }
  });
}

const showOriginal = () => {
  document.getElementById("preview-img").style = "display:block"
  document.getElementById("preview-img").src = "/original/" + Math.floor(Math.random() * 1000).toString()
}

const showPreview = () => {
  document.getElementById("preview-img").style = "display:block"
  document.getElementById("preview-img").src = "/preview/" + Math.floor(Math.random() * 1000).toString()
}

const enableWeb3 = () => {
  document.getElementById("web-3").play();
};

const getInput = (field) => {
  if (field.type == "checkbox") {
    return Boolean(field.checked);
  } else {
    return field.value;
  }
}

const setInput = (field, value) => {
  if (field.type == "checkbox") {
    field.checked = value;
  } else {
    field.value = value;
  }
}

const resetField = (name) => {
  let field = document.getElementById(name)
  setInput(field, defaultValues[name]);
  changeRenderOptions();
}

const resetRenderOptions = () => {
  for (let input in defaultValues) {
    let field = document.getElementById(input)
    setInput(field, defaultValues[input]);
  }
  changeRenderOptions();
}

const changeRenderOptions = () => {
  for (let input in defaultValues) {
    let field = document.getElementById(input)
    let resetButton = field.parentElement.parentElement.querySelector(":scope td:nth-child(3) button");
    resetButton.disabled = Boolean(getInput(field) == defaultValues[input]);
  }
}

const renderSVG = () => {
  let options = new FormData(document.getElementById("render-options"))
  fetch('/render_svg',{ method: 'POST', body: options })
  .then((res)=> {
    if (res.status != 200) {
      updateInfo("server error: " + res.status);
      return;
    }
    return res.json()
  }).then((out) => {
    if (out === undefined) { return; }
    if(!out.success){
      updateInfo("errors occurred in remote command (step: " + out.step + ", error: " + out.error + ")")
    } else {
      let arr = out.stdout.split("\n")
      updateInfo(arr[1]) // positional selection of stdout lines :( TODO fix backend and provide better info
      showPreview();
      document.getElementById("show-original").disabled = false;
      document.getElementById("show-preview").disabled = false;
      document.getElementById("draw-box").disabled = false;
      document.getElementById("draw-dry-run").disabled = false;
      document.getElementById("draw-final").disabled = false;
    }
  })
}

const draw = (what) => {
  var inputs = document.getElementsByTagName('input');

  for (var i=0; i<inputs.length; i++) {
    inputs[i].disabled = true;
  }
  fetch('/run/' + what).then((res) => { return res.json() }).then((res) => {
    if (!res.error) {
      updateInfo("printing successful");
    } else {
      updateInfo("printing failed!<br/>" + res.stdout + "<br/>" + res.stderr)
    }
    for (var i=0; i<inputs.length; i++) {
      inputs[i].disabled = false;
    }
  })
}

window.addEventListener('load', () => {
  // unload files
  document.getElementById("load-svg").value="";
  // reset form
  resetRenderOptions();
  // disable buttons
  document.getElementById("render").disabled = true;
  document.getElementById("show-original").disabled = true;
  document.getElementById("show-preview").disabled = true;
  document.getElementById("draw-box").disabled = true;
  document.getElementById("draw-dry-run").disabled = true;
  document.getElementById("draw-final").disabled = true;
});
