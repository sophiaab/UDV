/**
 * Class: GuidedTour
 * Description :
 * The GuidedTour is an object handling the guided tour view
 *
 */

import './GuidedTour.css'

/**
 *
 * @constructor
 * @param { guidedTourContainer } browserContainer
 * @param { guidedTourController } documentController
 */

export function GuidedTour(guidedTourContainer, guidedTourController) {

  this.guidedTourController = guidedTourController;

  this.tourIndex = 1; //current guided tour. Default is 1 (start)

  this.stepIndex = 1; //current step of the guidedtour. Defautt is 1 (start)

  // boolean to control the state of the guided tour window (open/closed)
  this.guidedTourWindowIsActive = true;

  this.isStart = true;

  this.currentStep = null;

  //instance of document browser
  this.documentBrowser =this.guidedTourController.browser;

  // update the html with elements for this class (windows, buttons etc)
  guidedTourContainer.innerHTML = '\
  <button id="guidedTourTab">EXPLORE</button>\
  <div id="guidedTourWindow">\
  <div id="guidedTourTitle"></div>\
  <div id="guidedTourStepTitle"></div>\
  <div id="guidedTourText1"></div>\
  <div id="guidedTourDocPreview"><img id="guidedTourDocPreviewImg"/></div>\
  <div id="guidedTourIndex"></div>\
  <button id="guidedTourNextStepButton" type=button>⇨</button>\
  <button id="guidedTourNextTourButton" type=button>⇨</button>\
  <button id="guidedTourPreviousStepButton" type=button>⇦</button>\
  <button id="guidedTourPreviousTourButton" type=button>⇦</button>\
  <button id="guidedTourExitButton" type=button>SORTIE</button>\
  <button id="guidedTourStartButton" type=button>START</button>\
  </div>\
  ';

  // hide or show the guided tour window
  //=============================================================================
  this.toggleGuidedTourWindow = function toggleGuidedTourWindow(){

    document.getElementById('guidedTourWindow').style.display =
                                this.guidedTourWindowIsActive ? "block" : "none";
    this.guidedTourWindowIsActive = this.guidedTourWindowIsActive ? false : true;

    if(this.isStart){
      this.initTour();
      this.isStart = false;
      this.guidedTourController.toggleGuidedTourButtons(true);
    }
  }

  /**
  * Initializes view
  */
  //=============================================================================
  this.initTour = function initTour(){

    //update browser view
    var guidedTourText2 = document.createElement('div');
    guidedTourText2.id = 'guidedTourText2';
    document.getElementById('docBrowserWindow').appendChild(guidedTourText2);

    this.guidedTourController.getGuidedTours();
    this.previewTour();

  }

  /**
  * Set the preview of the current guided tour, before it starts
  */
  //=============================================================================
  this.previewTour = function previewTour(){

    document.getElementById("guidedTourPreviousTourButton").style.display = "block";
    document.getElementById("guidedTourNextTourButton").style.display = "block";

    // for the demo, until we have more than one finished guided tour
    // we can prevent user from changing tour by hiding the buttons
    if(this.guidedTourController.preventUserFromChangingTour){
        document.getElementById("guidedTourPreviousTourButton").style.display = "none";
        document.getElementById("guidedTourNextTourButton").style.display = "none";
    }

    //hide / show buttons
    this.guidedTourController.toggleGuidedTourButtons(true);

    document.getElementById("guidedTourText2").style.display = "none";

    document.getElementById('guidedTourTitle').innerHTML =
                                this.guidedTourController.getCurrentTour().name;
    document.getElementById('guidedTourText1').innerHTML =
                         this.guidedTourController.getCurrentTour().description;
    document.getElementById("guidedTourText1").style.height = "45%";

    document.getElementById("guidedTourStepTitle").innerHTML = null;

    document.getElementById('docHead').style.display = "none";

    //hide reset research button
    document.getElementById('resetFilters').style.display = "none";
    //hide research information
    document.getElementById('docBrowserInfo').style.display = "none";

    //information about current guided tour and total number of tours
    document.getElementById('guidedTourIndex').innerHTML = "Tour " + this.tourIndex
                     + " out of " + this.guidedTourController.guidedTours.length;

  }

  /**
  * Start guided tour
  */
  //=============================================================================
  this.startGuidedTour = function startGuidedTour(){

    this.tourIndex = 1;
    this.updateStep();
    // setup the display (hide & show elements)
    this.guidedTourController.toggleGuidedTourButtons(false);

    document.getElementById("guidedTourText2").style.display = "block";
    document.getElementById("guidedTourDocPreviewImg").style.display = "none";
    document.getElementById("guidedTourText1").style.height = "60%";
    document.getElementById('docBrowserWindow').style.display = "block";
    document.getElementById('docBrowserPreviousButton').style.display = "none";
    document.getElementById('docBrowserNextButton').style.display = "none";
    document.getElementById('docBrowserIndex').style.display = "none";

  };

  /**
  * Go to next guided tour
  */
  //=============================================================================
  this.nextTour = function nextTour(){

    this.guidedTourController.getNextTour();
    if(this.tourIndex < this.guidedTourController.guidedTours.length){
      this.tourIndex ++;
    }
    this.previewTour();
  }

  /**
  * Go to previous guided tour
  */
  //=============================================================================
  this.previousTour = function previousTour(){
    this.guidedTourController.getPreviousTour();
    if(this.tourIndex > 1 ){
      this.tourIndex --;
    }
    this.previewTour();
  }

  /**
  * Display previous guided tour
  */
  //=============================================================================
  this.updateStep = function updateStep(){

    this.documentBrowser.currentMetadata =
                    this.guidedTourController.getCurrentStep().document.metaData;

    this.documentBrowser.currentDoc = this.guidedTourController.getCurrentStep().document;

    this.documentBrowser.updateBrowser();
    document.getElementById("guidedTourText2").innerHTML =
                               this.guidedTourController.getCurrentStep().text2;

    document.getElementById("guidedTourText1").innerHTML =
                                this.guidedTourController.getCurrentStep().text1;
    document.getElementById('guidedTourStepTitle').innerHTML =
                                this.guidedTourController.getCurrentStep().title;

    this.documentBrowser.focusOnDoc();
  }

  /**
  * Go to next step
  */
  //=============================================================================
  this.nextStep = function nextStep(){

    this.guidedTourController.getNextStep();
    if(this.stepIndex < this.guidedTourController.getCurrentTour().length){
      this.stepIndex ++;
    }
    this.updateStep();
  }

  /**
  * Go to previous step
  */
  //=============================================================================
  this.previousStep = function previousStep(){

    this.guidedTourController.getPreviousStep();
    if( this.stepIndex > 1 ){
      this.stepIndex --;
    }
    this.updateStep();

  }

  // event listeners (buttons)
  document.getElementById("guidedTourNextTourButton").addEventListener('mousedown',
                                                this.nextTour.bind(this),false);
  document.getElementById("guidedTourPreviousTourButton").addEventListener('mousedown',
                                            this.previousTour.bind(this),false);
  document.getElementById("guidedTourStartButton").addEventListener('mousedown',
                                         this.startGuidedTour.bind(this),false);
  document.getElementById("guidedTourNextStepButton").addEventListener('mousedown',
                                                this.nextStep.bind(this),false);
  document.getElementById("guidedTourPreviousStepButton").addEventListener('mousedown',
                                            this.previousStep.bind(this),false);
  document.getElementById("guidedTourExitButton").addEventListener('mousedown',
         this.guidedTourController.reset.bind(this.guidedTourController),false);
  document.getElementById("guidedTourTab").addEventListener('mousedown',
                                  this.toggleGuidedTourWindow.bind(this), false);

}
