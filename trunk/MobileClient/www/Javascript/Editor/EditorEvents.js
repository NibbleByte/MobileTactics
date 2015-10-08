//===============================================
// EditorEvents
//
// Editor specific events.
//===============================================
"use strict";

var EditorEvents = {
		
		Properties: {
			GAME_PROPERTIES_CHANGED:	"editor.properties.game_properties_changed",	// Arguments: width, height
		},

		Brushes: {
			ACTIVE_BRUSH_CHANGED:		"editor.brushes.brush_changed",		// Arguments: brush
			ACTIVE_BRUSH_MODIFIED:		"editor.brushes.brush_modified",	// Arguments: brush
		},
};

var EditorBlackBoard = {
	
	Brushes: {
		CURRENT_BRUSH:	"editor.brushes.current_brush",
	},
};