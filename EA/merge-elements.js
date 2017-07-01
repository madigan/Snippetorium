!INC Local Scripts.EAConstants-JScript

/*
 * Script Name:	Merge Elements
 * Author:		John Lynn
 * Purpose:		"Merges" duplicate elements in a package by comparing the TAG
 *				and transfering notes, interfaces, and diagram presence. The
 *				original is the first entity it sees with that specific tag
 *				value. Duplicates have their names updated so they can be
 *				deleted at the author's leisure.
 * Date:		8/10/16
 */
 
 var TAG = "APP_ID"

/*
 * Project Browser Script main function
 */
function OnProjectBrowserScript()
{
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	
	switch ( treeSelectedType )
	{
		case otPackage :
		{
			var thePackage as EA.Package;
			thePackage = Repository.GetTreeSelectedObject();
			MergeEntities( thePackage )
			break;
		}
		default:
		{
			// Error message
			Session.Prompt( "This script does not support items of this type.", promptOK );
		}
	}
}

function MergeEntities( thePackage ) {
	var p as EA.Package;
	p = thePackage;
	var duplicates = [];
	for(i = 0; i < thePackage.Elements.Count; i++) {
		duplicates.push(thePackage.Elements.GetAt(i));
	}
	
	duplicates = FindDuplicates( duplicates );
	
	for(var key in duplicates) {
		CombineEntities( duplicates[key] );
	}
}

// Create an object that aggregates the entities in the array by TAG
function FindDuplicates( entities ) {
	var duplicates = {};
	entities.forEach(function(item, index, array) {
		var entity as EA.Element;
		entity = item;
		if(entity.TaggedValuesEx.GetByName(TAG)) {
			var id = entity.TaggedValuesEx.GetByName(TAG).Value;

			if( !(id in duplicates) ) {
				duplicates[id] = [];
			} 
			duplicates[id].push(entity);
		}
	});
	return duplicates;
}

function CombineEntities( entities ) {
	CombineNotes ( entities );
	CombineLinks ( entities );
	CombineDiagrams( entities );
	
	for(i = 1; i < entities.length; i++) {
		entities[i].Name = "(Duplicate) " + entities[i].Name;
		entities[i].Update();
	}
}

function CombineNotes( entities ) {
	var original as EA.Element;
	original = entities[0];
	
	for(i = 1; i < entities.length; i++) {
		original.Notes = original.Notes + '\r\n' + entities[i].Notes;
		original.Update();
	}
}

function CombineLinks( entities ) {
	var entity as EA.Element;
	var original as EA.Element;
	original = entities[0];
	
	for(i = 1; i < entities.length; i++) {
		entity = entities[i];
		for(c = 0; c < entity.Connectors.Count; c++) {
			var link as EA.Connector;
			link = entity.Connectors.GetAt(c);
			if( entity.ElementID == link.ClientID 
					&& link.Type == "Association" ) {
				link.ClientID = original.ElementID;
			}
			if( entity.ElementID == link.SupplierID 
					&& link.Type == "Association"  ) {
				link.SupplierID = original.ElementID;
			}
			link.Update();
		}
	}
}

function CombineDiagrams( entities ) {
	var entity as EA.Element;
	var original as EA.Element;
	original = entities[0];
	Repository.SQLQuery
	for(i = 1; i < entities.length; i++) {
		entity = entities[i];
		var diagrams as EA.Collection;
		diagrams = Repository.GetPackageByID(entity.PackageID).Diagrams;

		for(d = 0; d < diagrams.Count; d++) {
			var diagram as EA.Diagram;
			diagram = diagrams.GetAt(d);

			var diagramObjects as EA.Collection;
			diagramObjects = diagram.DiagramObjects;
			
			var target as EA.DiagramObject;
			target = diagram.GetDiagramObjectByID(entity.ElementID, "");
			
			var replacement as EA.DiagramObject;
			replacement = diagram.DiagramObjects.AddNew( "l=" + target.left + "r=" + target.right + "t=" + target.top + "b=" + target.bottom, "");
			replacement.ElementID = original.ElementID;
			replacement.Update();
			
			for(o = 0; o < diagramObjects.Count; o++) {
				if(diagramObjects.GetAt(o).ElementID == target.ElementID) {
					diagramObjects.DeleteAt(o, true);
					break;
				}
			}
			Repository.RefreshOpenDiagrams(true);
		}
	}
}

OnProjectBrowserScript();
