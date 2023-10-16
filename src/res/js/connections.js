export function RenderConnections(container, doc, dataBag) {
    let connectionsContainer = container.append("g")
        .attr("class", "connections");

    dataBag.connections = {};

    let pathCounter = 0;

    Object.keys(doc.connections).forEach(function (key, index) {

        let computed = {};

        let endp1Components = doc.connections[key].endpoints[0].split(":");
        let endp2Components = doc.connections[key].endpoints[1].split(":");

        computed.endp1 = resolveNode(endp1Components[0], doc, dataBag);
        computed.endp1.portLabel = endp1Components[1];

        computed.endp2 = resolveNode(endp2Components[0], doc, dataBag);
        computed.endp2.portLabel = endp2Components[1];


        // Simple connection
        if (!computed.endp1.isGroup && !computed.endp2.isGroup) {
            drawConnection(connectionsContainer, doc.connections[key], computed.endp1, computed.endp2, pathCounter++, dataBag);
        }
        else if (computed.endp1.isGroup && !computed.endp2.isGroup) {
            computed.endp1.nodeComputed.groupFlat.members.forEach(function (member, idx) {
                let virtEndp1 = resolveNode(member, doc, dataBag);
                virtEndp1.portLabel = computed.endp1.portLabel;

                drawConnection(connectionsContainer, doc.connections[key], virtEndp1, computed.endp2, pathCounter++, dataBag);
            });
        }
        else if (!computed.endp1.isGroup && computed.endp2.isGroup) {
            computed.endp2.nodeComputed.groupFlat.members.forEach(function (member, idx) {
                let virtEndp2 = resolveNode(member, doc, dataBag);
                virtEndp2.portLabel = computed.endp2.portLabel;

                drawConnection(connectionsContainer, doc.connections[key], computed.endp1, virtEndp2, pathCounter++, dataBag);
            });
        }
        else {
            computed.endp1.nodeComputed.groupFlat.members.forEach(function (endp1Member, endp1Idx) {
                let virtEndp1 = resolveNode(endp1Member, doc, dataBag);
                virtEndp1.portLabel = computed.endp1.portLabel;

                computed.endp2.nodeComputed.groupFlat.members.forEach(function (endp2Member, endp2Idx) {
                    let virtEndp2 = resolveNode(endp2Member, doc, dataBag);
                    virtEndp2.portLabel = computed.endp2.portLabel;

                    drawConnection(connectionsContainer, doc.connections[key], virtEndp1, virtEndp2, pathCounter++, dataBag);

                });
            });

        }

        dataBag.connections[key] = computed;
    });

}

function drawConnection(container, rootConnection, enp1, enp2, pathId, dataBag) {
    let connectionContainer = container.append("g")
        .attr("class", "connection");

    let path = connectionContainer.append("path")
        .attr("id", `path-${pathId}`)
        .attr("class", "connection-path")
        .attr("fill", "none")
        .attr("stroke", rootConnection.stroke)
        .attr("stroke-width", rootConnection.strokeWidth)
        .attr("stroke-dasharray", rootConnection.strokeDashArray);

    if (enp1.nodeComputed.xScaled > enp2.nodeComputed.xScaled) {
        let temp = enp1;
        enp1 = enp2;
        enp2 = temp;
    }

    let fontSize = rootConnection.textSizeRatio * Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs);

    let curveType = rootConnection.curve.toLowerCase();

    let pathD = "";


    if (curveType == "linear") {
        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else if (curveType == "curve") {
        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;

        let halfX = getDistance2Points(enp1.nodeComputed.xScaled, 0, enp2.nodeComputed.xScaled, 0) / 2;
        let halfY = getDistance2Points(0, enp1.nodeComputed.yScaled, 0, enp2.nodeComputed.yScaled) / 2;
        
        let midX = (enp1.nodeComputed.xScaled + enp2.nodeComputed.xScaled) / 2;
        let midY = (enp1.nodeComputed.yScaled + enp2.nodeComputed.yScaled) / 2;

        let factor = -0.5

        let controlX = midX + halfY * factor;
        let controlY = midY - halfX * factor;

        pathD += `Q ${controlX}, ${controlY} ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else if (curveType == "step") {
        let midpointX = (enp1.nodeComputed.xScaled + enp2.nodeComputed.xScaled) / 2;

        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${midpointX}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${midpointX}, ${enp2.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else if (curveType == "stepreversed") {
        let midpointY = (enp1.nodeComputed.yScaled + enp2.nodeComputed.yScaled) / 2;

        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp1.nodeComputed.xScaled}, ${midpointY} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${midpointY} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else if (curveType == "stepbefore") {
        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp1.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else if (curveType == "stepafter") {
        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else{
        throw new Error(`Curve type ${curveType} not supported.`);
    }


    path.attr("d", pathD)


    let label1XOffset = 0;
    let label2XOffset = 0;

    let totalDist1 = 0;
    let totalDist2 = 0;

    let endp1Angle = 0;
    let endp2Angle = 0;

    enp1.nodeComputed.marginDist = {
        left: dataBag.Scaler.X.UnitStepAbs / 2 - dataBag.Scaler.X.UnitStepAbs * enp1.node.margin.left,
        right: dataBag.Scaler.X.UnitStepAbs / 2 - dataBag.Scaler.X.UnitStepAbs * enp1.node.margin.right,
        top: dataBag.Scaler.Y.UnitStepAbs / 2 - dataBag.Scaler.Y.UnitStepAbs * enp1.node.margin.top,
        bottom: dataBag.Scaler.Y.UnitStepAbs / 2 - dataBag.Scaler.Y.UnitStepAbs * enp1.node.margin.bottom
    };

    enp1.nodeComputed.corners = {
        topLeft: { x: enp1.nodeComputed.xScaled - enp1.nodeComputed.marginDist.left, y: enp1.nodeComputed.yScaled - enp1.nodeComputed.marginDist.top },
        topRight: { x: enp1.nodeComputed.xScaled + enp1.nodeComputed.marginDist.right, y: enp1.nodeComputed.yScaled - enp1.nodeComputed.marginDist.top },
        bottomLeft: { x: enp1.nodeComputed.xScaled - enp1.nodeComputed.marginDist.left, y: enp1.nodeComputed.yScaled + enp1.nodeComputed.marginDist.bottom },
        bottomRight: { x: enp1.nodeComputed.xScaled + enp1.nodeComputed.marginDist.right, y: enp1.nodeComputed.yScaled + enp1.nodeComputed.marginDist.bottom }
    };

    enp1.nodeComputed.cornerAngles = {
        topLeft: radToDeg(getAngle2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.corners.topLeft.x, enp1.nodeComputed.corners.topLeft.y)),
        topRight: radToDeg(getAngle2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.corners.topRight.x, enp1.nodeComputed.corners.topRight.y)),
        bottomLeft: radToDeg(getAngle2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.corners.bottomLeft.x, enp1.nodeComputed.corners.bottomLeft.y)),
        bottomRight: radToDeg(getAngle2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.corners.bottomRight.x, enp1.nodeComputed.corners.bottomRight.y))
    };

    enp2.nodeComputed.marginDist = {
        left: dataBag.Scaler.X.UnitStepAbs / 2 - dataBag.Scaler.X.UnitStepAbs * enp2.node.margin.left,
        right: dataBag.Scaler.X.UnitStepAbs / 2 - dataBag.Scaler.X.UnitStepAbs * enp2.node.margin.right,
        top: dataBag.Scaler.Y.UnitStepAbs / 2 - dataBag.Scaler.Y.UnitStepAbs * enp2.node.margin.top,
        bottom: dataBag.Scaler.Y.UnitStepAbs / 2 - dataBag.Scaler.Y.UnitStepAbs * enp2.node.margin.bottom
    };

    enp2.nodeComputed.corners = {
        topLeft: { x: enp2.nodeComputed.xScaled - enp2.nodeComputed.marginDist.left, y: enp2.nodeComputed.yScaled - enp2.nodeComputed.marginDist.top },
        topRight: { x: enp2.nodeComputed.xScaled + enp2.nodeComputed.marginDist.right, y: enp2.nodeComputed.yScaled - enp2.nodeComputed.marginDist.top },
        bottomLeft: { x: enp2.nodeComputed.xScaled - enp2.nodeComputed.marginDist.left, y: enp2.nodeComputed.yScaled + enp2.nodeComputed.marginDist.bottom },
        bottomRight: { x: enp2.nodeComputed.xScaled + enp2.nodeComputed.marginDist.right, y: enp2.nodeComputed.yScaled + enp2.nodeComputed.marginDist.bottom }
    };

    enp2.nodeComputed.cornerAngles = {
        topLeft: radToDeg(getAngle2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.corners.topLeft.x, enp2.nodeComputed.corners.topLeft.y)),
        topRight: radToDeg(getAngle2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.corners.topRight.x, enp2.nodeComputed.corners.topRight.y)),
        bottomLeft: radToDeg(getAngle2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.corners.bottomLeft.x, enp2.nodeComputed.corners.bottomLeft.y)),
        bottomRight: radToDeg(getAngle2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.corners.bottomRight.x, enp2.nodeComputed.corners.bottomRight.y))
    };


    if (curveType == "linear") {
        totalDist1 = getDistance2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled);
        totalDist2 = getDistance2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled);

        endp1Angle = radToDeg(getAngle2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled));
        endp2Angle = radToDeg(getAngle2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled));
    }
    else if (curveType == "step") {
        totalDist1 = getDistance2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled);
        totalDist2 = getDistance2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled);

        endp1Angle = radToDeg(getAngle2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled));
        endp2Angle = radToDeg(getAngle2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled));
    }
    else if (curveType == "stepreversed") {
        totalDist1 = getDistance2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled);
        totalDist2 = getDistance2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled);

        endp1Angle = radToDeg(getAngle2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled));
        endp2Angle = radToDeg(getAngle2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled));
    }
    else if (curveType == "stepbefore") {
        totalDist1 = getDistance2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled);
        totalDist2 = getDistance2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled);

        endp1Angle = radToDeg(getAngle2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled));
        endp2Angle = radToDeg(getAngle2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled));
    }
    else if (curveType == "stepafter") {
        totalDist1 = getDistance2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled);
        totalDist2 = getDistance2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled);

        endp1Angle = radToDeg(getAngle2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled));
        endp2Angle = radToDeg(getAngle2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled));
    }



    if (enp1.nodeComputed.cornerAngles.topRight <= endp1Angle && endp1Angle <= enp1.nodeComputed.cornerAngles.bottomRight) {
        label1XOffset = enp1.nodeComputed.marginDist.right
            / getDistance2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled)
            * totalDist1;
    }
    else if (enp1.nodeComputed.cornerAngles.topLeft <= endp1Angle && endp1Angle <= enp1.nodeComputed.cornerAngles.topRight) {
        label1XOffset = enp1.nodeComputed.marginDist.top
            / getDistance2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled)
            * totalDist1;
    }
    else if (enp1.nodeComputed.cornerAngles.bottomRight <= endp1Angle && endp1Angle <= enp1.nodeComputed.cornerAngles.bottomLeft) {
        label1XOffset = enp1.nodeComputed.marginDist.bottom
            / getDistance2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled)
            * totalDist1;
    }
    else {
        label1XOffset = enp1.nodeComputed.marginDist.left
            / getDistance2Points(enp1.nodeComputed.xScaled, enp1.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled)
            * totalDist1;
    }

    if (enp2.nodeComputed.cornerAngles.topRight <= endp2Angle && endp2Angle <= enp2.nodeComputed.cornerAngles.bottomRight) {
        label2XOffset = enp2.nodeComputed.marginDist.right
            / getDistance2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled)
            * totalDist2;
    }
    else if (enp2.nodeComputed.cornerAngles.topLeft <= endp2Angle && endp2Angle <= enp2.nodeComputed.cornerAngles.topRight) {
        label2XOffset = enp2.nodeComputed.marginDist.top
            / getDistance2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled)
            * totalDist2;
    }
    else if (enp2.nodeComputed.cornerAngles.bottomRight <= endp2Angle && endp2Angle <= enp2.nodeComputed.cornerAngles.bottomLeft) {
        label2XOffset = enp2.nodeComputed.marginDist.bottom
            / getDistance2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp2.nodeComputed.xScaled, enp1.nodeComputed.yScaled)
            * totalDist2;
    }
    else {
        label2XOffset = enp2.nodeComputed.marginDist.left
            / getDistance2Points(enp2.nodeComputed.xScaled, enp2.nodeComputed.yScaled, enp1.nodeComputed.xScaled, enp2.nodeComputed.yScaled)
            * totalDist2;
    }

    if(isNaN(label1XOffset))
        label1XOffset = Math.max(enp1.nodeComputed.marginDist.left, enp1.nodeComputed.marginDist.right, enp1.nodeComputed.marginDist.top, enp1.nodeComputed.marginDist.bottom);

    if(isNaN(label2XOffset))
        label2XOffset = Math.max(enp2.nodeComputed.marginDist.left, enp2.nodeComputed.marginDist.right, enp2.nodeComputed.marginDist.top, enp2.nodeComputed.marginDist.bottom);

    label1XOffset += rootConnection.margin.endp1 * Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs);
    label2XOffset += rootConnection.margin.endp2 * Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs);

    label1XOffset *= rootConnection.labelOffsetRatio;
    label2XOffset *= rootConnection.labelOffsetRatio;

    let enp1Label = connectionContainer.append("text")
        .attr("class", "connection-label")
        .attr("font-size", `${fontSize}px`)
        .attr("fill", rootConnection.color)
        .attr("dx", `${label1XOffset}`)
        .attr("dy", `${fontSize / 3 * -1}`);

    enp1Label.append("textPath")
        .style("text-anchor", "start")
        .attr("xlink:href", `#path-${pathId}`)
        .text(enp1.portLabel);

    let enp2Label = connectionContainer.append("text")
        .attr("class", "connection-label")
        .attr("font-size", `${fontSize}px`)
        .attr("fill", rootConnection.color)
        .attr("dx", `${label2XOffset * -1}`)
        .attr("dy", `${fontSize}`);

    enp2Label.append("textPath")
        .style("text-anchor", "end")
        .attr("startOffset", "100%")
        .attr("xlink:href", `#path-${pathId}`)
        .text(enp2.portLabel);

    let conLabel = connectionContainer.append("text")
        .attr("class", "connection-label")
        .attr("font-size", `${fontSize}px`)
        .attr("fill", rootConnection.color)
        .attr("dy", `${fontSize}`);

    conLabel.append("textPath")
        .style("text-anchor", "middle")
        .attr("startOffset", "50%")
        .attr("xlink:href", `#path-${pathId}`)
        .text(rootConnection.text);
}

function getDistance2Points(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function getAngle2Points(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

function resolveNode(nodeName, doc, dataBag)
{
    let endp = {
        nodeName: nodeName,
        portLabel: "",
        isGroup: false
    }

    if (endp.nodeName in doc.groups) {
        endp.node = doc.groups[nodeName];
        endp.nodeComputed = dataBag.groups[nodeName];
        endp.isGroup = true;
    }
    else if (endp.nodeName in doc.icons) {
        endp.node = doc.icons[nodeName];
        endp.nodeComputed = dataBag.icons[nodeName];
    }
    else if (endp.nodeName in doc.notes) {
        endp.node = doc.notes[nodeName];
        endp.nodeComputed = dataBag.notes[nodeName];
    }
    else
        throw new Error(`Node ${nodeName} not found while processing connection endpoints.`);

    return endp;
}