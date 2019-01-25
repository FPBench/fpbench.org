var DATA = {};

function Predicate() {
    this.f = function(x) { return true; };
}

Predicate.prototype.and = function(f) {
    var old_f = this.f;
    this.f = function(x) { return old_f(x) && f(x); };
    return this;
}

function Element(tagname, props, children) {
    var $elt = document.createElement(tagname);
    if (props.text) $elt.textContent = props.text;
    if (props.href) $elt.href = props.href;
    if (props.download) $elt.download = props.download;
    if (props.classes) {
        for (var i = 0; i < props.classes.length; i++) {
            $elt.classList.add(props.classes[i]);
        }
    }

    function addAll(c) {
        if (!c) return;
        else if (Array.isArray(c)) c.map(addAll);
        else $elt.appendChild(c);
    }
    addAll(children);
    return $elt;
}

function get_search() {
    var predicate = new Predicate();
    document.querySelector("#search").value.split(/\s+/g).forEach(function(word) {
        var field = ":name";

        if (word.indexOf(":") !== -1) {
            field = word.substr(0, word.indexOf(":"));
            word = word.substr(word.indexOf(":") + 1);
            if (field == "domain") {
                field = ":fpbench-domain";
            } else if (field == "from") {
                field = ":cite";
            } else if (["body", "arguments", "operators"].indexOf(field) == -1) {
                field = ":" + field;
            }
        }

        predicate.and(function(core) {
            return core[field] && ("" + core[field]).toLowerCase().indexOf(word.toLowerCase()) !== -1;
        });
    });
    return predicate;
}

function render_datum(key, elt, value) {
    return Element("div", { classes: ["datum", elt] }, [
        Element("strong", { text: key }),
        Element(elt, { text: value }),
    ]);
}

function extra_data(core) {
    var out = [];
    for (var i in core) {
        if (core.hasOwnProperty(i) &&
            [":name", ":description", "arguments", "operators", ":precision",
             ":fpbench-domain", ":cite", ":pre", "body", "core"].indexOf(i) === -1) {
            out.push(render_datum(i.substr(1), "code", core[i]));
        }
    }
    return out;
}

function render_result(core) {
    var out = Element("div", {}, [
        Element("h2", { text: core[":name"] || "(unnamed)" }, [
            Element("a", { classes: ["more"], text: "more" })
        ]),
        core[":description"] && render_datum("Description", "p", core[":description"]),

        render_datum("Arguments", "span", core.arguments.join(", ")),
        core[":precision"] && render_datum("Precision", "span", core[":precision"]),
        core[":fpbench-domain"] && render_datum("Domain", "span", core[":fpbench-domain"][0].toUpperCase() + core[":fpbench-domain"].substr(1)),
        core[":cite"] && render_datum("From", "span", core[":cite"].join(", ")),

        core[":pre"] && render_datum("Precondition", "pre", core[":pre"]),
        render_datum("Body", "pre", core.body),

        extra_data(core),

        Element("div", { classes: ["links"], }, [
            Element("strong", { text: "External tools:" }),
            /* TODO: Get these links up
            Element("a", { text: "Herbie", href: "" }),
            Element("a", { text: "Titanic", href: "" }),
            Element("a", { text: "Daisy", href: "" }),
            */
            Element("a", { text: "Download", download: "benchmark.fpcore", href: "data:;base64," + btoa(core.core)})
        ]),
    ]);
    out.addEventListener("click", function() { out.classList.toggle("open"); });
    return out;
}

function render_results() {
    var $out = document.querySelector("#benchmarks");
    var predicate = get_search();
    var subdata = DATA.filter(predicate.f);

    while ($out.children.length) $out.children[0].remove();

    for (var i = 0; i < subdata.length; i++) {
        var $row = render_result(subdata[i]);
        $out.appendChild($row);
    }

    document.querySelector("#overlay").textContent = subdata.length + " benchmarks";
}

function load_benchmarks(data) {
    DATA = data;
    render_results();
    document.querySelector("#search").addEventListener("change", render_results);
}
