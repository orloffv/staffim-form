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

    materialFields.$inject = ['formlyConfig', 'SUFormatterDate', '$q', 'moment', 'SUFormatterWeek', '$timeout'];
    function materialFields(formlyConfig, SUFormatterDate, $q, moment, SUFormatterWeek, $timeout) {
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
                } else {
                    $scope.to.falseValue = '\'' + $scope.to.falseValue + '\'';
                }

                if (angular.isUndefined($scope.to.trueValue)) {
                    $scope.to.trueValue = true;
                } else {
                    $scope.to.trueValue = '\'' + $scope.to.trueValue + '\'';
                }

                if (angular.isUndefined($scope.model[$scope.options.key]) || $scope.to.setValueAfterInit) {
                    $scope.model[$scope.options.key] = _.isString($scope.to.falseValue) ? _.replaceAll($scope.to.falseValue, '\'', '') : $scope.to.falseValue;
                }

                $scope.getViewValue = function() {
                    return $scope.model[$scope.options.key] === (_.isString($scope.to.falseValue) ? _.replaceAll($scope.to.falseValue, '\'', '') : $scope.to.falseValue) ?
                        $scope.to.falseLabel :
                        $scope.to.trueLabel;
                };
            },
            defaultOptions: {
                validators: {
                    required: {
                        expression: function(viewValue, modelValue) {
                            var value = modelValue || viewValue;

                            return !_.isNull(value);
                        }
                    }
                }
            }
        });

        formlyConfig.setType({
            name: '3switch',
            templateUrl: '/staffim-form/3switch.html',
            link: function($scope) {
                if (angular.isUndefined($scope.to.falseValue)) {
                    $scope.to.falseValue = false;
                } else {
                    $scope.to.falseValue = $scope.to.falseValue;
                }

                if (angular.isUndefined($scope.to.trueValue)) {
                    $scope.to.trueValue = true;
                } else {
                    $scope.to.trueValue = $scope.to.trueValue;
                }
            }
        });

        formlyConfig.setType({
            name: 'number',
            templateUrl: '/staffim-form/number.html',
            link: function($scope) {
                $scope.numberOptions = {
                    min: 0,
                    step: 1,
                    hideHint: true,
                    disableDecimal: true,
                    decimalPlaces: 0
                };
                if (!_.isUndefined($scope.to.max)) {
                    $scope.numberOptions.max = $scope.to.max;
                }
            },
            defaultOptions: {
                className: 'form-group form-counter m-b-0'
            }
        });

        function refreshAsyncSelect($scope, query, values) {
            var defer = $q.defer();

            $scope.selectedData = _.filter($scope.selectedData, function(item) {
                return _.contains(values, item.id);
            });

            _.each(values, function(value) {
                var findSelected = _.find($scope.selectedData, function(item) {
                    return value === item.id;
                });

                if (!findSelected) {
                    var findLastLoaded = _.find($scope.lastLoadedData, function(item) {
                        return value === item.id;
                    });

                    if (findLastLoaded) {
                        $scope.selectedData.push(findLastLoaded);
                    }
                }
            });

            function updateData(data, selectedData) {
                _.each(selectedData, function(selectedItem) {
                    var find = _.find(data, function(item) {
                        return selectedItem.id === item.id;
                    });

                    if (!find) {
                        data.push(selectedItem);
                    }
                });

                return data;
            }

            if (!_.isUndefined($scope.lastQuery) && (_.isEqual(query, $scope.lastQuery) || !query && !$scope.lastQuery)) {
                defer.resolve(updateData($scope.lastLoadedData, $scope.selectedData));
            } else {
                $scope.to.refreshOptions(query)
                    .then(function(data) {
                        $scope.lastLoadedData = angular.copy(data);
                        $scope.lastQuery = query;

                        defer.resolve(updateData(data, $scope.selectedData));
                    });
            }

            return defer.promise;
        }

        formlyConfig.setType({
            name: 'simpleSelect',
            defaultOptions: {
                className: 'form-group',
                parsers: [function(value) {
                    if (value === 'true') {
                        return true;
                    } else if (value === 'false') {
                        return false;
                    }

                    return value;
                }],
                formatters: [function(value) {
                    if (value === true) {
                        return 'true';
                    } else if (value === false) {
                        return 'false';
                    }

                    return value;
                }]
            },
            templateUrl: '/staffim-form/simpleSelect.html',
            link: function($scope) {
                $scope.to.options = _.map($scope.to.options, function(item) {
                    if (!_.isObject(item)) {
                        return {
                            id: item,
                            name: item
                        };
                    }

                    return item;
                });

                $scope.getViewValue = function() {
                    var value = _.has($scope.model, $scope.options.key) ? $scope.model[$scope.options.key] : null;
                    value = _.find($scope.to.options, function(option) {
                        return option.id === value;
                    });

                    return value ? value.name : value;
                };
            }
        });

        formlyConfig.setType({
            name: 'select',
            defaultOptions: {
                className: 'form-group',
                templateOptions: {
                    inputGroupClassName: 'input-group-oi-select'
                }
            },
            templateUrl: '/staffim-form/select.html',
            link: function($scope) {
                $scope.selectOptions = {};
                if (!angular.isUndefined($scope.to.cleanModel)) {
                    $scope.selectOptions.cleanModel = true;
                }
                $scope.to.options = _.map($scope.to.options, function(item) {
                    if (!_.isObject(item)) {
                        return {
                            id: item,
                            name: item
                        };
                    }

                    return item;
                });

                $scope.getViewValue = function() {
                    var value = _.has($scope.model, $scope.options.key) ? $scope.model[$scope.options.key] : null;
                    value = _.find($scope.to.options, function(option) {
                        return option.id === value;
                    });

                    return value ? value.name : value;
                };
            }
        });

        formlyConfig.setType({
            name: 'select-async-search',
            defaultOptions: {
                className: 'form-group',
                templateOptions: {
                    inputGroupClassName: 'input-group-oi-select'
                }
            },
            templateUrl: '/staffim-form/selectAsyncSearch.html',
            link: function($scope) {
                $scope.selectOptions = {
                    debounce: 200
                };
                if (!angular.isUndefined($scope.to.cleanModel)) {
                    $scope.selectOptions.cleanModel = true;
                }

                $scope.lastQuery = undefined;
                $scope.lastLoadedData = [];
                $scope.selectedData = $scope.to.defaultOptions;

                $scope.refreshData = function(query) {
                    var values = angular.copy($scope.model[$scope.options.key]);

                    if (!values) {
                        values = [];
                    } else {
                        values = [values];
                    }

                    return refreshAsyncSelect($scope, query, values);
                };
            }
        });

        formlyConfig.setType({
            name: 'select-multiple-async-search',
            defaultOptions: {
                className: 'form-group',
                templateOptions: {
                    inputGroupClassName: 'input-group-oi-select'
                }
            },
            templateUrl: '/staffim-form/selectMultipleAsyncSearch.html',
            link: function($scope) {
                $scope.selectOptions = {
                    debounce: 200
                };

                $scope.lastQuery = undefined;
                $scope.lastLoadedData = [];
                $scope.selectedData = $scope.to.defaultOptions;

                $scope.refreshData = function(query) {
                    var values = $scope.model[$scope.options.key];

                    return refreshAsyncSelect($scope, query, values);
                };
            }
        });

        formlyConfig.setWrapper([
            {
                name: 'groupEdit',
                templateUrl: '/staffim-form/groupEditWrapper.html'
            }
        ]);

        formlyConfig.setWrapper([
            {
                name: 'inlineEditLast',
                templateUrl: '/staffim-form/inlineEditLastWrapper.html'
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

        function datePickerTemplateOptions(showWeeks) {
            return {
                datepickerOptions: {
                    startingDay: 1,
                    showWeeks: !!showWeeks,
                    format: 'dd.MM.yyyy',
                    formatDayTitle: 'MMM yyyy',
                    initDate: new Date(),
                    customClass2: 'week'
                }
            };
        };

        var getDatepickerController = function() {
            return ['$scope', '$filter', function ($scope, $filter) {
                $scope.getViewValue = function() {
                    return $filter('date')($scope.model[$scope.options.key], $scope.to.format);
                };

                $scope.datepicker = {};
                $scope.datepicker.opened = false;
                $scope.datepicker.open = function () {
                    $scope.datepicker.opened = true;
                };
            }];
        };

        formlyConfig.setType({
            name: 'datepicker',
            templateUrl: '/staffim-form/datepicker.html',
            defaultOptions: {
                ngModelAttrs: ngModelAttrs,
                templateOptions: datePickerTemplateOptions(),
                parsers: [function(value) {
                    return SUFormatterDate.parser(value);
                }],
                formatters: [function(value) {
                    return SUFormatterDate.parser(value);
                }]
            },
            controller: getDatepickerController(),
            link: function($scope, $element) {
                $scope.$watch(function($scope) {
                    return $scope.model[$scope.options.key];
                }, function(newVal) {
                    if (newVal) {
                        var date = moment(newVal);
                        $element.find('[uib-datepicker-popup]').val(date.format('DD-MM-YYYY'));
                    }
                });
            }
        });

        formlyConfig.setType({
            name: 'weekpicker',
            templateUrl: '/staffim-form/datepicker.html',
            defaultOptions: {
                ngModelAttrs: ngModelAttrs,
                templateOptions: datePickerTemplateOptions(true),
                parsers: [function(value) {
                    return SUFormatterWeek.parser(value);
                }],
                formatters: [function(value) {
                    return SUFormatterWeek.parser(value);
                }]
            },
            controller: getDatepickerController(),
            link: function($scope, $element) {
                $scope.$watch(function($scope) {
                    return $scope.model[$scope.options.key];
                }, function(newVal) {
                    if (newVal) {
                        $timeout(function() {
                            var date = moment(newVal);
                            $element.find('[uib-datepicker-popup]').val(date.day(1).format('DD-MM-YYYY') + ' - ' + date.day(7).format('DD-MM-YYYY'));
                        });
                    }
                });
            }
        });
    }

    datepickerConfig.$inject = ['uibDatepickerPopupConfig'];
    function datepickerConfig(uibDatepickerPopupConfig) {
        uibDatepickerPopupConfig.currentText = 'Сегодня';
        uibDatepickerPopupConfig.clearText = 'Очистить';
        uibDatepickerPopupConfig.closeText = 'Закрыть';
    }
})();
