function RegistrationForm(alert, cover, form, ty) {
    this.alert = alert;
    this.cover = cover;
    this.form = form;
    this.ty = ty;
    this.setup();
}

RegistrationForm.prototype.setup = function() {
    var that = this;
    this.alert.classList.add("in-cover");
    this.alert.addEventListener("click", function(e) {
        that.open();
    });
    this.form.addEventListener("submit", function(e) {
        e.preventDefault();
        that.submit();
    });
}

RegistrationForm.prototype.open = function() {
    if (!this.alert.classList.contains("in-cover")) return;
    this.alert.classList.replace("in-cover", "in-form");
}

RegistrationForm.prototype.submit = function() {
    if (!this.alert.classList.contains("in-form")) return;

    var inputs = this.form.querySelectorAll("input");
    var data = "";
    for (var i = 0; i < inputs.length; i++) {
        data += encodeURIComponent(inputs[i].name) + "=";
        data += encodeURIComponent(inputs[i].value) + "&";
    }

    var button = this.form.querySelector("button").setAttribute("disabled", "disabled");

    var xhr = new XMLHttpRequest();
    xhr.open(this.form.method, this.form.action);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.responseType = "json";
    var that = this;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) that.done();
    };
    xhr.send(data);
}

RegistrationForm.prototype.done = function() {
    this.alert.classList.replace("in-form", "in-ty");
    this.form.reset();
    this.form.querySelector("button").removeAttribute("disabled");
    window.localStorage["registered"] = "yes";
}

RegistrationForm.prototype.skip = function() {
    this.alert.classList.replace("in-cover", "in-ty");
}

function setup_registration() {
    var registered = window.localStorage["registered"];
    var $form = document.querySelector(".registration form");
    var $alert = $form.parentNode;
    var $cover = $alert.querySelector(".cover");
    var $ty = $alert.querySelector(".thank-you");
    var obj = new RegistrationForm($alert, $cover, $form, $ty);
    if (registered) obj.skip();
    else if ((new URL(document.location)).searchParams.get("register")) obj.open();
    return obj;
}
