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
