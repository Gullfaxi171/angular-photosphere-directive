"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ngPhotosphere;
(function (ngPhotosphere) {
    (function (Control) {
        Control[Control["all"] = 0] = "all";
        Control[Control["wheel"] = 1] = "wheel";
        Control[Control["pointer"] = 2] = "pointer";
        Control[Control["none"] = 3] = "none";
    })(ngPhotosphere.Control || (ngPhotosphere.Control = {}));
    var Control = ngPhotosphere.Control;
    var params = (function () {
        function params(width, height, speed, resolution, controls) {
            var vm = this;
            vm.setWidth(width);
            vm.setHeight(height);
            vm.setSpeed(speed);
            vm.setResolution(resolution);
            vm.setControls(controls);
        }
        params.prototype.setWidth = function (width) {
            var vm = this;
            if (typeof width !== "undefined" && !isNaN(width)) {
                vm.width = width;
            }
            else {
                vm.width = params.DEFAULT_WIDTH;
            }
        };
        params.prototype.setHeight = function (height) {
            var vm = this;
            if (typeof height !== "undefined" && !isNaN(height)) {
                vm.height = height;
            }
            else {
                vm.height = params.DEFAULT_HEIGHT;
            }
        };
        params.prototype.setSpeed = function (speed) {
            var vm = this;
            if (typeof speed !== "undefined" && !isNaN(speed)) {
                vm.speed = Math.min(Math.max(speed, params.MIN_SPEED), params.MAX_SPEED);
            }
            else {
                vm.speed = params.DEFAULT_SPEED;
            }
        };
        params.prototype.setResolution = function (resolution) {
            var vm = this;
            if (typeof resolution !== "undefined" && !isNaN(resolution)) {
                vm.resolution = Math.min(Math.max(resolution, params.MIN_RESOLUTION), params.MAX_RESOLUTION);
            }
            else {
                vm.resolution = params.DEFAULT_RESOLUTION;
            }
        };
        params.prototype.setControls = function (controls) {
            var vm = this;
            if (typeof controls !== "undefined") {
                vm.controls = controls;
            }
            else {
                vm.controls = params.DEFAULT_CONTROLS;
            }
        };
        params.DEFAULT_WIDTH = 640;
        params.DEFAULT_HEIGHT = 480;
        params.DEFAULT_SPEED = 0;
        params.MIN_SPEED = 0;
        params.MAX_SPEED = 20;
        params.DEFAULT_RESOLUTION = 30;
        params.MAX_RESOLUTION = 80;
        params.MIN_RESOLUTION = 10;
        params.DEFAULT_CONTROLS = Control.all;
        return params;
    })();
    ngPhotosphere.params = params;
    var Directive = (function () {
        function Directive() {
        }
        return Directive;
    })();
    var ngScopeElement = (function (_super) {
        __extends(ngScopeElement, _super);
        function ngScopeElement() {
            _super.call(this);
            var vm = this;
            var directive = {};
            directive.restrict = "A";
            directive.compile = function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {
                        scope[iAttrs.ngScopeElement] = iElement;
                    }
                };
            };
            vm.directive = directive;
        }
        ngScopeElement.IID = "ngScopeElement";
        ngScopeElement.$inject = [];
        return ngScopeElement;
    })(Directive);
    ngPhotosphere.ngScopeElement = ngScopeElement;
    var photosphere = (function (_super) {
        __extends(photosphere, _super);
        function photosphere($window) {
            _super.call(this);
            this.fullscreen = false;
            var vm = this;
            vm.id = Math.round(10000 * Math.random());
            vm.template = '<div ng-scope-element="' + vm.id + '"></div>';
            vm.fullscreen = false;
            var directive = {};
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
            directive.link = function (scope, element, attrs) {
                var params = new ngPhotosphere.params(parseInt(attrs.width, 10), parseInt(attrs.height, 10), parseInt(attrs.speed, 10), parseInt(attrs.resolution, 10), ngPhotosphere.Control[attrs.controls]);
                var rotateSpeed = -0.5 * params.speed;
                var windowWidth = $window.innerWidth;
                var windowHeight = $window.innerHeight;
                var webglEl = scope[vm.id];
                var scene = new THREE.Scene();
                var camera = new THREE.PerspectiveCamera(75, params.width / params.height, 1, 1000);
                camera.position.x = 0.1;
                camera.fov = 1.0;
                var renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
                renderer.setSize(params.width, params.height);
                var geometry = new THREE.SphereGeometry(100, params.resolution, params.resolution);
                THREE.ImageUtils.crossOrigin = 'use-credential';
                var mesh = new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture(attrs.src)
                });
                var sphere = new THREE.Mesh(geometry, mesh);
                sphere.scale.x = -1;
                scene.add(sphere);
                var controls = new THREE.OrbitControls(camera, webglEl);
                if (params.controls === Control.wheel || params.controls === Control.none) {
                    controls.enabled = false;
                }
                controls.noPan = true;
                controls.noZoom = true;
                controls.autoRotate = true;
                controls.autoRotateSpeed = rotateSpeed;
                webglEl.append(renderer.domElement);
                render();
                function render() {
                    if (vm.fullscreen) {
                        updateSize();
                    }
                    controls.update();
                    requestAnimationFrame(render);
                    renderer.render(scene, camera);
                }
                function updateCamera(w, h) {
                    camera.aspect = w / h;
                    camera.fov = Math.max(40, Math.min(100, camera.fov));
                    camera.updateProjectionMatrix();
                }
                function updateSize() {
                    if (windowWidth !== $window.innerWidth || windowHeight !== $window.innerHeight) {
                        windowWidth = $window.innerWidth;
                        windowHeight = $window.innerHeight;
                        updateCamera(windowWidth, windowHeight);
                        renderer.setSize(windowWidth, windowHeight);
                    }
                }
                scope.fullscreen = function () {
                    if (vm.fullscreen) {
                        updateCamera(params.width, params.height);
                        renderer.setSize(params.width, params.height);
                        webglEl[0].style.position = '';
                        document.documentElement.style.overflow = 'auto';
                    }
                    else {
                        updateCamera(params.width, params.height);
                        renderer.setSize(windowWidth, windowHeight - 28);
                        webglEl[0].style.position = 'absolute';
                        webglEl[0].style.left = '0px';
                        webglEl[0].style.top = '0px';
                        window.scrollTo(0, 0);
                        document.documentElement.style.overflow = 'hidden';
                    }
                    vm.fullscreen = vm.fullscreen ? false : true;
                };
                function onMouseWheel(event) {
                    event.preventDefault();
                    if (event.wheelDeltaY) {
                        camera.fov -= event.wheelDeltaY * 0.05;
                    }
                    else if (event.wheelDelta) {
                        camera.fov -= event.wheelDelta * 0.05;
                    }
                    else if (event.detail) {
                        camera.fov += event.detail * 1.0;
                    }
                    camera.fov = Math.max(40, Math.min(100, camera.fov));
                    camera.updateProjectionMatrix();
                }
                if (params.controls === Control.all || params.controls === Control.wheel) {
                    webglEl.bind('mousewheel', onMouseWheel);
                    webglEl.bind('DOMMouseScroll', onMouseWheel);
                }
            };
            vm.directive = directive;
        }
        photosphere.IID = "photosphere";
        photosphere.$inject = ["$window"];
        return photosphere;
    })(Directive);
    ngPhotosphere.photosphere = photosphere;
})(ngPhotosphere || (ngPhotosphere = {}));
angular.module("photosphere", []);
angular.module("photosphere").directive(ngPhotosphere.ngScopeElement.IID, function () { return new ngPhotosphere.ngScopeElement().directive; });
angular.module("photosphere").directive(ngPhotosphere.photosphere.IID, function ($window) { return new ngPhotosphere.photosphere($window).directive; });
