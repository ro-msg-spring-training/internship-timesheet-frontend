sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../Constants",
	"sap/f/library",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"sap/m/MenuItem",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, Constants, fioriLibrary, MessageToast, History, MenuItem, Filter, FilterOperator) {
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
			var oNewView = this.oView;
			
			$.ajax({
				type: "GET",
				contentType: false,
				url: Constants.BASE_URL + Constants.BOOKINGS_PATH + "/" + this._user,
				dataType: "json",
				async: false,
				success: function (data, textStatus, jqXHR) {
					oModel.setProperty("/bookingData", data);
				}
			}).done(function (data) {});

			$.ajax({
				type: "GET",
				contentType: false,
				url: Constants.BASE_URL + Constants.PROGRAMS_PATH + "/" + this._programName + Constants.PSPS_PATH,
				dataType: "json",
				async: false,
				success: function (data, textStatus, jqXHR) {
					oModel.setProperty("/pspsData", data);
				}
			}).done(function (data) {});

			this.oView.setModel(oModel, "bookings");
			this._setFilterByMonth();
			
		},

		_setFilterByMonth: function () {
			var aYears = [];
			var oBookings = this.oView.getModel("bookings").getData().bookingData;
			const monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];

			for (var booking_index in oBookings) {
				var date = new Date(oBookings[booking_index].day);
				var month = monthNames[date.getMonth()];
				var year = date.getFullYear().toString();

				var foundYear = undefined;

				for (var year_index in aYears) {
					if (aYears[year_index].year === year) {
						foundYear = aYears[year_index];
						break;
					}
				}

				var isNewMonth = 1;

				if (foundYear !== undefined) {
					for (var month_index in foundYear.months) {
						if (foundYear.months[month_index].month === month) {
							isNewMonth = 0;
							break;
						}
					}

					if (isNewMonth === 1) {
						aYears[year_index].months.push({
							month: month
						});
					}
				}

				if (foundYear === undefined) {
					aYears.push({
						year: year,
						months: [{
							month: month
						}]
					});
				}
			}

			// console.log(aYears);
			this.oView.getModel("bookings").setProperty("/filterData", aYears);
		},

		onCreate: function (oEvent) {
			var oTable = this.byId("bookingsTable");
			var selectedItem = oTable.getSelectedIndex();
			if (selectedItem > 0)
				var bookingPos = oTable.getContextByIndex(selectedItem).getPath().split("/")[2];

			var booking = this.oView.getModel("bookings").getData().bookingData;
			var bookingDay;
			if (bookingPos !== undefined) {
				bookingDay = booking[bookingPos].day;
			} else {
				bookingDay = -1;
			}

			this.oRouter.navTo("createBookingDetail", {
				layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
				user: this._user,
				programName: this._programName,
				bookingDay: bookingDay
			});

		},

		onCheck: function (oEvent) {
			var oTable = this.byId("bookingsTable");
			var aSelectedIndices = oTable.getSelectedIndices();
			if (aSelectedIndices.length === 0) {
				this.getView().byId("deleteButton").setEnabled(false);
				this.getView().byId("editButton").setEnabled(false);
				this.getView().byId("saveButton").setEnabled(false);
				return;
			}
			for (var j = 0; j < aSelectedIndices.length; j++) {
				var bookingDetailPosition = oTable.getContextByIndex(aSelectedIndices[j]).getPath().split("/")[4];
				if (bookingDetailPosition !== undefined) {
					this.getView().byId("deleteButton").setEnabled(true);
					this.getView().byId("editButton").setEnabled(true);
					this.getView().byId("saveButton").setEnabled(true);
					return;
				} else {
					this.getView().byId("deleteButton").setEnabled(false);
					this.getView().byId("editButton").setEnabled(false);
					this.getView().byId("saveButton").setEnabled(false);
					return;
				}
			}

		},

		_deleteBookingDetail: function (idBookingDetail, length) {
			$.ajax({
				type: "DELETE",
				contentType: false,
				url: Constants.BASE_URL + Constants.BOOKING_DETAIL_PATH + "/" + idBookingDetail,
				dataType: "json",
				async: false,
				success: function (data, textStatus, jqXHR) {}
			}).done(function (data) {
				if (length === 0) {
					this._getBookingDetails();
				}
			}.bind(this));
		},

		onDelete: function (oEvent) {
			var oTable = this.byId("bookingsTable");
			var aSelectedIndices = oTable.getSelectedIndices();
			for (var j = 0; j < aSelectedIndices.length; j++) {
				var bookingDetailPosition = oTable.getContextByIndex(aSelectedIndices[j]).getPath().split("/")[4];
				if (bookingDetailPosition === undefined) {
					MessageToast.show("Select just booking details, please!");
					return;
				}
			}

			var length = aSelectedIndices.length;

			for (var i = 0; i < aSelectedIndices.length; i++) {
				var bookingDetailPos = oTable.getContextByIndex(aSelectedIndices[i]).getPath().split("/")[4];
				var bookingPos = oTable.getContextByIndex(aSelectedIndices[i]).getPath().split("/")[2];
				var booking = this.oView.getModel("bookings").getData().bookingData;
				var bookingDetailId = booking[bookingPos].bookingDetails[bookingDetailPos].id;
				this._deleteBookingDetail(bookingDetailId, --length);
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

			var aItems = oTable.getRows();

			for (var i = 0; i < aItems.length; i++) {
				if (i == selectedItem) {
					aItems[i].getCells()[1].setEnabled(true);
					aItems[i].getCells()[2].setEnabled(true);
					aItems[i].getCells()[4].setEnabled(true);
					aItems[i].getCells()[5].setEnabled(true);
				} else {
					aItems[i].getCells()[1].setEnabled(false);
					aItems[i].getCells()[2].setEnabled(false);
					aItems[i].getCells()[4].setEnabled(false);
					aItems[i].getCells()[5].setEnabled(false);
				}
			}

		},

		handleDescriotion: function () {
			this.getView().byId("description").setValue(this.getView().byId("description").getValue());
		},

		onEdit: function (oEvent) {
			var oTable = this.getView().byId("bookingsTable");
			var selectedItem = oTable.getSelectedIndex();

			for (var i = 0; i < oTable.getSelectedIndices().length; i++) {
				for (var j = 0; j < oTable.getRows().length; j++) {
					var oControl = oTable.getRows()[oTable.getSelectedIndices()[i]].getCells()[j];
					var bookingDetailPos = oTable.getContextByIndex(oTable.getSelectedIndices()[i]).getPath().split("/")[4];
					var bookingPos = oTable.getContextByIndex(oTable.getSelectedIndices()[i]).getPath().split("/")[2];
					var booking = this.oView.getModel("bookings").getData().bookingData;
					var bookingDetailId = booking[bookingPos].bookingDetails[bookingDetailPos].id;
					if (j == 0) {
						var bookingDay = oControl.getValue();
						oControl.setValue(bookingDay);
					}
					if (j == 1) {
						var startHour = oControl.getValue();
						oControl.setValue(startHour);
					}
					if (j == 2) {
						var endHour = oControl.getValue();
						oControl.setValue(endHour);
					}
					if (j == 4) {
						var pspName = oControl.getValue();
						oControl.setValue(pspName);

						var psps = this.oView.getModel("bookings").getData().pspsData;

						for (var k = 0; k < psps.length; k++) {
							if (psps[k].pspName === pspName) {
								var pspId = psps[k].pspId;
							}
						}

						this.getView().byId("pspComboBox").setValue(pspName);
					}
					if (j === 5) {
						var description = oControl.getValue();
						oControl.setValue(description);
					}
				}
			}

			var myformData = new FormData();
			myformData.append("id", bookingDetailId);
			myformData.append("bookingDay", bookingDay);
			myformData.append("endHour", endHour);
			myformData.append("pspName", pspName);
			myformData.append("startHour", startHour);
			myformData.append("description", description);
			myformData.append("bookingId", -1);
			myformData.append("pspId", pspId);
			myformData.append("userId", this._user);

			$.ajax({
				type: "PUT",
				processData: false,
				contentType: false,
				data: myformData,
				url: Constants.BASE_URL + Constants.BOOKING_DETAIL_PATH,
				async: false,
				success: function (data, textStatus, jqXHR) {},
				error: function (e, xhr, textStatus, err, data) {
					MessageToast.show("Select a pspName from dropdown of PSP Name, please!");
				}
			}).done(function (data) {
				this._getBookingDetails();
			}.bind(this));

			this.onMakeEditable(oEvent);
		},

		onMenuAction: function (oEvent) {
			var oItem = oEvent.getParameter("item");

			const monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];
			
			// Get month number
			var iMonthNumber = 0;
			for(var i = 0; i < 12; i++) {
				if(monthNames[i] === oItem.getText()) {
					iMonthNumber = i + 1;
					break;
				}
			}
			
			// Add month number to path
			var sItemPath;
			if(iMonthNumber < 10) {
				sItemPath = "0" + iMonthNumber;
			} else {
				sItemPath = iMonthNumber;
			}
			
			// Add year to path
			oItem = oItem.getParent();
			
			sItemPath = oItem.getText() + "-" + sItemPath;
			
			this._filterCalendar(sItemPath);
		},
		
		_filterCalendar: function(sItemPath) {
			var oTable = this.oView.byId("bookingsTable");
			var oBinding = oTable.getBinding("rows");
			var aFilter = [];
			
			aFilter.push(new Filter({
					path: "day",
					operator: FilterOperator.Contains,
					value1: sItemPath
				}));
			oBinding.filter(aFilter);
		},
		
		clearFilter: function () {
			var oTable = this.oView.byId("bookingsTable");
			var oBinding = oTable.getBinding("rows");
			
			oBinding.filter();
		}
		
	});
});