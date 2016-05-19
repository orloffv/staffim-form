(function(){
    angular.module('staffimForm')
        .factory('SFService', SFService);

    SFService.$inject = ['SUNotify', '$q', '$timeout', 'CacheFactory'];
    function SFService(SUNotify, $q, $timeout, CacheFactory) {
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
        service.prototype.saveOffline = saveOffline;

        function getBackupCache() {
            if (!CacheFactory.get('formCache')) {
                CacheFactory.createCache('formCache', {
                    storageMode: 'localStorage',
                    deleteOnExpire: 'aggressive',
                    verifyIntegrity: false,
                    recycleFreq: 60 * 1000,
                    maxAge: 60 * 60 * 24 * 1000
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
                _.deepExtend(this.formModel, backupData);
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

        function setSaveFunction(func) {
            this.saveFunc = func;

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

        function setSimpleOptions() {
            this.setFormOptions({
                formState: {
                    simple: true
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

                        (_.has(onSuccess, 'then') ? onSuccess : $q.when(onSuccess))
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

                return (_.has(onBeforeSave, 'then') ? onBeforeSave : $q.when(onBeforeSave))
                    .then(function() {
                        return that.submit();
                    });
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
