;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Errors
 */
module.exports = {

  required: 'This field is required',
  digits: 'Must be only digits',
  name: 'Must be at least 3 characters long and must only contain letters',
  email: 'Must be a valid email',
  username: 'Must be at between 4 and 32 characters long and start with a letter. You may use letters, numbers, underscores, and one dot',
  pass: 'Must be at least 6 characters long, and contain at least one number, one uppercase and one lowercase letter',
  strongpass: 'Must be at least 8 characters long and contain at least one uppercase and one lowercase letter and one number or special character',
  phone: 'Must be a valid phone number',
  zip: 'Must be a valid zip code',
  url: 'Must be a valid URL',
  number: 'Must be a number',
  range: 'Must be a number between {0} and {1}',
  min: 'Must be at least {0} characters long',
  max: 'Must be under {0} characters',
  minoption: 'Select at least {0} options',
  maxoption: 'Select no more than {0} options',
  minmax: 'Must be between {0} and {1} characters long',
  select: 'Select an option',
  extension: 'File(s) must have a valid extension ({*})',
  equalto: 'Must have the same value as the "{0}" field',
  date: 'Must be a valid date {0}'

};

},{}],2:[function(require,module,exports){
module.exports = {

  name: 'idealAjax',

  methods: {

    // @extend
    _init: function() {

      $.extend($.idealforms, { _requests: {} });

      $.extend($.idealforms.errors, {
        ajax: 'Loading...'
      });

      $.extend($.idealforms.rules, {

        ajax: function(input) {

          var self = this
            , $field = this._getField(input)
            , url = $(input).data('idealforms-ajax')
            , userError = $.idealforms._getKey('errors.'+ input.name +'.ajaxError', self.opts)
            , requests = $.idealforms._requests
            , data = {};

          data[input.name] = input.value;

          $field.addClass('ajax');

          if (requests[input.name]) requests[input.name].abort();

          requests[input.name] = $.post(url, data, function(resp) {

            if (resp === true) {
              $field.data('idealforms-valid', true);
              self._handleError(input);
              self._handleStyle(input);
            } else {
              self._handleError(input, userError);
            }

            $field.removeClass('ajax');

          }, 'json');

          return false;
        }
      });
    },

    // @extend
    _validate: function(input, rule) {
      if (rule != 'ajax' && $.idealforms._requests[input.name]) {
        $.idealforms._requests[input.name].abort();
        this._getField(input).removeClass('ajax');
      }
    }

  }
};

},{}],3:[function(require,module,exports){
require('./idealfile');
require('./idealradiocheck');

module.exports = {

  name: 'customInputs',

  methods: {

    // @extend
    _init: function() {
      this._buildCustomInputs();
    },

    addFields: function() {
      this._buildCustomInputs();
    },

    _buildCustomInputs: function() {
      this.$form.find(':file').idealfile();
      this.$form.find(':checkbox, :radio').idealradiocheck();
    }

  }
};

},{"./idealfile":4,"./idealradiocheck":5}],4:[function(require,module,exports){
/**
 * Ideal File
 */
(function($, win, doc, undefined) {

  // Browser supports HTML5 multiple file?
  var multipleSupport = typeof $('<input/>')[0].multiple !== 'undefined'
    , isIE = /msie/i.test(navigator.userAgent)
    , plugin = {};

  plugin.name = 'idealfile';

  plugin.methods = {
  
      _init: function() {

        var $file = $(this.el).addClass('ideal-file') // the original file input
          , $wrap = $('<div class="ideal-file-wrap">')
          , $input = $('<input type="text" class="ideal-file-filename" />')
            // Button that will be used in non-IE browsers
          , $button = $('<button type="button" class="ideal-file-upload">Open</button>')
            // Hack for IE
          , $label = $('<label class="ideal-file-upload" for="' + $file[0].id + '">Open</label>');

        // Hide by shifting to the left so we
        // can still trigger events
        $file.css({
          position: 'absolute',
          left: '-9999px'
        });

        $wrap.append($input, (isIE ? $label : $button)).insertAfter($file);

        // Prevent focus
        $file.attr('tabIndex', -1);
        $button.attr('tabIndex', -1);

        $button.click(function () {
          $file.focus().click(); // Open dialog
        });

        $file.change(function () {

          var files = []
            , fileArr, filename;

            // If multiple is supported then extract
            // all filenames from the file array
          if (multipleSupport) {
            fileArr = $file[0].files;
            for (var i = 0, len = fileArr.length; i < len; i++) {
              files.push(fileArr[i].name);
            }
            filename = files.join(', ');

            // If not supported then just take the value
            // and remove the path to just show the filename
          } else {
            filename = $file.val().split('\\').pop();
          }

          $input .val(filename).attr('title', filename);

        });

        $input.on({
          blur: function () {
            $file.trigger('blur');
          },
          keydown: function (e) {
            if (e.which === 13) { // Enter
              if (!isIE) $file.trigger('click');
              $(this).closest('form').one('keydown', function(e) {
                if (e.which === 13) e.preventDefault();
              });
            } else if (e.which === 8 || e.which === 46) { // Backspace & Del
              // In IE the value is read-only
              // with this trick we remove the old input and add
              // a clean clone with all the original events attached
              if (isIE) $file.replaceWith($file = $file.clone(true));
              $file.val('').trigger('change');
              $input.val('');
            } else if (e.which === 9) { // TAB
              return;
            } else { // All other keys
              return false;
            }
          }
        });

      }
  
  };

  require('../../plugin')(plugin);

}(jQuery, window, document));

},{"../../plugin":11}],5:[function(require,module,exports){
/*
 * idealRadioCheck: jQuery plguin for checkbox and radio replacement
 * Usage: $('input[type=checkbox], input[type=radio]').idealRadioCheck()
 */
(function($, win, doc, undefined) {

  var plugin = {};

  plugin.name = 'idealradiocheck';

  plugin.methods = {

    _init: function() {

      var $input = $(this.el);
      var $span = $('<span/>');

      $span.addClass('ideal-'+ ($input.is(':checkbox') ? 'check' : 'radio'));
      $input.is(':checked') && $span.addClass('checked'); // init
      $span.insertAfter($input);

      $input.parent('label')
        .addClass('ideal-radiocheck-label')
        .attr('onclick', ''); // Fix clicking label in iOS

      $input.css({ position: 'absolute', left: '-9999px' }); // hide by shifting left

      // Events
      $input.on({
        change: function() {
          var $input = $(this);
          if ( $input.is('input[type="radio"]') ) {
            $input.parent().siblings('label').find('.ideal-radio').removeClass('checked');
          }
          $span.toggleClass('checked', $input.is(':checked'));
        },
        focus: function() { $span.addClass('focus') },
        blur: function() { $span.removeClass('focus') },
        click: function() { $(this).trigger('focus') }
      });
    }

  };

  require('../../plugin')(plugin);

}(jQuery, window, document));


},{"../../plugin":11}],6:[function(require,module,exports){
module.exports = {

  name: 'datepicker',

  methods: {

    // @extend
    _init: function() {
      this._buildDatepicker();
    },

   _buildDatepicker: function() {

      var $datepicker = this.$form.find('input.datepicker');

      // Always show datepicker below the input
      if (jQuery.ui) {
        $.datepicker._checkOffset = function(a,b,c){ return b };
      }

      if (jQuery.ui && $datepicker.length) {

        $datepicker.each(function() {

          $(this).datepicker({
            beforeShow: function(input) {
              $(input).addClass('open');
            },
            onChangeMonthYear: function() {
              // Hack to fix IE9 not resizing
              var $this = $(this)
                , width = $this.outerWidth(); // cache first!
              setTimeout(function() {
                $this.datepicker('widget').css('width', width);
              }, 1);
            },
            onClose: function() {
              $(this).removeClass('open');
            }
          });
        });

        // Adjust width
        $datepicker.on('focus keyup', function() {
          var t = $(this), w = t.outerWidth();
          t.datepicker('widget').css('width', w);
        });
      }
    }

  }
};

},{}],7:[function(require,module,exports){
function template(html, data) {

  var loop = /\{@([^}]+)\}(.+?)\{\/\1\}/g
    , loopVariable = /\{#([^}]+)\}/g
    , variable = /\{([^}]+)\}/g;

  return html
    .replace(loop, function(_, key, list) {
      return $.map(data[key], function(item) {
        return list.replace(loopVariable, function(_, k) {
          return item[k];
        });
      }).join('');
    })
    .replace(variable, function(_, key) {
      return data[key] || '';
    });
}

module.exports = {

  name: 'dynamicFields',

  options: {

    templates: {

      base:'\
        <div class="field" {class}>\
          <label class="main">{label}</label>\
          {field}\
          <span class="error"></span>\
        </div>\
      ',

      text: '<input name="{name}" type="{subtype}" value="{value}" {attrs}>',

      file: '<input id="{name} "name="{name}" type="file" {attrs}>',

      textarea: '<textarea name="{name}" {attrs}>{text}</textarea>',

      group: '\
        <p class="group">\
          {@list}\
          <label><input name="{name}" type="{subtype}" value="{#value}" {#attrs}>{#text}</label>\
          {/list}\
        </p>\
      ',

      select: '\
        <select name={name}>\
          {@list}\
          <option value="{#value}">{#text}</option>\
          {/list}\
        </select>\
      '
    }
  },

  methods: {

    addFields: function(fields) {

      var self = this;

      $.each(fields, function(name, field) {

        var typeArray = field.type.split(':')
          , rules = {};

        field.name = name;
        field.type = typeArray[0];
        if (typeArray[1]) field.subtype = typeArray[1];

        var html = template(self.opts.templates.base, {
          label: field.label,
          field: template(self.opts.templates[field.type], field)
        });

        if (field.after || field.before) {
          self.$form.find('[name='+ (field.after || field.before) +']').each(function() {
            self._getField(this)[field.after ? 'after' : 'before'](html);
          });
        } else {
          self.$form.find(self.opts.field).last().after(html);
        }

        if (field.rules) {
          rules[name] = field.rules;
          self.addRules(rules);
        }
      });

      this._inject('addFields');
    },

    removeFields: function(names) {

      var self = this;

      $.each(names.split(' '), function(i, name) {
        var $field = self._getField($('[name="'+ name +'"]'));
        self.$fields = self.$fields.filter(function() {
          return ! $(this).is($field);
        });
        $field.remove();
      });

      this._inject('removeFields');
    },

    toggleFields: function(names) {

      var self = this;

      $.each(names.split(' '), function(i, name) {
        var $field = self._getField($('[name="'+ name +'"]'));
        $field.data('idealforms-valid', $field.is(':visible')).toggle();
      });

      this._inject('toggleFields');
    }

  }
};

},{}],8:[function(require,module,exports){
/*!
 * Ideal Steps
*/
(function($, win, doc, undefined) {

  var plugin = {};

  plugin.name = 'idealsteps';

  plugin.defaults = {
    nav: '.idealsteps-nav',
    navItems: 'li',
    buildNavItems: true,
    wrap: '.idealsteps-wrap',
    step: '.idealsteps-step',
    activeClass: 'idealsteps-step-active',
    before: null,
    after: null,
    fadeSpeed: 0
  };

  plugin.methods = {

    _init: function() {

      var self = this,
          active = this.opts.activeClass;

      this.$el = $(this.el);

      this.$nav = this.$el.find(this.opts.nav);
      this.$navItems = this.$nav.find(this.opts.navItems);

      this.$wrap = this.$el.find(this.opts.wrap);
      this.$steps = this.$wrap.find(this.opts.step);

      if (this.opts.buildNavItems) this._buildNavItems();

      this.$steps.hide().first().show();
      this.$navItems.removeClass(active).first().addClass(active);

      this.$navItems.click(function() {
        self.go(self.$navItems.index(this));
      });
    },

    _buildNavItems: function() {

      var self = this,
          isCustom = typeof this.opts.buildNavItems == 'function',
          item = function(val){ return '<li><a href="#" tabindex="-1">'+ val +'</a></li>'; },
          items;

      items = isCustom ?
        this.$steps.map(function(i){ return item(self.opts.buildNavItems.call(self, i)) }).get() :
        this.$steps.map(function(i){ return item(++i); }).get();

      this.$navItems = $(items.join(''));

      this.$nav.append($('<ul/>').append(this.$navItems));
    },

    _getCurIdx: function() {
      return this.$steps.index(this.$steps.filter(':visible'));
    },

    go: function(idx) {

      var active = this.opts.activeClass,
          fadeSpeed = this.opts.fadeSpeed;

      if (typeof idx == 'function') idx = idx.call(this, this._getCurIdx());

      if (idx >= this.$steps.length) idx = 0;
      if (idx < 0) idx = this.$steps.length-1;

      if (this.opts.before) this.opts.before.call(this, idx);

      this.$navItems.removeClass(active).eq(idx).addClass(active);
      this.$steps.fadeOut(fadeSpeed).eq(idx).fadeIn(fadeSpeed);

      if (this.opts.after) this.opts.after.call(this, idx);
    },

    prev: function() {
      this.go(this._getCurIdx() - 1);
    },

    next: function() {
      this.go(this._getCurIdx() + 1);
    },

    first: function() {
      this.go(0);
    },

    last: function() {
      this.go(this.$steps.length-1);
    }
  };

  require('../../plugin')(plugin);

}(jQuery, window, document));

},{"../../plugin":11}],9:[function(require,module,exports){
require('./idealsteps');

module.exports = {

  name: 'steps',

  options: {
    stepsContainer: '.idealsteps-container',
    stepsOptions: {}
  },

  methods: {

    // @extend
    _init: function() {
      this._buildSteps();
    },

    // @extend
    _validate: function() {

      var self = this;

      this._updateSteps();

      if ($.idealforms.hasExtension('idealAjax')) {
        $.each($.idealforms._requests, function(key, request) {
          request.done(function(){ self._updateSteps() });
        });
      }
    },

    // @extend
    focusFirstInvalid: function(firstInvalid) {

      var self = this;

      this.$stepsContainer.idealsteps('go', function() {
        return this.$steps.filter(function() {
          return $(this).find(firstInvalid).length;
        }).index();
      });
    },

    _buildSteps: function() {

      var self = this, options
        , hasRules = ! $.isEmptyObject(this.opts.rules)
        , counter = hasRules
          ? '<span class="counter"/>'
          : '<span class="counter zero">0</span>';

      options = $.extend({}, {
        buildNavItems: function(i){ return 'Step '+ (i+1) + counter }
      }, this.opts.stepsOptions);

      this.$stepsContainer = this.$form.closest(this.opts.stepsContainer).idealsteps(options);
    },

    _updateSteps: function() {

      var self = this;

      this.$stepsContainer.idealsteps('_inject', function() {

        var idealsteps = this;

        this.$navItems.each(function(i) {
          var invalid = idealsteps.$steps.eq(i).find(self.getInvalid()).length;
          $(this).find('span').text(invalid).toggleClass('zero', ! invalid);
        });
      });
    },

    // @extend
    addRules: function() {
      this.firstStep();
    },

    // @extend
    toggleFields: function() {
      this._updateSteps();
    },

    // @extend
    removeFields: function() {
      this._updateSteps();
    },

    goToStep: function(idx) {
      this.$stepsContainer.idealsteps('go', idx);
    },

    prevStep: function() {
      this.$stepsContainer.idealsteps('prev');
    },

    nextStep: function() {
      this.$stepsContainer.idealsteps('next');
    },

    firstStep: function() {
      this.$stepsContainer.idealsteps('first');
    },

    lastStep: function() {
      this.$stepsContainer.idealsteps('last');
    }
  }

};

},{"./idealsteps":8}],10:[function(require,module,exports){
/*!
 * jQuery Ideal Forms
 * @author: Cedric Ruiz
 * @version: 3.0
 * @license GPL or MIT
 */
(function($, win, doc, undefined) {

  var plugin = {};

  plugin.name = 'idealforms';

  plugin.defaults = {
    field: '.field',
    error: '.error',
    iconHtml: '<i/>',
    iconClass: 'icon',
    invalidClass: 'invalid',
    validClass: 'valid',
    silentLoad: true,
    onValidate: $.noop,
    onSubmit: $.noop
  };

  plugin.global = {

    _format: function(str) {
      var args = [].slice.call(arguments, 1);
      return str.replace(/\{(\d)\}/g, function(_, match) {
        return args[+match] || '';
      }).replace(/\{\*([^*}]*)\}/g, function(_, sep) {
        return args.join(sep || ', ');
      });
    },

    _getKey: function(key, obj) {
      return key.split('.').reduce(function(a,b) {
        return a && a[b];
      }, obj);
    },

    ruleSeparator: ' ',
    argSeparator: ':',

    rules: require('./rules'),
    errors: require('./errors'),

    extensions: [
      require('./extensions/dynamic-fields/dynamic-fields.ext'),
      require('./extensions/ajax/ajax.ext'),
      require('./extensions/steps/steps.ext'),
      require('./extensions/custom-inputs/custom-inputs.ext'),
      require('./extensions/datepicker/datepicker.ext')
    ]
  };

  plugin.methods = $.extend({}, require('./private'), require('./public'));

  require('./plugin')(plugin);

}(jQuery, window, document));

},{"./errors":1,"./extensions/ajax/ajax.ext":2,"./extensions/custom-inputs/custom-inputs.ext":3,"./extensions/datepicker/datepicker.ext":6,"./extensions/dynamic-fields/dynamic-fields.ext":7,"./extensions/steps/steps.ext":9,"./plugin":11,"./private":12,"./public":13,"./rules":14}],11:[function(require,module,exports){
/**
 * Plugin boilerplate
 */
module.exports = (function() {

  var AP = Array.prototype;

  return function(plugin) {

    $.extend({
      name: 'plugin',
      defaults: {},
      methods: {},
      global: {},
    }, plugin);

    $[plugin.name] = $.extend({

      addExtension: function(extension) {
        plugin.global.extensions.push(extension);
      },

      hasExtension: function(extension) {
        return plugin.global.extensions.filter(function(ext) {
          return ext.name == extension;
        }).length;
      }
    }, plugin.global);

    function Plugin(element, options) {

      this.opts = $.extend({}, plugin.defaults, options);
      this.el = element;

      this._name = plugin.name;

      this._init();
    }

    Plugin._extended = {};

    Plugin.prototype._extend = function(extensions) {

      var self = this
        , disabled = self.opts.disabledExtensions || 'none';

      $.each(extensions, function(i, extension) {

        $.extend(self.opts, $.extend(true, extension.options, self.opts));

        $.each(extension.methods, function(method, fn) {

          if (disabled.indexOf(extension.name) > -1) {
            return;
          }

          if (Plugin.prototype[method]) {
            Plugin._extended[method] = Plugin._extended[method] || [];
            Plugin._extended[method].push({ name: extension.name, fn: fn });
          } else {
            Plugin.prototype[method] = fn;
          }
        });

      });
    };

    Plugin.prototype._inject = function(method) {

      var args = [].slice.call(arguments, 1);

      if (typeof method == 'function') return method.call(this);

      var self = this;

      if (Plugin._extended[method]) {
        $.each(Plugin._extended[method], function(i, plugin) {
          plugin.fn.apply(self, args);
        });
      }
    };

    Plugin.prototype._init = $.noop;

    Plugin.prototype[plugin.name] = function(method) {
      if (!method) return this;
      try { return this[method].apply(this, AP.slice.call(arguments, 1)); }
      catch(e) {}
    };

    $.extend(Plugin.prototype, plugin.methods);

    $.fn[plugin.name] = function() {

      var args = AP.slice.call(arguments)
        , methodArray = typeof args[0] == 'string' && args[0].split(':')
        , method = methodArray[methodArray.length > 1 ? 1 : 0]
        , prefix = methodArray.length > 1 && methodArray[0]
        , opts = typeof args[0] == 'object' && args[0]
        , params = args.slice(1)
        , ret;

      if (prefix) {
        method = prefix + method.substr(0,1).toUpperCase() + method.substr(1,method.length-1);
      }

      this.each(function() {

        var instance = $.data(this, plugin.name);

        // Method
        if (instance) {
          return ret = instance[plugin.name].apply(instance, [method].concat(params));
        }

        // Init
        return $.data(this, plugin.name, new Plugin(this, opts));
      });

      return prefix ? ret : this;
    };
  };

}());

},{}],12:[function(require,module,exports){
/**
 * Private methods
 */
module.exports = {

  _init: function() {

    var self = this;

    this._extend($.idealforms.extensions);

    this.$form = $(this.el);
    this.$fields = $();
    this.$inputs = $();

    this.$form.submit(function(e) {
      e.preventDefault();
      self.focusFirstInvalid();
      self.opts.onSubmit.call(this, self.getInvalid().length, e);
    });

    this._inject('_init');

    this.addRules(this.opts.rules || {});

    if (! this.opts.silentLoad) this.focusFirstInvalid();
  },

  _buildField: function(input) {

    var self = this
      , $field = this._getField(input)
      , $icon;

    $icon = $(this.opts.iconHtml, {
      class: this.opts.iconClass,
      click: function(){ $(input).focus() }
    });

    if (! this.$fields.filter($field).length) {
      this.$fields = this.$fields.add($field);
      if (this.opts.iconHtml) $field.append($icon);
      $field.addClass('idealforms-field idealforms-field-'+ input.type);
    }

    this._addEvents(input);

    this._inject('_buildField', input);
  },

  _addEvents: function(input) {

    var self = this
      , $field = this._getField(input);

    $(input)
      .on('change keyup', function(e) {

        var oldValue = $field.data('idealforms-value');

        if (e.which == 9 || e.which == 16) return;
        if (! $(this).is(':checkbox, :radio') && oldValue == this.value) return;

        $field.data('idealforms-value', this.value);

        self._validate(this, true, true);
      })
      .focus(function() {

        if (self.isValid(this.name)) return false;

        if (self._isRequired(this) || this.value) {
          $field.find(self.opts.error).show();
        }
      })
      .blur(function() {
        $field.find(self.opts.error).hide();
      });
  },

  _isRequired: function(input) {
    // We assume non-text inputs with rules are required
    if ($(input).is(':checkbox, :radio, select')) return true;
    return this.opts.rules[input.name].indexOf('required') > -1;
  },

  _getRelated: function(input) {
    return this._getField(input).find('[name="'+ input.name +'"]');
  },

  _getField: function(input) {
    return $(input).closest(this.opts.field);
  },

  _getFirstInvalid: function() {
    return this.getInvalid().first().find('input:first, textarea, select');
  },

  _handleError: function(input, error, valid) {
    valid = valid || this.isValid(input.name);
    var $error = this._getField(input).find(this.opts.error);
    this.$form.find(this.opts.error).hide();
    if (error) $error.text(error);
    $error.toggle(!valid);
  },

  _handleStyle: function(input, valid) {
    valid = valid || this.isValid(input.name);
    this._getField(input)
      .removeClass(this.opts.validClass +' '+ this.opts.invalidClass)
      .addClass(valid ? this.opts.validClass : this.opts.invalidClass)
      .find('.'+ this.opts.iconClass).show();
  },

  _fresh: function(input) {
    this._getField(input)
      .removeClass(this.opts.validClass +' '+ this.opts.invalidClass)
      .find(this.opts.error).hide()
      .end()
      .find('.'+ this.opts.iconClass).toggle(this._isRequired(input));
  },

  _validate: function(input, handleError, handleStyle) {

    var self = this
      , $field = this._getField(input)
      , userRules = this.opts.rules[input.name].split($.idealforms.ruleSeparator)
      , valid = true
      , rule;

    // Non-required input with empty value must pass validation
    if (! input.value && ! this._isRequired(input)) {
      $field.removeData('idealforms-valid');
      this._fresh(input);

    // Required inputs
    } else {

      $.each(userRules, function(i, userRule) {

        userRule = userRule.split($.idealforms.argSeparator);

        rule = userRule[0];

        var theRule = $.idealforms.rules[rule]
          , args = userRule.slice(1)
          , error;

        error = $.idealforms._format.apply(null, [
          $.idealforms._getKey('errors.'+ input.name +'.'+ rule, self.opts) ||
          $.idealforms.errors[rule]
        ].concat(args));

        valid = typeof theRule == 'function'
          ? theRule.apply(self, [input, input.value].concat(args))
          : theRule.test(input.value);

        $field.data('idealforms-valid', valid);

        if (handleError) self._handleError(input, error, valid);
        if (handleStyle) self._handleStyle(input, valid);

        self.opts.onValidate.call(self, input, rule, valid);

        return valid;
      });
    }

    this._inject('_validate', input, rule, valid);

    return valid;
  }

};

},{}],13:[function(require,module,exports){
/**
 * Public methods
 */
module.exports = {

  addRules: function(rules) {

    var self = this;

    var $inputs = this.$form.find($.map(rules, function(_, name) {
      return '[name="'+ name +'"]';
    }).join(','));

    $.extend(this.opts.rules, rules);

    $inputs.each(function(){ self._buildField(this) });

    this.$inputs = this.$inputs
      .add($inputs)
      .each(function(){ self._validate(this, true) });

    this.$fields.find(this.opts.error).hide();

    this._inject('addRules');
  },

  getInvalid: function() {
    return this.$fields.filter(function() {
      return $(this).data('idealforms-valid') === false;
    });
  },

  focusFirstInvalid: function() {

    var firstInvalid = this._getFirstInvalid()[0];

    if (firstInvalid) {
      this._handleError(firstInvalid);
      this._handleStyle(firstInvalid);
      this._inject('focusFirstInvalid', firstInvalid);
      firstInvalid.focus();
    }
  },

  isValid: function(name) {
    if (name) return ! this.getInvalid().find('[name="'+ name +'"]').length;
    return ! this.getInvalid().length;
  },

  reset: function(name) {

    var self = this
      , $inputs = this.$inputs;

    if (name) $inputs = $inputs.filter('[name="'+ name +'"]');

    $inputs.filter('input:not(:checkbox, :radio)').val('');
    $inputs.filter(':checkbox, :radio').prop('checked', false);
    $inputs.filter('select').find('option').prop('selected', function() {
      return this.defaultSelected;
    });

    $inputs.change().each(function(){ self._resetErrorAndStyle(this) });
  }

};

},{}],14:[function(require,module,exports){
/**
 * Rules
 */
module.exports = {

  required: /.+/,
  digits: /^\d+$/,
  email: /^[^@]+@[^@]+\..{2,6}$/,
  username: /^[a-z](?=[\w.]{3,31}$)\w*\.?\w*$/i,
  pass: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
  strongpass: /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
  phone: /^[2-9]\d{2}-\d{3}-\d{4}$/,
  zip: /^\d{5}$|^\d{5}-\d{4}$/,
  url: /^(?:(ftp|http|https):\/\/)?(?:[\w\-]+\.)+[a-z]{2,6}([\:\/?#].*)?$/i,

  number: function(input, value) {
    return !isNaN(value);
  },

  range: function(input, value, mix, max) {
    return Number(value) >= min && Number(value) <= max;
  },

  min: function(input, value, min) {
    return value.length >= min;
  },

  max: function(input, value, max) {
    return value.length <= max;
  },

  minoption: function(input, value, min) {
    return this._getRelated(input).filter(':checked').length >= min;
  },

  maxoption: function(input, value, max) {
    return this._getRelated(input).filter(':checked').length <= max;
  },

  minmax: function(input, value, min, max) {
    return value.length >= min && value.length <= max;
  },

  select: function(input, value, def) {
    return value != def;
  },

  extension: function(input) {

    var extensions = [].slice.call(arguments, 1)
      , valid = false;

    $.each(input.files || [{name: input.value}], function(i, file) {
      valid = $.inArray(file.name.match(/\.(.+)$/)[1], extensions) > -1;
    });

    return valid;
  },

  equalto: function(input, value, target) {

    var self = this
      , $target = $('[name="'+ target +'"]');

    if (this.getInvalid().find($target).length) return false;

    $target.off('keyup.equalto').on('keyup.equalto', function() {
      self._validate(input, false, true);
    });

    return input.value == $target.val();
  },

  date: function(input, value, format) {

    format = format || 'mm/dd/yyyy';

    var delimiter = /[^mdy]/.exec(format)[0]
      , theFormat = format.split(delimiter)
      , theDate = value.split(delimiter);

    function isDate(date, format) {

      var m, d, y;

      for (var i = 0, len = format.length; i < len; i++) {
        if (/m/.test(format[i])) m = date[i];
        if (/d/.test(format[i])) d = date[i];
        if (/y/.test(format[i])) y = date[i];
      }

      if (!m || !d || !y) return false;

      return m > 0 && m < 13 &&
        y && y.length == 4 &&
        d > 0 && d <= (new Date(y, m, 0)).getDate();
    }

    return isDate(theDate, theFormat);
  }

};

},{}]},{},[10])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdmFyL3d3dy9pZGVhbGZvcm1zL2pzL2Vycm9ycy5qcyIsIi92YXIvd3d3L2lkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9hamF4L2FqYXguZXh0LmpzIiwiL3Zhci93d3cvaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvY3VzdG9tLWlucHV0cy5leHQuanMiLCIvdmFyL3d3dy9pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvY3VzdG9tLWlucHV0cy9pZGVhbGZpbGUuanMiLCIvdmFyL3d3dy9pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvY3VzdG9tLWlucHV0cy9pZGVhbHJhZGlvY2hlY2suanMiLCIvdmFyL3d3dy9pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmV4dC5qcyIsIi92YXIvd3d3L2lkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9keW5hbWljLWZpZWxkcy9keW5hbWljLWZpZWxkcy5leHQuanMiLCIvdmFyL3d3dy9pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvc3RlcHMvaWRlYWxzdGVwcy5qcyIsIi92YXIvd3d3L2lkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9zdGVwcy9zdGVwcy5leHQuanMiLCIvdmFyL3d3dy9pZGVhbGZvcm1zL2pzL21haW4uanMiLCIvdmFyL3d3dy9pZGVhbGZvcm1zL2pzL3BsdWdpbi5qcyIsIi92YXIvd3d3L2lkZWFsZm9ybXMvanMvcHJpdmF0ZS5qcyIsIi92YXIvd3d3L2lkZWFsZm9ybXMvanMvcHVibGljLmpzIiwiL3Zhci93d3cvaWRlYWxmb3Jtcy9qcy9ydWxlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRXJyb3JzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHJlcXVpcmVkOiAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCcsXG4gIGRpZ2l0czogJ011c3QgYmUgb25seSBkaWdpdHMnLFxuICBuYW1lOiAnTXVzdCBiZSBhdCBsZWFzdCAzIGNoYXJhY3RlcnMgbG9uZyBhbmQgbXVzdCBvbmx5IGNvbnRhaW4gbGV0dGVycycsXG4gIGVtYWlsOiAnTXVzdCBiZSBhIHZhbGlkIGVtYWlsJyxcbiAgdXNlcm5hbWU6ICdNdXN0IGJlIGF0IGJldHdlZW4gNCBhbmQgMzIgY2hhcmFjdGVycyBsb25nIGFuZCBzdGFydCB3aXRoIGEgbGV0dGVyLiBZb3UgbWF5IHVzZSBsZXR0ZXJzLCBudW1iZXJzLCB1bmRlcnNjb3JlcywgYW5kIG9uZSBkb3QnLFxuICBwYXNzOiAnTXVzdCBiZSBhdCBsZWFzdCA2IGNoYXJhY3RlcnMgbG9uZywgYW5kIGNvbnRhaW4gYXQgbGVhc3Qgb25lIG51bWJlciwgb25lIHVwcGVyY2FzZSBhbmQgb25lIGxvd2VyY2FzZSBsZXR0ZXInLFxuICBzdHJvbmdwYXNzOiAnTXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMgbG9uZyBhbmQgY29udGFpbiBhdCBsZWFzdCBvbmUgdXBwZXJjYXNlIGFuZCBvbmUgbG93ZXJjYXNlIGxldHRlciBhbmQgb25lIG51bWJlciBvciBzcGVjaWFsIGNoYXJhY3RlcicsXG4gIHBob25lOiAnTXVzdCBiZSBhIHZhbGlkIHBob25lIG51bWJlcicsXG4gIHppcDogJ011c3QgYmUgYSB2YWxpZCB6aXAgY29kZScsXG4gIHVybDogJ011c3QgYmUgYSB2YWxpZCBVUkwnLFxuICBudW1iZXI6ICdNdXN0IGJlIGEgbnVtYmVyJyxcbiAgcmFuZ2U6ICdNdXN0IGJlIGEgbnVtYmVyIGJldHdlZW4gezB9IGFuZCB7MX0nLFxuICBtaW46ICdNdXN0IGJlIGF0IGxlYXN0IHswfSBjaGFyYWN0ZXJzIGxvbmcnLFxuICBtYXg6ICdNdXN0IGJlIHVuZGVyIHswfSBjaGFyYWN0ZXJzJyxcbiAgbWlub3B0aW9uOiAnU2VsZWN0IGF0IGxlYXN0IHswfSBvcHRpb25zJyxcbiAgbWF4b3B0aW9uOiAnU2VsZWN0IG5vIG1vcmUgdGhhbiB7MH0gb3B0aW9ucycsXG4gIG1pbm1heDogJ011c3QgYmUgYmV0d2VlbiB7MH0gYW5kIHsxfSBjaGFyYWN0ZXJzIGxvbmcnLFxuICBzZWxlY3Q6ICdTZWxlY3QgYW4gb3B0aW9uJyxcbiAgZXh0ZW5zaW9uOiAnRmlsZShzKSBtdXN0IGhhdmUgYSB2YWxpZCBleHRlbnNpb24gKHsqfSknLFxuICBlcXVhbHRvOiAnTXVzdCBoYXZlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBcInswfVwiIGZpZWxkJyxcbiAgZGF0ZTogJ011c3QgYmUgYSB2YWxpZCBkYXRlIHswfSdcblxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdpZGVhbEFqYXgnLFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICQuZXh0ZW5kKCQuaWRlYWxmb3JtcywgeyBfcmVxdWVzdHM6IHt9IH0pO1xuXG4gICAgICAkLmV4dGVuZCgkLmlkZWFsZm9ybXMuZXJyb3JzLCB7XG4gICAgICAgIGFqYXg6ICdMb2FkaW5nLi4uJ1xuICAgICAgfSk7XG5cbiAgICAgICQuZXh0ZW5kKCQuaWRlYWxmb3Jtcy5ydWxlcywge1xuXG4gICAgICAgIGFqYXg6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAgICAgICAsIHVybCA9ICQoaW5wdXQpLmRhdGEoJ2lkZWFsZm9ybXMtYWpheCcpXG4gICAgICAgICAgICAsIHVzZXJFcnJvciA9ICQuaWRlYWxmb3Jtcy5fZ2V0S2V5KCdlcnJvcnMuJysgaW5wdXQubmFtZSArJy5hamF4RXJyb3InLCBzZWxmLm9wdHMpXG4gICAgICAgICAgICAsIHJlcXVlc3RzID0gJC5pZGVhbGZvcm1zLl9yZXF1ZXN0c1xuICAgICAgICAgICAgLCBkYXRhID0ge307XG5cbiAgICAgICAgICBkYXRhW2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XG5cbiAgICAgICAgICAkZmllbGQuYWRkQ2xhc3MoJ2FqYXgnKTtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0c1tpbnB1dC5uYW1lXSkgcmVxdWVzdHNbaW5wdXQubmFtZV0uYWJvcnQoKTtcblxuICAgICAgICAgIHJlcXVlc3RzW2lucHV0Lm5hbWVdID0gJC5wb3N0KHVybCwgZGF0YSwgZnVuY3Rpb24ocmVzcCkge1xuXG4gICAgICAgICAgICBpZiAocmVzcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcsIHRydWUpO1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCk7XG4gICAgICAgICAgICAgIHNlbGYuX2hhbmRsZVN0eWxlKGlucHV0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlbGYuX2hhbmRsZUVycm9yKGlucHV0LCB1c2VyRXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkZmllbGQucmVtb3ZlQ2xhc3MoJ2FqYXgnKTtcblxuICAgICAgICAgIH0sICdqc29uJyk7XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX3ZhbGlkYXRlOiBmdW5jdGlvbihpbnB1dCwgcnVsZSkge1xuICAgICAgaWYgKHJ1bGUgIT0gJ2FqYXgnICYmICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNbaW5wdXQubmFtZV0pIHtcbiAgICAgICAgJC5pZGVhbGZvcm1zLl9yZXF1ZXN0c1tpbnB1dC5uYW1lXS5hYm9ydCgpO1xuICAgICAgICB0aGlzLl9nZXRGaWVsZChpbnB1dCkucmVtb3ZlQ2xhc3MoJ2FqYXgnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxufTtcbiIsInJlcXVpcmUoJy4vaWRlYWxmaWxlJyk7XG5yZXF1aXJlKCcuL2lkZWFscmFkaW9jaGVjaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnY3VzdG9tSW5wdXRzJyxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGRDdXN0b21JbnB1dHMoKTtcbiAgICB9LFxuXG4gICAgYWRkRmllbGRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkQ3VzdG9tSW5wdXRzKCk7XG4gICAgfSxcblxuICAgIF9idWlsZEN1c3RvbUlucHV0czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJzpmaWxlJykuaWRlYWxmaWxlKCk7XG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJzpjaGVja2JveCwgOnJhZGlvJykuaWRlYWxyYWRpb2NoZWNrKCk7XG4gICAgfVxuXG4gIH1cbn07XG4iLCIvKipcbiAqIElkZWFsIEZpbGVcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICAvLyBCcm93c2VyIHN1cHBvcnRzIEhUTUw1IG11bHRpcGxlIGZpbGU/XG4gIHZhciBtdWx0aXBsZVN1cHBvcnQgPSB0eXBlb2YgJCgnPGlucHV0Lz4nKVswXS5tdWx0aXBsZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAsIGlzSUUgPSAvbXNpZS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICAsIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsZmlsZSc7XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSB7XG4gIFxuICAgICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciAkZmlsZSA9ICQodGhpcy5lbCkuYWRkQ2xhc3MoJ2lkZWFsLWZpbGUnKSAvLyB0aGUgb3JpZ2luYWwgZmlsZSBpbnB1dFxuICAgICAgICAgICwgJHdyYXAgPSAkKCc8ZGl2IGNsYXNzPVwiaWRlYWwtZmlsZS13cmFwXCI+JylcbiAgICAgICAgICAsICRpbnB1dCA9ICQoJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiaWRlYWwtZmlsZS1maWxlbmFtZVwiIC8+JylcbiAgICAgICAgICAgIC8vIEJ1dHRvbiB0aGF0IHdpbGwgYmUgdXNlZCBpbiBub24tSUUgYnJvd3NlcnNcbiAgICAgICAgICAsICRidXR0b24gPSAkKCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImlkZWFsLWZpbGUtdXBsb2FkXCI+T3BlbjwvYnV0dG9uPicpXG4gICAgICAgICAgICAvLyBIYWNrIGZvciBJRVxuICAgICAgICAgICwgJGxhYmVsID0gJCgnPGxhYmVsIGNsYXNzPVwiaWRlYWwtZmlsZS11cGxvYWRcIiBmb3I9XCInICsgJGZpbGVbMF0uaWQgKyAnXCI+T3BlbjwvbGFiZWw+Jyk7XG5cbiAgICAgICAgLy8gSGlkZSBieSBzaGlmdGluZyB0byB0aGUgbGVmdCBzbyB3ZVxuICAgICAgICAvLyBjYW4gc3RpbGwgdHJpZ2dlciBldmVudHNcbiAgICAgICAgJGZpbGUuY3NzKHtcbiAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICBsZWZ0OiAnLTk5OTlweCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHdyYXAuYXBwZW5kKCRpbnB1dCwgKGlzSUUgPyAkbGFiZWwgOiAkYnV0dG9uKSkuaW5zZXJ0QWZ0ZXIoJGZpbGUpO1xuXG4gICAgICAgIC8vIFByZXZlbnQgZm9jdXNcbiAgICAgICAgJGZpbGUuYXR0cigndGFiSW5kZXgnLCAtMSk7XG4gICAgICAgICRidXR0b24uYXR0cigndGFiSW5kZXgnLCAtMSk7XG5cbiAgICAgICAgJGJ1dHRvbi5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGZpbGUuZm9jdXMoKS5jbGljaygpOyAvLyBPcGVuIGRpYWxvZ1xuICAgICAgICB9KTtcblxuICAgICAgICAkZmlsZS5jaGFuZ2UoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgdmFyIGZpbGVzID0gW11cbiAgICAgICAgICAgICwgZmlsZUFyciwgZmlsZW5hbWU7XG5cbiAgICAgICAgICAgIC8vIElmIG11bHRpcGxlIGlzIHN1cHBvcnRlZCB0aGVuIGV4dHJhY3RcbiAgICAgICAgICAgIC8vIGFsbCBmaWxlbmFtZXMgZnJvbSB0aGUgZmlsZSBhcnJheVxuICAgICAgICAgIGlmIChtdWx0aXBsZVN1cHBvcnQpIHtcbiAgICAgICAgICAgIGZpbGVBcnIgPSAkZmlsZVswXS5maWxlcztcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBmaWxlQXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZUFycltpXS5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbGVuYW1lID0gZmlsZXMuam9pbignLCAnKTtcblxuICAgICAgICAgICAgLy8gSWYgbm90IHN1cHBvcnRlZCB0aGVuIGp1c3QgdGFrZSB0aGUgdmFsdWVcbiAgICAgICAgICAgIC8vIGFuZCByZW1vdmUgdGhlIHBhdGggdG8ganVzdCBzaG93IHRoZSBmaWxlbmFtZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWxlbmFtZSA9ICRmaWxlLnZhbCgpLnNwbGl0KCdcXFxcJykucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJGlucHV0IC52YWwoZmlsZW5hbWUpLmF0dHIoJ3RpdGxlJywgZmlsZW5hbWUpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgICRpbnB1dC5vbih7XG4gICAgICAgICAgYmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJGZpbGUudHJpZ2dlcignYmx1cicpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAga2V5ZG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxMykgeyAvLyBFbnRlclxuICAgICAgICAgICAgICBpZiAoIWlzSUUpICRmaWxlLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLm9uZSgna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMTMpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDggfHwgZS53aGljaCA9PT0gNDYpIHsgLy8gQmFja3NwYWNlICYgRGVsXG4gICAgICAgICAgICAgIC8vIEluIElFIHRoZSB2YWx1ZSBpcyByZWFkLW9ubHlcbiAgICAgICAgICAgICAgLy8gd2l0aCB0aGlzIHRyaWNrIHdlIHJlbW92ZSB0aGUgb2xkIGlucHV0IGFuZCBhZGRcbiAgICAgICAgICAgICAgLy8gYSBjbGVhbiBjbG9uZSB3aXRoIGFsbCB0aGUgb3JpZ2luYWwgZXZlbnRzIGF0dGFjaGVkXG4gICAgICAgICAgICAgIGlmIChpc0lFKSAkZmlsZS5yZXBsYWNlV2l0aCgkZmlsZSA9ICRmaWxlLmNsb25lKHRydWUpKTtcbiAgICAgICAgICAgICAgJGZpbGUudmFsKCcnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgICAgJGlucHV0LnZhbCgnJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDkpIHsgLy8gVEFCXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIEFsbCBvdGhlciBrZXlzXG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gIFxuICB9O1xuXG4gIHJlcXVpcmUoJy4uLy4uL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iLCIvKlxuICogaWRlYWxSYWRpb0NoZWNrOiBqUXVlcnkgcGxndWluIGZvciBjaGVja2JveCBhbmQgcmFkaW8gcmVwbGFjZW1lbnRcbiAqIFVzYWdlOiAkKCdpbnB1dFt0eXBlPWNoZWNrYm94XSwgaW5wdXRbdHlwZT1yYWRpb10nKS5pZGVhbFJhZGlvQ2hlY2soKVxuICovXG4oZnVuY3Rpb24oJCwgd2luLCBkb2MsIHVuZGVmaW5lZCkge1xuXG4gIHZhciBwbHVnaW4gPSB7fTtcblxuICBwbHVnaW4ubmFtZSA9ICdpZGVhbHJhZGlvY2hlY2snO1xuXG4gIHBsdWdpbi5tZXRob2RzID0ge1xuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgJGlucHV0ID0gJCh0aGlzLmVsKTtcbiAgICAgIHZhciAkc3BhbiA9ICQoJzxzcGFuLz4nKTtcblxuICAgICAgJHNwYW4uYWRkQ2xhc3MoJ2lkZWFsLScrICgkaW5wdXQuaXMoJzpjaGVja2JveCcpID8gJ2NoZWNrJyA6ICdyYWRpbycpKTtcbiAgICAgICRpbnB1dC5pcygnOmNoZWNrZWQnKSAmJiAkc3Bhbi5hZGRDbGFzcygnY2hlY2tlZCcpOyAvLyBpbml0XG4gICAgICAkc3Bhbi5pbnNlcnRBZnRlcigkaW5wdXQpO1xuXG4gICAgICAkaW5wdXQucGFyZW50KCdsYWJlbCcpXG4gICAgICAgIC5hZGRDbGFzcygnaWRlYWwtcmFkaW9jaGVjay1sYWJlbCcpXG4gICAgICAgIC5hdHRyKCdvbmNsaWNrJywgJycpOyAvLyBGaXggY2xpY2tpbmcgbGFiZWwgaW4gaU9TXG5cbiAgICAgICRpbnB1dC5jc3MoeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgbGVmdDogJy05OTk5cHgnIH0pOyAvLyBoaWRlIGJ5IHNoaWZ0aW5nIGxlZnRcblxuICAgICAgLy8gRXZlbnRzXG4gICAgICAkaW5wdXQub24oe1xuICAgICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkaW5wdXQgPSAkKHRoaXMpO1xuICAgICAgICAgIGlmICggJGlucHV0LmlzKCdpbnB1dFt0eXBlPVwicmFkaW9cIl0nKSApIHtcbiAgICAgICAgICAgICRpbnB1dC5wYXJlbnQoKS5zaWJsaW5ncygnbGFiZWwnKS5maW5kKCcuaWRlYWwtcmFkaW8nKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkc3Bhbi50b2dnbGVDbGFzcygnY2hlY2tlZCcsICRpbnB1dC5pcygnOmNoZWNrZWQnKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbigpIHsgJHNwYW4uYWRkQ2xhc3MoJ2ZvY3VzJykgfSxcbiAgICAgICAgYmx1cjogZnVuY3Rpb24oKSB7ICRzcGFuLnJlbW92ZUNsYXNzKCdmb2N1cycpIH0sXG4gICAgICAgIGNsaWNrOiBmdW5jdGlvbigpIHsgJCh0aGlzKS50cmlnZ2VyKCdmb2N1cycpIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIHJlcXVpcmUoJy4uLy4uL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdkYXRlcGlja2VyJyxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGREYXRlcGlja2VyKCk7XG4gICAgfSxcblxuICAgX2J1aWxkRGF0ZXBpY2tlcjogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciAkZGF0ZXBpY2tlciA9IHRoaXMuJGZvcm0uZmluZCgnaW5wdXQuZGF0ZXBpY2tlcicpO1xuXG4gICAgICAvLyBBbHdheXMgc2hvdyBkYXRlcGlja2VyIGJlbG93IHRoZSBpbnB1dFxuICAgICAgaWYgKGpRdWVyeS51aSkge1xuICAgICAgICAkLmRhdGVwaWNrZXIuX2NoZWNrT2Zmc2V0ID0gZnVuY3Rpb24oYSxiLGMpeyByZXR1cm4gYiB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoalF1ZXJ5LnVpICYmICRkYXRlcGlja2VyLmxlbmd0aCkge1xuXG4gICAgICAgICRkYXRlcGlja2VyLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIoe1xuICAgICAgICAgICAgYmVmb3JlU2hvdzogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgICAgICAgJChpbnB1dCkuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNoYW5nZU1vbnRoWWVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIC8vIEhhY2sgdG8gZml4IElFOSBub3QgcmVzaXppbmdcbiAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgICAgICAgICAgICwgd2lkdGggPSAkdGhpcy5vdXRlcldpZHRoKCk7IC8vIGNhY2hlIGZpcnN0IVxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICR0aGlzLmRhdGVwaWNrZXIoJ3dpZGdldCcpLmNzcygnd2lkdGgnLCB3aWR0aCk7XG4gICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkanVzdCB3aWR0aFxuICAgICAgICAkZGF0ZXBpY2tlci5vbignZm9jdXMga2V5dXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgdCA9ICQodGhpcyksIHcgPSB0Lm91dGVyV2lkdGgoKTtcbiAgICAgICAgICB0LmRhdGVwaWNrZXIoJ3dpZGdldCcpLmNzcygnd2lkdGgnLCB3KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbn07XG4iLCJmdW5jdGlvbiB0ZW1wbGF0ZShodG1sLCBkYXRhKSB7XG5cbiAgdmFyIGxvb3AgPSAvXFx7QChbXn1dKylcXH0oLis/KVxce1xcL1xcMVxcfS9nXG4gICAgLCBsb29wVmFyaWFibGUgPSAvXFx7IyhbXn1dKylcXH0vZ1xuICAgICwgdmFyaWFibGUgPSAvXFx7KFtefV0rKVxcfS9nO1xuXG4gIHJldHVybiBodG1sXG4gICAgLnJlcGxhY2UobG9vcCwgZnVuY3Rpb24oXywga2V5LCBsaXN0KSB7XG4gICAgICByZXR1cm4gJC5tYXAoZGF0YVtrZXldLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBsaXN0LnJlcGxhY2UobG9vcFZhcmlhYmxlLCBmdW5jdGlvbihfLCBrKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW1ba107XG4gICAgICAgIH0pO1xuICAgICAgfSkuam9pbignJyk7XG4gICAgfSlcbiAgICAucmVwbGFjZSh2YXJpYWJsZSwgZnVuY3Rpb24oXywga2V5KSB7XG4gICAgICByZXR1cm4gZGF0YVtrZXldIHx8ICcnO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnZHluYW1pY0ZpZWxkcycsXG5cbiAgb3B0aW9uczoge1xuXG4gICAgdGVtcGxhdGVzOiB7XG5cbiAgICAgIGJhc2U6J1xcXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZFwiIHtjbGFzc30+XFxcbiAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJtYWluXCI+e2xhYmVsfTwvbGFiZWw+XFxcbiAgICAgICAgICB7ZmllbGR9XFxcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImVycm9yXCI+PC9zcGFuPlxcXG4gICAgICAgIDwvZGl2PlxcXG4gICAgICAnLFxuXG4gICAgICB0ZXh0OiAnPGlucHV0IG5hbWU9XCJ7bmFtZX1cIiB0eXBlPVwie3N1YnR5cGV9XCIgdmFsdWU9XCJ7dmFsdWV9XCIge2F0dHJzfT4nLFxuXG4gICAgICBmaWxlOiAnPGlucHV0IGlkPVwie25hbWV9IFwibmFtZT1cIntuYW1lfVwiIHR5cGU9XCJmaWxlXCIge2F0dHJzfT4nLFxuXG4gICAgICB0ZXh0YXJlYTogJzx0ZXh0YXJlYSBuYW1lPVwie25hbWV9XCIge2F0dHJzfT57dGV4dH08L3RleHRhcmVhPicsXG5cbiAgICAgIGdyb3VwOiAnXFxcbiAgICAgICAgPHAgY2xhc3M9XCJncm91cFwiPlxcXG4gICAgICAgICAge0BsaXN0fVxcXG4gICAgICAgICAgPGxhYmVsPjxpbnB1dCBuYW1lPVwie25hbWV9XCIgdHlwZT1cIntzdWJ0eXBlfVwiIHZhbHVlPVwieyN2YWx1ZX1cIiB7I2F0dHJzfT57I3RleHR9PC9sYWJlbD5cXFxuICAgICAgICAgIHsvbGlzdH1cXFxuICAgICAgICA8L3A+XFxcbiAgICAgICcsXG5cbiAgICAgIHNlbGVjdDogJ1xcXG4gICAgICAgIDxzZWxlY3QgbmFtZT17bmFtZX0+XFxcbiAgICAgICAgICB7QGxpc3R9XFxcbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwieyN2YWx1ZX1cIj57I3RleHR9PC9vcHRpb24+XFxcbiAgICAgICAgICB7L2xpc3R9XFxcbiAgICAgICAgPC9zZWxlY3Q+XFxcbiAgICAgICdcbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgYWRkRmllbGRzOiBmdW5jdGlvbihmaWVsZHMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2goZmllbGRzLCBmdW5jdGlvbihuYW1lLCBmaWVsZCkge1xuXG4gICAgICAgIHZhciB0eXBlQXJyYXkgPSBmaWVsZC50eXBlLnNwbGl0KCc6JylcbiAgICAgICAgICAsIHJ1bGVzID0ge307XG5cbiAgICAgICAgZmllbGQubmFtZSA9IG5hbWU7XG4gICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlQXJyYXlbMF07XG4gICAgICAgIGlmICh0eXBlQXJyYXlbMV0pIGZpZWxkLnN1YnR5cGUgPSB0eXBlQXJyYXlbMV07XG5cbiAgICAgICAgdmFyIGh0bWwgPSB0ZW1wbGF0ZShzZWxmLm9wdHMudGVtcGxhdGVzLmJhc2UsIHtcbiAgICAgICAgICBsYWJlbDogZmllbGQubGFiZWwsXG4gICAgICAgICAgZmllbGQ6IHRlbXBsYXRlKHNlbGYub3B0cy50ZW1wbGF0ZXNbZmllbGQudHlwZV0sIGZpZWxkKVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZmllbGQuYWZ0ZXIgfHwgZmllbGQuYmVmb3JlKSB7XG4gICAgICAgICAgc2VsZi4kZm9ybS5maW5kKCdbbmFtZT0nKyAoZmllbGQuYWZ0ZXIgfHwgZmllbGQuYmVmb3JlKSArJ10nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fZ2V0RmllbGQodGhpcylbZmllbGQuYWZ0ZXIgPyAnYWZ0ZXInIDogJ2JlZm9yZSddKGh0bWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuJGZvcm0uZmluZChzZWxmLm9wdHMuZmllbGQpLmxhc3QoKS5hZnRlcihodG1sKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZC5ydWxlcykge1xuICAgICAgICAgIHJ1bGVzW25hbWVdID0gZmllbGQucnVsZXM7XG4gICAgICAgICAgc2VsZi5hZGRSdWxlcyhydWxlcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9pbmplY3QoJ2FkZEZpZWxkcycpO1xuICAgIH0sXG5cbiAgICByZW1vdmVGaWVsZHM6IGZ1bmN0aW9uKG5hbWVzKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKG5hbWVzLnNwbGl0KCcgJyksIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgICAgdmFyICRmaWVsZCA9IHNlbGYuX2dldEZpZWxkKCQoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpKTtcbiAgICAgICAgc2VsZi4kZmllbGRzID0gc2VsZi4kZmllbGRzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gISAkKHRoaXMpLmlzKCRmaWVsZCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkZmllbGQucmVtb3ZlKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5faW5qZWN0KCdyZW1vdmVGaWVsZHMnKTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlRmllbGRzOiBmdW5jdGlvbihuYW1lcykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChuYW1lcy5zcGxpdCgnICcpLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAgIHZhciAkZmllbGQgPSBzZWxmLl9nZXRGaWVsZCgkKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKSk7XG4gICAgICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJywgJGZpZWxkLmlzKCc6dmlzaWJsZScpKS50b2dnbGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9pbmplY3QoJ3RvZ2dsZUZpZWxkcycpO1xuICAgIH1cblxuICB9XG59O1xuIiwiLyohXG4gKiBJZGVhbCBTdGVwc1xuKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsc3RlcHMnO1xuXG4gIHBsdWdpbi5kZWZhdWx0cyA9IHtcbiAgICBuYXY6ICcuaWRlYWxzdGVwcy1uYXYnLFxuICAgIG5hdkl0ZW1zOiAnbGknLFxuICAgIGJ1aWxkTmF2SXRlbXM6IHRydWUsXG4gICAgd3JhcDogJy5pZGVhbHN0ZXBzLXdyYXAnLFxuICAgIHN0ZXA6ICcuaWRlYWxzdGVwcy1zdGVwJyxcbiAgICBhY3RpdmVDbGFzczogJ2lkZWFsc3RlcHMtc3RlcC1hY3RpdmUnLFxuICAgIGJlZm9yZTogbnVsbCxcbiAgICBhZnRlcjogbnVsbCxcbiAgICBmYWRlU3BlZWQ6IDBcbiAgfTtcblxuICBwbHVnaW4ubWV0aG9kcyA9IHtcblxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIGFjdGl2ZSA9IHRoaXMub3B0cy5hY3RpdmVDbGFzcztcblxuICAgICAgdGhpcy4kZWwgPSAkKHRoaXMuZWwpO1xuXG4gICAgICB0aGlzLiRuYXYgPSB0aGlzLiRlbC5maW5kKHRoaXMub3B0cy5uYXYpO1xuICAgICAgdGhpcy4kbmF2SXRlbXMgPSB0aGlzLiRuYXYuZmluZCh0aGlzLm9wdHMubmF2SXRlbXMpO1xuXG4gICAgICB0aGlzLiR3cmFwID0gdGhpcy4kZWwuZmluZCh0aGlzLm9wdHMud3JhcCk7XG4gICAgICB0aGlzLiRzdGVwcyA9IHRoaXMuJHdyYXAuZmluZCh0aGlzLm9wdHMuc3RlcCk7XG5cbiAgICAgIGlmICh0aGlzLm9wdHMuYnVpbGROYXZJdGVtcykgdGhpcy5fYnVpbGROYXZJdGVtcygpO1xuXG4gICAgICB0aGlzLiRzdGVwcy5oaWRlKCkuZmlyc3QoKS5zaG93KCk7XG4gICAgICB0aGlzLiRuYXZJdGVtcy5yZW1vdmVDbGFzcyhhY3RpdmUpLmZpcnN0KCkuYWRkQ2xhc3MoYWN0aXZlKTtcblxuICAgICAgdGhpcy4kbmF2SXRlbXMuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZ28oc2VsZi4kbmF2SXRlbXMuaW5kZXgodGhpcykpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9idWlsZE5hdkl0ZW1zOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIGlzQ3VzdG9tID0gdHlwZW9mIHRoaXMub3B0cy5idWlsZE5hdkl0ZW1zID09ICdmdW5jdGlvbicsXG4gICAgICAgICAgaXRlbSA9IGZ1bmN0aW9uKHZhbCl7IHJldHVybiAnPGxpPjxhIGhyZWY9XCIjXCIgdGFiaW5kZXg9XCItMVwiPicrIHZhbCArJzwvYT48L2xpPic7IH0sXG4gICAgICAgICAgaXRlbXM7XG5cbiAgICAgIGl0ZW1zID0gaXNDdXN0b20gP1xuICAgICAgICB0aGlzLiRzdGVwcy5tYXAoZnVuY3Rpb24oaSl7IHJldHVybiBpdGVtKHNlbGYub3B0cy5idWlsZE5hdkl0ZW1zLmNhbGwoc2VsZiwgaSkpIH0pLmdldCgpIDpcbiAgICAgICAgdGhpcy4kc3RlcHMubWFwKGZ1bmN0aW9uKGkpeyByZXR1cm4gaXRlbSgrK2kpOyB9KS5nZXQoKTtcblxuICAgICAgdGhpcy4kbmF2SXRlbXMgPSAkKGl0ZW1zLmpvaW4oJycpKTtcblxuICAgICAgdGhpcy4kbmF2LmFwcGVuZCgkKCc8dWwvPicpLmFwcGVuZCh0aGlzLiRuYXZJdGVtcykpO1xuICAgIH0sXG5cbiAgICBfZ2V0Q3VySWR4OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLiRzdGVwcy5pbmRleCh0aGlzLiRzdGVwcy5maWx0ZXIoJzp2aXNpYmxlJykpO1xuICAgIH0sXG5cbiAgICBnbzogZnVuY3Rpb24oaWR4KSB7XG5cbiAgICAgIHZhciBhY3RpdmUgPSB0aGlzLm9wdHMuYWN0aXZlQ2xhc3MsXG4gICAgICAgICAgZmFkZVNwZWVkID0gdGhpcy5vcHRzLmZhZGVTcGVlZDtcblxuICAgICAgaWYgKHR5cGVvZiBpZHggPT0gJ2Z1bmN0aW9uJykgaWR4ID0gaWR4LmNhbGwodGhpcywgdGhpcy5fZ2V0Q3VySWR4KCkpO1xuXG4gICAgICBpZiAoaWR4ID49IHRoaXMuJHN0ZXBzLmxlbmd0aCkgaWR4ID0gMDtcbiAgICAgIGlmIChpZHggPCAwKSBpZHggPSB0aGlzLiRzdGVwcy5sZW5ndGgtMTtcblxuICAgICAgaWYgKHRoaXMub3B0cy5iZWZvcmUpIHRoaXMub3B0cy5iZWZvcmUuY2FsbCh0aGlzLCBpZHgpO1xuXG4gICAgICB0aGlzLiRuYXZJdGVtcy5yZW1vdmVDbGFzcyhhY3RpdmUpLmVxKGlkeCkuYWRkQ2xhc3MoYWN0aXZlKTtcbiAgICAgIHRoaXMuJHN0ZXBzLmZhZGVPdXQoZmFkZVNwZWVkKS5lcShpZHgpLmZhZGVJbihmYWRlU3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5vcHRzLmFmdGVyKSB0aGlzLm9wdHMuYWZ0ZXIuY2FsbCh0aGlzLCBpZHgpO1xuICAgIH0sXG5cbiAgICBwcmV2OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28odGhpcy5fZ2V0Q3VySWR4KCkgLSAxKTtcbiAgICB9LFxuXG4gICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKHRoaXMuX2dldEN1cklkeCgpICsgMSk7XG4gICAgfSxcblxuICAgIGZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28oMCk7XG4gICAgfSxcblxuICAgIGxhc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbyh0aGlzLiRzdGVwcy5sZW5ndGgtMSk7XG4gICAgfVxuICB9O1xuXG4gIHJlcXVpcmUoJy4uLy4uL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iLCJyZXF1aXJlKCcuL2lkZWFsc3RlcHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ3N0ZXBzJyxcblxuICBvcHRpb25zOiB7XG4gICAgc3RlcHNDb250YWluZXI6ICcuaWRlYWxzdGVwcy1jb250YWluZXInLFxuICAgIHN0ZXBzT3B0aW9uczoge31cbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGRTdGVwcygpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX3ZhbGlkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuXG4gICAgICBpZiAoJC5pZGVhbGZvcm1zLmhhc0V4dGVuc2lvbignaWRlYWxBamF4JykpIHtcbiAgICAgICAgJC5lYWNoKCQuaWRlYWxmb3Jtcy5fcmVxdWVzdHMsIGZ1bmN0aW9uKGtleSwgcmVxdWVzdCkge1xuICAgICAgICAgIHJlcXVlc3QuZG9uZShmdW5jdGlvbigpeyBzZWxmLl91cGRhdGVTdGVwcygpIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIGZvY3VzRmlyc3RJbnZhbGlkOiBmdW5jdGlvbihmaXJzdEludmFsaWQpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdnbycsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kc3RlcHMuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkKHRoaXMpLmZpbmQoZmlyc3RJbnZhbGlkKS5sZW5ndGg7XG4gICAgICAgIH0pLmluZGV4KCk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2J1aWxkU3RlcHM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIG9wdGlvbnNcbiAgICAgICAgLCBoYXNSdWxlcyA9ICEgJC5pc0VtcHR5T2JqZWN0KHRoaXMub3B0cy5ydWxlcylcbiAgICAgICAgLCBjb3VudGVyID0gaGFzUnVsZXNcbiAgICAgICAgICA/ICc8c3BhbiBjbGFzcz1cImNvdW50ZXJcIi8+J1xuICAgICAgICAgIDogJzxzcGFuIGNsYXNzPVwiY291bnRlciB6ZXJvXCI+MDwvc3Bhbj4nO1xuXG4gICAgICBvcHRpb25zID0gJC5leHRlbmQoe30sIHtcbiAgICAgICAgYnVpbGROYXZJdGVtczogZnVuY3Rpb24oaSl7IHJldHVybiAnU3RlcCAnKyAoaSsxKSArIGNvdW50ZXIgfVxuICAgICAgfSwgdGhpcy5vcHRzLnN0ZXBzT3B0aW9ucyk7XG5cbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyID0gdGhpcy4kZm9ybS5jbG9zZXN0KHRoaXMub3B0cy5zdGVwc0NvbnRhaW5lcikuaWRlYWxzdGVwcyhvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgX3VwZGF0ZVN0ZXBzOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdfaW5qZWN0JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGlkZWFsc3RlcHMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJG5hdkl0ZW1zLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHZhciBpbnZhbGlkID0gaWRlYWxzdGVwcy4kc3RlcHMuZXEoaSkuZmluZChzZWxmLmdldEludmFsaWQoKSkubGVuZ3RoO1xuICAgICAgICAgICQodGhpcykuZmluZCgnc3BhbicpLnRleHQoaW52YWxpZCkudG9nZ2xlQ2xhc3MoJ3plcm8nLCAhIGludmFsaWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgYWRkUnVsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5maXJzdFN0ZXAoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIHRvZ2dsZUZpZWxkczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgcmVtb3ZlRmllbGRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0ZXBzKCk7XG4gICAgfSxcblxuICAgIGdvVG9TdGVwOiBmdW5jdGlvbihpZHgpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ2dvJywgaWR4KTtcbiAgICB9LFxuXG4gICAgcHJldlN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygncHJldicpO1xuICAgIH0sXG5cbiAgICBuZXh0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCduZXh0Jyk7XG4gICAgfSxcblxuICAgIGZpcnN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdmaXJzdCcpO1xuICAgIH0sXG5cbiAgICBsYXN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdsYXN0Jyk7XG4gICAgfVxuICB9XG5cbn07XG4iLCIvKiFcbiAqIGpRdWVyeSBJZGVhbCBGb3Jtc1xuICogQGF1dGhvcjogQ2VkcmljIFJ1aXpcbiAqIEB2ZXJzaW9uOiAzLjBcbiAqIEBsaWNlbnNlIEdQTCBvciBNSVRcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICB2YXIgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxmb3Jtcyc7XG5cbiAgcGx1Z2luLmRlZmF1bHRzID0ge1xuICAgIGZpZWxkOiAnLmZpZWxkJyxcbiAgICBlcnJvcjogJy5lcnJvcicsXG4gICAgaWNvbkh0bWw6ICc8aS8+JyxcbiAgICBpY29uQ2xhc3M6ICdpY29uJyxcbiAgICBpbnZhbGlkQ2xhc3M6ICdpbnZhbGlkJyxcbiAgICB2YWxpZENsYXNzOiAndmFsaWQnLFxuICAgIHNpbGVudExvYWQ6IHRydWUsXG4gICAgb25WYWxpZGF0ZTogJC5ub29wLFxuICAgIG9uU3VibWl0OiAkLm5vb3BcbiAgfTtcblxuICBwbHVnaW4uZ2xvYmFsID0ge1xuXG4gICAgX2Zvcm1hdDogZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFx7KFxcZClcXH0vZywgZnVuY3Rpb24oXywgbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3NbK21hdGNoXSB8fCAnJztcbiAgICAgIH0pLnJlcGxhY2UoL1xce1xcKihbXip9XSopXFx9L2csIGZ1bmN0aW9uKF8sIHNlcCkge1xuICAgICAgICByZXR1cm4gYXJncy5qb2luKHNlcCB8fCAnLCAnKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfZ2V0S2V5OiBmdW5jdGlvbihrZXksIG9iaikge1xuICAgICAgcmV0dXJuIGtleS5zcGxpdCgnLicpLnJlZHVjZShmdW5jdGlvbihhLGIpIHtcbiAgICAgICAgcmV0dXJuIGEgJiYgYVtiXTtcbiAgICAgIH0sIG9iaik7XG4gICAgfSxcblxuICAgIHJ1bGVTZXBhcmF0b3I6ICcgJyxcbiAgICBhcmdTZXBhcmF0b3I6ICc6JyxcblxuICAgIHJ1bGVzOiByZXF1aXJlKCcuL3J1bGVzJyksXG4gICAgZXJyb3JzOiByZXF1aXJlKCcuL2Vycm9ycycpLFxuXG4gICAgZXh0ZW5zaW9uczogW1xuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2R5bmFtaWMtZmllbGRzL2R5bmFtaWMtZmllbGRzLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2FqYXgvYWpheC5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9zdGVwcy9zdGVwcy5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2N1c3RvbS1pbnB1dHMuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmV4dCcpXG4gICAgXVxuICB9O1xuXG4gIHBsdWdpbi5tZXRob2RzID0gJC5leHRlbmQoe30sIHJlcXVpcmUoJy4vcHJpdmF0ZScpLCByZXF1aXJlKCcuL3B1YmxpYycpKTtcblxuICByZXF1aXJlKCcuL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iLCIvKipcbiAqIFBsdWdpbiBib2lsZXJwbGF0ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgQVAgPSBBcnJheS5wcm90b3R5cGU7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHBsdWdpbikge1xuXG4gICAgJC5leHRlbmQoe1xuICAgICAgbmFtZTogJ3BsdWdpbicsXG4gICAgICBkZWZhdWx0czoge30sXG4gICAgICBtZXRob2RzOiB7fSxcbiAgICAgIGdsb2JhbDoge30sXG4gICAgfSwgcGx1Z2luKTtcblxuICAgICRbcGx1Z2luLm5hbWVdID0gJC5leHRlbmQoe1xuXG4gICAgICBhZGRFeHRlbnNpb246IGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuICAgICAgICBwbHVnaW4uZ2xvYmFsLmV4dGVuc2lvbnMucHVzaChleHRlbnNpb24pO1xuICAgICAgfSxcblxuICAgICAgaGFzRXh0ZW5zaW9uOiBmdW5jdGlvbihleHRlbnNpb24pIHtcbiAgICAgICAgcmV0dXJuIHBsdWdpbi5nbG9iYWwuZXh0ZW5zaW9ucy5maWx0ZXIoZnVuY3Rpb24oZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIGV4dC5uYW1lID09IGV4dGVuc2lvbjtcbiAgICAgICAgfSkubGVuZ3RoO1xuICAgICAgfVxuICAgIH0sIHBsdWdpbi5nbG9iYWwpO1xuXG4gICAgZnVuY3Rpb24gUGx1Z2luKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQoe30sIHBsdWdpbi5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICB0aGlzLmVsID0gZWxlbWVudDtcblxuICAgICAgdGhpcy5fbmFtZSA9IHBsdWdpbi5uYW1lO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgfVxuXG4gICAgUGx1Z2luLl9leHRlbmRlZCA9IHt9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5fZXh0ZW5kID0gZnVuY3Rpb24oZXh0ZW5zaW9ucykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgLCBkaXNhYmxlZCA9IHNlbGYub3B0cy5kaXNhYmxlZEV4dGVuc2lvbnMgfHwgJ25vbmUnO1xuXG4gICAgICAkLmVhY2goZXh0ZW5zaW9ucywgZnVuY3Rpb24oaSwgZXh0ZW5zaW9uKSB7XG5cbiAgICAgICAgJC5leHRlbmQoc2VsZi5vcHRzLCAkLmV4dGVuZCh0cnVlLCBleHRlbnNpb24ub3B0aW9ucywgc2VsZi5vcHRzKSk7XG5cbiAgICAgICAgJC5lYWNoKGV4dGVuc2lvbi5tZXRob2RzLCBmdW5jdGlvbihtZXRob2QsIGZuKSB7XG5cbiAgICAgICAgICBpZiAoZGlzYWJsZWQuaW5kZXhPZihleHRlbnNpb24ubmFtZSkgPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChQbHVnaW4ucHJvdG90eXBlW21ldGhvZF0pIHtcbiAgICAgICAgICAgIFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSA9IFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSB8fCBbXTtcbiAgICAgICAgICAgIFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXS5wdXNoKHsgbmFtZTogZXh0ZW5zaW9uLm5hbWUsIGZuOiBmbiB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUGx1Z2luLnByb3RvdHlwZVttZXRob2RdID0gZm47XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2luamVjdCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuXG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG1ldGhvZC5jYWxsKHRoaXMpO1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0pIHtcbiAgICAgICAgJC5lYWNoKFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSwgZnVuY3Rpb24oaSwgcGx1Z2luKSB7XG4gICAgICAgICAgcGx1Z2luLmZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5faW5pdCA9ICQubm9vcDtcblxuICAgIFBsdWdpbi5wcm90b3R5cGVbcGx1Z2luLm5hbWVdID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuIHRoaXM7XG4gICAgICB0cnkgeyByZXR1cm4gdGhpc1ttZXRob2RdLmFwcGx5KHRoaXMsIEFQLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7IH1cbiAgICAgIGNhdGNoKGUpIHt9XG4gICAgfTtcblxuICAgICQuZXh0ZW5kKFBsdWdpbi5wcm90b3R5cGUsIHBsdWdpbi5tZXRob2RzKTtcblxuICAgICQuZm5bcGx1Z2luLm5hbWVdID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBhcmdzID0gQVAuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgICAgICwgbWV0aG9kQXJyYXkgPSB0eXBlb2YgYXJnc1swXSA9PSAnc3RyaW5nJyAmJiBhcmdzWzBdLnNwbGl0KCc6JylcbiAgICAgICAgLCBtZXRob2QgPSBtZXRob2RBcnJheVttZXRob2RBcnJheS5sZW5ndGggPiAxID8gMSA6IDBdXG4gICAgICAgICwgcHJlZml4ID0gbWV0aG9kQXJyYXkubGVuZ3RoID4gMSAmJiBtZXRob2RBcnJheVswXVxuICAgICAgICAsIG9wdHMgPSB0eXBlb2YgYXJnc1swXSA9PSAnb2JqZWN0JyAmJiBhcmdzWzBdXG4gICAgICAgICwgcGFyYW1zID0gYXJncy5zbGljZSgxKVxuICAgICAgICAsIHJldDtcblxuICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICBtZXRob2QgPSBwcmVmaXggKyBtZXRob2Quc3Vic3RyKDAsMSkudG9VcHBlckNhc2UoKSArIG1ldGhvZC5zdWJzdHIoMSxtZXRob2QubGVuZ3RoLTEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlID0gJC5kYXRhKHRoaXMsIHBsdWdpbi5uYW1lKTtcblxuICAgICAgICAvLyBNZXRob2RcbiAgICAgICAgaWYgKGluc3RhbmNlKSB7XG4gICAgICAgICAgcmV0dXJuIHJldCA9IGluc3RhbmNlW3BsdWdpbi5uYW1lXS5hcHBseShpbnN0YW5jZSwgW21ldGhvZF0uY29uY2F0KHBhcmFtcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5pdFxuICAgICAgICByZXR1cm4gJC5kYXRhKHRoaXMsIHBsdWdpbi5uYW1lLCBuZXcgUGx1Z2luKHRoaXMsIG9wdHMpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcHJlZml4ID8gcmV0IDogdGhpcztcbiAgICB9O1xuICB9O1xuXG59KCkpO1xuIiwiLyoqXG4gKiBQcml2YXRlIG1ldGhvZHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fZXh0ZW5kKCQuaWRlYWxmb3Jtcy5leHRlbnNpb25zKTtcblxuICAgIHRoaXMuJGZvcm0gPSAkKHRoaXMuZWwpO1xuICAgIHRoaXMuJGZpZWxkcyA9ICQoKTtcbiAgICB0aGlzLiRpbnB1dHMgPSAkKCk7XG5cbiAgICB0aGlzLiRmb3JtLnN1Ym1pdChmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZWxmLmZvY3VzRmlyc3RJbnZhbGlkKCk7XG4gICAgICBzZWxmLm9wdHMub25TdWJtaXQuY2FsbCh0aGlzLCBzZWxmLmdldEludmFsaWQoKS5sZW5ndGgsIGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5faW5qZWN0KCdfaW5pdCcpO1xuXG4gICAgdGhpcy5hZGRSdWxlcyh0aGlzLm9wdHMucnVsZXMgfHwge30pO1xuXG4gICAgaWYgKCEgdGhpcy5vcHRzLnNpbGVudExvYWQpIHRoaXMuZm9jdXNGaXJzdEludmFsaWQoKTtcbiAgfSxcblxuICBfYnVpbGRGaWVsZDogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgICwgJGljb247XG5cbiAgICAkaWNvbiA9ICQodGhpcy5vcHRzLmljb25IdG1sLCB7XG4gICAgICBjbGFzczogdGhpcy5vcHRzLmljb25DbGFzcyxcbiAgICAgIGNsaWNrOiBmdW5jdGlvbigpeyAkKGlucHV0KS5mb2N1cygpIH1cbiAgICB9KTtcblxuICAgIGlmICghIHRoaXMuJGZpZWxkcy5maWx0ZXIoJGZpZWxkKS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuJGZpZWxkcyA9IHRoaXMuJGZpZWxkcy5hZGQoJGZpZWxkKTtcbiAgICAgIGlmICh0aGlzLm9wdHMuaWNvbkh0bWwpICRmaWVsZC5hcHBlbmQoJGljb24pO1xuICAgICAgJGZpZWxkLmFkZENsYXNzKCdpZGVhbGZvcm1zLWZpZWxkIGlkZWFsZm9ybXMtZmllbGQtJysgaW5wdXQudHlwZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fYWRkRXZlbnRzKGlucHV0KTtcblxuICAgIHRoaXMuX2luamVjdCgnX2J1aWxkRmllbGQnLCBpbnB1dCk7XG4gIH0sXG5cbiAgX2FkZEV2ZW50czogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dCk7XG5cbiAgICAkKGlucHV0KVxuICAgICAgLm9uKCdjaGFuZ2Uga2V5dXAnLCBmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgdmFyIG9sZFZhbHVlID0gJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsdWUnKTtcblxuICAgICAgICBpZiAoZS53aGljaCA9PSA5IHx8IGUud2hpY2ggPT0gMTYpIHJldHVybjtcbiAgICAgICAgaWYgKCEgJCh0aGlzKS5pcygnOmNoZWNrYm94LCA6cmFkaW8nKSAmJiBvbGRWYWx1ZSA9PSB0aGlzLnZhbHVlKSByZXR1cm47XG5cbiAgICAgICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsdWUnLCB0aGlzLnZhbHVlKTtcblxuICAgICAgICBzZWxmLl92YWxpZGF0ZSh0aGlzLCB0cnVlLCB0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuZm9jdXMoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgaWYgKHNlbGYuaXNWYWxpZCh0aGlzLm5hbWUpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKHNlbGYuX2lzUmVxdWlyZWQodGhpcykgfHwgdGhpcy52YWx1ZSkge1xuICAgICAgICAgICRmaWVsZC5maW5kKHNlbGYub3B0cy5lcnJvcikuc2hvdygpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmJsdXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICRmaWVsZC5maW5kKHNlbGYub3B0cy5lcnJvcikuaGlkZSgpO1xuICAgICAgfSk7XG4gIH0sXG5cbiAgX2lzUmVxdWlyZWQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgLy8gV2UgYXNzdW1lIG5vbi10ZXh0IGlucHV0cyB3aXRoIHJ1bGVzIGFyZSByZXF1aXJlZFxuICAgIGlmICgkKGlucHV0KS5pcygnOmNoZWNrYm94LCA6cmFkaW8sIHNlbGVjdCcpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5vcHRzLnJ1bGVzW2lucHV0Lm5hbWVdLmluZGV4T2YoJ3JlcXVpcmVkJykgPiAtMTtcbiAgfSxcblxuICBfZ2V0UmVsYXRlZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RmllbGQoaW5wdXQpLmZpbmQoJ1tuYW1lPVwiJysgaW5wdXQubmFtZSArJ1wiXScpO1xuICB9LFxuXG4gIF9nZXRGaWVsZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gJChpbnB1dCkuY2xvc2VzdCh0aGlzLm9wdHMuZmllbGQpO1xuICB9LFxuXG4gIF9nZXRGaXJzdEludmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEludmFsaWQoKS5maXJzdCgpLmZpbmQoJ2lucHV0OmZpcnN0LCB0ZXh0YXJlYSwgc2VsZWN0Jyk7XG4gIH0sXG5cbiAgX2hhbmRsZUVycm9yOiBmdW5jdGlvbihpbnB1dCwgZXJyb3IsIHZhbGlkKSB7XG4gICAgdmFsaWQgPSB2YWxpZCB8fCB0aGlzLmlzVmFsaWQoaW5wdXQubmFtZSk7XG4gICAgdmFyICRlcnJvciA9IHRoaXMuX2dldEZpZWxkKGlucHV0KS5maW5kKHRoaXMub3B0cy5lcnJvcik7XG4gICAgdGhpcy4kZm9ybS5maW5kKHRoaXMub3B0cy5lcnJvcikuaGlkZSgpO1xuICAgIGlmIChlcnJvcikgJGVycm9yLnRleHQoZXJyb3IpO1xuICAgICRlcnJvci50b2dnbGUoIXZhbGlkKTtcbiAgfSxcblxuICBfaGFuZGxlU3R5bGU6IGZ1bmN0aW9uKGlucHV0LCB2YWxpZCkge1xuICAgIHZhbGlkID0gdmFsaWQgfHwgdGhpcy5pc1ZhbGlkKGlucHV0Lm5hbWUpO1xuICAgIHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0cy52YWxpZENsYXNzICsnICcrIHRoaXMub3B0cy5pbnZhbGlkQ2xhc3MpXG4gICAgICAuYWRkQ2xhc3ModmFsaWQgPyB0aGlzLm9wdHMudmFsaWRDbGFzcyA6IHRoaXMub3B0cy5pbnZhbGlkQ2xhc3MpXG4gICAgICAuZmluZCgnLicrIHRoaXMub3B0cy5pY29uQ2xhc3MpLnNob3coKTtcbiAgfSxcblxuICBfZnJlc2g6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRzLnZhbGlkQ2xhc3MgKycgJysgdGhpcy5vcHRzLmludmFsaWRDbGFzcylcbiAgICAgIC5maW5kKHRoaXMub3B0cy5lcnJvcikuaGlkZSgpXG4gICAgICAuZW5kKClcbiAgICAgIC5maW5kKCcuJysgdGhpcy5vcHRzLmljb25DbGFzcykudG9nZ2xlKHRoaXMuX2lzUmVxdWlyZWQoaW5wdXQpKTtcbiAgfSxcblxuICBfdmFsaWRhdGU6IGZ1bmN0aW9uKGlucHV0LCBoYW5kbGVFcnJvciwgaGFuZGxlU3R5bGUpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgICwgdXNlclJ1bGVzID0gdGhpcy5vcHRzLnJ1bGVzW2lucHV0Lm5hbWVdLnNwbGl0KCQuaWRlYWxmb3Jtcy5ydWxlU2VwYXJhdG9yKVxuICAgICAgLCB2YWxpZCA9IHRydWVcbiAgICAgICwgcnVsZTtcblxuICAgIC8vIE5vbi1yZXF1aXJlZCBpbnB1dCB3aXRoIGVtcHR5IHZhbHVlIG11c3QgcGFzcyB2YWxpZGF0aW9uXG4gICAgaWYgKCEgaW5wdXQudmFsdWUgJiYgISB0aGlzLl9pc1JlcXVpcmVkKGlucHV0KSkge1xuICAgICAgJGZpZWxkLnJlbW92ZURhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnKTtcbiAgICAgIHRoaXMuX2ZyZXNoKGlucHV0KTtcblxuICAgIC8vIFJlcXVpcmVkIGlucHV0c1xuICAgIH0gZWxzZSB7XG5cbiAgICAgICQuZWFjaCh1c2VyUnVsZXMsIGZ1bmN0aW9uKGksIHVzZXJSdWxlKSB7XG5cbiAgICAgICAgdXNlclJ1bGUgPSB1c2VyUnVsZS5zcGxpdCgkLmlkZWFsZm9ybXMuYXJnU2VwYXJhdG9yKTtcblxuICAgICAgICBydWxlID0gdXNlclJ1bGVbMF07XG5cbiAgICAgICAgdmFyIHRoZVJ1bGUgPSAkLmlkZWFsZm9ybXMucnVsZXNbcnVsZV1cbiAgICAgICAgICAsIGFyZ3MgPSB1c2VyUnVsZS5zbGljZSgxKVxuICAgICAgICAgICwgZXJyb3I7XG5cbiAgICAgICAgZXJyb3IgPSAkLmlkZWFsZm9ybXMuX2Zvcm1hdC5hcHBseShudWxsLCBbXG4gICAgICAgICAgJC5pZGVhbGZvcm1zLl9nZXRLZXkoJ2Vycm9ycy4nKyBpbnB1dC5uYW1lICsnLicrIHJ1bGUsIHNlbGYub3B0cykgfHxcbiAgICAgICAgICAkLmlkZWFsZm9ybXMuZXJyb3JzW3J1bGVdXG4gICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcblxuICAgICAgICB2YWxpZCA9IHR5cGVvZiB0aGVSdWxlID09ICdmdW5jdGlvbidcbiAgICAgICAgICA/IHRoZVJ1bGUuYXBwbHkoc2VsZiwgW2lucHV0LCBpbnB1dC52YWx1ZV0uY29uY2F0KGFyZ3MpKVxuICAgICAgICAgIDogdGhlUnVsZS50ZXN0KGlucHV0LnZhbHVlKTtcblxuICAgICAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcsIHZhbGlkKTtcblxuICAgICAgICBpZiAoaGFuZGxlRXJyb3IpIHNlbGYuX2hhbmRsZUVycm9yKGlucHV0LCBlcnJvciwgdmFsaWQpO1xuICAgICAgICBpZiAoaGFuZGxlU3R5bGUpIHNlbGYuX2hhbmRsZVN0eWxlKGlucHV0LCB2YWxpZCk7XG5cbiAgICAgICAgc2VsZi5vcHRzLm9uVmFsaWRhdGUuY2FsbChzZWxmLCBpbnB1dCwgcnVsZSwgdmFsaWQpO1xuXG4gICAgICAgIHJldHVybiB2YWxpZDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuX2luamVjdCgnX3ZhbGlkYXRlJywgaW5wdXQsIHJ1bGUsIHZhbGlkKTtcblxuICAgIHJldHVybiB2YWxpZDtcbiAgfVxuXG59O1xuIiwiLyoqXG4gKiBQdWJsaWMgbWV0aG9kc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhZGRSdWxlczogZnVuY3Rpb24ocnVsZXMpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciAkaW5wdXRzID0gdGhpcy4kZm9ybS5maW5kKCQubWFwKHJ1bGVzLCBmdW5jdGlvbihfLCBuYW1lKSB7XG4gICAgICByZXR1cm4gJ1tuYW1lPVwiJysgbmFtZSArJ1wiXSc7XG4gICAgfSkuam9pbignLCcpKTtcblxuICAgICQuZXh0ZW5kKHRoaXMub3B0cy5ydWxlcywgcnVsZXMpO1xuXG4gICAgJGlucHV0cy5lYWNoKGZ1bmN0aW9uKCl7IHNlbGYuX2J1aWxkRmllbGQodGhpcykgfSk7XG5cbiAgICB0aGlzLiRpbnB1dHMgPSB0aGlzLiRpbnB1dHNcbiAgICAgIC5hZGQoJGlucHV0cylcbiAgICAgIC5lYWNoKGZ1bmN0aW9uKCl7IHNlbGYuX3ZhbGlkYXRlKHRoaXMsIHRydWUpIH0pO1xuXG4gICAgdGhpcy4kZmllbGRzLmZpbmQodGhpcy5vcHRzLmVycm9yKS5oaWRlKCk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ2FkZFJ1bGVzJyk7XG4gIH0sXG5cbiAgZ2V0SW52YWxpZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGZpZWxkcy5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJCh0aGlzKS5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJykgPT09IGZhbHNlO1xuICAgIH0pO1xuICB9LFxuXG4gIGZvY3VzRmlyc3RJbnZhbGlkOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBmaXJzdEludmFsaWQgPSB0aGlzLl9nZXRGaXJzdEludmFsaWQoKVswXTtcblxuICAgIGlmIChmaXJzdEludmFsaWQpIHtcbiAgICAgIHRoaXMuX2hhbmRsZUVycm9yKGZpcnN0SW52YWxpZCk7XG4gICAgICB0aGlzLl9oYW5kbGVTdHlsZShmaXJzdEludmFsaWQpO1xuICAgICAgdGhpcy5faW5qZWN0KCdmb2N1c0ZpcnN0SW52YWxpZCcsIGZpcnN0SW52YWxpZCk7XG4gICAgICBmaXJzdEludmFsaWQuZm9jdXMoKTtcbiAgICB9XG4gIH0sXG5cbiAgaXNWYWxpZDogZnVuY3Rpb24obmFtZSkge1xuICAgIGlmIChuYW1lKSByZXR1cm4gISB0aGlzLmdldEludmFsaWQoKS5maW5kKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKS5sZW5ndGg7XG4gICAgcmV0dXJuICEgdGhpcy5nZXRJbnZhbGlkKCkubGVuZ3RoO1xuICB9LFxuXG4gIHJlc2V0OiBmdW5jdGlvbihuYW1lKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGlucHV0cyA9IHRoaXMuJGlucHV0cztcblxuICAgIGlmIChuYW1lKSAkaW5wdXRzID0gJGlucHV0cy5maWx0ZXIoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpO1xuXG4gICAgJGlucHV0cy5maWx0ZXIoJ2lucHV0Om5vdCg6Y2hlY2tib3gsIDpyYWRpbyknKS52YWwoJycpO1xuICAgICRpbnB1dHMuZmlsdGVyKCc6Y2hlY2tib3gsIDpyYWRpbycpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgJGlucHV0cy5maWx0ZXIoJ3NlbGVjdCcpLmZpbmQoJ29wdGlvbicpLnByb3AoJ3NlbGVjdGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0U2VsZWN0ZWQ7XG4gICAgfSk7XG5cbiAgICAkaW5wdXRzLmNoYW5nZSgpLmVhY2goZnVuY3Rpb24oKXsgc2VsZi5fcmVzZXRFcnJvckFuZFN0eWxlKHRoaXMpIH0pO1xuICB9XG5cbn07XG4iLCIvKipcbiAqIFJ1bGVzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHJlcXVpcmVkOiAvLisvLFxuICBkaWdpdHM6IC9eXFxkKyQvLFxuICBlbWFpbDogL15bXkBdK0BbXkBdK1xcLi57Miw2fSQvLFxuICB1c2VybmFtZTogL15bYS16XSg/PVtcXHcuXXszLDMxfSQpXFx3KlxcLj9cXHcqJC9pLFxuICBwYXNzOiAvKD89LipcXGQpKD89LipbYS16XSkoPz0uKltBLVpdKS57Nix9LyxcbiAgc3Ryb25ncGFzczogLyg/PV4uezgsfSQpKCg/PS4qXFxkKXwoPz0uKlxcVyspKSg/IVsuXFxuXSkoPz0uKltBLVpdKSg/PS4qW2Etel0pLiokLyxcbiAgcGhvbmU6IC9eWzItOV1cXGR7Mn0tXFxkezN9LVxcZHs0fSQvLFxuICB6aXA6IC9eXFxkezV9JHxeXFxkezV9LVxcZHs0fSQvLFxuICB1cmw6IC9eKD86KGZ0cHxodHRwfGh0dHBzKTpcXC9cXC8pPyg/OltcXHdcXC1dK1xcLikrW2Etel17Miw2fShbXFw6XFwvPyNdLiopPyQvaSxcblxuICBudW1iZXI6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSkge1xuICAgIHJldHVybiAhaXNOYU4odmFsdWUpO1xuICB9LFxuXG4gIHJhbmdlOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1peCwgbWF4KSB7XG4gICAgcmV0dXJuIE51bWJlcih2YWx1ZSkgPj0gbWluICYmIE51bWJlcih2YWx1ZSkgPD0gbWF4O1xuICB9LFxuXG4gIG1pbjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaW4pIHtcbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoID49IG1pbjtcbiAgfSxcblxuICBtYXg6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWF4KSB7XG4gICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA8PSBtYXg7XG4gIH0sXG5cbiAgbWlub3B0aW9uOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1pbikge1xuICAgIHJldHVybiB0aGlzLl9nZXRSZWxhdGVkKGlucHV0KS5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoID49IG1pbjtcbiAgfSxcblxuICBtYXhvcHRpb246IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWF4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFJlbGF0ZWQoaW5wdXQpLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGggPD0gbWF4O1xuICB9LFxuXG4gIG1pbm1heDogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaW4sIG1heCkge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPj0gbWluICYmIHZhbHVlLmxlbmd0aCA8PSBtYXg7XG4gIH0sXG5cbiAgc2VsZWN0OiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIGRlZikge1xuICAgIHJldHVybiB2YWx1ZSAhPSBkZWY7XG4gIH0sXG5cbiAgZXh0ZW5zaW9uOiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgdmFyIGV4dGVuc2lvbnMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAgICwgdmFsaWQgPSBmYWxzZTtcblxuICAgICQuZWFjaChpbnB1dC5maWxlcyB8fCBbe25hbWU6IGlucHV0LnZhbHVlfV0sIGZ1bmN0aW9uKGksIGZpbGUpIHtcbiAgICAgIHZhbGlkID0gJC5pbkFycmF5KGZpbGUubmFtZS5tYXRjaCgvXFwuKC4rKSQvKVsxXSwgZXh0ZW5zaW9ucykgPiAtMTtcbiAgICB9KTtcblxuICAgIHJldHVybiB2YWxpZDtcbiAgfSxcblxuICBlcXVhbHRvOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIHRhcmdldCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICR0YXJnZXQgPSAkKCdbbmFtZT1cIicrIHRhcmdldCArJ1wiXScpO1xuXG4gICAgaWYgKHRoaXMuZ2V0SW52YWxpZCgpLmZpbmQoJHRhcmdldCkubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICAkdGFyZ2V0Lm9mZigna2V5dXAuZXF1YWx0bycpLm9uKCdrZXl1cC5lcXVhbHRvJywgZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLl92YWxpZGF0ZShpbnB1dCwgZmFsc2UsIHRydWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGlucHV0LnZhbHVlID09ICR0YXJnZXQudmFsKCk7XG4gIH0sXG5cbiAgZGF0ZTogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBmb3JtYXQpIHtcblxuICAgIGZvcm1hdCA9IGZvcm1hdCB8fCAnbW0vZGQveXl5eSc7XG5cbiAgICB2YXIgZGVsaW1pdGVyID0gL1tebWR5XS8uZXhlYyhmb3JtYXQpWzBdXG4gICAgICAsIHRoZUZvcm1hdCA9IGZvcm1hdC5zcGxpdChkZWxpbWl0ZXIpXG4gICAgICAsIHRoZURhdGUgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuXG4gICAgZnVuY3Rpb24gaXNEYXRlKGRhdGUsIGZvcm1hdCkge1xuXG4gICAgICB2YXIgbSwgZCwgeTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZvcm1hdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoL20vLnRlc3QoZm9ybWF0W2ldKSkgbSA9IGRhdGVbaV07XG4gICAgICAgIGlmICgvZC8udGVzdChmb3JtYXRbaV0pKSBkID0gZGF0ZVtpXTtcbiAgICAgICAgaWYgKC95Ly50ZXN0KGZvcm1hdFtpXSkpIHkgPSBkYXRlW2ldO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW0gfHwgIWQgfHwgIXkpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIG0gPiAwICYmIG0gPCAxMyAmJlxuICAgICAgICB5ICYmIHkubGVuZ3RoID09IDQgJiZcbiAgICAgICAgZCA+IDAgJiYgZCA8PSAobmV3IERhdGUoeSwgbSwgMCkpLmdldERhdGUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXNEYXRlKHRoZURhdGUsIHRoZUZvcm1hdCk7XG4gIH1cblxufTtcbiJdfQ==
;