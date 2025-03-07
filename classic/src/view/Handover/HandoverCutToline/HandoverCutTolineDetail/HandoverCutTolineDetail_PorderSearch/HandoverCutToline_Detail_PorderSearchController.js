Ext.define('GSmartApp.view.handover.HandoverCutToline_Detail_PorderSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.HandoverCutToline_Detail_PorderSearchController',
    init: function () {
        var m = this;
        var viewModel = this.getViewModel();
        var viewId = viewModel.get('viewId');
        var pordercode = viewModel.get('pordercode');
        var granttoorgid_link = viewModel.get('granttoorgid_link')
        // var productid_link = viewModel.get('currentRec.orgid_to_link');
        // var dateSX = viewModel.get('dateSX');
        // console.log(dateSX);
        // console.log(productid_link);
        var POrder_ListStore = viewModel.get('POrder_ListStore');
        // POrder_ListStore.loadStoreByPordercode(pordercode);
        // POrder_ListStore.loadStoreByPordercode_Async('VCTK 213635-16/07/21_2', 301);
        POrder_ListStore.loadStoreByPordercode_Async(pordercode, granttoorgid_link);
        POrder_ListStore.load({
			scope: this,
			callback: function(records, operation, success) {
				if(!success){
					 // this.fireEvent('logout');
				} else {
                    // console.log(records);
                    var items = POrder_ListStore.getData().items;
                    if(viewId == 'handover_cut_toline_detail'){
                        if(items.length == 0){
                            m.fireEvent('found0Porder');
                        }
                        if(items.length == 1){
                            m.fireEvent('found1Porder', records);
                        }
                    }
				}
			}
        });
    },
    listen: {

    },
    control: {
        '#btnQuayLai': {
            click: 'onQuayLai'
        },
        '#btnLuu': {
            click: 'onLuu'
        },
    },
    onQuayLai: function(){
        this.getView().up('window').close();
    },
    onLuu: function(){
        // console.log('luu');
        var viewModel = this.getViewModel();
        var m = this.getView();
        var select = m.getSelectionModel().getSelection();

        this.fireEvent('foundManyPorder', select);

        // if(select.length == 0){
        //     Ext.Msg.show({
        //         title: "Thông báo",
        //         msg: "Phải chọn ít nhất một lệnh",
        //         buttons: Ext.MessageBox.YES,
        //         buttonText: {
        //             yes: 'Đóng',
        //         }
        //     });
        //     return;
        // }

        // var porderid_link = select[0].data.id;
        // var ordercode = select[0].data.ordercode;

        // var viewId = viewModel.get('viewId');
        // var mainView = Ext.getCmp(viewId);

        // // cut to line, load store ListOrgStore_To
        // if(viewId == 'handover_cut_toline_detail'){
        //     var ListOrgStore_To = mainView.getViewModel().getStore('ListOrgStore_To');
        //     ListOrgStore_To.loadStoreByPorderIdLink(porderid_link);
        //     mainView.down('#orgid_to_link').setValue(null);
        //     mainView.down('#orgid_to_link').focus();
        // }

        // mainView.getViewModel().set('currentRec.porderid_link', porderid_link);
        // mainView.getViewModel().set('pordercode', ordercode);
        // mainView.getController().loadHandoverProductOnPorderSelect(porderid_link);

        // this.onQuayLai();
    },
})