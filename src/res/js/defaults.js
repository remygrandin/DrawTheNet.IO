const diagramDefaults = {
    fill: "white",
    aspectRatio: null,
    rows: 10,
    columns: 10,
    gridLines: true,
    margin: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
    },
    padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    watermark: true,
    renderRatio: 3,
    fileTitlePrefix: "drawthenet.io"
}

const titleDefaults = {
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
    type: "bar"
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
    textLocation: "bottomCenter",
    textSizeRatio: 0.1,
    fill: "white",
    stroke: "black",
    color: "black",
    w: 1,
    h: 1
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
}

const connectionDefaults = {
    textSizeRatio: 0.1,
    color: "black",
    stroke: "black",
    strokeDashArray: "0,0",
    strokeWidth: 1,
    curve: "Linear",
    labelOffsetRatio: 0.6,
    margin: {
        endp1: 0.05,
        endp2: 0.05
    }
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
    // Merge the default into the diagram section properties
    doc.diagram = Object.assign(clone(diagramDefaults), doc.diagram || {});
    // Merge the default into the title section properties
    doc.title = Object.assign(clone(titleDefaults), doc.title || {});

    doc.connections = doc.connections || [];
    doc.groups = doc.groups || [];
    doc.notes = doc.notes || [];
    doc.icons = doc.icons || [];

    if (Array.isArray(doc.icons)) {
        doc.icons = Object.assign({}, doc.icons);
    }
    Object.keys(doc.icons).forEach(function (key, index) {
        doc.icons[key] = Object.assign(clone(iconDefaults), doc.icons[key]);
    });

    if (Array.isArray(doc.groups)) {
        doc.groups = Object.assign({}, doc.groups);
    }
    Object.keys(doc.groups).forEach(function (key, index) {
        doc.groups[key] = Object.assign(clone(groupDefaults), doc.groups[key]);
    });

    if (Array.isArray(doc.connections)) {
        doc.connections = Object.assign({}, doc.connections);
    }
    Object.keys(doc.connections).forEach(function (key, index) {
        doc.connections[key] = Object.assign(clone(connectionDefaults), doc.connections[key]);
    });

    if (Array.isArray(doc.notes)) {
        doc.notes = Object.assign({}, doc.notes);
    }
    Object.keys(doc.notes).forEach(function (key, index) {
        doc.notes[key] = Object.assign(clone(noteDefaults), doc.notes[key]);

        if(!("alignItems" in doc.notes[key])) {
            doc.notes[key].alignItems = noteXAlignMap[doc.notes[key].xAlign].alignItems;
        }

        if(!("justifyContent" in doc.notes[key])) {
            doc.notes[key].justifyContent = noteYAlignMap[doc.notes[key].yAlign].justifyContent;
        }

        if(!("textAlign" in doc.notes[key])) {
            doc.notes[key].textAlign = noteXAlignMap[doc.notes[key].xAlign].textAlign;
        }        
    });
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}