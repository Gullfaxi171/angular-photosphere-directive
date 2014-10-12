#Photosphere directive for Angular.js

##Getting started :

Import three.js and photosphere.min.js
```html
<script src="//ajax.googleapis.com/ajax/libs/threejs/r67/three.min.js"></script>
<script src="libs/photosphere.min.js"></script>
```

Add the 'photosphere' module to your app
```javascript
angular.module('myApp', ['photosphere']);
```
##Use :
```html
<photosphere src="path/img.jpg"></photosphere>
```
##Optionnal attributes :
```html
    <photosphere src="path/img.jpg"
                 width="1024"               // Default is 640
                 height="768"               // Default is 480
                 speed="10"                 // Initial rotation speed. Default is 0. Has to be between 0 and 20
                 resolution="40"            // Number of division of the sphere on which is mapped the picture. Default is 30. Has to be between 10 and 80.
                 controls="all">            // Can be 'all', 'wheel', 'pointer' or 'none'. Default is 'all'
    </photosphere>
```    
##Advices

* You can now put several photospheres on the same webpage ! 

* Big resolutions values can have effects on the performances.
* Don't use too heavy pictures (like 10 Mo), people don't like to wait...

##Coming Soon
* Headtracking control (with webcam)
* LeapMotion control
* Better reaction to resize
* Fullscreen mode
* Setting the fov of the camera
* Fisheye view

##License