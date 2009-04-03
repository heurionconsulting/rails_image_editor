/*
ImageEditor.js
Copyright (C) 2004-2006 Peter Frueh (http://www.ajaxprogrammer.com/)

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
*/

ImageEditor = {
	imageName: "",
	w: 0,
	h: 0,
	startX: 0,
	startY: 0,
	mouseIsDown: false,
	loadingTextInterval: 0,
	loaderImage: document.createElement("img"),
	validDimension: /^\d{1,4}$/
};
ImageEditor.processImage = function(args){
	if (ImageEditor.cropSquare){
		ImageEditor.cropSquare.style.display = "none";
		ImageEditor.hideCropSize();
	}
  ImageEditor.showLoading();
  var request = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  request.open("POST", "/imagecontroller/processImage", true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  request.onreadystatechange = function(){
		if (request.readyState == 4){
			var json = eval("(" + request.responseText + ")");
     	if (json.imageFound) {
				ImageEditor.imageName = json.imageName;
				ImageEditor.w = json.w;
				ImageEditor.h = json.h;
        ImageEditor.loaderImage.setAttribute("src", "/images/edit/"+json.imageName);
			} else {
				document.getElementById("ImageEditorImage").innerHTML = '<span style="font-size:12px;color:red;">Image was not found.</span>';
			}
     }
	};
	request.send("imageName=" + ImageEditor.imageName + ((args) ? "&" + args : ""));
};
ImageEditor.loadImage = function(){
	ImageEditor.loaderImage.setAttribute("src","/images/edit/frog.jpg");
};
ImageEditor.displayImage = function(){
	clearInterval(ImageEditor.loadingTextInterval);
	
	var editorImage = document.getElementById("ImageEditorImage");
	editorImage.innerHTML = "&nbsp;";
 	editorImage.style.width = ImageEditor.w + "px";
	editorImage.style.height = ImageEditor.h + "px";
	editorImage.style.backgroundImage =  "url(" + ImageEditor.loaderImage.getAttribute('src') + ")";

	document.getElementById("ImageEditorTxtWidth").value = ImageEditor.w;
	document.getElementById("ImageEditorTxtHeight").value = ImageEditor.h;
};
ImageEditor.showLoading = function(){
	document.getElementById("ImageEditorImage").style.backgroundImage = "none";
	document.getElementById("ImageEditorImage").innerHTML =
		'<div id="ImageEditorLoadingText">Loading Image<span id="ellipsis">...</span></div>';
	ImageEditor.loadingTextInterval = setInterval(function(){
		if (document.getElementById("ellipsis")){
			var dots = document.getElementById("ellipsis").innerHTML;
			document.getElementById("ellipsis").innerHTML = (dots != "...") ? dots += "." : "";
		}
	}, 500);
};
ImageEditor.txtWidthKeyup = function(){
	if (!document.getElementById("ImageEditorChkConstrain").checked) { return; }
	var w = document.getElementById("ImageEditorTxtWidth").value;
	if (ImageEditor.validDimension.test(w)){
		document.getElementById("ImageEditorTxtWidth").value = parseInt(w);
		document.getElementById("ImageEditorTxtHeight").value = parseInt((w * ImageEditor.h)/ImageEditor.w);
	}else if (w == ""){
		document.getElementById("ImageEditorTxtHeight").value = "";	
	}else{
		document.getElementById("ImageEditorTxtWidth").value = w.replace(/[^0-9]/g, "");
	}
};
ImageEditor.txtHeightKeyup = function(){
	if (!document.getElementById("ImageEditorChkConstrain").checked) { return; }
	var h = document.getElementById("ImageEditorTxtHeight").value;
	if (ImageEditor.validDimension.test(h)){
		document.getElementById("ImageEditorTxtHeight").value = parseInt(h);
		document.getElementById("ImageEditorTxtWidth").value = parseInt((h * ImageEditor.w)/ImageEditor.h);	
	}else if (h == ""){
		document.getElementById("ImageEditorTxtWidth").value = "";
	}else{
		document.getElementById("ImageEditorTxtHeight").value = h.replace(/[^0-9]/g, "");	
	}
};
ImageEditor.txtBlur = function(){
	var w = document.getElementById("ImageEditorTxtWidth").value;
	var h = document.getElementById("ImageEditorTxtHeight").value;
	if (!ImageEditor.validDimension.test(w) || !ImageEditor.validDimension.test(h)){
		document.getElementById("ImageEditorTxtWidth").value = ImageEditor.w;
		document.getElementById("ImageEditorTxtHeight").value = ImageEditor.h;	
	}
}
ImageEditor.resize = function(){
	var w = document.getElementById("ImageEditorTxtWidth").value;
	var h = document.getElementById("ImageEditorTxtHeight").value;
	
	if (!ImageEditor.validDimension.test(w) || !ImageEditor.validDimension.test(h)){
		alert("The image dimensions are not valid.");
		document.getElementById("ImageEditorTxtWidth").value = ImageEditor.w;
		document.getElementById("ImageEditorTxtHeight").value = ImageEditor.h;
		return;
	}
	if (w > 2000 || h > 2000){
		alert("Width and/or height cannot exceed 2000 pixels.");
		document.getElementById("ImageEditorTxtWidth").value = ImageEditor.w;
		document.getElementById("ImageEditorTxtHeight").value = ImageEditor.h;
		return;
	}
	ImageEditor.processImage("actiontype=resize&w=" + w + "&h=" + h);
};
ImageEditor.rotate = function(degrees){
	ImageEditor.processImage("actiontype=rotate&degrees=" + degrees);
};
ImageEditor.viewActive = function(){
	ImageEditor.processImage("actiontype=viewActive");
};
ImageEditor.viewOriginal = function(){
	ImageEditor.processImage("actiontype=viewOriginal");
};
ImageEditor.save = function(){
	ImageEditor.processImage("actiontype=save");
};
ImageEditor.crop = function(){
	if (typeof ImageEditor == "undefined") { return; }
	if (ImageEditor.cropSquare.style.display == "none"){
		alert("You must select an area to crop before using this feature.");
		return;
	}
	var x = parseInt(ImageEditor.cropSquare.style.left) - PageInfo.getElementLeft(ImageEditor.editorImage);
	var y = parseInt(ImageEditor.cropSquare.style.top) - PageInfo.getElementTop(ImageEditor.editorImage);
	var w = parseInt(ImageEditor.cropSquare.style.width);
	var h = parseInt(ImageEditor.cropSquare.style.height);

	ImageEditor.processImage("actiontype=crop&x=" + x + "&y=" + y + "&w=" + w + "&h=" + h);
};
ImageEditor.startCrop = function(){
	if (typeof ImageEditor == "undefined") { return; }
	with(ImageEditor.cropSquare.style){
		left = PageInfo.getMouseX() + "px";
		top = PageInfo.getMouseY() + "px";
		width = "1px";
		height = "1px";
		display = "block";
	}
	ImageEditor.startX = PageInfo.getMouseX();
	ImageEditor.startY = PageInfo.getMouseY();
};
ImageEditor.dragCrop = function(){
	if (typeof ImageEditor == "undefined") { return; }
	if (!ImageEditor.mouseIsDown) { return; }

	// mouse is to the right of starting point
	if (PageInfo.getMouseX() - ImageEditor.startX > 0) {
		ImageEditor.cropSquare.style.width = PageInfo.getMouseX() - ImageEditor.startX + "px";
	} else{ // mouse is to the left of starting point
		ImageEditor.cropSquare.style.left = PageInfo.getMouseX() + "px";
		ImageEditor.cropSquare.style.width = ImageEditor.startX - PageInfo.getMouseX() + "px";
	}
	// mouse is below the starting point
	if (PageInfo.getMouseY() - ImageEditor.startY > 0) {
		ImageEditor.cropSquare.style.height = PageInfo.getMouseY() - ImageEditor.startY + "px";
	} else { // mouse is above the starting point
		ImageEditor.cropSquare.style.top = PageInfo.getMouseY() + "px";
		ImageEditor.cropSquare.style.height = ImageEditor.startY - PageInfo.getMouseY() + "px";
	}
	ImageEditor.showCropSize(parseInt(ImageEditor.cropSquare.style.width), parseInt(ImageEditor.cropSquare.style.height));
};
ImageEditor.slideCrop = function(e){
	if (ImageEditor.cropSquare.style.display == "none") { return; }
	e = e || event;
	var code = (e.keyCode) ? e.keyCode : (e.which) ? e.which : null;
	if (!code) { return };
	switch (code){
		case 37: //left
			if(PageInfo.getElementLeft(ImageEditor.cropSquare) > PageInfo.getElementLeft(ImageEditor.editorImage)){
				ImageEditor.cropSquare.style.left = PageInfo.getElementLeft(ImageEditor.cropSquare) - 1 + "px";
			}
			break;
		case 38: //up
			if(PageInfo.getElementTop(ImageEditor.cropSquare) > PageInfo.getElementTop(ImageEditor.editorImage)){
				ImageEditor.cropSquare.style.top = PageInfo.getElementTop(ImageEditor.cropSquare) - 1 + "px";
			}		
			break;
		case 39: //right
			if (PageInfo.getElementLeft(ImageEditor.cropSquare) + PageInfo.getElementWidth(ImageEditor.cropSquare) < PageInfo.getElementLeft(ImageEditor.editorImage) + PageInfo.getElementWidth(ImageEditor.editorImage)){
				ImageEditor.cropSquare.style.left = PageInfo.getElementLeft(ImageEditor.cropSquare) + 1 + "px";
			}
			break;
		case 40: //down
			if (PageInfo.getElementTop(ImageEditor.cropSquare) + PageInfo.getElementHeight(ImageEditor.cropSquare) < PageInfo.getElementTop(ImageEditor.editorImage) + PageInfo.getElementHeight(ImageEditor.editorImage)){
				ImageEditor.cropSquare.style.top = PageInfo.getElementTop(ImageEditor.cropSquare) + 1 + "px";
			}		
			break;
	}
};
ImageEditor.showCropSize = function(w, h){
	document.getElementById("ImageEditorCropSize").innerHTML = w + " by " + h + " (use arrow keys to slide)";
};
ImageEditor.hideCropSize = function(){
	document.getElementById("ImageEditorCropSize").innerHTML = "";
};
ImageEditor.addEvent = function(obj, evt, func){
	if (/safari/i.test(navigator.userAgent) && evt == "dblclick") {
		obj.ondblclick = func;
	}else if (window.addEventListener){
		obj.addEventListener(evt, func, false);
	}else if (window.attachEvent){
		obj.attachEvent("on" + evt, func);
	}
};
ImageEditor.init = function(imageName){
	ImageEditor.imageName = imageName || "";
	ImageEditor.loaderImage.onload = function(){ ImageEditor.displayImage(); };
	ImageEditor.processImage("actiontype=viewActive");
	ImageEditor.editorImage = document.getElementById("ImageEditorImage");
	ImageEditor.cropSquare = document.createElement("div");
	with (ImageEditor.cropSquare.style){
		position = "absolute";
		zIndex = 2;
		border = "1px dotted #fff";
		cursor = "crosshair";
		display = "none";
	}
	var bodyNode = document.getElementsByTagName("body").item(0);
	bodyNode.appendChild(ImageEditor.cropSquare);
	ImageEditor.addEvent(document, "mousedown", function(){ ImageEditor.mouseIsDown = true; });
	ImageEditor.addEvent(document, "mouseup", function(){ ImageEditor.mouseIsDown = false; });
	ImageEditor.addEvent(ImageEditor.editorImage, "mouseover", function(){ ImageEditor.editorImage.style.cursor = "crosshair"; });
	ImageEditor.addEvent(ImageEditor.editorImage, "mousedown", ImageEditor.startCrop);
	ImageEditor.addEvent(ImageEditor.editorImage, "mousemove", ImageEditor.dragCrop);
	ImageEditor.addEvent(ImageEditor.cropSquare, "mousedown", ImageEditor.startCrop);
	ImageEditor.addEvent(ImageEditor.cropSquare, "mousemove", ImageEditor.dragCrop);
	ImageEditor.addEvent(document, "dblclick", function() { ImageEditor.cropSquare.style.display = "none"; ImageEditor.hideCropSize(); });
	ImageEditor.addEvent(document, "keydown", ImageEditor.slideCrop);
	ImageEditor.addEvent(document.getElementById("ImageEditorTxtWidth"), "keyup", ImageEditor.txtWidthKeyup);
	ImageEditor.addEvent(document.getElementById("ImageEditorTxtWidth"), "blur", ImageEditor.txtBlur);
	ImageEditor.addEvent(document.getElementById("ImageEditorTxtHeight"), "keyup", ImageEditor.txtHeightKeyup);
	ImageEditor.addEvent(document.getElementById("ImageEditorTxtHeight"), "blur", ImageEditor.txtBlur);
};