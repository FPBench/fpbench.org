SOURCES = {
    "solovyev-et-al-2015": "Utah",
    "herbie-2015": "UW",
    "darulova-kuncak-2014": "MPI-SWS",
    "damouche-martel-chapoutot-fmics15": "UPVD",
    "damouche-martel-chapoutot-nsv14": "UPVD",
    "damouche-martel-chapoutot-cf15": "UPVD",
    "atkinson-1989": "UPVD",
    "golub-vanloan-1996": "UPVD",
}

function source_table(data) {
    var source_counts = {"(other)": 0};
    data.forEach(function(core) {
        var used = {};
        (core[":cite"] || []).forEach(function(cite) {
            var source = SOURCES[cite]
            if (source && !used[source]) {
                source_counts[source] = source_counts[source] || 0;
                source_counts[source]++;
                used[source] = true;
            }
        });
        if (!used) source_counts["(other)"]++;
    })
    return source_counts;
}

function has_source(core, source) {
    var cites = core[":cite"] || [];
    for (var i = 0; i < cites.length; i++) {
        if (SOURCES[cites[i]] == source) return true;
    }
    return false;
}

FEATURES = {
    Arithmetic: "+ - * / sqrt fabs".split(" "),
    Temporaries: ["let"],
    Loops: ["while"],
    Comparison: "and or not == != < > <= >=".split(" "),
    Conditionals: ["if"],
    Exponents: "exp pow log".split(" "),
    Trigonometry: "sin cos tan asin acos atan".split(" "),
}

function feature_table(data) {
    var op_feature = {};
    for (var i in FEATURES) FEATURES[i].forEach(function(op) { op_feature[op] = i; });

    var feature_counts = {};
    data.forEach(function(core) {
        var feature_used = {};
        core.operators.forEach(function(op) {
            var feature = op_feature[op];
            if (!feature) console.warn("No feature for operator", op);
            if (!feature_used[feature]) {
                feature_used[feature] = true;
                feature_counts[feature] = feature_counts[feature] || 0;
                feature_counts[feature]++;
            }
        })
    });

    // Check that the operators to features assignment is good
    var operators_used = [];
    data.forEach(function(core) { operators_used = operators_used.concat(core.operators); });
    var operators_named = [];
    for (var i in FEATURES) operators_named = operators_named.concat(FEATURES[i]);
    operators_named = new Set(operators_named);
    (new Set(operators_used)).forEach(function(op) {
        if (!operators_named.has(op)) console.warn("No feature for operator", op);
    });

    return feature_counts;
}

function domain_table(data) {
    var domain_counts = {"(unknown)": 0};
    data.forEach(function(core) {
        var domain = core[":fpbench-domain"];
        if (domain) {
            domain = domain[0].toUpperCase() + domain.substr(1);
            domain_counts[domain] = domain_counts[domain] || 0;
            domain_counts[domain]++;
        } else {
            domain_counts["(unknown)"]++;
        }
    });
    return domain_counts;
}

function update_table(name, table, counts) {
    var used_items = {};
    [].forEach.call(table.querySelectorAll("tbody tr"), function($row) {
        var cells = $row.querySelectorAll("td");
        var item = cells[0].textContent;
        if (!counts[item]) throw "Invalid " + name + " " + item;
        used_items[item] = true;
        cells[1].innerText = counts[item];
    });
    for (var item in table) {
        if (table.hasOwnProperty(item) && !used_items[item]) {
            console.warn("No row for " + name, item);
        }
    }
}

function update_tables(data) {
    var $stats = document.querySelector("#benchmark-stats");
    var tables = $stats.querySelectorAll("table");
    var $sources = tables[0], $features = tables[1], $domains = tables[2];
    
    update_table("source", $sources, source_table(data));
    update_table("feature", $features, feature_table(data));
    update_table("domain", $domains, domain_table(data));

    var $contribs = document.querySelectorAll(".columns")
    for (var i = 1; i < $contribs.length; i++) { // Skip first one!
        var subtables = $contribs[i].querySelectorAll("table");
        var $features = subtables[0], $domains = subtables[1];
        var source = $contribs[i].dataset.source;
        var subdata = data.filter(function(x) {return has_source(x, source);});
        update_table(source + " feature", $features, feature_table(subdata));
        update_table(source + " domain", $domains, domain_table(subdata));
        
    }
}

function load_benchmarks(data) {
    update_tables(data);
}
