(function() {
    angular.module('staffimForm')
        .config(formlyConfig)
        .run(datepickerConfig)
        .run(formlyValidation)
        .run(materialFields);

    formlyConfig.$inject = ['formlyConfigProvider', 'CONFIG'];
    function formlyConfig(formlyConfigProvider, CONFIG) {
        if (CONFIG.debug === false) {
            formlyConfigProvider.disableWarnings = true;
            if (apiCheck !== 'undefined') {
                apiCheck.globalConfig.disabled = true;
            }
        }

        formlyConfigProvider.extras.removeChromeAutoComplete = true;
        formlyConfigProvider.extras.errorExistsAndShouldBeVisibleExpression = 'form.$submitted';
    }

    formlyValidation.$inject = ['formlyConfig', 'formlyValidationMessages'];
    function formlyValidation(formlyConfig, formlyValidationMessages) {
        formlyConfig.extras.errorExistsAndShouldBeVisibleExpression = 'form.$submitted';
        formlyValidationMessages.addStringMessage('require', 'Обязательно для заполнения');
    }

    materialFields.$inject = ['formlyConfig', 'SUFormatterDate', '$q'];
    function materialFields(formlyConfig, SUFormatterDate, $q) {
        function _defineProperty(obj, key, value) {
            if (key in obj) {
                Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
            } else {
                obj[key] = value;
            }

            return obj;
        }

        formlyConfig.setType({
            name: 'input',
            templateUrl: '/staffim-form/input.html',
            defaultOptions: {
                modelOptions: {
                    //updateOn: 'submit'
                },
                className: 'form-group'
            }
        });

        formlyConfig.setType({
            name: 'textarea',
            templateUrl: '/staffim-form/textarea.html',
            defaultOptions: {
                modelOptions: {
                    //updateOn: 'submit'
                },
                ngModelAttrs: {
                    rows: {attribute: 'rows'},
                    cols: {attribute: 'cols'}
                },
                className: 'form-group'
            }
        });

        formlyConfig.setType({
            name: 'switch',
            templateUrl: '/staffim-form/switch.html',
            link: function($scope) {
                if (angular.isUndefined($scope.to.falseValue)) {
                    $scope.to.falseValue = false;
                }
                if (angular.isUndefined($scope.to.trueValue)) {
                    $scope.to.trueValue = true;
                }
                if (angular.isUndefined) {
                    $scope.model[$scope.options.key] = $scope.to.falseValue;
                }
            }
        });

        function refreshAsyncSelect($scope, query, values, lastQuery, lastLoadedData, selectedData, isFirst) {
            var defer = $q.defer();

            if (isFirst) {
                selectedData = $scope.to.defaultOptions;
                isFirst = false;
            }

            selectedData = _.filter(selectedData, function(item) {
                return _.indexOf(values, item.id) !== -1;
            });

            _.each(values, function(value) {
                var findSelected = _.find(selectedData, function(item) {
                    return value === item.id;
                });

                if (!findSelected) {
                    var findLastLoaded = _.find(lastLoadedData, function(item) {
                        return value === item.id;
                    });

                    if (findLastLoaded) {
                        selectedData.push(findLastLoaded);
                    }
                }
            });

            if (!_.isUndefined(lastQuery) && (_.isEqual(query, lastQuery) || !query && !lastQuery)) {
                defer.resolve(lastLoadedData);
            } else {
                $scope.to.refreshOptions(query)
                    .then(function(data) {
                        lastLoadedData = angular.copy(data);
                        lastQuery = query;

                        _.each(selectedData, function(selectedItem) {
                            var find = _.find(data, function(item) {
                                return selectedItem.id === item.id;
                            });

                            if (!find) {
                                data.push(selectedItem);
                            }
                        });

                        defer.resolve(data);
                    });
            }

            return defer.promise;
        }

        formlyConfig.setType({
            name: 'select-async-search',
            defaultOptions: {
                className: 'form-group'
            },
            templateUrl: '/staffim-form/selectAsyncSearch.html',
            link: function($scope) {
                $scope.selectOptions = {
                    debounce: 200
                };
                if (!angular.isUndefined($scope.to.cleanModel)) {
                    $scope.selectOptions.cleanModel = true;
                }

                var lastQuery,
                    lastLoadedData = [],
                    selectedData = [],
                    isFirst = true;

                $scope.refreshData = function(query) {
                    var values = angular.copy($scope.model[$scope.options.key]);

                    if (!values) {
                        values = [];
                    } else {
                        values = [values];
                    }

                    return refreshAsyncSelect($scope, query, values, lastQuery, lastLoadedData, selectedData, isFirst);
                };
            }
        });

        formlyConfig.setType({
            name: 'select-multiple-async-search',
            defaultOptions: {
                className: 'form-group'
            },
            templateUrl: '/staffim-form/selectMultipleAsyncSearch.html',
            link: function($scope) {
                $scope.selectOptions = {
                    debounce: 200
                };
                var lastQuery,
                    lastLoadedData = [],
                    selectedData = [],
                    isFirst = true;

                $scope.refreshData = function(query) {
                    var values = $scope.model[$scope.options.key];

                    return refreshAsyncSelect($scope, query, values, lastQuery, lastLoadedData, selectedData, isFirst);
                };
            }
        });

        formlyConfig.setWrapper([
            {
                name: 'groupEdit',
                templateUrl: '/staffim-form/groupEditWrapper.html'
            }
        ]);

        var attributes = [
            'date-disabled',
            'custom-class',
            'show-weeks',
            'starting-day',
            'init-date',
            'min-mode',
            'max-mode',
            'format-day',
            'format-month',
            'format-year',
            'format-day-header',
            'format-day-title',
            'format-month-title',
            'year-range',
            'shortcut-propagation',
            'uib-datepicker-popup',
            'show-button-bar',
            'current-text',
            'clear-text',
            'close-text',
            'close-on-date-selection',
            'datepicker-append-to-body'
        ];

        var bindings = [
            'datepicker-mode',
            'min-date',
            'max-date'
        ];

        var ngModelAttrs = {};

        _.each(attributes, function(attr) {
            ngModelAttrs[_.camelcase(attr)] = {attribute: attr};
        });

        _.each(bindings, function(binding) {
            ngModelAttrs[_.camelcase(binding)] = {bound: binding};
        });

        formlyConfig.setType({
            name: 'datepicker',
            templateUrl: '/staffim-form/datepicker.html',
            defaultOptions: {
                ngModelAttrs: ngModelAttrs,
                templateOptions: {
                    datepickerOptions: {
                        showWeeks: false,
                        format: 'MM.dd.yyyy',
                        formatDayTitle: 'MMM yyyy',
                        initDate: new Date()
                    }
                },
                parsers: [function(value) {
                    return SUFormatterDate.parser(value);
                }],
                formatters: [function(value) {
                    return SUFormatterDate.formatter(value);
                }]
            },
            controller: ['$scope', function ($scope) {
                $scope.datepicker = {};
                $scope.datepicker.opened = false;
                $scope.datepicker.open = function ($event) {
                    $scope.datepicker.opened = true;
                };
            }]
        });
    }

    datepickerConfig.$inject = ['uibDatepickerPopupConfig'];
    function datepickerConfig(uibDatepickerPopupConfig) {
        uibDatepickerPopupConfig.currentText = 'Сегодня';
        uibDatepickerPopupConfig.clearText = 'Очистить';
        uibDatepickerPopupConfig.closeText = 'Закрыть';
    }
})();
