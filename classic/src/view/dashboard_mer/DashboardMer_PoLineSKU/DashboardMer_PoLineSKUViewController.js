Ext.define('GSmartApp.view.DashboardMer.DashboardMer_PoLineSKU.DashboardMer_PoLineSKUViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.DashboardMer_PoLineSKUViewController',
    init: function () {

    },
    control: {
        '#btnConfirmSKU': {
            click: 'onConfimSKU'
        },
        '#cmbSanPham': {
            select: 'onSelectSanPham'
        },
    },
    listen: {
        controller: {
            'Dashboard_Mer_ViewController': {
                'dashboard_search': 'on_dashboard_search'
            },
            'BarChartProductShipDateViewController': {
                'dashboard_selectBarChartProduct': 'on_selectBarChartProduct'
            },
            'Dashboard_KhoTP_POLine_Controller': {
                'dashboard_select_poline': 'on_dashboard_select_poline'
            }
        }
    },
    on_dashboard_search: function(){
        var m = this;
        var me = this.getView();
        var viewModel = this.getViewModel();
        var PContractSKUStore = viewModel.getStore('PContractSKUStore');
        PContractSKUStore.removeAll();
        me.setDisabled(true);
    },
    on_selectBarChartProduct: function(){
        var m = this;
        var me = this.getView();
        var viewModel = this.getViewModel();
        var PContractSKUStore = viewModel.getStore('PContractSKUStore');
        PContractSKUStore.removeAll();
        me.setDisabled(true);
    },
    on_dashboard_select_poline: function(record){
        var m = this;
        var me = this.getView();
        var viewModel = this.getViewModel();
        me.setDisabled(false);
        // console.log(record);

        var productid_link = record.get('productid_link');
        var pcontractid_link = record.get('pcontractid_link');

        me.setLoading(true);
        var PContractProduct_PO_Store = viewModel.getStore('PContractProduct_PO_Store');
        PContractProduct_PO_Store.loadStore_bypairid_Async(productid_link, record.get('po_quantity'), true, pcontractid_link);
        PContractProduct_PO_Store.load({
            scope: this,
            callback: function (records, operation, success) {
                me.setLoading(false);
                var firstRecord = PContractProduct_PO_Store.getAt(0);
                var cmbSanPham = me.down('#cmbSanPham');
                cmbSanPham.select(firstRecord);
                // viewModel.set('IdProduct', record.get('id'));
                // viewModel.set('Product_pquantity', firstRecord.get('pquantity'));
                // console.log(record);
                //clear sku list
                var PContractSKUStore = viewModel.getStore('PContractSKUStore');
                PContractSKUStore.removeAll();
                PContractSKUStore.loadStoreByPO_and_Product(firstRecord.get('id'), record.get('id'));
            }
        });
    },
    onSelectSanPham: function (combo, record, eOpts) {
        var viewmodel = this.getViewModel();
        var storeSku = viewmodel.getStore('PContractSKUStore');
        var pcontract_poid_link = viewmodel.get('pcontract_poid_link');
        viewmodel.set('IdProduct', record.data.id);
        viewmodel.set('Product_pquantity', record.data.pquantity);

        storeSku.loadStoreByPO_and_Product(record.data.id, pcontract_poid_link);
    },
    onConfimSKU: function () {
        var me = this.getView();
        var viewmodel = this.getViewModel();
        if (viewmodel.get('IdProduct') == 0) {
            Ext.Msg.show({
                title: 'Thông báo',
                msg: 'Bạn chưa chọn sản phẩm',
                buttons: Ext.MessageBox.YES,
                buttonText: {
                    yes: 'Đóng',
                }
            });
        }
        else {
            var params = new Object();
            params.pcontractid_link = viewmodel.get('PContract.id');
            params.productid_link = viewmodel.get('IdProduct');

            GSmartApp.Ajax.post('/api/v1/pcontractproduct/comfim_sizebreakdown', Ext.JSON.encode(params),
                function (success, response, options) {
                    if (success) {
                        var response = Ext.decode(response.responseText);
                        if (response.respcode == 200) {
                            Ext.Msg.show({
                                title: "Thông báo",
                                msg: 'Thành công',
                                buttons: Ext.MessageBox.YES,
                                buttonText: {
                                    yes: 'OK'
                                },
                                fn: function () {
                                    me.fireEvent('ConfimSKU');
                                }
                            });
                        }
                    }
                    else {
                        Ext.Msg.show({
                            title: "Thông báo",
                            msg: 'Thất bại',
                            buttons: Ext.MessageBox.YES,
                            buttonText: {
                                yes: 'OK'
                            }
                        });
                    }
                })
        }
    },
    onSpecialkey: function (text, e, eOpts) {
        if (e.keyCode == 9) e.stopEvent();
    },
    onEdit: function (editor, context, e) {
        var m = this;
        var grid = this.getView();
        var viewmodel = this.getViewModel();
        var store = viewmodel.getStore('PContractSKUStore');

        if (grid.down('#btnThemSKU').hidden) {
            Ext.Msg.show({
                title: "Thông báo",
                msg: 'Bạn không có quyền sửa thông tin',
                buttons: Ext.MessageBox.YES,
                buttonText: {
                    yes: 'OK'
                }
            });
            store.rejectChanges();
        }
        else {
            if (context.value == context.originalValue) return;
            grid.setLoading("Đang xử lý");


            var data = context.record.data;
            var params = new Object();
            params.data = data;
            params.data.pcontract_poid_link = viewmodel.get('pcontract_poid_link');
            if (context.field == "pquantity_porder")
                params.isupdte_amount = true;
            else
                params.isupdte_amount = false;

            delete params.data.listSKUvalue;

            GSmartApp.Ajax.post('/api/v1/pcontractsku/update', Ext.JSON.encode(params),
                function (success, response, options) {
                    grid.setLoading(false);
                    if (success) {
                        var response = Ext.decode(response.responseText);
                        if (response.respcode != 200) {
                            Ext.Msg.show({
                                title: "Thông báo",
                                msg: 'Lưu thất bại',
                                buttons: Ext.MessageBox.YES,
                                buttonText: {
                                    yes: 'Có'
                                }
                            });
                            store.rejectChanges();
                        }
                        else {
                            context.record.set('pquantity_production', response.amount);
                            store.commitChanges();

                            if (context.rowIdx < store.data.length - 1) {
                                var cellediting = grid.getPlugin('cellediting');
                                cellediting.startEditByPosition({
                                    row: (context.rowIdx + 1),
                                    column: context.colIdx
                                });
                            }

                            // update sl danh sach po line
                            m.updateAmountPoLine(response.poAfterUpdate);
                            m.updateAmountPoParent(response.poParentAfterUpdate);
                        }
                    }
                })
        }
    },

    updateAmountPoLine: function(poAfterUpdate){
        if(poAfterUpdate != null){
            var viewModel = this.getViewModel();
            var po_quantity = poAfterUpdate.po_quantity;
            var poLine = viewModel.get('poLine');
            if(poLine != null){
                // console.log(poAfterUpdate);
                // console.log(poLine);
                poLine.set('po_quantity', po_quantity);
            }
        }
    },
    updateAmountPoParent: function(poParentAfterUpdate){
        if(poParentAfterUpdate != null){
            var viewModel = this.getViewModel();
            var po_quantity_difference = poParentAfterUpdate.po_quantity_difference;
            var PContractPOList = viewModel.getStore('PContractPOList');
            var records = PContractPOList.queryBy(function(record,id){
                return (record.get('id') == poParentAfterUpdate.id);
            }).items;
            if(records.length > 0){
                var recToUpdate = records[0]; // po_quantity_difference
                recToUpdate.set('po_quantity_difference', po_quantity_difference);
                // console.log(recToUpdate);
            }
        }
    },

    onXoa: function (grid, rowIndex, colIndex) {
        var th = this;
        var m = this;
        var grid = this.getView();

        if (grid.down('#btnThemSKU').hidden) {
            Ext.Msg.show({
                title: "Thông báo",
                msg: 'Bạn không có quyền xóa',
                buttons: Ext.MessageBox.YES,
                buttonText: {
                    yes: 'OK'
                }
            });
        }
        else {
            Ext.Msg.show({
                title: "Thông báo",
                msg: 'Bạn có chắc chắn muốn xóa SKU ?',
                buttons: Ext.MessageBox.YESNO,
                buttonText: {
                    yes: 'Có',
                    no: 'Không'
                },
                fn: function (btn) {
                    if (btn === 'yes') {
                        var viewmodel = th.getViewModel();
                        var record = grid.getStore().getAt(rowIndex);
                        var params = new Object();
                        params.pcontractid_link = viewmodel.get('PContract.id');
                        params.skuid_link = record.data.skuid_link;

                        GSmartApp.Ajax.post('/api/v1/pcontractsku/delete', Ext.JSON.encode(params),
                            function (success, response, options) {
                                if (success) {
                                    var response = Ext.decode(response.responseText);
                                    var store = viewmodel.getStore('PContractSKUStore');
                                    if (response.respcode == 200) {
                                        Ext.Msg.show({
                                            title: "Thông báo",
                                            msg: 'Xóa thành công',
                                            buttons: Ext.MessageBox.YES,
                                            buttonText: {
                                                yes: 'OK'
                                            }
                                        });
                                        store.remove(record);

                                        var tab = Ext.getCmp('PContractProduct_Bom_TabColorView').getController();
                                        tab.createTab();

                                        var storeAtt = viewmodel.getStore('PContractAttValueStore');
                                        storeAtt.loadStore(params.pcontractid_link, viewmodel.get('IdProduct'));

                                        // update sl danh sach po line
                                        m.updateAmountPoLine(response.poAfterUpdate);
                                        m.updateAmountPoParent(response.poParentAfterUpdate);
                                    }
                                    else {
                                        Ext.Msg.show({
                                            title: "Thông báo",
                                            msg: 'Xóa thất bại',
                                            buttons: Ext.MessageBox.YES,
                                            buttonText: {
                                                yes: 'OK'
                                            }
                                        });
                                    }
                                }
                            })
                    }
                }
            });
        }


    },
    onThemSKU: function () {
        var viewmodel = this.getViewModel();
        if (viewmodel.get('IdProduct') == 0) {
            Ext.Msg.show({
                title: 'Thông báo',
                msg: 'Bạn chưa chọn sản phẩm',
                buttons: Ext.MessageBox.YES,
                buttonText: {
                    yes: 'Đóng',
                }
            });
        }
        else {
            var form = Ext.create({
                xtype: 'skusearchwindow',
                reference: 'skusearchwindow',
                width: 800,
                height: 500,
                viewModel: {
                    data: {
                        sourceview: 'PContractSKU_ListProductView',
                        pcontractid_link: viewmodel.get('PContract.id'),
                        searchtype: 1,
                        orgcustomerid_link: viewmodel.get('PContract.orgbuyerid_link'),
                        productid_link: viewmodel.get('IdProduct'),
                        productid_link_notsearch: viewmodel.get('IdProduct'),
                        type: 10,
                        pcontract_poid_link: viewmodel.get('pcontract_poid_link'),
                        isSearchViewHidden: true
                    }
                }
            });
            form.show();
        }

    },
    onYeuCauXuatKhoThanhPham: function (grid, rowIndex, colIndex) {
        var me = this.getView();
        var rec = grid.getStore().getAt(rowIndex);
        
        Ext.Msg.show({
            title: 'Thông báo',
            msg: 'Bạn có chắc chắn tạo yêu cầu xuất kho thành phẩm ' + rec.get('skuCode') + ' ?',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            buttonText: {
                yes: 'Có',
                no: 'Không'
            },
            fn: function (btn) {
                if (btn === 'yes') {
                    // me.setLoading("Đang xóa dữ liệu");
                    // var params = new Object();
                    // params.id = rec.data.id;

                    // GSmartApp.Ajax.post('/api/v1/attributevalue/attributevalue_delete', Ext.JSON.encode(params),
                    //     function (success, response, options) {
                    //         if (success) {
                    //             var store = me.getViewModel().getStore('AttributeValueStore');
                    //             store.remove(rec);
                    //             if (rec.removedFrom == store.data.length) {
                    //                 me.getSelectionModel().select(store.data.length - 1);
                    //             } else {
                    //                 me.getSelectionModel().select(rec.removedFrom);
                    //             }
                    //         } else {
                    //             Ext.Msg.show({
                    //                 title: 'Thông báo',
                    //                 msg: 'Xóa thất bại',
                    //                 buttons: Ext.MessageBox.YES,
                    //                 buttonText: {
                    //                     yes: 'Đóng',
                    //                 }
                    //             });
                    //         }
                    //         me.setLoading(false);
                    //     })
                }
            }
        });
    },

    //
    renderSum: function(value, summaryData, dataIndex) {
        if (null == value) value = 0;
        return '<div style="font-weight: bold; color:darkred;">' + Ext.util.Format.number(value, '0,000') + '</div>';    
    },
})