/*
 * Grunt config
 */
module.exports = function( grunt ) {

  // Project configuration.
  grunt.initConfig({

    concat: {
      dist: {
        src: [
          'src/start.js',
          'src/utils.js',
          'src/tabs.js',
          'src/select.js',
          'src/radiocheck.js',
          'src/file.js',
          'src/filters.js',
          'src/idealforms.js',
          'src/private.js',
          'src/public.js',
          'src/end.js'
        ],
        dest: 'min/jquery.idealforms.js'
      }
    },

    min: {
      dist: {
        src: ['min/jquery.idealforms.js'],
        dest: 'min/jquery.idealforms.min.js'
      }
    },

    watch: {
      files: ['src/*.js'],
      tasks: ['default']
    }

  })

  // Default task.
  grunt.registerTask('default', 'concat min');

}
