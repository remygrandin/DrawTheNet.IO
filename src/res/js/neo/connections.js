export function RenderConnections(container, doc, dataBag) {
    let connectionsContainer = container.append("g")
        .attr("class", "connections");

    dataBag.connections = {};

    Object.keys(doc.connections).forEach(function (key, index) {
        
        let computed = {};

        let endp1Components = doc.connections[key].endpoints[0].split(":");
        let endp2Components = doc.connections[key].endpoints[1].split(":");

        let endp1 = {
            nodeName: endp1Components[0],
            portLabel: endp1Components[1],
            isGroup: false
        }

        let endp2 = {
            nodeName: endp2Components[0],
            portLabel: endp2Components[1],
            isGroup: false
        }

        if(endp1.nodeName in doc.groups) {
            endp1.node = doc.groups[endp1.nodeName];
            endp1.nodeComputed = dataBag.groups[endp1.nodeName];
            endp1.isGroup = true;
        }
        else if(endp1.nodeName in doc.icons) {
            endp1.node = doc.icons[endp1.nodeName];
            endp1.nodeComputed = dataBag.icons[endp1.nodeName];
        }

        if(endp2.nodeName in doc.groups) {
            endp2.node = doc.groups[endp2.nodeName];
            endp2.nodeComputed = dataBag.groups[endp2.nodeName];
            endp2.isGroup = true;
        }
        else if(endp2.nodeName in doc.icons) {
            endp2.node = doc.icons[endp2.nodeName];
            endp2.nodeComputed = dataBag.icons[endp2.nodeName];
        }

        // Simple connection
        if(!endp1.isGroup && !endp2.isGroup) {
            drawConnection(connectionsContainer, doc.connections[key], endp1, endp2);
        }
        else if(endp1.isGroup && !endp2.isGroup)
        {
            endp1.nodeComputed.groupFlat.members.forEach(function (member, idx) {
                let virtEndp1 = {
                    node: member,
                    nodeComputed: dataBag.icons[member],
                    portLabel: endp1.portLabel
                }

                drawConnection(connectionsContainer, doc.connections[key], virtEndp1, endp2);
            });
        }
        else if(!endp1.isGroup && endp2.isGroup)
        {
            endp2.nodeComputed.groupFlat.members.forEach(function (member, idx) {
                let virtEndp2 = {
                    node: member,
                    nodeComputed: dataBag.icons[member],
                    portLabel: endp2.portLabel
                }

                drawConnection(connectionsContainer, doc.connections[key], endp1, virtEndp2);
            });
        }
        else {
            endp1.nodeComputed.groupFlat.members.forEach(function (endp1Member, endp1Idx) {
                let virtEndp1 = {
                    node: endp1Member,
                    nodeComputed: dataBag.icons[endp1Member],
                    portLabel: endp1.portLabel
                }

                endp2.nodeComputed.groupFlat.members.forEach(function (endp2Member, endp2Idx) {

                    let virtEndp2 = {
                        node: endp2Member,
                        nodeComputed: dataBag.icons[endp2Member],
                        portLabel: endp2.portLabel
                    }

                    drawConnection(connectionsContainer, doc.connections[key], virtEndp1, virtEndp2);

                });                
            });

        }




    });

}

function drawConnection(container, rootConnection, enp1, enp2)
{
    let connectionContainer = container.append("g")
        .attr("class", "connection");

    let path = connectionContainer.append("path")
        .attr("class", "connection-path")
        .attr("stroke", rootConnection.stroke)
        .attr("stroke-width", rootConnection.strokeWidth)
        .attr("stroke-dasharray", rootConnection.strokeDashArray);        

    let curveType = "linear";

    let pathD = "";

    if(curveType == "linear")
    {
        pathD += "M " + enp1.nodeComputed.xScaled + "," + enp1.nodeComputed.yScaled + " ";
        pathD += "L " + enp2.nodeComputed.xScaled + "," + enp2.nodeComputed.yScaled + " ";
    }

    path.attr("d", pathD)

}