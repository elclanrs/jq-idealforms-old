/* --------------------------------------------------------

    jq-idealforms 2.0

    * Author: Cedric Ruiz
    * License: GPLv2

-------------------------------------------------------- */

(function($) {

    'use strict';

/* --------------------------------------------------------

    Utils:

-------------------------------------------------------- */

    var utils = {
        getMaxWidth: function($elms) {
            var maxWidth = 0;
            $elms.each(function() {
                if ($(this).outerWidth() > maxWidth) {
                    maxWidth = $(this).outerWidth();
                }
            });
            return maxWidth;
        },
        getLessVar: function(name, prop) {
            var value = $('<p class="' + name + '"></p>').hide().appendTo('body').css(prop);
            $('.' + name).remove();
            return /^\d+/.test(value) ? parseInt(value, 10) : value;
        }
    };

/* --------------------------------------------------------

    Less variables:

-------------------------------------------------------- */

    var lessVars = {
        inputWidth: utils.getLessVar('qval-field-width', 'width')
    };

/* --------------------------------------------------------

    Custom select:

-------------------------------------------------------- */

    $.fn.toCustomSelect = function() {

        return this.each(function() {
            var $select = $(this);

            // Elements
            
            var Select = (function() {
                var $options = $select.find('option'),
                    $newSelect = $('<ul class="qval-select"/>'),
                    $menu = $('<li><span class="title">' + $options.filter(':selected').text() + '</span></li>'),
                    items = (function() {
                        var items = [];
                        $options.each(function() {
                            var $this = $(this);
                            items.push('<li><span qval-value="' + $this.val() + '">' + $this.text() + '</span></li>');
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

            // Actions
            
            var actions = {
                init: (function() {
                    $select.css({
                        position: 'absolute',
                        left: '-9999px'
                    });
                    Select.select.insertAfter($select);
                    Select.sub.hide();
                    Select.items.eq(Select.options.filter(':selected').index())
                        .find('span')
                        .addClass('selected');
                }()),
                noWindowScroll: function(e){
                    if (e.which === 40 || e.which === 38 || e.which === 13) {
                        e.preventDefault();
                    }
                },
                focus: function(){
                    Select.select.addClass('focus');
                    $(document).on('keydown.noscroll', actions.noWindowScroll);
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
                    actions.scrollToItem();
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
                        13: function() { // Enter
                            Select.sub.is(':visible') ? actions.hideMenu() : actions.showMenu();
                        },
                        40: function() { // Down arrow
                            idx < Select.options.length - 1 && actions.change(idx + 1);
                            actions.scrollIntoView('down');
                        },
                        38: function() { // Up arrow
                            idx > 0 && actions.change(idx - 1);
                            actions.scrollIntoView('up');
                        },
                        'default': function() { // Letter
                            var letter = String.fromCharCode(key),
                                selIdx = Select.items.find('.selected').parent().index(),
                                curIdx = Select.items.filter(function() {
                                    var re = new RegExp('^' + letter, 'i');
                                    return re.test($(this).text());
                                }).first().index();
                            actions.change(!~curIdx ? selIdx : curIdx);
                            actions.scrollToItem();
                        }
                    };
                    keys[key] ? keys[key]() : keys['default']();
                }
            };

            // Events

            var events = {
                focus: actions.focus,
                'blur.menu': function(){
                    actions.blur();
                    actions.hideMenu();    
                },
                'blur.list': function(){
                    actions.blur();
                },
                keydown: function(e){
                    actions.keydown(e.which);
                },
                'clickItem.menu': function(){
                    actions.change($(this).index());
                    actions.hideMenu();
                },
                'clickItem.list': function(){
                    actions.change($(this).index());
                },
                'clickTitle.menu': function(){
                    actions.focus();
                    actions.showMenu();
                    $select.trigger('focus');
                },
                'hideOutside.menu': function(){
                    $select.off('blur.menu');
                    $(document).on('mousedown.qval', function (evt) {
                        if (!$(evt.target).closest(Select.select).length) {
                            $(document).off('mousedown.qval');
                            $select.on('blur.menu', events['blur.menu']);
                        } else {
                            // Fix loosing focus when scrolling
                            setTimeout(function () {
                                $select.trigger('focus');
                            }, 1);
                        }
                    });
                },
                'mousedown.list': function(){
                    setTimeout(function () {
                        $select.trigger('focus');
                    }, 1);    
                }
            };
            
                        
            // Bind events
            
            // Custom events to change between
            // `menu mode` and `list mode`
            
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
                    actions.hideMenu();
                    $select.on({
                        'blur.menu': events['blur.menu'],
                        'focus.menu' : events.focus,
                        'keyup.menu' : events.keydown
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
                    actions.showMenu();
                    $select.on({
                        'blur.list': events['blur.list'],
                        'focus.list' : events.focus,
                        'keyup.list' : events.keydown
                    });
                    Select.select.on('mousedown.list', events['mousedown.list']);
                    Select.items.on('click.list', events['clickItem.list']);
                });
                
            Select.select.on('menu'); // Default to `menu mode`   
        });
    };

/* --------------------------------------------------------

    Custom radio & checkbox:

-------------------------------------------------------- */

    $.fn.toCustomRadioCheck = function() {
        return this.each(function() {
            var $this = $(this),
                $span = $('<span/>');
            $this.is(':checkbox') ? $span.addClass('qval-check') : $span.addClass('qval-radio');
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
                        $this.parent().siblings('label').children('.qval-radio').removeClass('checked');
                        $this.next('.qval-radio').addClass('checked');
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

/* --------------------------------------------------------

    Filters:

-------------------------------------------------------- */

    var filters = {
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
                if (input.input.is(':checkbox, :radio')) {
                    this.error = 'Check at least <strong>' + input.userOptions.data.min + '</strong>';
                    return input.input.filter(':checked').length >= input.userOptions.data.min;
                }
                this.error = 'Must be at least <strong>' + input.userOptions.data.min + '</strong> characters long.';
                return value.length > input.userOptions.data.min - 1;
            }
        },
        max: {
            regex: function(input, value) {
                this.error = '<strong>' + input.userOptions.data.max + '</strong> characters max.';
                return value.length <= input.userOptions.data.max;
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

/* --------------------------------------------------------
###########################################################
###################      Plugin:      ##################### 
###########################################################
-------------------------------------------------------- */

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
            }
        }, ops);

        // Merge custom and default filters
        $.extend(true, filters, o.filters);

/* --------------------------------------------------------

    Form elements:
    
-------------------------------------------------------- */

        var $form = this,
            formInputs = (function() {
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
            
/* --------------------------------------------------------

    Actions:

-------------------------------------------------------- */

        var actions = {

/* --------------------------------------------------------

    Init:

-------------------------------------------------------- */

            init: (function() {

                var insertNewEls = function($field) {
                        var error = '<span class="error" />',
                            valid = '<i class="valid-icon" />',
                            invalid = $('<i/>', {
                                'class': 'invalid-icon',
                                click: function() {
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

                $form.css('visibility', 'visible').addClass('qval-form');

                // Autocomplete causes some problems...
                formInputs.inputs.attr('autocomplete', 'off');

                // Labels
                formInputs.labels.addClass('qval-label').width(utils.getMaxWidth(formInputs.labels));

                // Text inputs & select
                formInputs.text.add(formInputs.select).each(function() {
                    var $this = $(this);
                    $this.wrapAll('<span class="field"/>');
                    insertNewEls($this.parent());
                });

                // Radio & Checkbox
                (function() {
                    formInputs.radiocheck.parent().filter(':last-child').children().each(function() {
                        $(this).parent().siblings('label:not(.qval-label)').andSelf().wrapAll('<span class="field qval-radiocheck"/>');
                    });
                    insertNewEls(formInputs.radiocheck.parents('.field'));
                }());

                // Custom elements
                formInputs.select.addClass('custom').toCustomSelect();
                formInputs.radiocheck.addClass('custom').toCustomRadioCheck();

                // Placeholder support
                if (!('placeholder' in $('<input/>')[0])) {
                    formInputs.text.each(function() {
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

/* --------------------------------------------------------

    Validate:

    * input: {
        userOptions:
        input:
    }
    * value: the value of the input being processed

-------------------------------------------------------- */

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
                            if (filters[uf]) {
                                if (
                                    typeof filters[uf].regex === 'function' && !filters[uf].regex(input, value) || 
                                    filters[uf].regex instanceof RegExp && !filters[uf].regex.test(value)
                                ) {
                                    isValid = false;
                                    error = (userOptions.errors && userOptions.errors[uf]) || filters[uf].error;
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

/* --------------------------------------------------------

    Analyze:

    * input: {
        input : $input,
        custom : $input.next()
    }
    * evt: the event on which `analyze()` is invoked

-------------------------------------------------------- */

            analyze: function(input, evt) {

                evt = evt || '';
                
                var $input = formInputs.inputs.filter('[name="' + input.input.attr('name') + '"]'),
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
                var test = actions.validate({
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

                // Valid
                if (value && test.isValid) {
                    $error.add($invalid).hide();
                    $field.addClass('valid');
                    $valid.show();
                }
                // Invalid
                if (!test.isValid) {
                    $invalid.show();
                    $field.addClass('invalid');
                    // hide error on blur
                    evt !== 'blur' && $error.html(test.error).show();
                }
            },

/* --------------------------------------------------------

    Responsive:

-------------------------------------------------------- */

            responsive: function() {
                var maxWidth = lessVars.inputWidth + formInputs.labels.outerWidth();
                $form.width() < maxWidth ? $form.addClass('stack') : $form.removeClass('stack');

                // Labels
                (function() {
                    var $emptyLabel = formInputs.labels.filter(function() {
                        return $(this).html() === '&nbsp;';
                    });
                    $form.is('.stack') ? $emptyLabel.hide() : $emptyLabel.show();
                }());
                
                // Custom select
                (function(){
                    var $customSelect = formInputs.select.next('.qval-select');
                    $form.is('.stack') ? $customSelect.trigger('list') : $customSelect.trigger('menu');
                }());
            }
        };

/* --------------------------------------------------------

    Events:

-------------------------------------------------------- */

        formInputs.inputs.on('keyup change focus blur', function(e) {
            var $this = $(this);
            if ($this.is('.custom')) {
                actions.analyze({
                    input: $this,
                    custom: $this.next()
                }, e.type);
            } else {
                actions.analyze({
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

        $(window).resize(function() {
            actions.responsive();
        });

        actions.responsive();

        return this;

    };
}(jQuery));