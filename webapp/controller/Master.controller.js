sap.ui.define([
	"../Constants",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox',
	'sap/f/library'
], function (Constants, JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, fioriLibrary) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.Master", {
		onInit: function () {
			this.oView = this.getView();

			var oModel = new sap.ui.model.json.JSONModel();

			$.ajax({
				type: "GET",
				contentType: "application/json",
				url: Constants.BASE_URL + Constants.USERS_PATH,                 
				dataType: "json",
				async: false, 
				success: function (data, textStatus, jqXHR) {
					oModel.setProperty("/modelData", data);
				}
			});

			console.log(this.oView.setModel(oModel, "users"));
			
			this._bDescendingSort = false;
			this.oProductsTable = this.oView.byId("usersTable");
			
			this.oRouter = this.getOwnerComponent().getRouter();
		},
		
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");
			
			if (sQuery && sQuery.length > 0) {
				oTableSearchState.push(new Filter("lastName", FilterOperator.Contains, sQuery));
			}
			var oTable = this.byId("usersTable");
			var oBinding = oTable.getBinding("items");

			oBinding.filter(oTableSearchState);
		},
		
		onSort: function () {
			this._bDescendingSort = !this._bDescendingSort;
			var oBinding = this.oProductsTable.getBinding("items"),
				oSorter = new Sorter("programName", this._bDescendingSort);

			oBinding.sort(oSorter);
		},
		
		onSynchronize: function(oEvent) {
          this.onInit();
        },
        
        onPressed: function(oEvent) {
			var userPath = oEvent.getSource().getBindingContext("users").getPath(),
				user = userPath.split("/").slice(-1).pop();
			var programName;
			var users = this.oView.getModel("users").getData().modelData;
		    for(var i=0;i<users.length;i++){
		    	if(users[i].id == user){
		    		programName = users[i].programName;
		    	}
		    }
				
			this.oRouter.navTo("detail", {layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded, user: user, programName: programName});	
        }
	});
});