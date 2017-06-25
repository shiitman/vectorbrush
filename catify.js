class Catify {
    constructor() {
        this.brushesArray = ["cat.svg", "cat1.svg", "cat11.svg", "cat2.svg", "pig.svg",
            "laughing2.svg", "alien.svg", "eye.svg", "devil-head.svg", "black.svg", "laughing.svg", "speechballoon1.svg", "speechballoon2.svg", "speechballoon3.svg"];
        this.catifyBrushes = new BrushesObject();
        this.catifyBrushes.init(this.brushesArray, "brushes");
        $(".brush").wrap("<span></span>");

        this.catifyCanvas = new CanvasManager($("#myCanvas")[0], this.catifyBrushes);
        this.shapeManager = this.catifyCanvas.shapeManager;

        this.catifyCanvas.title = "Canvas";
    }

    notify(msg, attachTo) {
        $("<div>")
            .appendTo($("body"))
            .text(msg)
            .addClass("notify notification ui-state-default ui-corner-bottom")
            .position({
                my: "center top",
                at: "center bottom",
                of: $("#" + attachTo)
            })
            .show({
                effect: "blind"
            })
            .delay(1000)
            .hide({
                effect: "blind",
                duration: "slow"
            }, function () {
                $(this).remove();
            });
    }

    /*INTERFACE*/
    loadDialogs() {
        jQuery("button").button();
        jQuery("input[type='file']").button();

        $("#accordion").accordion({});

        var mainmenu = $("#mainmenu").dialog({
            dialogClass: "no-close",
            width: 420,
            title: "Catify",
            position: {
                my: "left top",
                at: "left top",
                of: window
            }
        });

        var toolsPlace = $("#tools").dialog({
            dialogClass: "no-close",
            width: 600,
            title: "Tools",
            position: {
                my: "left top",
                at: "right top",
                of: mainmenu.parent()
            }
        })

        var mcanvas = $("#canvaswindow").dialog({
            dialogClass: "no-close",
            width: 650,
            title: this.catifyCanvas.title,
            position: {
                my: "left top",
                at: "left bottom",
                of: toolsPlace
            }
        });



        $("#brushwindow").dialog({
            dialogClass: "no-close",
            width: 400,
            title: "Masks",
            position: {
                my: "left top",
                at: "left bottom",
                of: $("#mainmenu")
            }
        });

        $(function () {
            $("#toolstabs").tabs({});
        });

    }

    showDescription() {
        jQuery("#moreinfo").dialog({
            width: 500,
            maxHeight: 400,
            title: "About",
            buttons: [{
                text: "OK",
                click: function () {
                    $(this).dialog("close");
                }
        }]
        })
    }


    afterLoad() {
        var catify = this;
        if (this.catifyCanvas.loading) {
            setTimeout(function () {
                catify.afterLoad();
            }, 1000);
            return;
        }
        if (this.catifyCanvas.isSaveable()) {
            $("#savebuttons").show();
            $("#nosavebuttons").hide();
            $("#detect").prop("disabled", false);


        } else {
            $("#nosavebuttons").show();
            $("#savebuttons").hide();
            $("#detect").prop("disabled", true);

        }
        var maxCanvWidth = this.catifyCanvas.width + 80;
        var maxCanvHeight = this.catifyCanvas.height + 100;

        if (maxCanvWidth > window.innerWidth - 450) {
            maxCanvWidth = window.innerWidth - 450;
        }
        if (maxCanvHeight > window.innerHeight) {
            maxCanvHeight = window.innerHeight - 50;
        }
        $("#canvaswindow").dialog({
            dialogClass: "no-close",
            width: maxCanvWidth,
            height: maxCanvHeight,
            title: this.catifyCanvas.title,
            position: {}
        });

        $("#imgsizewidth").val(this.catifyCanvas.canvas.width);
        $("#imgsizeheight").val(this.catifyCanvas.canvas.height);
    }


    showTextDialog() {
        if (this.shapeManager.selection) {
            $("#rotateinput").val(this.shapeManager.selection.rotation);

            if (this.shapeManager.selection.type == 1) {
                $("#textEdit").dialog({
                    width: 400,
                    height: 380,
                    title: "Edit text",
                    buttons: [{
                        text: "OK",
                        click: function () {
                            $(this).dialog("close");
                        }
                }]
                });
                $("#textChange").val(this.shapeManager.selection.fill.text);
                $("#textChange")[0].editing = this.shapeManager.selection;
                this.catifyCanvas.textProps.synchronizeBack($("#textChange")[0].editing);
                this.catifyCanvas.textProps.propsToInput($("#font-face"), $("#font-size"), $("#font-color"));
                this.catifyCanvas.valid = false;
                this.catifyCanvas.draw();
                return;
            }
        }
        if ($("#textEdit").hasClass('ui-dialog-content')) {
            $("#textEdit").dialog("close");
        }
    }

    rotationChange() {
        if (!this.shapeManager.selection) {
            $("#rotatebutton").show();
            $("#rotateinput").hide();
            return;
        }

        if ($("#rotateinput")[0].validity.valid) {
            this.shapeManager.selection.rotation = Number($("#rotateinput").val());
            this.shapeManager.valid = false;
            this.catifyCanvas.draw();
        } else {
            $("#rotateinput").val(this.shapeManager.selection.rotation);
        }
    }

    readFile(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            var catify = this;
            reader.onload = function (e) {
                catify.catifyCanvas.freeCanvas();

                jQuery("#myCanvas").click(function () {
                    setTimeout(function () {
                        catify.showTextDialog()
                    }, 500);
                });
                jQuery("#myCanvas").dblclick(function () {
                    setTimeout(function () {
                        catify.showTextDialog()
                    }, 500);
                });
                catify.catifyCanvas.loadBackground(e.target.result, true);
                catify.afterLoad();

            }
            this.catifyCanvas.title = "Canvas. File Opened:  " + input.files[0].name;
            reader.readAsDataURL(input.files[0]);
        }
    }
    /*SAVE AND LOAD FUNCTIONS*/
    saveToCookies() {
        var shapes = this.shapeManager.shapes.slice();

        var cookieObject = {
            brushes: this.catifyBrushes,
            shapes: shapes,
            background: this.catifyCanvas.backgroundSrc
        }

        $.cookie("saveCatify", JSON.stringify(cookieObject));

    }

    loadFromCookies() {
        var cookieObject = JSON.parse($.cookie("saveCatify"));
        console.log(cookieObject);

        this.catifyBrushes.init(cookieObject.brushes.brushNames, cookieObject.brushes.brushDiv);
        this.catifyBrushes.chooseBrush(0);

        this.catifyCanvas.loadBackground(cookieObject.background, true);
        this.catifyCanvas.brushInstruments = this.catifyBrushes;
        var catify = this;
        setTimeout(function () {
            for (var i = 0; i < cookieObject.shapes.length; i++) {
                if (cookieObject.shapes[i].type == 0) {
                    cookieObject.shapes[i].fill = catify.catifyBrushes.brush(cookieObject.shapes[i].fill.index)[0];
                }
                catify.shapeManager.addShape(new Shape(cookieObject.shapes[i].x, cookieObject.shapes[i].y, cookieObject.shapes[i].w, cookieObject.shapes[i].h, cookieObject.shapes[i].fill, cookieObject.shapes[i].type));
            }
            this.afterLoad();
        }, 500);
    }

    detectFaces() {
        var catify = this;
        $('#myCanvas').faceDetection({
            complete: function (faces) {
                for (var i = 0; i < faces.length; i++) {
                    var maskVar = new Shape(faces[i].x - faces[i].width / 2, faces[i].y - faces[i].height / 2, faces[i].width * 2, faces[i].height * 2, catify.catifyBrushes.activeBrush);
                    catify.shapeManager.addShape(maskVar);
                };
            }
        });
    }
}


$().ready(function () {
    "use strict";
    var catify = new Catify();

    catify.loadDialogs();

    //Declare events
    $("#myCanvas").click(function () {
        setTimeout(function () {
            catify.showTextDialog()
        }, 500);
    });
    $("#myCanvas").dblclick(function () {
        setTimeout(function () {
            catify.showTextDialog()
        }, 500);
    });
    $("#detect").click(function () {
        catify.detectFaces();
    });

    $("#fileupload").change(function () {
        catify.readFile(this);
    });

    $("#deletesel").click(function (event) {
        {
            if (!catify.shapeManager.selection) {
                catify.notify("Nothing selected", "tools");
                return false;
            }
            catify.shapeManager.deleteSelected();
            return false;
        }
    });

    $("#deleteall").click(function (event) {

        catify.shapeManager.deleteAllShapes();
    });

    $("#textChange").change(function () {
        this.editing.fill.text = $(this).val();
        catify.catifyCanvas.textProps.synchronize(this.editing);
        catify.catifyCanvas.valid = false;
        catify.catifyCanvas.draw();
    });
    $("#textChange").keyup(function () {
        $(this).trigger("change");
    });
    $("#layerup").click(function (event) {
        {
            if (!catify.shapeManager.selection) {
                catify.notify("Nothing selected", "tools");
                return false;
            }
            catify.shapeManager.shapeLayerUp();
            return false;
        }
    });
    $("#layerdown").click(function (event) {
        {
            if (!catify.shapeManager.selection) {
                catify.notify("Nothing selected", "tools");
                return false;
            }
            catify.shapeManager.shapeLayerDown();
            return false;
        }
    });
    $("#changeicon").click(function (event) {
        {
            if (!catify.shapeManager.selection) {
                catify.notify("Nothing selected", "tools");
                return false;
            }
            catify.shapeManager.changeFill();
            return false;
        }
    });

    $("#readmore").click(function (event) {
        {
            catify.showDescription();
            return false;
        }
    });

    $("#textmode").click(function (event) {
        {
            catify.catifyCanvas.mode = 1;
            return false;
        }
    });
    $(".texttools").change(function (event) {
        catify.catifyCanvas.textProps.propsFromInput($("#font-face").val(), $("#font-size").val(), $("#font-color").val());
        if (catify.shapeManager.selection) {
            catify.catifyCanvas.textProps.synchronize(catify.shapeManager.selection);
        }
        catify.catifyCanvas.valid = false;
        catify.catifyCanvas.draw();
    });
    $("#font-size").keyup(function () {
        $(this).trigger("change");
    });

    $("#rotatebutton").click(function () {
        if (catify.shapeManager.selection) {
            $("#rotatebutton").hide();
            $("#rotateinput").show();
            $("#rotateinput").val(catify.shapeManager.selection.rotation);
            $("#rotateinput").focus();
        } else {
            catify.notify("Nothing selected", "tools");
        }
        return false;
    });

    $("#rotateinput").change(function (event) {
        catify.rotationChange();
    });

    $("#rotateinput").keyup(function (event) {
        $("#rotateinput").trigger("change");
    });
    $("#rotateinput").focus(function (event) {
        $("#rotateinput").trigger("change");
    });
    $("#rotateinput").blur(function (event) {
        $("#rotateinput").trigger("change");
        $("#rotatebutton").show();
        $("#rotateinput").hide();
    });

    $("#normalsize").click(function (event) {
        if (catify.shapeManager.selection)
            catify.shapeManager.selection.normalSize();
        catify.shapeManager.valid = false;
    });


    $("#font-face").children().each(function () {
        $(this).wrap('<optgroup style="font-family:' + $(this).val() + '"></optgroup>')
    });
    $("#font-face").selectable();

    $("#loadlink").click(function (event) {
        {
            if ($("#imagelink")[0].validity.valid) {

                catify.catifyCanvas.deleteAllShapes();
                catify.catifyCanvas.freeCanvas();

                jQuery("#myCanvas").click(function () {
                    setTimeout(function () {
                        catify.showTextDialog()
                    }, 500);
                });
                jQuery("#myCanvas").dblclick(function () {
                    setTimeout(function () {
                        catify.showTextDialog()
                    }, 500);
                });


                catify.catifyCanvas.loadBackground($("#imagelink").val(), true);
                catify.catifyCanvas.title = "Canvas. URL opened:" + $("#imagelink").val();
                catify.afterLoad();
            } else {
                catify.notify("Wrong url", "imagelink");
            }

            return false;
        }
    });

    $("#loadfromcookies").click(function () {
        catify.loadFromCookies();
    });
    $("#savetocookies").click(function () {
        catify.saveToCookies();
    });

    $("#textmode").click(function () {
        catify.catifyCanvas.mode = 1;
    });

    $(".brush").click(function () {
        catify.catifyCanvas.mode = 0;
    });

    $("#savebuttons").find("button").click(function () {
        catify.catifyCanvas.downloadFile($(this).data("ext"), "#downloadlink");
        return false;
    });
    $("#imgsizewidth").val(catify.catifyCanvas.canvas.width);
    $("#imgsizeheight").val(catify.catifyCanvas.canvas.height);

    /*   $("#imgsizewidth").change(function () {
    });
    $("#imgsizeheight").change(function () {
    });
*/
    $("#resizebutton").click(function () {
        catify.catifyCanvas.resizeCanvas(Math.round(Number($("#imgsizewidth").val())), Math.round(Number($("#imgsizeheight").val())));
        var maxCanvWidth = catify.catifyCanvas.width + 80;
        var maxCanvHeight = catify.catifyCanvas.height + 100;

        if (maxCanvWidth > window.innerWidth - 450) {
            maxCanvWidth = window.innerWidth - 450;
        }
        if (maxCanvHeight > window.innerHeight) {
            maxCanvHeight = window.innerHeight - 50;
        }
        $("#canvaswindow").dialog({
            dialogClass: "no-close",
            width: maxCanvWidth,
            height: maxCanvHeight,
            title: catify.catifyCanvas.title,
            position: {}
        });

    });

    setTimeout(function () {
        $(".brush").click(function () {
            catify.catifyCanvas.customPointer.pointerFromImg(this);
        });
        catify.catifyCanvas.customPointer.pointerFromImg(catify.catifyCanvas.brushInstruments.activeBrush);
    }, 1000);
});
