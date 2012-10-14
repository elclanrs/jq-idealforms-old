/*
 * Grunt config
 */
module.exports = function( grunt ) {

  grunt.initConfig({

    less: {
      dist: {
        options: {
          paths: ['less'],
          yuicompress: true
        },
        files: { 'css/jquery.idealforms.min.css': 'less/jquery.idealforms.less' }
      }
    },

    concat: {
      dist: {
        src: [
          'js/src/start.js',
          'js/src/utils.js',
          'js/src/tabs.js',
          'js/src/select.js',
          'js/src/radiocheck.js',
          'js/src/file.js',
          'js/src/filters.js',
          'js/src/idealforms.js',
          'js/src/private.js',
          'js/src/public.js',
          'js/src/end.js'
        ],
        dest: 'js/min/jquery.idealforms.js'
      }
    },

    min: {
      dist: {
        src: ['js/min/jquery.idealforms.js'],
        dest: 'js/min/jquery.idealforms.min.js'
      }
    },

    compress: {
      zip: {
        files: {
          'zip/jquery.idealforms.zip': [
            'css/jquery.idealforms.min.css',
            'js/min/jquery.idealforms.min.js',
            'less/**/*.png',
            'less/**/*.gif',
            'zip/readme.txt'
          ]
        }
      },
      options: {
        flatten: true
      }
    },

    watch: {
      files: ['js/src/*.js', 'less/**/*.less'],
      tasks: ['default']
    }

  })

  // Default task
  grunt.registerTask('default', 'less concat min compress');

  // LESS
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-compress');

}
