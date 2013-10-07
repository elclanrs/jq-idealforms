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
/**
 * Adaptive
 */
module.exports = {

  name: 'adaptive',

  options: {
    adaptiveWidth: $('<p class="idealforms-field-width"/>').appendTo('body').css('width').replace('px','')
  },

  methods: {

    // @extend
    _init: function () {

      var self = this;

      function adapt() {

        var formWidth = self.$form.outerWidth()
          , isAdaptive = self.opts.adaptiveWidth > formWidth;

        self.$form.toggleClass('adaptive', isAdaptive);

        if (self._hasExtension('steps')) {
          self.$stepsContainer.toggleClass('adaptive', isAdaptive);
        }

        $('#ui-datepicker-div').hide();
      }

      $(window).resize(adapt);
      adapt();

      this.$form.find('select, .datepicker').each(function() {
        self._getField(this).find(self.opts.error).addClass('hidden');
      });

      $('p.idealforms-field-width').remove();
    }

  }
};

},{}],3:[function(require,module,exports){
module.exports = {

  name: 'ajax',

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

},{}],4:[function(require,module,exports){
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

},{"./idealfile":5,"./idealradiocheck":6}],5:[function(require,module,exports){
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

},{"../../plugin":12}],6:[function(require,module,exports){
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


},{"../../plugin":12}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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
        <div class="field">\
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
          , rules = {}
          , $last = self.$form.find(self.opts.field).last();

        field.name = name;
        field.type = typeArray[0];
        if (typeArray[1]) field.subtype = typeArray[1];

        field.html = template(self.opts.templates.base, {
          label: field.label,
          field: template(self.opts.templates[field.type], field)
        });

        self._inject('addFields', field);

        if (field.after || field.before) {
          self.$form.find('[name="'+ (field.after || field.before) +'"]').first().each(function() {
            self._getField(this)[field.after ? 'after' : 'before'](field.html);
          });
        } else {
          // Form has at least one field
          if ($last.length) $last.after(field.html);
          // Form has no fields
          else self.$form.append(field.html);
        }

        if (field.rules) {
          rules[name] = field.rules;
          self.addRules(rules);
        }
      });

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

},{}],9:[function(require,module,exports){
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

      this.$navItems.click(function(e) {
        e.preventDefault();
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

},{"../../plugin":12}],10:[function(require,module,exports){
require('./idealsteps');

module.exports = {

  name: 'steps',

  options: {
    steps: {
      container: '.idealsteps-container',
      nav: '.idealsteps-nav',
      navItems: 'li',
      buildNavItems: true,
      wrap: '.idealsteps-wrap',
      step: '.idealsteps-step',
      activeClass: 'idealsteps-step-active',
      before: null,
      after: null,
      fadeSpeed: 0
    }
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

      if (this._hasExtension('ajax')) {
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

      if (this.opts.steps.buildNavItems === true) {
        this.opts.steps.buildNavItems = function(i) {
          return 'Step '+ (i+1) + counter;
        };
      }

      this.$stepsContainer = this.$form
        .closest(this.opts.steps.container)
        .idealsteps(this.opts.steps);
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
    addFields: function(field) {
      field.after = this.$stepsContainer
        .find(this.opts.steps.step)
        .eq(field.appendToStep)
        .find('input, textarea, select')
        .last()[0].name;
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

},{"./idealsteps":9}],11:[function(require,module,exports){
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
      require('./extensions/datepicker/datepicker.ext'),
      require('./extensions/adaptive/adaptive.ext')
    ]
  };

  plugin.methods = $.extend({}, require('./private'), require('./public'));

  require('./plugin')(plugin);

}(jQuery, window, document));

},{"./errors":1,"./extensions/adaptive/adaptive.ext":2,"./extensions/ajax/ajax.ext":3,"./extensions/custom-inputs/custom-inputs.ext":4,"./extensions/datepicker/datepicker.ext":7,"./extensions/dynamic-fields/dynamic-fields.ext":8,"./extensions/steps/steps.ext":10,"./plugin":12,"./private":13,"./public":14,"./rules":15}],12:[function(require,module,exports){
/**
 * Plugin boilerplate
 */
module.exports = (function() {

  var AP = Array.prototype;

  return function(plugin) {

    plugin = $.extend(true, {
      name: 'plugin',
      defaults: {
        disabledExtensions: 'none'
      },
      methods: {},
      global: {},
    }, plugin);

    $[plugin.name] = $.extend({

      addExtension: function(extension) {
        plugin.global.extensions.push(extension);
      }
    }, plugin.global);

    function Plugin(element, options) {

      this.opts = $.extend({}, plugin.defaults, options);
      this.el = element;

      this._name = plugin.name;

      this._init();
    }

    Plugin._extended = {};

    Plugin.prototype._hasExtension = function(extension) {

      var self = this;

      return plugin.global.extensions.filter(function(ext) {
        return ext.name == extension && self.opts.disabledExtensions.indexOf(ext.name) < 0;
      }).length;
    };

    Plugin.prototype._extend = function(extensions) {

      var self = this;

      $.each(extensions, function(i, extension) {

        $.extend(self.opts, $.extend(true, extension.options, self.opts));

        $.each(extension.methods, function(method, fn) {

          if (self.opts.disabledExtensions.indexOf(extension.name) > -1) {
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

    this._inject('reset', name);
  }

};

},{}],15:[function(require,module,exports){
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

},{}]},{},[11])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2Vycm9ycy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9hZGFwdGl2ZS9hZGFwdGl2ZS5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvYWpheC9hamF4LmV4dC5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2N1c3RvbS1pbnB1dHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxmaWxlLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxyYWRpb2NoZWNrLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvZHluYW1pYy1maWVsZHMvZHluYW1pYy1maWVsZHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL3N0ZXBzL2lkZWFsc3RlcHMuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvc3RlcHMvc3RlcHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9tYWluLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9wbHVnaW4uanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3ByaXZhdGUuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3B1YmxpYy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvcnVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRXJyb3JzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHJlcXVpcmVkOiAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCcsXG4gIGRpZ2l0czogJ011c3QgYmUgb25seSBkaWdpdHMnLFxuICBuYW1lOiAnTXVzdCBiZSBhdCBsZWFzdCAzIGNoYXJhY3RlcnMgbG9uZyBhbmQgbXVzdCBvbmx5IGNvbnRhaW4gbGV0dGVycycsXG4gIGVtYWlsOiAnTXVzdCBiZSBhIHZhbGlkIGVtYWlsJyxcbiAgdXNlcm5hbWU6ICdNdXN0IGJlIGF0IGJldHdlZW4gNCBhbmQgMzIgY2hhcmFjdGVycyBsb25nIGFuZCBzdGFydCB3aXRoIGEgbGV0dGVyLiBZb3UgbWF5IHVzZSBsZXR0ZXJzLCBudW1iZXJzLCB1bmRlcnNjb3JlcywgYW5kIG9uZSBkb3QnLFxuICBwYXNzOiAnTXVzdCBiZSBhdCBsZWFzdCA2IGNoYXJhY3RlcnMgbG9uZywgYW5kIGNvbnRhaW4gYXQgbGVhc3Qgb25lIG51bWJlciwgb25lIHVwcGVyY2FzZSBhbmQgb25lIGxvd2VyY2FzZSBsZXR0ZXInLFxuICBzdHJvbmdwYXNzOiAnTXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMgbG9uZyBhbmQgY29udGFpbiBhdCBsZWFzdCBvbmUgdXBwZXJjYXNlIGFuZCBvbmUgbG93ZXJjYXNlIGxldHRlciBhbmQgb25lIG51bWJlciBvciBzcGVjaWFsIGNoYXJhY3RlcicsXG4gIHBob25lOiAnTXVzdCBiZSBhIHZhbGlkIHBob25lIG51bWJlcicsXG4gIHppcDogJ011c3QgYmUgYSB2YWxpZCB6aXAgY29kZScsXG4gIHVybDogJ011c3QgYmUgYSB2YWxpZCBVUkwnLFxuICBudW1iZXI6ICdNdXN0IGJlIGEgbnVtYmVyJyxcbiAgcmFuZ2U6ICdNdXN0IGJlIGEgbnVtYmVyIGJldHdlZW4gezB9IGFuZCB7MX0nLFxuICBtaW46ICdNdXN0IGJlIGF0IGxlYXN0IHswfSBjaGFyYWN0ZXJzIGxvbmcnLFxuICBtYXg6ICdNdXN0IGJlIHVuZGVyIHswfSBjaGFyYWN0ZXJzJyxcbiAgbWlub3B0aW9uOiAnU2VsZWN0IGF0IGxlYXN0IHswfSBvcHRpb25zJyxcbiAgbWF4b3B0aW9uOiAnU2VsZWN0IG5vIG1vcmUgdGhhbiB7MH0gb3B0aW9ucycsXG4gIG1pbm1heDogJ011c3QgYmUgYmV0d2VlbiB7MH0gYW5kIHsxfSBjaGFyYWN0ZXJzIGxvbmcnLFxuICBzZWxlY3Q6ICdTZWxlY3QgYW4gb3B0aW9uJyxcbiAgZXh0ZW5zaW9uOiAnRmlsZShzKSBtdXN0IGhhdmUgYSB2YWxpZCBleHRlbnNpb24gKHsqfSknLFxuICBlcXVhbHRvOiAnTXVzdCBoYXZlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBcInswfVwiIGZpZWxkJyxcbiAgZGF0ZTogJ011c3QgYmUgYSB2YWxpZCBkYXRlIHswfSdcblxufTtcbiIsIi8qKlxuICogQWRhcHRpdmVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2FkYXB0aXZlJyxcblxuICBvcHRpb25zOiB7XG4gICAgYWRhcHRpdmVXaWR0aDogJCgnPHAgY2xhc3M9XCJpZGVhbGZvcm1zLWZpZWxkLXdpZHRoXCIvPicpLmFwcGVuZFRvKCdib2R5JykuY3NzKCd3aWR0aCcpLnJlcGxhY2UoJ3B4JywnJylcbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBmdW5jdGlvbiBhZGFwdCgpIHtcblxuICAgICAgICB2YXIgZm9ybVdpZHRoID0gc2VsZi4kZm9ybS5vdXRlcldpZHRoKClcbiAgICAgICAgICAsIGlzQWRhcHRpdmUgPSBzZWxmLm9wdHMuYWRhcHRpdmVXaWR0aCA+IGZvcm1XaWR0aDtcblxuICAgICAgICBzZWxmLiRmb3JtLnRvZ2dsZUNsYXNzKCdhZGFwdGl2ZScsIGlzQWRhcHRpdmUpO1xuXG4gICAgICAgIGlmIChzZWxmLl9oYXNFeHRlbnNpb24oJ3N0ZXBzJykpIHtcbiAgICAgICAgICBzZWxmLiRzdGVwc0NvbnRhaW5lci50b2dnbGVDbGFzcygnYWRhcHRpdmUnLCBpc0FkYXB0aXZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJyN1aS1kYXRlcGlja2VyLWRpdicpLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgJCh3aW5kb3cpLnJlc2l6ZShhZGFwdCk7XG4gICAgICBhZGFwdCgpO1xuXG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJ3NlbGVjdCwgLmRhdGVwaWNrZXInKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLl9nZXRGaWVsZCh0aGlzKS5maW5kKHNlbGYub3B0cy5lcnJvcikuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgfSk7XG5cbiAgICAgICQoJ3AuaWRlYWxmb3Jtcy1maWVsZC13aWR0aCcpLnJlbW92ZSgpO1xuICAgIH1cblxuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2FqYXgnLFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICQuZXh0ZW5kKCQuaWRlYWxmb3JtcywgeyBfcmVxdWVzdHM6IHt9IH0pO1xuXG4gICAgICAkLmV4dGVuZCgkLmlkZWFsZm9ybXMuZXJyb3JzLCB7XG4gICAgICAgIGFqYXg6ICdMb2FkaW5nLi4uJ1xuICAgICAgfSk7XG5cbiAgICAgICQuZXh0ZW5kKCQuaWRlYWxmb3Jtcy5ydWxlcywge1xuXG4gICAgICAgIGFqYXg6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAgICAgICAsIHVybCA9ICQoaW5wdXQpLmRhdGEoJ2lkZWFsZm9ybXMtYWpheCcpXG4gICAgICAgICAgICAsIHVzZXJFcnJvciA9ICQuaWRlYWxmb3Jtcy5fZ2V0S2V5KCdlcnJvcnMuJysgaW5wdXQubmFtZSArJy5hamF4RXJyb3InLCBzZWxmLm9wdHMpXG4gICAgICAgICAgICAsIHJlcXVlc3RzID0gJC5pZGVhbGZvcm1zLl9yZXF1ZXN0c1xuICAgICAgICAgICAgLCBkYXRhID0ge307XG5cbiAgICAgICAgICBkYXRhW2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XG5cbiAgICAgICAgICAkZmllbGQuYWRkQ2xhc3MoJ2FqYXgnKTtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0c1tpbnB1dC5uYW1lXSkgcmVxdWVzdHNbaW5wdXQubmFtZV0uYWJvcnQoKTtcblxuICAgICAgICAgIHJlcXVlc3RzW2lucHV0Lm5hbWVdID0gJC5wb3N0KHVybCwgZGF0YSwgZnVuY3Rpb24ocmVzcCkge1xuXG4gICAgICAgICAgICBpZiAocmVzcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcsIHRydWUpO1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCk7XG4gICAgICAgICAgICAgIHNlbGYuX2hhbmRsZVN0eWxlKGlucHV0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlbGYuX2hhbmRsZUVycm9yKGlucHV0LCB1c2VyRXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkZmllbGQucmVtb3ZlQ2xhc3MoJ2FqYXgnKTtcblxuICAgICAgICAgIH0sICdqc29uJyk7XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX3ZhbGlkYXRlOiBmdW5jdGlvbihpbnB1dCwgcnVsZSkge1xuICAgICAgaWYgKHJ1bGUgIT0gJ2FqYXgnICYmICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNbaW5wdXQubmFtZV0pIHtcbiAgICAgICAgJC5pZGVhbGZvcm1zLl9yZXF1ZXN0c1tpbnB1dC5uYW1lXS5hYm9ydCgpO1xuICAgICAgICB0aGlzLl9nZXRGaWVsZChpbnB1dCkucmVtb3ZlQ2xhc3MoJ2FqYXgnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxufTtcbiIsInJlcXVpcmUoJy4vaWRlYWxmaWxlJyk7XG5yZXF1aXJlKCcuL2lkZWFscmFkaW9jaGVjaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnY3VzdG9tSW5wdXRzJyxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGRDdXN0b21JbnB1dHMoKTtcbiAgICB9LFxuXG4gICAgYWRkRmllbGRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkQ3VzdG9tSW5wdXRzKCk7XG4gICAgfSxcblxuICAgIF9idWlsZEN1c3RvbUlucHV0czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJzpmaWxlJykuaWRlYWxmaWxlKCk7XG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJzpjaGVja2JveCwgOnJhZGlvJykuaWRlYWxyYWRpb2NoZWNrKCk7XG4gICAgfVxuXG4gIH1cbn07XG4iLCIvKipcbiAqIElkZWFsIEZpbGVcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICAvLyBCcm93c2VyIHN1cHBvcnRzIEhUTUw1IG11bHRpcGxlIGZpbGU/XG4gIHZhciBtdWx0aXBsZVN1cHBvcnQgPSB0eXBlb2YgJCgnPGlucHV0Lz4nKVswXS5tdWx0aXBsZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAsIGlzSUUgPSAvbXNpZS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICAsIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsZmlsZSc7XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSB7XG5cbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciAkZmlsZSA9ICQodGhpcy5lbCkuYWRkQ2xhc3MoJ2lkZWFsLWZpbGUnKSAvLyB0aGUgb3JpZ2luYWwgZmlsZSBpbnB1dFxuICAgICAgICAsICR3cmFwID0gJCgnPGRpdiBjbGFzcz1cImlkZWFsLWZpbGUtd3JhcFwiPicpXG4gICAgICAgICwgJGlucHV0ID0gJCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJpZGVhbC1maWxlLWZpbGVuYW1lXCIgLz4nKVxuICAgICAgICAgIC8vIEJ1dHRvbiB0aGF0IHdpbGwgYmUgdXNlZCBpbiBub24tSUUgYnJvd3NlcnNcbiAgICAgICAgLCAkYnV0dG9uID0gJCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJpZGVhbC1maWxlLXVwbG9hZFwiPk9wZW48L2J1dHRvbj4nKVxuICAgICAgICAgIC8vIEhhY2sgZm9yIElFXG4gICAgICAgICwgJGxhYmVsID0gJCgnPGxhYmVsIGNsYXNzPVwiaWRlYWwtZmlsZS11cGxvYWRcIiBmb3I9XCInICsgJGZpbGVbMF0uaWQgKyAnXCI+T3BlbjwvbGFiZWw+Jyk7XG5cbiAgICAgIC8vIEhpZGUgYnkgc2hpZnRpbmcgdG8gdGhlIGxlZnQgc28gd2VcbiAgICAgIC8vIGNhbiBzdGlsbCB0cmlnZ2VyIGV2ZW50c1xuICAgICAgJGZpbGUuY3NzKHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIGxlZnQ6ICctOTk5OXB4J1xuICAgICAgfSk7XG5cbiAgICAgICR3cmFwLmFwcGVuZCgkaW5wdXQsIChpc0lFID8gJGxhYmVsIDogJGJ1dHRvbikpLmluc2VydEFmdGVyKCRmaWxlKTtcblxuICAgICAgLy8gUHJldmVudCBmb2N1c1xuICAgICAgJGZpbGUuYXR0cigndGFiSW5kZXgnLCAtMSk7XG4gICAgICAkYnV0dG9uLmF0dHIoJ3RhYkluZGV4JywgLTEpO1xuXG4gICAgICAkYnV0dG9uLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGZpbGUuZm9jdXMoKS5jbGljaygpOyAvLyBPcGVuIGRpYWxvZ1xuICAgICAgfSk7XG5cbiAgICAgICRmaWxlLmNoYW5nZShmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGZpbGVzID0gW11cbiAgICAgICAgICAsIGZpbGVBcnIsIGZpbGVuYW1lO1xuXG4gICAgICAgICAgLy8gSWYgbXVsdGlwbGUgaXMgc3VwcG9ydGVkIHRoZW4gZXh0cmFjdFxuICAgICAgICAgIC8vIGFsbCBmaWxlbmFtZXMgZnJvbSB0aGUgZmlsZSBhcnJheVxuICAgICAgICBpZiAobXVsdGlwbGVTdXBwb3J0KSB7XG4gICAgICAgICAgZmlsZUFyciA9ICRmaWxlWzBdLmZpbGVzO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBmaWxlQXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlcy5wdXNoKGZpbGVBcnJbaV0ubmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpbGVuYW1lID0gZmlsZXMuam9pbignLCAnKTtcblxuICAgICAgICAgIC8vIElmIG5vdCBzdXBwb3J0ZWQgdGhlbiBqdXN0IHRha2UgdGhlIHZhbHVlXG4gICAgICAgICAgLy8gYW5kIHJlbW92ZSB0aGUgcGF0aCB0byBqdXN0IHNob3cgdGhlIGZpbGVuYW1lXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmlsZW5hbWUgPSAkZmlsZS52YWwoKS5zcGxpdCgnXFxcXCcpLnBvcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGlucHV0IC52YWwoZmlsZW5hbWUpLmF0dHIoJ3RpdGxlJywgZmlsZW5hbWUpO1xuXG4gICAgICB9KTtcblxuICAgICAgJGlucHV0Lm9uKHtcbiAgICAgICAgYmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRmaWxlLnRyaWdnZXIoJ2JsdXInKTtcbiAgICAgICAgfSxcbiAgICAgICAga2V5ZG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMTMpIHsgLy8gRW50ZXJcbiAgICAgICAgICAgIGlmICghaXNJRSkgJGZpbGUudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLm9uZSgna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEzKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDggfHwgZS53aGljaCA9PT0gNDYpIHsgLy8gQmFja3NwYWNlICYgRGVsXG4gICAgICAgICAgICAvLyBJbiBJRSB0aGUgdmFsdWUgaXMgcmVhZC1vbmx5XG4gICAgICAgICAgICAvLyB3aXRoIHRoaXMgdHJpY2sgd2UgcmVtb3ZlIHRoZSBvbGQgaW5wdXQgYW5kIGFkZFxuICAgICAgICAgICAgLy8gYSBjbGVhbiBjbG9uZSB3aXRoIGFsbCB0aGUgb3JpZ2luYWwgZXZlbnRzIGF0dGFjaGVkXG4gICAgICAgICAgICBpZiAoaXNJRSkgJGZpbGUucmVwbGFjZVdpdGgoJGZpbGUgPSAkZmlsZS5jbG9uZSh0cnVlKSk7XG4gICAgICAgICAgICAkZmlsZS52YWwoJycpLnRyaWdnZXIoJ2NoYW5nZScpO1xuICAgICAgICAgICAgJGlucHV0LnZhbCgnJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSA5KSB7IC8vIFRBQlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7IC8vIEFsbCBvdGhlciBrZXlzXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH1cblxuICB9O1xuXG4gIHJlcXVpcmUoJy4uLy4uL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iLCIvKlxuICogaWRlYWxSYWRpb0NoZWNrOiBqUXVlcnkgcGxndWluIGZvciBjaGVja2JveCBhbmQgcmFkaW8gcmVwbGFjZW1lbnRcbiAqIFVzYWdlOiAkKCdpbnB1dFt0eXBlPWNoZWNrYm94XSwgaW5wdXRbdHlwZT1yYWRpb10nKS5pZGVhbFJhZGlvQ2hlY2soKVxuICovXG4oZnVuY3Rpb24oJCwgd2luLCBkb2MsIHVuZGVmaW5lZCkge1xuXG4gIHZhciBwbHVnaW4gPSB7fTtcblxuICBwbHVnaW4ubmFtZSA9ICdpZGVhbHJhZGlvY2hlY2snO1xuXG4gIHBsdWdpbi5tZXRob2RzID0ge1xuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgJGlucHV0ID0gJCh0aGlzLmVsKTtcbiAgICAgIHZhciAkc3BhbiA9ICQoJzxzcGFuLz4nKTtcblxuICAgICAgJHNwYW4uYWRkQ2xhc3MoJ2lkZWFsLScrICgkaW5wdXQuaXMoJzpjaGVja2JveCcpID8gJ2NoZWNrJyA6ICdyYWRpbycpKTtcbiAgICAgICRpbnB1dC5pcygnOmNoZWNrZWQnKSAmJiAkc3Bhbi5hZGRDbGFzcygnY2hlY2tlZCcpOyAvLyBpbml0XG4gICAgICAkc3Bhbi5pbnNlcnRBZnRlcigkaW5wdXQpO1xuXG4gICAgICAkaW5wdXQucGFyZW50KCdsYWJlbCcpXG4gICAgICAgIC5hZGRDbGFzcygnaWRlYWwtcmFkaW9jaGVjay1sYWJlbCcpXG4gICAgICAgIC5hdHRyKCdvbmNsaWNrJywgJycpOyAvLyBGaXggY2xpY2tpbmcgbGFiZWwgaW4gaU9TXG5cbiAgICAgICRpbnB1dC5jc3MoeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgbGVmdDogJy05OTk5cHgnIH0pOyAvLyBoaWRlIGJ5IHNoaWZ0aW5nIGxlZnRcblxuICAgICAgLy8gRXZlbnRzXG4gICAgICAkaW5wdXQub24oe1xuICAgICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkaW5wdXQgPSAkKHRoaXMpO1xuICAgICAgICAgIGlmICggJGlucHV0LmlzKCdpbnB1dFt0eXBlPVwicmFkaW9cIl0nKSApIHtcbiAgICAgICAgICAgICRpbnB1dC5wYXJlbnQoKS5zaWJsaW5ncygnbGFiZWwnKS5maW5kKCcuaWRlYWwtcmFkaW8nKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkc3Bhbi50b2dnbGVDbGFzcygnY2hlY2tlZCcsICRpbnB1dC5pcygnOmNoZWNrZWQnKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbigpIHsgJHNwYW4uYWRkQ2xhc3MoJ2ZvY3VzJykgfSxcbiAgICAgICAgYmx1cjogZnVuY3Rpb24oKSB7ICRzcGFuLnJlbW92ZUNsYXNzKCdmb2N1cycpIH0sXG4gICAgICAgIGNsaWNrOiBmdW5jdGlvbigpIHsgJCh0aGlzKS50cmlnZ2VyKCdmb2N1cycpIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIHJlcXVpcmUoJy4uLy4uL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdkYXRlcGlja2VyJyxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGREYXRlcGlja2VyKCk7XG4gICAgfSxcblxuICAgX2J1aWxkRGF0ZXBpY2tlcjogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciAkZGF0ZXBpY2tlciA9IHRoaXMuJGZvcm0uZmluZCgnaW5wdXQuZGF0ZXBpY2tlcicpO1xuXG4gICAgICAvLyBBbHdheXMgc2hvdyBkYXRlcGlja2VyIGJlbG93IHRoZSBpbnB1dFxuICAgICAgaWYgKGpRdWVyeS51aSkge1xuICAgICAgICAkLmRhdGVwaWNrZXIuX2NoZWNrT2Zmc2V0ID0gZnVuY3Rpb24oYSxiLGMpeyByZXR1cm4gYiB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoalF1ZXJ5LnVpICYmICRkYXRlcGlja2VyLmxlbmd0aCkge1xuXG4gICAgICAgICRkYXRlcGlja2VyLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIoe1xuICAgICAgICAgICAgYmVmb3JlU2hvdzogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgICAgICAgJChpbnB1dCkuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNoYW5nZU1vbnRoWWVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIC8vIEhhY2sgdG8gZml4IElFOSBub3QgcmVzaXppbmdcbiAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgICAgICAgICAgICwgd2lkdGggPSAkdGhpcy5vdXRlcldpZHRoKCk7IC8vIGNhY2hlIGZpcnN0IVxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICR0aGlzLmRhdGVwaWNrZXIoJ3dpZGdldCcpLmNzcygnd2lkdGgnLCB3aWR0aCk7XG4gICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkanVzdCB3aWR0aFxuICAgICAgICAkZGF0ZXBpY2tlci5vbignZm9jdXMga2V5dXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgdCA9ICQodGhpcyksIHcgPSB0Lm91dGVyV2lkdGgoKTtcbiAgICAgICAgICB0LmRhdGVwaWNrZXIoJ3dpZGdldCcpLmNzcygnd2lkdGgnLCB3KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbn07XG4iLCJmdW5jdGlvbiB0ZW1wbGF0ZShodG1sLCBkYXRhKSB7XG5cbiAgdmFyIGxvb3AgPSAvXFx7QChbXn1dKylcXH0oLis/KVxce1xcL1xcMVxcfS9nXG4gICAgLCBsb29wVmFyaWFibGUgPSAvXFx7IyhbXn1dKylcXH0vZ1xuICAgICwgdmFyaWFibGUgPSAvXFx7KFtefV0rKVxcfS9nO1xuXG4gIHJldHVybiBodG1sXG4gICAgLnJlcGxhY2UobG9vcCwgZnVuY3Rpb24oXywga2V5LCBsaXN0KSB7XG4gICAgICByZXR1cm4gJC5tYXAoZGF0YVtrZXldLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBsaXN0LnJlcGxhY2UobG9vcFZhcmlhYmxlLCBmdW5jdGlvbihfLCBrKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW1ba107XG4gICAgICAgIH0pO1xuICAgICAgfSkuam9pbignJyk7XG4gICAgfSlcbiAgICAucmVwbGFjZSh2YXJpYWJsZSwgZnVuY3Rpb24oXywga2V5KSB7XG4gICAgICByZXR1cm4gZGF0YVtrZXldIHx8ICcnO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnZHluYW1pY0ZpZWxkcycsXG5cbiAgb3B0aW9uczoge1xuXG4gICAgdGVtcGxhdGVzOiB7XG5cbiAgICAgIGJhc2U6J1xcXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxcXG4gICAgICAgICAgPGxhYmVsIGNsYXNzPVwibWFpblwiPntsYWJlbH08L2xhYmVsPlxcXG4gICAgICAgICAge2ZpZWxkfVxcXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJlcnJvclwiPjwvc3Bhbj5cXFxuICAgICAgICA8L2Rpdj5cXFxuICAgICAgJyxcblxuICAgICAgdGV4dDogJzxpbnB1dCBuYW1lPVwie25hbWV9XCIgdHlwZT1cIntzdWJ0eXBlfVwiIHZhbHVlPVwie3ZhbHVlfVwiIHthdHRyc30+JyxcblxuICAgICAgZmlsZTogJzxpbnB1dCBpZD1cIntuYW1lfSBcIm5hbWU9XCJ7bmFtZX1cIiB0eXBlPVwiZmlsZVwiIHthdHRyc30+JyxcblxuICAgICAgdGV4dGFyZWE6ICc8dGV4dGFyZWEgbmFtZT1cIntuYW1lfVwiIHthdHRyc30+e3RleHR9PC90ZXh0YXJlYT4nLFxuXG4gICAgICBncm91cDogJ1xcXG4gICAgICAgIDxwIGNsYXNzPVwiZ3JvdXBcIj5cXFxuICAgICAgICAgIHtAbGlzdH1cXFxuICAgICAgICAgIDxsYWJlbD48aW5wdXQgbmFtZT1cIntuYW1lfVwiIHR5cGU9XCJ7c3VidHlwZX1cIiB2YWx1ZT1cInsjdmFsdWV9XCIgeyNhdHRyc30+eyN0ZXh0fTwvbGFiZWw+XFxcbiAgICAgICAgICB7L2xpc3R9XFxcbiAgICAgICAgPC9wPlxcXG4gICAgICAnLFxuXG4gICAgICBzZWxlY3Q6ICdcXFxuICAgICAgICA8c2VsZWN0IG5hbWU9e25hbWV9PlxcXG4gICAgICAgICAge0BsaXN0fVxcXG4gICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInsjdmFsdWV9XCI+eyN0ZXh0fTwvb3B0aW9uPlxcXG4gICAgICAgICAgey9saXN0fVxcXG4gICAgICAgIDwvc2VsZWN0PlxcXG4gICAgICAnXG4gICAgfVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIGFkZEZpZWxkczogZnVuY3Rpb24oZmllbGRzKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKGZpZWxkcywgZnVuY3Rpb24obmFtZSwgZmllbGQpIHtcblxuICAgICAgICB2YXIgdHlwZUFycmF5ID0gZmllbGQudHlwZS5zcGxpdCgnOicpXG4gICAgICAgICAgLCBydWxlcyA9IHt9XG4gICAgICAgICAgLCAkbGFzdCA9IHNlbGYuJGZvcm0uZmluZChzZWxmLm9wdHMuZmllbGQpLmxhc3QoKTtcblxuICAgICAgICBmaWVsZC5uYW1lID0gbmFtZTtcbiAgICAgICAgZmllbGQudHlwZSA9IHR5cGVBcnJheVswXTtcbiAgICAgICAgaWYgKHR5cGVBcnJheVsxXSkgZmllbGQuc3VidHlwZSA9IHR5cGVBcnJheVsxXTtcblxuICAgICAgICBmaWVsZC5odG1sID0gdGVtcGxhdGUoc2VsZi5vcHRzLnRlbXBsYXRlcy5iYXNlLCB7XG4gICAgICAgICAgbGFiZWw6IGZpZWxkLmxhYmVsLFxuICAgICAgICAgIGZpZWxkOiB0ZW1wbGF0ZShzZWxmLm9wdHMudGVtcGxhdGVzW2ZpZWxkLnR5cGVdLCBmaWVsZClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5faW5qZWN0KCdhZGRGaWVsZHMnLCBmaWVsZCk7XG5cbiAgICAgICAgaWYgKGZpZWxkLmFmdGVyIHx8IGZpZWxkLmJlZm9yZSkge1xuICAgICAgICAgIHNlbGYuJGZvcm0uZmluZCgnW25hbWU9XCInKyAoZmllbGQuYWZ0ZXIgfHwgZmllbGQuYmVmb3JlKSArJ1wiXScpLmZpcnN0KCkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX2dldEZpZWxkKHRoaXMpW2ZpZWxkLmFmdGVyID8gJ2FmdGVyJyA6ICdiZWZvcmUnXShmaWVsZC5odG1sKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBGb3JtIGhhcyBhdCBsZWFzdCBvbmUgZmllbGRcbiAgICAgICAgICBpZiAoJGxhc3QubGVuZ3RoKSAkbGFzdC5hZnRlcihmaWVsZC5odG1sKTtcbiAgICAgICAgICAvLyBGb3JtIGhhcyBubyBmaWVsZHNcbiAgICAgICAgICBlbHNlIHNlbGYuJGZvcm0uYXBwZW5kKGZpZWxkLmh0bWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkLnJ1bGVzKSB7XG4gICAgICAgICAgcnVsZXNbbmFtZV0gPSBmaWVsZC5ydWxlcztcbiAgICAgICAgICBzZWxmLmFkZFJ1bGVzKHJ1bGVzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9LFxuXG4gICAgcmVtb3ZlRmllbGRzOiBmdW5jdGlvbihuYW1lcykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChuYW1lcy5zcGxpdCgnICcpLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAgIHZhciAkZmllbGQgPSBzZWxmLl9nZXRGaWVsZCgkKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKSk7XG4gICAgICAgIHNlbGYuJGZpZWxkcyA9IHNlbGYuJGZpZWxkcy5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICEgJCh0aGlzKS5pcygkZmllbGQpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGZpZWxkLnJlbW92ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2luamVjdCgncmVtb3ZlRmllbGRzJyk7XG4gICAgfSxcblxuICAgIHRvZ2dsZUZpZWxkczogZnVuY3Rpb24obmFtZXMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2gobmFtZXMuc3BsaXQoJyAnKSwgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgICB2YXIgJGZpZWxkID0gc2VsZi5fZ2V0RmllbGQoJCgnW25hbWU9XCInKyBuYW1lICsnXCJdJykpO1xuICAgICAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcsICRmaWVsZC5pcygnOnZpc2libGUnKSkudG9nZ2xlKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5faW5qZWN0KCd0b2dnbGVGaWVsZHMnKTtcbiAgICB9XG5cbiAgfVxufTtcbiIsIi8qIVxuICogSWRlYWwgU3RlcHNcbiovXG4oZnVuY3Rpb24oJCwgd2luLCBkb2MsIHVuZGVmaW5lZCkge1xuXG4gIHZhciBwbHVnaW4gPSB7fTtcblxuICBwbHVnaW4ubmFtZSA9ICdpZGVhbHN0ZXBzJztcblxuICBwbHVnaW4uZGVmYXVsdHMgPSB7XG4gICAgbmF2OiAnLmlkZWFsc3RlcHMtbmF2JyxcbiAgICBuYXZJdGVtczogJ2xpJyxcbiAgICBidWlsZE5hdkl0ZW1zOiB0cnVlLFxuICAgIHdyYXA6ICcuaWRlYWxzdGVwcy13cmFwJyxcbiAgICBzdGVwOiAnLmlkZWFsc3RlcHMtc3RlcCcsXG4gICAgYWN0aXZlQ2xhc3M6ICdpZGVhbHN0ZXBzLXN0ZXAtYWN0aXZlJyxcbiAgICBiZWZvcmU6IG51bGwsXG4gICAgYWZ0ZXI6IG51bGwsXG4gICAgZmFkZVNwZWVkOiAwXG4gIH07XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSB7XG5cbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBhY3RpdmUgPSB0aGlzLm9wdHMuYWN0aXZlQ2xhc3M7XG5cbiAgICAgIHRoaXMuJGVsID0gJCh0aGlzLmVsKTtcblxuICAgICAgdGhpcy4kbmF2ID0gdGhpcy4kZWwuZmluZCh0aGlzLm9wdHMubmF2KTtcbiAgICAgIHRoaXMuJG5hdkl0ZW1zID0gdGhpcy4kbmF2LmZpbmQodGhpcy5vcHRzLm5hdkl0ZW1zKTtcblxuICAgICAgdGhpcy4kd3JhcCA9IHRoaXMuJGVsLmZpbmQodGhpcy5vcHRzLndyYXApO1xuICAgICAgdGhpcy4kc3RlcHMgPSB0aGlzLiR3cmFwLmZpbmQodGhpcy5vcHRzLnN0ZXApO1xuXG4gICAgICBpZiAodGhpcy5vcHRzLmJ1aWxkTmF2SXRlbXMpIHRoaXMuX2J1aWxkTmF2SXRlbXMoKTtcblxuICAgICAgdGhpcy4kc3RlcHMuaGlkZSgpLmZpcnN0KCkuc2hvdygpO1xuICAgICAgdGhpcy4kbmF2SXRlbXMucmVtb3ZlQ2xhc3MoYWN0aXZlKS5maXJzdCgpLmFkZENsYXNzKGFjdGl2ZSk7XG5cbiAgICAgIHRoaXMuJG5hdkl0ZW1zLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzZWxmLmdvKHNlbGYuJG5hdkl0ZW1zLmluZGV4KHRoaXMpKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfYnVpbGROYXZJdGVtczogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBpc0N1c3RvbSA9IHR5cGVvZiB0aGlzLm9wdHMuYnVpbGROYXZJdGVtcyA9PSAnZnVuY3Rpb24nLFxuICAgICAgICAgIGl0ZW0gPSBmdW5jdGlvbih2YWwpeyByZXR1cm4gJzxsaT48YSBocmVmPVwiI1wiIHRhYmluZGV4PVwiLTFcIj4nKyB2YWwgKyc8L2E+PC9saT4nOyB9LFxuICAgICAgICAgIGl0ZW1zO1xuXG4gICAgICBpdGVtcyA9IGlzQ3VzdG9tID9cbiAgICAgICAgdGhpcy4kc3RlcHMubWFwKGZ1bmN0aW9uKGkpeyByZXR1cm4gaXRlbShzZWxmLm9wdHMuYnVpbGROYXZJdGVtcy5jYWxsKHNlbGYsIGkpKSB9KS5nZXQoKSA6XG4gICAgICAgIHRoaXMuJHN0ZXBzLm1hcChmdW5jdGlvbihpKXsgcmV0dXJuIGl0ZW0oKytpKTsgfSkuZ2V0KCk7XG5cbiAgICAgIHRoaXMuJG5hdkl0ZW1zID0gJChpdGVtcy5qb2luKCcnKSk7XG5cbiAgICAgIHRoaXMuJG5hdi5hcHBlbmQoJCgnPHVsLz4nKS5hcHBlbmQodGhpcy4kbmF2SXRlbXMpKTtcbiAgICB9LFxuXG4gICAgX2dldEN1cklkeDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy4kc3RlcHMuaW5kZXgodGhpcy4kc3RlcHMuZmlsdGVyKCc6dmlzaWJsZScpKTtcbiAgICB9LFxuXG4gICAgZ286IGZ1bmN0aW9uKGlkeCkge1xuXG4gICAgICB2YXIgYWN0aXZlID0gdGhpcy5vcHRzLmFjdGl2ZUNsYXNzLFxuICAgICAgICAgIGZhZGVTcGVlZCA9IHRoaXMub3B0cy5mYWRlU3BlZWQ7XG5cbiAgICAgIGlmICh0eXBlb2YgaWR4ID09ICdmdW5jdGlvbicpIGlkeCA9IGlkeC5jYWxsKHRoaXMsIHRoaXMuX2dldEN1cklkeCgpKTtcblxuICAgICAgaWYgKGlkeCA+PSB0aGlzLiRzdGVwcy5sZW5ndGgpIGlkeCA9IDA7XG4gICAgICBpZiAoaWR4IDwgMCkgaWR4ID0gdGhpcy4kc3RlcHMubGVuZ3RoLTE7XG5cbiAgICAgIGlmICh0aGlzLm9wdHMuYmVmb3JlKSB0aGlzLm9wdHMuYmVmb3JlLmNhbGwodGhpcywgaWR4KTtcblxuICAgICAgdGhpcy4kbmF2SXRlbXMucmVtb3ZlQ2xhc3MoYWN0aXZlKS5lcShpZHgpLmFkZENsYXNzKGFjdGl2ZSk7XG4gICAgICB0aGlzLiRzdGVwcy5mYWRlT3V0KGZhZGVTcGVlZCkuZXEoaWR4KS5mYWRlSW4oZmFkZVNwZWVkKTtcblxuICAgICAgaWYgKHRoaXMub3B0cy5hZnRlcikgdGhpcy5vcHRzLmFmdGVyLmNhbGwodGhpcywgaWR4KTtcbiAgICB9LFxuXG4gICAgcHJldjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKHRoaXMuX2dldEN1cklkeCgpIC0gMSk7XG4gICAgfSxcblxuICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbyh0aGlzLl9nZXRDdXJJZHgoKSArIDEpO1xuICAgIH0sXG5cbiAgICBmaXJzdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKDApO1xuICAgIH0sXG5cbiAgICBsYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28odGhpcy4kc3RlcHMubGVuZ3RoLTEpO1xuICAgIH1cbiAgfTtcblxuICByZXF1aXJlKCcuLi8uLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIiwicmVxdWlyZSgnLi9pZGVhbHN0ZXBzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdzdGVwcycsXG5cbiAgb3B0aW9uczoge1xuICAgIHN0ZXBzOiB7XG4gICAgICBjb250YWluZXI6ICcuaWRlYWxzdGVwcy1jb250YWluZXInLFxuICAgICAgbmF2OiAnLmlkZWFsc3RlcHMtbmF2JyxcbiAgICAgIG5hdkl0ZW1zOiAnbGknLFxuICAgICAgYnVpbGROYXZJdGVtczogdHJ1ZSxcbiAgICAgIHdyYXA6ICcuaWRlYWxzdGVwcy13cmFwJyxcbiAgICAgIHN0ZXA6ICcuaWRlYWxzdGVwcy1zdGVwJyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAnaWRlYWxzdGVwcy1zdGVwLWFjdGl2ZScsXG4gICAgICBiZWZvcmU6IG51bGwsXG4gICAgICBhZnRlcjogbnVsbCxcbiAgICAgIGZhZGVTcGVlZDogMFxuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGRTdGVwcygpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX3ZhbGlkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuXG4gICAgICBpZiAodGhpcy5faGFzRXh0ZW5zaW9uKCdhamF4JykpIHtcbiAgICAgICAgJC5lYWNoKCQuaWRlYWxmb3Jtcy5fcmVxdWVzdHMsIGZ1bmN0aW9uKGtleSwgcmVxdWVzdCkge1xuICAgICAgICAgIHJlcXVlc3QuZG9uZShmdW5jdGlvbigpeyBzZWxmLl91cGRhdGVTdGVwcygpIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIGZvY3VzRmlyc3RJbnZhbGlkOiBmdW5jdGlvbihmaXJzdEludmFsaWQpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdnbycsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kc3RlcHMuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkKHRoaXMpLmZpbmQoZmlyc3RJbnZhbGlkKS5sZW5ndGg7XG4gICAgICAgIH0pLmluZGV4KCk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2J1aWxkU3RlcHM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIG9wdGlvbnNcbiAgICAgICAgLCBoYXNSdWxlcyA9ICEgJC5pc0VtcHR5T2JqZWN0KHRoaXMub3B0cy5ydWxlcylcbiAgICAgICAgLCBjb3VudGVyID0gaGFzUnVsZXNcbiAgICAgICAgICA/ICc8c3BhbiBjbGFzcz1cImNvdW50ZXJcIi8+J1xuICAgICAgICAgIDogJzxzcGFuIGNsYXNzPVwiY291bnRlciB6ZXJvXCI+MDwvc3Bhbj4nO1xuXG4gICAgICBpZiAodGhpcy5vcHRzLnN0ZXBzLmJ1aWxkTmF2SXRlbXMgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5vcHRzLnN0ZXBzLmJ1aWxkTmF2SXRlbXMgPSBmdW5jdGlvbihpKSB7XG4gICAgICAgICAgcmV0dXJuICdTdGVwICcrIChpKzEpICsgY291bnRlcjtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIgPSB0aGlzLiRmb3JtXG4gICAgICAgIC5jbG9zZXN0KHRoaXMub3B0cy5zdGVwcy5jb250YWluZXIpXG4gICAgICAgIC5pZGVhbHN0ZXBzKHRoaXMub3B0cy5zdGVwcyk7XG4gICAgfSxcblxuICAgIF91cGRhdGVTdGVwczogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnX2luamVjdCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBpZGVhbHN0ZXBzID0gdGhpcztcblxuICAgICAgICB0aGlzLiRuYXZJdGVtcy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICB2YXIgaW52YWxpZCA9IGlkZWFsc3RlcHMuJHN0ZXBzLmVxKGkpLmZpbmQoc2VsZi5nZXRJbnZhbGlkKCkpLmxlbmd0aDtcbiAgICAgICAgICAkKHRoaXMpLmZpbmQoJ3NwYW4nKS50ZXh0KGludmFsaWQpLnRvZ2dsZUNsYXNzKCd6ZXJvJywgISBpbnZhbGlkKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIGFkZFJ1bGVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZmlyc3RTdGVwKCk7XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICBhZGRGaWVsZHM6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICBmaWVsZC5hZnRlciA9IHRoaXMuJHN0ZXBzQ29udGFpbmVyXG4gICAgICAgIC5maW5kKHRoaXMub3B0cy5zdGVwcy5zdGVwKVxuICAgICAgICAuZXEoZmllbGQuYXBwZW5kVG9TdGVwKVxuICAgICAgICAuZmluZCgnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QnKVxuICAgICAgICAubGFzdCgpWzBdLm5hbWU7XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICB0b2dnbGVGaWVsZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fdXBkYXRlU3RlcHMoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIHJlbW92ZUZpZWxkczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuICAgIH0sXG5cbiAgICBnb1RvU3RlcDogZnVuY3Rpb24oaWR4KSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdnbycsIGlkeCk7XG4gICAgfSxcblxuICAgIHByZXZTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ3ByZXYnKTtcbiAgICB9LFxuXG4gICAgbmV4dFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnbmV4dCcpO1xuICAgIH0sXG5cbiAgICBmaXJzdFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnZmlyc3QnKTtcbiAgICB9LFxuXG4gICAgbGFzdFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnbGFzdCcpO1xuICAgIH1cbiAgfVxuXG59O1xuIiwiLyohXG4gKiBqUXVlcnkgSWRlYWwgRm9ybXNcbiAqIEBhdXRob3I6IENlZHJpYyBSdWl6XG4gKiBAdmVyc2lvbjogMy4wXG4gKiBAbGljZW5zZSBHUEwgb3IgTUlUXG4gKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsZm9ybXMnO1xuXG4gIHBsdWdpbi5kZWZhdWx0cyA9IHtcbiAgICBmaWVsZDogJy5maWVsZCcsXG4gICAgZXJyb3I6ICcuZXJyb3InLFxuICAgIGljb25IdG1sOiAnPGkvPicsXG4gICAgaWNvbkNsYXNzOiAnaWNvbicsXG4gICAgaW52YWxpZENsYXNzOiAnaW52YWxpZCcsXG4gICAgdmFsaWRDbGFzczogJ3ZhbGlkJyxcbiAgICBzaWxlbnRMb2FkOiB0cnVlLFxuICAgIG9uVmFsaWRhdGU6ICQubm9vcCxcbiAgICBvblN1Ym1pdDogJC5ub29wXG4gIH07XG5cbiAgcGx1Z2luLmdsb2JhbCA9IHtcblxuICAgIF9mb3JtYXQ6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xceyhcXGQpXFx9L2csIGZ1bmN0aW9uKF8sIG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBhcmdzWyttYXRjaF0gfHwgJyc7XG4gICAgICB9KS5yZXBsYWNlKC9cXHtcXCooW14qfV0qKVxcfS9nLCBmdW5jdGlvbihfLCBzZXApIHtcbiAgICAgICAgcmV0dXJuIGFyZ3Muam9pbihzZXAgfHwgJywgJyk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2dldEtleTogZnVuY3Rpb24oa2V5LCBvYmopIHtcbiAgICAgIHJldHVybiBrZXkuc3BsaXQoJy4nKS5yZWR1Y2UoZnVuY3Rpb24oYSxiKSB7XG4gICAgICAgIHJldHVybiBhICYmIGFbYl07XG4gICAgICB9LCBvYmopO1xuICAgIH0sXG5cbiAgICBydWxlU2VwYXJhdG9yOiAnICcsXG4gICAgYXJnU2VwYXJhdG9yOiAnOicsXG5cbiAgICBydWxlczogcmVxdWlyZSgnLi9ydWxlcycpLFxuICAgIGVycm9yczogcmVxdWlyZSgnLi9lcnJvcnMnKSxcblxuICAgIGV4dGVuc2lvbnM6IFtcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9keW5hbWljLWZpZWxkcy9keW5hbWljLWZpZWxkcy5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9hamF4L2FqYXguZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvc3RlcHMvc3RlcHMuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvY3VzdG9tLWlucHV0cy9jdXN0b20taW5wdXRzLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9hZGFwdGl2ZS9hZGFwdGl2ZS5leHQnKVxuICAgIF1cbiAgfTtcblxuICBwbHVnaW4ubWV0aG9kcyA9ICQuZXh0ZW5kKHt9LCByZXF1aXJlKCcuL3ByaXZhdGUnKSwgcmVxdWlyZSgnLi9wdWJsaWMnKSk7XG5cbiAgcmVxdWlyZSgnLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIiwiLyoqXG4gKiBQbHVnaW4gYm9pbGVycGxhdGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEFQID0gQXJyYXkucHJvdG90eXBlO1xuXG4gIHJldHVybiBmdW5jdGlvbihwbHVnaW4pIHtcblxuICAgIHBsdWdpbiA9ICQuZXh0ZW5kKHRydWUsIHtcbiAgICAgIG5hbWU6ICdwbHVnaW4nLFxuICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgZGlzYWJsZWRFeHRlbnNpb25zOiAnbm9uZSdcbiAgICAgIH0sXG4gICAgICBtZXRob2RzOiB7fSxcbiAgICAgIGdsb2JhbDoge30sXG4gICAgfSwgcGx1Z2luKTtcblxuICAgICRbcGx1Z2luLm5hbWVdID0gJC5leHRlbmQoe1xuXG4gICAgICBhZGRFeHRlbnNpb246IGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuICAgICAgICBwbHVnaW4uZ2xvYmFsLmV4dGVuc2lvbnMucHVzaChleHRlbnNpb24pO1xuICAgICAgfVxuICAgIH0sIHBsdWdpbi5nbG9iYWwpO1xuXG4gICAgZnVuY3Rpb24gUGx1Z2luKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQoe30sIHBsdWdpbi5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICB0aGlzLmVsID0gZWxlbWVudDtcblxuICAgICAgdGhpcy5fbmFtZSA9IHBsdWdpbi5uYW1lO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgfVxuXG4gICAgUGx1Z2luLl9leHRlbmRlZCA9IHt9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5faGFzRXh0ZW5zaW9uID0gZnVuY3Rpb24oZXh0ZW5zaW9uKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgcmV0dXJuIHBsdWdpbi5nbG9iYWwuZXh0ZW5zaW9ucy5maWx0ZXIoZnVuY3Rpb24oZXh0KSB7XG4gICAgICAgIHJldHVybiBleHQubmFtZSA9PSBleHRlbnNpb24gJiYgc2VsZi5vcHRzLmRpc2FibGVkRXh0ZW5zaW9ucy5pbmRleE9mKGV4dC5uYW1lKSA8IDA7XG4gICAgICB9KS5sZW5ndGg7XG4gICAgfTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2V4dGVuZCA9IGZ1bmN0aW9uKGV4dGVuc2lvbnMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2goZXh0ZW5zaW9ucywgZnVuY3Rpb24oaSwgZXh0ZW5zaW9uKSB7XG5cbiAgICAgICAgJC5leHRlbmQoc2VsZi5vcHRzLCAkLmV4dGVuZCh0cnVlLCBleHRlbnNpb24ub3B0aW9ucywgc2VsZi5vcHRzKSk7XG5cbiAgICAgICAgJC5lYWNoKGV4dGVuc2lvbi5tZXRob2RzLCBmdW5jdGlvbihtZXRob2QsIGZuKSB7XG5cbiAgICAgICAgICBpZiAoc2VsZi5vcHRzLmRpc2FibGVkRXh0ZW5zaW9ucy5pbmRleE9mKGV4dGVuc2lvbi5uYW1lKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFBsdWdpbi5wcm90b3R5cGVbbWV0aG9kXSkge1xuICAgICAgICAgICAgUGx1Z2luLl9leHRlbmRlZFttZXRob2RdID0gUGx1Z2luLl9leHRlbmRlZFttZXRob2RdIHx8IFtdO1xuICAgICAgICAgICAgUGx1Z2luLl9leHRlbmRlZFttZXRob2RdLnB1c2goeyBuYW1lOiBleHRlbnNpb24ubmFtZSwgZm46IGZuIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQbHVnaW4ucHJvdG90eXBlW21ldGhvZF0gPSBmbjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5faW5qZWN0ID0gZnVuY3Rpb24obWV0aG9kKSB7XG5cbiAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PSAnZnVuY3Rpb24nKSByZXR1cm4gbWV0aG9kLmNhbGwodGhpcyk7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSkge1xuICAgICAgICAkLmVhY2goUGx1Z2luLl9leHRlbmRlZFttZXRob2RdLCBmdW5jdGlvbihpLCBwbHVnaW4pIHtcbiAgICAgICAgICBwbHVnaW4uZm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlLl9pbml0ID0gJC5ub29wO1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZVtwbHVnaW4ubmFtZV0gPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIGlmICghbWV0aG9kKSByZXR1cm4gdGhpcztcbiAgICAgIHRyeSB7IHJldHVybiB0aGlzW21ldGhvZF0uYXBwbHkodGhpcywgQVAuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTsgfVxuICAgICAgY2F0Y2goZSkge31cbiAgICB9O1xuXG4gICAgJC5leHRlbmQoUGx1Z2luLnByb3RvdHlwZSwgcGx1Z2luLm1ldGhvZHMpO1xuXG4gICAgJC5mbltwbHVnaW4ubmFtZV0gPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIGFyZ3MgPSBBUC5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgICAgLCBtZXRob2RBcnJheSA9IHR5cGVvZiBhcmdzWzBdID09ICdzdHJpbmcnICYmIGFyZ3NbMF0uc3BsaXQoJzonKVxuICAgICAgICAsIG1ldGhvZCA9IG1ldGhvZEFycmF5W21ldGhvZEFycmF5Lmxlbmd0aCA+IDEgPyAxIDogMF1cbiAgICAgICAgLCBwcmVmaXggPSBtZXRob2RBcnJheS5sZW5ndGggPiAxICYmIG1ldGhvZEFycmF5WzBdXG4gICAgICAgICwgb3B0cyA9IHR5cGVvZiBhcmdzWzBdID09ICdvYmplY3QnICYmIGFyZ3NbMF1cbiAgICAgICAgLCBwYXJhbXMgPSBhcmdzLnNsaWNlKDEpXG4gICAgICAgICwgcmV0O1xuXG4gICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgIG1ldGhvZCA9IHByZWZpeCArIG1ldGhvZC5zdWJzdHIoMCwxKS50b1VwcGVyQ2FzZSgpICsgbWV0aG9kLnN1YnN0cigxLG1ldGhvZC5sZW5ndGgtMSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgaW5zdGFuY2UgPSAkLmRhdGEodGhpcywgcGx1Z2luLm5hbWUpO1xuXG4gICAgICAgIC8vIE1ldGhvZFxuICAgICAgICBpZiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICByZXR1cm4gcmV0ID0gaW5zdGFuY2VbcGx1Z2luLm5hbWVdLmFwcGx5KGluc3RhbmNlLCBbbWV0aG9kXS5jb25jYXQocGFyYW1zKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbml0XG4gICAgICAgIHJldHVybiAkLmRhdGEodGhpcywgcGx1Z2luLm5hbWUsIG5ldyBQbHVnaW4odGhpcywgb3B0cykpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBwcmVmaXggPyByZXQgOiB0aGlzO1xuICAgIH07XG4gIH07XG5cbn0oKSk7XG4iLCIvKipcbiAqIFByaXZhdGUgbWV0aG9kc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9leHRlbmQoJC5pZGVhbGZvcm1zLmV4dGVuc2lvbnMpO1xuXG4gICAgdGhpcy4kZm9ybSA9ICQodGhpcy5lbCk7XG4gICAgdGhpcy4kZmllbGRzID0gJCgpO1xuICAgIHRoaXMuJGlucHV0cyA9ICQoKTtcblxuICAgIHRoaXMuJGZvcm0uc3VibWl0KGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNlbGYuZm9jdXNGaXJzdEludmFsaWQoKTtcbiAgICAgIHNlbGYub3B0cy5vblN1Ym1pdC5jYWxsKHRoaXMsIHNlbGYuZ2V0SW52YWxpZCgpLmxlbmd0aCwgZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ19pbml0Jyk7XG5cbiAgICB0aGlzLmFkZFJ1bGVzKHRoaXMub3B0cy5ydWxlcyB8fCB7fSk7XG5cbiAgICBpZiAoISB0aGlzLm9wdHMuc2lsZW50TG9hZCkgdGhpcy5mb2N1c0ZpcnN0SW52YWxpZCgpO1xuICB9LFxuXG4gIF9idWlsZEZpZWxkOiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLCAkaWNvbjtcblxuICAgICRpY29uID0gJCh0aGlzLm9wdHMuaWNvbkh0bWwsIHtcbiAgICAgIGNsYXNzOiB0aGlzLm9wdHMuaWNvbkNsYXNzLFxuICAgICAgY2xpY2s6IGZ1bmN0aW9uKCl7ICQoaW5wdXQpLmZvY3VzKCkgfVxuICAgIH0pO1xuXG4gICAgaWYgKCEgdGhpcy4kZmllbGRzLmZpbHRlcigkZmllbGQpLmxlbmd0aCkge1xuICAgICAgdGhpcy4kZmllbGRzID0gdGhpcy4kZmllbGRzLmFkZCgkZmllbGQpO1xuICAgICAgaWYgKHRoaXMub3B0cy5pY29uSHRtbCkgJGZpZWxkLmFwcGVuZCgkaWNvbik7XG4gICAgICAkZmllbGQuYWRkQ2xhc3MoJ2lkZWFsZm9ybXMtZmllbGQgaWRlYWxmb3Jtcy1maWVsZC0nKyBpbnB1dC50eXBlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hZGRFdmVudHMoaW5wdXQpO1xuXG4gICAgdGhpcy5faW5qZWN0KCdfYnVpbGRGaWVsZCcsIGlucHV0KTtcbiAgfSxcblxuICBfYWRkRXZlbnRzOiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KTtcblxuICAgICQoaW5wdXQpXG4gICAgICAub24oJ2NoYW5nZSBrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICB2YXIgb2xkVmFsdWUgPSAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWx1ZScpO1xuXG4gICAgICAgIGlmIChlLndoaWNoID09IDkgfHwgZS53aGljaCA9PSAxNikgcmV0dXJuO1xuICAgICAgICBpZiAoISAkKHRoaXMpLmlzKCc6Y2hlY2tib3gsIDpyYWRpbycpICYmIG9sZFZhbHVlID09IHRoaXMudmFsdWUpIHJldHVybjtcblxuICAgICAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWx1ZScsIHRoaXMudmFsdWUpO1xuXG4gICAgICAgIHNlbGYuX3ZhbGlkYXRlKHRoaXMsIHRydWUsIHRydWUpO1xuICAgICAgfSlcbiAgICAgIC5mb2N1cyhmdW5jdGlvbigpIHtcblxuICAgICAgICBpZiAoc2VsZi5pc1ZhbGlkKHRoaXMubmFtZSkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBpZiAoc2VsZi5faXNSZXF1aXJlZCh0aGlzKSB8fCB0aGlzLnZhbHVlKSB7XG4gICAgICAgICAgJGZpZWxkLmZpbmQoc2VsZi5vcHRzLmVycm9yKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuYmx1cihmdW5jdGlvbigpIHtcbiAgICAgICAgJGZpZWxkLmZpbmQoc2VsZi5vcHRzLmVycm9yKS5oaWRlKCk7XG4gICAgICB9KTtcbiAgfSxcblxuICBfaXNSZXF1aXJlZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAvLyBXZSBhc3N1bWUgbm9uLXRleHQgaW5wdXRzIHdpdGggcnVsZXMgYXJlIHJlcXVpcmVkXG4gICAgaWYgKCQoaW5wdXQpLmlzKCc6Y2hlY2tib3gsIDpyYWRpbywgc2VsZWN0JykpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiB0aGlzLm9wdHMucnVsZXNbaW5wdXQubmFtZV0uaW5kZXhPZigncmVxdWlyZWQnKSA+IC0xO1xuICB9LFxuXG4gIF9nZXRSZWxhdGVkOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRGaWVsZChpbnB1dCkuZmluZCgnW25hbWU9XCInKyBpbnB1dC5uYW1lICsnXCJdJyk7XG4gIH0sXG5cbiAgX2dldEZpZWxkOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHJldHVybiAkKGlucHV0KS5jbG9zZXN0KHRoaXMub3B0cy5maWVsZCk7XG4gIH0sXG5cbiAgX2dldEZpcnN0SW52YWxpZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW52YWxpZCgpLmZpcnN0KCkuZmluZCgnaW5wdXQ6Zmlyc3QsIHRleHRhcmVhLCBzZWxlY3QnKTtcbiAgfSxcblxuICBfaGFuZGxlRXJyb3I6IGZ1bmN0aW9uKGlucHV0LCBlcnJvciwgdmFsaWQpIHtcbiAgICB2YWxpZCA9IHZhbGlkIHx8IHRoaXMuaXNWYWxpZChpbnB1dC5uYW1lKTtcbiAgICB2YXIgJGVycm9yID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpLmZpbmQodGhpcy5vcHRzLmVycm9yKTtcbiAgICB0aGlzLiRmb3JtLmZpbmQodGhpcy5vcHRzLmVycm9yKS5oaWRlKCk7XG4gICAgaWYgKGVycm9yKSAkZXJyb3IudGV4dChlcnJvcik7XG4gICAgJGVycm9yLnRvZ2dsZSghdmFsaWQpO1xuICB9LFxuXG4gIF9oYW5kbGVTdHlsZTogZnVuY3Rpb24oaW5wdXQsIHZhbGlkKSB7XG4gICAgdmFsaWQgPSB2YWxpZCB8fCB0aGlzLmlzVmFsaWQoaW5wdXQubmFtZSk7XG4gICAgdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRzLnZhbGlkQ2xhc3MgKycgJysgdGhpcy5vcHRzLmludmFsaWRDbGFzcylcbiAgICAgIC5hZGRDbGFzcyh2YWxpZCA/IHRoaXMub3B0cy52YWxpZENsYXNzIDogdGhpcy5vcHRzLmludmFsaWRDbGFzcylcbiAgICAgIC5maW5kKCcuJysgdGhpcy5vcHRzLmljb25DbGFzcykuc2hvdygpO1xuICB9LFxuXG4gIF9mcmVzaDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLm9wdHMudmFsaWRDbGFzcyArJyAnKyB0aGlzLm9wdHMuaW52YWxpZENsYXNzKVxuICAgICAgLmZpbmQodGhpcy5vcHRzLmVycm9yKS5oaWRlKClcbiAgICAgIC5lbmQoKVxuICAgICAgLmZpbmQoJy4nKyB0aGlzLm9wdHMuaWNvbkNsYXNzKS50b2dnbGUodGhpcy5faXNSZXF1aXJlZChpbnB1dCkpO1xuICB9LFxuXG4gIF92YWxpZGF0ZTogZnVuY3Rpb24oaW5wdXQsIGhhbmRsZUVycm9yLCBoYW5kbGVTdHlsZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLCB1c2VyUnVsZXMgPSB0aGlzLm9wdHMucnVsZXNbaW5wdXQubmFtZV0uc3BsaXQoJC5pZGVhbGZvcm1zLnJ1bGVTZXBhcmF0b3IpXG4gICAgICAsIHZhbGlkID0gdHJ1ZVxuICAgICAgLCBydWxlO1xuXG4gICAgLy8gTm9uLXJlcXVpcmVkIGlucHV0IHdpdGggZW1wdHkgdmFsdWUgbXVzdCBwYXNzIHZhbGlkYXRpb25cbiAgICBpZiAoISBpbnB1dC52YWx1ZSAmJiAhIHRoaXMuX2lzUmVxdWlyZWQoaW5wdXQpKSB7XG4gICAgICAkZmllbGQucmVtb3ZlRGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcpO1xuICAgICAgdGhpcy5fZnJlc2goaW5wdXQpO1xuXG4gICAgLy8gUmVxdWlyZWQgaW5wdXRzXG4gICAgfSBlbHNlIHtcblxuICAgICAgJC5lYWNoKHVzZXJSdWxlcywgZnVuY3Rpb24oaSwgdXNlclJ1bGUpIHtcblxuICAgICAgICB1c2VyUnVsZSA9IHVzZXJSdWxlLnNwbGl0KCQuaWRlYWxmb3Jtcy5hcmdTZXBhcmF0b3IpO1xuXG4gICAgICAgIHJ1bGUgPSB1c2VyUnVsZVswXTtcblxuICAgICAgICB2YXIgdGhlUnVsZSA9ICQuaWRlYWxmb3Jtcy5ydWxlc1tydWxlXVxuICAgICAgICAgICwgYXJncyA9IHVzZXJSdWxlLnNsaWNlKDEpXG4gICAgICAgICAgLCBlcnJvcjtcblxuICAgICAgICBlcnJvciA9ICQuaWRlYWxmb3Jtcy5fZm9ybWF0LmFwcGx5KG51bGwsIFtcbiAgICAgICAgICAkLmlkZWFsZm9ybXMuX2dldEtleSgnZXJyb3JzLicrIGlucHV0Lm5hbWUgKycuJysgcnVsZSwgc2VsZi5vcHRzKSB8fFxuICAgICAgICAgICQuaWRlYWxmb3Jtcy5lcnJvcnNbcnVsZV1cbiAgICAgICAgXS5jb25jYXQoYXJncykpO1xuXG4gICAgICAgIHZhbGlkID0gdHlwZW9mIHRoZVJ1bGUgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgID8gdGhlUnVsZS5hcHBseShzZWxmLCBbaW5wdXQsIGlucHV0LnZhbHVlXS5jb25jYXQoYXJncykpXG4gICAgICAgICAgOiB0aGVSdWxlLnRlc3QoaW5wdXQudmFsdWUpO1xuXG4gICAgICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJywgdmFsaWQpO1xuXG4gICAgICAgIGlmIChoYW5kbGVFcnJvcikgc2VsZi5faGFuZGxlRXJyb3IoaW5wdXQsIGVycm9yLCB2YWxpZCk7XG4gICAgICAgIGlmIChoYW5kbGVTdHlsZSkgc2VsZi5faGFuZGxlU3R5bGUoaW5wdXQsIHZhbGlkKTtcblxuICAgICAgICBzZWxmLm9wdHMub25WYWxpZGF0ZS5jYWxsKHNlbGYsIGlucHV0LCBydWxlLCB2YWxpZCk7XG5cbiAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5faW5qZWN0KCdfdmFsaWRhdGUnLCBpbnB1dCwgcnVsZSwgdmFsaWQpO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9XG5cbn07XG4iLCIvKipcbiAqIFB1YmxpYyBtZXRob2RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFkZFJ1bGVzOiBmdW5jdGlvbihydWxlcykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyICRpbnB1dHMgPSB0aGlzLiRmb3JtLmZpbmQoJC5tYXAocnVsZXMsIGZ1bmN0aW9uKF8sIG5hbWUpIHtcbiAgICAgIHJldHVybiAnW25hbWU9XCInKyBuYW1lICsnXCJdJztcbiAgICB9KS5qb2luKCcsJykpO1xuXG4gICAgJC5leHRlbmQodGhpcy5vcHRzLnJ1bGVzLCBydWxlcyk7XG5cbiAgICAkaW5wdXRzLmVhY2goZnVuY3Rpb24oKXsgc2VsZi5fYnVpbGRGaWVsZCh0aGlzKSB9KTtcblxuICAgIHRoaXMuJGlucHV0cyA9IHRoaXMuJGlucHV0c1xuICAgICAgLmFkZCgkaW5wdXRzKVxuICAgICAgLmVhY2goZnVuY3Rpb24oKXsgc2VsZi5fdmFsaWRhdGUodGhpcywgdHJ1ZSkgfSk7XG5cbiAgICB0aGlzLiRmaWVsZHMuZmluZCh0aGlzLm9wdHMuZXJyb3IpLmhpZGUoKTtcblxuICAgIHRoaXMuX2luamVjdCgnYWRkUnVsZXMnKTtcbiAgfSxcblxuICBnZXRJbnZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kZmllbGRzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkKHRoaXMpLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnKSA9PT0gZmFsc2U7XG4gICAgfSk7XG4gIH0sXG5cbiAgZm9jdXNGaXJzdEludmFsaWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGZpcnN0SW52YWxpZCA9IHRoaXMuX2dldEZpcnN0SW52YWxpZCgpWzBdO1xuXG4gICAgaWYgKGZpcnN0SW52YWxpZCkge1xuICAgICAgdGhpcy5faGFuZGxlRXJyb3IoZmlyc3RJbnZhbGlkKTtcbiAgICAgIHRoaXMuX2hhbmRsZVN0eWxlKGZpcnN0SW52YWxpZCk7XG4gICAgICB0aGlzLl9pbmplY3QoJ2ZvY3VzRmlyc3RJbnZhbGlkJywgZmlyc3RJbnZhbGlkKTtcbiAgICAgIGZpcnN0SW52YWxpZC5mb2N1cygpO1xuICAgIH1cbiAgfSxcblxuICBpc1ZhbGlkOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKG5hbWUpIHJldHVybiAhIHRoaXMuZ2V0SW52YWxpZCgpLmZpbmQoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpLmxlbmd0aDtcbiAgICByZXR1cm4gISB0aGlzLmdldEludmFsaWQoKS5sZW5ndGg7XG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uKG5hbWUpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkaW5wdXRzID0gdGhpcy4kaW5wdXRzO1xuXG4gICAgaWYgKG5hbWUpICRpbnB1dHMgPSAkaW5wdXRzLmZpbHRlcignW25hbWU9XCInKyBuYW1lICsnXCJdJyk7XG5cbiAgICAkaW5wdXRzLmZpbHRlcignaW5wdXQ6bm90KDpjaGVja2JveCwgOnJhZGlvKScpLnZhbCgnJyk7XG4gICAgJGlucHV0cy5maWx0ZXIoJzpjaGVja2JveCwgOnJhZGlvJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAkaW5wdXRzLmZpbHRlcignc2VsZWN0JykuZmluZCgnb3B0aW9uJykucHJvcCgnc2VsZWN0ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHRTZWxlY3RlZDtcbiAgICB9KTtcblxuICAgICRpbnB1dHMuY2hhbmdlKCkuZWFjaChmdW5jdGlvbigpeyBzZWxmLl9yZXNldEVycm9yQW5kU3R5bGUodGhpcykgfSk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ3Jlc2V0JywgbmFtZSk7XG4gIH1cblxufTtcbiIsIi8qKlxuICogUnVsZXNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgcmVxdWlyZWQ6IC8uKy8sXG4gIGRpZ2l0czogL15cXGQrJC8sXG4gIGVtYWlsOiAvXlteQF0rQFteQF0rXFwuLnsyLDZ9JC8sXG4gIHVzZXJuYW1lOiAvXlthLXpdKD89W1xcdy5dezMsMzF9JClcXHcqXFwuP1xcdyokL2ksXG4gIHBhc3M6IC8oPz0uKlxcZCkoPz0uKlthLXpdKSg/PS4qW0EtWl0pLns2LH0vLFxuICBzdHJvbmdwYXNzOiAvKD89Xi57OCx9JCkoKD89LipcXGQpfCg/PS4qXFxXKykpKD8hWy5cXG5dKSg/PS4qW0EtWl0pKD89LipbYS16XSkuKiQvLFxuICBwaG9uZTogL15bMi05XVxcZHsyfS1cXGR7M30tXFxkezR9JC8sXG4gIHppcDogL15cXGR7NX0kfF5cXGR7NX0tXFxkezR9JC8sXG4gIHVybDogL14oPzooZnRwfGh0dHB8aHR0cHMpOlxcL1xcLyk/KD86W1xcd1xcLV0rXFwuKStbYS16XXsyLDZ9KFtcXDpcXC8/I10uKik/JC9pLFxuXG4gIG51bWJlcjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlKSB7XG4gICAgcmV0dXJuICFpc05hTih2YWx1ZSk7XG4gIH0sXG5cbiAgcmFuZ2U6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWl4LCBtYXgpIHtcbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKSA+PSBtaW4gJiYgTnVtYmVyKHZhbHVlKSA8PSBtYXg7XG4gIH0sXG5cbiAgbWluOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1pbikge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPj0gbWluO1xuICB9LFxuXG4gIG1heDogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtYXgpIHtcbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoIDw9IG1heDtcbiAgfSxcblxuICBtaW5vcHRpb246IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWluKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFJlbGF0ZWQoaW5wdXQpLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGggPj0gbWluO1xuICB9LFxuXG4gIG1heG9wdGlvbjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtYXgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0UmVsYXRlZChpbnB1dCkuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCA8PSBtYXg7XG4gIH0sXG5cbiAgbWlubWF4OiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA+PSBtaW4gJiYgdmFsdWUubGVuZ3RoIDw9IG1heDtcbiAgfSxcblxuICBzZWxlY3Q6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgZGVmKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9IGRlZjtcbiAgfSxcblxuICBleHRlbnNpb246IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICB2YXIgZXh0ZW5zaW9ucyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICAgLCB2YWxpZCA9IGZhbHNlO1xuXG4gICAgJC5lYWNoKGlucHV0LmZpbGVzIHx8IFt7bmFtZTogaW5wdXQudmFsdWV9XSwgZnVuY3Rpb24oaSwgZmlsZSkge1xuICAgICAgdmFsaWQgPSAkLmluQXJyYXkoZmlsZS5uYW1lLm1hdGNoKC9cXC4oLispJC8pWzFdLCBleHRlbnNpb25zKSA+IC0xO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9LFxuXG4gIGVxdWFsdG86IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgdGFyZ2V0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJHRhcmdldCA9ICQoJ1tuYW1lPVwiJysgdGFyZ2V0ICsnXCJdJyk7XG5cbiAgICBpZiAodGhpcy5nZXRJbnZhbGlkKCkuZmluZCgkdGFyZ2V0KS5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAgICR0YXJnZXQub2ZmKCdrZXl1cC5lcXVhbHRvJykub24oJ2tleXVwLmVxdWFsdG8nLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuX3ZhbGlkYXRlKGlucHV0LCBmYWxzZSwgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW5wdXQudmFsdWUgPT0gJHRhcmdldC52YWwoKTtcbiAgfSxcblxuICBkYXRlOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIGZvcm1hdCkge1xuXG4gICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdtbS9kZC95eXl5JztcblxuICAgIHZhciBkZWxpbWl0ZXIgPSAvW15tZHldLy5leGVjKGZvcm1hdClbMF1cbiAgICAgICwgdGhlRm9ybWF0ID0gZm9ybWF0LnNwbGl0KGRlbGltaXRlcilcbiAgICAgICwgdGhlRGF0ZSA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICBmdW5jdGlvbiBpc0RhdGUoZGF0ZSwgZm9ybWF0KSB7XG5cbiAgICAgIHZhciBtLCBkLCB5O1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZm9ybWF0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICgvbS8udGVzdChmb3JtYXRbaV0pKSBtID0gZGF0ZVtpXTtcbiAgICAgICAgaWYgKC9kLy50ZXN0KGZvcm1hdFtpXSkpIGQgPSBkYXRlW2ldO1xuICAgICAgICBpZiAoL3kvLnRlc3QoZm9ybWF0W2ldKSkgeSA9IGRhdGVbaV07XG4gICAgICB9XG5cbiAgICAgIGlmICghbSB8fCAhZCB8fCAheSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gbSA+IDAgJiYgbSA8IDEzICYmXG4gICAgICAgIHkgJiYgeS5sZW5ndGggPT0gNCAmJlxuICAgICAgICBkID4gMCAmJiBkIDw9IChuZXcgRGF0ZSh5LCBtLCAwKSkuZ2V0RGF0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBpc0RhdGUodGhlRGF0ZSwgdGhlRm9ybWF0KTtcbiAgfVxuXG59O1xuIl19
;