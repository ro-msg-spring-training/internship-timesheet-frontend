sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../Constants",
	'sap/f/library',
	"sap/ui/core/routing/History"
], function (Controller, Constants, fioriLibrary, History) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.CreateBookingDetail", {
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();

			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();

			this.oRouter.getRoute("master").attachPatternMatched(this._onUserMatched, this);
			this.oRouter.getRoute("createBookingDetail").attachPatternMatched(this._onUserMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onUserMatched, this);
		},
		
		_onUserMatched: function (oEvent) {
			this._user = oEvent.getParameter("arguments").user || this._user || "0";
			this._programName = oEvent.getParameter("arguments").programName || this._programName || "0";
			this._bookingId = oEvent.getParameter("arguments").bookingId || this._bookingId || "0";
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
		},
		
		onCreate: function(){
			var date = this.getView().byId("datade").getValue();
			var startTime = this.getView().byId("TP1").getValue();
			var endTime = this.getView().byId("TP2").getValue();
			var pspName = this.getView().byId("pspComboBox").getValue();
			var description = this.getView().byId("description").getValue();
			var hours = endTime - startTime;
			var pspId = this.getView().byId("pspComboBox").getSelectedKey();
			var userId = this._user;
			var bookingId = this._bookingId;
			
			$.ajax({
				type: "POST",
				contentType: "application/json",
				url: Constants.BASE_URL + Constants.BOOKING_DETAIL_PATH,                 
				dataType: "json",
				data: JSON.stringify({ "description": description,
					"startHour": startTime,
					"endHour": endTime,
					"pspName": pspName,
					"date": date,
					"bookingId": bookingId,
					"pspId": pspId,
					"userId": userId }),
				async: false, 
				success: function (data, textStatus, jqXHR) {
					history.go(-1);
				}
			});
		}
	});
});