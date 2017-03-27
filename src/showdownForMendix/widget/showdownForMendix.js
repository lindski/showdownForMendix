define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "showdownForMendix/lib/showdown",
    "dojo/text!showdownForMendix/widget/template/showdownForMendix.html"
], function (declare, _WidgetBase, _TemplatedMixin, dojoStyle, dojoConstruct, dojoArray, dojoLang, _showdown, widgetTemplate) {
    "use strict";

    var showdown = _showdown.createInstance();

    return declare("showdownForMendix.widget.showdownForMendix", [ _WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,

        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        resize: function (box) {
          logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
          logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");                
                
                var converter = new showdown.Converter(/*TODO... add support to widget for configurable options*/),
                    text      = this._contextObj.get(this.markdownContentAttribute),
                    html      = dojoConstruct.toDom(converter.makeHtml(text));

                dojoConstruct.place(html, this.showdownContainer, "only");

            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            mendix.lang.nullExec(callback);
        },

        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            if (this._handles) {
                dojoArray.forEach(this._handles, function (handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }

            // When a mendix object exists create subscriptions.
            if (this._contextObj) {
                var objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });

                var attributeHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.markdownContentAttribute,
                    callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                this._handles = [ objectHandle, attributeHandle ];
            }
        }
    });
});

require(["showdownForMendix/widget/showdownForMendix"]);
