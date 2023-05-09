function RegistrationForm(year, alert, cover, form, ty) {
    this.year = year;
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
    var that = this;

    var inputs = this.form.querySelectorAll("input");
    var data = "";
    for (var i = 0; i < inputs.length; i++) {
        data += encodeURIComponent(inputs[i].name) + "=";
        data += encodeURIComponent(inputs[i].value) + "&";
    }

    var button = this.form.querySelector("button").setAttribute("disabled", "disabled");
    var script = document.createElement("script");
    script.async = true;
    script.src = this.form.action + "?" + data
    script.onerror = function(evt) { that.done({ "result": "error", "error": "unknown" }) }
    window.gas_response = function(data) {
        that.done(data);
    };
    document.querySelector("head").appendChild(script);
}

RegistrationForm.prototype.done = function(result) {
    this.alert.classList.replace("in-form", "in-ty");
    this.form.reset();
    this.form.querySelector("button").removeAttribute("disabled");
    window.localStorage["registered-" + this.year] = "yes";
}

RegistrationForm.prototype.skip = function() {
    this.alert.classList.replace("in-cover", "in-ty");
}

function setup_registration() {
    var $form = document.querySelector(".registration form");
    var $alert = $form.parentNode;
    var $cover = $alert.querySelector(".cover");
    var $ty = $alert.querySelector(".thank-you");
    var year = $form.dataset["year"];

    var do_register = typeof (new URL(document.location)).searchParams.get("register") === "string";

    var registered = window.localStorage["registered-" + year];
    var obj = new RegistrationForm(year, $alert, $cover, $form, $ty);
    if (registered) obj.skip();
    else if (do_register) obj.open();
    return obj;
}
