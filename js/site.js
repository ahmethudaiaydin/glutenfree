var vm = function () {
    return {
        selectedItem: null,
        list: [],
        loadList: function (callback) {
            $.getJSON('items.json', function (result) {
                list = [];
                for (var i = 0; i < result.length; i++) {
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
        displayFilteredList: function () {

            $('.gluten-container').html('');
            for (var i = 0; i < vm.filteredList.length; i++) {
                var item = vm.filteredList[i];
                var template = vm.getItemTemplate();
                template = template.replace('{itemId}', item.id);
                template = template.replace('{name}', item.name);
                template = template.replace('{>}', vm.hasChildren(item.id) ? '>' : '');

                if (item.description != null) {
                    template = template.replace('{desc}', item.description);

                } else {
                    template = template.replace('{desc}', '');
                }
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
                        '<div class="col-md-10 col-xs-10">{name}</div>' +
                        '<div class="col-md-1 col-xs-1">{>}</div>' +
                        '<div class="desc pull-left col-md-10 col-xs-10">{desc}</div>' +
                    '</div';
        },
        getDefaultHeaderTemplate: function () {
            return '<div gluten-header class="col-md-12 col-xs-12" data-id="null">' +
                            'Kategori Listesi' +
                    '</div>';
        },
        getHeaderTemplate: function () {
            return '<div gluten-header class="col-md-12 col-xs-12 gluten-header-text" data-id="{itemId}">' +
                            '< {name}' +
                    '</div>';
        },
        hasChildren: function (id) {
            return $.grep(vm.list, function (e) { return e.parentId == id }).length > 0;
        }
    };
}();

$(document).ready(function () {
    vm.loadList(vm.showMainCategories);
    $(document).on('click', '[gluten-item],[gluten-header]', function () {
        var dataId = $(this).data('id');
        if (vm.hasChildren(dataId)) {
            vm.selectedItem = $.grep(vm.list, function (e) { return e.id == dataId })[0];
            if (vm.selectedItem) {
                vm.filterList(vm.selectedItem.id);
            } else {
                vm.filterList(null);
            }
        }
    });
});
