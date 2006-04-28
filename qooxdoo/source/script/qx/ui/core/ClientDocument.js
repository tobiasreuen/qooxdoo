/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(guicore)
#require(qx.dom.DomStyleSheet)
#use(qx.ui.core.ClientDocumentBlocker)
#use(qx.event.handler.FocusHandler)

************************************************************************ */

/*!
  This is the basic widget of all qooxdoo applications.

  qx.ui.core.ClientDocument is the parent of all children inside your application. It
  also handles their resizing and focus navigation. This widget will be automatically
  created through qx.client.ClientWindow.
*/
qx.OO.defineClass("qx.ui.core.ClientDocument", qx.ui.layout.CanvasLayout, 
function(vClientWindow)
{
  this._window = vClientWindow;
  this._document = this._window.getElement().document;

  // Init element
  this.setElement(this._document.body);

  // Needed hard-coded because otherwise the client document
  // would not be added initially to the state queue
  this.addToStateQueue();

  qx.ui.layout.CanvasLayout.call(this);

  // Don't use widget styles
  this._styleProperties = {};

  // Configure as focus root
  this.activateFocusRoot();

  // Cache current size
  this._cachedInnerWidth = this._document.body.offsetWidth;
  this._cachedInnerHeight = this._document.body.offsetHeight;

  // Add Resize Handler
  this.addEventListener(qx.Const.EVENT_TYPE_RESIZE, this._onresize);

  // Blocker and Dialog Support
  this._blocker = new qx.ui.core.ClientDocumentBlocker;
  this._modalWidgets = [];
  this._modalNativeWindow = null;

  // Blocker Events
  this._blocker.addEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this.blockHelper, this);
  this._blocker.addEventListener(qx.Const.EVENT_TYPE_MOUSEUP, this.blockHelper, this);

  this.add(this._blocker);

  // Init Resize Helper
  /*
  if (qx.sys.Client.isGecko())
  {
    var o = this;
    this._resizeHelper = window.setInterval(function() { o._onresizehelper() }, 100);
  };
  */
});

qx.OO.addProperty({ name : "globalCursor", type : qx.constant.Type.STRING });

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "client-document" });





/*
---------------------------------------------------------------------------
  OVERWRITE WIDGET FUNCTIONS/PROPERTIES
---------------------------------------------------------------------------
*/

qx.Proto._modifyParent = qx.util.Return.returnTrue;
qx.Proto._modifyVisible = qx.util.Return.returnTrue;

qx.Proto._modifyElement = function(propValue, propOldValue, propData)
{
  this._isCreated = qx.util.Validation.isValidElement(propValue);

  if (propOldValue)
  {
    propOldValue._QxWidget = null;
  };

  if (propValue)
  {
    // add reference to widget instance
    propValue._QxWidget = this;

    // link element and style reference
    this._element = propValue;
    this._style = propValue.style;
  }
  else
  {
    this._element = null;
    this._style = null;
  };

  return true;
};

qx.Proto.getWindow = function() { return this._window; };
qx.Proto.getTopLevelWidget = qx.util.Return.returnThis;
qx.Proto.getDocumentElement = function() { return this._document; };
qx.Proto.getEventManager = function() { return this.getWindow().getEventManager(); };

qx.Proto.getParent = qx.Proto.getToolTip = qx.util.Return.returnNull;
qx.Proto.isMaterialized = qx.Proto.isSeeable = qx.util.Return.returnTrue;

qx.Proto._isDisplayable = true;
qx.Proto._hasParent = false;
qx.Proto._initialLayoutDone = true;









/*
---------------------------------------------------------------------------
  BLOCKER AND DIALOG SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.blockHelper = function(e)
{
  if (this._modalNativeWindow)
  {
    try
    {
      this._modalNativeWindow._window.focus();
    }
    catch(ex)
    {
      this.debug("Window seems to be closed already! => Releasing Blocker: (" + e.getType() + ")", ex);
      this.release(this._modalNativeWindow);
    };
  };
};

qx.Proto.block = function(vActiveChild)
{
  // this.debug("BLOCK: " + vActiveChild.toHashCode());

  this._blocker.show();

  if (typeof qx.ui.window.Window === qx.constant.Type.FUNCTION && vActiveChild instanceof qx.ui.window.Window)
  {
    this._modalWidgets.push(vActiveChild);

    var vOrigIndex = vActiveChild.getZIndex();
    this._blocker.setZIndex(vOrigIndex);
    vActiveChild.setZIndex(vOrigIndex+1);
  }
  else if (typeof qx.client.NativeWindow === qx.constant.Type.FUNCTION && vActiveChild instanceof qx.client.NativeWindow)
  {
    this._modalNativeWindow = vActiveChild;
    this._blocker.setZIndex(1e7);
  };
};

qx.Proto.release = function(vActiveChild)
{
  // this.debug("RELEASE: " + vActiveChild.toHashCode());

  if (vActiveChild)
  {
    if (typeof qx.client.NativeWindow === qx.constant.Type.FUNCTION && vActiveChild instanceof qx.client.NativeWindow)
    {
      this._modalNativeWindow = null;
    }
    else
    {
      qx.lang.Array.remove(this._modalWidgets, vActiveChild);
    };
  };

  var l = this._modalWidgets.length;
  if (l == 0)
  {
    this._blocker.hide();
  }
  else
  {
    var oldActiveChild = this._modalWidgets[l-1];

    var o = oldActiveChild.getZIndex();
    this._blocker.setZIndex(o);
    oldActiveChild.setZIndex(o+1);
  };
};








/*
---------------------------------------------------------------------------
  CSS API
---------------------------------------------------------------------------
*/

qx.Proto.createStyleElement = function(vCssText) {
  return qx.dom.DomStyleSheet.createElement(vCssText);
};

qx.Proto.addCssRule = function(vSheet, vSelector, vStyle) {
  return qx.dom.DomStyleSheet.addRule(vSheet, vSelector, vStyle);
};

qx.Proto.removeCssRule = function(vSheet, vSelector) {
  return qx.dom.DomStyleSheet.removeRule(vSheet, vSelector);
};

qx.Proto.removeAllCssRules = function(vSheet) {
  return qx.dom.DomStyleSheet.removeAllRules(vSheet);
};






/*
---------------------------------------------------------------------------
  CSS FIX
---------------------------------------------------------------------------
*/

qx.dom.DomStyleSheet.createElement("html,body{margin:0;border:0;padding:0;} html{border:0 none;} *{box-sizing:border-box;-moz-box-sizing: border-box;} img{box-sizing:content-box;-moz-box-sizing:content-box;}");

if (qx.core.Settings.enableApplicationLayout) {
  qx.dom.DomStyleSheet.createElement("html,body{width:100%;height:100%;overflow:hidden;}");
};





/*
---------------------------------------------------------------------------
  GLOBAL CURSOR SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto._modifyGlobalCursor = function(propValue, propOldValue, propData)
{
  if (!this._globalCursorStyleSheet) {
    this._globalCursorStyleSheet = this.createStyleElement();
  };

  // Selector based remove does not work with the "*" selector in mshtml
  // this.removeCssRule(this._globalCursorStyleSheet, qx.constant.Core.STAR);

  this.removeAllCssRules(this._globalCursorStyleSheet);

  if (propValue) {
    this.addCssRule(this._globalCursorStyleSheet, qx.constant.Core.STAR, "cursor:" + propValue + " !important");
  };

  return true;
};





/*
---------------------------------------------------------------------------
  WINDOW RESIZE HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._onresize = function(e)
{
  // Hide popups, tooltips, ...
  if (typeof qx.manager.object.PopupManager !== qx.constant.Type.UNDEFINED) {
    qx.manager.object.PopupManager.update();
  };

  // Update children
  this._recomputeInnerWidth();
  this._recomputeInnerHeight();

  // Flush queues
  qx.ui.core.Widget.flushGlobalQueues();
};

// This was an idea to allow mozilla more realtime document resize updates
// but it seems so, that mozilla stops javascript execution while the user
// resize windows. Bad.

/*
qx.Proto._onresizehelper = function()
{
  // Test for changes
  var t1 = this._recomputeInnerWidth();
  var t2 = this._recomputeInnerHeight();

  // Flush queues
  if (t1 || t2) {
    qx.ui.core.Widget.flushGlobalQueues();
  };
};
*/

qx.Proto._computeInnerWidth = function() {
  return this._document.body.offsetWidth;
};

qx.Proto._computeInnerHeight = function() {
  return this._document.body.offsetHeight;
};







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  delete this._window;
  delete this._document;
  delete this._modalWidgets;
  delete this._modalNativeWindow;

  this._globalCursorStyleSheet = null;

  if (this._blocker)
  {
    this._blocker.removeEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this.blockHelper, this);
    this._blocker.removeEventListener(qx.Const.EVENT_TYPE_MOUSEUP, this.blockHelper, this);

    this._blocker.dispose();
    this._blocker = null;
  };

  /*
  if (this._resizeHelper)
  {
    window.clearInterval(this._resizeHelper);
    this._resizeHelper = null;
  };
  */

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
};
