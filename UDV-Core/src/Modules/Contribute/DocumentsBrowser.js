/**
* Classes: DocumentsBrowser
* Description :
* The Document Handler is an object holding and managing Document objects
* It handles the display of documents in the document browser window, the central window, and billboards.
*
* Documents are objects with properties : source image, title, date, metadata, camera position,
* camera quaternion (both for the oriented view) and billboard position
*/

import * as THREE from 'three';
import { MAIN_LOOP_EVENTS } from 'itowns';
import { ExtendedDocument } from './ExtendedDocument.js'
import './Contribute.css';
import DefaultImage from './DefaultImage.png';
import { CreateDoc } from './CreateDoc.js';
import { DeleteDoc } from './DeleteDoc.js';
import { UpdateDoc } from './UpdateDoc.js';
//import {CreateDoc } from './CreateDoc.js';

// TO DO : pass showBillboardButton as an option to DocumentsHandler
// currently, BILLBOARDS WILL BE ALWAYS HIDDEN if the showBillboardButton global var is set to false !!

/**
* Constructor for DocumentsHandler Class
* The Document Handler is an object holding and managing Document objects.
* It handles the display of documents in the document browser window and the central window.
* Document data is loaded from a csv file, and initialization is only done after loading (asynchronous)
* @param view : itowns planar view
* @param controls : PlanarControls instance
* @param dataFile : CSV file holding the documents data
* @param options : optional parameters (including TemporalController)
*/
//=============================================================================
export function DocumentsBrowser(view, controls, jsonDataFromDB, options = {},url) {

    ///////////// Html elements
    var docDiv = document.createElement("div");
    docDiv.id = 'doc';
    document.body.appendChild(docDiv);

    document.getElementById("doc").innerHTML =
    '<div id="docBrowserWindow">\
      <button id="closeBrowserWindow" type=button>X</button><br/>\
      <br/>\
        <div id="docHead">Document Navigator</div>\
        <div id="docBrowserTitle">doc title</div>\
        <div id="docBrowserMetaData">metadata</div>\
        <div id="docBrowserPreview"><img id="docBrowserPreviewImg"/></div>\
        <div id="docDescription"></div>\
        <div id="docBrowserIndex"></div>\
        <button id="docBrowserNextButton" type=button>⇨</button>\
        <button id="docBrowserPreviousButton" type=button>⇦</button>\
        <div id="operationsOnDoc">\
        <button id="docDelete" type = button>Delete</button>\
        <button id = "docUpdate" type = button>Update</button>\
        <button id="docBrowserOrientButton" type=button>Orient Document</button>\
        </div>\
        <button id = "docCreateFromBrowser" type = button>Create new doc</button>\
    </div>\
    <div id="docFull">\
        <img id="docFullImg"/>\
        <div id="docFullPanel">\
            <button id="docFullClose" type=button>Close</button>\
            <button id="docFullOrient" type=button>Orient Document</button>\
            <label id="docOpaLabel" for="docOpaSlider">Opacity</label>\
            <input id="docOpaSlider" type="range" min="0" max="100" value="75"\
            step="1" oninput="docOpaUpdate(value)">\
            <output for="docOpaSlider" id="docOpacity">50</output>\
        </div>\
    </div>\
    <button id="docBrowserToggleBillboard"\
    type=button\
    style="display:none;">Billboard</button>\
    ';

    var updateDiv = document.createElement("div");
    updateDiv. id = "UpdateWindow";
    document.body.appendChild(updateDiv);
    document.getElementById("UpdateWindow").innerHTML =
    '<div id = "updateDocWindow">\
    <div id = updateDocForm></div>\
    <img id="filePreview"/>\
    <button id = "saveUpdateButton" type = "button">Save</button>\
    <button id = "closeUpdateForm" type="button">Cancel</button>\
    </div>\
    ';

    var schema = "http://rict.liris.cnrs.fr/schemaType.json";
    var optionsUpdate = "http://rict.liris.cnrs.fr/optionsUpdate.json  ";

    $("#updateDocForm").alpaca({
         "schemaSource": schema,
         "optionsSource": optionsUpdate
});

    /////// Class attributes
    // Whandleether the Document Handler sub window displaying controlling GUI elements
    // is currently displayed or not.
    this.docBrowserWindowIsActive = options.docBrowserWindowStartActive || false;

    // FIXME: It would be better to display something like "no document to display"
    // Importing the default image (when no document is present)
    var defaultImage = document.getElementById('docBrowserPreviewImg');
    defaultImage.src = DefaultImage;

    //dirty variables to test billboards
    var billboardsAreActive = false;
    var showBillboardButton = false;

    // FIXME: iTowns view should not be an attribute of DocumentHandler.
    // Instead, it should either have a list of callbacks or a emit events trapped
    // by a controller
    this.view = view;

    // FIXME: This seems to be used for Billboards. Why do we need to access
    // the domElement of the renderer of iTowns to manage billboards ?
    this.domElement = view.mainLoop.gfxEngine.renderer.domElement;

    // PlanarControls instance, required for the oriented view TO DO
    this.controls = controls;

    this.camera = view.camera.camera3D;

    // path to the csv file holding the guided tour data
    //const CSVdataFile = dataFile;

    // TemporalController instance (optional)
    // this is used to set the current date according to the selected document
    // FIXME: Could this be replaced by the trigering of an event asking for a
    // date change and trapped by a controller ?
    this.temporal = options.temporal;

    // array containing all the documents loaded from the csv file
    this.AllDocuments = [];

    // currently active document
    this.currentDoc = null;

    // doc fade-in animation duration, in milliseconds
    this.fadeDuration = options.docFadeDuration || 2750;

    // fade animation handlers
    this.isOrientingDoc = false;
    this.isFadingDoc = false;
    this.fadeAlpha = 0;

    // FIXME: This should be handled using Promises
    // event to be dispatched when this controller has finished initializing
    this.initEvent = document.createEvent('Event');
    this.initEvent.initEvent('docInit', true, true);

    this.url = url;
    /**
    * initialize the controller using data from the csv file
    * this function is called after the completion of readCSVFile() in this.loadDataFromDatabase()
    * @param docDataFromDB : contains the data loaded from the database
    */
    //==========================================================================
    this.initialize = function initialize(docDataFromDB){
        // fill the AllDocuments array with Documents objects
        // the Documents are placed in the order they are loaded, which is their line order in the csv file
        // the docIndex property is specified to be 0,1,2,3 etc... in the csv
        // therefore docIndex is equal to "i", but we specify it in the csv for clarity (we need docIndex for the guided tour csv)
        // the difference between docIndex and doc_ID (used by historians) should be settled asap
        var url = this.url + "/documentsDirectory/";

        for (var i=0; i<docDataFromDB.length; i++) {

            var docData = docDataFromDB[i];
            var docDataMeta = docDataFromDB[i].metadata;
            var docIndex = i;
            var doc_ID = docData.idDocument
            var docImageSourceHD =  url + docDataMeta.link;
            var docImageSourceBD = url + docDataMeta.link;
            var docTitle = docDataMeta.title;
            var docDescription = docData.metadata.description;
            //var docStartDate = moment('2016-01-01');
            var docRefDate = docDataMeta.refDate;
            var docPublicationDate = docDataMeta.publicationDate;
            var docSubject = docDataMeta.subject;
            //var docRefDate = moment('2016-01-01');
            var docMetaData = "Referring date: " + docRefDate +" Publication date: " + docPublicationDate;

            // camera position for the oriented view
            var docViewPos = new THREE.Vector3();
            docViewPos.x = docData.visualization.positionX;
            docViewPos.y = docData.visualization.positionY;
            docViewPos.z = docData.visualization.positionZ;

            // camera orientation for the oriented view
            var docViewQuat = new THREE.Quaternion();
            docViewQuat.x = docData.visualization.quaternionX;
            docViewQuat.y = docData.visualization.quaternionX;
            docViewQuat.z = docData.visualization.quaternionX;
            docViewQuat.w = docData.visualization.quaternionX;

            // billboard position
            var docBillboardPos = new THREE.Vector3();
            docBillboardPos.x = 1;
            docBillboardPos.y = 1;
            docBillboardPos.z = 1;

            var doc = new ExtendedDocument(docTitle,docIndex,doc_ID,docImageSourceHD,docImageSourceBD,docBillboardPos,docViewPos,docViewQuat,docRefDate, docPublicationDate,docDescription, docMetaData, docSubject);
            // we fill the AllDocuments array with the new doc
            // this doc is accessed using AllDocuments[docIndex]
            this.AllDocuments.push(doc);

        }

        // load the first doc as current doc
        this.currentDoc = this.AllDocuments[0];
        //console.log(this.currentDoc);

        this.updateBrowser();
        if(billboardsAreActive){
            this.showBillboards(true);
        }
        else{
            this.hideBillboards(true)
        }

        // dispatch the event to notify that Document Handler has finished its initialization
        // classes that depends on Document Handler will catch the event and begin their own initialization
        window.dispatchEvent(this.initEvent);

    }

    //==========================================================================
    this.loadDataFromDatabase = function loadDataFromDatabase(){

        this.initialize(jsonDataFromDB);
        //readCSVFile(CSVdataFile, this.initialize.bind(this));
    }

    // called regularly by the itowns framerequester
    //=========================================================================
    this.update = function update(dt,updateLoopRestarted) {
        // dt will not be relevant when we just started rendering, we consider a 1-frame move in this case
        if (updateLoopRestarted) {
            dt = 16;
        }

        // controls.state === -1 corresponds to state === STATE.NONE
        // if state is -1 this means the controls have finished the animated travel
        // then we can begin the doc fade animation
        if(this.isOrientingDoc && this.controls.state === -1){

            this.isOrientingDoc = false;
            this.isFadingDoc = true;
            this.fadeAlpha = 0;

            document.getElementById('docOpaSlider').value = 0;
            document.querySelector('#docOpacity').value = 0;
            document.getElementById('docFullImg').style.opacity=0;
            document.getElementById('docFullPanel').style.display = "block";
        }

        // handle fade animation
        if(this.isFadingDoc){

            this.fadeAlpha += dt/this.fadeDuration;
            if(this.fadeAlpha>=1){
                // animation is complete
                this.isFadingDoc = false;
                document.getElementById('docFullImg').style.opacity=1;
                document.getElementById('docOpaSlider').value = 100;
                document.querySelector('#docOpacity').value = 100;
            }
            else{
                // if not complete :
                document.getElementById('docFullImg').style.opacity=this.fadeAlpha;
                document.getElementById('docOpaSlider').value = this.fadeAlpha*100;
                document.querySelector('#docOpacity').value = Math.trunc(this.fadeAlpha*100);
            }

            // request the framerequester for another call to this.update()
            // TO DO : explain false
            this.view.notifyChange(false);

        }

        // billboards lookat camera
        this.AllDocuments.forEach((element)=>{
            if(!element.useBillboard){
                return;
            }
            element.billboardGeometry.lookAt(this.controls.camera.position);
            element.billboardGeometryFrame.lookAt(this.controls.camera.position);
            element.billboardGeometry.updateMatrixWorld();
            element.billboardGeometryFrame.updateMatrixWorld();
        });

    };

    // go to next document (by index) in the browser
    //==========================================================================
    this.nextDoc = function nextDoc(){

        const index = this.currentDoc.index;

        if(index+1 >= this.AllDocuments.length){

            return;
        }
        else {

            this.currentDoc = this.AllDocuments[index+1];
            //console.log(this.currentDoc.getDocID());
            this.updateBrowser();
        }
    }

    // go to previous document (by index) in the browser
    //==========================================================================
    this.previousDoc = function previousDoc(){

        const index = this.currentDoc.index;
        if(index ===0){
            return;
        }
        else {

            this.currentDoc = this.AllDocuments[index-1];
            this.updateBrowser();
        }
    }

    // update doc browser (text, image, index)
    //==========================================================================
    this.updateBrowser = function updateBrowser(){

        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;
        document.getElementById('docBrowserMetaData').innerHTML = this.currentDoc.metadata;
        document.getElementById('docBrowserTitle').innerHTML = this.currentDoc.title;
        document.getElementById('docDescription').innerHTML = this.currentDoc.description;
        //document.getElementById('docBrowserIndex').innerHTML = "index : " + this.currentDoc.index;
      //  document.getElementById('docBrowserIndex').innerHTML = "index : " + this.currentDoc.doc_ID;
    }

    // show billboards
    // if forceShow is true, show
    // if forceShow is false and billboardsAreActive is false, do not show
    //==========================================================================
    this.showBillboards = function showBillboards(forceShow){
      console.log('showBillboards');

        if(!forceShow && !billboardsAreActive){
            return;
        }

        document.getElementById("docBrowserToggleBillboard").innerHTML = "Masquer Billboards";

        this.AllDocuments.forEach((element)=>{
            if(!element.useBillboard){
                return;
            }
            this.view.scene.add(element.billboardGeometry);
            this.view.scene.add(element.billboardGeometryFrame);
            element.billboardGeometry.updateMatrixWorld();
            element.billboardGeometryFrame.updateMatrixWorld();
        });

        this.view.notifyChange(true);
    }

    // hide billboards
    // if forceHide is true, hide
    // if forceHide is false and billboardsAreActive is true, do not hide
    //=============================================================================
    this.hideBillboards = function hideBillboards(forceHide){

        if(!forceHide && billboardsAreActive){
            return;
        }

        document.getElementById("docBrowserToggleBillboard").innerHTML = "Afficher Billboards";

        this.AllDocuments.forEach((element)=>{
            if(!element.useBillboard){
                return;
            }
            this.view.scene.remove(element.billboardGeometry);
            this.view.scene.remove(element.billboardGeometryFrame);
            element.billboardGeometry.updateMatrixWorld();
            element.billboardGeometryFrame.updateMatrixWorld();
        });

        this.view.notifyChange(true);
    }

    // hide or show billboards
    //=============================================================================
    this.toggleBillboards = function toggleBillboards(){

        if(billboardsAreActive){
            billboardsAreActive = false;
            this.hideBillboards(true);

        }
        else{
            billboardsAreActive = true;
            this.showBillboards(true);

        }
    }

    this.handleDocUpdate = function handleDocUpdate(){
      //show window
      console.log("test update");
      //console.log(this.currentDoc.doc_ID);
      var Update = new UpdateDoc(this.currentDoc, this.url);

    }

    this.handleDocDelete = function handleDocDelete(){
      console.log('doc deletion');
      var Delete = new DeleteDoc(this.currentDoc, "url"); //is it really relevant to have a 'CreateDoc class' ??
    }

    this.handleDocCreation = function handleDocCreation(){
      console.log("doc creation");
      var Create = new CreateDoc(this.controls, this.view); //is it really relevant to have a 'CreateDoc class' ??
    }

    // triggers the "oriented view" of the current docIndex
    // this will display the doc image in the middle of the screen
    // and initiate the animated travel to orient the camera
    //=============================================================================
    this.focusOnDoc = function focusOnDoc() {

        // display the image (begins loading) but with opacity 0 (hidden)
        document.getElementById('docFullImg').src = this.currentDoc.imageSourceHD;
        document.getElementById('docBrowserPreviewImg').src = this.currentDoc.imageSourceBD;
        document.getElementById('docFullImg').style.opacity=0;
        document.getElementById('docOpaSlider').value = 0;
        document.querySelector('#docOpacity').value = 0;
        document.getElementById('docFull').style.display = "block";
        document.getElementById('docFullPanel').style.display = "none";

        // if we have valid data, initiate the animated travel to orient the camera
        if(!isNaN(this.currentDoc.viewPosition.x) && !isNaN(this.currentDoc.viewQuaternion.x)){
          //console.log(this.currentDoc.viewPosition );
          //console.log(this.currentDoc.viewQuaternion);
          this.controls.initiateTravel(this.currentDoc.viewPosition,"auto",this.currentDoc.viewQuaternion,true);
        }

        // adjust the current date if we use temporal
        if(this.temporal){
        //  temporal.changeTime(this.currentDoc.refDate1);
        }

        this.hideBillboards(true);

        this.isOrientingDoc = true;
        this.isFadingDoc = false;

        //to request an update
        this.view.notifyChange(false);
        this.view.camera

    };

    // close the center window (oriented view / doc focus)
    //=========================================================================
    this.closeDocFull = function closeDocFull(){
        document.getElementById('docFull').style.display = "none";
        document.getElementById('docFullImg').src = null;
        this.showBillboards(false);
    }

    // FIXME: Replace with a refresh function to be consistent with other Modules
    // hide or show the doc browser
    //=========================================================================
    this.toggleDocBrowserWindow = function toggleDocBrowserWindow(){

        document.getElementById('docBrowserWindow').style.display = this.docBrowserWindowIsActive ? "block" : "none";
        this.docBrowserWindowIsActive = this.docBrowserWindowIsActive ? true : false;

    }

    // on mouseclick : check if user is clicking on a billboard document, if yes : orient view
    //=========================================================================
    this.onMouseClick = function onMouseClick(event){

        var mouse = new THREE.Vector2();

        var raycaster = new THREE.Raycaster();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        raycaster.setFromCamera( mouse, this.camera );
        // we could optimize here, parse the scene first and get the children which are billboards, then intersects
        var intersects = raycaster.intersectObjects( this.view.scene.children );
        for ( var i = 0; i < intersects.length; i++ ) {

            // check if object is a billboard
            // the billboard "type" is in the userData of the geometry
            // (this is done in the Document constructor)
            if( intersects[ i ].object.userData.type === 'billboard'){
                this.currentDoc = intersects[i].object.userData.doc;
                // trigger focusOnDoc (oriented camera view) if object is a billboard
                this.focusOnDoc();
                break;
            }
        }

    };

    //output the camera position and quaternion in console with O (letter) key
    //=========================================================================
    this.onKeyDown = function onKeyDown(event){
        if (event.keyCode === 79) {
            console.log("camera position : ",this.controls.camera.position);
            console.log("camera quaternion : ",this.controls.camera.quaternion);
        }
    }

    // itowns framerequester : will regularly call this.update()
    this.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
                                 this.update.bind(this) );

    // event listener for a mouse click on the scene, used to detect click on billboard
    this.domElement.addEventListener('mousedown', this.onMouseClick.bind(this), false);

    // event listener for keyboard
    window.addEventListener('keydown',this.onKeyDown.bind(this),false);

    // event listeners for buttons
    document.getElementById("docFullOrient").addEventListener('mousedown', this.focusOnDoc.bind(this),false);
    document.getElementById("docFullClose").addEventListener('mousedown',this.closeDocFull.bind(this),false);
    document.getElementById("docBrowserToggleBillboard").addEventListener('mousedown',this.toggleBillboards.bind(this),false);
    document.getElementById("docBrowserNextButton").addEventListener('mousedown',this.nextDoc.bind(this),false);
    document.getElementById("docBrowserPreviousButton").addEventListener('mousedown',this.previousDoc.bind(this),false);
    document.getElementById("docBrowserOrientButton").addEventListener('mousedown', this.focusOnDoc.bind(this),false);
    document.getElementById("docUpdate").addEventListener('mousedown', this.handleDocUpdate.bind(this),false);
    document.getElementById("docDelete").addEventListener('mousedown', this.handleDocDelete.bind(this),false);
    document.getElementById("docCreateFromBrowser").addEventListener('mousedown', this.handleDocCreation.bind(this),false);

    // setup display
    document.getElementById("docBrowserToggleBillboard").style.display = (showBillboardButton)? "block" : "none";
    document.getElementById("docBrowserWindow").style.display = (!this.docBrowserWindowIsActive)? "none" : "block";

    // this will trigger the initialization, after file loading is complete
    this.loadDataFromDatabase();

}

// in orientied view (focusOnDoc) this is called when the user changes the value of the opacity slider
//=============================================================================
function docOpaUpdate(opa){
    document.querySelector('#docOpacity').value = opa;
    document.getElementById('docFullImg').style.opacity = opa/100;
}
