option explicit

!INC Local Scripts.EAConstants-VBScript

' Script Name:	Requirements-To-Notes
' Author:		John Lynn
' Purpose:		Summarizes all the requirements that the entity traces to in the notes.
' Date:			7/25/16

' Assumes entities in the package use connectors with the "trace" stereotype to requirements.
' Used http://community.sparxsystems.com/community-resources/489-61listing-all-connectors-in-a-diagram to help understand connectors.

'
' Project Browser Script main function
'
sub OnProjectBrowserScript()
	' Get the type of element selected in the Project Browser
	dim treeSelectedType
	treeSelectedType = Repository.GetTreeSelectedItemType()
	
	' Handling Code: Uncomment any types you wish this script to support
	' NOTE: You can toggle comments on multiple lines that are currently
	' selected with [CTRL]+[SHIFT]+[C].
	select case treeSelectedType
		case otPackage
			' Code for when a package is selected
			dim thePackage as EA.Package
			set thePackage = Repository.GetTreeSelectedObject()
			
			LoopThroughElements( thePackage )
		case else
			' Error message
			Session.Prompt "This script does not support items of this type.", promptOK
			
	end select
end sub

sub LoopThroughElements( currentPackage )
	dim package as EA.Package
	set package = currentPackage
	
	dim element as EA.Element
	for each element in package.Elements
	' If you want to add some sort of filter, here's the place.
	'	dim tag as EA.TaggedValue
	'	for each tag in element.TaggedValuesEx
	'		if tag.Name = "APP_ID" then
				UpdateObjectNotes( element )
	'		end if
	'	next
	next
end sub

sub UpdateObjectNotes( currentElement )
	dim message
	message = "Impacts"
	dim connector as EA.Connector
	for each connector in currentElement.Connectors
		if connector.StereotypeEx = "trace" then
			message = message & vbCrLf
			message = message & connector.Name & " (" & Repository.GetElementByID( connector.SupplierID ).Name & ")"
		end if
	next
	currentElement.Notes = message
	currentElement.Update()
end sub

OnProjectBrowserScript
