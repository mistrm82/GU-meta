// (C) Wolfgang Huber 2010-2011

// Script parameters - these are set up by R in the function 'writeReport' when copying the 
//   template for this script from arrayQualityMetrics/inst/scripts into the report.

var highlightInitial = [ false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false ];
var arrayMetadata    = [ [ "1", "GSM875083", "embryo.brain.rep1", "embryo", "brain", "1" ], [ "2", "GSM875084", "embryo.brain.rep2", "embryo", "brain", "2" ], [ "3", "GSM875085", "embryo.brain.rep3", "embryo", "brain", "3" ], [ "4", "GSM875086", "embryo.brain.rep4", "embryo", "brain", "4" ], [ "5", "GSM875087", "embryo.brain.rep5", "embryo", "brain", "5" ], [ "6", "GSM875088", "pup.brain.rep.1", "pup", "brain", "1" ], [ "7", "GSM875089", "pup.brain.rep.2", "pup", "brain", "2" ], [ "8", "GSM875090", "pup.brain.rep.3", "pup", "brain", "3" ], [ "9", "GSM875091", "pup.brain.rep.4", "pup", "brain", "4" ], [ "10", "GSM875092", "pup.brain.rep.5", "pup", "brain", "5" ], [ "11", "GSM875093", "adult.brain.rep.1", "adult", "brain", "1" ], [ "12", "GSM875094", "adult.brain.rep.2", "adult", "brain", "2" ], [ "13", "GSM875095", "adult.brain.rep.3", "adult", "brain", "3" ], [ "14", "GSM875096", "adult.brain.rep.4", "adult", "brain", "4" ], [ "15", "GSM875097", "adult.brain.rep.5", "adult", "brain", "5" ], [ "16", "GSM875098", "embryo.liver.lung.rep1", "embryo", "liver/lung", "1" ], [ "17", "GSM875099", "embryo.liver.lung.rep2", "embryo", "liver/lung", "2" ], [ "18", "GSM875100", "embryo.liver.lung.rep3", "embryo", "liver/lung", "3" ], [ "19", "GSM875101", "embryo.liver.lung.rep4", "embryo", "liver/lung", "4" ], [ "20", "GSM875102", "embryo.liver.lung.rep5", "embryo", "liver/lung", "5" ], [ "21", "GSM875103", "pup.liver.lung.rep.1", "pup", "liver/lung", "1" ], [ "22", "GSM875104", "pup.liver.lung.rep.2", "pup", "liver/lung", "2" ], [ "23", "GSM875105", "pup.liver.lung.rep.3", "pup", "liver/lung", "3" ], [ "24", "GSM875106", "pup.liver.lung.rep.4", "pup", "liver/lung", "4" ], [ "25", "GSM875107", "pup.liver.lung.rep.5", "pup", "liver/lung", "5" ], [ "26", "GSM875108", "adult.liver.lung.rep.1", "adult", "liver/lung", "1" ], [ "27", "GSM875109", "adult.liver.lung.rep.2", "adult", "liver/lung", "2" ], [ "28", "GSM875110", "adult.liver.lung.rep.3", "adult", "liver/lung", "3" ], [ "29", "GSM875111", "adult.liver.lung.rep.4", "adult", "liver/lung", "4" ] ];
var svgObjectNames   = [ "pca", "dens" ];

var cssText = ["stroke-width:1; stroke-opacity:0.4",
               "stroke-width:3; stroke-opacity:1" ];

// Global variables - these are set up below by 'reportinit'
var tables;             // array of all the associated ('tooltips') tables on the page
var checkboxes;         // the checkboxes
var ssrules;


function reportinit() 
{
 
    var a, i, status;

    /*--------find checkboxes and set them to start values------*/
    checkboxes = document.getElementsByName("ReportObjectCheckBoxes");
    if(checkboxes.length != highlightInitial.length)
	throw new Error("checkboxes.length=" + checkboxes.length + "  !=  "
                        + " highlightInitial.length="+ highlightInitial.length);
    
    /*--------find associated tables and cache their locations------*/
    tables = new Array(svgObjectNames.length);
    for(i=0; i<tables.length; i++) 
    {
        tables[i] = safeGetElementById("Tab:"+svgObjectNames[i]);
    }

    /*------- style sheet rules ---------*/
    var ss = document.styleSheets[0];
    ssrules = ss.cssRules ? ss.cssRules : ss.rules; 

    /*------- checkboxes[a] is (expected to be) of class HTMLInputElement ---*/
    for(a=0; a<checkboxes.length; a++)
    {
	checkboxes[a].checked = highlightInitial[a];
        status = checkboxes[a].checked; 
        setReportObj(a+1, status, false);
    }

}


function safeGetElementById(id)
{
    res = document.getElementById(id);
    if(res == null)
        throw new Error("Id '"+ id + "' not found.");
    return(res)
}

/*------------------------------------------------------------
   Highlighting of Report Objects 
 ---------------------------------------------------------------*/
function setReportObj(reportObjId, status, doTable)
{
    var i, j, plotObjIds, selector;

    if(doTable) {
	for(i=0; i<svgObjectNames.length; i++) {
	    showTipTable(i, reportObjId);
	} 
    }

    /* This works in Chrome 10, ssrules will be null; we use getElementsByClassName and loop over them */
    if(ssrules == null) {
	elements = document.getElementsByClassName("aqm" + reportObjId); 
	for(i=0; i<elements.length; i++) {
	    elements[i].style.cssText = cssText[0+status];
	}
    } else {
    /* This works in Firefox 4 */
	var success = false;
	i = 0; 
	/* Some of this looping could already be cached in reportInit() */
	while( (!success) & (i < ssrules.length) ) {
	    selector = ssrules[i].selectorText;  // The selector 
            if (!selector) 
		continue; // Skip @import and other nonstyle rules
            if (selector == (".aqm" + reportObjId)) {
		success = true; 
		ssrules[i].style.cssText = cssText[0+status];
	    } else {
		i++;
	    }
	}
    }

}

/*------------------------------------------------------------
   Display of the Metadata Table
  ------------------------------------------------------------*/
function showTipTable(tableIndex, reportObjId)
{
    var rows = tables[tableIndex].rows;
    var a = reportObjId - 1;

    if(rows.length != arrayMetadata[a].length)
	throw new Error("rows.length=" + rows.length+"  !=  arrayMetadata[array].length=" + arrayMetadata[a].length);

    for(i=0; i<rows.length; i++) 
 	rows[i].cells[1].innerHTML = arrayMetadata[a][i];
}

function hideTipTable(tableIndex)
{
    var rows = tables[tableIndex].rows;

    for(i=0; i<rows.length; i++) 
 	rows[i].cells[1].innerHTML = "";
}


/*------------------------------------------------------------
  From module 'name' (e.g. 'density'), find numeric index in the 
  'svgObjectNames' array.
  ------------------------------------------------------------*/
function getIndexFromName(name) 
{
    var i;
    for(i=0; i<svgObjectNames.length; i++)
        if(svgObjectNames[i] == name)
	    return i;

    throw new Error("Did not find '" + name + "'.");
}


/*------------------------------------------------------------
  SVG plot object callbacks
  ------------------------------------------------------------*/
function plotObjRespond(what, reportObjId, name)
{

    var a, i, status;

    switch(what) {
    case "show":
	i = getIndexFromName(name);
	showTipTable(i, reportObjId);
	break;
    case "hide":
	i = getIndexFromName(name);
	hideTipTable(i);
	break;
    case "click":
        a = reportObjId - 1;
	status = !checkboxes[a].checked;
	checkboxes[a].checked = status;
	setReportObj(reportObjId, status, true);
	break;
    default:
	throw new Error("Invalid 'what': "+what)
    }
}

/*------------------------------------------------------------
  checkboxes 'onchange' event
------------------------------------------------------------*/
function checkboxEvent(reportObjId)
{
    var a = reportObjId - 1;
    var status = checkboxes[a].checked;
    setReportObj(reportObjId, status, true);
}


/*------------------------------------------------------------
  toggle visibility
------------------------------------------------------------*/
function toggle(id){
  var head = safeGetElementById(id + "-h");
  var body = safeGetElementById(id + "-b");
  var hdtxt = head.innerHTML;
  var dsp;
  switch(body.style.display){
    case 'none':
      dsp = 'block';
      hdtxt = '-' + hdtxt.substr(1);
      break;
    case 'block':
      dsp = 'none';
      hdtxt = '+' + hdtxt.substr(1);
      break;
  }  
  body.style.display = dsp;
  head.innerHTML = hdtxt;
}
