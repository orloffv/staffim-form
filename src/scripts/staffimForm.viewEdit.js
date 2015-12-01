(function(){
    angular.module('staffimForm')
        .directive('sfViewEdit', function() {
            return {
                templateUrl: '/staffim-form/viewEdit.html',
                restrict: 'E',
                scope: {
                    title: '@',
                    formInstance: '='
                },
                link: function(scope) {
                    scope.options = scope.formInstance.getFormOptions();
                    scope.model = scope.formInstance.getFormModel();
                    scope.fields = scope.formInstance.getFields();
                    scope.onSubmit = scope.formInstance.onSubmit.bind(scope.formInstance);
                }
            };
        });
})();
