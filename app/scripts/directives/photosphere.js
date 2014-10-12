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
        var css = '<style> ul{list-style-type:none;margin:0;padding:0;overflow:hidden}li{float:left}a:link,a:visited{display:block;width:120px;font-weight:700;color:#FFF;background-color:#98bf21;text-align:center;padding:4px;text-decoration:none}a:active,a:hover{background-color:#7A991A}</style>';
        var navbar = '<ul> <li><a href="" ng-click="fullscreen()">See fullscreen</a></li> </ul>';
        var template = css + '<div ng-scope-element="' + id + '">' + navbar + '</div>';
        
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
                var MIN_SPEED = 0;
                var MAX_SPEED = 20;
                var DEFAULT_RESOLUTION = 30;
                var MAX_RESOLUTION = 80;
                var MIN_RESOLUTION = 10;
                var DEFAULT_CONTROLS = 'all';
                var ALLOWED_CONTROLS = ['all', 'wheel', 'pointer', 'none'];
                
                var speed = Math.max(Math.min(attrs.speed, MAX_SPEED), MIN_SPEED) || DEFAULT_SPEED;
                var width = attrs.width || DEFAULT_WIDTH;
                var height = attrs.height || DEFAULT_HEIGHT;
                var res = Math.max(Math.min(attrs.resolution, MAX_RESOLUTION), MIN_RESOLUTION) || DEFAULT_RESOLUTION;
                var rotateSpeed = -0.5 * speed;
                var windowWidth = $window.innerWidth;
                var windowHeight = $window.innerHeight;
                var ctrls = attrs.controls || DEFAULT_CONTROLS;
                var fullscreen = false;
                
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
                
                var controls = new THREE.OrbitControls(camera, webglEl);
                
                if(ctrls === 'wheel' || ctrls === 'none') {
                    controls.enabled = false;
                }
                
                controls.noPan = true;
                controls.noZoom = true;
                controls.autoRotate = true;
                controls.autoRotateSpeed = rotateSpeed;
                
                webglEl.append(renderer.domElement);

                function render() {
                    if(fullscreen) {
                        updateSize();
                    }
                    controls.update();
                    requestAnimationFrame(render);
                    renderer.render(scene, camera);
                }
                render();
                
                function updateCamera(w, h) {
                    camera.aspect = w / h;
                    camera.fov = Math.max(40, Math.min(100, camera.fov));
                    camera.updateProjectionMatrix();
                }
                
                // Function to resize canvas when resizing window
                function updateSize() {
                    if (windowWidth !== $window.innerWidth || windowHeight !== $window.innerHeight) {
				        windowWidth = $window.innerWidth;
				        windowHeight = $window.innerHeight;
                        updateCamera(windowWidth, windowHeight);
				        renderer.setSize(windowWidth, windowHeight);
			        }
                }
                
                scope.fullscreen = function() {
                    // Change the size
                    if(fullscreen) {
                        updateCamera(width, height);
                        renderer.setSize(width, height);
                        webglEl[0].style.position = '';
                        
                        // enable scrollbars
                        document.documentElement.style.overflow = 'auto';  // firefox, chrome
                        document.body.scroll = 'yes'; // ie only
                        
                    } else {
                        updateCamera(width, height);
                        renderer.setSize(windowWidth, windowHeight - 28);
                        webglEl[0].style.position = 'absolute';
                        webglEl[0].style.left = '0px';
                        webglEl[0].style.top = '0px';
                        
                        // Go to top
                        window.scrollTo(0,0);
                        
                        // disable scrollbars
                        document.documentElement.style.overflow = 'hidden';  // firefox, chrome
                        document.body.scroll = 'no'; // ie only
                    }
                    
                    fullscreen = fullscreen ? false : true;
                };

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