import { readCSVFile } from '../../Tools/CSVLoader.js';
import './GuidedTour.css';
import { GuidedTour }   from './GuidedTour.js';

/**
* Class: GuidedTourController
* Description :
* The GuidedTourController is an object handling GuidedTours. It hanldes
* the functionalities : go to next / previous guided tour, start/exit guided tour,
* go to next / previous step of the selected guided tour.

/**
 * Constructor for GuidedTourControllerClass
 * @param documentController : DocumenController instance
 *
 ======================================================================
 */
export function GuidedTourController(documentController) {

  this.guidedTourContainerId = "guidedTourContainer";

  this.documentController = documentController; //instance of DocumentController

  //url to get guided tours
  this.url = this.documentController.serverModel.url +
                                  this.documentController.serverModel.guidedTour;

  this.browser = this.documentController.documentBrowser; //instance of document browser

  this.guidedTours = []; //all guided tours

  this.currentTourIndex = 0;//index of the current guided tour

  this.steps = []; //all steps of the current guided tour

  // the current step index of the current tour
  this.currentStepIndex = 0;

  this.guidedTour; //instance of GuidedTour (view)

  //used for 'clean'
  this.preventUserFromChangingTour = false;

  /**
  * initialize the controller
  */
  //=============================================================================
  this.initialize = function initialize(){

    var guidedTourContainer = document.createElement("div");
    guidedTourContainer.id =   this.guidedTourContainerId;
    document.body.appendChild(guidedTourContainer);
    this.guidedTour = new GuidedTour(guidedTourContainer, this);
  }

    /**
     * Gets the documents from a database, using filters
     *
     */
    //=============================================================================
    this.getGuidedTours = function getGuidedTours(){
      var req = new XMLHttpRequest();
      req.open("GET", this.url ,false);
      req.send(req.responseText);
      this.guidedTours = JSON.parse(req.responseText);

    }
    /**
     * Returns the current guided tour
     *
     */
    //=============================================================================
    this.getCurrentTour = function getCurrentTour(){
      if (this.guidedTours.length != 0){
        return this.guidedTours[this.currentTourIndex];;
      }
      else
      {
        return null;
      }
    }

    /**
     * Sets the current guided tour to the next guided tour and returns it.
     *
     */
    //=============================================================================
    this.getNextTour = function getNextTour(){
      if (this.currentTourIndex < this.guidedTours.length - 1 || this.guidedTours.length == 0){
        this.currentTourIndex++;
      }
      return this.getCurrentTour();
    };

    /**
     * Sets the current guided tour to the previous guided tour and returns it.
     *
     */
    //=============================================================================
    this.getPreviousTour = function getPreviousTour(){
      if (this.currentTourIndex > 0 || this.currentTourIndex.length == 0)
      {
        this.currentTourIndex--;
      }
      return this.getCurrentTour();
    };

    /**
    * Returns the current tour step
    */
    //=============================================================================
    this.getCurrentStep = function getCurrentStep(){

      if (this.getCurrentTour().length != 0){
        return this.getCurrentTour().extendedDocs[this.currentStepIndex];
      }
      else
      {
        return null;
      }
    }

    /**
     * Sets the current step to the previous step and returns it.
     *
     */
    //=============================================================================
    this.getPreviousStep = function getPreviousStep(){
      if (this.currentStepIndex > 0 || this.getCurrentTour().extendedDocs.length == 0)
      {
          this.currentStepIndex--;
      }
      return this.getCurrentStep();
    }

    /**
     * Sets the current step to the next step and returns it.
     *
     */
    //=============================================================================
    this.getNextStep = function getNextStep(){
      if (this.currentStepIndex <= this.getCurrentTour().extendedDocs.length){
          this.currentStepIndex ++;
        }
        return this.getCurrentStep();
    }


    /**
    * Reset guided tour overview when user quits / ends tour
    */
    //=============================================================================
    this.reset = function reset(){

      this.currentTourIndex = 0; //first tour
      this.currentStepIndex =0; //first step
      this.currentGuidedTour = this.guidedTours[this.currentTourIndex];
      this.guidedTour.currentStep = this.getCurrentStep();
      this.documentController.documentBrowser.activateWindow(false);
      this.documentController.documentBrowser.closeDocFull();
      this.guidedTour.previewTour();

    }

    /**
    * Display or hide buttons
    */
    //=============================================================================
    this.toggleGuidedTourButtons = function toggleGuidedTourButtons(active){

      document.getElementById("guidedTourPreviousTourButton").style.display =
                                                      active ? "block" : "none";
      document.getElementById("guidedTourNextTourButton").style.display =
                                                      active ? "block" : "none";
      document.getElementById("guidedTourPreviousStepButton").style.display =
                                                      active ? "none" : "block";
      document.getElementById("guidedTourNextStepButton").style.display =
                                                      active ? "none" : "block";
      document.getElementById('guidedTourStartButton').style.display =
                                                      active ? "block" : "none";
      document.getElementById("guidedTourExitButton").style.display =
                                                        active ? "none":"block";

    }

    this.initialize();

}
