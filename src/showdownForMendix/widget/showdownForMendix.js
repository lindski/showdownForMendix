define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/query",
    "dojo/dom-class",
    "dojo/on",
    "showdownForMendix/lib/showdown",
    "dojo/text!showdownForMendix/widget/template/showdownForMendix.html"
], function (declare, _WidgetBase, _TemplatedMixin, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoQuery, dojoClass, dojoOn, _showdown, widgetTemplate) {
    "use strict";

    var showdown = _showdown.createInstance();

    return declare("showdownForMendix.widget.showdownForMendix", [ _WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,

        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _converter: null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");

            // adjust the template based on the display settings.
            if( this.showLabel ) {
                if(this.formOrientation === "horizontal"){
                    // width needs to be between 1 and 11
                    var labelWidth = this.labelWidth < 1 ? 1 : this.labelWidth;
                    labelWidth = this.labelWidth > 11 ? 11 : this.labelWidth;

                    var controlWidth = 12 - labelWidth,                    
                        labelClass = 'col-sm-' + labelWidth,
                        controlClass = 'col-sm-' + controlWidth;

                    dojoClass.add(this.showdownLabel, labelClass);
                    dojoClass.add(this.showdownInputContainer, controlClass);
                }

                this.showdownLabel.innerHTML = this.fieldCaption;
            }
            else {
                dojoClass.remove(this.showdownContainer, "form-group");
                dojoConstruct.destroy(this.showdownLabel);
            } 
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;
            var self = this;

            this._converter = new showdown.Converter(/*TODO... add support to widget for configurable options*/);

            // set default value
            var currentValue = this._contextObj.get(this.markdownContentAttribute);
            this.showdownInput.value = currentValue;
            this._updateMarkdown(currentValue);  

            dojoOn(this.showdownInput,"change", function(e){
                var markdown = e.target.value;
                self._contextObj.set(self.markdownContentAttribute, markdown);
                self._updateMarkdown(markdown);
            });
            
            if(this.enableLiveUpdate){
                dojoOn(this.showdownInput,"keyup", function(e){
                    var markdown = e.target.value;
                    self._contextObj.set(self.markdownContentAttribute, markdown);
                    self._updateMarkdown(markdown);
                });
            }
            
            this._resetSubscriptions();
            this._executeCallback(callback, "update");
        },

        resize: function (box) {
          logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
          logger.debug(this.id + ".uninitialize");
        },

        _updateMarkdown: function (markdown) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");                
                
                var html      = this._converter.makeHtml(markdown);
                
                if( this.convertedHtmlAttribute ){
                    this._contextObj.set(this.convertedHtmlAttribute, html);
                }

            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }
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
                        var markdown = this._contextObj.get(this.markdownContentAttribute);
                        this.showdownInput.value = markdown;
                        this._updateMarkdown(markdown);                       
                    })
                });

                var attributeHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.markdownContentAttribute,
                    callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                        this.showdownInput.value = attrValue;
                        this._updateMarkdown(attrValue);
                    })
                });

                this._handles = [ objectHandle, attributeHandle ];
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["showdownForMendix/widget/showdownForMendix"]);
