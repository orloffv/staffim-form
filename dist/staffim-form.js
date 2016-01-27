(function(){
    angular.module('staffimForm', ['staffimUtils', 'formly', 'ngSanitize', 'oi.select']);
    angular.module('staffimForm.wysiwyg', ['formly', 'summernote']);
})();

(function(){
    angular.module('staffimForm')
        .run(wrapperMaterial);

    wrapperMaterial.$inject = ['formlyConfig', '$templateCache', '$http'];
    function wrapperMaterial(formlyConfig, $templateCache, $http) {
        formlyConfig.templateManipulators.preWrapper.push(function(template, options, scope) {
            if (scope.formState && scope.formState.horizontal) {
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
            if (!options.templateOptions.addonLeft && !options.templateOptions.addonRight) {
                return template;
            }

            return $http.get('/staffim-form/addons.html', {cache: $templateCache}).then(function(response) {
                return response.data.replace('<formly-transclude></formly-transclude>', template);
            });
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
                if (angular.isUndefined($scope.model[$scope.options.key])) {
                    $scope.model[$scope.options.key] = $scope.to.falseValue;
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
            },
            defaultOptions: {
                className: 'form-group form-counter m-b-0'
            }
        });

        function refreshAsyncSelect($scope, query, values) {
            var defer = $q.defer();

            $scope.selectedData = _.filter($scope.selectedData, function(item) {
                return _.indexOf(values, item.id) !== -1;
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
            name: 'select',
            defaultOptions: {
                className: 'form-group'
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
                        }
                    }

                    return item;
                });
            }
        });

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
                className: 'form-group'
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

(function(){
    angular.module('staffimForm')
        .factory('SFService', SFService);

    SFService.$inject = ['toastr', '$q'];
    function SFService(toastr, $q) {
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
            this.patchParams = {};
            this.modal = null;
            this.tableParams = null;
            this.onSuccess = function() {
                return true;
            };
            this.status = 'draft';
            this.viewAfterSave = true;

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
        service.prototype.setViewWithoutClassOptions = setViewWithoutClassOptions;
        service.prototype.setEditVerticalOptions = setEditVerticalOptions;
        service.prototype.setEditOptions = setEditOptions;
        service.prototype.setTableParams = setTableParams;
        service.prototype.setPatchFields = setPatchFields;
        service.prototype.setOnSuccess = setOnSuccess;
        service.prototype.setPatchParams = setPatchParams;
        service.prototype.setNotViewAfterSave = setNotViewAfterSave;
        service.prototype.setViewAfterSave = setViewAfterSave;
        service.prototype.getFormModel = getFormModel;
        service.prototype.getFields = getFields;
        service.prototype.getPatchFields = getPatchFields;
        service.prototype.getPatchParams = getPatchParams;
        service.prototype.getFormOptions = getFormOptions;
        service.prototype.onSubmit = onSubmit;
        service.prototype.resetModel = resetModel;
        service.prototype.submit = submit;
        service.prototype.patchRemove = patchRemove;

        function setFormOptions(formOptions) {
            this.formOptions = formOptions;

            return this;
        }

        function setTableOptions() {
            this.setFormOptions({
                formState: {
                    edit: false,
                    label: false
                }
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

        function setViewOptions() {
            this.setFormOptions({
                formState: {
                    edit: false,
                    horizontal: true
                }
            });

            return this;
        }

        function setViewWithoutClassOptions() {
            this.setFormOptions({
                formState: {
                    edit: false,
                    horizontal: true,
                    horizontalClass: false
                }
            });

            return this;
        }

        function setEditOptions() {
            this.setFormOptions({
                formState: {
                    edit: true,
                    horizontal: true
                }
            });

            return this;
        }

        function setEditVerticalOptions() {
            this.setFormOptions({
                formState: {
                    edit: true
                }
            });

            return this;
        }

        function setOriginalModel(originalModel) {
            this.originalModel = originalModel;
            this.formModel = _.clone(this.originalModel);

            return this;
        }

        function setFields() {
            var fields = [];
            fields.push.apply(fields, arguments);

            this.fields = _.flatten(fields);

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

        function setErrorMessage(errorMessage) {
            this.errorMessage = errorMessage;

            return this;
        }

        function setPatchFields(patchFields) {
            this.patchFields = patchFields;

            return this;
        }

        function setPatchParams(patchParams) {
            this.patchParams = patchParams;

            return this;
        }

        function setModal(modal) {
            this.modal = modal;

            if (_.size(this.fields)) {
                _.each(this.fields, function(field) {
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
            }

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

                return fields;
            }

            return this.patchFields;
        }

        function getPatchParams() {
            return this.patchParams;
        }

        function patchRemove() {
            return this.submit('remove');
        }

        function submit(patchAction) {
            var that = this;

            return this.formModel.$patch(this.getPatchFields(), patchAction, this.getPatchParams()).$asPromise()
                .then(function(data) {
                    that.status = 'success';
                    angular.copy(that.formModel, that.originalModel);
                    toastr.success(that.successMessage);

                    if (that.modal) {
                        that.modal.dismiss('cancel');
                    }

                    if (that.tableParams) {
                        that.tableParams.reload();
                    }

                    if (_.isFunction(that.onSuccess)) {
                        $q
                            .when(that.onSuccess(data))
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
                .catch(function() {
                    /*
                    var translator = new SRErrorTranslator(that.formModel);
                    var errors = translator.parseResponse(errorResponse);
                    toastr.error(_.size(errors) ? _.toSentence(errors, '<br>', '<br>') : that.errorMessage);
                    */
                    toastr.error(that.errorMessage);

                    return $q.reject();
                });
        }

        function onSubmit() {
            if ((this.form && !this.form.$valid) || this.status === 'success') {
                return false;
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
        .directive('sfViewEdit', function() {
            return {
                templateUrl: '/staffim-form/viewEdit.html',
                restrict: 'E',
                scope: {
                    title: '@',
                    iconClass: '@',
                    formInstance: '='
                },
                link: function($scope) {
                    $scope.options = $scope.formInstance.getFormOptions();
                    $scope.model = $scope.formInstance.getFormModel();
                    $scope.fields = $scope.formInstance.getFields();
                    $scope.onSubmit = $scope.formInstance.onSubmit.bind($scope.formInstance);
                    if (_.size($scope.fields) === 1 && _.has($scope.fields[0], 'fieldGroup') && _.has($scope.fields[0], 'templateOptions')) {
                        $scope.title = $scope.fields[0].templateOptions.label;
                        $scope.iconClass = $scope.fields[0].templateOptions.iconClass;
                        $scope.fields = $scope.fields[0].fieldGroup;
                        $scope.formInstance.setFields($scope.fields);
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
                    formInstance: '=formInstance'
                },
                controller: ['$scope', function($scope) {
                    $scope.options = $scope.formInstance.getFormOptions();
                    $scope.model = $scope.formInstance.getFormModel();
                    $scope.fields = $scope.formInstance.getFields();
                    $scope.$watch('model', function(data) {
                        _.each(data, function(value, key) {
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

  $templateCache.put('/staffim-form/addons.html',
    "<div ng-class=\"{'input-group': to.addonLeft || to.addonRight}\">\n" +
    "    <div class=\"input-group-addon\"\n" +
    "         ng-if=\"to.addonLeft\"\n" +
    "         ng-style=\"{cursor: to.addonLeft.onClick ? 'pointer' : 'inherit'}\"\n" +
    "         ng-click=\"to.addonLeft.onClick(options, this)\">\n" +
    "        <i class=\"{{to.addonLeft.className}}\" ng-if=\"to.addonLeft.className\"></i>\n" +
    "        <span ng-if=\"to.addonLeft.text\">{{to.addonLeft.text}}</span>\n" +
    "    </div>\n" +
    "    <formly-transclude></formly-transclude>\n" +
    "    <div class=\"input-group-addon\"\n" +
    "         ng-if=\"to.addonRight\"\n" +
    "         ng-style=\"{cursor: to.addonRight.onClick ? 'pointer' : 'inherit'}\"\n" +
    "         ng-click=\"to.addonRight.onClick(options, this)\">\n" +
    "        <i class=\"{{to.addonRight.className}}\" ng-if=\"to.addonRight.className\"></i>\n" +
    "        <span ng-if=\"to.addonRight.text\">{{to.addonRight.text}}</span>\n" +
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
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/groupEditWrapper.html',
    "<div class=\"pmb-block\">\n" +
    "    <div class=\"pmbb-header\">\n" +
    "        <h2><i class=\"{{to.iconClass}}\"></i>{{to.label}}</h2>\n" +
    "    </div>\n" +
    "    <div class=\"pmbb-body p-l-30\">\n" +
    "        <formly-transclude></formly-transclude>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/input.html',
    "<input class=\"form-control\" ng-class=\"to.className\" ng-model=\"model[options.key]\">\n"
  );


  $templateCache.put('/staffim-form/materialHorizontalWrapper.html',
    "<dl ng-class=\"{'has-error': showError && formState.edit !== false, 'dl-horizontal': formState.horizontalClass !== false}\"\n" +
    "    ng-if=\"to.onlyView !== true || formState.edit === false\">\n" +
    "    <dt ng-class=\"{'p-t-10': formState.edit !== false}\">\n" +
    "        {{to.label}}\n" +
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
    "<number-input ng-class=\"to.className\" ng-model=\"model[options.key]\" options=\"numberOptions\"></number-input>\n" +
    "<label class=\"control-label\">{{to.labelInfo}}</label>\n"
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


  $templateCache.put('/staffim-form/switch.html',
    "<div class=\"toggle-switch\">\n" +
    "    <input ng-model=\"model[options.key]\" type=\"checkbox\" hidden=\"hidden\"\n" +
    "        ng-true-value=\"{{::to.trueValue}}\"\n" +
    "        ng-false-value=\"{{::to.falseValue}}\">\n" +
    "    <label for=\"{{id}}\" class=\"ts-helper\"></label>\n" +
    "    <label for=\"{{id}}\" class=\"ts-label m-l-5\">{{to.labelInfo}}</label>\n" +
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
    "<textarea class=\"form-control\" ng-model=\"model[options.key]\"></textarea>\n"
  );


  $templateCache.put('/staffim-form/viewEdit.html',
    "<div class=\"pmb-block\">\n" +
    "    <div class=\"pmbb-header\">\n" +
    "        <h2><i class=\"{{iconClass}}\"></i> {{title}}</h2>\n" +
    "        <ul class=\"actions\" ng-if=\"!options.formState.edit\">\n" +
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
    "<summernote ng-model=\"model[options.key]\" config=\"summernoteOptions\"></summernote>\n"
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
