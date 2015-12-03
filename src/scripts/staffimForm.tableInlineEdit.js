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
