    class BrushesObject {
        constructor() {
            this.brushNames = [];
            this.selectedClass = "brushSelected";
            this.brushDir = "brushes/";
            this.brushPrefix = "_brush_";
            this.class = "brush";

            this.activeBrush = null;
            this.brushContainer = null;
            this.brushDragged = false;
        }

        brushId(nummer) {
            return (this.brushContainer + "_brush_" + nummer);
        }

        brush(nummer) {
            return $("#" + this.brushId(nummer));
        }

        chooseBrush(index) {
            if (this.activeBrush != null) {
                $(this.activeBrush).removeClass(this.selectedClass);
            }

            this.brush(index).addClass(this.selectedClass);
            this.activeBrush = this.brush(index)[0];
        }

        init(brushFileNames, brushContainer) {
            this.brushNames = brushFileNames.slice(0);
            if (brushContainer) {
                this.brushContainer = brushContainer;
            }
            for (var i = 0; i < brushFileNames.length; i++) {
                this.brush(i).remove();
                $("#" + this.brushContainer).append("<img src='" + this.brushDir + brushFileNames[i] + "' id='" + this.brushId(i) + "' draggable=true class='" + this.class + "' data-id='" + i + "'>");

                var brushObj = this;
                this.brush(i)[0].index = i;
                this.brush(i).click(function () {
                    brushObj.chooseBrush(Number($(this).data("id")));
                });

                this.brush(i).on('dragstart', function (e) {
                    e.originalEvent.dataTransfer.setData("text", $(this).attr('id'));
                    brushObj.brushDragged = true;
                    $(this).trigger("click");
                });

                this.brush(i).on('dragend ', function (e) {
                    brushObj.brushDragged = false;
                });

            }
            this.chooseBrush(0);
        }
    }
    class Shape {
        constructor(x, y, w, h, fill, type) {
            this.x = x || 0;
            this.y = y || 0;
            this.w = w || 1;
            this.h = h || 1;
            this.strokeColor = "#000000";
            this.fillColor = "#FFFFFF";

            this.type = type || 0; //Brush or text
            this.aspectRatio = w / h;
            this.fill = fill;

            if (this.type == 0 && fill != null) {
                this.aspectRatio = this.fill.clientWidth / this.fill.clientHeight;
            }

            this.rotation = 0
            this.selected = false;
            this.closeEnough = 10;
        }

        //Count extreme points (for rotated objects)
        countExtremum() {
            var ptX = [];
            var ptY = [];
            var rad = this.rotation * Math.PI / 180
            var centerX = this.x + this.w / 2;
            var centerY = this.y + this.h / 2;

            for (var x = this.x; x <= this.w + this.x; x += this.w)
                for (var y = this.y; y <= this.y + this.h; y += this.h) {
                    var transformedX = centerX + (x - centerX) * Math.cos(rad) - (y - centerY) * Math.sin(rad);
                    var transformedY = centerY + (x - centerX) * Math.sin(rad) + (y - centerY) * Math.cos(rad);
                    ptX.push(transformedX);
                    ptY.push(transformedY);
                }

            if (ptX.length == 0) {
                return;
            }
            var maxX = ptX[ptX.length - 1];
            var maxY = ptY[ptY.length - 1];

            var minX = ptX[0];
            var minY = ptY[0];

            for (var i = 0; i < ptX.length; i++) {
                maxX = (maxX > ptX[i]) ? maxX : ptX[i];
                maxY = (maxY > ptY[i]) ? maxY : ptY[i];
                minX = (minX < ptX[i]) ? minX : ptX[i];
                minY = (minY < ptY[i]) ? minY : ptY[i];
            }

            this.maxX = maxX;
            this.minX = minX;
            this.maxY = maxY;
            this.minY = minY;
        }

        checkCloseEnough(p1, p2, closeEnough) {
            return Math.abs(p1 - p2) < closeEnough;
        }

        // Determine if a point is inside the shape's bounds
        contains(mx, my) {
            this.countExtremum();
            if (this.touchedAtHandles(mx, my) > 0) {
                return true;
            }

            if ((this.w >= 0 && (!(this.minX <= mx) || !(this.maxX >= mx))) || (this.w < 0 && (!(this.minX >= mx) || !(this.maxX <= mx))))
                return false;
            if (this.h >= 0 && (!(this.minY <= my) || !(this.maxY >= my)) || (this.h < 0 && (!(this.minY >= my) || !(this.maxY <= my))))
                return false;

            return (true);
        }

        // Determine if a point is inside the shape's handles
        touchedAtHandles(mx, my) {
            // 1. top left handle
            if (this.checkCloseEnough(mx, this.minX, this.closeEnough) && this.checkCloseEnough(my, this.minY, this.closeEnough)) {
                return 1;
            }
            // 2. top right handle
            else if (this.checkCloseEnough(mx, this.maxX, this.closeEnough) && this.checkCloseEnough(my, this.minY, this.closeEnough)) {
                return 2;
            }
            // 3. bottom left handle
            else if (this.checkCloseEnough(mx, this.minX, this.closeEnough) && this.checkCloseEnough(my, this.maxY, this.closeEnough)) {
                return 3;
            }
            // 4. bottom right handle
            else if (this.checkCloseEnough(mx, this.maxX, this.closeEnough) && this.checkCloseEnough(my, this.maxY, this.closeEnough)) {
                return 4;
            }
            return 0;
        }

        drawRectWithBorder(x, y, sideLength, ctx) {
            ctx.save();
            ctx.fillStyle = this.strokeColor;
            ctx.fillRect(x - (sideLength / 2), y - (sideLength / 2), sideLength, sideLength);
            ctx.fillStyle = this.fillColor;
            ctx.fillRect(x - ((sideLength - 1) / 2), y - ((sideLength - 1) / 2), sideLength - 1, sideLength - 1);
            ctx.restore();
        };

        // Draw handles for resizing the Shape
        drawHandles(ctx) {
            this.countExtremum();
            ctx.save();
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);

            ctx.restore();
            this.drawRectWithBorder(this.minX, this.minY, this.closeEnough, ctx);
            this.drawRectWithBorder(this.maxX, this.minY, this.closeEnough, ctx);
            this.drawRectWithBorder(this.maxX, this.maxY, this.closeEnough, ctx);
            this.drawRectWithBorder(this.minX, this.maxY, this.closeEnough, ctx);
        }

        normalSize() {
            if (this.type != 0) {
                return;
            }
            var newWidth = this.aspectRatio * this.h;
            var newHeight = this.w / this.aspectRatio;

            var endH = (this.h + newHeight) / 2;
            var endW = (this.w + newWidth) / 2;

            this.x += (this.w - endW) / 2
            this.y += (this.h - endH) / 2;

            this.h = endH;
            this.w = endW;
            return true;
        }

        replaceFill(newFill) {
            this.fill = newFill;
            this.aspectRatio = this.fill.clientWidth / this.fill.clientHeight;
        }

        draw(canvasS) { //Draw object to canvas
            var ctx = canvasS.ctx;

            ctx.save();
            ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
            ctx.rotate(this.rotation / 180 * Math.PI);

            if (this.type == 0)
                ctx.drawImage(this.fill, -this.w / 2, -this.h / 2, this.w, this.h);
            else {
                canvasS.textProps.wrapText(ctx, this.fill, -this.w / 2, -this.h / 2, this.w, Math.round(this.fill.size / 4) + this.fill.size);
            }
            ctx.restore();

            if (this.selected === true) {
                this.drawHandles(ctx);
            }
        }
    }
    class ShapeManager {
        constructor(canvasManager) {
            this.shapes = []; // the collection of things to be drawn
            this.valid = false; // when set to false, the canvas will redraw everything
            this.dragging = false; // Keep track of when we are dragging the current selected object. In the future we could turn this into an array for multiple selection
            this.selection = null;
            this.resizeDirection = 0;
            this.dragoffx = 0;
            this.dragoffy = 0;
            this.canvasManager = canvasManager;
        }

        addShape(shape) {
            this.shapes.push(shape);
            this.valid = false;
        };
        deleteShape(ind) {
            for (var i = ind; i < this.shapes.length - 1; i++)
                this.shapes[i] = this.shapes[i + 1];
            this.shapes.pop();
            this.valid = false;
        };
        deleteSelected() {
            if (this.selection) {
                for (var i = 0; i < this.shapes.length; i++) {
                    if (this.shapes[i] == this.selection) {
                        this.deleteShape(i);
                        this.selection = null;
                    }
                }
            }
        }
        deleteAllShapes(ind) {
            this.shapes.length = 0;
            this.valid = false;
        };

        changeOrder(idx1, idx2) {
            var tmp = this.shapes[idx1];
            this.shapes[idx1] = this.shapes[idx2];
            this.shapes[idx2] = tmp;
            this.shapes[idx1].index = idx1;
            this.shapes[idx2].index = idx2;
            this.valid = false;
        }

        shapeLayerDown(idx) {
            idx = typeof idx !== 'undefined' ? idx : (this.selection ? this.selection.index : -1);
            if (idx >= 1) this.changeOrder(idx, idx - 1)

        }
        shapeLayerUp(idx) {
            idx = typeof idx !== 'undefined' ? idx : (this.selection ? this.selection.index : this.shapes.length);
            if (idx < this.shapes.length - 1) this.changeOrder(idx, idx + 1)

        }
        shapeToBottom(idx) {
            idx = typeof idx !== 'undefined' ? idx : (this.selection ? this.selection.index : -1);
            while (idx > 0) {
                this.shapeLayerDown(idx);
                idx--;
            }
        }
        shapeToTop(idx) {
            idx = (typeof idx !== 'undefined') ? idx : (this.selection ? this.selection.index : this.shapes.length);
            while (idx < this.shapes.length - 1) {
                this.shapeLayerUp(idx);
                idx++;
            }
        }

        changeFill() {
            if (this.selection) {
                this.selection.replaceFill(this.canvasManager.brushInstruments.activeBrush);
            }
            this.valid = false;
        }
        select(index) {
            this.deselect();

            this.selection = this.shapes[index];
            this.selection.selected = true;
        }

        deselect() {
            if (this.selection != null) {
                this.selection.selected = false;
            }
            this.selection = null;
        }
        deselectAll() {
            this.selection = null;
            for (var i = 0; i < this.shapes.length; i++) {
                this.shapes[i].selected = false;
            }
            this.valid = false;
        }

        mouseDownSelected(mx, my, shape) {
            this.resizeDirection = shape.touchedAtHandles(mx, my);
            this.valid = false; // something is resizing so we need to redraw
        };

        selectShape(mx, my) {
            var shapes = this.shapes;
            var tmpSelected = false;
            for (var i = shapes.length - 1; i >= 0; i--) {
                var currentSel = shapes[i];
                if (shapes[i].contains(mx, my) && tmpSelected === false) {
                    if (this.selection === currentSel) {
                        if (shapes[i].touchedAtHandles(mx, my)) {
                            this.mouseDownSelected(mx, my, currentSel);
                        } else {
                            this.dragoffx = mx - currentSel.x;
                            this.dragoffy = my - currentSel.y;
                            this.dragging = true;
                        }
                    } else if (this.selection != null) {
                        this.selection.selected = false;
                    }

                    this.selection = currentSel;
                    this.selection.index = i;
                    this.selection.selected = true;

                    currentSel.selected = true;
                    this.valid = false;
                    tmpSelected = true;
                    return;

                } else {
                    currentSel.selected = false;
                    this.valid = false;
                }
            }
            if (tmpSelected === false) {
                this.selection = null;
            }
        }

        addShapeToMousePosition(mx, my, brush, textProps, mode) {
            var swidth = brush.width / brush.height * 100;

            if (mode == 0) {
                this.addShape(new Shape(mx - swidth / 2, my - 50, swidth, 100, brush, 0));
            } else {
                this.addShape(new Shape(mx, my, 300, 100, {
                    text: "New text",
                    font: textProps.font,
                    size: textProps.size,
                    color: textProps.color
                }, 1));
            }
            this.select(this.shapes.length - 1);
        }

        cancelDrag() {
            this.dragging = false;
            this.resizeDirection = 0;
            this.valid = false;
        }

        mouseMove(mx, my) {
            if (this.dragging) {
                this.selection.x = mx - this.dragoffx;
                this.selection.y = my - this.dragoffy;
                this.valid = false; // Something's dragging so we must redraw
            } else {
                var mousePointerInd = -1;
                if (this.selection != null) {
                    if (this.resizeDirection > 0) {
                        this.mouseMoveResizing(mx, my, this.selection);
                        mousePointerInd = this.resizeDirection;
                    } else if (this.selection.contains(mx, my)) {
                        mousePointerInd = this.selection.touchedAtHandles(mx, my);
                    }
                    //}
                } else {
                    for (var i = this.shapes.length - 1; i >= 0; i--) {
                        if (this.shapes[i].contains(mx, my)) {
                            {
                                mousePointerInd = 0;
                            }
                        }
                    }
                }
                //change mouse pointer
                this.canvasManager.mousePointer(mousePointerInd);
            }
        }

        mouseMoveResizing(mouseX, mouseY, shape) {

            switch (this.resizeDirection) {
                case 1:
                    var w = shape.w + shape.x - mouseX;
                    var h = shape.h + shape.y - mouseY;
                    var xOff = 0;
                    var yOff = 0;
                    if (w < 10) {
                        xOff = w - 10;
                        w = 10;
                    }
                    if (h < 10) {
                        yOff = h - 10;
                        h = 10;
                    }

                    shape.w = w;
                    shape.h = h;
                    shape.x = mouseX + xOff;
                    shape.y = mouseY + yOff;

                    break;

                case 2:
                    var w = mouseX - shape.x;
                    var h = shape.h + shape.y - mouseY;
                    var yOff = 0;
                    if (w < 10) {
                        w = 10;
                    }
                    if (h < 10) {
                        yOff = h - 10;
                        h = 10;
                    }
                    shape.h = h;
                    shape.w = w;
                    shape.y = mouseY + yOff;
                    break;

                case 3:
                    var w = shape.w + shape.x - mouseX;
                    var h = mouseY - shape.y;
                    var xOff = 0;
                    if (w < 10) {
                        xOff = w - 10;
                        w = 10;
                    }
                    if (h < 10) {
                        h = 10;
                    }
                    shape.h = h;
                    shape.w = w;
                    shape.x = mouseX + xOff;
                    break;

                case 4:
                    var w = mouseX - shape.x;
                    var h = mouseY - shape.y;
                    if (w < 10) {
                        w = 10;
                    }
                    if (h < 10) {
                        h = 10;
                    }

                    shape.h = h;
                    shape.w = w;
                    break;
            }
            this.valid = false;
        }

        draw(canvas) {
            if (!this.valid) {
                var shapes = this.shapes;
                // draw all shapes
                for (var i = 0; i < shapes.length; i++) {
                    var shape = shapes[i];

                    if (shape.x > this.canvasManager.width || shape.y > this.canvasManager.height || shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;

                    shapes[i].draw(this.canvasManager);
                }

                this.valid = true;
            }
        }
    }
    class TextManager {
        constructor(canvas) {
            this.font = "Ubuntu";
            this.size = 16;
            this.color = "#000000";
            this.effects = [];
            this.canvas = canvas;
        }

        propsFromInput(font, size, color) {
            this.font = font;
            this.size = Number(size);
            this.color = color;
        }
        propsToInput(font, size, color) {
            font.val(this.font);
            size.val(this.size);
            color.val(this.color);
        }

        synchronize(shape) {
            shape.fill.font = this.font;
            shape.fill.size = Number(this.size);
            shape.fill.color = this.color;
            this.canvas.shapeManager.valid = false;
        }

        synchronizeBack(shape) {
            this.font = shape.fill.font;
            this.size = Number(shape.fill.size);
            this.color = shape.fill.color;
        }

        wrapText(context, text, x, y, maxWidth, lineHeight) {
            var words = text.text.split(' ');
            var line = '';
            context.fillStyle = text.color;
            context.font = text.size + "px " + text.font;

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + ' ';
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    context.fillText(line, x, y + lineHeight);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            context.fillText(line, x, y + lineHeight);
        }

    }
    class CustomPointer {
        /*Create custom mouse pointer from img*/
        constructor() {
            this.cursorCanvas = document.createElement("canvas");
            this.cursorCanvas.width = this.cursorCanvas.height = 32;
            this.cursorContext = this.cursorCanvas.getContext("2d");
            this.cursorContext.width = this.cursorContext.height = 32;

            this.font = "";
            this.icon = "";
            this.png = "";

            this.pointerDirections = ["nw", "ne", "sw", "se"];

            jQuery.fn.yourfunctionname = function () {
                var o = $(this[0]) // It's your element
            };
        }

        pointerFromImg(img) {
            this.ready = false;
            this.cursorContext.clearRect(0, 0, 32, 32);
            this.cursorContext.drawImage(img, 0, 0, 32, 32);
            this.png = this.cursorCanvas.toDataURL('image/png');

            this.ready = true;
        }

        applyImagePointer(obj) {
            if (this.png != "") {
                $(obj).css("cursor", "url('" + this.png + "'),pointer");
            }
        }
        applyResizeMovePointer(obj, ind) {
            if (ind > 0 && ind < 5)
                $(obj).css("cursor", this.pointerDirections[ind - 1] + "-resize");
            else
                $(obj).css("cursor", "move");
        }
    }
    class CanvasManager {
        constructor(canvas, brushes) {
            this.brushInstruments = brushes;
            this.canvas = canvas;

            this.width = canvas.width;
            this.height = canvas.height;
            this.ctx = canvas.getContext('2d');
            this.valid = false;

            this.backBuffer = document.createElement("canvas");
            this.backBuffer.width = canvas.width;
            this.backBuffer.height = canvas.height;
            this.backCtx = canvas.getContext('2d');

            this.textProps = new TextManager(this);

            this.backgroundImage = new Image();

            var html = document.body.parentNode;
            this.offsetTop = html.offsetTop;
            this.offsetLeft = html.offsetLeft;

            if (document.defaultView && document.defaultView.getComputedStyle) {
                this.offsetLeft += parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
                this.offsetLeft += parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
                this.offsetTop += parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
                this.offsetTop += parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
            }

            this.backgroundSrc = "";
            this.shapeManager = new ShapeManager(this);
            this.mode = 0;

            this.customPointer = new CustomPointer();
            this.addCanvasListeners(this.canvas);

            this.interval = 30;
            var myState = this;

            setInterval(function () {
                myState.draw();
            }, myState.interval);
        }

        mousePointer(ind) {
            if (ind == -1) {
                if (this.mode == 0) {
                    this.customPointer.applyImagePointer(this.canvas);
                } else {
                    $(this.canvas).css("cursor", "text");
                }
            } else {
                this.customPointer.applyResizeMovePointer(this.canvas, ind);
            }

        }
        getMouse(e) { // Count relative x and y coordinates of mouse pointer
            var offsetX = 0;
            var offsetY = 0;

            var topObject = this.canvas;

            // Compute the total offset
            if (topObject.offsetParent !== undefined) {
                do {
                    offsetX += topObject.offsetLeft;
                    offsetY += topObject.offsetTop;
                } while ((topObject = topObject.offsetParent));
            }

            offsetX += this.offsetLeft;
            offsetY += this.offsetTop;
            offsetX -= $(topObject).parent().scrollLeft();
            offsetY -= $(topObject).parent().scrollTop();
            offsetX -= $(this.canvas).parent().scrollLeft();
            offsetY -= $(this.canvas).parent().scrollTop();

            return {
                x: e.pageX - offsetX,
                y: e.pageY - offsetY
            }
        }

        drop(e) {
            if (this.brushInstruments.brushDragged) {
                this.brushInstruments.brushDragged = false;
                var mouse = this.getMouse(e);
                this.shapeManager.addShapeToMousePosition(mouse.x, mouse.y, this.brushInstruments.activeBrush, this.textProps, 0);
            }
        }
        doubleClick(e) {
            var mouse = this.getMouse(e);
            this.shapeManager.addShapeToMousePosition(mouse.x, mouse.y, this.brushInstruments.activeBrush, this.textProps, this.mode);
        }
        mouseDownListener(e) {
            var mouse = this.getMouse(e);
            this.shapeManager.selectShape(mouse.x, mouse.y);
        }
        mouseMove(e) {
            var mouse = this.getMouse(e);
            this.shapeManager.mouseMove(mouse.x, mouse.y);
        }

        addCanvasListeners(canvas) {
            var myState = this;

            $(canvas).on('selectstart', function (e) {
                e.preventDefault();
                return false;
            });

            $(canvas).on("dragenter", function (e) {
                e.preventDefault();
                return false;
            });

            $(canvas).on('dragover', function (e) {
                e.preventDefault();
                return false;
            });

            $(canvas).on('drop', function (e) {
                myState.drop(e.originalEvent);
                e.preventDefault();
                return false;
            });

            $(canvas).on('mousedown', function (e) {
                myState.mouseDownListener(e.originalEvent);
            });

            $(canvas).on('mousemove', function (e) {
                myState.mouseMove(e.originalEvent);
            });

            $(canvas).on('mouseup', function (e) {
                myState.shapeManager.cancelDrag();

            });

            $(canvas).on('dblclick', function (e) {
                myState.doubleClick(e.originalEvent);

            });
        }

        clear() {
            this.ctx.fillStyle = "white";
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.fillRect(0, 0, this.width, this.height);

            if (this.backgroundImage.src != "") {
                this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
            }
        };

        // While draw is called as often as the INTERVAL variable demands,
        // It only ever does something if the canvas gets invalidated by our code
        draw() {
            // if our state is invalid, redraw and validate!
            if (!this.valid || !this.shapeManager.valid) {
                this.clear();
                this.shapeManager.draw(this);
                this.valid = true;
            }
        }

        freeCanvas() {
            var can = this.canvas;
            var canClone = can.cloneNode(true);
            can.parentNode.replaceChild(canClone, can);
            this.canvas = $("#" + canClone.id)[0];
            this.addCanvasListeners(this.canvas);
            this.ctx = this.canvas.getContext('2d');

        }
        resizeCanvas(w, h) {
            this.backBuffer.height = this.canvas.height = this.height = this.backgroundImage.height = h;
            this.backBuffer.width = this.canvas.width = this.width = this.backgroundImage.width = w;
            this.ctx = this.canvas.getContext('2d');
            this.backCtx = this.backBuffer.getContext('2d');
            this.valid = false;
        }

        loadBackground(src, resize) {
            if (src == "")
                return;

            this.loading = true;

            if (this.backgroundImage == null) //backgroundImage
                this.backgroundImage = new Image();

            this.backgroundImage.src = src;
            this.backgroundSrc = src;

            if (this.backgroundImage.complete) {
                this.backgroundLoaded(resize);
            } else {
                var myCan = this;
                this.backgroundImage.addEventListener("load", function () {
                    myCan.backgroundLoaded(resize);
                });
            }
        }
        backgroundLoaded(resize) {
            if (resize) {
                this.canvas.height = this.height = this.backgroundImage.height = this.backgroundImage.naturalHeight;
                this.canvas.width = this.width = this.backgroundImage.width = this.backgroundImage.naturalWidth;
            }
            this.valid = false;
            this.loading = false;
        }


        isSaveable() {
            try {
                var trysave = this.canvas.toDataURL('image/png');
            } catch (err) {
                return false;
            };
            return true;
        }

        downloadFile(type, linkobj) {
            this.shapeManager.deselectAll();
            this.shapeManager.cancelDrag();

            this.valid = false;
            this.draw();

            var dt = this.canvas.toDataURL('image/' + type, 0.9);
            if (linkobj) {
                $(linkobj).attr("href", dt);
                var now = new Date();
                $(linkobj).attr("download", "catify" + now.getTime() + "." + type);
                $(linkobj).html("Download catify." + type + "<br>" + now.toGMTString());
                $(linkobj).show();
            } else window.open(dt);
        }


    }
