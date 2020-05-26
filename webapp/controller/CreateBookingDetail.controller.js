sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../Constants",
	'sap/f/library',
	"sap/m/MessageToast",
	"sap/ui/core/routing/History"
], function (Controller, Constants, fioriLibrary, MessageToast, History) {
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
			this._bookingDay = oEvent.getParameter("arguments").bookingDay || "-1";
			
			
			if (this._bookingDay === "-1") {
				this.getView().byId("datade").setEnabled(true);
				this.getView().byId("datade").setValue("");
			} else{
				this.getView().byId("datade").setValue(this._bookingDay);
				this.getView().byId("datade").setEnabled(false);
			}
			this.getView().byId("TP1").setValue("");
			this.getView().byId("TP2").setValue("");
			this.getView().byId("pspComboBox").setValue("");
			this.getView().byId("description").setValue("");
			
			this._getPsps();
		},

		_getPsps: function (oEvent) {
			this.oView = this.getView();
			var oModel = new sap.ui.model.json.JSONModel();

			$.ajax({
				type: "GET",
				contentType: false,
				url: Constants.BASE_URL + Constants.PROGRAMS_PATH + "/" + this._programName + Constants.PSPS_PATH,
				dataType: "json",
				async: false,
				success: function (data, textStatus, jqXHR) {
					oModel.setProperty("/pspsData", data);
				}
			}).done(function (data) {
			});

			this.oView.setModel(oModel, "psps");
		},
		
		handleHourChange: function () {
			var startTime = this.getView().byId("TP1").getValue();
			var endTime = this.getView().byId("TP2").getValue();
			if(startTime !== "" && endTime !== "") {
				this.getView().byId("TP1").setValueState("None");
				this.getView().byId("TP2").setValueState("None");
				var startData = startTime.split(":");
				var endData = endTime.split(":");
				var hours = parseInt(endData[0]) - parseInt(startData[0]);
				var minutes = parseInt(endData[1]) - parseInt(startData[1]);
				if(minutes < 0){
					hours = hours - 1;
					minutes += 60;
				}
				if(!isNaN(hours) && !isNaN(minutes)){
					if(hours < 0) {
						this.getView().byId("TP1").setValueState("Error");
						this.getView().byId("TP1").setValueStateText("Start hour greater than end hour");
						this.getView().byId("TP2").setValueState("Error");
						this.getView().byId("TP2").setValueStateText("Start hour greater than end hour");
						this.getView().byId("hours").setValue(" ");
						this.getView().byId("createButton").setEnabled(false);
					} else {
						this.getView().byId("createButton").setEnabled(true);
						if(minutes < 10) {
							this.getView().byId("hours").setValue(hours +":0"+minutes);
						} else {
							this.getView().byId("hours").setValue(hours +":"+minutes);
						}
					}

				}
			} else {
				this.getView().byId("createButton").setEnabled(false);
				if(startTime.length < 1)this.getView().byId("TP1").setValueState("Error");
				this.getView().byId("TP1").setValueStateText("Invalid entry");
				if(endTime.length < 1)this.getView().byId("TP2").setValueState("Error");
				this.getView().byId("TP2").setValueStateText("Invalid entry");
				this.getView().byId("hours").setValue(" ");
			}
		},
		
		onCreate: function () {
			var date = this.getView().byId("datade").getValue();
			var startTime = this.getView().byId("TP1").getValue();
			var endTime = this.getView().byId("TP2").getValue();
			var pspName = this.getView().byId("pspComboBox").getValue();
			var description = this.getView().byId("description").getValue();
			var hours = this.getView().byId("hours").getValue();
			var pspId = this.getView().byId("pspComboBox").getSelectedKey();
			var userId = this._user;


			var myformData = new FormData();
			myformData.append("startHour", startTime);
			myformData.append("endHour", endTime);
			myformData.append("pspName", pspName);
			myformData.append("day", date);
			myformData.append("bookingId", -1);
			myformData.append("pspId", pspId);
			myformData.append("userId", userId);
			myformData.append("description", description);

			$.ajax({
				type: "POST",
				processData: false,
				contentType: false,
				data: myformData,
				url: Constants.BASE_URL + Constants.BOOKING_DETAIL_PATH,
				async: false,
				success: function (data, textStatus, jqXHR) {
					history.go(-1);
				},
    			error: function (e,xhr,textStatus,err,data) {
    				MessageToast.show("Hours overlap with another booking detail!");
				}
			});
		}
	});
});