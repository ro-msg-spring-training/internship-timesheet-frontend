sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../Constants"
], function (Controller, Constants) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.CreateBookingDetail", {
		// onInit: function () {
		// 	var oRouter = this.getRouter();
		// 	//oRouter.getRoute("createBookingDetail").attachMatched(this._onRouteMatched, this);
		// },
		// _onRouteMatched : function (oEvent) {
		// 	var oView;

		// 	//oArgs = oEvent.getParameter("arguments");
		// 	oView = this.getView();
		// },
		// 	oView.bindElement({
		// 		// path : "/BookingDetail(" + oArgs.supplierId + ")",
		// 		// events : {
		// 		// 	change: this._onBindingChange.bind(this),
		// 		// 	dataRequested: function (oEvent) {
		// 		// 		oView.setBusy(true);
		// 		// 	},
		// 		// 	dataReceived: function (oEvent) {
		// 		// 		oView.setBusy(false);
		// 		// 	}
		// 		// }
		// 	});
		// },
		_onBindingChange : function (oEvent) {
			// No data for the binding
			if (!this.getView().getBindingContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		}
	});
});