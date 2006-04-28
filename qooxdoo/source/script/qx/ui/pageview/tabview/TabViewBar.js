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

#package(tabview)
#require(qx.manager.selection.RadioManager)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.tabview.TabViewBar", qx.ui.pageview.AbstractPageViewBar, 
function()
{
  qx.ui.pageview.AbstractPageViewBar.call(this);

  this.setZIndex(2);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "tab-view-bar" });
