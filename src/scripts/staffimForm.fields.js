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

    materialFields.$inject = ['formlyConfig', 'SUFormatterDate'];
    function materialFields(formlyConfig, SUFormatterDate) {
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
            name: 'select',
            templateUrl: '/staffim-form/select.html',
            defaultOptions: function defaultOptions(options) {
                /* jshint maxlen:210 */
                var ngOptions =
                    options.templateOptions.ngOptions || 'option[to.valueProp || \'value\'] as option[to.labelProp || \'name\'] group by option[to.groupProp || \'group\'] for option in to.options';

                return {
                    ngModelAttrs: _defineProperty({}, ngOptions, {
                        value: options.templateOptions.optionsAttr || 'ng-options'
                    }),
                    modelOptions: {
                        //updateOn: 'submit'
                    },
                    className: 'form-group'
                };
            },
            link: function($scope) {
                $scope.getViewValue = function() {
                    var value = _.has($scope.model, $scope.options.key) ? $scope.model[$scope.options.key] : null;
                    _.each($scope.options.templateOptions.options, function(option) {
                        if (option[$scope.options.templateOptions.valueProp] === value) {
                            value = option[$scope.options.templateOptions.labelProp];
                        }
                    });

                    return value;
                };
            }
        });

        formlyConfig.setType({
            name: 'select-multiple',
            extends: 'select',
            templateUrl: '/staffim-form/selectMultiple.html'
        });

        formlyConfig.setType({
            name: 'select-async-search',
            extends: 'select',
            templateUrl: '/staffim-form/selectAsyncSearch.html'
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
