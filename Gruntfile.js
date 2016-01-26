module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        concat: {
            js: {
                src: [
                    'src/scripts/staffimForm.module.js',
                    'src/scripts/staffimForm.material.js',
                    'src/scripts/staffimForm.fields.js',
                    'src/scripts/staffimForm.service.js',
                    'src/scripts/staffimForm.viewEdit.js',
                    'src/scripts/staffimForm.tableInlineEdit.js',
                    'src/scripts/staffimForm.tableHeaderFilter.js',
                    'src/scripts/staffimForm.wysiwyg.js',
                    '.tmp/templates.js',
                    '.tmp/number-input-templates.js'
                ],
                dest: './dist/staffim-form.js'
            }
        },
        ngtemplates: {
            dist: {
                cwd: 'src/',
                src: ['staffim-form/**/*.html'],
                dest: '.tmp/templates.js',
                options: {
                    prefix: '/',
                    module: 'staffimForm'
                }
            },
            number: {
                cwd: 'src/number-input/',
                src: ['src/**/*.html'],
                dest: '.tmp/number-input-templates.js',
                options: {
                    module: 'staffimForm'
                }
            }
        },
        clean: {
            working: {
                src: ['./.tmp/']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.registerTask('dist', ['clean', 'ngtemplates', 'concat']);
};
