/*--------------------------------------------------------------------------

    jq-idealforms 2.0

    * Author: Cedric Ruiz
    * License: GPLv2
    * Demo: http://elclanrs.github.com/jq-idealforms/

--------------------------------------------------------------------------*/

(function($) {

    'use strict';
    
/*--------------------------------------------------------------------------*/
    
    /**
     * @namespace A chest for various Utils
     */
    var Utils = {
        /**
         * Get width of widest element in the collection.
         * @memberOf Utils
         * @param {jQuery object} $elms
         * @returns {number}
         */ 
        getMaxWidth: function($elms) {
            var maxWidth = 0;
            $elms.each(function() {
                if ($(this).outerWidth() > maxWidth) {
                    maxWidth = $(this).outerWidth();
                }
            });
            return maxWidth;
        },
        /**
         * Hacky way of getting LESS variables
         * @memberOf Utils
         * @param {string} name The name of the LESS class.
         * @param {string} prop The css property where the data is stored.
         * @returns {number, string}
         */         
        getLessVar: function(name, prop) {
            var value = $('<p class="' + name + '"></p>').hide().appendTo('body').css(prop);
            $('.' + name).remove();
            return /^\d+/.test(value) ? parseInt(value, 10) : value;
        }
    };

/*--------------------------------------------------------------------------*/
    
    /**
     * @namespace Contains LESS data
     */
    var LessVars = {
        inputWidth: Utils.getLessVar('ideal-field-width', 'width')
    };

/*--------------------------------------------------------------------------*/

    /** 
     * A custom <select> menu jQuery plugin
     * @example `$('select').toCustomSelect()`
     */
    $.fn.toCustomSelect = function() {

        return this.each(function() {
            var $select = $(this);
            
            /**
             * Markup and elements of custom select
             * @returns {object} All elements of the new select replacement
             */
            var Select = (function() {
                var $options = $select.find('option'),
                    $newSelect = $('<ul class="ideal-select"/>'),
                    $menu = $('<li><span class="title">' + $options.filter(':selected').text() + '</span></li>'),
                    items = (function() {
                        var items = [];
                        $options.each(function() {
                            var $this = $(this);
                            items.push('<li><span ideal-value="' + $this.val() + '">' + $this.text() + '</span></li>');
                        });
                        return items;
                    }());
                $menu.append('<ul class="sub">' + items.join('') + '</ul>');
                $newSelect.append($menu);
                return {
                    options: $options,
                    select: $newSelect,
                    title: $menu.find('.title'),
                    sub: $menu.find('.sub'),
                    items: $menu.find('.sub li')
                };
            }());

            /**
             * @namespace Methods of custom select
             */
            var Actions = {
                /**
                 * @private
                 */
                init: (function() {
                    $select.css({
                        position: 'absolute',
                        left: '-9999px'
                    });
                    Select.select.insertAfter($select);
                    Select.sub.hide();
                    Select.items
                        .eq(Select.options.filter(':selected').index())
                        .find('span')
                        .addClass('selected');
                }()),
                noWindowScroll: function(e){
                    if (e.which === 40 || e.which === 38 || e.which === 13) {
                        e.preventDefault();
                    }
                },
                // Fix loosing focus when scrolling
                // and selecting item with keyboard
                focusHack: function(){
                    setTimeout(function () {
                        $select.trigger('focus');
                    }, 1);
                },
                focus: function(){
                    Select.select.addClass('focus');
                    $(document).on('keydown.noscroll', Actions.noWindowScroll);
                },
                blur: function() {
                    Select.select.removeClass('open focus');
                    $(document).off('.noscroll');
                },
                scrollIntoView: function(dir) {
                    var $selected = Select.items.find('.selected').parent(),
                        itemHeight = $selected.outerHeight(),
                        menuHeight = Select.sub.outerHeight(),
                        isInView = (function() {
                            var elPos = $selected.position().top + itemHeight;
                            return dir === 'down' ? elPos <= menuHeight : elPos > 0;
                        }());
                    if (!isInView) {
                        itemHeight = (dir === 'down') ? itemHeight : -itemHeight;
                        Select.sub.scrollTop(Select.sub.scrollTop() + itemHeight);
                    }
                },
                scrollToItem: function() {
                    var idx = Select.items.find('.selected').parent().index(),
                        height = Select.items.outerHeight(),
                        items = Select.items.length,
                        allHeight = height * items,
                        curHeight = height * (items - idx);
                    Select.sub.scrollTop(allHeight - curHeight);
                },
                showMenu: function() {
                    Select.sub.show();
                    Select.select.addClass('open');
                    Actions.scrollToItem();
                },
                hideMenu: function(){
                    Select.sub.hide();
                    Select.select.removeClass('open');
                },
                change: function(idx) {
                    var text = Select.items.eq(idx).text();
                    Select.title.text(text);
                    Select.options.eq(idx).prop('selected', true);
                    Select.items.find('span').removeClass('selected');
                    Select.items.eq(idx).find('span').addClass('selected');
                    $select.trigger('change');
                },
                keydown: function(key) {
                    var idx = $select.find('option:selected').index();
                    var keys = {
                        9: function(){ // Tab
                            if (Select.select.is('.menu')) {
                                Actions.blur();
                                Actions.hideMenu();
                            } else {
                                return false;
                            }
                        },
                        13: function() { // Enter
                            Select.sub.is(':visible') ? Actions.hideMenu() : Actions.showMenu();
                        },
                        40: function() { // Down arrow
                            idx < Select.options.length - 1 && Actions.change(idx + 1);
                            Actions.scrollIntoView('down');
                        },
                        38: function() { // Up arrow
                            idx > 0 && Actions.change(idx - 1);
                            Actions.scrollIntoView('up');
                        },
                        'default': function() { // Letter
                            var letter = String.fromCharCode(key),
                                selIdx = Select.items.find('.selected').parent().index(),
                                curIdx = Select.items.filter(function() {
                                    var re = new RegExp('^' + letter, 'i');
                                    return re.test($(this).text());
                                }).first().index();
                            Actions.change(!~curIdx ? selIdx : curIdx);
                            Actions.scrollToItem();
                            $select.trigger('blur');
                            Actions.showMenu();
                            Actions.focusHack();
                        }
                    };
                    keys[key] ? keys[key]() : keys['default']();
                }
            };

            /**
             * @namespace Holds all events of custom select for "menu mode" and "list mode"
             */
            var events = {
                focus: Actions.focus,
                'blur.menu': function(){
                    Actions.blur();
                    Actions.hideMenu();    
                },
                'blur.list': function(){
                    Actions.blur();
                },
                keydown: function(e){
                    Actions.keydown(e.which);
                },
                'clickItem.menu': function(){
                    Actions.change($(this).index());
                    Actions.hideMenu();
                },
                'clickItem.list': function(){
                    Actions.change($(this).index());
                },
                'clickTitle.menu': function(){
                    Actions.focus();
                    Actions.showMenu();
                    $select.trigger('focus');
                },
                'hideOutside.menu': function(){
                    $select.off('blur.menu');
                    $(document).on('mousedown.ideal', function (evt) {
                        if (!$(evt.target).closest(Select.select).length) {
                            $(document).off('mousedown.ideal');
                            $select.on('blur.menu', events['blur.menu']);
                        } else {
                            Actions.focusHack();
                        }
                    });
                },
                'mousedown.list': function(){
                    Actions.focusHack();
                }
            };
 
            // Bind events
            var disableEvents = function(){
                Select.select.removeClass('menu list');
                $select.off('.menu .list');
                Select.items.off('.menu .list');
                Select.select.off('.menu .list');
                Select.title.off('.menu .list');
            };
            
            // Menu
            Select.select
                .on('menu', function(){
                    disableEvents();
                    Select.select.addClass('menu');
                    Actions.hideMenu();
                    $select.on({
                        'blur.menu': events['blur.menu'],
                        'focus.menu' : events.focus,
                        'keydown.menu' : events.keydown
                    });
                    Select.select.on('mousedown.menu', events['hideOutside.menu']);
                    Select.items.on('click.menu', events['clickItem.menu']);
                    Select.title.on('click.menu', events['clickTitle.menu']);
                });

            // List
            Select.select
                .on('list', function(){
                    disableEvents();
                    Select.select.addClass('list');
                    Actions.showMenu();
                    $select.on({
                        'blur.list': events['blur.list'],
                        'focus.list' : events.focus,
                        'keydown.list' : events.keydown
                    });
                    Select.select.on('mousedown.list', events['mousedown.list']);
                    Select.items.on('mousedown.list', events['clickItem.list']);
                });
                
            Select.select.on('menu'); // Default to "menu mode"   
        });
    };

/*--------------------------------------------------------------------------*/

    /** 
     * A custom <input type="radio|checkbox"> jQuery plugin
     * @example `$(':radio, :checkbox').toCustomRadioCheck()`
     */
    $.fn.toCustomRadioCheck = function() {
        return this.each(function() {
            var $this = $(this),
                $span = $('<span/>');
            $this.is(':checkbox') ? $span.addClass('ideal-check') : $span.addClass('ideal-radio');
            $this.is(':checked') && $span.addClass('checked');
            $span.insertAfter($this);
            $this.css({
                position: 'absolute',
                left: '-9999px'
            }).on({
                change: function() {
                    var $this = $(this);
                    $this.trigger('focus');
                    if ($this.is(':radio')) {
                        $this.parent().siblings('label').children('.ideal-radio').removeClass('checked');
                        $this.next('.ideal-radio').addClass('checked');
                    } else {
                        $this.is(':checked') ? $span.addClass('checked') : $span.removeClass('checked');
                    }
                },
                focus: function() {
                    $span.parent().addClass('focus');
                },
                blur: function() {
                    $span.parent().removeClass('focus');
                },
                click: function(){
                    $(this).trigger('focus');
                }
            });
        });
    };

/*--------------------------------------------------------------------------*/

    /**
     * @namespace All default filters used for validation 
     */
    var Filters = {
        number: {
            regex: /\d+/,
            error: 'Must be a number.'
        },
        digits: {
            regex: /^\d+$/,
            error: 'Must be only digits.'
        },
        name: {
            regex: /^[A-Za-z]{3,}$/,
            error: 'Must be at least 3 characters long, and must only contain letters.'
        },
        username: {
            regex: /^[a-z](?=[\w.]{3,31}$)\w*\.?\w*$/i,
            error: 'Must be at between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot (.)'
        },
        pass: {
            regex: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
            error: 'Must be at least 6 characters long, and contain at least one number, one uppercase and one lowercase letter.'
        },
        strongpass: {
            regex: /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
            error: 'Must be at least 8 characters long and contain at least one uppercase and one lowercase letter and one number or special character.'
        },
        email: {
            regex: /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/,
            error: 'Must be a valid e-mail address. <em>(e.g. user@gmail.com)</em>'
        },
        phone: {
            regex: /^[2-9]\d{2}-\d{3}-\d{4}$/,
            error: 'Must be a valid US phone number. <em>(e.g. 555-123-4567)</em>'
        },
        zip: {
            regex: /^\d{5}$|^\d{5}-\d{4}$/,
            error: 'Must be a valid US zip code. <em>(e.g. 33245 or 33245-0003)</em>'
        },
        url: {
            regex: /^(?:(ftp|http|https):\/\/)?(?:[\w\-]+\.)+[a-z]{3,6}$/i,
            error: 'Must be a valid URL. <em>(e.g. www.google.com)</em>'
        },
        min: {
            regex: function(input, value) {
                var min = input.userOptions.data.min;
                if (input.input.is(':checkbox, :radio')) {
                    this.error = 'Check at least <strong>' + min + '</strong>';
                    return input.input.filter(':checked').length >= min;
                }
                this.error = 'Must be at least <strong>' + min + '</strong> characters long.';
                return value.length > min - 1;
            }
        },
        max: {
            regex: function(input, value) {
                var max = input.userOptions.data.max;
                this.error = '<strong>' + max + '</strong> characters max.';
                return value.length <= max;
            }
        },
        date: {
            regex: function(input, value) {
                var match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value),
                    isDate = function(m, d, y) {
                        return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
                    };
                return match && isDate(match[1], match[2], match[3]);
            },
            error: 'Must be a valid date. <em>(e.g. mm/dd/yyyy)</em>'
        },
        exclude: {
            regex: function(input, value) {
                this.error = '"' + value + '" is not available.';
                return !~$.inArray(value, input.userOptions.data.exclude);
            }
        }
    };
    
/*--------------------------------------------------------------------------*/

    /**
     * @namespace jq-idealforms jQuery plugin
     */
    $.fn.idealforms = function(ops) {

        // Default options
        var o = $.extend({
            inputs: {},
            onSuccess: function(e) {
                alert('Thank you...');
            },
            onFail: function() {
                // What happens on submit if the form
                // does NOT validate.
                alert('The form does not validate! Check again...');
            },
            filters: {
                // Add your own filters
                // ie. myfilter: { regex: /something/, error: 'My error' }
            },
            responsiveAt: 'auto'
        }, ops);

        // Merge custom and default filters
        $.extend(true, Filters, o.filters);

/*--------------------------------------------------------------------------*/
        
        var $form = this,
            /**
             * @namespace All form inputs of the given form
             * @returns {object}
             */
            FormInputs = (function() {
                var $inputs = $form.find('input, select, textarea'),
                    $labels = $form.find('label:first-child'),
                    $text = $inputs.filter(':text, :password, textarea'),
                    $select = $inputs.filter('select'),
                    $radiocheck = $inputs.filter(':checkbox, :radio');
                return {
                    inputs: $inputs,
                    labels: $labels,
                    text: $text,
                    select: $select,
                    radiocheck: $radiocheck
                };
            }());
            
/*--------------------------------------------------------------------------*/

        /**
         * @namespace Methods of the form
         */
        var Actions = {

            /** Create validation elements and neccesary markup 
             * @private
             */
            init: (function() {

                var insertNewEls = function ($field) {
                    var error = '<span class="error" />',
                    valid = '<i class="valid-icon" />',
                    invalid = $('<i/>', {
                            'class' : 'invalid-icon',
                            click : function () {
                                var $this = $(this);
                                if ($this.siblings('label').length) { // radio & check
                                    $this.siblings('label:first').find('input').focus();
                                } else {
                                    $this.siblings('input, select, textarea').focus();
                                }
                            }
                        });
                    $(error).hide().insertAfter($field);
                    $(valid).add(invalid).hide().appendTo($field);
                };

                $form.css('visibility', 'visible').addClass('ideal-form');
                $form.children('div').addClass('ideal-wrap');

                // Autocomplete causes some problems...
                FormInputs.inputs.attr('autocomplete', 'off');

                // Labels
                FormInputs.labels.addClass('ideal-label').width(Utils.getMaxWidth(FormInputs.labels));

                // Text inputs & select
                FormInputs.text.add(FormInputs.select).each(function() {
                    var $this = $(this);
                    $this.wrapAll('<span class="field"/>');
                    insertNewEls($this.parent());
                });

                // Radio & Checkbox
                (function() {
                    FormInputs.radiocheck.parent().filter(':last-child').children().each(function() {
                        $(this).parent().siblings('label:not(.ideal-label)').andSelf().wrapAll('<span class="field ideal-radiocheck"/>');
                    });
                    insertNewEls(FormInputs.radiocheck.parents('.field'));
                }());

                // Custom elements
                FormInputs.select.addClass('custom').toCustomSelect();
                FormInputs.radiocheck.addClass('custom').toCustomRadioCheck();

                // Placeholder support
                if (!('placeholder' in $('<input/>')[0])) {
                    FormInputs.text.each(function() {
                        $(this).val($(this).attr('placeholder'));
                    }).on({
                        focus: function() {
                            this.value === $(this).attr('placeholder') && $(this).val('');
                        },
                        blur: function() {
                            $(this).val() || $(this).val($(this).attr('placeholder'));
                        }
                    });
                }
            }()),

            /** Validates an input
             * @memberOf Actions
             * @param {object} input Object that contains the jQuery input object [input.input] 
             * and the user options of that input [input.userOptions]
             * @param {string} value The value of the given input
             * @returns {object} Returns [isValid] plus [error] if it fails 
             */
            validate: function(input, value) {
                var isValid = true,
                    error = '',
                    userOptions = input.userOptions,
                    userFilters;
                if (userOptions.filters) {
                    userFilters = userOptions.filters;
                    if (!value && /required/.test(userFilters)) {
                        if (userOptions.errors && userOptions.errors.required) {
                            error = userOptions.errors.required;
                        } else {
                            error = 'This field is required.';
                        }
                        isValid = false;
                    }
                    if (value) {
                        userFilters = userFilters.split(/\s/);
                        $.each(userFilters, function(i, uf) {
                            var theFilter = Filters[uf];
                            if (theFilter) {
                                if (
                                    typeof theFilter.regex === 'function' && !theFilter.regex(input, value) || 
                                    theFilter.regex instanceof RegExp && !theFilter.regex.test(value)
                                ) {
                                    isValid = false;
                                    error = (userOptions.errors && userOptions.errors[uf]) || theFilter.error;
                                    return false;
                                }
                            }
                        });
                    }
                } else {
                    isValid = true;
                }
                return {
                    isValid: isValid,
                    error: error
                };
            },

            /** Shows or hides validation errors
             * @memberOf Actions
             * @param {object} input Object that contains the jQuery input object [input.input] 
             * and the user options of that input [input.userOptions]
             * @param {string} evt The event on which `analyze()` is being called
             */
            analyze: function(input, evt) {

                evt = evt || '';
                
                var $input = FormInputs.inputs.filter('[name="' + input.input.attr('name') + '"]'),
                    userOptions = o.inputs[input.input.attr('name')] || '',
                    value = (function(){
                        if (input.input.val() === input.input.attr('placeholder')) {
                            return;
                        }
                        // IE8 and IE9 fix empty value bug
                        if (input.input.is(':checkbox, :radio')) {
                            return userOptions && ' ';
                        }
                        return input.input.val();
                    }());

                // Validate
                var test = Actions.validate({
                    userOptions: userOptions,
                    input: $input
                }, value);

                // Validation elements
                var $field = input.input.parents('.field'),
                    $error = $field.next('.error'),
                    $invalid = (function(){
                        if ($input.is(':checkbox, :radio')) {
                            return input.input.parent().siblings('.invalid-icon');
                        }
                        return input.input.siblings('.invalid-icon');
                    }()),
                    $valid = (function(){
                        if ($input.is(':checkbox, :radio')) {
                            return input.input.parent().siblings('.valid-icon');
                        }
                        return input.input.siblings('.valid-icon');
                    }());
                    
                // Reset
                $field.removeClass('valid invalid');
                $error.add($invalid).add($valid).hide();

                // Validates
                if (value && test.isValid) {
                    $error.add($invalid).hide();
                    $field.addClass('valid');
                    $valid.show();
                }
                // Does NOT validate
                if (!test.isValid) {
                    $invalid.show();
                    $field.addClass('invalid');
                    // hide error on blur
                    evt !== 'blur' && $error.html(test.error).show();
                }
            },

            /** Deals with responsiveness aka adaptation
             * @memberOf Actions
             */
            responsive: function() {
                
                var maxWidth = LessVars.inputWidth + FormInputs.labels.outerWidth();
                if (o.responsiveAt === 'auto') {
                    $form.width() < maxWidth ? $form.addClass('stack') : $form.removeClass('stack');
                } else {
                    $(window).width() < o.responsiveAt ? $form.addClass('stack') : $form.removeClass('stack');
                }
                
                // Labels
                (function() {
                    var $emptyLabel = FormInputs.labels.filter(function() {
                        return $(this).html() === '&nbsp;';
                    });
                    $form.is('.stack') ? $emptyLabel.hide() : $emptyLabel.show();
                }());
                
                // Custom select
                (function(){
                    var $customSelect = FormInputs.select.next('.ideal-select');
                    $form.is('.stack') ? $customSelect.trigger('list') : $customSelect.trigger('menu');
                }());
            }
        };

/*--------------------------------------------------------------------------*/

        /** Attach events to the form **/

        FormInputs.inputs.on('keyup change focus blur', function(e) {
            var $this = $(this);
            if ($this.is('.custom')) {
                Actions.analyze({
                    input: $this,
                    custom: $this.next()
                }, e.type);
            } else {
                Actions.analyze({
                    input: $this
                }, e.type);
            }
        }).blur(); // Start fresh

        $form.submit(function(e) {
            if ($form.find('.field.invalid').length) {
                e.preventDefault();
                o.onFail();
            } else {
                o.onSuccess();
            }
        });
            
        $(window).resize(function () {
            Actions.responsive();
        });
        
        Actions.responsive();

        return this;

    };
}(jQuery));