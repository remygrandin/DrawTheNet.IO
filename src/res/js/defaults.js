const documentDefaults = {
    aspectRatio: null,
    margin: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
    },
    fill: "white",
    watermark: true,
    renderRatio: 3,
    fileTitlePrefix: "drawthenet.io",
    schemasVersion: 1
}

const diagramDefaults = {    
    columns: 10,
    rows: 10,
    invertY: false,
    gridLines: true,    
    margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    }    
}

const titleDefaults = {
    border: "bar",
    position: "bottom",

    text: "Diagram title",
    subText: null,

    author: "Unknown",
    company: null,
    date: new Date().toISOString().split('T')[0],
    version: 1,

    color: "black",
    stroke: "black",
    fill: null,

    heightPercentage: 6,
    padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    
    logoUrl: "./res/logo.svg",
    logoFill: null,
    logoIcon: null,
    logoIconFamily: "Iconify",
}

const iconDefaults = {
    margin: {
        top: 0.10,
        right: 0.05,
        bottom: 0.10,
        left: 0.05
    },
    padding: {
        top: 0.10,
        right: 0.05,
        bottom: 0.10,
        left: 0.05
    },
    w: 1,
    h: 1,
    textLocation: "bottomCenter",
    textSizeRatio: 0.1,
    iconFamily: "Iconify", 
    icon: "grommet-icons:document-missing",
    fill: "white",
    stroke: "black",
    color: "black",
    strokeDashArray: "0,0",
    animated: false,
    animationSpeed: "medium"
}

const groupDefaults = {
    padding: {
        top: 0.15,
        right: 0.15,
        bottom: 0.15,
        left: 0.15
    },
    textSizeRatio: 0.2,
    fill: "white",
    stroke: "black",
    color: "black",
    textLocation: "topCenter",
    strokeDashArray: "0,0",
    animated: false,
    animationSpeed: "medium"
}

const connectionDefaults = {
    textSizeRatio: 0.1,
    color: "black",
    stroke: "black",
    strokeDashArray: "0,0",
    strokeWidth: 1,
    curve: "Linear",
    curveOffset: 0,
    endpLabelOffsetRatio: 1,
    margin: {
        endp1: 0.08,
        endp2: 0.08
    },
    animated: false,
    animationSpeed: "medium"
}

const noteDefaults = {
    margin: {
        top: 0.10,
        right: 0.05,
        bottom: 0.10,
        left: 0.05
    },
    padding: {
        top: 0.10,
        right: 0.05,
        bottom: 0.10,
        left: 0.05
    },
    textSizeRatio: 0.12,
    fill: "white",
    stroke: "black",
    color: "black",
    w: 1,
    h: 1,

    xAlign: "left",
    yAlign: "top",

    flexDirection: "column",

}

const noteXAlignMap = {
    left: {
        textAlign: "left",
        alignItems: "flex-start"
    },
    right: {
        textAlign: "right",
        alignItems: "flex-end"
    },
    center: {
        textAlign: "center",
        alignItems: "center"
    }
}

const noteYAlignMap = {
    top: {
        justifyContent: "flex-start"
    },
    center: {
        justifyContent: "center"
    },
    bottom: {
        justifyContent: "flex-end"
    }
}


export function ApplyDefaults(doc) {
    // Merge the default into the document section properties
    doc.document = Object.assign(clone(documentDefaults), doc.document || {});    
    // Merge the default into the diagram section properties
    doc.diagram = Object.assign(clone(diagramDefaults), doc.diagram || {});
    // Merge the default into the title section properties
    doc.title = Object.assign(clone(titleDefaults), doc.title || {});
    


    // Merge the default into the icons section properties for each icon
    doc.icons = doc.icons || [];
    if (Array.isArray(doc.icons)) {
        doc.icons = Object.assign({}, doc.icons);
    }
    Object.keys(doc.icons).forEach(function (key, index) {
        doc.icons[key] = Object.assign(clone(iconDefaults), doc.icons[key]);
    });

    // Merge the default into the groups section properties for each group
    doc.groups = doc.groups || [];
    if (Array.isArray(doc.groups)) {
        doc.groups = Object.assign({}, doc.groups);
    }
    Object.keys(doc.groups).forEach(function (key, index) {
        doc.groups[key] = Object.assign(clone(groupDefaults), doc.groups[key]);
    });

    // Merge the default into the connections section properties for each connection
    doc.connections = doc.connections || [];
    if (Array.isArray(doc.connections)) {
        doc.connections = Object.assign({}, doc.connections);
    }
    Object.keys(doc.connections).forEach(function (key, index) {
        doc.connections[key] = Object.assign(clone(connectionDefaults), doc.connections[key]);
    });

    // Merge the default into the notes section properties for each note
    doc.notes = doc.notes || [];
    if (Array.isArray(doc.notes)) {
        doc.notes = Object.assign({}, doc.notes);
    }
    Object.keys(doc.notes).forEach(function (key, index) {
        doc.notes[key] = Object.assign(clone(noteDefaults), doc.notes[key]);

        if (!("alignItems" in doc.notes[key])) {
            doc.notes[key].alignItems = noteXAlignMap[doc.notes[key].xAlign].alignItems;
        }

        if (!("justifyContent" in doc.notes[key])) {
            doc.notes[key].justifyContent = noteYAlignMap[doc.notes[key].yAlign].justifyContent;
        }

        if (!("textAlign" in doc.notes[key])) {
            doc.notes[key].textAlign = noteXAlignMap[doc.notes[key].xAlign].textAlign;
        }
    });
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}