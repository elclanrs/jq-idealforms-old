1. Load latest jQuery

2. Load "jquery.idealforms.min.css" and "jquery.idealforms.min.js"

3. Open "jquery.idealforms.min.css" and replace "../less/themes/basic/" with the path where you put the images.

4. Replace your document's opening <html> tag with the following conditional comments. This will load the appropiate fixes for all supported IE versions:

<!--[if IE 8]> <html class="ie8" lang="en"> <![endif]-->
<!--[if IE 9]> <html class="ie9" lang="en"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en"> <!--<![endif]-->

5. Load an HTML5 shim for IE8 unless you're using Modernizr which already has a shim.

6. Finally, call Ideal Forms on each form separately. Assign each form to a variable to have access to the public methods.

var $myform = $('#my-form').idealforms({ options }).data('idealforms');

Enjoy :)