import { ApplyTextLocation, ExtractColorAndOpacity } from './common.js'

export function RenderGroups(container, doc, dataBag) {
    let groupsContainer = container.append("g")
        .attr("class", "groups");

    dataBag.groups = {};

    Object.keys(doc.groups).forEach(function (key, index) {
        let groupContainer = groupsContainer.append("g")
            .attr("class", "group")

        let computed = {};

        // Determine recursive members & max depth
        computed.groupFlat = getGroupMembersRecursive(doc, key, []);

        // get min X1/y1 and max X2/y2
        computed.x1 = Number.MAX_SAFE_INTEGER;
        computed.y1 = Number.MAX_SAFE_INTEGER;
        computed.x2 = Number.MIN_SAFE_INTEGER;
        computed.y2 = Number.MIN_SAFE_INTEGER;

        doc.groups[key].members.forEach(function (member, index) {
            if (member in dataBag.icons) {
                let icon = dataBag.icons[member];
                computed.x1 = Math.min(computed.x1, icon.xScaled + icon.x1Marged);
                computed.y1 = Math.min(computed.y1, icon.yScaled + icon.y1Marged);
                computed.x2 = Math.max(computed.x2, icon.xScaled + icon.x2Marged);
                computed.y2 = Math.max(computed.y2, icon.yScaled + icon.y2Marged);
            }
            else if (member in dataBag.notes) {
                let note = dataBag.notes[member];
                computed.x1 = Math.min(computed.x1, note.xScaled + note.x1Marged);
                computed.y1 = Math.min(computed.y1, note.yScaled + note.y1Marged);
                computed.x2 = Math.max(computed.x2, note.xScaled + note.x2Marged);
                computed.y2 = Math.max(computed.y2, note.yScaled + note.y2Marged);
            }
            else if (member in dataBag.groups) {
                let group = dataBag.groups[member];
                computed.x1 = Math.min(computed.x1, group.x1);
                computed.y1 = Math.min(computed.y1, group.y1);
                computed.x2 = Math.max(computed.x2, group.x2);
                computed.y2 = Math.max(computed.y2, group.y2);
            }
        });

        computed.scaledPadding = {
            top: doc.groups[key].padding.top * dataBag.Scaler.Y.UnitStepAbs,
            right: doc.groups[key].padding.right * dataBag.Scaler.X.UnitStepAbs,
            bottom: doc.groups[key].padding.bottom * dataBag.Scaler.Y.UnitStepAbs,
            left: doc.groups[key].padding.left * dataBag.Scaler.X.UnitStepAbs
        }

        computed.x1 -= computed.scaledPadding.left;
        computed.y1 -= computed.scaledPadding.top;
        computed.x2 += computed.scaledPadding.right;
        computed.y2 += computed.scaledPadding.bottom;

        computed.wScaled = computed.x2 - computed.x1;
        computed.hScaled = computed.y2 - computed.y1;

        groupContainer.attr("transform", "translate(" + computed.x1 + ", " + computed.y1 + ")");

        computed.cornerRad = Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs) * (1 / 16);



        let fillData = ExtractColorAndOpacity(doc.groups[key].fill);
        let strokeData = ExtractColorAndOpacity(doc.groups[key].stroke);

        let groupRect = groupContainer.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", computed.wScaled)
            .attr("height", computed.hScaled)
            .attr("rx", computed.cornerRad)
            .attr("ry", computed.cornerRad)
            .attr("fill", fillData.color)
            .attr("fill-opacity", fillData.opacity)
            .attr("stroke", strokeData.color)
            .attr("stroke-opacity", strokeData.opacity);

        let fontSize = doc.groups[key].textSizeRatio * Math.min(dataBag.Scaler.X.UnitStepAbs, dataBag.Scaler.Y.UnitStepAbs) / 2

        let textColorData = ExtractColorAndOpacity(doc.groups[key].color);

        let groupText = groupContainer.append("text")
            .attr("class", "group-label")
            .attr("fill", textColorData.color)
            .attr("fill-opacity", textColorData.opacity)
            .style("font-size", `${fontSize}px`);

        let textContent = key;
        if ("text" in doc.groups[key]) {
            textContent = doc.groups[key].text;
        }

        groupText.text(textContent);

        // Text location

        ApplyTextLocation(groupText, doc.groups[key].textLocation,
            0 + computed.scaledPadding.left * (1 / 4),
            0 + computed.scaledPadding.top * (1 / 4),
            computed.wScaled - computed.scaledPadding.right * (1 / 4),
            computed.hScaled - computed.scaledPadding.bottom * (1 / 4));

        dataBag.groups[key] = computed;
    });
}

function getGroupMembersRecursive(doc, groupName, parentArray) {
    if (parentArray.includes(groupName)) {
        throw new Error("Looping group definition detected: " + parentArray.join(" -> ") + " -> " + groupName);
    }

    let retObj = {
        maxDepth: 1,
        members: []
    }

    doc.groups[groupName].members.forEach(function (member, index) {
        if (member in doc.groups) {
            let subGroup = getGroupMembersRecursive(doc, member, parentArray.concat([groupName]));
            retObj.members = retObj.members.concat(subGroup.members);
            retObj.maxDepth = Math.max(retObj.maxDepth, subGroup.maxDepth + 1);
        } else if (member in doc.icons || member in doc.notes) {
            retObj.members.push(member);
        }
    });

    // Remove duplicates
    retObj.members = [...new Set(retObj.members)];

    return retObj;
}