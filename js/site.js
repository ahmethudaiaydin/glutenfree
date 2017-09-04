var vm = function () {
    return {
        selectedItem: null,
        list: [],
        loadList: function (callback) {
            $.getJSON('items.json', function (result) {
                vm.list = [];
                for (var i = 0; i < result.length; i++) {
                    result[i].name = result[i].name.trim();
                    vm.list.push(result[i]);
                }
                callback();
            });
        },
        filteredList: [],
        filterList: function (parentId) {
            this.filteredList = $.grep(this.list, function (e) { return e.parentId == parentId; });
            vm.displayFilteredList();
        },
        showMainCategories: function () {
            return vm.filterList(null);
        },
        getChildNames: function(itemId){
            var childrenOfSelected = vm.children(itemId);
            if (childrenOfSelected) {
                var list = childrenOfSelected.map(function (elem) { return elem.hasChildItem ? elem.name : null; });
                return $.grep(list, Boolean).join(', ');
            }
            return '';
        },
        displayFilteredList: function () {

            $('.gluten-container').html('');
            for (var i = 0; i < vm.filteredList.length; i++) {
                var item = vm.filteredList[i];
                var template = vm.getItemTemplate();
                template = template.replace('{itemId}', item.id);
                template = template.replace('{name}', item.name);
                template = template.replace('{>}', item.hasChildItem ? '>' : '');
                var desc = '';
                if (item.parentId == null) {
                    var childNames = vm.getChildNames(item.id);
                    if (childNames !== '') {
                        desc = childNames;
                    }
                }
                
                if (item.description) {
                    desc += '</br>' + item.description;
                }
                template = template.replace('{desc}', desc);

                $('.gluten-container').append(template);
                if (vm.selectedItem) {
                    var headerTemplate = vm.getHeaderTemplate();
                    headerTemplate = headerTemplate.replace('{name}', vm.selectedItem.name);
                    headerTemplate = headerTemplate.replace('{itemId}', vm.selectedItem.parentId);
                    $('.header').html(headerTemplate);
                } else {
                    var headerTemplate = vm.getDefaultHeaderTemplate();
                    $('.header').html(headerTemplate);
                }
                jQuery('html,body').scrollTop(0);
            }
        },
        getItemTemplate: function () {
            return '<div gluten-item class="gluten-item row" data-id="{itemId}"> ' +
                        '<div class="col-md-10 col-xs-10" style="font-weight:bold;">{name}</div>' +
                        '<div class="col-md-1 col-xs-1">{>}</div>' +
                        '<div class="desc pull-left col-md-10 col-xs-10">{desc}</div>' +
                    '</div';
        },
        getDefaultHeaderTemplate: function () {
            return '<div gluten-header="" class="col-md-12 col-xs-12" data-id="null">' +
                        '<div class="row">' +
                        '<div class="col-xs-10">Kategori Listesi</div>' +
                        '<div class="col-xs-2"><a href="hakkimizda.html"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></a></div>' +
                        '</div>' +
                    '</div>';



            '<div gluten-header class="col-md-12 col-xs-12" data-id="null">' +
                            'Kategori Listesi' +
                    '</div>';
        },
        getHeaderTemplate: function () {
            return '<div gluten-header class="col-md-12 col-xs-12 gluten-header-text" data-id="{itemId}">' +
                            '<  {name}' +
                    '</div>';
        },
        children: function (id) {
            return $.grep(vm.list, function (e) { return e.parentId == id });
        }

    };
}();

$(document).ready(function () {
    vm.loadList(vm.showMainCategories);
    $(document).on('click', '[gluten-item],[gluten-header]', function () {
        var dataId = $(this).data('id');
        vm.selectedItem = $.grep(vm.list, function (e) { return e.id == dataId })[0];
        if (vm.selectedItem) {
            if (vm.selectedItem.hasChildItem) {
                vm.filterList(vm.selectedItem.id);
            }
        } else {
            vm.filterList(null);
        }
    });
});
