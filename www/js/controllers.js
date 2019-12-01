
var db = null;
var userID = null;
var storeID = null;

angular.module('starter.controllers', ['uiGmapgoogle-maps', 'ngCordova', 'ja.qr'])

.controller('SplashCtrl', function ($rootScope, $scope, $state, SQLiteStore, $cordovaSQLite) {

    $scope.enterApp = function() {

        //document.addEventListener("deviceready", function () {

            if (window.cordova) {
              db = $cordovaSQLite.openDB({name: "shopiit.db", iosDatabaseLocation: 'default'}); //device
            } else{
              db = window.openDatabase("shopiit.db", '1', 'shopiit', 1024 * 1024 * 100); // browser
            }

            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS data_table (key text primary key, value integer)");
            var query = "INSERT INTO data_table (key, value) VALUES ('userID', null)";
            $cordovaSQLite.execute(db, query, []).then(function(res) {

            }, function (err) {
              console.error(err);
            });
            var query = "INSERT INTO data_table (key, value) VALUES ('storeID', null)";
            $cordovaSQLite.execute(db, query, []).then(function(res) {

            }, function (err) {
              console.error(err);
            });

            try {
                SQLiteStore.get('userID').then(function(value) {

                    userID = value;
                    $rootScope.$emit('ProfileCtrl:userChanged');

                    $scope.userNotDefined = typeof userID === 'undefined' || userID === null;
                    SQLiteStore.get('storeID').then(function(value2) {
                        storeID = value2;
                    });

                    if (!$scope.userNotDefined) {
                        $state.go('tab.dash');
                    }
                });
            } catch (err) {
                console.error(err);
            }

        //}, false);
    }

    $rootScope.$on('SplashCtrl:changed', function () {
        $scope.enterApp();
    });

    $scope.enterApp();


    $scope.signIn = function () {

        $state.go('login');
    }

    $scope.dash = function () {

        $state.go('tab.dash');
    }

    $scope.signUp = function () {

        $state.go('profile2', {
            comeFromLoginPage: true
        });
    }

})
.controller('LoginCtrl', function ($rootScope, $scope, $state, $ionicPopup, $filter, Customer, SQLiteStore) {

    $scope.logIn = function () {

        Customer.GetUserProfileByEmailAndCellPhone($filter('lowercase')($scope.email), $scope.cellphone)
        .then(function (data) {

            if (data.length > 0) {
                SQLiteStore.set("userID", data[0].user_id).then (function() {
                    userID = data[0].user_id;
                    $rootScope.$emit('ProfileCtrl:userChanged');
                });

                $state.go('tab.dash');
            }
            else {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'User e-mail and/or phone number is not correct'
                });
            }
        });

    }

    $scope.goToSplash = function () {
        $state.go('splash');
    }
})

.controller('DashCtrl', function ($rootScope, $scope, $state, $ionicPopup, $ionicLoading, ProductSku) {


    $scope.stateMyProfile = function () {

        $state.go('tab.profile');
    }

    $scope.stateMyBids = function () {

        $state.go('tab.scan-shop-list');
    }

    $scope.stateStores = function () {

        $state.go('tab.stores');
    }

    $scope.show = function () {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>'
        });
    };

    $scope.hide = function () {
        $ionicLoading.hide();
    };

    $scope.storeId = 0;
    if (typeof storeID === undefined  || storeID === null) {
        $scope.storeId = storeID;
    }

    $scope.readBarcode = function () {

        if (typeof storeID === undefined  || storeID === null) {
            $ionicPopup.alert({
                title: 'Error',
                template: 'Store must be chosed before scanning.'
            });
            return;
        }

        /*
        $scope.show($ionicLoading);
        document.addEventListener("deviceready", function () {
            cordova.plugins.barcodeScanner
            .scan(function (barcodeData) {
                $scope.hide($ionicLoading);
                if (barcodeData && barcodeData.text != '' && barcodeData.text != null) {
                    ProductSku.GetSkuDetail( barcodeData.text).then(function (data) {
                        if (data.length < 1) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Product Not Found'
                            });
                        } else {
                            $state.go('tab.product-sku-detail', {
                                productSku:  barcodeData.text,
                                showDescription: true,
                                showMakeDeal: true,
                                showForm: false
                            });
                            $rootScope.$emit('ProductSkuDetailCtrl:productChanged');
                        }
                    });
                } else {
                    $state.go('tab.dash');
                }
                // Success! Barcode data is here
            }, function (error) {
                console.log('error', error);
                $state.go('tab.dash');
                // An error occurred
            });

        }, false);
        */


        var sku = "140135480008";
            ProductSku.GetSkuDetail(sku).then(function (data) {
            if (data.length < 1) {
            $ionicPopup.alert({
            title: 'Error',
            template: 'No Product Found'
        });
        } else {
        $state.go('tab.product-sku-detail', {
        productSku: sku,
        showDescription: true,
        showMakeDeal: true,
        showForm: false
        });
        $rootScope.$emit('ProductSkuDetailCtrl:productChanged');
        }
        });


}; //readBarcode

})

.controller('StoresCtrl', function ($rootScope, $scope, $state, Stores, $timeout, uiGmapGoogleMapApi, SQLiteStore) {

    $scope.clientSide = 'chosen';
    $scope.chosenSelected = 'active';

    $scope.changeView = function (value) {
        $scope[value + 'Selected'] = 'active';
        $scope.clientSide = value;
        if (value === 'chosen') {
            $scope['listSelected'] = '';
            $scope['mapSelected'] = '';
        } else if (value === 'list') {
            $scope['chosenSelected'] = '';
            $scope['mapSelected'] = '';
        } else {
            $scope['chosenSelected'] = '';
            $scope['listSelected'] = '';
        }
        //$ionicScrollDelegate.scrollTop();
    };

    $scope.chosenStore = null;
    $scope.storeId = storeID;


    $rootScope.$on('StoresCtrl:storeChanged', function () {
        $scope.storeId = storeID;
        $scope.GetStore($scope.storeId);
        $scope.changeView('chosen');
    });

    $scope.GetStore = function (storeId) {

        Stores.GetStore(storeId).then(function (data) {
            if (data.length < 1) {} else {
                $scope.chosenStore = data[0];
            }
        });
    }

    $scope.GetStore($scope.storeId);

    if ($scope.storeId === null) {
        $scope.changeView('list');
    }


    $scope.mrkrLabel = null;
    $scope.selected = 0;
    $scope.select = function (index) {
        $scope.selected = index;
    };

    $scope.markers = [];
    $scope.infoVisible = false;
    $scope.infoBusiness = {};

    // Initialize and show infoWindow for business
    $scope.showInfo = function (marker, eventName, markerModel) {
        $scope.infoBusiness = markerModel;
        $scope.infoVisible = markerModel.isInfoShowed;
    };

    $scope.gotoStoreDetail = function (id) {

        $state.go('tab.store-detail', {
            storeId: id
        });
    };

    // Hide infoWindow when 'x' is clicked
    $scope.hideInfo = function () {
        $scope.infoVisible = false;
    };

    var initializeMap = function (position) {

        $scope.map = {
            center: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            zoom: 10
        };

        $scope.windowOptions = {
            pixelOffset: {
                height: -32,
                width: 0
            }
        };

        $scope.markers.push({
            id: 0,
            location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            title: "You are here",
            isInfoShowed: false
        });


    Stores.GetStores(position.coords.latitude, position.coords.longitude).then(function (data) {

        $scope.stores = data;

        data.forEach(function (el) {

            $scope.markers.push({
                id: el.store_id,
                location: {
                    latitude: el.latitude,
                    longitude: el.longitude
                },
                icon: el.brandtagurl,
                title: el.storename,
                street: el.street,
                phone: el.phone,
                distance: el.distance,
                isInfoShowed: true
            });
        });

    });
};


var curPos = {
    coords: {
        latitude: 43.730309,
        longitude: -79.376378
    }
};

var onLocationSuccess = function (position) {

    curPos.coords.latitude = position.coords.latitude;
    curPos.coords.longitude = position.coords.longitude;

    initializeMap(curPos);
}

uiGmapGoogleMapApi.then(function (maps) {
    navigator.geolocation.getCurrentPosition(onLocationSuccess);

    /*initializeMap(curPos);

    if (typeof _.contains === 'undefined') {
        _.contains = _.includes;
    }
    if (typeof _.object === 'undefined') {
        _.object = _.zipObject;
    }*/

});
})

.controller('ProductSkuDetailCtrl', function ($rootScope, $scope, $sce, $stateParams, $state, $ionicPopup, $ionicScrollDelegate, ProductSku, SQLiteStore) {

    $rootScope.$on('ProductSkuDetailCtrl:productChanged', function () {
        $scope.updateProduct();
    });

    $scope.updateProduct = function () {
        $scope.showDescription = $stateParams.showDescription;
        $scope.showMakeDeal = $stateParams.showMakeDeal;
        $scope.showForm = $stateParams.showForm;

        ProductSku.GetSkuDetail($stateParams.productSku).then(function (data) {
            if (data.length < 1) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'No Product Found'
                });
                $state.go('tab.dash');
            } else {
                $scope.product = data[0];
                $scope.feature_text = $sce.trustAsHtml($scope.product.feature_text);
                $scope.productColor = null;
                $scope.productSize = null;
                $scope.product.colorInfo = "";
                $scope.product.sizeInfo = "";

                angular.forEach($scope.product.color,
                    function(value, key) {
                        $scope.product.colorInfo += value.color + ", ";
                    });

                    if ($scope.product.colorInfo !== "") {
                        $scope.product.colorInfo = $scope.product.colorInfo.substring(0, $scope.product.colorInfo.length - 2);
                    }

                    angular.forEach($scope.product.size,
                        function(value, key) {
                            $scope.product.sizeInfo += value.size + ", ";
                        });

                        if ($scope.product.sizeInfo !== "") {
                            $scope.product.sizeInfo = $scope.product.sizeInfo.substring(0, $scope.product.sizeInfo.length - 2);
                        }
                    }
                });
            }

            $scope.updateProduct();

            $scope.goToList = function () {
                $state.go('tab.dash');
            };
            //$scope.product = ScanShopList.get($stateParams.productSku);

            // $scope.$on('$locationChangeStart', function( event ) {
            //   $scope.preferredPrice = null;
            //   $scope.preferredDiscount = null;
            //   $scope.showForm = false;
            // });
            $scope.makeDeal = function () {
                if (typeof userID === undefined  || userID === null) {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'You must signUp or signIn.'
                    }).then(function(res) {
                        $state.go('splash');
                    });
                }
                else {
                    $scope.showDescription = false;
                    $scope.showMakeDeal = false;
                    $scope.showForm = true;
                    $ionicScrollDelegate.scrollTop();
                }
            };

            $scope.saveRequest = function () {

                ProductSku.MakeRequest(userID, $scope.product.retailerid, storeID,
                    $scope.product.productid,
                    1 /* longitude*/ , 1 /*latitude*/ ,
                    $scope.product.price,
                    $scope.product.currency,
                    $scope.product.productColor /*colorInfo*/ ,
                    $scope.product.productSize /*sizeInfo*/ ,
                    $scope.product.preferredPrice,
                    $scope.product.preferredDiscount,
                    1 /*askedQty*/ , $scope.product.expiryTime).then(function (data) {
                        if (data != '0') {
                            alert('REQUEST FAILED');
                        } else {
                            $ionicPopup.alert({
                                title: 'Information',
                                template: 'Your bid is submitted'
                            }).then(function(res) {
                                $scope.preferredPrice = null;
                                $scope.preferredDiscount = null;
                                $scope.showDescription = false;
                                $scope.showMakeDeal = false;
                                $scope.showForm = false;
                                $rootScope.$emit('ScanShopList:listChanged');
                                $state.go('tab.scan-shop-list', {
                                    listType: 'waiting'
                                });
                            });
                        }
                    });
                };
            })

            .controller('RequestDetailCtrl', function ($rootScope, $scope, $sce, $stateParams, $state, $ionicPopup, Request, SQLiteStore) {

                $scope.updateRequest = function () {
                    $scope.request = $stateParams.request;

                    if ($scope.request !== null) {
                        $scope.request.LogoColor = "#FFFF00";
                        if ($scope.request.status == "REJECTED" || $scope.request.status == "EXPIRED" || $scope.request.status == "CANCELED")
                        $scope.request.LogoColor = "#FF0000";
                        else if ($scope.request.status == "APPROVED") {
                            $scope.request.LogoColor = "#00FF00";
                            $scope.request.showOfferprice = true;
                        }
                        else if ($scope.request.status == "OFFERMADE") {
                            $scope.request.LogoColor = "#FF8833";
                            $scope.request.showOfferprice = true;
                        }
                    }
                };

                $scope.updateRequest();

                $rootScope.$on('RequestDetailCtrl:requestChanged', function () {
                    //$scope.updateRequest();
                });


                $scope.goToList = function () {
                    $state.go('tab.scan-shop-list');
                };

                $scope.approveBid = function (reqId) {

                    /*
                    Request.BidsUpdate(reqId, userID, 'APPROVED').then(function (data) {
                        if (data == "ERROR") {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Request can not be approved.'
                            });
                        } else {
                            $scope.request.status = "APPROVED";
                            $rootScope.$emit('ScanShopList:listChanged');
                            $ionicPopup.alert({
                                title: 'Information',
                                template: 'Request is approved.'
                            });
                        }
                    });
                    */

                    var confirmPopup = $ionicPopup.confirm({
                         title: 'Shopping Choice',
                         template: 'How do you prefer to continue?',
                         okText: 'Online Code',
                         cancelText: 'Go To Cashier',
                         okType:'button-positive',
                         cancelType:'button-positive'
                       });

                       confirmPopup.then(function(res) {
                         var codetype = 'cashier';
                         if(res) {
                             codetype = 'online';
                         }

                         var code = $scope.request.req_id.toString();
                         if ($scope.request.offer_code)
                            code = code + $scope.request.offer_code.toString();
                         else {
                             code = code + 'XXX';
                         }
                         if ($scope.request.auto_offer_id)
                            code = code + $scope.request.auto_offer_id.toString();
                         else {
                             code = code + 'YYY';
                         }
                         $state.go('tab.request-code', {
                             codetype: codetype,
                             code:  code
                         });
                       });
                };

                $scope.rejectBid = function (reqId) {
                    Request.BidsUpdate(reqId, userID, 'REJECTED').then(function (data) {
                        if (data == "ERROR") {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Request can not be rejected.'
                            });
                        } else {
                            $scope.request.status = "REJECTED";
                            $rootScope.$emit('ScanShopList:listChanged');
                            $state.go('tab.scan-shop-list');
                        }
                    });
                };
            })

            .controller('RequestCodeCtrl', function ($rootScope, $scope, $state, $stateParams, $ionicScrollDelegate, SQLiteStore) {

                $scope.codetype = $stateParams.codetype;
                $scope.code = $stateParams.code;

                $scope.goToList = function () {
                    $state.go('tab.scan-shop-list');
                };
            })

            .controller('ScanShopListCtrl', function ($rootScope, $scope, $state, $stateParams, $ionicScrollDelegate, ScanShopList, SQLiteStore) {

                $rootScope.$on('ScanShopList:listChanged', function () {
                    $scope.listType = $stateParams.listType;
                    if ($scope.listType == null || typeof $scope.listType === 'undefined') {
                        $scope.listType = 'waiting';
                        $scope.changeView('waiting');
                    }
                    $scope.updateList();
                });

                $scope.updateList = function () {
                    $scope.waitingList = null;
                    $scope.orderList = null;
                    $scope.closedList = null;

                    ScanShopList.GetShopList(userID).then(function (data) {
                        if (undefined !== data && data.length) {
                            if (data.length < 1) {

                            } else {
                                $scope.waitingList = ScanShopList.waiting(data);
                                $scope.orderList = ScanShopList.order(data);
                                $scope.closedList = ScanShopList.closed(data);
                            }
                        }

                    });
                };

                $scope.listType = 'waiting';
                $scope.waitingSelected = 'active';

                $scope.changeView = function (value) {
                    $scope[value + 'Selected'] = 'active';
                    $scope.listType = value;
                    if (value === 'waiting') {
                        $scope['closedSelected'] = '';
                        $scope['ordersSelected'] = '';
                    } else if (value === 'closed') {
                        $scope['waitingSelected'] = '';
                        $scope['ordersSelected'] = '';
                    } else {

                        $scope['closedSelected'] = '';
                        $scope['waitingSelected'] = '';
                    }
                    $ionicScrollDelegate.scrollTop();
                };

                $scope.doRefresh = function (value) {

                    ScanShopList.GetShopList(userID).then(function (data) {
                        if (undefined !== data && data.length) {
                            if (data.length < 1) {

                            } else {
                                $scope.waitingList = ScanShopList.waiting(data);
                                $scope.orderList = ScanShopList.order(data);
                                //$scope.orderList = ScanShopList.order(data).concat($scope.orderList);
                                $scope.closedList = ScanShopList.closed(data);

                            }
                        }
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                };

                $scope.updateList();

                $scope.listType = 'waiting';

                $scope.goToDeal = function (item) {

                    $state.go('tab.request-detail', {
                        req_id: item.req_id,
                        request: item
                    });
                    //$rootScope.$emit('RequestDetailCtrl:requestChanged');
                };
            })

            .controller('ProfileCtrl', function ($scope, $ionicActionSheet, Customer, $state, $filter,
                $ionicPopup, $stateParams, $ionicSideMenuDelegate, $rootScope, $filter, SQLiteStore) {

                    $scope.comeFromLoginPage = $stateParams.comeFromLoginPage;
                    var emptyUser = {
                        "user": {
                            "user_id": "",
                            "first_name": "",
                            "last_name": "",
                            "email": "",
                            "cell_phone": "",
                            "dob": null,
                            "street": "",
                            "unit_no": "",
                            "city": "",
                            "postcode": "",
                            "country": "CA",
                            "gender": "M",
                            "province": ""
                        }
                    };
                    //$scope.userID = null;
                    $scope.user = emptyUser.user;
                    $scope.selectedProvince = null;
                    $scope.selectedCity = null;

                    $rootScope.$on('ProfileCtrl:userChanged', function () {
                        $scope.GetUser();
                    });

                    $rootScope.$on('ProfileCtrl:userEmptied', function () {
                        userID = null;
                        $scope.user = emptyUser.user;
                    });

                    Customer.GetProvinces('CA')
                    .then(function (data) {

                        if (data.length > 0) {
                            $scope.provinces = data;
                        }
                    });

                    $scope.GetUser = function () {

                        if (typeof userID !== 'undefined' && userID !== null) {
                            Customer.GetUserProfile(userID)
                            .then(function (data) {

                                if (data.length > 0) {
                                    $scope.user = data[0];

                                    $scope.user.dob = new Date($scope.user.dob);

                                    Customer.GetCities('CA', $scope.user.province)
                                    .then(function (data) {

                                        if (data.length > 0) {
                                            $scope.cities = data;
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            $scope.user = emptyUser.user;
                        }
                    }

                    $scope.GetUser();


                    $scope.UpdateCities = function (item) {
                        $scope.cities = null;
                        Customer.GetCities('CA', $scope.user.province)
                        .then(function (data) {

                            if (data.length > 0) {
                                $scope.cities = data;
                            }
                        });
                    }

                    $scope.logOut = function () {

                        SQLiteStore.set('userID', null).then(function() {
                            userID = null;
                            $rootScope.$emit('SplashCtrl:changed');
                            $rootScope.$emit('ProfileCtrl:userChanged');
                            $scope.goToSplash();
                        });
                    }

                    $scope.goToSplash = function () {
                        $state.go('splash');
                    }

                    $scope.SaveProfile = function () {

                        Customer.SaveProfile(userID,
                            $scope.user.first_name,
                            $scope.user.last_name,
                            $scope.user.cell_phone,
                            $filter('lowercase')($scope.user.email),
                            $scope.user.dob,
                            $scope.user.street,
                            'CA', //$scope.user.country,
                            $scope.user.province,
                            $scope.user.city,
                            $scope.user.postcode,
                            $scope.user.gender
                        ).then(function (data) {

                            //alert(JSON.stringify(data, null, 4));
                            //alert(JSON.stringify(data[0].user_id, null, 4));
                            if (data[0].user_id > 0) {
                                SQLiteStore.set("userID", data[0].user_id).then(function() {
                                    userID = data[0].user_id;
                                    $rootScope.$emit('ProfileCtrl:userChanged');
                                    $state.go('tab.dash');
                                });

                                /*
                                $ionicPopup.alert({
                                    title: 'Information',
                                    template: 'Profile Saved'
                                }).then(function(res) {
                                    if ($scope.comeFromLoginPage) {
                                        $state.go('tab.dash');
                                        $rootScope.$emit('ProfileCtrl:userChanged');
                                    }
                                });
                                */
                            } else {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Profile Saving Failed'
                                });
                            }

                        });
                    };

                    $scope.addMedia = function () {
                        $scope.hideSheet = $ionicActionSheet.show({
                            buttons: [
                                {
                                    text: 'Take photo'
                                },
                                {
                                    text: 'Photo from library'
                                }
                            ],
                            titleText: 'Add Image',
                            cancelText: 'Cancel',
                            buttonClicked: function (index) {
                                $scope.addImage(index);
                            }
                        });
                    };

                    $scope.addImage = function (type) {
                        $scope.hideSheet();

                        var options = optionsForType(type);

                        navigator.camera.getPicture(function (imageData) {
                            $scope.imgURI = "data:image/jpeg;base64," + imageData;
                            $scope.$apply();
                        }, function (error) {
                            console.log(error);
                        }, options);
                    };

                    function optionsForType(type) {
                        var source;
                        switch (type) {
                            case 0:
                            source = Camera.PictureSourceType.CAMERA;
                            break;
                            case 1:
                            source = Camera.PictureSourceType.PHOTOLIBRARY;
                            break;
                        }
                        return {
                            quality: 75,
                            destinationType: Camera.DestinationType.DATA_URL,
                            sourceType: source,
                            allowEdit: true,
                            encodingType: Camera.EncodingType.JPEG,
                            targetWidth: 128,
                            targetHeight: 128,
                            popoverOptions: CameraPopoverOptions,
                            saveToPhotoAlbum: false
                        };
                    };
                })
                .controller('StoreDetailCtrl', function ($rootScope, $scope, $sce, $stateParams, $state, Stores, $ionicPopup, SQLiteStore) {

                    $scope.goToStoreList = function () {
                        $state.go('tab.stores');
                    };

                    $scope.storeId = $stateParams.storeId;
                    $scope.chosenStore = null;

                    $scope.GetStore = function (storeId) {

                        Stores.GetStore(storeId).then(function (data) {
                            if (data.length < 1) {} else {
                                $scope.chosenStore = data[0];
                            }
                        });
                    }

                    $scope.GetStore($scope.storeId);

                    $scope.choseStore = function () {

                        SQLiteStore.set('storeID', $scope.storeId).then(function() {

                            storeID = $scope.storeId;
                            $rootScope.$emit('StoresCtrl:storeChanged');

                            $state.go('tab.stores');
                            /*
                            $ionicPopup.alert({
                                title: 'Information',
                                template: 'Store chosed.'
                            });
                            */
                        });
                    };

                })
                .controller('ProfileMenuCtrl', function($scope, $ionicSideMenuDelegate) {

                })
                .controller('NavController', function($scope, $ionicSideMenuDelegate) {
                    $scope.toggleLeft = function() {
                        $ionicSideMenuDelegate.toggleLeft();
                    };
                });
