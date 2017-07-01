!INC Local Scripts.EAConstants-JScript

/*
 * This code has been included from the default Project Browser template.
 * If you wish to modify this template, it is located in the Config\Script Templates
 * directory of your EA install path.   
 * 
 * Script Name:
 * Author:
 * Purpose:
 * Date:
 */
 
 var TAG = "APP_ID";

/*
 * Project Browser Script main function
 */
function OnProjectBrowserScript()
{
	// Get the type of element selected in the Project Browser
	var treeSelectedType = Repository.GetTreeSelectedItemType();
	
	// Handling Code: Uncomment any types you wish this script to support
	// NOTE: You can toggle comments on multiple lines that are currently
	// selected with [CTRL]+[SHIFT]+[C].
	switch ( treeSelectedType )
	{
		case otPackage:
		{
			// Code for when a package is selected
			//var thePackage as EA.Package;
			thePackage = Repository.GetTreeSelectedObject();
			AggregateElements( thePackage );
			break;
		}
		default:
		{
			// Error message
			Session.Prompt( "This script does not support items of this type.", promptOK );
		}
	}
}

function AggregateElements( thePackage ) {
	Log( "========== Aggregating Elements ==========" );
	
	// Create map data structure
	var elementMap = {};
	// Get a map of elements by TAG
	elementMap = GetElementLists( thePackage, elementMap );
	
	// Consolidate each element by TAG
	ConsolidateElements( thePackage, elementMap );
	
	Log( "========== Aggregating Complete ==========" );
}

/**
 *	Recursively loops through each sub-package and adds elements with <TAG> to the data structure.
 *	
 *	The data structure should be a JavaScript Object acting as a map (Map<string, Element[]).
 */
var GetElementLists = function( thePackage, elementMap ) {
	Log( "Searching " + thePackage.Name + "..." );
	
	// Recurse through each package
	for(var i = 0; i < thePackage.Packages.Count; i++) {
		Log( "(" + (i+1) + "/" + thePackage.Packages.Count + ") " + thePackage.Packages.GetAt( i ).Name );
		elementMap = GetElementLists( thePackage.Packages.GetAt( i ), elementMap );
	}
	// Loop through elements. Note that sub-elements are ignored.
	for(var i = 0; i < thePackage.Elements.Count; i++) {
		var element as EA.Element;
		element = thePackage.Elements.GetAt( i );
		
		// If the element has <TAG>, add it to our map.
		if( element.TaggedValuesEx.GetByName( TAG ) ) {
			var tag = element.TaggedValuesEx.GetByName( TAG ).Value;
			if( !(tag in elementMap) ) {
				elementMap[ tag ] = [];
			}
			elementMap[ tag ].push( element );
			Log( "... found " + element.Name );
		}
	}
	
	return elementMap;
};
	
function ConsolidateElements( thePackage, elementMap ) {
	var destination as EA.Package;
	var destinationElements = {};
	destination = Repository.GetPackageByID( thePackage.ParentID ).Packages.AddNew( Session.Input("Please enter the package name."), "" );
	destination.Update();
	
	for(var key in elementMap) {
		// Create new element
		var element as EA.Element;
		element = destination.Elements.AddNew( elementMap[key][0].Name, "Object" );
		var tag = element.TaggedValues.AddNew(TAG, "")
		tag.Value = key;
		tag.Update();
		
		// Aggregate Stereotypes & Difficulties
		element = AggregateStereotypes( element, elementMap[key] );
		element.Notes = "See section 6.";
		
		element.Update();
		destinationElements[key] = element;
	}
		
	// Aggregate Interfaces
	destinationElements = AggregateInterfaces( destinationElements, elementMap );
	
	// Remove Duplicate Interfaces
	destinationElements = RemoveDuplicateInterfaces( destinationElements );
}

function AggregateStereotypes( element, elementList ) {
	elementList.forEach(function(item, index, array) {
		var other as EA.Element;
		other = item;
		if(element.Stereotype == "enhance" || other.Stereotype == "enhance") {
			element.Stereotype = "enhance";
		} else if( element.Stereotype == "configure" || other.Stereotype == "configure") {
			element.Stereotype = "configure";
		} else if( element.Stereotype == "test only" || other.Stereotype == "test only") {
			element.Stereotype = "test only";
		} else if( element.Stereotype == "test support" || other.Stereotype == "test support") {
			element.Stereotype = "test support";
		} else {
			element.Stereotype = "existing";
		}
		
		element.Complexity = element.Complexity >= other.Complexity ? element.Complexity : other.Complexity;
		
		element.Update();
	});
	
	return element;
}

/**
 * Takes in a map of "destination" elements (our aggregation), and a map of
 * "original" elements (the ones we are aggregating).
*/
function AggregateInterfaces( aggregatedElements, elementMap ) {
	// Iterate through each "aggregate" element
	var aggregatedElement as EA.Element;
	var originalElement as EA.Element;
	for(var aggregatedKey in aggregatedElements) {
		aggregatedElement = aggregatedElements[aggregatedKey];
		// Iterate through each of its "original" elements
		elementMap[aggregatedKey].forEach(function(item, index, array) {
			originalElement = item;
			// Iterate through each association
			for(var i = 0; i < originalElement.Connectors.Count; i++) {
				var connector as EA.Connector;
				connector = originalElement.Connectors.GetAt(i);
				//Log("Element: " + originalElement.Name + "; Source/Client: " + Repository.GetElementByID( connector.ClientID ).Name + "; Dest/Supplier: " + Repository.GetElementByID( connector.SupplierID ).Name );
				
				// If the element is the source and destination is an element we care about
				if( connector.ClientID == originalElement.ElementID ) {
					var other = Repository.GetElementByID( connector.SupplierID );
					var tag = other.TaggedValues.GetByName( TAG );
					if( tag && tag.Value in elementMap ) {
						
						// create an association between source and destination
						var newConnection as EA.Connector;
						newConnection = aggregatedElement.Connectors.AddNew( connector.Name, "Association" );
						newConnection.ClientID = aggregatedElement.ElementID;
						newConnection.SupplierID = aggregatedElements[tag.Value].ElementID;
						newConnection.Name = connector.Name;
						newConnection.Notes = connector.Notes;
						newConnection.Stereotype = connector.Stereotype;
						newConnection.Direction = newConnection.Direction;
						newConnection.Update();
					}
				}
			}
		});
	}
		
	return aggregatedElements;
}

function RemoveDuplicateInterfaces( elementMap ) {
	// Loop through each element
	for(var eKey in elementMap) {
		var element = elementMap[eKey];
		// Loop through each interface
		var interfaces = {};
		for(var i = 0; i < element.Connectors.Count; i++) {
			var connector as EA.Connector;
			connector = element.Connectors.GetAt(i);
			
			// Aggregate by same source/destination and destination/source
			var key = connector.clientID + ":" + connector.SupplierID;
			if( !(key in interfaces) ) {
				interfaces[key] = [];
			}
		}
		// Loop through each client/supplier pair
		for(var key in interfaces) {
			Log("Key: " + key);
			// Save the "original" connector/interface in that pair
			var original = interfaces[key][0];
			// Loop through each of the duplicates
			for(var i = 1; i < interfaces[key].length; i++) {
				// If the stereotype is the same as the "original"...
				Log(element.Name + " (" + original.Stereotype + ", " + interfaces[key][i].Stereotype);
				if(original.Stereotype == interfaces[key][i].Stereotype) {
					// Find the duplicate and delete it...
					for(var q = 0; q < element.Connectors.Count; q++) {
						// Matching based on ConnectorID
						if(element.Connectors.GetAt(q).ConnectorID == interfaces[key][i].ConnectorID) {
							element.Connectors.DeleteAt(q, false);
							element.Update();
							break;
						}
					}
				}
			}
		}
	}
	return elementMap;
}

function Log( message ) {
	Session.Output( "LOG: " + message );
}

OnProjectBrowserScript();
