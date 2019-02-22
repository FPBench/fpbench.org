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
    if (!children) { children = props; props = {}; }

    var $elt = document.createElement(tagname);
    for (var i in props) if (props.hasOwnProperty(i)) $elt[i] = props[i];

    function addAll(c) {
        if (!c) return;
        else if (Array.isArray(c)) c.map(addAll);
        else if (typeof c == "string") $elt.appendChild(document.createTextNode(c))
        else $elt.appendChild(c);
    }
    addAll(children);
    return $elt;
}

function get_search() {
    var predicate = new Predicate();
    predicate.text = document.querySelector("#search").value;
    predicate.text.split(/\s+/g).forEach(function(word) {
        var field = ":name";
        var invert = false;

        if (word[0] == "!") {
            var invert = !invert;
            word = word.substr(1);
        }

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
            var bool = core[field] && ("" + core[field]).toLowerCase().indexOf(word.toLowerCase()) !== -1;
            return invert ? !bool : bool;
        });
    });
    return predicate;
}

function render_datum(key, elt, value) {
    return Element("div", { className: "datum "+elt }, [
        Element("strong", key),
        Element(elt, value),
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

function create_titanic_permalink(core) {
    return "http://titanic.uwplse.org?core=" + encodeURIComponent(core.core) + "&float_override=false&posit_override=false";
}

function create_herbie_permalink(core) {
    return "http://herbie.uwplse.org/demo/improve?formula=" + encodeURIComponent(core.core);
}

function render_result(core) {
    var more_link = Element("a", { className: "more" }, "more");
    var out = Element("div", [
        Element("h2", [ core[":name"] || "(unnamed)", more_link ]),
        core[":description"] && render_datum("Description", "p", core[":description"]),

        render_datum("Arguments", "span", core.arguments.join(", ")),
        core[":precision"] && render_datum("Precision", "span", core[":precision"]),
        core[":fpbench-domain"] && render_datum("Domain", "span", core[":fpbench-domain"][0].toUpperCase() + core[":fpbench-domain"].substr(1)),
        core[":cite"] && render_datum("From", "span", core[":cite"].join(", ")),

        core[":pre"] && render_datum("Precondition", "pre", core[":pre"]),
        render_datum("Body", "pre", core.body),

        extra_data(core),

        Element("div", { className: "links", }, [
            Element("strong", "External tools:"),
            Element("a", {
                href: create_titanic_permalink(core)
            }, "Titanic"),
            Element("a", {
                href: create_herbie_permalink(core)
            }, "Herbie"),
            // Leave this tool as the last one
            Element("a", {
                download: "benchmark.fpcore",
                href: "data:;base64," + btoa(core.core)
            }, "Download"),
        ]),
    ]);

    out.addEventListener("click", function() { out.classList.add("open"); more_link.textContent = "less" });
    more_link.addEventListener("click", function(e) {
        out.classList.toggle("open");
        e.stopPropagation();
        more_link.textContent = out.classList.contains("open") ? "less" : "more";
    });
    return out;
}

function render_results(evt) {
    var $out = document.querySelector("#benchmarks");
    var predicate = get_search();
    if (predicate.text) {
        history.replaceState(null, "", "#" + encodeURIComponent(predicate.text));
    } else {
        history.replaceState(null, "", location.href.substr(0, location.href.length - location.hash.length));
    }
    var subdata = DATA.filter(predicate.f);

    while ($out.children.length) $out.children[0].remove();
    subdata.map(render_result).forEach($out.appendChild.bind($out));

    document.querySelector("#overlay").textContent = subdata.length + " benchmarks";
    if (evt) evt.preventDefault();
}

function load_benchmarks(data) {
    DATA = data;
    if (window.location.hash) {
        var s = decodeURIComponent(window.location.hash.substr(1));
        document.querySelector("#search").value = s;
    }
    render_results();
    document.querySelector("#search").addEventListener("change", render_results);
    document.querySelector("#benchmark-search").addEventListener("submit", render_results);
}
