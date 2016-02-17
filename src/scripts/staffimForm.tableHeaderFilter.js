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
                controller: ['$scope', '$element', '$timeout', function($scope, $element, $timeout) {
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
