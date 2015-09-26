/// <reference path="../definitions/angular.d.ts"/>
/// <reference path="../definitions/three.d.ts"/>
/// <reference path="../definitions/detector.d.ts"/>
/// <reference path="../definitions/three-canvasrenderer.d.ts"/>
/// <reference path="../definitions/three-orbitcontrols.d.ts"/>

"use strict";

/**
  Module containing photosphere and ngPhotosphere to build it
*/
module ngPhotosphere {
  /** Type for allowed controls */
  export enum Control {all, wheel, pointer, none}

  /**
    Photosphere parameters : width, height, speed, resolution
  */
  export class params {
    static DEFAULT_WIDTH: number = 640;
    static DEFAULT_HEIGHT: number = 480;
    static DEFAULT_SPEED: number = 0;
    static MIN_SPEED: number = 0;
    static MAX_SPEED: number = 20;
    static DEFAULT_RESOLUTION: number = 30;
    static MAX_RESOLUTION: number = 80;
    static MIN_RESOLUTION: number = 10;
    static DEFAULT_CONTROLS: Control = Control.all;
    /** Width of the canvas */
    width: number;
    /** Height of the canvas */
    height: number;
    /** Rotation speed of the view */
    speed: number;
    /** Number of meridians on the 3d sphere. The more, the cleaner, the less the faster */
    resolution: number;
    /** Available controls on the sphere */
    controls: Control;
    constructor(width?: number, height?: number, speed?: number, resolution?: number, controls?: Control) {
      var vm = this;
      vm.setWidth(width);
      vm.setHeight(height);
      vm.setSpeed(speed);
      vm.setResolution(resolution);
      vm.setControls(controls);
    }
    /**
      Set the width of the canvas
    */
    setWidth(width: number) {
      var vm = this;
      if(typeof width !== "undefined" && !isNaN(width)) {
        vm.width = width;
      } else {
        vm.width = params.DEFAULT_WIDTH;
      }
    }
    /**
      Set the height of the canvas
    */
    setHeight(height: number) {
      var vm = this;
      if(typeof height !== "undefined" && !isNaN(height)) {
        vm.height = height;
      } else {
        vm.height = params.DEFAULT_HEIGHT;
      }
    }
    /**
      Set the rotation speed of the canvas
    */
    setSpeed(speed: number) {
      var vm = this;
      if(typeof speed !== "undefined" && !isNaN(speed)) {
        vm.speed = Math.min(Math.max(speed, params.MIN_SPEED), params.MAX_SPEED);
      } else {
        vm.speed = params.DEFAULT_SPEED;
      }
    }
    /**
      Set the rotation speed of the canvas
    */
    setResolution(resolution: number) {
      var vm = this;
      if(typeof resolution !== "undefined" && !isNaN(resolution)) {
        vm.resolution = Math.min(Math.max(resolution, params.MIN_RESOLUTION), params.MAX_RESOLUTION);
      } else {
        vm.resolution = params.DEFAULT_RESOLUTION;
      }
    }
    /**
      Set the controls of the canvas
    */
    setControls(controls: Control) {
      var vm = this;
      if(typeof controls !== "undefined") {
        vm.controls = controls;
      } else {
        vm.controls = params.DEFAULT_CONTROLS;
      }
    }
  }
  /**
    The common attributes of a photosphere. All numeric attributes are string, because they are coming directly from the html call of the directive
  */
  export interface attributes extends ng.IAttributes{
    src: string;
    height: string;
    width: string;
    speed: string;
    resolution: string;
    controls: string;
  }
  /**
    The proper scope of the photosphere
  */
  export interface scope extends ng.IScope {
    fullscreen: Function;
  }
  /**
    Class for directives
  */
  class Directive implements ng.IDirective {
    static IID: string;
    static $inject: Array<string>;
    directive: ng.IDirective;
    id: number;
  }
  /**
    Directive for
  */
  export class ngScopeElement extends Directive {
    static IID: string = "ngScopeElement";
    static $inject: Array<string> = [];
    constructor() {
      super();
      var vm = this;
      var directive: ng.IDirective = {};
      directive.restrict = "A";
      directive.compile = function compile(tElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes, transclude: ng.ITranscludeFunction) {
          return {
              pre: function preLink(scope, iElement, iAttrs: any, controller) {
                  scope[iAttrs.ngScopeElement] = iElement;
              }
          };
      };
      vm.directive = directive;
    }
  }

  /**
    The directive that will build the sphere and map the texture
  */
  export class photosphere extends Directive {
    static IID: string = "photosphere";
    static $inject: Array<string> = ["$window"];
    template: string;
    fullscreen = false;

    constructor($window: ng.IWindowService) {
      super();
      var vm = this;
      vm.id = Math.round(10000 * Math.random());
      var css = '<style> ul{list-style-type:none;margin:0;padding:0;overflow:hidden}li{float:left}a:link,a:visited{display:block;width:120px;font-weight:700;color:#FFF;background-color:#98bf21;text-align:center;padding:4px;text-decoration:none}a:active,a:hover{background-color:#7A991A}</style>';
      var navbar = '<ul> <li><a href="" ng-click="fullscreen()">See fullscreen</a></li> </ul>';
      vm.template = css + '<div ng-scope-element="' + vm.id + '">' + navbar + '</div>';

      vm.fullscreen = false;

      var directive: ng.IDirective = {};
      directive.priority = 0;
      directive.restrict = "EA";
      directive.template = vm.template;
      directive.scope = {
          src: '@',
          height: '=?',
          width: '=?',
          speed: '=?',
          resolution: '=?',
          controls: '=?'
        };
      directive.link = function(scope: any/*ngPhotosphere.scope*/, element: ng.IAugmentedJQuery, attrs: ngPhotosphere.attributes) {
        var params = new ngPhotosphere.params(parseInt(attrs.width, 10), parseInt(attrs.height, 10), parseInt(attrs.speed, 10), parseInt(attrs.resolution, 10), ngPhotosphere.Control[attrs.controls]);
        var rotateSpeed = -0.5 * params.speed;
        var windowWidth = $window.innerWidth;
        var windowHeight = $window.innerHeight;

        var webglEl = scope[vm.id];

        var scene: THREE.Scene = new THREE.Scene();

        var camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, params.width / params.height, 1, 1000);
        camera.position.x = 0.1;
        camera.fov = 1.0;

        var renderer: THREE.Renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
        renderer.setSize(params.width, params.height);

        var geometry = new THREE.SphereGeometry(100, params.resolution, params.resolution);
        // enabling cross-origin
        THREE.ImageUtils.crossOrigin = 'use-credential';

        var mesh: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(attrs.src)
        });

        var sphere: THREE.Mesh = new THREE.Mesh(geometry, mesh);
        sphere.scale.x = -1;
        scene.add(sphere);

        var controls = new THREE.OrbitControls(camera, webglEl);

        if(params.controls === Control.wheel || params.controls === Control.none) {
            controls.enabled = false;
        }

        controls.noPan = true;
        controls.noZoom = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = rotateSpeed;

        webglEl.append(renderer.domElement);

        render();

        /** Render the scene */
        function render() {
            if(vm.fullscreen) {
                updateSize();
            }
            controls.update();
            requestAnimationFrame(render);
            renderer.render(scene, camera);
        }
        /** Update the camera when changing width and height */
        function updateCamera(w, h) {
            camera.aspect = w / h;
            camera.fov = Math.max(40, Math.min(100, camera.fov));
            camera.updateProjectionMatrix();
        }
        /** Resize camera when the size of the screen is changing */
        function updateSize() {
            if (windowWidth !== $window.innerWidth || windowHeight !== $window.innerHeight) {
		        windowWidth = $window.innerWidth;
		        windowHeight = $window.innerHeight;
                    updateCamera(windowWidth, windowHeight);
		        renderer.setSize(windowWidth, windowHeight);
	        }
        }
        /** Function to toggle fullscreen mode */
        scope.fullscreen = function() {
            // Change the size
            if(vm.fullscreen) {
                updateCamera(params.width, params.height);
                renderer.setSize(params.width, params.height);
                webglEl[0].style.position = '';

                // enable scrollbars
                document.documentElement.style.overflow = 'auto';  // firefox, chrome
                //document.body.scroll = 'yes'; // ie only

            } else {
                updateCamera(params.width, params.height);
                renderer.setSize(windowWidth, windowHeight - 28);
                webglEl[0].style.position = 'absolute';
                webglEl[0].style.left = '0px';
                webglEl[0].style.top = '0px';

                // Go to top
                window.scrollTo(0,0);

                // disable scrollbars
                document.documentElement.style.overflow = 'hidden';  // firefox, chrome
                //document.body.scroll = 'no'; // ie only
            }

            vm.fullscreen = vm.fullscreen ? false : true;
        };
        /** Function to listen mousewheel */
        function onMouseWheel(event) {
            event.preventDefault();
            if(event.wheelDeltaY) { // WebKit
                camera.fov -= event.wheelDeltaY * 0.05;
            } else if(event.wheelDelta) { // Opera / IE9
                camera.fov -= event.wheelDelta * 0.05;
            } else if(event.detail) { // Firefox
                camera.fov += event.detail * 1.0;
            }
            camera.fov = Math.max(40, Math.min(100, camera.fov));
            camera.updateProjectionMatrix();
        }

        if(params.controls === Control.all || params.controls === Control.wheel) {
            webglEl.bind('mousewheel', onMouseWheel);
            webglEl.bind('DOMMouseScroll', onMouseWheel);
        }
      }

      vm.directive = directive;
    }
  }
}

angular.module("photosphere", []);
angular.module("photosphere").directive(ngPhotosphere.ngScopeElement.IID, () => new ngPhotosphere.ngScopeElement().directive);
angular.module("photosphere").directive(ngPhotosphere.photosphere.IID, ($window: ng.IWindowService) => new ngPhotosphere.photosphere($window).directive);
