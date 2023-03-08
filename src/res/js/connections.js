export function RenderConnections(container, doc, dataBag) {
    let connectionsContainer = container.append("g")
        .attr("class", "connections");

    dataBag.connections = {};

    let pathCounter = 0;

    Object.keys(doc.connections).forEach(function (key, index) {

        let computed = {};

        let endp1Components = doc.connections[key].endpoints[0].split(":");
        let endp2Components = doc.connections[key].endpoints[1].split(":");

        computed.endp1 = {
            nodeName: endp1Components[0],
            portLabel: endp1Components[1],
            isGroup: false
        }

        computed.endp2 = {
            nodeName: endp2Components[0],
            portLabel: endp2Components[1],
            isGroup: false
        }

        if (computed.endp1.nodeName in doc.groups) {
            computed.endp1.node = doc.groups[computed.endp1.nodeName];
            computed.endp1.nodeComputed = dataBag.groups[computed.endp1.nodeName];
            computed.endp1.isGroup = true;
        }
        else if (computed.endp1.nodeName in doc.icons) {
            computed.endp1.node = doc.icons[computed.endp1.nodeName];
            computed.endp1.nodeComputed = dataBag.icons[computed.endp1.nodeName];
        }
        else if (computed.endp1.nodeName in doc.notes)
        {
            computed.endp1.node = doc.notes[computed.endp1.nodeName];
            computed.endp1.nodeComputed = dataBag.notes[computed.endp1.nodeName];
        }

        if (computed.endp2.nodeName in doc.groups) {
            computed.endp2.node = doc.groups[computed.endp2.nodeName];
            computed.endp2.nodeComputed = dataBag.groups[computed.endp2.nodeName];
            computed.endp2.isGroup = true;
        }
        else if (computed.endp2.nodeName in doc.icons) {
            computed.endp2.node = doc.icons[computed.endp2.nodeName];
            computed.endp2.nodeComputed = dataBag.icons[computed.endp2.nodeName];
        }
        else if (computed.endp2.nodeName in doc.notes)
        {
            computed.endp2.node = doc.notes[computed.endp2.nodeName];
            computed.endp2.nodeComputed = dataBag.notes[computed.endp2.nodeName];
        }

        // Simple connection
        if (!computed.endp1.isGroup && !computed.endp2.isGroup) {
            drawConnection(connectionsContainer, doc.connections[key], computed.endp1, computed.endp2, pathCounter++, dataBag);
        }
        else if (computed.endp1.isGroup && !computed.endp2.isGroup) {
            computed.endp1.nodeComputed.groupFlat.members.forEach(function (member, idx) {
                let virtEndp1 = {
                    node: member,
                    nodeComputed: dataBag.icons[member],
                    portLabel: computed.endp1.portLabel
                }

                drawConnection(connectionsContainer, doc.connections[key], virtEndp1, computed.endp2, pathCounter++, dataBag);
            });
        }
        else if (!computed.endp1.isGroup && computed.endp2.isGroup) {
            computed.endp2.nodeComputed.groupFlat.members.forEach(function (member, idx) {
                let virtEndp2 = {
                    node: member,
                    nodeComputed: dataBag.icons[member],
                    portLabel: computed.endp2.portLabel
                }

                drawConnection(connectionsContainer, doc.connections[key], computed.endp1, virtEndp2, pathCounter++, dataBag);
            });
        }
        else {
            computed.endp1.nodeComputed.groupFlat.members.forEach(function (endp1Member, endp1Idx) {
                let virtEndp1 = {
                    node: endp1Member,
                    nodeComputed: dataBag.icons[endp1Member],
                    portLabel: computed.endp1.portLabel
                }

                computed.endp2.nodeComputed.groupFlat.members.forEach(function (endp2Member, endp2Idx) {

                    let virtEndp2 = {
                        node: endp2Member,
                        nodeComputed: dataBag.icons[endp2Member],
                        portLabel: computed.endp2.portLabel
                    }

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

    if(enp1.nodeComputed.xScaled > enp2.nodeComputed.xScaled) {
        let temp = enp1;
        enp1 = enp2;
        enp2 = temp;
    }

    let fontSize = rootConnection.textSizeRatio * Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs);

    let xOffset = rootConnection.labelOffsetRatio * Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs);

    let curveType = rootConnection.curve;

    let pathD = "";

    if (curveType == "Linear") {
        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else if (curveType == "StepBefore") {
        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp1.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else if (curveType == "StepAfter") {
        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else if (curveType == "Step") {
        let midpointX = (enp1.nodeComputed.xScaled + enp2.nodeComputed.xScaled) / 2;

        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${midpointX}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${midpointX}, ${enp2.nodeComputed.yScaled} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }
    else if (curveType == "StepReversed") {
        let midpointY = (enp1.nodeComputed.yScaled + enp2.nodeComputed.yScaled) / 2;

        pathD += `M ${enp1.nodeComputed.xScaled}, ${enp1.nodeComputed.yScaled} `;
        pathD += `L ${enp1.nodeComputed.xScaled}, ${midpointY} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${midpointY} `;
        pathD += `L ${enp2.nodeComputed.xScaled}, ${enp2.nodeComputed.yScaled} `;
    }

    path.attr("d", pathD)

    let enp1Label = connectionContainer.append("text")
        .attr("class", "connection-label")
        .attr("font-size", `${fontSize}px`)
        .attr("dx", `${xOffset}`)
        .attr("dy", `${fontSize / 2 * -1}`);

    enp1Label.append("textPath")
        .style("text-anchor", "start")
        .attr("xlink:href", `#path-${pathId}`)
        .text(enp1.portLabel);


    let enp2Label = connectionContainer.append("text")
        .attr("class", "connection-label")
        .attr("font-size", `${fontSize}px`)
        .attr("dx", `${xOffset * -1}`)
        .attr("dy", `${fontSize / 2 }`);

    enp2Label.append("textPath")
        .style("text-anchor", "end")        
        .attr("startOffset", "100%")
        .attr("xlink:href", `#path-${pathId}`)
        .text(enp2.portLabel);
}