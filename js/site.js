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
            return '<div gluten-item class="gluten-item" data-id="{itemId}">' +
                        '<div class="name">{name}</div>' +
                        '<div class="chevron">{>}</div>' +
                        '<div class="desc">{desc}</div>' +
                    '</div>';
        },
        getDefaultHeaderTemplate: function () {
            return '<div gluten-header class="header-title" data-id="null">Kategori Listesi</div>' +
                   '<button type="button" gluten-info class="header-info" aria-label="Hakkımızda">' +
                       '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
                           '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
                           '<path d="M12 11.2v4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
                           '<circle cx="12" cy="7.6" r="1.3" fill="currentColor"/>' +
                       '</svg>' +
                   '</button>';



            '<div gluten-header class="col-md-12 col-xs-12" data-id="null">' +
                            'Kategori Listesi' +
                    '</div>';
        },
        getHeaderTemplate: function () {
            return '<div gluten-header class="header-title" data-id="{itemId}">' +
                            '←  {name}' +
                    '</div>';
        },
        showAbout: function () {
            vm.selectedItem = null;
            $('.gluten-container').html(vm.getAboutTemplate());
            $('.header').html(vm.getAboutHeaderTemplate());
            jQuery('html,body').scrollTop(0);
        },
        getAboutHeaderTemplate: function () {
            return '<div gluten-header class="header-title" data-id="__about__">←  Hakkımızda</div>';
        },
        getAboutTemplate: function () {
            return '<div class="about-panel">' +
                '<h2>Hakkımızda</h2>' +
                '<p>Bu uygulama çölyaklıların ve glutensiz beslenme diyeti yapanların, glutensiz ürünlere daha kolay ulaşabilmesi için ücretsiz sunulmaktadır.</p>' +
                '<p>Ürün listesi Çölyak Ankara Derneği sitesindeki listeden oluşturulmuştur ve oradaki güncellemeler sıklıkla yansıtılmaya çalışılmaktadır.</p>' +
                '<p>Ürünlerin kullanılıp kullanılmaması tüm kullanıcıların kendi sorumluluğundadır.</p>' +
                '<p>Listenin güvenilirliği ile ilgili Çölyak Ankara Derneği aşağıdaki şekilde açıklama yapmaktadır.</p>' +
                '<p>Sevgili çölyaklılar ve çölyak yakınları,</p>' +
                '<p>Bu liste bizzat firmalarla yapılan yazışmalar sonucunda gelen yazılı onay raporları dikkate alınarak oluşturulmuştur.</p>' +
                '<p>Listede bulunmayan ürünler sorgulanmış ancak cevap alınamamış ve de yazılı onay gönderilmemiş ürünlerdir.</p>' +
                '<p>Dernek mail adresimize (colyakdernegi@gmail.com) glutensiz analiz raporlarını göndermeyen firmalar listemize alınmamaktadır.</p>' +
                '<p>Bilginize.</p>' +
                '<p class="about-signature">ÇÖLYAK DERNEĞİ</p>' +
                '<p>Android telefonlarınız için uygulamayı <a href="https://play.google.com/store/apps/details?id=glutenfreelist.com.glutenfreelist">buraya tıklayarak</a> indirebilirsiniz.</p>' +
                '<p>Her türlü görüş, öneri, şikayet için e-posta adresimiz: <a href="mailto:ilyadasoftware@gmail.com">ilyadasoftware@gmail.com</a></p>' +
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
    $(document).on('click', '[gluten-info]', function (e) {
        e.stopPropagation();
        vm.showAbout();
    });
});
