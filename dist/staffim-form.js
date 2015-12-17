(function(){
    angular.module('staffimForm', []);
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

(function(){
    angular.module('staffimForm')
        .config(materialFields);

    materialFields.$inject = ['formlyConfigProvider'];
    function materialFields(formlyConfigProvider) {
        function _defineProperty(obj, key, value) {
            if (key in obj) {
                Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
            } else {
                obj[key] = value;
            }

            return obj;
        }

        formlyConfigProvider.setType({
            name: 'input',
            templateUrl: '/staffim-form/input.html',
            defaultOptions: {
                modelOptions: {
                    //updateOn: 'submit'
                },
                className: 'form-group'
            }
        });

        formlyConfigProvider.setType({
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

        formlyConfigProvider.setType({
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

        formlyConfigProvider.setType({
            name: 'select-multiple',
            extends: 'select',
            templateUrl: '/staffim-form/selectMultiple.html'
        });

        formlyConfigProvider.setType({
            name: 'select-async-search',
            extends: 'select',
            templateUrl: '/staffim-form/selectAsyncSearch.html'
        });

        formlyConfigProvider.setWrapper([
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

        formlyConfigProvider.setType({
            name: 'datepicker',
            templateUrl: '/staffim-form/datepicker.html',
            defaultOptions: {
                ngModelAttrs: ngModelAttrs,
                templateOptions: {
                    datepickerOptions: {
                        format: 'MM.dd.yyyy',
                        initDate: new Date()
                    }
                }
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
})();

(function(){
    angular.module('staffimForm')
        .factory('SFService', SFService);

    SFService.$inject = ['toastr', '$q'];
    function SFService(toastr, $q) {
        /* jshint validthis: true */
        var service = function(scope) {
            this.scope = scope;
            this.formOptions = {};
            this.originalModel = {};
            this.formModel = {};
            this.formName = _.uniqueId('form');
            this.form = scope[this.formName];
            this.fields = [];
            this.successMessage = null;
            this.errorMessage = null;
            this.patchFields = [];
            this.modal = null;
            this.tableParams = null;
            this.onSuccess = function() {};

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

        function setEditOptions() {
            this.setFormOptions({
                formState: {
                    edit: true,
                    horizontal: true
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
            this.submit('remove');
        }

        function submit(patchAction) {
            var that = this;

            return this.formModel.$patch(this.getPatchFields(), patchAction).$asPromise()
                .then(function(data) {
                    angular.copy(that.formModel, that.originalModel);
                    toastr.success(that.successMessage);
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
                    if (that.modal) {
                        that.modal.dismiss('cancel');
                    }
                    if (that.tableParams) {
                        that.tableParams.reload();
                    }

                    if (_.isFunction(that.onSuccess)) {
                        that.onSuccess(data);
                    }

                    return data;
                })
                .catch(function() {
                    toastr.error(that.errorMessage);

                    return $q.reject();
                });
        }

        function onSubmit() {
            if (this.form && !this.form.$valid) {
                return false;
            }

            this.submit();
        }

        function resetModel() {
            if (_.has(this.formOptions, 'resetModel')) {
                this.formOptions.resetModel();
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

angular.module('staffimForm').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('/staffim-form/addons.html',
    "<div ng-class=\"{'input-group': to.addonLeft || to.addonRight}\">\n" +
    "    <div class=\"input-group-addon\"\n" +
    "         ng-if=\"to.addonLeft\"\n" +
    "         ng-style=\"{cursor: to.addonLeft.onClick ? 'pointer' : 'inherit'}\"\n" +
    "         ng-click=\"to.addonLeft.onClick(options, this)\">\n" +
    "        <i class=\"{{to.addonLeft.class}}\" ng-if=\"to.addonLeft.class\"></i>\n" +
    "        <span ng-if=\"to.addonLeft.text\">{{to.addonLeft.text}}</span>\n" +
    "    </div>\n" +
    "    <formly-transclude></formly-transclude>\n" +
    "    <div class=\"input-group-addon\"\n" +
    "         ng-if=\"to.addonRight\"\n" +
    "         ng-style=\"{cursor: to.addonRight.onClick ? 'pointer' : 'inherit'}\"\n" +
    "         ng-click=\"to.addonRight.onClick(options, this)\">\n" +
    "        <i class=\"{{to.addonRight.class}}\" ng-if=\"to.addonRight.class\"></i>\n" +
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
    "<input class=\"form-control\" ng-class=\"options.templateOptions.className\" ng-model=\"model[options.key]\" ng-if=\"formState.edit !== false\">\n" +
    "<span ng-if=\"formState.edit === false\" ng-class=\"options.templateOptions.viewClassName\">{{model[options.key]}}</span>\n"
  );


  $templateCache.put('/staffim-form/materialHorizontalWrapper.html',
    "<dl class=\"dl-horizontal\" ng-class=\"{'has-error': showError && formState.edit !== false}\">\n" +
    "    <dt ng-class=\"{'p-t-10': formState.edit !== false}\">\n" +
    "        {{to.label}}\n" +
    "    </dt>\n" +
    "    <dd>\n" +
    "        <div ng-class=\"{'fg-line': formState.edit !== false}\">\n" +
    "            <formly-transclude></formly-transclude>\n" +
    "        </div>\n" +
    "        <small ng-messages=\"fc.$error\" ng-if=\"(form.$submitted || options.formControl.$touched) && showError && formState.edit !== false\" class=\"help-block\">\n" +
    "            <div ng-message=\"{{::name}}\" ng-repeat=\"(name, message) in ::options.validation.messages\" class=\"message\">\n" +
    "                {{ message(fc.$viewValue, fc.$modelValue, this)}}\n" +
    "            </div>\n" +
    "        </small>\n" +
    "    </dd>\n" +
    "</dl>\n"
  );


  $templateCache.put('/staffim-form/materialWrapper.html',
    "<div ng-class=\"[{'has-error': showError}]\">\n" +
    "    <div class=\"fg-line\" ng-class=\"{'select': options.type === 'select' && formState.edit !== false}\">\n" +
    "        <label class=\"control-label\" for=\"{{id}}\" ng-if=\"to.label && formState.label !== false\">\n" +
    "            {{to.label}}\n" +
    "            {{to.required ? '*' : ''}}\n" +
    "        </label>\n" +
    "        <formly-transclude></formly-transclude>\n" +
    "    </div>\n" +
    "    <small ng-if=\"(form.$submitted) && showError\" class=\"help-block\">\n" +
    "        <div ng-repeat=\"(name, message) in ::options.validation.messages\" class=\"message\">\n" +
    "            {{ message(fc.$viewValue, fc.$modelValue, this)}}\n" +
    "        </div>\n" +
    "    </small>\n" +
    "</div>\n"
  );


  $templateCache.put('/staffim-form/select.html',
    "<select class=\"form-control\" ng-class=\"options.templateOptions.className\" ng-model=\"model[options.key]\" ng-if=\"formState.edit !== false\"></select>\n" +
    "<span ng-if=\"formState.edit === false\" ng-class=\"options.templateOptions.viewClassName\">{{getViewValue()}}</span>\n"
  );


  $templateCache.put('/staffim-form/selectAsyncSearch.html',
    "<ui-select data-ng-model=\"model[options.key]\" data-required=\"{{to.required}}\" data-disabled=\"{{to.disabled}}\" theme=\"bootstrap\">\n" +
    "    <ui-select-match placeholder=\"{{to.placeholder}}\">{{$select.selected[to.labelProp]}}</ui-select-match>\n" +
    "    <ui-select-choices repeat=\"option[to.valueProp] as option in to.options | filter: $select.search\" data-refresh=\"to.refresh($select.search, options)\" data-refresh-delay=\"{{to.refreshDelay}}\">\n" +
    "        <div ng-bind-html=\"option[to.labelProp] | highlight: $select.search\"></div>\n" +
    "    </ui-select-choices>\n" +
    "</ui-select>\n"
  );


  $templateCache.put('/staffim-form/selectMultiple.html',
    "<ui-select multiple data-ng-model=\"model[options.key]\" data-required=\"{{to.required}}\" data-disabled=\"{{to.disabled}}\" theme=\"bootstrap\">\n" +
    "    <ui-select-match placeholder=\"{{to.placeholder}}\">{{$item[to.labelProp]}}</ui-select-match>\n" +
    "    <ui-select-choices repeat=\"option[to.valueProp] as option in to.options | filter: $select.search\">\n" +
    "        <div ng-bind-html=\"option[to.labelProp] | highlight: $select.search\"></div>\n" +
    "    </ui-select-choices>\n" +
    "</ui-select>\n"
  );


  $templateCache.put('/staffim-form/tableHeaderFilter.html',
    "<div>\n" +
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
    "<textarea class=\"form-control\" ng-model=\"model[options.key]\" ng-if=\"formState.edit !== false\"></textarea>\n" +
    "<span ng-if=\"formState.edit === false\">{{model[options.key]}}</span>\n"
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

}]);
