(function(){
    angular.module('staffimForm', ['staffimUtils', 'formly', 'ngSanitize', 'ui.select']);
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
            templateUrl: '/staffim-form/selectMultiple.html',
            link: function($scope) {
                if (angular.isUndefined($scope.to.allowClear)) {
                    $scope.to.allowClear = true;
                }
            }
        });

        formlyConfig.setType({
            name: 'select-async-search',
            extends: 'select',
            templateUrl: '/staffim-form/selectAsyncSearch.html',
            link: function($scope) {
                if (angular.isUndefined($scope.to.allowClear)) {
                    $scope.to.allowClear = true;
                }
            }
        });

        formlyConfig.setType({
            name: 'select-multiple-async-search',
            extends: 'select',
            templateUrl: '/staffim-form/selectMultipleAsyncSearch.html',
            link: function($scope) {
                if (angular.isUndefined($scope.to.allowClear)) {
                    $scope.to.allowClear = true;
                }
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
            this.modal = null;
            this.tableParams = null;
            this.onSuccess = function() {
                return true;
            };
            this.status = 'draft';

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
        service.prototype.getFormModel = getFormModel;
        service.prototype.getFields = getFields;
        service.prototype.getPatchFields = getPatchFields;
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

        function setModal(modal) {
            this.modal = modal;

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
                return _.pluck(this.getFields(), 'key');
            }

            return this.patchFields;
        }

        function patchRemove() {
            return this.submit('remove');
        }

        function submit(patchAction) {
            var that = this;

            return this.formModel.$patch(this.getPatchFields(), patchAction).$asPromise()
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
                                    if (that.formOptions.formState) {
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
    "            <div ng-if=\"formState.edit !== false\">\n" +
    "                <formly-transclude></formly-transclude>\n" +
    "            </div>\n" +
    "            <span ng-if=\"formState.edit === false\" ng-class=\"to.viewClassName\"\n" +
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
    "    <div class=\"fg-line\" ng-class=\"{'select': options.type === 'select' && formState.edit !== false}\">\n" +
    "        <label class=\"control-label\" for=\"{{id}}\" ng-if=\"to.label && formState.label !== false\">\n" +
    "            {{to.label}}\n" +
    "            <span ng-if=\"!to.required && formState.edit !== false && !to.hideRequired\">\n" +
    "                <br>\n" +
    "                <small class=\"required\">(не обязательно)</small>\n" +
    "            </span>\n" +
    "        </label>\n" +
    "        <div ng-if=\"formState.edit !== false\">\n" +
    "            <formly-transclude></formly-transclude>\n" +
    "        </div>\n" +
    "        <span ng-if=\"formState.edit === false\" ng-class=\"to.viewClassName\"\n" +
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


  $templateCache.put('/staffim-form/select.html',
    "<select class=\"form-control\" ng-class=\"to.className\" ng-model=\"model[options.key]\"></select>\n"
  );


  $templateCache.put('/staffim-form/selectAsyncSearch.html',
    "<ui-select data-ng-model=\"model[options.key]\" data-required=\"{{to.required}}\" data-disabled=\"{{to.disabled}}\" theme=\"bootstrap\">\n" +
    "    <ui-select-match placeholder=\"{{to.placeholder}}\" allow-clear=\"true\">{{$select.selected[to.labelProp]}}</ui-select-match>\n" +
    "    <ui-select-choices repeat=\"option[to.valueProp] as option in to.options | filter: $select.search\" data-refresh=\"to.refresh($select.search, options)\" data-refresh-delay=\"{{to.refreshDelay}}\">\n" +
    "        <div ng-bind-html=\"option[to.labelProp] | highlight: $select.search\"></div>\n" +
    "    </ui-select-choices>\n" +
    "</ui-select>\n"
  );


  $templateCache.put('/staffim-form/selectMultiple.html',
    "<ui-select multiple data-ng-model=\"model[options.key]\" data-required=\"{{to.required}}\" data-disabled=\"{{to.disabled}}\" theme=\"bootstrap\">\n" +
    "    <ui-select-match placeholder=\"{{to.placeholder}}\" allow-clear=\"{{to.allowClear}}\">{{$item[to.labelProp]}}</ui-select-match>\n" +
    "    <ui-select-choices repeat=\"option[to.valueProp] as option in to.options | filter: $select.search\">\n" +
    "        <div ng-bind-html=\"option[to.labelProp] | highlight: $select.search\"></div>\n" +
    "    </ui-select-choices>\n" +
    "</ui-select>\n"
  );


  $templateCache.put('/staffim-form/selectMultipleAsyncSearch.html',
    "<ui-select multiple data-ng-model=\"model[options.key]\" data-required=\"{{to.required}}\" data-disabled=\"{{to.disabled}}\" theme=\"bootstrap\">\n" +
    "    <ui-select-match placeholder=\"{{to.placeholder}}\" allow-clear=\"true\">{{$item[to.labelProp]}}</ui-select-match>\n" +
    "    <ui-select-choices repeat=\"option[to.valueProp] as option in to.options | filter: $select.search\" data-refresh=\"to.refresh($select.search, options)\" data-refresh-delay=\"{{to.refreshDelay}}\">\n" +
    "        <div ng-bind-html=\"option[to.labelProp] | highlight: $select.search\"></div>\n" +
    "    </ui-select-choices>\n" +
    "</ui-select>\n"
  );


  $templateCache.put('/staffim-form/switch.html',
    "<div class=\"toggle-switch\">\n" +
    "    <input ng-model=\"model[options.key]\" type=\"checkbox\" hidden=\"hidden\"\n" +
    "        ng-true-value=\"'{{::to.trueValue}}'\"\n" +
    "        ng-false-value=\"'{{::to.falseValue}}'\">\n" +
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
