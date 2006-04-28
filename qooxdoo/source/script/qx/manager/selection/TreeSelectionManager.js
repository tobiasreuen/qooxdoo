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

#package(tree)

************************************************************************ */

qx.OO.defineClass("qx.manager.selection.TreeSelectionManager", qx.manager.selection.SelectionManager, 
function(vBoundedWidget) {
  qx.manager.selection.SelectionManager.call(this, vBoundedWidget);
});

/*!
Should multiple selection be allowed?
*/
qx.OO.changeProperty({ name : "multiSelection", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
Enable drag selection?
*/
qx.OO.changeProperty({ name : "dragSelection", type : qx.constant.Type.BOOLEAN, defaultValue : false });





/*
---------------------------------------------------------------------------
  MAPPING TO BOUNDED WIDGET
---------------------------------------------------------------------------
*/

qx.Proto._getFirst = function() {
  return qx.lang.Array.getFirst(this.getItems());
};

qx.Proto._getLast = function() {
  return qx.lang.Array.getLast(this.getItems());
};

qx.Proto.getItems = function() {
  return this.getBoundedWidget().getItems();
};

qx.Proto.getNext = function(vItem)
{
  if (vItem)
  {
    if (qx.ui.tree.Tree.isOpenTreeFolder(vItem))
    {
      return vItem.getFirstVisibleChildOfFolder();
    }
    else if (vItem.isLastVisibleChild())
    {
      var vCurrent = vItem;

      while(vCurrent && vCurrent.isLastVisibleChild()) {
        vCurrent = vCurrent.getParentFolder();
      };

      if (vCurrent && vCurrent instanceof qx.ui.tree.AbstractTreeElement && vCurrent.getNextVisibleSibling() && vCurrent.getNextVisibleSibling() instanceof qx.ui.tree.AbstractTreeElement) {
        return vCurrent.getNextVisibleSibling();
      };
    }
    else
    {
      return vItem.getNextVisibleSibling();
    };
  }
  else
  {
    return this.getBoundedWidget().getFirstTreeChild();
  };
};

qx.Proto.getPrevious = function(vItem)
{
  if (vItem)
  {
    if (vItem == this.getBoundedWidget())
    {
      return;
    }
    else if (vItem.isFirstVisibleChild())
    {
      if (vItem.getParentFolder() instanceof qx.ui.tree.TreeFolder) {
        return vItem.getParentFolder();
      };
    }
    else
    {
      var vPrev = vItem.getPreviousVisibleSibling();

      while (vPrev instanceof qx.ui.tree.AbstractTreeElement)
      {
        if (qx.ui.tree.Tree.isOpenTreeFolder(vPrev))
        {
          vPrev = vPrev.getLastVisibleChildOfFolder();
        }
        else
        {
          break;
        };
      };

      return vPrev;
    };
  }
  else
  {
    return this.getBoundedWidget().getLastTreeChild();
  };
};







/*
---------------------------------------------------------------------------
  MAPPING TO ITEM DIMENSIONS
---------------------------------------------------------------------------
*/

qx.Proto.getItemTop = function(vItem)
{
  // Alternate method:
  // return qx.dom.DomLocation.getPageBoxTop(vItem.getElement()) - qx.dom.DomLocation.getPageInnerTop(this.getBoundedWidget().getElement());

  var vBoundedWidget = this.getBoundedWidget();
  var vElement = vItem.getElement();
  var vOffset = 0;

  while (vElement && vElement._QxWidget != vBoundedWidget)
  {
    vOffset += vElement.offsetTop;
    vElement = vElement.parentNode;
  };

  return vOffset;
};

qx.Proto.getItemHeight = function(vItem)
{
  if (vItem instanceof qx.ui.tree.TreeFolder && vItem._horizontalLayout)
  {
    return vItem._horizontalLayout.getOffsetHeight();
  }
  else
  {
    return vItem.getOffsetHeight();
  };
};

qx.Proto.scrollItemIntoView = function(vItem)
{
  if (vItem instanceof qx.ui.tree.TreeFolder && vItem._horizontalLayout)
  {
    return vItem._horizontalLayout.scrollIntoView();
  }
  else
  {
    return vItem.scrollIntoView();
  };
};





/*
---------------------------------------------------------------------------
  ITEM STATE MANAGMENT
---------------------------------------------------------------------------
*/

qx.Proto.renderItemSelectionState = function(vItem, vIsSelected) {
  vItem.setSelected(vIsSelected);
};