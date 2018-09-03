/**
 * Class: DocumentController
 * Description :
 * The DocumentController is an object handling the views, interracting with the
 * server to get information and data (documents)
 *
 */

import { DocumentResearch }  from './DocumentResearch.js';
import { DocumentBrowser }   from './DocumentBrowser.js';
import { DocumentBillboard }   from './DocumentBillboard.js';
import './ConsultDoc.css';

/**
 * Constructor for DocumentController Class
 * @param controls : PlanarControls instance
 * @param options : optional parameters (including TemporalController)
 * @param view :  itowns planar view
 * @param config : file holding congiguration settings
 */
//=============================================================================
export function DocumentController(view, controls, options = {},config)
{
    this.controls = controls;
    this.setOfDocuments = [];
    this.docIndex = 0;
    this.documentResearch;
    this.documentBrowser;
    this.documentBillboard;
    this.view = view;
    this.options = options;
    this.temporal = options.temporal;

    this.documentModel = config.properties;
    this.serverModel = config.server;
    this.modelTest;

    this.url = this.serverModel.url;

    this.researchContainerId = "researchContainer";
    this.browserContainerId = "browserContainer";
    this.urlFilters ="";

    /**
     * Create view container for the 3 different views
     */
    //=============================================================================
    this.initialize = function initialize()
    {

        var researchContainer = document.createElement("div");
        researchContainer.id =   this.researchContainerId;
        document.body.appendChild(researchContainer);
        this.documentResearch = new DocumentResearch(researchContainer, this);

        var browserContainer = document.createElement("div");
        browserContainer.id = this.browserContainerId;
        document.body.appendChild(browserContainer);
        this.documentBrowser = new DocumentBrowser(browserContainer, this);

        this.documentBillboard = new DocumentBillboard(this); //in process
    }

    /**
     * Refreshes the view (for browser mode for billboard mode)
     */
    //=============================================================================
    this.updateDisplay = function updateDisplay()
    {
        this.documentBrowser.update();
    }

    /**
     * Gets the documents from a database, using filters
     *
     */
    //=============================================================================
    this.getDocuments = function getDocuments(){
      //check which filters are set. URL is built manually for more modularity.
      //Could be improved

      var filters = new FormData(document.getElementById(this.documentResearch.filterFormId)).entries();
      var urlFilters = this.url + this.serverModel.getAll;
      for(var pair of filters ){
        if(pair[1]!=""){
          urlFilters+= pair[0] + "=" + pair[1];
          urlFilters+="&";
        }
      }
      urlFilters = urlFilters.slice('&',-1);
      var req = new XMLHttpRequest();
      req.open("POST", urlFilters,false);
      req.send();
      this.setOfDocuments = JSON.parse(req.responseText);
      this.documentBrowser.numberDocs = this.setOfDocuments.length;
      this.reset();
      console.log(this.setOfDocuments);
      var object, material;
      var objGeometry = new THREE.PlaneGeometry(12,10);
          var texture = new THREE.TextureLoader().load(this.url + "getFile/" +  this.setOfDocuments[13].metaData.link);
          material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
          object = new THREE.Mesh(objGeometry.clone(), material);
          object.name = "billboard";
          object.scale.set(50,50,50);
          object.quaternion.copy( this.view.camera.camera3D.quaternion );//face camera when created. Theb
          object.position.y=5174795;
          object.position.x=    1841569.31016107184156;
          object.position.z=    800;
          object.updateMatrixWorld();
          this.view.scene.add(object);

                  var mat = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, color: 0xffffff } );
          var stick = new THREE.Mesh(objGeometry.clone(), mat);

          stick.name = "stick";
          stick.position.y=5174795;
          stick.position.x=    1841569;
          stick.position.z=    626;
          stick.scale.set(0.7,80,100);
         stick.quaternion.set(0,0,1);
          stick.updateMatrixWorld();
          this.view.scene.add(stick);
          this.view.notifyChange(true);
    }

    /**
     * Returns the current document if there are documents
     */
    //=============================================================================
    this.getCurrentDoc = function getCurrentDoc()
    {
        if (this.setOfDocuments.length != 0)
            return this.setOfDocuments[this.docIndex];
        else
        {
            return null;
        }
    }

    /**
     * Sets the current document to the next document and returns it.
     */
    //=============================================================================
    this.getNextDoc = function getNextDoc()
    {
        if (this.docIndex < this.setOfDocuments.length - 1 || this.setOfDocuments.length == 0){
            this.docIndex++;
          }

      return this.getCurrentDoc();
    }

    /**
     * Sets the current document to the previous document and returns it.
     */
    //=============================================================================
    this.getPreviousDoc = function getPreviousDoc()
    {
        if (this.docIndex > 0 || this.setOfDocuments.length == 0)
        {
            this.docIndex--;
        }
        return this.getCurrentDoc();

    }

    /**
     * Reset browser at the begining of documents list
     */
    //=============================================================================
    this.reset = function reset(){
      this.docIndex = 0;
      this.documentBrowser.docIndex = 1;
      this.currentDoc = this.setOfDocuments[0];
      this.documentBrowser.updateBrowser();
    }

    //show or hide delete/update button
    //this two buttons are useful for the contribute mode.
    //I an clean MVC architecture, they should be managed by the ContributeController.
    this.toggleActionButtons = function toggleActionButtons(active){

      if (active){
      $('#docDeleteButton').show();
      $('#docUpdateButton').show();}
      else{
        $('#docDeleteButton').hide();
        $('#docUpdateButton').hide();
      }

    }

    this.initialize();
}
