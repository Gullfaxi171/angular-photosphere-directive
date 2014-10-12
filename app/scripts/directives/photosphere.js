'use strict';
/**
 * @ngdoc directive
 * @name photosphereApp.directive:photosphere
 * @description
 * # photosphere
 */
var photosphere = angular.module('photosphere', []);
photosphere.directive('ngScopeElement', function() {
    var directiveDefinitionObject = {
        restrict: 'A',
        compile: function compile(tElement, tAttrs, transclude) {
            return {
                pre: function preLink(scope, iElement, iAttrs, controller) {
                    scope[iAttrs.ngScopeElement] = iElement;
                }
            };
        }
    };
    return directiveDefinitionObject;
});

photosphere.directive('photosphere', ['$window',
    function($window) {
        
        // Generate a unique ID
        // ====================

        var id = 'sphere' + Math.round(Math.random()*100000);
        var template = '<div ng-scope-element="' + id + '"></div>';
        
        return {
            template: template,
            restrict: 'EA',
            scope: {
                src: '@',
                height: '=?',
                width: '=?',
                speed: '=?',
                resolution: '=?',
                controls: '=?'
            },
            link: function postLink(scope, element, attrs) {
                
                // Setting the variables
                // =====================
                
                var DEFAULT_WIDTH = 640;
                var DEFAULT_HEIGHT = 480;
                var DEFAULT_SPEED = 0;
                var DEFAULT_RESOLUTION = 30;
                var MAX_RESOLUTION = 80;
                var DEFAULT_CONTROLS = 'all';
                var ALLOWED_CONTROLS = ['all', 'wheel', 'pointer', 'none'];
                
                var speed = Math.max(Math.min(attrs.speed, 20), 0) || DEFAULT_SPEED;
                var width = attrs.width || DEFAULT_WIDTH;
                var height = attrs.height || DEFAULT_HEIGHT;
                var res = Math.max(Math.min(attrs.resolution, 80), 10) || DEFAULT_RESOLUTION;
                var rotateSpeed = -0.5 * speed;
                var windowWidth = $window.innerWidth;
                var windowHeight = $window.innerHeight;
                var ctrls = attrs.controls || DEFAULT_CONTROLS;
                
                if(ALLOWED_CONTROLS.indexOf(ctrls) === -1) {
                    ctrls = DEFAULT_CONTROLS;
                }
                
                // Building the scene
                // ==================
                var webglEl = scope[id];
                
                var scene = new THREE.Scene();
                
                var camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
                camera.position.x = 0.1;
                camera.fov = 1.0;
                
                var renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
                renderer.setSize(width, height);
                
                var geometry = new THREE.SphereGeometry(100, res, res);
                
                //var currentMesh = null;
                
                var mesh = new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture(attrs.src)
                });
                
                var sphere = new THREE.Mesh(geometry, mesh);
                sphere.scale.x = -1;
                scene.add(sphere);
                
                console.log(webglEl);
                var controls = new THREE.OrbitControls(camera, webglEl);
                
                if(ctrls === 'wheel' || ctrls === 'none') {
                    controls.enabled = false;
                }
                
                controls.noPan = true;
                controls.noZoom = true;
                controls.autoRotate = true;
                controls.autoRotateSpeed = rotateSpeed
                
                webglEl.append(renderer.domElement);
                render();

                function render() {
                    //updateSize();
                    controls.update();
                    requestAnimationFrame(render);
                    renderer.render(scene, camera);
                }
                
                // Function to resize canvas when resizing window

                function updateSize() {
                    /*if(windowWidth < width) {
                        renderer.setSize(windowWidth, height);
                    } else {
                        renderer.setSize(width, height);
                    }*/
                    /*if (windowWidth != $window.innerWidth
					|| windowHeight != $window.innerHeight) {

				windowWidth = $window.innerWidth;
				windowHeight = $window.innerHeight;
				camera.aspect = $window.innerWidth / $window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize(windowWidth, windowHeight);

			}*/
                }

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
                
                if(ctrls === 'all' || ctrls === 'wheel') {
                    webglEl.bind('mousewheel', onMouseWheel);
                    webglEl.bind('DOMMouseScroll', onMouseWheel);
                }

            }
        };
    }
]);