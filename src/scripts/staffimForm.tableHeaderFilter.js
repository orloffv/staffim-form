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
