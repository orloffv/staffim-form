(function(){
    angular.module('staffimForm', ['staffimUtils', 'formly', 'ngSanitize', 'oi.select']);
    angular.module('staffimForm.wysiwyg', ['formly']);
})();

(function(){
    angular.module('staffimForm')
        .run(wrapperMaterial);

    wrapperMaterial.$inject = ['formlyConfig', '$templateCache', '$http'];
    function wrapperMaterial(formlyConfig, $templateCache, $http) {
        formlyConfig.templateManipulators.preWrapper.push(function(template, options, scope) {
            if (scope.formState && scope.formState.simple) {
                return $http.get('/staffim-form/materialSimpleWrapper.html', {cache: $templateCache}).then(function(response) {
                    return response.data.replace('<formly-transclude></formly-transclude>', template);
                });
            } else if (scope.formState && scope.formState.horizontal) {
                return $http.get('/staffim-form/materialHorizontalWrapper.html', {cache: $templateCache}).then(function(response) {
                    return response.data.replace('<formly-transclude></formly-transclude>', template);
                });
            } else {
                return $http.get('/staffim-form/materialWrapper.html', {cache: $templateCache}).then(function(response) {
                    return response.data.replace('<formly-transclude></formly-transclude>', template);
                });
            }
        });

        formlyConfig.templateManipulators.preWrapper.push(function(template, options) {
            if (options.templateOptions.addonLeft) {
                return $http.get('/staffim-form/addonLeft.html', {cache: $templateCache}).then(function(response) {
                    return response.data.replace('<formly-transclude></formly-transclude>', template);
                });
            } else if (options.templateOptions.addonRight) {
                return $http.get('/staffim-form/addonRight.html', {cache: $templateCache}).then(function(response) {
                    return response.data.replace('<formly-transclude></formly-transclude>', template);
                });
            } else {
                return template;
            }
        });
    }
})();

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
                    } else if (value === 'null') {
                        return null;
                    }

                    return value;
                }],
                formatters: [function(value) {
                    if (value === true) {
                        return 'true';
                    } else if (value === false) {
                        return 'false';
                    } else if (value === null) {
                        return 'null';
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
            name: 'select-multiple',
            extends: 'select',
            defaultOptions: {
                ngModelAttrs: {
                    'true': {
                        value: 'multiple'
                    }
                }
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

(function(){
    angular.module('staffimForm')
        .factory('SFService', SFService);

    SFService.$inject = ['SUNotify', '$q', '$timeout', '$injector', 'CONFIG'];
    function SFService(SUNotify, $q, $timeout, $injector, CONFIG) {
        /* jshint validthis: true */
        var service = function() {
            this.formOptions = {};
            this.originalModel = {};
            this.formModel = {};
            this.form = null;
            this.fields = [];
            this.successMessage = null;
            this.errorMessage = null;
            this.patchFields = [];
            this.additionalPatchFields = [];
            this.patchParams = {};
            this.modal = null;
            this.saveFunc = null;
            this.tableParams = null;
            this.onSuccess = function() {
                return true;
            };
            this.onBeforeSave = function() {
                return true;
            };
            this.status = 'draft';
            this.offline = false;
            this.offlineCache = null;
            this.offlineCacheKey = null;
            this.offlineCacheMaxAge = null;
            this.viewAfterSave = true;
            this.enabledBackup = false;
            this.backupInterval = null;
            this.initBackupData = {};

            return this;
        };

        service.prototype.setFormOptions = setFormOptions;
        service.prototype.setOriginalModel = setOriginalModel;
        service.prototype.setFields = setFields;
        service.prototype.setSuccessMessage = setSuccessMessage;
        service.prototype.setErrorMessage = setErrorMessage;
        service.prototype.setModal = setModal;
        service.prototype.setTableOptions = setTableOptions;
        service.prototype.setViewOptions = setViewOptions;
        service.prototype.setFormStateOptions = setFormStateOptions;
        service.prototype.setSimpleOptions = setSimpleOptions;
        service.prototype.setViewWithoutClassOptions = setViewWithoutClassOptions;
        service.prototype.setEditVerticalOptions = setEditVerticalOptions;
        service.prototype.setEditOptions = setEditOptions;
        service.prototype.setTableParams = setTableParams;
        service.prototype.setPatchFields = setPatchFields;
        service.prototype.setAdditionalPatchFields = setAdditionalPatchFields;
        service.prototype.setOnSuccess = setOnSuccess;
        service.prototype.setOnBeforeSave = setOnBeforeSave;
        service.prototype.setPatchParams = setPatchParams;
        service.prototype.setNotViewAfterSave = setNotViewAfterSave;
        service.prototype.setViewAfterSave = setViewAfterSave;
        service.prototype.setSaveFunction = setSaveFunction;
        service.prototype.getFormModel = getFormModel;
        service.prototype.getFields = getFields;
        service.prototype.getPatchFields = getPatchFields;
        service.prototype.getPatchParams = getPatchParams;
        service.prototype.getFormOptions = getFormOptions;
        service.prototype.onSubmit = onSubmit;
        service.prototype.resetModel = resetModel;
        service.prototype.submit = submit;
        service.prototype.save = save;
        service.prototype.patchRemove = patchRemove;
        service.prototype.updateFields = updateFields;
        service.prototype.setEnableBackup = setEnableBackup;
        service.prototype.backup = backup;
        service.prototype.getBackupKey = getBackupKey;
        service.prototype.removeBackup = removeBackup;
        service.prototype.restoreBackup = restoreBackup;
        service.prototype.getBackupCache = getBackupCache;
        service.prototype.destroy = destroy;
        service.prototype.setOffline = setOffline;
        service.prototype.isOffline = isOffline;
        service.prototype.isOnline = isOnline;
        service.prototype.saveOffline = saveOffline;

        function getBackupCache() {
            var CacheFactory = $injector.get('CacheFactory');
            if (!CacheFactory.get('formCache')) {
                CacheFactory.createCache('formCache', {
                    storageMode: 'localStorage',
                    deleteOnExpire: 'aggressive',
                    verifyIntegrity: false,
                    recycleFreq: CONFIG.cacheRecycleFreq,
                    maxAge: CONFIG.formCacheAge
                });
            }

            return CacheFactory.get('formCache');
        }

        function destroy() {
            this.removeBackup();
            delete this.fields;
            delete this.formOptions;
            delete this.formModel;
            delete this.initBackupData;
            delete this.patchFields;
            delete this.patchParams;
            delete this.errorMessage;
            delete this.successMessage;
            delete this.originalModel;
            delete this.form;
            delete this.tableParams;
        }

        function setEnableBackup(enabled) {
            this.enabledBackup = enabled;

            this.removeBackup();

            if (enabled) {
                this.backup();
            }

            return this;
        }

        function backup() {
            if (this.status !== 'draft' || !this.enabledBackup) {
                return false;
            }

            var fields = this.getPatchFields();
            if (_.size(fields)) {
                var data = {};
                if (this.formModel.$getData) {
                    data = angular.copy(_.pick(this.formModel.$getData(), fields));
                } else {
                    data = angular.copy(_.pick(this.formModel, fields));
                }
                var key = this.getBackupKey();
                if (_.isUndefined(this.initBackupData[key])) {
                    this.initBackupData[key] = data;
                } else if (!_.isEqual(this.initBackupData[key], data)) {
                    if (!_.isEqual(this.getBackupCache().get(key), data)) {
                        this.getBackupCache().put(key, data);
                    }
                }
            }

            if (this.backupInterval) {
                $timeout.cancel(this.backupInterval);
            }
            this.backupInterval = $timeout(_.bind(this.backup, this), 5000);
        }

        function restoreBackup() {
            if (!this.enabledBackup) {
                return false;
            }

            var backupData = this.getBackupCache().get(this.getBackupKey());
            if (backupData) {
                this.formModel.$patchOriginalCustom = true;
                this.formModel.$decode(backupData);
            }
        }

        function removeBackup() {
            if (!this.enabledBackup) {
                return false;
            }
            this.getBackupCache().remove(this.getBackupKey());
            if (this.backupInterval) {
                $timeout.cancel(this.backupInterval);
                this.backupInterval = null;
            }
        }

        function getBackupKey(fields) {
            fields = fields || angular.copy(this.getPatchFields());
            if (_.has(this.formModel, 'id')) {
                fields.push(this.formModel.id);
            }
            if (this.formModel.modelName) {
                fields.push(this.formModel.modelName);
            }

            return fields.join(',');
        }

        function setFormOptions(formOptions) {
            this.formOptions = formOptions;

            return this;
        }

        function setFormStateOptions(formStateOptions) {
            formStateOptions.offline = this.offline;

            this.setFormOptions({
                formState: formStateOptions
            });

            return this;
        }

        function setSaveFunction(func) {
            this.saveFunc = func;

            return this;
        }

        function setTableOptions() {
            this.setFormStateOptions({
                edit: false,
                label: false
            });

            return this;
        }

        function setSimpleOptions() {
            this.setFormStateOptions({
                simple: true
            });

            return this;
        }

        function setNotViewAfterSave() {
            this.viewAfterSave = false;

            return this;
        }

        function setViewAfterSave() {
            this.viewAfterSave = true;

            return this;
        }

        function setOffline(offline, offlineCache, offlineCacheKey, offlineCacheMaxAge) {
            this.offline = offline;
            this.offlineCache = offlineCache;
            this.offlineCacheKey = offlineCacheKey;
            this.offlineCacheMaxAge = offlineCacheMaxAge;

            return this;
        }

        function isOffline() {
            return !!this.offline;
        }

        function isOnline() {
            return !this.offline;
        }

        function setViewOptions() {
            this.setFormStateOptions({
                edit: false,
                horizontal: true
            });

            return this;
        }

        function setViewWithoutClassOptions() {
            this.setFormStateOptions({
                edit: false,
                horizontal: true,
                horizontalClass: false
            });

            return this;
        }

        function setEditOptions() {
            this.setFormStateOptions({
                edit: true,
                horizontal: true
            });

            return this;
        }

        function setEditVerticalOptions() {
            this.setFormStateOptions({
                edit: true
            });

            return this;
        }

        function setOriginalModel(originalModel) {
            this.originalModel = originalModel;
            this.formModel = _.copyModel(this.originalModel);
            this.backup();
            this.restoreBackup();

            return this;
        }

        function setFields() {
            var fields = [];
            fields.push.apply(fields, arguments);

            this.fields = _.flatten(fields);
            this.backup();
            this.restoreBackup();

            return this;
        }

        function setSuccessMessage(successMessage) {
            this.successMessage = successMessage;

            return this;
        }

        function setOnSuccess(onSuccess) {
            this.onSuccess = onSuccess;

            return this;
        }

        function setOnBeforeSave(onBeforeSave) {
            this.onBeforeSave = onBeforeSave;

            return this;
        }

        function setErrorMessage(errorMessage) {
            this.errorMessage = errorMessage;

            return this;
        }

        function setPatchFields(patchFields) {
            this.patchFields = patchFields;

            return this;
        }

        function setAdditionalPatchFields(additionalPatchFields) {
            this.additionalPatchFields = additionalPatchFields;

            return this;
        }

        function setPatchParams(patchParams) {
            this.patchParams = patchParams;

            return this;
        }

        function setModal(modal) {
            this.modal = modal;

            updateFields(function(field) {
                if (_.has(field, 'templateOptions') && _.has(field.templateOptions, 'focus') && field.templateOptions.focus) {
                    delete field.templateOptions.focus;

                    if (!_.has(field, 'expressionProperties')) {
                        field.expressionProperties = {};
                    }
                    field.expressionProperties['templateOptions.focus'] = function() {
                        return true;
                    };
                }
            });

            return this;
        }

        function setTableParams(tableParams) {
            this.tableParams = tableParams;

            return this;
        }

        function getFormModel() {
            return this.formModel;
        }

        function getFields() {
            return this.fields;
        }

        function getFormOptions() {
            return this.formOptions;
        }

        function updateFields(callback) {
            if (_.size(this.fields)) {
                _.each(this.fields, function(field) {
                    if (_.has(field, 'fieldGroup')) {
                        _.each(field.fieldGroup, function(fieldGroupField) {
                            fieldGroupField = callback(fieldGroupField);
                        });
                    } else {
                        field = callback(field);
                    }
                });
            }
        }

        function getPatchFields() {
            if (!_.size(this.patchFields) && _.size(this.getFields())) {
                var fields = _.pluck(this.getFields(), 'key');

                _
                    .chain(this.getFields())
                    .filter(function(field) {
                        return !_.has(field, 'key') && _.has(field, 'fieldGroup');
                    })
                    .each(function(field) {
                        fields.push(_.pluck(field.fieldGroup, 'key'));
                    });

                fields = _.map(_.flatten(_.compact(fields)), function(field) {
                    return _.first(_.words(field, '.'));
                });

                return _.union(fields, this.additionalPatchFields);
            }

            return this.patchFields;
        }

        function getPatchParams() {
            return this.patchParams;
        }

        function patchRemove() {
            return this.submit('remove');
        }

        function save(patchAction) {
            if (!_.isNull(this.saveFunc)) {
                return this.saveFunc();
            } else if (this.isOffline()) {
                return this.saveOffline();
            }

            return this.formModel.$patch(this.getPatchFields(), patchAction, this.getPatchParams()).$asPromise();
        }

        function saveOffline() {
            var defer = $q.defer();
            if (this.isOffline() && this.offlineCache && this.offlineCacheKey) {
                var cacheData = this.offlineCache.get(this.offlineCacheKey) || {};
                _.deepExtend(cacheData, this.formModel.$getData(this.getPatchFields()));
                this.offlineCache.put(this.offlineCacheKey, cacheData, {
                    maxAge: this.offlineCacheMaxAge
                });
                this.formModel.$setPatchOriginal(this.formModel);
                defer.resolve(this.formModel);
            } else {
                defer.reject();
            }

            return defer.promise;
        }

        function submit(patchAction) {
            var that = this;

            return this.save(patchAction)
                .then(function(data) {
                    that.status = 'success';
                    that.removeBackup();
                    _.copyModel(that.formModel, that.originalModel);
                    SUNotify.success(that.successMessage);

                    if (that.modal) {
                        that.modal.dismiss('cancel');
                    }

                    if (that.tableParams) {
                        that.tableParams.reload();
                    }

                    if (_.isFunction(that.onSuccess)) {
                        var onSuccess = that.onSuccess(data);

                        (_.isObject(onSuccess) && _.isFunction(onSuccess.then) ? onSuccess : $q.when(onSuccess))
                            .finally(function() {
                                if (that.formOptions) {
                                    if (that.formOptions.updateInitialValue) {
                                        that.formOptions.updateInitialValue();
                                    }
                                    if (that.formOptions.formState && that.viewAfterSave) {
                                        if (that.formOptions.formState.edit) {
                                            that.formOptions.formState.edit = false;
                                        }
                                    }
                                }

                                that.status = 'draft';
                            });
                    }

                    return data;
                })
                .catch(function(errorResponse) {
                    SUNotify.errorResponse(errorResponse, that.errorMessage);

                    return $q.reject();
                });
        }

        function onSubmit() {
            if ((this.form && !this.form.$valid) || this.status === 'success') {
                return false;
            }

            if (_.isFunction(this.onBeforeSave)) {
                var onBeforeSave = this.onBeforeSave(this.formModel);
                var that = this;

                return (_.isObject(onBeforeSave) && _.isFunction(onBeforeSave.then) ? onBeforeSave : $q.when(onBeforeSave))
                    .then(
                    function() {
                        return that.submit();
                    }
                );

            }

            return this.submit();
        }

        function resetModel() {
            if (_.has(this.formOptions, 'resetModel')) {
                return this.formOptions.resetModel();
            }
        }

        return service;
    }
})();

(function(){
    angular.module('staffimForm')
        .directive('sfViewEdit', function($compile) {
            return {
                templateUrl: '/staffim-form/viewEdit.html',
                restrict: 'E',
                scope: {
                    title: '@',
                    iconClass: '@',
                    formInstance: '=',
                    allowEdit: '@'
                },
                link: function($scope, $el) {
                    $scope.options = $scope.formInstance.getFormOptions();
                    $scope.model = $scope.formInstance.getFormModel();
                    $scope.fields = $scope.formInstance.getFields();
                    $scope.onSubmit = $scope.formInstance.onSubmit.bind($scope.formInstance);
                    if (_.size($scope.fields) === 1 && _.has($scope.fields[0], 'fieldGroup') && _.has($scope.fields[0], 'templateOptions')) {
                        $scope.title = $scope.fields[0].templateOptions.label;
                        $scope.iconClass = $scope.fields[0].templateOptions.iconClass;
                        var key = $scope.fields[0].key;
                        if (!_.isUndefined(key)) {
                            $scope.fields = [
                                {
                                    key: key,
                                    fieldGroup: $scope.fields[0].fieldGroup
                                }
                            ];
                        } else {
                            $scope.fields = $scope.fields[0].fieldGroup;
                        }

                        $scope.formInstance.setFields($scope.fields);
                    }

                    var element = $($el).find('ul.actions');
                    if (!_.isUndefined($scope.allowEdit)) {
                        element.replaceWith($compile(element.clone().attr('permission-only', $scope.allowEdit))($scope));
                    }
                }
            };
        });
})();

(function(){
    angular.module('staffimForm')
        .directive('sfTableInlineEdit', function() {
            return {
                templateUrl: '/staffim-form/tableInlineEdit.html',
                restrict: 'A',
                scope: {
                    formInstance: '='
                },
                link: function($scope) {
                    $scope.$watch('formInstance', function() {
                        $scope.options = $scope.formInstance.getFormOptions();
                        $scope.model = $scope.formInstance.getFormModel();
                        $scope.fields = $scope.formInstance.getFields();
                        $scope.onSubmit = $scope.formInstance.onSubmit.bind($scope.formInstance);
                    });
                }
            };
        });
})();

'use strict';
(function() {
    angular.module('staffimForm')
        .directive('sfTableHeaderFilter', function() {
            return {
                restrict: 'E',
                templateUrl: '/staffim-form/tableHeaderFilter.html',
                replace: true,
                scope: {
                    params: '=',
                    formInstance: '=formInstance',
                    mapper: '='
                },
                controller: ['$scope', '$element', function($scope, $element) {
                    $scope.options = $scope.formInstance.getFormOptions();
                    $scope.model = $scope.formInstance.getFormModel();
                    $scope.fields = $scope.formInstance.getFields();
                    var className = null;

                    if (!_.size(_.compact(_.pluck($scope.fields, 'className')))) {
                        $scope.$watch(
                            function() {
                                return $element.find('ng-form > [formly-field]').length;
                            },
                            function (newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    $element.find('ng-form > [formly-field]').removeClass(className).addClass('col-sm-' + Math.floor(12 / newValue));
                                    className = 'col-sm-' + Math.floor(12 / newValue);
                                }
                            }
                        );
                    }

                    $scope.$watch('model', function(data) {
                        _.each($scope.mapper ? $scope.mapper(data) : data, function(value, key) {
                            if (value) {
                                if (value !== $scope.params.filter()[key]) {
                                    $scope.params.filter()[key] = value;
                                }
                            } else {
                                delete $scope.params.filter()[key];
                            }
                        });
                    }, true);
                }]
            };
        });
})();

(function() {
    angular.module('staffimForm.wysiwyg')
        .config(wysiwygField);

    wysiwygField.$inject = ['formlyConfigProvider'];
    function wysiwygField(formlyConfigProvider) {
        formlyConfigProvider.setType({
            name: 'wysiwyg',
            templateUrl: '/staffim-form/wysiwyg.html',
            defaultOptions: {
                modelOptions: {
                    //updateOn: 'submit'
                },
                className: 'form-group'
            },
            link: function($scope) {
                $scope.summernoteOptions = {
                    height: $scope.options.templateOptions.height || 300,
                    placeholder: $scope.options.templateOptions.placeholder
                };
            }
        });
    }
})();

angular.module('staffimForm').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('/staffim-form/3switch.html',
    "<div class=\"btn-group btn-group-toggle\">\n" +
    "    <label class=\"btn btn-default btn-sm waves-effect\" ng-model=\"model[options.key]\" uib-btn-radio=\"to.trueValue\">\n" +
    "        {{::to.trueLabel}}\n" +
    "    </label>\n" +
    "    <label class=\"btn btn-default btn-sm waves-effect\" ng-model=\"model[options.key]\" uib-btn-radio=\"to.falseValue\">\n" +
    "        {{::to.falseLabel}}\n" +
    "    </label>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/addonLeft.html',
    "<div class=\"input-group\" ng-class=\"::to.inputGroupClassName\">\n" +
    "    <div class=\"input-group-addon\"\n" +
    "         ng-style=\"::{cursor: to.addonLeft.onClick ? 'pointer' : 'inherit'}\"\n" +
    "         ng-click=\"to.addonLeft.onClick(options, this)\">\n" +
    "        <i class=\"{{::to.addonLeft.className}}\" ng-if=\"::to.addonLeft.className\"></i>\n" +
    "        <span ng-if=\"::to.addonLeft.text\">{{::to.addonLeft.text}}</span>\n" +
    "    </div>\n" +
    "    <formly-transclude></formly-transclude>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/addonRight.html',
    "<div class=\"input-group\" ng-class=\"::to.inputGroupClassName\">\n" +
    "    <formly-transclude></formly-transclude>\n" +
    "    <div class=\"input-group-addon\"\n" +
    "         ng-style=\"::{cursor: to.addonRight.onClick ? 'pointer' : 'inherit'}\"\n" +
    "         ng-click=\"to.addonRight.onClick(options, this)\">\n" +
    "        <i class=\"{{::to.addonRight.className}}\" ng-if=\"::to.addonRight.className\"></i>\n" +
    "        <span ng-if=\"::to.addonRight.text\">{{::to.addonRight.text}}</span>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/datepicker.html',
    "<div class=\"date-picker dp-blue\" ng-class=\"{ 'is-opened': datepicker.opened }\">\n" +
    "    <div class=\"fg-line\" ng-class=\"{ 'fg-toggled': datepicker.opened }\">\n" +
    "        <input\n" +
    "            id=\"{{::id}}\"\n" +
    "            name=\"{{::id}}\"\n" +
    "            ng-model=\"model[options.key]\"\n" +
    "            class=\"form-control\"\n" +
    "            ng-click=\"datepicker.open($event)\"\n" +
    "            uib-datepicker-popup=\"{{to.datepickerOptions.format}}\"\n" +
    "            is-open=\"datepicker.opened\"\n" +
    "            datepicker-options=\"to.datepickerOptions\"\n" +
    "            type=\"text\"/>\n" +
    "        <label class=\"line-focus\"></label>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/groupEditWrapper.html',
    "<div class=\"pmb-block\">\n" +
    "    <div class=\"pmbb-header\">\n" +
    "        <h2><i class=\"{{::to.iconClass}}\"></i>{{::to.label}}</h2>\n" +
    "    </div>\n" +
    "    <div class=\"pmbb-body p-l-30\">\n" +
    "        <formly-transclude></formly-transclude>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/inlineEditLastWrapper.html',
    "<div ng-class=\"{'join-user': formState.edit !== false}\">\n" +
    "    <formly-transclude></formly-transclude>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/input.html',
    "<input class=\"form-control\" ng-class=\"::to.className\" ng-model=\"model[options.key]\">\n" +
    "<label class=\"line-focus\"></label>\n"
  );


  $templateCache.put('/staffim-form/materialHorizontalWrapper.html',
    "<dl ng-class=\"{'has-error': showError && formState.edit !== false, 'dl-horizontal': formState.horizontalClass !== false}\"\n" +
    "    ng-if=\"to.onlyView !== true || formState.edit === false\">\n" +
    "    <dt ng-class=\"{'p-t-10': formState.edit !== false}\">\n" +
    "        {{::to.label}}\n" +
    "        <span ng-if=\"!to.required && formState.edit !== false && !to.hideRequired && to.label\">\n" +
    "            <br>\n" +
    "            <small class=\"required\">(не обязательно)</small>\n" +
    "        </span>\n" +
    "    </dt>\n" +
    "    <dd>\n" +
    "        <div ng-class=\"{'fg-line': formState.edit !== false}\">\n" +
    "            <div ng-if=\"formState.edit !== false && to.editView !== true\">\n" +
    "                <formly-transclude></formly-transclude>\n" +
    "            </div>\n" +
    "            <span ng-if=\"formState.edit === false || to.editView === true\" ng-class=\"to.viewClassName\"\n" +
    "                su-compile=\"to.viewFormatter ? (to.viewFormatter((getViewValue ? getViewValue() : model[options.key]), model)) : (getViewValue ? getViewValue() : model[options.key])\">\n" +
    "            </span>\n" +
    "        </div>\n" +
    "        <small ng-messages=\"fc.$error\" ng-if=\"(form.$submitted || options.formControl.$touched) && showError && formState.edit !== false\" class=\"help-block\">\n" +
    "            <div ng-message=\"{{::name}}\" ng-repeat=\"(name, message) in ::options.validation.messages\" class=\"message\">\n" +
    "                {{message(fc.$viewValue, fc.$modelValue, this)}}\n" +
    "            </div>\n" +
    "        </small>\n" +
    "    </dd>\n" +
    "</dl>\n"
  );


  $templateCache.put('/staffim-form/materialSimpleWrapper.html',
    "<div class=\"fg-line\" ng-if=\"::(formState.edit !== false)\">\n" +
    "    <formly-transclude></formly-transclude>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/materialWrapper.html',
    "<div ng-class=\"[{'has-error': showError}]\" ng-if=\"to.onlyView !== true || formState.edit === false\">\n" +
    "    <div class=\"fg-line\">\n" +
    "        <label class=\"control-label\" for=\"{{id}}\" ng-if=\"to.label && formState.label !== false\">\n" +
    "            {{to.label}}\n" +
    "            <span ng-if=\"!to.required && formState.edit !== false && !to.hideRequired\">\n" +
    "                <br>\n" +
    "                <small class=\"required\">(не обязательно)</small>\n" +
    "            </span>\n" +
    "        </label>\n" +
    "        <div ng-if=\"formState.edit !== false && to.editView !== true\">\n" +
    "            <formly-transclude></formly-transclude>\n" +
    "        </div>\n" +
    "        <span ng-if=\"formState.edit === false || to.editView === true\" ng-class=\"to.viewClassName\"\n" +
    "            su-compile=\"to.viewFormatter ? (to.viewFormatter((getViewValue ? getViewValue() : model[options.key]), model)) : (getViewValue ? getViewValue() : model[options.key])\">\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <small ng-if=\"(form.$submitted) && showError\" class=\"help-block\">\n" +
    "        <div ng-repeat=\"(name, message) in ::options.validation.messages\" class=\"message\">\n" +
    "            {{message(fc.$viewValue, fc.$modelValue, this)}}\n" +
    "        </div>\n" +
    "    </small>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/number.html',
    "<label class=\"control-label\">{{to.labelInfo}}</label>\n" +
    "<number-input ng-class=\"to.className\" ng-model=\"model[options.key]\" options=\"numberOptions\"></number-input>\n"
  );


  $templateCache.put('/staffim-form/select.html',
    "<oi-select\n" +
    "    oi-options=\"item.id as item.name for item in to.options track by item.id\"\n" +
    "    ng-model=\"model[options.key]\"\n" +
    "    oi-select-options=\"selectOptions\"\n" +
    "    >\n" +
    "</oi-select>\n"
  );


  $templateCache.put('/staffim-form/selectAsyncSearch.html',
    "<oi-select\n" +
    "    oi-options=\"item.id as item.name for item in refreshData($query) track by item.id\"\n" +
    "    ng-model=\"model[options.key]\"\n" +
    "    oi-select-options=\"selectOptions\"\n" +
    "    >\n" +
    "</oi-select>\n"
  );


  $templateCache.put('/staffim-form/selectMultipleAsyncSearch.html',
    "<oi-select\n" +
    "    oi-options=\"item.id as item.name for item in refreshData($query) track by item.id\"\n" +
    "    ng-model=\"model[options.key]\"\n" +
    "    multiple\n" +
    "    oi-select-options=\"selectOptions\"\n" +
    "    >\n" +
    "</oi-select>\n"
  );


  $templateCache.put('/staffim-form/simpleSelect.html',
    "<div class=\"select\">\n" +
    "    <select class=\"form-control\" ng-model=\"model[options.key]\">\n" +
    "        <option ng-repeat=\"option in to.options\" value=\"{{option.id}}\">{{option.name}}</option>\n" +
    "    </select>\n" +
    "    <label class=\"line-focus\"></label>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/switch.html',
    "<div class=\"toggle-switch\" ng-class=\"to.className\">\n" +
    "    <input ng-model=\"model[options.key]\" type=\"checkbox\" hidden=\"hidden\"\n" +
    "        ng-true-value=\"{{::to.trueValue}}\"\n" +
    "        ng-false-value=\"{{::to.falseValue}}\">\n" +
    "    <label for=\"{{id}}\" class=\"ts-helper\"></label>\n" +
    "    <label for=\"{{id}}\" class=\"ts-label m-l-5\" ng-if=\"to.labelInfo\">{{to.labelInfo}}</label>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/tableHeaderFilter.html',
    "<div class=\"table-header-filter\">\n" +
    "    <formly-form model=\"model\" fields=\"fields\" options=\"formInstance.getFormOptions()\" form=\"formInstance.form\">\n" +
    "    </formly-form>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/tableInlineEdit.html',
    "<td ng-if=\"true\" class=\"inline-edit\">\n" +
    "    <formly-form model=\"model\" fields=\"fields\" options=\"formInstance.getFormOptions()\" form=\"formInstance.form\">\n" +
    "    </formly-form>\n" +
    "</td>\n" +
    "<td ng-if=\"true\" class=\"td-actions\">\n" +
    "    <div class=\"lv-actions actions\" ng-if=\"!options.formState.edit\" ng-click=\"options.formState.edit = true\">\n" +
    "        <a href=\"\">\n" +
    "            <i class=\"zmdi zmdi-edit\"></i>\n" +
    "        </a>\n" +
    "    </div>\n" +
    "    <button type=\"submit\" class=\"btn btn-success m-r-5 waves-effect\" ng-if=\"options.formState.edit\" ng-click=\"onSubmit()\">\n" +
    "        <i class=\"zmdi zmdi-check\"></i>\n" +
    "    </button>\n" +
    "    <button type=\"button\" class=\"btn btn-default waves-effect\" ng-if=\"options.formState.edit\" ng-click=\"formInstance.resetModel(); options.formState.edit = false\">\n" +
    "        <i class=\"zmdi zmdi-close\"></i>\n" +
    "    </button>\n" +
    "</td>\n"
  );


  $templateCache.put('/staffim-form/textarea.html',
    "<textarea class=\"form-control\" ng-model=\"model[options.key]\"></textarea>\n" +
    "<label class=\"line-focus\"></label>\n"
  );


  $templateCache.put('/staffim-form/viewEdit.html',
    "<div class=\"pmb-block\">\n" +
    "    <div class=\"pmbb-header\">\n" +
    "        <h2><i class=\"{{iconClass}}\"></i> {{title}}</h2>\n" +
    "        <ul class=\"actions\" ng-class=\"{'hidden': options.formState.edit}\">\n" +
    "            <li class=\"dropdown\" uib-dropdown>\n" +
    "                <a href=\"#\" uib-dropdown-toggle>\n" +
    "                    <i class=\"zmdi zmdi-more-vert\"></i>\n" +
    "                </a>\n" +
    "\n" +
    "                <ul class=\"dropdown-menu dropdown-menu-right\">\n" +
    "                    <li>\n" +
    "                        <a ng-click=\"options.formState.edit = true\" href=\"#\">Редактировать</a>\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "    <div class=\"pmbb-body p-l-30\">\n" +
    "        <form ng-submit=\"onSubmit()\" name=\"formInstance.form\" novalidate ng-class=\"{'pmbb-edit': options.formState.edit, 'pmbb-view': !options.formState.edit}\">\n" +
    "            <formly-form model=\"model\" fields=\"fields\" options=\"formInstance.getFormOptions()\" form=\"formInstance.form\">\n" +
    "                <button class=\"btn btn-primary btn-sm\" type=\"submit\" ng-if=\"options.formState.edit\">\n" +
    "                    Сохранить\n" +
    "                </button>\n" +
    "                <button class=\"btn btn-link btn-sm\" ng-click=\"formInstance.resetModel(); options.formState.edit = false\" ng-if=\"options.formState.edit\">\n" +
    "                    Отмена\n" +
    "                </button>\n" +
    "            </formly-form>\n" +
    "        </form>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/wysiwyg.html',
    "<div oc-lazy-load=\"['/vendors/summernote/dist/summernote.js', '/vendors/angular-summernote/dist/angular-summernote.js', '/vendors/summernote/dist/summernote.css']\">\n" +
    "    <summernote ng-model=\"model[options.key]\" config=\"summernoteOptions\"></summernote>\n" +
    "</div>\n"
  );

}]);

angular.module('staffimForm').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/number-input.html',
    "<div class=\"input-group\">\n" +
    "    <span class=\"input-group-btn\">\n" +
    "        <button type=\"button\" class=\"btn btn-danger\" data-no-waves=\"true\" ng-click=\"numberInput.dec()\">\n" +
    "            <i class=\"zmdi zmdi-minus-circle-outline\"></i>\n" +
    "        </button>\n" +
    "    </span>\n" +
    "    <input type=\"text\"\n" +
    "        class=\"form-control pull-left\"\n" +
    "        style=\"text-align: center;\"\n" +
    "        ng-model=\"model\"\n" +
    "        ng-change=\"numberInput.onChange()\"\n" +
    "        ng-keydown=\"numberInput.onKeyPress($event)\"\n" +
    "        ng-blur=\"numberInput.onBlur()\">\n" +
    "    <span class=\"input-group-btn\">\n" +
    "        <button type=\"button\" class=\"btn btn-success\" data-no-waves=\"true\" ng-click=\"numberInput.inc()\">\n" +
    "            <i class=\"zmdi zmdi-plus-circle-o\"></i>\n" +
    "        </button>\n" +
    "    </span>\n" +
    "</div>\n"
  );

}]);
