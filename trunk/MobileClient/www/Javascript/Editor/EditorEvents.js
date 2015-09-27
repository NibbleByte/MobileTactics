//===============================================
// EditorEvents
//
// Editor specific events.
//===============================================
"use strict";

var EditorEvents = {
		Brushes: {
			ACTIVE_BRUSH_CHANGED:		"editor.brushes.brush_changed",		// Arguments: event, brush
			ACTIVE_BRUSH_MODIFIED:		"editor.brushes.brush_modified",	// Arguments: event, brush
		},
};

var EditorBlackBoard = {
	
	Properties: {
		LOCK_SIZES: "editor.brushes.lock_sizes",
	},

	Brushes: {
		CURRENT_BRUSH:	"editor.brushes.current_brush",
	},
};