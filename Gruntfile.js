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
          'js/src/flags.js',
          'js/src/idealforms.js',
          'js/src/private.js',
          'js/src/public.js',
          'js/src/end.js'
        ],
        dest: 'js/min/jquery.idealforms.js'
      }
    },

    uglify: {
      dist: {
        src: ['js/min/jquery.idealforms.js'],
        dest: 'js/min/jquery.idealforms.min.js'
      }
    },

    compress: {
      options: {
        archive: 'zip/jquery.idealforms.zip'
      },
      dist: {
        files: [
          {
            expand: true,
            flatten: true,
            src: [
              'css/jquery.idealforms.min.css',
              'js/min/jquery.idealforms.min.js',
              'zip/readme.txt'
            ]
          },
          {
            expand: true,
            flatten: true,
            dest: 'img',
            src: [
              'less/**/*.png',
              'less/**/*.gif'
            ]
          }
        ]
      }
    },

    watch: {
      files: ['js/src/*.js', 'less/**/*.less'],
      tasks: ['default']
    }

  })

  // Plugins
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task
  grunt.registerTask('default', ['less', 'concat', 'uglify', 'compress']);
}
