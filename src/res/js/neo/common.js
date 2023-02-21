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
            textObj.attr("dominant-baseline", "auto");
            break;
        case "bottomCenter":
            textObj.attr("x", x1 + (x2 - x1) / 2);
            textObj.attr("text-anchor", "middle");
            textObj.attr("y", y2);
            textObj.attr("dominant-baseline", "auto");
            break;
        case "bottomRight":
            textObj.attr("x", x2);
            textObj.attr("text-anchor", "end");
            textObj.attr("y", y2);
            textObj.attr("dominant-baseline", "auto");
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