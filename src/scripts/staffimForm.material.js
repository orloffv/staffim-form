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
            if (options.templateOptions.addonLeft) {
                return $http.get('/staffim-form/addonLeft.html', {cache: $templateCache}).then(function(response) {
                    return response.data.replace('<formly-transclude></formly-transclude>', template);
                });
            } else if (options.templateOptions.addonRight) {
                return $http.get('/staffim-form/addonRight.html', {cache: $templateCache}).then(function(response) {
                    return response.data.replace('<formly-transclude></formly-transclude>', template);
                });
            } else {
                return template;
            }
        });
    }
})();
