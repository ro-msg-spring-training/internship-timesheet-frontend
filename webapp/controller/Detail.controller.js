sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../Constants",
	"sap/f/library"
], function (Controller, Constants, fioriLibrary) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Detail", {
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();

			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();

			this.oRouter.getRoute("master").attachPatternMatched(this._onUserMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onUserMatched, this);

			this.oBookingsTable = this.oView.byId("bookingsTable");
		},

		_onUserMatched: function (oEvent) {
			this._user = oEvent.getParameter("arguments").user || this._user || "0";
			this._programName = oEvent.getParameter("arguments").programName || this._programName || "0";

			this._getBookingDetails();
		},

		_getBookingDetails: function () {

			var oModel = new sap.ui.model.json.JSONModel();
			this.oView = this.getView();

			$.ajax({
				type: "GET",
				contentType: "application/json",
				url: Constants.BASE_URL + Constants.BOOKINGS_PATH + "/" + this._user,
				dataType: "json",
				async: false,
				success: function (data, textStatus, jqXHR) {
					oModel.setProperty("/bookingData", data);
				}
			}).done(function (data) {
				console.log(data)
			});

			this.oView.setModel(oModel, "bookings");
		},

		onCreate: function (oEvent) {
			this.oRouter.navTo("createBookingDetail", {
				layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
				user: this._user,
				programName: this._programName
			});
		},
		_deleteBookingDetail: function (idBookingDetail) {
			$.ajax({
				type: "DELETE",
				contentType: "application/json",
				url: Constants.BASE_URL + Constants.BOOKING_DETAILS_PATH + "/" + idBookingDetail,
				dataType: "json",
				async: false,
				success: function (data, textStatus, jqXHR) {
				}
			}).done(function (data) {
				console.log(data)
			});
		},
		onDelete: function (oEvent) {
			var oTable = this.byId("bookingsTable");
			var seletctedItem = oTable.getSelectedIndex();
			var bookingDetailPos = oTable.getContextByIndex(seletctedItem).getPath().split("/")[4];
			var bookingPos = oTable.getContextByIndex(seletctedItem).getPath().split("/")[2];
			var booking = this.oView.getModel("bookings").getData().bookingData;
			var bookingDetailId = booking[bookingPos].bookingDetails[bookingDetailPos].id;
			this._deleteBookingDetail(bookingDetailId);
			this.onInit();
		}

	});
});