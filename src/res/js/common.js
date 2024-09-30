export function ApplyTextLocation(textObj, textLocation, x1, y1, x2, y2) {
    switch (textLocation) {
        case "topLeft":
            textObj.attr("x", x1);
            textObj.attr("text-anchor", "start");
            textObj.attr("y", y1);
            textObj.attr("dominant-baseline", "hanging");
            break;
        case "topCenter":
            textObj.attr("x", x1 + (x2 - x1) / 2);
            textObj.attr("text-anchor", "middle");
            textObj.attr("y", y1);
            textObj.attr("dominant-baseline", "hanging");
            break;
        case "topRight":
            textObj.attr("x", x2);
            textObj.attr("text-anchor", "end");
            textObj.attr("y", y1);
            textObj.attr("dominant-baseline", "hanging");
            break;
        case "bottomLeft":
            textObj.attr("x", x1);
            textObj.attr("text-anchor", "start");
            textObj.attr("y", y2);
            textObj.attr("dominant-baseline", "ideographic");
            break;
        case "bottomCenter":
            textObj.attr("x", x1 + (x2 - x1) / 2);
            textObj.attr("text-anchor", "middle");
            textObj.attr("y", y2);
            textObj.attr("dominant-baseline", "ideographic");
            break;
        case "bottomRight":
            textObj.attr("x", x2);
            textObj.attr("text-anchor", "end");
            textObj.attr("y", y2);
            textObj.attr("dominant-baseline", "ideographic");
            break;
        case "center":
            textObj.attr("x", x1 + (x2 - x1) / 2);
            textObj.attr("text-anchor", "middle");
            textObj.attr("y", y1 + (y2 - y1) / 2);
            textObj.attr("dominant-baseline", "middle");
            break;
        case "leftTop":
            textObj.attr("x", x1);
            textObj.attr("text-anchor", "end");
            textObj.attr("y", y1);
            textObj.attr("dominant-baseline", "hanging");
            textObj.attr("transform", `rotate(-90, ${x1}, ${y1})`);
            break;
        case "leftMiddle":
            textObj.attr("x", x1);
            textObj.attr("text-anchor", "middle");
            textObj.attr("y", y1 + (y2 - y1) / 2);
            textObj.attr("dominant-baseline", "hanging");
            textObj.attr("transform", `rotate(-90, ${x1}, ${y1 + (y2 - y1) / 2})`);
            break;
        case "leftBottom":
            textObj.attr("x", x1);
            textObj.attr("text-anchor", "start");
            textObj.attr("y", y2);
            textObj.attr("dominant-baseline", "hanging");
            textObj.attr("transform", `rotate(-90, ${x1}, ${y2})`);
            break;
        case "rightTop":
            textObj.attr("x", x2);
            textObj.attr("text-anchor", "start");
            textObj.attr("y", y1);
            textObj.attr("dominant-baseline", "hanging");
            textObj.attr("transform", `rotate(90, ${x2}, ${y1})`);
            break;
        case "rightMiddle":
            textObj.attr("x", x2);
            textObj.attr("text-anchor", "middle");
            textObj.attr("y", y1 + (y2 - y1) / 2);
            textObj.attr("dominant-baseline", "hanging");
            textObj.attr("transform", `rotate(90, ${x2}, ${y1 + (y2 - y1) / 2})`);
            break;
        case "rightBottom":
            textObj.attr("x", x2);
            textObj.attr("text-anchor", "end");
            textObj.attr("y", y2);
            textObj.attr("dominant-baseline", "hanging");
            textObj.attr("transform", `rotate(90, ${x2}, ${y2})`);
            break;
    }
}

// from https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path
export function GetPropByStringPath(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

export function DeepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function ComputeNodeValue(node, nodeKey, prop, previous, doc, rootName) {
    // case 1 : value not specified, repeating previous value
    if (!(prop in node)) {
        if (previous == null) {
            throw new Error(`No previous value for ${prop}`)
        }
        return parseFloat(previous[prop]);
    }
    // case 2 : value is a positive offset from previous value
    else if (node[prop].toString().startsWith('+') || node[prop].toString().startsWith('-')) {
        return parseFloat(previous[prop]) + parseFloat(node[prop].toString());
    }
    // case 3 : value is a reference to another node
    else if (node[prop].toString().startsWith('@')) {
        let vals = node[prop].toString().substring(1).split(':');

        let ref = vals[0];

        if (ref == rootName) {
            throw new Error(`Invalid looping reference in ${rootName}`);
        }

        let val = 0;

        if (vals.length > 1) {
            val = vals[1];
        }

        val = parseFloat(val);

        if (ref in doc.icons) {
            return ComputeNodeValue(doc.icons[ref], ref, prop, null, doc, rootName) + val;
        }
        else if (ref in doc.notes) {
            return ComputeNodeValue(doc.notes[ref], ref, prop, null, doc, rootName) + val;
        }
        else {
            throw new Error(`Invalid reference ${ref} in ${rootName}`);
        }
    }
    // case 4 : value is a number
    else {
        return parseFloat(node[prop])
    }
}

export function RandomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function HashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}