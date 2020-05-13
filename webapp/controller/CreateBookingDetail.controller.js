sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../Constants"
], function (Controller, Constants) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.CreateBookingDetail", {
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();

			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();

			this.oRouter.getRoute("master").attachPatternMatched(this._onUserMatched, this);
			this.oRouter.getRoute("createBookingDetail").attachPatternMatched(this._onUserMatched, this);
		},
		
		_onUserMatched: function (oEvent) {
			this._user = oEvent.getParameter("arguments").user || this._user || "0";
			this._programName = oEvent.getParameter("arguments").programName || this._programName || "0";

			this._getPsps();
		},
		
		_getPsps: function(oEvent) {
			this.oView = this.getView();
			var oModel = new sap.ui.model.json.JSONModel();
			
			$.ajax({
				type: "GET",
				contentType: "application/json",
				url: Constants.BASE_URL + Constants.PROGRAMS_PATH + "/" + this._programName + Constants.PSPS_PATH,                 
				dataType: "json",
				async: false, 
				success: function (data, textStatus, jqXHR) {
					oModel.setProperty("/pspsData", data);
				}
			}).done(function(data){console.log(data)});
			
			this.oView.setModel(oModel, "psps");
		}
	});
});