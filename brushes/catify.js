var CanvasObjects;
var brushesArray = ["cat.svg", "cat1.svg", "cat11.svg", "cat2.svg", "laughing.svg", "trade_union.svg", "book-pd.svg", "alien.svg", "pig.svg",  "likvidator.svg", "black.svg"];

function detectFaces() {
    $('#myCanvas').faceDetection({
        complete: function(faces) {
            for (i = 0; i < faces.length; i++) {
       //         console.log(faces[i]);
         //       console.log(catifyCanvas);
                var maskVar = new Shape(faces[i].x - faces[i].width / 2, faces[i].y - faces[i].height / 2, faces[i].width * 2, faces[i].height * 2, catifyBrushes.activeBrush);
        //        console.log(maskVar);
                catifyCanvas.addShape(maskVar);
            };
        }
    });
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
 catifyCanvas.freeCanvas();
                
                 jQuery("#myCanvas").click(function() {
                    setTimeout(function() {
                        showTextDialog()
                    }, 500);
                });
                jQuery("#myCanvas").dblclick(function() {
                    setTimeout(function() {
                        showTextDialog()
                    }, 500);
                });            
            catifyCanvas.loadBackground(e.target.result, true);
            afterLoad();

        }
        catifyCanvas.title = "Холст. Открыт файл:  " + input.files[0].name;
        reader.readAsDataURL(input.files[0]);
    }
}
/*SAVE AND LOAD FUNCTIONS*/
function saveToCookies() {
    shapes =  catifyCanvas.shapes.slice();
  
    var cookieObject = {
        brushes: catifyBrushes,
        shapes: shapes,
        background: catifyCanvas.backgroundSrc
    }

    $.cookie("saveCatify", JSON.stringify(cookieObject));

}

function loadFromCookies() {
    var cookieObject = JSON.parse($.cookie("saveCatify"));
  //  console.log(cookieObject);
    catifyBrushes.init(cookieObject.brushes.brushNames, cookieObject.brushes.brushDiv);
    catifyBrushes.chooseBrush(0);

    catifyCanvas.loadBackground(cookieObject.background, true);
    catifyCanvas.brushInstruments = catifyBrushes;
   
   setTimeout(function() {
  

    for (var i = 0; i < cookieObject.shapes.length; i++) {
       
     //   console.log(cookieObject.shapes[i]);
        
       //     console.log(cookieObject.shapes[i]);
            if (cookieObject.shapes[i].type==0) {
                cookieObject.shapes[i].fill=catifyBrushes.brushes[cookieObject.shapes[i].fill.idnum];
            }
            catifyCanvas.addShape(new Shape(cookieObject.shapes[i].x, cookieObject.shapes[i].y, cookieObject.shapes[i].w, cookieObject.shapes[i].h, cookieObject.shapes[i].fill, cookieObject.shapes[i].type));
     
     
    }
    afterLoad();/**/
}, 500);
}


/*INTERFACE*/
function loadDialogs() {
    jQuery("button").button();
    jQuery("input[type='file']").button();

    $("#accordion").accordion({});

    mainmenu = $("#mainmenu").dialog({
        dialogClass: "no-close",
        width: 420,
        title: "Котификатор",
        position: {
            my: "left top",
            at: "left top",
            of: window
        }
    });

    toolsPlace = $("#tools").dialog({
        dialogClass: "no-close",
        width: 600,
        title: "Инструменты",
        position: {
            my: "left top",
            at: "right top",
            of: mainmenu.parent()
        }
    })

    mcanvas = $("#canvaswindow").dialog({
        dialogClass: "no-close",
        width: 650,
        title: catifyCanvas.title,
        position: {
            my: "left top",
            at: "left bottom",
            of: toolsPlace
        }
    });



    $("#brushwindow").dialog({
        dialogClass: "no-close",
        width: 400,
        title: "Маски",
        position: {
            my: "left top",
            at: "left bottom",
            of: $("#mainmenu")
        }
    });

    $(function() {
        $("#toolstabs").tabs({});
    });

}

function showDescription() {
    jQuery("#moreinfo").dialog({
        width: 500,
        maxHeight: 400,
        title: "О Котификаторе",
        buttons: [{
            text: "OK",
            click: function() {
                $(this).dialog("close");
            }
        }]
    })
}

function showHelp() {
    jQuery("#helpb").dialog({
        width: 500,
        maxHeight: 400,
        title: "Справка",
        buttons: [{
            text: "OK",
            click: function() {
                $(this).dialog("close");
            }
        }]
    });

}

function afterLoad() {
    if (catifyCanvas.loading) {
        setTimeout(function() {
            afterLoad();
        }, 1000);
        return;
    }
    if (catifyCanvas.isSaveable()) {
        $("#savebuttons").show();
        $("#nosavebuttons").hide();
        $("#detect").prop("disabled", false);


    } else {
        $("#nosavebuttons").show();
        $("#savebuttons").hide();
        $("#detect").prop("disabled", true);

    }
    maxCanvWidth = catifyCanvas.width + 80;
    maxCanvHeight = catifyCanvas.height + 100;

    if (maxCanvWidth > window.innerWidth - 450) {
        maxCanvWidth = window.innerWidth - 450;
    }
    if (maxCanvHeight > window.innerHeight) {
        maxCanvHeight = window.innerHeight - 50;
    }
  //  console.log(maxCanvHeight);
    $("#canvaswindow").dialog({
        dialogClass: "no-close",
        width: maxCanvWidth,
        height: maxCanvHeight,
        title: catifyCanvas.title,
        position: {}
    });
    
      $("#imgsizewidth").val(catifyCanvas.canvas.width);
      $("#imgsizeheight").val(catifyCanvas.canvas.height);

    //  catifyCanvas.valid=false;
}

function rotationChange() {
   // console.log(catifyCanvas.selection);
    if (!catifyCanvas.selection) {
        $("#rotatebutton").show();
        $("#rotateinput").hide();
        return;
    }

    if ($("#rotateinput")[0].validity.valid) {
      //  console.log("ok, it is valid");
        catifyCanvas.selection.rotation = Number($("#rotateinput").val());
        catifyCanvas.valid = false;
        catifyCanvas.draw();
    } else {
        $("#rotateinput").val(catifyCanvas.selection.rotation);
    }
}

function notify(msg, attachTo) {
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
        }, function() {
            $(this).remove();
        });
}

function showTextDialog() {
    if (catifyCanvas.selection)
    {
       $("#rotateinput").val(catifyCanvas.selection.rotation);
       
        if (catifyCanvas.selection.type == 1) {
       //     console.log("test");
            $("#textEdit").dialog({
                width: 400,
                height: 380,
                title: "Редактирование текста",
                buttons: [{
                    text: "OK",
                    click: function() {
                        $(this).dialog("close");
                    }
                }]
            });
            $("#textChange").val(catifyCanvas.selection.fill.text);
            $("#textChange")[0].editing = catifyCanvas.selection;
            catifyCanvas.textProps.synchronizeBack($("#textChange")[0].editing);
            catifyCanvas.textProps.propsToInput($("#font-face"), $("#font-size"), $("#font-color"));
            catifyCanvas.valid = false;
            catifyCanvas.draw();
            return;
        }
}
    if ($("#textEdit").hasClass('ui-dialog-content')) {
        $("#textEdit").dialog("close");
    }
}

$().ready(function() {
    catifyBrushes = new BrushesObject(brushesArray, "brushes");
    $(".brush").wrap("<span></span>");

    catifyCanvas = new CanvasObjects(document.getElementById('myCanvas'), catifyBrushes);
    catifyCanvas.title = "Холст";
    loadDialogs();

    //textcanvas = new CanvasText();

    jQuery("#myCanvas").click(function() {
        setTimeout(function() {
            showTextDialog()
        }, 500);
    });
    jQuery("#myCanvas").dblclick(function() {
        setTimeout(function() {
            showTextDialog()
        }, 500);
    });

    jQuery("#fileupload").change(function() {
        readURL(this);
    });

    $("#deletesel").click(function(event) {
        {
            if (!catifyCanvas.selection) {
                notify("Ничего не выделено", "tools");
                return false;
            }
            catifyCanvas.deleteSelected();
            return false;
        }
    });
    
    $("#deleteall").click(function(event) {
           
catifyCanvas.deleteAllShapes();
    });

    $("#textChange").change(function() {
        this.editing.fill.text = $(this).val();
        catifyCanvas.textProps.synchronize(this.editing);
        catifyCanvas.valid = false;
        catifyCanvas.draw();


    });
    $("#textChange").keyup(function() {
        $(this).trigger("change");
    });

    $("#layerup").click(function(event) {
        {
            if (!catifyCanvas.selection) {
                notify("Ничего не выделено", "tools");
                return false;
            }
            catifyCanvas.shapeLayerUp();
            return false;
        }
    });
    $("#layerdown").click(function(event) {
        {
            if (!catifyCanvas.selection) {
                notify("Ничего не выделено", "tools");
                return false;
            }
            catifyCanvas.shapeLayerDown();
            return false;
        }
    });
    $("#changeicon").click(function(event) {
        {
            if (!catifyCanvas.selection) {
                notify("Ничего не выделено", "tools");
                return false;
            }
            catifyCanvas.changeFill();
            return false;
        }
    });

    $("#readmore").click(function(event) {
        {
            showDescription();
            return false;
        }
    });
    $("#showhelp").click(function(event) {
        {
            showHelp();
            return false;
        }
    });
    $("#textmode").click(function(event) {
        {
            catifyCanvas.mode = 1;
            return false;
        }
    });
    $(".texttools").change(function(event) {
        catifyCanvas.textProps.propsFromInput($("#font-face").val(), $("#font-size").val(), $("#font-color").val());
        if (catifyCanvas.selection) {
            catifyCanvas.textProps.synchronize(catifyCanvas.selection);
        }
        catifyCanvas.valid = false;
        catifyCanvas.draw();
    });
    $("#font-size").keyup(function(){
        $(this).trigger("change");
        });
    
    $("#rotatebutton").click(function() {
        if (catifyCanvas.selection) {
            $("#rotatebutton").hide();
            $("#rotateinput").show();
            $("#rotateinput").val(catifyCanvas.selection.rotation);
            $("#rotateinput").focus();
        } else {
            notify("Ничего не выделено", "tools");
        }
        return false;
    });

    $("#rotateinput").change(function(event) {
        rotationChange();
    });

    $("#rotateinput").keyup(function(event) {
        $("#rotateinput").trigger("change");
    });
    $("#rotateinput").focus(function(event) {
        $("#rotateinput").trigger("change");
    });
    $("#rotateinput").blur(function(event) {
        $("#rotateinput").trigger("change");
        $("#rotatebutton").show();
        $("#rotateinput").hide();
    });

    $("#normalsize").click(function(event) {
        if (catifyCanvas.selection)
            catifyCanvas.selection.normalSize();
        catifyCanvas.valid = false;
    });


  $( "#font-face" ).children().each(function() {
    $(this).wrap('<optgroup style="font-family:'+$(this).val()+'"></optgroup>')
                                    });
 $( "#font-face" ).selectable();
 
    $("#loadlink").click(function(event) {
        {
            if ($("#imagelink")[0].validity.valid) {
                //console.log("Validated");
                catifyCanvas.deleteAllShapes();
                catifyCanvas.freeCanvas();
                
                 jQuery("#myCanvas").click(function() {
                    setTimeout(function() {
                        showTextDialog()
                    }, 500);
                });
                jQuery("#myCanvas").dblclick(function() {
                    setTimeout(function() {
                        showTextDialog()
                    }, 500);
                });
                            

                catifyCanvas.loadBackground($("#imagelink").val(), true);
                catifyCanvas.title = "Холст. Открыт адрес:" + $("#imagelink").val();
                afterLoad();
            } else {
                notify("Неправильный адрес", "imagelink");
            }

            return false;
        }
    });

    $("#textmode").click(function() {
        catifyCanvas.mode = 1;
    });

    $(".brush").click(function() {
        catifyCanvas.mode = 0;
    });

    $("#savebuttons").find("button").click(function() {
        catifyCanvas.downloadFile($(this).data("ext"), "#downloadlink");
        return false;
    });
      $("#imgsizewidth").val(catifyCanvas.canvas.width);
      $("#imgsizeheight").val(catifyCanvas.canvas.height);
      
      $("#imgsizewidth").change(function() {
         $("#imgsizeheight").val(Number($("#imgsizewidth").val())/catifyCanvas.canvas.width*catifyCanvas.canvas.height);
    });
    $("#imgsizeheight").change(function() {
         $("#imgsizewidth").val(Number($("#imgsizeheight").val())/catifyCanvas.canvas.width*catifyCanvas.canvas.height);
    });
    
      $("#resizebutton").click(function() {
        catifyCanvas.resizeMe(Math.round(Number($("#imgsizewidth").val())), Math.round(Number($("#imgsizeheight").val())));
         maxCanvWidth = catifyCanvas.width + 80;
        maxCanvHeight = catifyCanvas.height + 100;
    
        if (maxCanvWidth > window.innerWidth - 450) {
            maxCanvWidth = window.innerWidth - 450;
        }
        if (maxCanvHeight > window.innerHeight) {
            maxCanvHeight = window.innerHeight - 50;
        }
      //  console.log(maxCanvHeight);
        $("#canvaswindow").dialog({
            dialogClass: "no-close",
            width: maxCanvWidth,
            height: maxCanvHeight,
            title: catifyCanvas.title,
            position: {}
        });
            
        
    });
    
    setTimeout(function() {
        $(".brush").click(function() {
            catifyCanvas.customPointer.pointerFromImg(this);
        });
        catifyCanvas.customPointer.pointerFromImg(catifyCanvas.brushInstruments.brushes[0]);
    }, 1000);
});
