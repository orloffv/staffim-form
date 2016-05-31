(function(){
    angular.module('staffimForm')
        .directive('sfViewEdit', function() {
            return {
                templateUrl: '/staffim-form/viewEdit.html',
                restrict: 'E',
                scope: {
                    title: '@',
                    iconClass: '@',
                    formInstance: '=',
                    allowEdit: '@'
                },
                link: function($scope) {
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
                }
            };
        });
})();
