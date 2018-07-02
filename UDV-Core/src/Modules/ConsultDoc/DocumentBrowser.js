
import * as THREE from 'three';
import { MAIN_LOOP_EVENTS } from 'itowns';
import DefaultImage from './DefaultImage.png';
import './documentBrowser.css';

export function DocumentBrowser(browserContainer, documentController) {

  //class attributes
  this.documentController = documentController;
  this.documentsExist = true;
  this.currentDoc = null;
  this.windowIsActive = false;
  this.isOrientingDoc = false;
  this.isFadingDoc = false;
  this.fadeAlpha = 0;
  this.docIndex = 1;
  this.isStart = true; //dirty variable to test if we are in start mode

  // doc fade-in animation duration, in milliseconds
 this.fadeDuration = this.documentController.options.docFadeDuration || 2750;

 browserContainer.innerHTML =
      '<div id="docBrowserWindow">\
        <button id="closeBrowserWindow" type=button>X</button>\
          <div id="docHead">Document Navigator</div>\
          <div id = "docBrowserInfo"></div>\
          <div id="docBrowserPreview"><img id="docBrowserPreviewImg"/></div>\
          <div id="docBrowserIndex"></div>\
          <div id = "browserWindowTabs">\
          <button id="docBrowserNextButton" type=button>⇨</button>\
          <button id="docBrowserPreviousButton" type=button>⇦</button>\
          <button id="resetFilters" type=button>Reset research</button>\
          <button id="docBrowserOrientButton" type=button>Orient Document</button>\
          </div>\
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

    this.update = function update()
    {
        if (this.documentController.setOfDocuments.length >= 0)
        {
            this.documentsExist = true;
        }
        this.updateBrowser();
    }

    // Whether this window is currently displayed or not.
    this.windowIsActive = this.documentController.options.active || false;

    // Display or hide this window
    this.activateWindow = function activateWindow(active)
    {
        if (typeof active != 'undefined')
        {
            this.windowIsActive = active;
        }
        if(this.documentsExist && this.isStart){
          this.documentController.getDocuments();
          this.isStart = false;
        }
        this.update();
        document.getElementById('docBrowserWindow').style.display = active  ? "block" : "none ";

    }

    this.refresh = function refresh()
    {
        this.activateWindow(this.windowIsActive);
    }

    // called regularly by the itowns framerequester
    //=========================================================================
    this.updateScene = function updateScene(dt,updateLoopRestarted) {
        // dt will not be relevant when we just started rendering, we consider a 1-frame move in this case
        if (updateLoopRestarted) {
            dt = 16;
        }
        // controls.state === -1 corresponds to state === STATE.NONE
        // if state is -1 this means the controls have finished the animated travel
        // then we can begin the doc fade animation
        if(this.isOrientingDoc && this.documentController.controls.state === -1){
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
            this.documentController.view.notifyChange(false);

        }
    };

    /**
     * Updates browser by clicking on "nextDoc" button
     */
    //=============================================================================
    this.nextDoc = function nextDoc(){
      this.currentDoc = this.documentController.getNextDoc();
      if(this.docIndex < this.documentController.setOfDocuments.length){
        this.docIndex ++;
      }
      this.updateBrowser();
    }

    /**
     * Updates browser by click on "previousDoc" button
     */
    //=============================================================================
    this.previousDoc = function previousDoc(){
      this.currentDoc = this.documentController.getPreviousDoc();
      if(this.docIndex > 1 ){
        this.docIndex --;
      }
      this.updateBrowser();
    }

    // Updates the DocumentBrowser with Document static metadata
    // the document browser html is defined based on the documentModel metadata attributes
    //==========================================================================
    this.updateBrowser = function updateBrowser(){

      this.currentDoc = this.documentController.getCurrentDoc(); //update currentDoc with current doc info
      if (this.currentDoc != null & this.documentsExist == true)
      {
        var jsonDocModel = JSON.stringify(this.documentController.documentModel.metadata);
        var objectDocumentSchema = JSON.parse(jsonDocModel);
        var documentRequiredMetada = []; //in this array, we have the information about the static metadata of a document configured my "documentModel.json"
        for (var key in objectDocumentSchema){
          documentRequiredMetada.push(key)
        }
        //building the HTML according to the "documentModel.json"
        var docData = JSON.stringify(this.currentDoc.metadata);
        var docu = JSON.parse(docData);
        var txt="";
        txt += "<div id ='docMetadata'>";
        for (var i = 0; i<documentRequiredMetada.length; i++){
          if(documentRequiredMetada[i]!="id" && documentRequiredMetada[i]!="link" && documentRequiredMetada[i]!="originalName"){
            txt += "<div id =" + documentRequiredMetada[i] + ">" + docu[documentRequiredMetada[i]] + "</div>";
          }
        }
        txt += "</div>";
        document.getElementById("docBrowserInfo").innerHTML = txt;
        document.getElementById('docBrowserPreviewImg').src = this.documentController.url + "documentsDirectory/" + this.currentDoc.metadata.link;
        document.getElementById('docBrowserIndex').innerHTML = "Document: " + this.docIndex + " out of " + this.documentController.setOfDocuments.length;
      }

      else
      {
        //sets browser with default information and image
        var defaultImage = document.getElementById('docBrowserPreviewImg');
        defaultImage.src = DefaultImage;
        document.getElementById('docBrowserPreviewImg').src = DefaultImage;
        document.getElementById('docBrowserInfo').innerHTML = "No document to display according to your research";
        document.getElementById('docBrowserIndex').innerHTML = "No doc";

      }
    }


    // triggers the "oriented view" of the current docIndex
    // this will display the doc image in the middle of the screen
    // and initiate the animated travel to orient the camera
    //=============================================================================
    this.focusOnDoc = function focusOnDoc() {
      document.getElementById('docFullImg').src = this.documentController.url + "documentsDirectory/" + this.currentDoc.metadata.link;
      document.getElementById('docBrowserPreviewImg').src = this.documentController.url + "documentsDirectory/" + this.currentDoc.metadata.link;
      document.getElementById('docFullImg').style.opacity = 50;
      document.getElementById('docOpaSlider').value = 0;
      document.querySelector('#docOpacity').value = 50;
      document.getElementById('docFull').style.display = "block";
      document.getElementById('docFullPanel').style.display = "block";

      // if we have valid data, initiate the animated travel to orient the camera
      if(!isNaN(this.currentDoc.visualization.positionX) && !isNaN(this.currentDoc.visualization.quaternionX)){
          var docViewPos = new THREE.Vector3();
          docViewPos.x = parseFloat(this.currentDoc.visualization.positionX);
          docViewPos.y = parseFloat(this.currentDoc.visualization.positionY);
          docViewPos.z = parseFloat(this.currentDoc.visualization.positionZ);

          // camera orientation for the oriented view
          var docViewQuat = new THREE.Quaternion();
          docViewQuat.x = parseFloat(this.currentDoc.visualization.quaternionX);
          docViewQuat.y = parseFloat(this.currentDoc.visualization.quaternionY);
          docViewQuat.z = parseFloat(this.currentDoc.visualization.quaternionZ);
          docViewQuat.w = parseFloat(this.currentDoc.visualization.quaternionW);
          this.documentController.controls.initiateTravel(docViewPos,"auto",docViewQuat,true);
        }

        // adjust the current date if we use temporal
        if(this.documentController.temporal){
          var docDate = new moment(this.getCurrentDoc.metadata.refDate);
          this.documentController.temporal.changeTime(docDate);
        }

        this.isOrientingDoc = true;
        this.isFadingDoc = false;

        //to request an update
        this.documentController.view.notifyChange(false);

    };

    // close the central window superposition view
    //=========================================================================
    this.closeDocFull = function closeDocFull(){
        document.getElementById('docFull').style.display = "none";
        document.getElementById('docFullImg').src = null;
    }

    this.resetResearch = function resetResearch(){
      this.docIndex = 1;
      this.documentController.getDocuments();
      this.updateBrowser();
      this.closeDocFull();
    }

    // itowns framerequester : will regularly call this.update()
    this.documentController.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,this.updateScene.bind(this) );

    // event listeners for buttons
    document.getElementById("docFullOrient").addEventListener('mousedown', this.focusOnDoc.bind(this),false);
    document.getElementById("docFullClose").addEventListener('mousedown',this.closeDocFull.bind(this),false);
    document.getElementById("docBrowserNextButton").addEventListener('mousedown',this.nextDoc.bind(this),false);
    document.getElementById("docBrowserPreviousButton").addEventListener('mousedown',this.previousDoc.bind(this),false);
    document.getElementById("docBrowserOrientButton").addEventListener('mousedown', this.focusOnDoc.bind(this),false);
    document.getElementById("closeBrowserWindow").addEventListener('mousedown', this.activateWindow.bind(this,false),false);
    document.getElementById("resetFilters").addEventListener('mousedown', this.resetResearch.bind(this),false);
}

// in orientied view (focusOnDoc) this is called when the user changes the value of the opacity slider
//=============================================================================
function docOpaUpdate(opa){
    document.querySelector('#docOpacity').value = opa;
    document.getElementById('docFullImg').style.opacity = opa/100;
}