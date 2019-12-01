angular.module('starter.services', [])


.factory('Stores', function ($http) {

	return {

		GetStore: function (storeId) {

			var x = $http.get('http://104.245.37.101:3000/GetStore?store_id=' + storeId).
			then(function (response) {
					return response.data;
				},
				function (error) {

				})
			return x;
		},

		GetStores: function (latitude, longitude) {

			var x = $http.get('http://104.245.37.101:3000/listStores?latitude=' + latitude + '&longitude=' + longitude).
			then(function (response) {
					return response.data;
				},
				function (error) {

				})
			return x;
		}
	}

})

.factory('ProductSku', function ($http) {

	return {

		GetSkuDetail: function (Sku) {

			var x = $http.get('http://104.245.37.101:3000/Product?Sku=' + Sku).
			then(function (response) {

					return response.data;
				},
				function (error) {

				})
			return x;
		},

		MakeRequest: function (userId, retailerId, storeId, productId, longitude, latitude, listPrice, currency, colorInfo,
			sizeInfo, askedPrice, askedDisc, askedQty, expiryTime) {

			var Indata = {
				userId: userId,
				retailerId: retailerId,
				storeId: storeId,
				productId: productId,
				longitude: longitude,
				latitude: latitude,
				listPrice: listPrice,
				currency: currency,
				colorInfo: colorInfo,
				sizeinfo: sizeInfo,
				askedPrice: askedPrice,
				askedDisc: (askedPrice / listPrice) * 100,
				askedQty: askedQty,
				expiryTime: expiryTime
			};

			var config = {
				params: Indata
			};

			var x = $http.get('http://104.245.37.101:3000/Request', config).
			then(function (response) {

					return response.data;
				},
				function (error) {
					alert(error);

				})
			return x;


		}
	}
})



.factory('ScanShopList', function ($http) {

	function filterByWaitingStatus(obj) {

		if (obj.status == "ASKED" || obj.status == "TRANSFERED") {
			return true;
		}
	};

	function filterByOrderStatus(obj) {

		if (obj.status == "OFFERMADE") {
			return true;
		}
	};

	function filterByClosedStatus(obj) {
		if (obj.status != "ASKED" && obj.status != "TRANSFERED" && obj.status != "OFFERMADE") {
			return true;
		}
	};


	return {

		GetShopList: function (userId) {

			var x = $http.get('http://104.245.37.101:3000/RequestList?userId=' + userId).
            //var x = $http.get('http://localhost:3000/RequestList?userId=' + userId).
			then(function (response) {

					return response.data;
				},
				function (error) {

				})
			return x;
		},

		waiting: function (data) {
			return data.filter(filterByWaitingStatus);
		},
		order: function (data) {
			return data.filter(filterByOrderStatus);
		},
		closed: function (data) {
			return data.filter(filterByClosedStatus);
		}
	};
})



.factory('Customer', function ($http) {

		return {
			GetUserProfile: function (userId) {
				var Indata = {
					userId: userId
				};

				var config = {
					params: Indata
				};

				var x = $http.get('http://104.245.37.101:3000/GetUser', config).
				then(function (response) {

						return response.data;
					},
					function (error) {
						console.error(JSON.stringify(error));

					})
				return x;
			},

            GetUserProfileByEmailAndCellPhone: function (email, cellphone) {
				var Indata = {
					email: email,
                    cellphone: cellphone
				};

				var config = {
					params: Indata
				};

				var x = $http.get('http://104.245.37.101:3000/UserProfileByEmailAndCellPhone', config).
				then(function (response) {

						return response.data;
					},
					function (error) {
						alert('error');
						alert(JSON.stringify(error));

					})
				return x;
			},

            GetProvinces: function (country) {

    			var x = $http.get('http://104.245.37.101:3000/Provinces?country=' + country).
    			then(function (response) {
    					return response.data;
    				},
    				function (error) {

    				})
    			return x;
    		},

            GetCities: function (country, province) {

    			var x = $http.get('http://104.245.37.101:3000/Cities?country=' + country + '&province='+province).
    			then(function (response) {
    					return response.data;
    				},
    				function (error) {

    				})
    			return x;
    		},

			SaveProfile: function (userId, first_name, last_name, cell_phone, email,
										dob, street, country, province, city, postal_code, gender) {

				var Indata = {
					userId: userId,
					first_name: first_name,
					last_name: last_name,
					cell_phone: cell_phone,
					email: email,
					dob: dob,
					street: street,
					country: country,
					province: province,
					city: city,
					postal_code: postal_code,
					gender: gender
				};

				var config = {
					params: Indata
				};

				var x = $http.get('http://104.245.37.101:3000/UserProfile', config).
				then(function (response) {

						return response.data;
					},
					function (error) {
						alert(error);

					})
				return x;
			}

		};

	})


    .factory('Request', function ($http) {

    		return {
    			BidsUpdate: function (requestId, userId, status) {
    				var Indata = {
                        req_id: requestId,
    					userId: userId,
                        status: status
    				};

    				var config = {
    					params: Indata
    				};

    				var x = $http.get('http://104.245.37.101:3000/RequestUpdate', config).
                    //var x = $http.get('http://localhost:3000/RequestUpdate', config).
    				then(function (response) {

    						return response.data[0];
    					},
    					function (error) {
    						alert('error');
    						alert(JSON.stringify(error));

    					})
    				return x;
    			}
    		};

    	})

        .factory('SQLiteStore', function ($cordovaSQLite) {

        		return {
        			set: function (key, value) {

                        var query = "UPDATE data_table SET value = ? WHERE key = ?";
                        var promise = $cordovaSQLite.execute(db, query, [value, key]).then(function(res) {

                        }, function (err) {
                          console.error(err);
                        });
                        return promise;
        			},

                    get: function (key) {

                        var query = "SELECT value FROM data_table WHERE key = ?";
                        var promise = $cordovaSQLite.execute(db, query, [key]).then(function(res) {
                            if (res.rows.length <= 0)
                                return null;

                            if (res.rows.item(0).value == null)
                                return null;

                            return Math.floor(res.rows.item(0).value);
                        }, function (err) {
                          console.error(err);
                          return null;
                        });
                        return promise;
        			}
        		};
        	})

	.factory('Yelp', function ($http, $q) {
		return {
			search: function (position) {
				return $http({
					method: "get",
					url: 'https://angular-google-maps-example.herokuapp.com/api/v1/yelp/search',
					params: {
						limit: 10,
						radius_filter: 500,
						sort: 1,
						ll: [position.coords.latitude, position.coords.longitude].join()
					}
				});
			}
		};
	});
