(function(){
    angular.module('staffimForm')
        .factory('SFService', SFService);

    SFService.$inject = ['toastr', '$q'];
    function SFService(toastr, $q) {
        /* jshint validthis: true */
        var service = function(scope) {
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
            if (this.form && !this.form.$valid) {
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
