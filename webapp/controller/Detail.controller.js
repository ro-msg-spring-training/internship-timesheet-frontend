sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../Constants",
	"sap/f/library",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History"
], function (Controller, Constants, fioriLibrary, MessageToast, History) {
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
				contentType: false,
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
			var oTable = this.byId("bookingsTable");
			var selectedItem = oTable.getSelectedIndex();
			if (selectedItem > 0)
				var bookingPos = oTable.getContextByIndex(selectedItem).getPath().split("/")[2];

			var booking = this.oView.getModel("bookings").getData().bookingData;
			var bookingDay;
			if (bookingPos !== undefined){
				bookingDay = booking[bookingPos].day;
			}
			else {
				bookingDay = -1;
			}
				
			this.oRouter.navTo("createBookingDetail", {
				layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
				user: this._user,
				programName: this._programName,
				bookingDay: bookingDay
			});
		
		},
		
		_deleteBookingDetail: function (idBookingDetail) {
			$.ajax({
				type: "DELETE",
				contentType: false,
				url: Constants.BASE_URL + Constants.BOOKING_DETAIL_PATH + "/" + idBookingDetail,
				dataType: "json",
				async: false,
				success: function (data, textStatus, jqXHR) {}
			}).done(function (data) {});
		},
		onDelete: function (oEvent) {
			var oTable = this.byId("bookingsTable");
			var aSelectedIndices = oTable.getSelectedIndices();
			if (aSelectedIndices.length === 0) {
				MessageToast.show("Select at least one booking detail first!");
				return;
			}
			for (var j = 0; j < aSelectedIndices.length; j++) {
				var bookingDetailPosition = oTable.getContextByIndex(aSelectedIndices[j]).getPath().split("/")[4];
				if (bookingDetailPosition === undefined) {
					MessageToast.show("Select just booking details, please!");
					return;
				}
			}
			for (var i = 0; i < aSelectedIndices.length; i++) {
				var bookingDetailPos = oTable.getContextByIndex(aSelectedIndices[i]).getPath().split("/")[4];
				var bookingPos = oTable.getContextByIndex(aSelectedIndices[i]).getPath().split("/")[2];
				var booking = this.oView.getModel("bookings").getData().bookingData;
				var bookingDetailId = booking[bookingPos].bookingDetails[bookingDetailPos].id;
				this._deleteBookingDetail(bookingDetailId);
				history.go();
			}
		},
		onMakeEditable: function (oEvent) {
			var oTable = this.getView().byId("bookingsTable");
			var selectedItem = oTable.getSelectedIndex();

			var iBookingDetailPos;
			var iPos = 0;
			for (var i = 0; i <= parseInt(selectedItem); i++) {
				iBookingDetailPos = oTable.getContextByIndex(selectedItem).getPath().split("/")[4];
				iPos++;
			}

			console.log(iPos);

			var aItems = oTable.getRows();

			console.log(aItems);

			for (var i = 0; i < aItems.length; i++) {
				if (i == selectedItem) {
					aItems[i].getCells()[0].setEnabled(true);
					aItems[i].getCells()[1].setEnabled(true);
					aItems[i].getCells()[2].setEnabled(true);
					aItems[i].getCells()[4].setEnabled(true);
					aItems[i].getCells()[5].setEnabled(true);

					console.log(aItems[i].getCells());
				} else {
					aItems[i].getCells()[0].setEnabled(false);
					aItems[i].getCells()[1].setEnabled(false);
					aItems[i].getCells()[2].setEnabled(false);
					aItems[i].getCells()[4].setEnabled(false);
					aItems[i].getCells()[5].setEnabled(false);
				}
			}

		}

	});
});