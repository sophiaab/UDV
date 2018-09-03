/**
 * Class: DocumentBillboard
 * Description :
 * The DocumentBrowser is an object in charge of displaying documents in the form of billboards
 * WORK IN PROGRESS
 */
import { MAIN_LOOP_EVENTS } from 'itowns';

export function DocumentBillboard(documentController)
{

  this.documentController = documentController;
  this.billboards = [];
  this.windowIsActive = false;
  this.billboardsAreActive = false;
/*
  var mytab = document.createElement("div");
  mytab.id = 'hello';
  document.body.appendChild(mytab);

  mytab.innerHTML ='<button id="Raycaster">DIST_MAP</button>';*/

  this.refresh = function refresh()
  {
    this.activateBillboards(this.windowIsActive);
  }


  this.activateBillboards= function activateBillboards(active)
  {
    if(active){
      this.showBillboards();
    }
    else{
      this.hideBillboards();
    }
  }



  this.createBillboard = function createBillboard(doc){
/*
    var loader = new THREE.TextureLoader();
    var texture = loader.load( this.documentController.url + "getFile/" +  doc.metaData.link,
            function ( tex ) {
              console.log( tex.image.width, tex.image.height );
              var object, material;
      var objGeometry = new THREE.PlaneGeometry(12,10);
      material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
      object = new THREE.Mesh(objGeometry.clone(), material);

      object.scale.set(tex.image.width / 10,tex.image.height / 10 , 1);
      object.quaternion.copy( self.documentController.view.camera.camera3D.quaternion );//face camera when created. Theb
      object.position.x=doc.visualization.positionX;
      object.position.y=    doc.visualization.positionY;
      object.position.z=    626;
      object.visible = false;

      object.updateMatrixWorld();
      self.billboards.push(object);
      self.documentController.view.scene.add(object);
      self.documentController.view.notifyChange(true);

    } );*/

var object, material;
var objGeometry = new THREE.PlaneGeometry(12,10);
    var texture = new THREE.TextureLoader().load(this.documentController.url + "getFile/" +  doc.metaData.link);
    material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
    object = new THREE.Mesh(objGeometry.clone(), material);
    this.billboards.push(object);
    object.scale.set(50,50,50);
    object.quaternion.copy( this.documentController.view.camera.camera3D.quaternion );//face camera when created. Theb
    object.position.x=doc.visualization.positionX;
    object.position.y=    doc.visualization.positionY;
    object.position.z=    626;
    object.updateMatrixWorld();
    this.documentController.view.scene.add(object);
    this.documentController.view.notifyChange(true);

  }

  this.createSetOfBillboards = function createSetOfBillboards(){
    this.documentController.getDocuments();
/*
    for( var i = 0; i < this.documentController.setOfDocuments.length ; i ++){
      var self = this;
      var loader = new THREE.TextureLoader();
      var texture = loader.load( this.documentController.url + "getFile/" +  self.documentController.setOfDocuments[i].metaData.link,
              function ( tex ) {
                console.log( tex.image.width, tex.image.height );
                var object, material;
        var objGeometry = new THREE.PlaneGeometry(12,10);
        material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
        object = new THREE.Mesh(objGeometry.clone(), material);

        object.scale.set(tex.image.width / 10,tex.image.height / 10 , 1);
        object.quaternion.copy( self.documentController.view.camera.camera3D.quaternion );//face camera when created. Theb
        object.position.x = self.documentController.setOfDocuments[i].visualization.positionX;
        object.position.y=    self.documentController.setOfDocuments[i].visualization.positionY;
        object.position.z=    626;
        object.visible = false;

        object.updateMatrixWorld();
        self.billboards.push(object);
        self.documentController.view.scene.add(object);
        self.documentController.view.notifyChange(true);

      } );
    }*/

  //  this.createBillboard(this.documentController.setOfDocuments[1])
    this.createBillboard(this.documentController.setOfDocuments[2])
    this.createBillboard(this.documentController.setOfDocuments[12]);



  }

  this.ArrayToMatrix = function ArrayToMatrix(numrows, numcols, initial){
   var arr = [];
   for (var i = 0; i < numrows; ++i){
      var columns = [];
      for (var j = 0; j < numcols; ++j){
         columns[j] = initial;
      }
      arr[i] = columns;
    }
    for ( var i = 0 ; i < numrows; i++){
      for (var j = 0 ; j < numcols ; j ++){

      }
    }

    return arr;
}

  this.toScreenPosition = function toScreenPosition(obj, camera)
  {
    var raycaster = new THREE.Raycaster();
  //  var pixel = new THREE.Vector2();

    //  ,this.documentController.view.scene.children[3].position.y)
//    var screenMatrix = Array(window.innerWidth).fill(0).map( x => Array(window.innerHeight).fill(0));
    //for (var i = 0;i<window.innerWidth;i++){
    //for (var j = 0; j < window.innerHeight ; j++){
      //pixel.x =( i / window.innerWidth) *2 -1;
      //pixel.y = - (j / window.innerHeight) *2 +1;
    //  raycaster.setFromCamera(pixel, this.documentController.view.camera.camera3D);
      //raycaster.setFromCamera(center, this.documentController.view.camera.camera3D );
      var direction = new THREE.Vector3(0,0,1);
      var ray = new THREE.Raycaster(this.documentController.view.scene.children[3].position , direction);
      direction.applyQuaternion( this.documentController.view.scene.children[0].quaterion );
      var intersects = ray.intersectObject(this.documentController.view.scene.children[0],true);
      console.log(intersects)
      if(intersects.length > 0){
console.log(intersects)
        //var closest = intersects[0].object;
        //screenMatrix[i][j] = closest.postition.distanceTo(this.documentController.view.camera.camera3D.position);
      }
    //}
  //}
}

this.onMouseClick = function onMouseClick(event){


        var mouse = new THREE.Vector2();

        var raycaster = new THREE.Raycaster();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        console.log('x', event.clientX, ( event.clientX / window.innerWidth ) * 2 - 1);
      console.log('y', event.clientY, - ( event.clientY / window.innerHeight ) * 2 + 1)
        raycaster.setFromCamera( mouse, this.documentController.view.camera.camera3D );
        // we could optimize here, parse the scene first and get the children which are billboards, then intersects
        var intersects = raycaster.intersectObject( this.documentController.view.scene.children[3] );
        if(intersects.length > 0){
          this.documentController.documentBrowser.focusOnDoc();
        }
};



  this.printOfDocument = function printOfDocument(){
    this.toScreenPosition(this.documentController.view.scene.children[3] , this.documentController.view.camera.camera3D);
    this.toScreenPosition(this.documentController.view.scene.children[4] , this.documentController.view.camera.camera3D);

  }

  this.showBillboards = function showBillboards(forceShow){

    this.billboards.forEach((element)=>{
      element.visible = true;
    });
    this.documentController.view.notifyChange(true);

  }

  this.hideBillboards = function hideBillboards(forceHide){

    this.billboards.forEach((element)=>{
    //  element.visible = false;
    });
    this.documentController.view.notifyChange(true);
  }

  this.initialize = function initialize(){
  //  this.documentController.createBillboard();// not here.
    //    var t0 = performance.now();
    // this.documentController.createAleatoryBillboards();
    // var t1 = performance.now();
    // console.log(t1 - t0);

    this.documentController.view.scene.children.forEach((elem) => {
      if(elem.name == "billboard"){
          this.billboards.push(elem);}
    });


    this.hideBillboards(true);

  }

  this.updateBillboardOrientation = function updateBillboardOrientation(){

    /*for(var i = 0; i<this.billboards.length;i++){
      this.billboards[i].quaternion.copy( this.documentController.view.camera.camera3D.quaternion );
      this.billboards[i].updateMatrixWorld();
  }*/
  this.documentController.view.scene.children.forEach((child) => {
    if(child.name == "billboard" || child.name == "stick"){
        child.quaternion.copy( this.documentController.view.camera.camera3D.quaternion );
        child.updateMatrixWorld();
    }
  })

}

this.documentController.controls.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,this.updateBillboardOrientation.bind(this) );
this.initialize();
/*
document.getElementById('Raycaster').addEventListener('mousedown',
                                          this.printOfDocument.bind(this),false);*/
window.addEventListener('mousedown', this.onMouseClick.bind(this), false);

}
