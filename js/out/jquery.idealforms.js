(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

  methods: {

    // @extend
    _init: function () {

      var self = this;

      var $dummy = $('<p class="idealforms-field-width"/>').appendTo('body');

      this.opts.adaptiveWidth = $dummy.css('width').replace('px','');

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

      $dummy.remove();
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

      $.idealforms.errors.ajax = $.idealforms.errors.ajax || 'Loading...';

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

            self.opts.onValidate.call(self, input, 'ajax', resp);

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

  options: {
    customInputs: {
      i18n: {
        open: 'Open'
      }
    }
  },

  methods: {

    // @extend
    _init: function() {
      this._buildCustomInputs();
    },

    // @extend
    'addFields:after': function() {
      this._buildCustomInputs();
    },

    _buildCustomInputs: function() {
      this.$form.find(':file').idealfile(this.opts.customInputs.i18n);
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

  plugin.defaults = {
    open: 'Open'
  };

  plugin.methods = {

    _init: function() {

      var $file = $(this.el).addClass('ideal-file') // the original file input
        , $wrap = $('<div class="ideal-file-wrap">')
        , $input = $('<input type="text" class="ideal-file-filename" />')
          // Button that will be used in non-IE browsers
        , $button = $('<button type="button" class="ideal-file-upload">'+ this.opts.open +'</button>')
          // Hack for IE
        , $label = $('<label class="ideal-file-upload" for="' + $file[0].id + '">'+ this.opts.open +'</label>');

      if (isIE) $label.add($button).addClass('ie');

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

      file: '<input id="{name}" name="{name}" type="file" {attrs}>',

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

        self._inject('addFields:before', field);

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

        self._inject('addFields:after', field);
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
    before: $.noop,
    after: $.noop,
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
        if (! $(this).is('.'+ self.opts.activeClass)) {
          self.go(self.$navItems.index(this));
        }
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

      this.opts.before.call(this, idx);

      this.$navItems.removeClass(active).eq(idx).addClass(active);
      this.$steps.hide().eq(idx).fadeIn(fadeSpeed);

      this.opts.after.call(this, idx);
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
      buildNavItems: function(i) {
        return this.opts.steps.i18n.step +' '+ (i+1);
      },
      wrap: '.idealsteps-wrap',
      step: '.idealsteps-step',
      activeClass: 'idealsteps-step-active',
      before: $.noop,
      after: $.noop,
      fadeSpeed: 0,

      i18n: {
        step: 'Step'
      }
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

      setTimeout(function(){ $(firstInvalid).focus() }, this.opts.steps.fadeSpeed);
    },

    // @extend
    addRules: function() {
      this.firstStep();
    },

    // @extend
    'addFields:before': function(field) {

      if (field.after || field.before) return;

      var $steps = this.$stepsContainer.find(this.opts.steps.step);

      if (! ('appendToStep' in field)) {
        field.appendToStep = $steps.length-1;
      }

      field.after = $steps
        .eq(field.appendToStep)
        .find('input, select, textarea')
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

    _buildSteps: function() {

      var self = this, options
        , hasRules = ! $.isEmptyObject(this.opts.rules)
        , buildNavItems = this.opts.steps.buildNavItems
        , counter = hasRules
          ? '<span class="counter"/>'
          : '<span class="counter zero">0</span>';

      if (this.opts.steps.buildNavItems) {
        this.opts.steps.buildNavItems = function(i) {
          return buildNavItems.call(self, i) + counter;
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
    onSubmit: $.noop,
    rules: {},
    errors: {}
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

    i18n: {},

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

          if (Plugin.prototype[method.split(':')[0]]) {
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

    this.$form = $(this.el);
    this.$fields = $();
    this.$inputs = $();

    this._extend($.idealforms.extensions);
    this._i18n();

    this._inject('_init');

    this._addMarkupRules();
    this.addRules(this.opts.rules || {});

    this.$form.submit(function(e) {
      self._validateAll(true);
      self.focusFirstInvalid();
      self.opts.onSubmit.call(self, self.getInvalid().length, e);
    });

    if (! this.opts.silentLoad) {
      // 1ms timeout to make sure error shows up
      setTimeout($.proxy(this.focusFirstInvalid, this), 1);
    }
  },

  _addMarkupRules: function() {

    var rules = {};

    this.$form.find('input, select, textarea').each(function() {
      var rule = $(this).data('idealforms-rules');
      if (rule && ! rules[this.name]) rules[this.name] = rule;
    });

    this.addRules(rules);
  },

  _i18n: function() {

    var self = this;

    $.each($.idealforms.i18n, function(locale, lang) {

      var errors = lang.errors
        , options = {};

      delete lang.errors;

      for (var ext in lang) options[ext] = { i18n: lang[ext] };

      $.extend($.idealforms.errors, errors);
      $.extend(true, self.opts, options);
    });
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
        if (e.which == 9 || e.which == 16) return;
        self._validate(this, true, true);
      })
      .focus(function() {
        if (! self.isValid(this.name)) {
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
      , oldValue = $field.data('idealforms-value')
      , valid = true
      , rule;

    // Don't validate input if value hasn't changed
    if (! $(input).is(':checkbox, :radio') && oldValue == input.value) {
      return $field.data('idealforms-valid');
    }

    $field.data('idealforms-value', input.value);

    // Non-required input with empty value must pass validation
    if (! input.value && ! this._isRequired(input)) {
      $field.removeData('idealforms-valid');
      this._fresh(input);

    // Inputs with value or required
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
  },

  _validateAll: function(handleError, handleStyle) {
    var self = this;
    this.$inputs.each(function(){ self._validate(this, handleError, handleStyle); });
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
    this.$inputs = this.$inputs.add($inputs);

    this._validateAll(true);
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
      $(firstInvalid).focus();
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

    $inputs.filter('input:not(:checkbox, :radio), textarea').val('');
    $inputs.filter(':checkbox, :radio').prop('checked', false);
    $inputs.filter('select').find('option').prop('selected', function() {
      return this.defaultSelected;
    });

    $inputs.change().each(function(){ self._fresh(this) });

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

  range: function(input, value, min, max) {
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
      valid = $.inArray(file.name.split('.').pop().toLowerCase(), extensions) > -1;
    });

    return valid;
  },

  equalto: function(input, value, target) {

    var self = this
      , $target = $('[name="'+ target +'"]');

    if (this.getInvalid().find($target).length) return false;

    $target.off('keyup.equalto').on('keyup.equalto', function() {
      self._getField(input).removeData('idealforms-value');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZWxjbGFucnMvRG9jdW1lbnRzL2pxLWlkZWFsZm9ybXMvanMvZXJyb3JzLmpzIiwiL2hvbWUvZWxjbGFucnMvRG9jdW1lbnRzL2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9hZGFwdGl2ZS9hZGFwdGl2ZS5leHQuanMiLCIvaG9tZS9lbGNsYW5ycy9Eb2N1bWVudHMvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2FqYXgvYWpheC5leHQuanMiLCIvaG9tZS9lbGNsYW5ycy9Eb2N1bWVudHMvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvY3VzdG9tLWlucHV0cy5leHQuanMiLCIvaG9tZS9lbGNsYW5ycy9Eb2N1bWVudHMvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxmaWxlLmpzIiwiL2hvbWUvZWxjbGFucnMvRG9jdW1lbnRzL2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2lkZWFscmFkaW9jaGVjay5qcyIsIi9ob21lL2VsY2xhbnJzL0RvY3VtZW50cy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmV4dC5qcyIsIi9ob21lL2VsY2xhbnJzL0RvY3VtZW50cy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvZHluYW1pYy1maWVsZHMvZHluYW1pYy1maWVsZHMuZXh0LmpzIiwiL2hvbWUvZWxjbGFucnMvRG9jdW1lbnRzL2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9zdGVwcy9pZGVhbHN0ZXBzLmpzIiwiL2hvbWUvZWxjbGFucnMvRG9jdW1lbnRzL2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9zdGVwcy9zdGVwcy5leHQuanMiLCIvaG9tZS9lbGNsYW5ycy9Eb2N1bWVudHMvanEtaWRlYWxmb3Jtcy9qcy9tYWluLmpzIiwiL2hvbWUvZWxjbGFucnMvRG9jdW1lbnRzL2pxLWlkZWFsZm9ybXMvanMvcGx1Z2luLmpzIiwiL2hvbWUvZWxjbGFucnMvRG9jdW1lbnRzL2pxLWlkZWFsZm9ybXMvanMvcHJpdmF0ZS5qcyIsIi9ob21lL2VsY2xhbnJzL0RvY3VtZW50cy9qcS1pZGVhbGZvcm1zL2pzL3B1YmxpYy5qcyIsIi9ob21lL2VsY2xhbnJzL0RvY3VtZW50cy9qcS1pZGVhbGZvcm1zL2pzL3J1bGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEVycm9yc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICByZXF1aXJlZDogJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQnLFxuICBkaWdpdHM6ICdNdXN0IGJlIG9ubHkgZGlnaXRzJyxcbiAgbmFtZTogJ011c3QgYmUgYXQgbGVhc3QgMyBjaGFyYWN0ZXJzIGxvbmcgYW5kIG11c3Qgb25seSBjb250YWluIGxldHRlcnMnLFxuICBlbWFpbDogJ011c3QgYmUgYSB2YWxpZCBlbWFpbCcsXG4gIHVzZXJuYW1lOiAnTXVzdCBiZSBhdCBiZXR3ZWVuIDQgYW5kIDMyIGNoYXJhY3RlcnMgbG9uZyBhbmQgc3RhcnQgd2l0aCBhIGxldHRlci4gWW91IG1heSB1c2UgbGV0dGVycywgbnVtYmVycywgdW5kZXJzY29yZXMsIGFuZCBvbmUgZG90JyxcbiAgcGFzczogJ011c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzIGxvbmcsIGFuZCBjb250YWluIGF0IGxlYXN0IG9uZSBudW1iZXIsIG9uZSB1cHBlcmNhc2UgYW5kIG9uZSBsb3dlcmNhc2UgbGV0dGVyJyxcbiAgc3Ryb25ncGFzczogJ011c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmcgYW5kIGNvbnRhaW4gYXQgbGVhc3Qgb25lIHVwcGVyY2FzZSBhbmQgb25lIGxvd2VyY2FzZSBsZXR0ZXIgYW5kIG9uZSBudW1iZXIgb3Igc3BlY2lhbCBjaGFyYWN0ZXInLFxuICBwaG9uZTogJ011c3QgYmUgYSB2YWxpZCBwaG9uZSBudW1iZXInLFxuICB6aXA6ICdNdXN0IGJlIGEgdmFsaWQgemlwIGNvZGUnLFxuICB1cmw6ICdNdXN0IGJlIGEgdmFsaWQgVVJMJyxcbiAgbnVtYmVyOiAnTXVzdCBiZSBhIG51bWJlcicsXG4gIHJhbmdlOiAnTXVzdCBiZSBhIG51bWJlciBiZXR3ZWVuIHswfSBhbmQgezF9JyxcbiAgbWluOiAnTXVzdCBiZSBhdCBsZWFzdCB7MH0gY2hhcmFjdGVycyBsb25nJyxcbiAgbWF4OiAnTXVzdCBiZSB1bmRlciB7MH0gY2hhcmFjdGVycycsXG4gIG1pbm9wdGlvbjogJ1NlbGVjdCBhdCBsZWFzdCB7MH0gb3B0aW9ucycsXG4gIG1heG9wdGlvbjogJ1NlbGVjdCBubyBtb3JlIHRoYW4gezB9IG9wdGlvbnMnLFxuICBtaW5tYXg6ICdNdXN0IGJlIGJldHdlZW4gezB9IGFuZCB7MX0gY2hhcmFjdGVycyBsb25nJyxcbiAgc2VsZWN0OiAnU2VsZWN0IGFuIG9wdGlvbicsXG4gIGV4dGVuc2lvbjogJ0ZpbGUocykgbXVzdCBoYXZlIGEgdmFsaWQgZXh0ZW5zaW9uICh7Kn0pJyxcbiAgZXF1YWx0bzogJ011c3QgaGF2ZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgXCJ7MH1cIiBmaWVsZCcsXG4gIGRhdGU6ICdNdXN0IGJlIGEgdmFsaWQgZGF0ZSB7MH0nXG5cbn07XG4iLCIvKipcbiAqIEFkYXB0aXZlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdhZGFwdGl2ZScsXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyICRkdW1teSA9ICQoJzxwIGNsYXNzPVwiaWRlYWxmb3Jtcy1maWVsZC13aWR0aFwiLz4nKS5hcHBlbmRUbygnYm9keScpO1xuXG4gICAgICB0aGlzLm9wdHMuYWRhcHRpdmVXaWR0aCA9ICRkdW1teS5jc3MoJ3dpZHRoJykucmVwbGFjZSgncHgnLCcnKTtcblxuICAgICAgZnVuY3Rpb24gYWRhcHQoKSB7XG5cbiAgICAgICAgdmFyIGZvcm1XaWR0aCA9IHNlbGYuJGZvcm0ub3V0ZXJXaWR0aCgpXG4gICAgICAgICAgLCBpc0FkYXB0aXZlID0gc2VsZi5vcHRzLmFkYXB0aXZlV2lkdGggPiBmb3JtV2lkdGg7XG5cbiAgICAgICAgc2VsZi4kZm9ybS50b2dnbGVDbGFzcygnYWRhcHRpdmUnLCBpc0FkYXB0aXZlKTtcblxuICAgICAgICBpZiAoc2VsZi5faGFzRXh0ZW5zaW9uKCdzdGVwcycpKSB7XG4gICAgICAgICAgc2VsZi4kc3RlcHNDb250YWluZXIudG9nZ2xlQ2xhc3MoJ2FkYXB0aXZlJywgaXNBZGFwdGl2ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAkKCcjdWktZGF0ZXBpY2tlci1kaXYnKS5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgICQod2luZG93KS5yZXNpemUoYWRhcHQpO1xuICAgICAgYWRhcHQoKTtcblxuICAgICAgdGhpcy4kZm9ybS5maW5kKCdzZWxlY3QsIC5kYXRlcGlja2VyJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5fZ2V0RmllbGQodGhpcykuZmluZChzZWxmLm9wdHMuZXJyb3IpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgIH0pO1xuXG4gICAgICAkZHVtbXkucmVtb3ZlKCk7XG4gICAgfVxuXG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnYWpheCcsXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgJC5leHRlbmQoJC5pZGVhbGZvcm1zLCB7IF9yZXF1ZXN0czoge30gfSk7XG5cbiAgICAgICQuaWRlYWxmb3Jtcy5lcnJvcnMuYWpheCA9ICQuaWRlYWxmb3Jtcy5lcnJvcnMuYWpheCB8fCAnTG9hZGluZy4uLic7XG5cbiAgICAgICQuZXh0ZW5kKCQuaWRlYWxmb3Jtcy5ydWxlcywge1xuXG4gICAgICAgIGFqYXg6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAgICAgICAsIHVybCA9ICQoaW5wdXQpLmRhdGEoJ2lkZWFsZm9ybXMtYWpheCcpXG4gICAgICAgICAgICAsIHVzZXJFcnJvciA9ICQuaWRlYWxmb3Jtcy5fZ2V0S2V5KCdlcnJvcnMuJysgaW5wdXQubmFtZSArJy5hamF4RXJyb3InLCBzZWxmLm9wdHMpXG4gICAgICAgICAgICAsIHJlcXVlc3RzID0gJC5pZGVhbGZvcm1zLl9yZXF1ZXN0c1xuICAgICAgICAgICAgLCBkYXRhID0ge307XG5cbiAgICAgICAgICBkYXRhW2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XG5cbiAgICAgICAgICAkZmllbGQuYWRkQ2xhc3MoJ2FqYXgnKTtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0c1tpbnB1dC5uYW1lXSkgcmVxdWVzdHNbaW5wdXQubmFtZV0uYWJvcnQoKTtcblxuICAgICAgICAgIHJlcXVlc3RzW2lucHV0Lm5hbWVdID0gJC5wb3N0KHVybCwgZGF0YSwgZnVuY3Rpb24ocmVzcCkge1xuXG4gICAgICAgICAgICBpZiAocmVzcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcsIHRydWUpO1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCk7XG4gICAgICAgICAgICAgIHNlbGYuX2hhbmRsZVN0eWxlKGlucHV0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlbGYuX2hhbmRsZUVycm9yKGlucHV0LCB1c2VyRXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLm9wdHMub25WYWxpZGF0ZS5jYWxsKHNlbGYsIGlucHV0LCAnYWpheCcsIHJlc3ApO1xuXG4gICAgICAgICAgICAkZmllbGQucmVtb3ZlQ2xhc3MoJ2FqYXgnKTtcblxuICAgICAgICAgIH0sICdqc29uJyk7XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX3ZhbGlkYXRlOiBmdW5jdGlvbihpbnB1dCwgcnVsZSkge1xuICAgICAgaWYgKHJ1bGUgIT0gJ2FqYXgnICYmICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNbaW5wdXQubmFtZV0pIHtcbiAgICAgICAgJC5pZGVhbGZvcm1zLl9yZXF1ZXN0c1tpbnB1dC5uYW1lXS5hYm9ydCgpO1xuICAgICAgICB0aGlzLl9nZXRGaWVsZChpbnB1dCkucmVtb3ZlQ2xhc3MoJ2FqYXgnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxufTtcbiIsInJlcXVpcmUoJy4vaWRlYWxmaWxlJyk7XG5yZXF1aXJlKCcuL2lkZWFscmFkaW9jaGVjaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnY3VzdG9tSW5wdXRzJyxcblxuICBvcHRpb25zOiB7XG4gICAgY3VzdG9tSW5wdXRzOiB7XG4gICAgICBpMThuOiB7XG4gICAgICAgIG9wZW46ICdPcGVuJ1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGRDdXN0b21JbnB1dHMoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgICdhZGRGaWVsZHM6YWZ0ZXInOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkQ3VzdG9tSW5wdXRzKCk7XG4gICAgfSxcblxuICAgIF9idWlsZEN1c3RvbUlucHV0czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJzpmaWxlJykuaWRlYWxmaWxlKHRoaXMub3B0cy5jdXN0b21JbnB1dHMuaTE4bik7XG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJzpjaGVja2JveCwgOnJhZGlvJykuaWRlYWxyYWRpb2NoZWNrKCk7XG4gICAgfVxuXG4gIH1cbn07XG4iLCIvKipcbiAqIElkZWFsIEZpbGVcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICAvLyBCcm93c2VyIHN1cHBvcnRzIEhUTUw1IG11bHRpcGxlIGZpbGU/XG4gIHZhciBtdWx0aXBsZVN1cHBvcnQgPSB0eXBlb2YgJCgnPGlucHV0Lz4nKVswXS5tdWx0aXBsZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAsIGlzSUUgPSAvbXNpZS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICAsIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsZmlsZSc7XG5cbiAgcGx1Z2luLmRlZmF1bHRzID0ge1xuICAgIG9wZW46ICdPcGVuJ1xuICB9O1xuXG4gIHBsdWdpbi5tZXRob2RzID0ge1xuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgJGZpbGUgPSAkKHRoaXMuZWwpLmFkZENsYXNzKCdpZGVhbC1maWxlJykgLy8gdGhlIG9yaWdpbmFsIGZpbGUgaW5wdXRcbiAgICAgICAgLCAkd3JhcCA9ICQoJzxkaXYgY2xhc3M9XCJpZGVhbC1maWxlLXdyYXBcIj4nKVxuICAgICAgICAsICRpbnB1dCA9ICQoJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiaWRlYWwtZmlsZS1maWxlbmFtZVwiIC8+JylcbiAgICAgICAgICAvLyBCdXR0b24gdGhhdCB3aWxsIGJlIHVzZWQgaW4gbm9uLUlFIGJyb3dzZXJzXG4gICAgICAgICwgJGJ1dHRvbiA9ICQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiaWRlYWwtZmlsZS11cGxvYWRcIj4nKyB0aGlzLm9wdHMub3BlbiArJzwvYnV0dG9uPicpXG4gICAgICAgICAgLy8gSGFjayBmb3IgSUVcbiAgICAgICAgLCAkbGFiZWwgPSAkKCc8bGFiZWwgY2xhc3M9XCJpZGVhbC1maWxlLXVwbG9hZFwiIGZvcj1cIicgKyAkZmlsZVswXS5pZCArICdcIj4nKyB0aGlzLm9wdHMub3BlbiArJzwvbGFiZWw+Jyk7XG5cbiAgICAgIGlmIChpc0lFKSAkbGFiZWwuYWRkKCRidXR0b24pLmFkZENsYXNzKCdpZScpO1xuXG4gICAgICAvLyBIaWRlIGJ5IHNoaWZ0aW5nIHRvIHRoZSBsZWZ0IHNvIHdlXG4gICAgICAvLyBjYW4gc3RpbGwgdHJpZ2dlciBldmVudHNcbiAgICAgICRmaWxlLmNzcyh7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBsZWZ0OiAnLTk5OTlweCdcbiAgICAgIH0pO1xuXG4gICAgICAkd3JhcC5hcHBlbmQoJGlucHV0LCAoaXNJRSA/ICRsYWJlbCA6ICRidXR0b24pKS5pbnNlcnRBZnRlcigkZmlsZSk7XG5cbiAgICAgIC8vIFByZXZlbnQgZm9jdXNcbiAgICAgICRmaWxlLmF0dHIoJ3RhYkluZGV4JywgLTEpO1xuICAgICAgJGJ1dHRvbi5hdHRyKCd0YWJJbmRleCcsIC0xKTtcblxuICAgICAgJGJ1dHRvbi5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICRmaWxlLmZvY3VzKCkuY2xpY2soKTsgLy8gT3BlbiBkaWFsb2dcbiAgICAgIH0pO1xuXG4gICAgICAkZmlsZS5jaGFuZ2UoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBmaWxlcyA9IFtdXG4gICAgICAgICAgLCBmaWxlQXJyLCBmaWxlbmFtZTtcblxuICAgICAgICAgIC8vIElmIG11bHRpcGxlIGlzIHN1cHBvcnRlZCB0aGVuIGV4dHJhY3RcbiAgICAgICAgICAvLyBhbGwgZmlsZW5hbWVzIGZyb20gdGhlIGZpbGUgYXJyYXlcbiAgICAgICAgaWYgKG11bHRpcGxlU3VwcG9ydCkge1xuICAgICAgICAgIGZpbGVBcnIgPSAkZmlsZVswXS5maWxlcztcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZmlsZUFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgZmlsZXMucHVzaChmaWxlQXJyW2ldLm5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmaWxlbmFtZSA9IGZpbGVzLmpvaW4oJywgJyk7XG5cbiAgICAgICAgICAvLyBJZiBub3Qgc3VwcG9ydGVkIHRoZW4ganVzdCB0YWtlIHRoZSB2YWx1ZVxuICAgICAgICAgIC8vIGFuZCByZW1vdmUgdGhlIHBhdGggdG8ganVzdCBzaG93IHRoZSBmaWxlbmFtZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZpbGVuYW1lID0gJGZpbGUudmFsKCkuc3BsaXQoJ1xcXFwnKS5wb3AoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRpbnB1dCAudmFsKGZpbGVuYW1lKS5hdHRyKCd0aXRsZScsIGZpbGVuYW1lKTtcblxuICAgICAgfSk7XG5cbiAgICAgICRpbnB1dC5vbih7XG4gICAgICAgIGJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkZmlsZS50cmlnZ2VyKCdibHVyJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGtleWRvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEzKSB7IC8vIEVudGVyXG4gICAgICAgICAgICBpZiAoIWlzSUUpICRmaWxlLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5vbmUoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxMykgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSA4IHx8IGUud2hpY2ggPT09IDQ2KSB7IC8vIEJhY2tzcGFjZSAmIERlbFxuICAgICAgICAgICAgLy8gSW4gSUUgdGhlIHZhbHVlIGlzIHJlYWQtb25seVxuICAgICAgICAgICAgLy8gd2l0aCB0aGlzIHRyaWNrIHdlIHJlbW92ZSB0aGUgb2xkIGlucHV0IGFuZCBhZGRcbiAgICAgICAgICAgIC8vIGEgY2xlYW4gY2xvbmUgd2l0aCBhbGwgdGhlIG9yaWdpbmFsIGV2ZW50cyBhdHRhY2hlZFxuICAgICAgICAgICAgaWYgKGlzSUUpICRmaWxlLnJlcGxhY2VXaXRoKCRmaWxlID0gJGZpbGUuY2xvbmUodHJ1ZSkpO1xuICAgICAgICAgICAgJGZpbGUudmFsKCcnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgICRpbnB1dC52YWwoJycpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gOSkgeyAvLyBUQUJcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2UgeyAvLyBBbGwgb3RoZXIga2V5c1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9XG5cbiAgfTtcblxuICByZXF1aXJlKCcuLi8uLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIiwiLypcbiAqIGlkZWFsUmFkaW9DaGVjazogalF1ZXJ5IHBsZ3VpbiBmb3IgY2hlY2tib3ggYW5kIHJhZGlvIHJlcGxhY2VtZW50XG4gKiBVc2FnZTogJCgnaW5wdXRbdHlwZT1jaGVja2JveF0sIGlucHV0W3R5cGU9cmFkaW9dJykuaWRlYWxSYWRpb0NoZWNrKClcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICB2YXIgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxyYWRpb2NoZWNrJztcblxuICBwbHVnaW4ubWV0aG9kcyA9IHtcblxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyICRpbnB1dCA9ICQodGhpcy5lbCk7XG4gICAgICB2YXIgJHNwYW4gPSAkKCc8c3Bhbi8+Jyk7XG5cbiAgICAgICRzcGFuLmFkZENsYXNzKCdpZGVhbC0nKyAoJGlucHV0LmlzKCc6Y2hlY2tib3gnKSA/ICdjaGVjaycgOiAncmFkaW8nKSk7XG4gICAgICAkaW5wdXQuaXMoJzpjaGVja2VkJykgJiYgJHNwYW4uYWRkQ2xhc3MoJ2NoZWNrZWQnKTsgLy8gaW5pdFxuICAgICAgJHNwYW4uaW5zZXJ0QWZ0ZXIoJGlucHV0KTtcblxuICAgICAgJGlucHV0LnBhcmVudCgnbGFiZWwnKVxuICAgICAgICAuYWRkQ2xhc3MoJ2lkZWFsLXJhZGlvY2hlY2stbGFiZWwnKVxuICAgICAgICAuYXR0cignb25jbGljaycsICcnKTsgLy8gRml4IGNsaWNraW5nIGxhYmVsIGluIGlPU1xuXG4gICAgICAkaW5wdXQuY3NzKHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIGxlZnQ6ICctOTk5OXB4JyB9KTsgLy8gaGlkZSBieSBzaGlmdGluZyBsZWZ0XG5cbiAgICAgIC8vIEV2ZW50c1xuICAgICAgJGlucHV0Lm9uKHtcbiAgICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJGlucHV0ID0gJCh0aGlzKTtcbiAgICAgICAgICBpZiAoICRpbnB1dC5pcygnaW5wdXRbdHlwZT1cInJhZGlvXCJdJykgKSB7XG4gICAgICAgICAgICAkaW5wdXQucGFyZW50KCkuc2libGluZ3MoJ2xhYmVsJykuZmluZCgnLmlkZWFsLXJhZGlvJykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJHNwYW4udG9nZ2xlQ2xhc3MoJ2NoZWNrZWQnLCAkaW5wdXQuaXMoJzpjaGVja2VkJykpO1xuICAgICAgICB9LFxuICAgICAgICBmb2N1czogZnVuY3Rpb24oKSB7ICRzcGFuLmFkZENsYXNzKCdmb2N1cycpIH0sXG4gICAgICAgIGJsdXI6IGZ1bmN0aW9uKCkgeyAkc3Bhbi5yZW1vdmVDbGFzcygnZm9jdXMnKSB9LFxuICAgICAgICBjbGljazogZnVuY3Rpb24oKSB7ICQodGhpcykudHJpZ2dlcignZm9jdXMnKSB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICByZXF1aXJlKCcuLi8uLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnZGF0ZXBpY2tlcicsXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkRGF0ZXBpY2tlcigpO1xuICAgIH0sXG5cbiAgIF9idWlsZERhdGVwaWNrZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgJGRhdGVwaWNrZXIgPSB0aGlzLiRmb3JtLmZpbmQoJ2lucHV0LmRhdGVwaWNrZXInKTtcblxuICAgICAgLy8gQWx3YXlzIHNob3cgZGF0ZXBpY2tlciBiZWxvdyB0aGUgaW5wdXRcbiAgICAgIGlmIChqUXVlcnkudWkpIHtcbiAgICAgICAgJC5kYXRlcGlja2VyLl9jaGVja09mZnNldCA9IGZ1bmN0aW9uKGEsYixjKXsgcmV0dXJuIGIgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKGpRdWVyeS51aSAmJiAkZGF0ZXBpY2tlci5sZW5ndGgpIHtcblxuICAgICAgICAkZGF0ZXBpY2tlci5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyKHtcbiAgICAgICAgICAgIGJlZm9yZVNob3c6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgICAgICAgICQoaW5wdXQpLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25DaGFuZ2VNb250aFllYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAvLyBIYWNrIHRvIGZpeCBJRTkgbm90IHJlc2l6aW5nXG4gICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgICAgICAgICAgICAsIHdpZHRoID0gJHRoaXMub3V0ZXJXaWR0aCgpOyAvLyBjYWNoZSBmaXJzdCFcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRlcGlja2VyKCd3aWRnZXQnKS5jc3MoJ3dpZHRoJywgd2lkdGgpO1xuICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGp1c3Qgd2lkdGhcbiAgICAgICAgJGRhdGVwaWNrZXIub24oJ2ZvY3VzIGtleXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHQgPSAkKHRoaXMpLCB3ID0gdC5vdXRlcldpZHRoKCk7XG4gICAgICAgICAgdC5kYXRlcGlja2VyKCd3aWRnZXQnKS5jc3MoJ3dpZHRoJywgdyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICB9XG59O1xuIiwiZnVuY3Rpb24gdGVtcGxhdGUoaHRtbCwgZGF0YSkge1xuXG4gIHZhciBsb29wID0gL1xce0AoW159XSspXFx9KC4rPylcXHtcXC9cXDFcXH0vZ1xuICAgICwgbG9vcFZhcmlhYmxlID0gL1xceyMoW159XSspXFx9L2dcbiAgICAsIHZhcmlhYmxlID0gL1xceyhbXn1dKylcXH0vZztcblxuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKGxvb3AsIGZ1bmN0aW9uKF8sIGtleSwgbGlzdCkge1xuICAgICAgcmV0dXJuICQubWFwKGRhdGFba2V5XSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gbGlzdC5yZXBsYWNlKGxvb3BWYXJpYWJsZSwgZnVuY3Rpb24oXywgaykge1xuICAgICAgICAgIHJldHVybiBpdGVtW2tdO1xuICAgICAgICB9KTtcbiAgICAgIH0pLmpvaW4oJycpO1xuICAgIH0pXG4gICAgLnJlcGxhY2UodmFyaWFibGUsIGZ1bmN0aW9uKF8sIGtleSkge1xuICAgICAgcmV0dXJuIGRhdGFba2V5XSB8fCAnJztcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2R5bmFtaWNGaWVsZHMnLFxuXG4gIG9wdGlvbnM6IHtcblxuICAgIHRlbXBsYXRlczoge1xuXG4gICAgICBiYXNlOidcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGRcIj5cXFxuICAgICAgICAgIDxsYWJlbCBjbGFzcz1cIm1haW5cIj57bGFiZWx9PC9sYWJlbD5cXFxuICAgICAgICAgIHtmaWVsZH1cXFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZXJyb3JcIj48L3NwYW4+XFxcbiAgICAgICAgPC9kaXY+XFxcbiAgICAgICcsXG5cbiAgICAgIHRleHQ6ICc8aW5wdXQgbmFtZT1cIntuYW1lfVwiIHR5cGU9XCJ7c3VidHlwZX1cIiB2YWx1ZT1cInt2YWx1ZX1cIiB7YXR0cnN9PicsXG5cbiAgICAgIGZpbGU6ICc8aW5wdXQgaWQ9XCJ7bmFtZX1cIiBuYW1lPVwie25hbWV9XCIgdHlwZT1cImZpbGVcIiB7YXR0cnN9PicsXG5cbiAgICAgIHRleHRhcmVhOiAnPHRleHRhcmVhIG5hbWU9XCJ7bmFtZX1cIiB7YXR0cnN9Pnt0ZXh0fTwvdGV4dGFyZWE+JyxcblxuICAgICAgZ3JvdXA6ICdcXFxuICAgICAgICA8cCBjbGFzcz1cImdyb3VwXCI+XFxcbiAgICAgICAgICB7QGxpc3R9XFxcbiAgICAgICAgICA8bGFiZWw+PGlucHV0IG5hbWU9XCJ7bmFtZX1cIiB0eXBlPVwie3N1YnR5cGV9XCIgdmFsdWU9XCJ7I3ZhbHVlfVwiIHsjYXR0cnN9PnsjdGV4dH08L2xhYmVsPlxcXG4gICAgICAgICAgey9saXN0fVxcXG4gICAgICAgIDwvcD5cXFxuICAgICAgJyxcblxuICAgICAgc2VsZWN0OiAnXFxcbiAgICAgICAgPHNlbGVjdCBuYW1lPXtuYW1lfT5cXFxuICAgICAgICAgIHtAbGlzdH1cXFxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJ7I3ZhbHVlfVwiPnsjdGV4dH08L29wdGlvbj5cXFxuICAgICAgICAgIHsvbGlzdH1cXFxuICAgICAgICA8L3NlbGVjdD5cXFxuICAgICAgJ1xuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICBhZGRGaWVsZHM6IGZ1bmN0aW9uKGZpZWxkcykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChmaWVsZHMsIGZ1bmN0aW9uKG5hbWUsIGZpZWxkKSB7XG5cbiAgICAgICAgdmFyIHR5cGVBcnJheSA9IGZpZWxkLnR5cGUuc3BsaXQoJzonKVxuICAgICAgICAgICwgcnVsZXMgPSB7fVxuICAgICAgICAgICwgJGxhc3QgPSBzZWxmLiRmb3JtLmZpbmQoc2VsZi5vcHRzLmZpZWxkKS5sYXN0KCk7XG5cbiAgICAgICAgZmllbGQubmFtZSA9IG5hbWU7XG4gICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlQXJyYXlbMF07XG4gICAgICAgIGlmICh0eXBlQXJyYXlbMV0pIGZpZWxkLnN1YnR5cGUgPSB0eXBlQXJyYXlbMV07XG5cbiAgICAgICAgZmllbGQuaHRtbCA9IHRlbXBsYXRlKHNlbGYub3B0cy50ZW1wbGF0ZXMuYmFzZSwge1xuICAgICAgICAgIGxhYmVsOiBmaWVsZC5sYWJlbCxcbiAgICAgICAgICBmaWVsZDogdGVtcGxhdGUoc2VsZi5vcHRzLnRlbXBsYXRlc1tmaWVsZC50eXBlXSwgZmllbGQpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYuX2luamVjdCgnYWRkRmllbGRzOmJlZm9yZScsIGZpZWxkKTtcblxuICAgICAgICBpZiAoZmllbGQuYWZ0ZXIgfHwgZmllbGQuYmVmb3JlKSB7XG4gICAgICAgICAgc2VsZi4kZm9ybS5maW5kKCdbbmFtZT1cIicrIChmaWVsZC5hZnRlciB8fCBmaWVsZC5iZWZvcmUpICsnXCJdJykuZmlyc3QoKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fZ2V0RmllbGQodGhpcylbZmllbGQuYWZ0ZXIgPyAnYWZ0ZXInIDogJ2JlZm9yZSddKGZpZWxkLmh0bWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEZvcm0gaGFzIGF0IGxlYXN0IG9uZSBmaWVsZFxuICAgICAgICAgIGlmICgkbGFzdC5sZW5ndGgpICRsYXN0LmFmdGVyKGZpZWxkLmh0bWwpO1xuICAgICAgICAgIC8vIEZvcm0gaGFzIG5vIGZpZWxkc1xuICAgICAgICAgIGVsc2Ugc2VsZi4kZm9ybS5hcHBlbmQoZmllbGQuaHRtbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGQucnVsZXMpIHtcbiAgICAgICAgICBydWxlc1tuYW1lXSA9IGZpZWxkLnJ1bGVzO1xuICAgICAgICAgIHNlbGYuYWRkUnVsZXMocnVsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5faW5qZWN0KCdhZGRGaWVsZHM6YWZ0ZXInLCBmaWVsZCk7XG4gICAgICB9KTtcblxuICAgIH0sXG5cbiAgICByZW1vdmVGaWVsZHM6IGZ1bmN0aW9uKG5hbWVzKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKG5hbWVzLnNwbGl0KCcgJyksIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgICAgdmFyICRmaWVsZCA9IHNlbGYuX2dldEZpZWxkKCQoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpKTtcbiAgICAgICAgc2VsZi4kZmllbGRzID0gc2VsZi4kZmllbGRzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gISAkKHRoaXMpLmlzKCRmaWVsZCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkZmllbGQucmVtb3ZlKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5faW5qZWN0KCdyZW1vdmVGaWVsZHMnKTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlRmllbGRzOiBmdW5jdGlvbihuYW1lcykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChuYW1lcy5zcGxpdCgnICcpLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAgIHZhciAkZmllbGQgPSBzZWxmLl9nZXRGaWVsZCgkKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKSk7XG4gICAgICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJywgJGZpZWxkLmlzKCc6dmlzaWJsZScpKS50b2dnbGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9pbmplY3QoJ3RvZ2dsZUZpZWxkcycpO1xuICAgIH1cblxuICB9XG59O1xuIiwiLyohXG4gKiBJZGVhbCBTdGVwc1xuKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsc3RlcHMnO1xuXG4gIHBsdWdpbi5kZWZhdWx0cyA9IHtcbiAgICBuYXY6ICcuaWRlYWxzdGVwcy1uYXYnLFxuICAgIG5hdkl0ZW1zOiAnbGknLFxuICAgIGJ1aWxkTmF2SXRlbXM6IHRydWUsXG4gICAgd3JhcDogJy5pZGVhbHN0ZXBzLXdyYXAnLFxuICAgIHN0ZXA6ICcuaWRlYWxzdGVwcy1zdGVwJyxcbiAgICBhY3RpdmVDbGFzczogJ2lkZWFsc3RlcHMtc3RlcC1hY3RpdmUnLFxuICAgIGJlZm9yZTogJC5ub29wLFxuICAgIGFmdGVyOiAkLm5vb3AsXG4gICAgZmFkZVNwZWVkOiAwXG4gIH07XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSB7XG5cbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBhY3RpdmUgPSB0aGlzLm9wdHMuYWN0aXZlQ2xhc3M7XG5cbiAgICAgIHRoaXMuJGVsID0gJCh0aGlzLmVsKTtcblxuICAgICAgdGhpcy4kbmF2ID0gdGhpcy4kZWwuZmluZCh0aGlzLm9wdHMubmF2KTtcbiAgICAgIHRoaXMuJG5hdkl0ZW1zID0gdGhpcy4kbmF2LmZpbmQodGhpcy5vcHRzLm5hdkl0ZW1zKTtcblxuICAgICAgdGhpcy4kd3JhcCA9IHRoaXMuJGVsLmZpbmQodGhpcy5vcHRzLndyYXApO1xuICAgICAgdGhpcy4kc3RlcHMgPSB0aGlzLiR3cmFwLmZpbmQodGhpcy5vcHRzLnN0ZXApO1xuXG4gICAgICBpZiAodGhpcy5vcHRzLmJ1aWxkTmF2SXRlbXMpIHRoaXMuX2J1aWxkTmF2SXRlbXMoKTtcblxuICAgICAgdGhpcy4kc3RlcHMuaGlkZSgpLmZpcnN0KCkuc2hvdygpO1xuICAgICAgdGhpcy4kbmF2SXRlbXMucmVtb3ZlQ2xhc3MoYWN0aXZlKS5maXJzdCgpLmFkZENsYXNzKGFjdGl2ZSk7XG5cbiAgICAgIHRoaXMuJG5hdkl0ZW1zLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoISAkKHRoaXMpLmlzKCcuJysgc2VsZi5vcHRzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICAgIHNlbGYuZ28oc2VsZi4kbmF2SXRlbXMuaW5kZXgodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2J1aWxkTmF2SXRlbXM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgaXNDdXN0b20gPSB0eXBlb2YgdGhpcy5vcHRzLmJ1aWxkTmF2SXRlbXMgPT0gJ2Z1bmN0aW9uJyxcbiAgICAgICAgICBpdGVtID0gZnVuY3Rpb24odmFsKXsgcmV0dXJuICc8bGk+PGEgaHJlZj1cIiNcIiB0YWJpbmRleD1cIi0xXCI+JysgdmFsICsnPC9hPjwvbGk+JzsgfSxcbiAgICAgICAgICBpdGVtcztcblxuICAgICAgaXRlbXMgPSBpc0N1c3RvbSA/XG4gICAgICAgIHRoaXMuJHN0ZXBzLm1hcChmdW5jdGlvbihpKXsgcmV0dXJuIGl0ZW0oc2VsZi5vcHRzLmJ1aWxkTmF2SXRlbXMuY2FsbChzZWxmLCBpKSkgfSkuZ2V0KCkgOlxuICAgICAgICB0aGlzLiRzdGVwcy5tYXAoZnVuY3Rpb24oaSl7IHJldHVybiBpdGVtKCsraSk7IH0pLmdldCgpO1xuXG4gICAgICB0aGlzLiRuYXZJdGVtcyA9ICQoaXRlbXMuam9pbignJykpO1xuXG4gICAgICB0aGlzLiRuYXYuYXBwZW5kKCQoJzx1bC8+JykuYXBwZW5kKHRoaXMuJG5hdkl0ZW1zKSk7XG4gICAgfSxcblxuICAgIF9nZXRDdXJJZHg6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJHN0ZXBzLmluZGV4KHRoaXMuJHN0ZXBzLmZpbHRlcignOnZpc2libGUnKSk7XG4gICAgfSxcblxuICAgIGdvOiBmdW5jdGlvbihpZHgpIHtcblxuICAgICAgdmFyIGFjdGl2ZSA9IHRoaXMub3B0cy5hY3RpdmVDbGFzcyxcbiAgICAgICAgICBmYWRlU3BlZWQgPSB0aGlzLm9wdHMuZmFkZVNwZWVkO1xuXG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnZnVuY3Rpb24nKSBpZHggPSBpZHguY2FsbCh0aGlzLCB0aGlzLl9nZXRDdXJJZHgoKSk7XG5cbiAgICAgIGlmIChpZHggPj0gdGhpcy4kc3RlcHMubGVuZ3RoKSBpZHggPSAwO1xuICAgICAgaWYgKGlkeCA8IDApIGlkeCA9IHRoaXMuJHN0ZXBzLmxlbmd0aC0xO1xuXG4gICAgICB0aGlzLm9wdHMuYmVmb3JlLmNhbGwodGhpcywgaWR4KTtcblxuICAgICAgdGhpcy4kbmF2SXRlbXMucmVtb3ZlQ2xhc3MoYWN0aXZlKS5lcShpZHgpLmFkZENsYXNzKGFjdGl2ZSk7XG4gICAgICB0aGlzLiRzdGVwcy5oaWRlKCkuZXEoaWR4KS5mYWRlSW4oZmFkZVNwZWVkKTtcblxuICAgICAgdGhpcy5vcHRzLmFmdGVyLmNhbGwodGhpcywgaWR4KTtcbiAgICB9LFxuXG4gICAgcHJldjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKHRoaXMuX2dldEN1cklkeCgpIC0gMSk7XG4gICAgfSxcblxuICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbyh0aGlzLl9nZXRDdXJJZHgoKSArIDEpO1xuICAgIH0sXG5cbiAgICBmaXJzdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKDApO1xuICAgIH0sXG5cbiAgICBsYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28odGhpcy4kc3RlcHMubGVuZ3RoLTEpO1xuICAgIH1cbiAgfTtcblxuICByZXF1aXJlKCcuLi8uLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIiwicmVxdWlyZSgnLi9pZGVhbHN0ZXBzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdzdGVwcycsXG5cbiAgb3B0aW9uczoge1xuXG4gICAgc3RlcHM6IHtcblxuICAgICAgY29udGFpbmVyOiAnLmlkZWFsc3RlcHMtY29udGFpbmVyJyxcbiAgICAgIG5hdjogJy5pZGVhbHN0ZXBzLW5hdicsXG4gICAgICBuYXZJdGVtczogJ2xpJyxcbiAgICAgIGJ1aWxkTmF2SXRlbXM6IGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5zdGVwcy5pMThuLnN0ZXAgKycgJysgKGkrMSk7XG4gICAgICB9LFxuICAgICAgd3JhcDogJy5pZGVhbHN0ZXBzLXdyYXAnLFxuICAgICAgc3RlcDogJy5pZGVhbHN0ZXBzLXN0ZXAnLFxuICAgICAgYWN0aXZlQ2xhc3M6ICdpZGVhbHN0ZXBzLXN0ZXAtYWN0aXZlJyxcbiAgICAgIGJlZm9yZTogJC5ub29wLFxuICAgICAgYWZ0ZXI6ICQubm9vcCxcbiAgICAgIGZhZGVTcGVlZDogMCxcblxuICAgICAgaTE4bjoge1xuICAgICAgICBzdGVwOiAnU3RlcCdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkU3RlcHMoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIF92YWxpZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5fdXBkYXRlU3RlcHMoKTtcblxuICAgICAgaWYgKHRoaXMuX2hhc0V4dGVuc2lvbignYWpheCcpKSB7XG4gICAgICAgICQuZWFjaCgkLmlkZWFsZm9ybXMuX3JlcXVlc3RzLCBmdW5jdGlvbihrZXksIHJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0LmRvbmUoZnVuY3Rpb24oKXsgc2VsZi5fdXBkYXRlU3RlcHMoKSB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICBmb2N1c0ZpcnN0SW52YWxpZDogZnVuY3Rpb24oZmlyc3RJbnZhbGlkKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnZ28nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHN0ZXBzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh0aGlzKS5maW5kKGZpcnN0SW52YWxpZCkubGVuZ3RoO1xuICAgICAgICB9KS5pbmRleCgpO1xuICAgICAgfSk7XG5cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgJChmaXJzdEludmFsaWQpLmZvY3VzKCkgfSwgdGhpcy5vcHRzLnN0ZXBzLmZhZGVTcGVlZCk7XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICBhZGRSdWxlczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmZpcnN0U3RlcCgpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgJ2FkZEZpZWxkczpiZWZvcmUnOiBmdW5jdGlvbihmaWVsZCkge1xuXG4gICAgICBpZiAoZmllbGQuYWZ0ZXIgfHwgZmllbGQuYmVmb3JlKSByZXR1cm47XG5cbiAgICAgIHZhciAkc3RlcHMgPSB0aGlzLiRzdGVwc0NvbnRhaW5lci5maW5kKHRoaXMub3B0cy5zdGVwcy5zdGVwKTtcblxuICAgICAgaWYgKCEgKCdhcHBlbmRUb1N0ZXAnIGluIGZpZWxkKSkge1xuICAgICAgICBmaWVsZC5hcHBlbmRUb1N0ZXAgPSAkc3RlcHMubGVuZ3RoLTE7XG4gICAgICB9XG5cbiAgICAgIGZpZWxkLmFmdGVyID0gJHN0ZXBzXG4gICAgICAgIC5lcShmaWVsZC5hcHBlbmRUb1N0ZXApXG4gICAgICAgIC5maW5kKCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYScpXG4gICAgICAgIC5sYXN0KClbMF0ubmFtZTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIHRvZ2dsZUZpZWxkczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgcmVtb3ZlRmllbGRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0ZXBzKCk7XG4gICAgfSxcblxuICAgIF9idWlsZFN0ZXBzOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLCBvcHRpb25zXG4gICAgICAgICwgaGFzUnVsZXMgPSAhICQuaXNFbXB0eU9iamVjdCh0aGlzLm9wdHMucnVsZXMpXG4gICAgICAgICwgYnVpbGROYXZJdGVtcyA9IHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zXG4gICAgICAgICwgY291bnRlciA9IGhhc1J1bGVzXG4gICAgICAgICAgPyAnPHNwYW4gY2xhc3M9XCJjb3VudGVyXCIvPidcbiAgICAgICAgICA6ICc8c3BhbiBjbGFzcz1cImNvdW50ZXIgemVyb1wiPjA8L3NwYW4+JztcblxuICAgICAgaWYgKHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zKSB7XG4gICAgICAgIHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zID0gZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHJldHVybiBidWlsZE5hdkl0ZW1zLmNhbGwoc2VsZiwgaSkgKyBjb3VudGVyO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lciA9IHRoaXMuJGZvcm1cbiAgICAgICAgLmNsb3Nlc3QodGhpcy5vcHRzLnN0ZXBzLmNvbnRhaW5lcilcbiAgICAgICAgLmlkZWFsc3RlcHModGhpcy5vcHRzLnN0ZXBzKTtcbiAgICB9LFxuXG4gICAgX3VwZGF0ZVN0ZXBzOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdfaW5qZWN0JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGlkZWFsc3RlcHMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJG5hdkl0ZW1zLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHZhciBpbnZhbGlkID0gaWRlYWxzdGVwcy4kc3RlcHMuZXEoaSkuZmluZChzZWxmLmdldEludmFsaWQoKSkubGVuZ3RoO1xuICAgICAgICAgICQodGhpcykuZmluZCgnc3BhbicpLnRleHQoaW52YWxpZCkudG9nZ2xlQ2xhc3MoJ3plcm8nLCAhIGludmFsaWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnb1RvU3RlcDogZnVuY3Rpb24oaWR4KSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdnbycsIGlkeCk7XG4gICAgfSxcblxuICAgIHByZXZTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ3ByZXYnKTtcbiAgICB9LFxuXG4gICAgbmV4dFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnbmV4dCcpO1xuICAgIH0sXG5cbiAgICBmaXJzdFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnZmlyc3QnKTtcbiAgICB9LFxuXG4gICAgbGFzdFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnbGFzdCcpO1xuICAgIH1cbiAgfVxuXG59O1xuIiwiLyohXG4gKiBqUXVlcnkgSWRlYWwgRm9ybXNcbiAqIEBhdXRob3I6IENlZHJpYyBSdWl6XG4gKiBAdmVyc2lvbjogMy4wXG4gKiBAbGljZW5zZSBHUEwgb3IgTUlUXG4gKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsZm9ybXMnO1xuXG4gIHBsdWdpbi5kZWZhdWx0cyA9IHtcbiAgICBmaWVsZDogJy5maWVsZCcsXG4gICAgZXJyb3I6ICcuZXJyb3InLFxuICAgIGljb25IdG1sOiAnPGkvPicsXG4gICAgaWNvbkNsYXNzOiAnaWNvbicsXG4gICAgaW52YWxpZENsYXNzOiAnaW52YWxpZCcsXG4gICAgdmFsaWRDbGFzczogJ3ZhbGlkJyxcbiAgICBzaWxlbnRMb2FkOiB0cnVlLFxuICAgIG9uVmFsaWRhdGU6ICQubm9vcCxcbiAgICBvblN1Ym1pdDogJC5ub29wLFxuICAgIHJ1bGVzOiB7fSxcbiAgICBlcnJvcnM6IHt9XG4gIH07XG5cbiAgcGx1Z2luLmdsb2JhbCA9IHtcblxuICAgIF9mb3JtYXQ6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xceyhcXGQpXFx9L2csIGZ1bmN0aW9uKF8sIG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBhcmdzWyttYXRjaF0gfHwgJyc7XG4gICAgICB9KS5yZXBsYWNlKC9cXHtcXCooW14qfV0qKVxcfS9nLCBmdW5jdGlvbihfLCBzZXApIHtcbiAgICAgICAgcmV0dXJuIGFyZ3Muam9pbihzZXAgfHwgJywgJyk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2dldEtleTogZnVuY3Rpb24oa2V5LCBvYmopIHtcbiAgICAgIHJldHVybiBrZXkuc3BsaXQoJy4nKS5yZWR1Y2UoZnVuY3Rpb24oYSxiKSB7XG4gICAgICAgIHJldHVybiBhICYmIGFbYl07XG4gICAgICB9LCBvYmopO1xuICAgIH0sXG5cbiAgICBpMThuOiB7fSxcblxuICAgIHJ1bGVTZXBhcmF0b3I6ICcgJyxcbiAgICBhcmdTZXBhcmF0b3I6ICc6JyxcblxuICAgIHJ1bGVzOiByZXF1aXJlKCcuL3J1bGVzJyksXG4gICAgZXJyb3JzOiByZXF1aXJlKCcuL2Vycm9ycycpLFxuXG4gICAgZXh0ZW5zaW9uczogW1xuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2R5bmFtaWMtZmllbGRzL2R5bmFtaWMtZmllbGRzLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2FqYXgvYWpheC5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9zdGVwcy9zdGVwcy5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2N1c3RvbS1pbnB1dHMuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2FkYXB0aXZlL2FkYXB0aXZlLmV4dCcpXG4gICAgXVxuICB9O1xuXG4gIHBsdWdpbi5tZXRob2RzID0gJC5leHRlbmQoe30sIHJlcXVpcmUoJy4vcHJpdmF0ZScpLCByZXF1aXJlKCcuL3B1YmxpYycpKTtcblxuICByZXF1aXJlKCcuL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iLCIvKipcbiAqIFBsdWdpbiBib2lsZXJwbGF0ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgQVAgPSBBcnJheS5wcm90b3R5cGU7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHBsdWdpbikge1xuXG4gICAgcGx1Z2luID0gJC5leHRlbmQodHJ1ZSwge1xuICAgICAgbmFtZTogJ3BsdWdpbicsXG4gICAgICBkZWZhdWx0czoge1xuICAgICAgICBkaXNhYmxlZEV4dGVuc2lvbnM6ICdub25lJ1xuICAgICAgfSxcbiAgICAgIG1ldGhvZHM6IHt9LFxuICAgICAgZ2xvYmFsOiB7fSxcbiAgICB9LCBwbHVnaW4pO1xuXG4gICAgJFtwbHVnaW4ubmFtZV0gPSAkLmV4dGVuZCh7XG5cbiAgICAgIGFkZEV4dGVuc2lvbjogZnVuY3Rpb24oZXh0ZW5zaW9uKSB7XG4gICAgICAgIHBsdWdpbi5nbG9iYWwuZXh0ZW5zaW9ucy5wdXNoKGV4dGVuc2lvbik7XG4gICAgICB9XG4gICAgfSwgcGx1Z2luLmdsb2JhbCk7XG5cbiAgICBmdW5jdGlvbiBQbHVnaW4oZWxlbWVudCwgb3B0aW9ucykge1xuXG4gICAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh7fSwgcGx1Z2luLmRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuZWwgPSBlbGVtZW50O1xuXG4gICAgICB0aGlzLl9uYW1lID0gcGx1Z2luLm5hbWU7XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICB9XG5cbiAgICBQbHVnaW4uX2V4dGVuZGVkID0ge307XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlLl9oYXNFeHRlbnNpb24gPSBmdW5jdGlvbihleHRlbnNpb24pIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmdsb2JhbC5leHRlbnNpb25zLmZpbHRlcihmdW5jdGlvbihleHQpIHtcbiAgICAgICAgcmV0dXJuIGV4dC5uYW1lID09IGV4dGVuc2lvbiAmJiBzZWxmLm9wdHMuZGlzYWJsZWRFeHRlbnNpb25zLmluZGV4T2YoZXh0Lm5hbWUpIDwgMDtcbiAgICAgIH0pLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5fZXh0ZW5kID0gZnVuY3Rpb24oZXh0ZW5zaW9ucykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChleHRlbnNpb25zLCBmdW5jdGlvbihpLCBleHRlbnNpb24pIHtcblxuICAgICAgICAkLmV4dGVuZChzZWxmLm9wdHMsICQuZXh0ZW5kKHRydWUsIGV4dGVuc2lvbi5vcHRpb25zLCBzZWxmLm9wdHMpKTtcblxuICAgICAgICAkLmVhY2goZXh0ZW5zaW9uLm1ldGhvZHMsIGZ1bmN0aW9uKG1ldGhvZCwgZm4pIHtcblxuICAgICAgICAgIGlmIChzZWxmLm9wdHMuZGlzYWJsZWRFeHRlbnNpb25zLmluZGV4T2YoZXh0ZW5zaW9uLm5hbWUpID4gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoUGx1Z2luLnByb3RvdHlwZVttZXRob2Quc3BsaXQoJzonKVswXV0pIHtcbiAgICAgICAgICAgIFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSA9IFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSB8fCBbXTtcbiAgICAgICAgICAgIFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXS5wdXNoKHsgbmFtZTogZXh0ZW5zaW9uLm5hbWUsIGZuOiBmbiB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUGx1Z2luLnByb3RvdHlwZVttZXRob2RdID0gZm47XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2luamVjdCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuXG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG1ldGhvZC5jYWxsKHRoaXMpO1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0pIHtcbiAgICAgICAgJC5lYWNoKFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSwgZnVuY3Rpb24oaSwgcGx1Z2luKSB7XG4gICAgICAgICAgcGx1Z2luLmZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5faW5pdCA9ICQubm9vcDtcblxuICAgIFBsdWdpbi5wcm90b3R5cGVbcGx1Z2luLm5hbWVdID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuIHRoaXM7XG4gICAgICB0cnkgeyByZXR1cm4gdGhpc1ttZXRob2RdLmFwcGx5KHRoaXMsIEFQLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7IH1cbiAgICAgIGNhdGNoKGUpIHt9XG4gICAgfTtcblxuICAgICQuZXh0ZW5kKFBsdWdpbi5wcm90b3R5cGUsIHBsdWdpbi5tZXRob2RzKTtcblxuICAgICQuZm5bcGx1Z2luLm5hbWVdID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBhcmdzID0gQVAuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgICAgICwgbWV0aG9kQXJyYXkgPSB0eXBlb2YgYXJnc1swXSA9PSAnc3RyaW5nJyAmJiBhcmdzWzBdLnNwbGl0KCc6JylcbiAgICAgICAgLCBtZXRob2QgPSBtZXRob2RBcnJheVttZXRob2RBcnJheS5sZW5ndGggPiAxID8gMSA6IDBdXG4gICAgICAgICwgcHJlZml4ID0gbWV0aG9kQXJyYXkubGVuZ3RoID4gMSAmJiBtZXRob2RBcnJheVswXVxuICAgICAgICAsIG9wdHMgPSB0eXBlb2YgYXJnc1swXSA9PSAnb2JqZWN0JyAmJiBhcmdzWzBdXG4gICAgICAgICwgcGFyYW1zID0gYXJncy5zbGljZSgxKVxuICAgICAgICAsIHJldDtcblxuICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICBtZXRob2QgPSBwcmVmaXggKyBtZXRob2Quc3Vic3RyKDAsMSkudG9VcHBlckNhc2UoKSArIG1ldGhvZC5zdWJzdHIoMSxtZXRob2QubGVuZ3RoLTEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlID0gJC5kYXRhKHRoaXMsIHBsdWdpbi5uYW1lKTtcblxuICAgICAgICAvLyBNZXRob2RcbiAgICAgICAgaWYgKGluc3RhbmNlKSB7XG4gICAgICAgICAgcmV0dXJuIHJldCA9IGluc3RhbmNlW3BsdWdpbi5uYW1lXS5hcHBseShpbnN0YW5jZSwgW21ldGhvZF0uY29uY2F0KHBhcmFtcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5pdFxuICAgICAgICByZXR1cm4gJC5kYXRhKHRoaXMsIHBsdWdpbi5uYW1lLCBuZXcgUGx1Z2luKHRoaXMsIG9wdHMpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcHJlZml4ID8gcmV0IDogdGhpcztcbiAgICB9O1xuICB9O1xuXG59KCkpO1xuIiwiLyoqXG4gKiBQcml2YXRlIG1ldGhvZHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy4kZm9ybSA9ICQodGhpcy5lbCk7XG4gICAgdGhpcy4kZmllbGRzID0gJCgpO1xuICAgIHRoaXMuJGlucHV0cyA9ICQoKTtcblxuICAgIHRoaXMuX2V4dGVuZCgkLmlkZWFsZm9ybXMuZXh0ZW5zaW9ucyk7XG4gICAgdGhpcy5faTE4bigpO1xuXG4gICAgdGhpcy5faW5qZWN0KCdfaW5pdCcpO1xuXG4gICAgdGhpcy5fYWRkTWFya3VwUnVsZXMoKTtcbiAgICB0aGlzLmFkZFJ1bGVzKHRoaXMub3B0cy5ydWxlcyB8fCB7fSk7XG5cbiAgICB0aGlzLiRmb3JtLnN1Ym1pdChmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl92YWxpZGF0ZUFsbCh0cnVlKTtcbiAgICAgIHNlbGYuZm9jdXNGaXJzdEludmFsaWQoKTtcbiAgICAgIHNlbGYub3B0cy5vblN1Ym1pdC5jYWxsKHNlbGYsIHNlbGYuZ2V0SW52YWxpZCgpLmxlbmd0aCwgZSk7XG4gICAgfSk7XG5cbiAgICBpZiAoISB0aGlzLm9wdHMuc2lsZW50TG9hZCkge1xuICAgICAgLy8gMW1zIHRpbWVvdXQgdG8gbWFrZSBzdXJlIGVycm9yIHNob3dzIHVwXG4gICAgICBzZXRUaW1lb3V0KCQucHJveHkodGhpcy5mb2N1c0ZpcnN0SW52YWxpZCwgdGhpcyksIDEpO1xuICAgIH1cbiAgfSxcblxuICBfYWRkTWFya3VwUnVsZXM6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJ1bGVzID0ge307XG5cbiAgICB0aGlzLiRmb3JtLmZpbmQoJ2lucHV0LCBzZWxlY3QsIHRleHRhcmVhJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBydWxlID0gJCh0aGlzKS5kYXRhKCdpZGVhbGZvcm1zLXJ1bGVzJyk7XG4gICAgICBpZiAocnVsZSAmJiAhIHJ1bGVzW3RoaXMubmFtZV0pIHJ1bGVzW3RoaXMubmFtZV0gPSBydWxlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRSdWxlcyhydWxlcyk7XG4gIH0sXG5cbiAgX2kxOG46IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgJC5lYWNoKCQuaWRlYWxmb3Jtcy5pMThuLCBmdW5jdGlvbihsb2NhbGUsIGxhbmcpIHtcblxuICAgICAgdmFyIGVycm9ycyA9IGxhbmcuZXJyb3JzXG4gICAgICAgICwgb3B0aW9ucyA9IHt9O1xuXG4gICAgICBkZWxldGUgbGFuZy5lcnJvcnM7XG5cbiAgICAgIGZvciAodmFyIGV4dCBpbiBsYW5nKSBvcHRpb25zW2V4dF0gPSB7IGkxOG46IGxhbmdbZXh0XSB9O1xuXG4gICAgICAkLmV4dGVuZCgkLmlkZWFsZm9ybXMuZXJyb3JzLCBlcnJvcnMpO1xuICAgICAgJC5leHRlbmQodHJ1ZSwgc2VsZi5vcHRzLCBvcHRpb25zKTtcbiAgICB9KTtcbiAgfSxcblxuICBfYnVpbGRGaWVsZDogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgICwgJGljb247XG5cbiAgICAkaWNvbiA9ICQodGhpcy5vcHRzLmljb25IdG1sLCB7XG4gICAgICBjbGFzczogdGhpcy5vcHRzLmljb25DbGFzcyxcbiAgICAgIGNsaWNrOiBmdW5jdGlvbigpeyAkKGlucHV0KS5mb2N1cygpIH1cbiAgICB9KTtcblxuICAgIGlmICghIHRoaXMuJGZpZWxkcy5maWx0ZXIoJGZpZWxkKS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuJGZpZWxkcyA9IHRoaXMuJGZpZWxkcy5hZGQoJGZpZWxkKTtcbiAgICAgIGlmICh0aGlzLm9wdHMuaWNvbkh0bWwpICRmaWVsZC5hcHBlbmQoJGljb24pO1xuICAgICAgJGZpZWxkLmFkZENsYXNzKCdpZGVhbGZvcm1zLWZpZWxkIGlkZWFsZm9ybXMtZmllbGQtJysgaW5wdXQudHlwZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fYWRkRXZlbnRzKGlucHV0KTtcblxuICAgIHRoaXMuX2luamVjdCgnX2J1aWxkRmllbGQnLCBpbnB1dCk7XG4gIH0sXG5cbiAgX2FkZEV2ZW50czogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dCk7XG5cbiAgICAkKGlucHV0KVxuICAgICAgLm9uKCdjaGFuZ2Uga2V5dXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLndoaWNoID09IDkgfHwgZS53aGljaCA9PSAxNikgcmV0dXJuO1xuICAgICAgICBzZWxmLl92YWxpZGF0ZSh0aGlzLCB0cnVlLCB0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuZm9jdXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghIHNlbGYuaXNWYWxpZCh0aGlzLm5hbWUpKSB7XG4gICAgICAgICAgJGZpZWxkLmZpbmQoc2VsZi5vcHRzLmVycm9yKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuYmx1cihmdW5jdGlvbigpIHtcbiAgICAgICAgJGZpZWxkLmZpbmQoc2VsZi5vcHRzLmVycm9yKS5oaWRlKCk7XG4gICAgICB9KTtcbiAgfSxcblxuICBfaXNSZXF1aXJlZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAvLyBXZSBhc3N1bWUgbm9uLXRleHQgaW5wdXRzIHdpdGggcnVsZXMgYXJlIHJlcXVpcmVkXG4gICAgaWYgKCQoaW5wdXQpLmlzKCc6Y2hlY2tib3gsIDpyYWRpbywgc2VsZWN0JykpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiB0aGlzLm9wdHMucnVsZXNbaW5wdXQubmFtZV0uaW5kZXhPZigncmVxdWlyZWQnKSA+IC0xO1xuICB9LFxuXG4gIF9nZXRSZWxhdGVkOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRGaWVsZChpbnB1dCkuZmluZCgnW25hbWU9XCInKyBpbnB1dC5uYW1lICsnXCJdJyk7XG4gIH0sXG5cbiAgX2dldEZpZWxkOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHJldHVybiAkKGlucHV0KS5jbG9zZXN0KHRoaXMub3B0cy5maWVsZCk7XG4gIH0sXG5cbiAgX2dldEZpcnN0SW52YWxpZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW52YWxpZCgpLmZpcnN0KCkuZmluZCgnaW5wdXQ6Zmlyc3QsIHRleHRhcmVhLCBzZWxlY3QnKTtcbiAgfSxcblxuICBfaGFuZGxlRXJyb3I6IGZ1bmN0aW9uKGlucHV0LCBlcnJvciwgdmFsaWQpIHtcbiAgICB2YWxpZCA9IHZhbGlkIHx8IHRoaXMuaXNWYWxpZChpbnB1dC5uYW1lKTtcbiAgICB2YXIgJGVycm9yID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpLmZpbmQodGhpcy5vcHRzLmVycm9yKTtcbiAgICB0aGlzLiRmb3JtLmZpbmQodGhpcy5vcHRzLmVycm9yKS5oaWRlKCk7XG4gICAgaWYgKGVycm9yKSAkZXJyb3IudGV4dChlcnJvcik7XG4gICAgJGVycm9yLnRvZ2dsZSghdmFsaWQpO1xuICB9LFxuXG4gIF9oYW5kbGVTdHlsZTogZnVuY3Rpb24oaW5wdXQsIHZhbGlkKSB7XG4gICAgdmFsaWQgPSB2YWxpZCB8fCB0aGlzLmlzVmFsaWQoaW5wdXQubmFtZSk7XG4gICAgdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRzLnZhbGlkQ2xhc3MgKycgJysgdGhpcy5vcHRzLmludmFsaWRDbGFzcylcbiAgICAgIC5hZGRDbGFzcyh2YWxpZCA/IHRoaXMub3B0cy52YWxpZENsYXNzIDogdGhpcy5vcHRzLmludmFsaWRDbGFzcylcbiAgICAgIC5maW5kKCcuJysgdGhpcy5vcHRzLmljb25DbGFzcykuc2hvdygpO1xuICB9LFxuXG4gIF9mcmVzaDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLm9wdHMudmFsaWRDbGFzcyArJyAnKyB0aGlzLm9wdHMuaW52YWxpZENsYXNzKVxuICAgICAgLmZpbmQodGhpcy5vcHRzLmVycm9yKS5oaWRlKClcbiAgICAgIC5lbmQoKVxuICAgICAgLmZpbmQoJy4nKyB0aGlzLm9wdHMuaWNvbkNsYXNzKS50b2dnbGUodGhpcy5faXNSZXF1aXJlZChpbnB1dCkpO1xuICB9LFxuXG4gIF92YWxpZGF0ZTogZnVuY3Rpb24oaW5wdXQsIGhhbmRsZUVycm9yLCBoYW5kbGVTdHlsZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLCB1c2VyUnVsZXMgPSB0aGlzLm9wdHMucnVsZXNbaW5wdXQubmFtZV0uc3BsaXQoJC5pZGVhbGZvcm1zLnJ1bGVTZXBhcmF0b3IpXG4gICAgICAsIG9sZFZhbHVlID0gJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsdWUnKVxuICAgICAgLCB2YWxpZCA9IHRydWVcbiAgICAgICwgcnVsZTtcblxuICAgIC8vIERvbid0IHZhbGlkYXRlIGlucHV0IGlmIHZhbHVlIGhhc24ndCBjaGFuZ2VkXG4gICAgaWYgKCEgJChpbnB1dCkuaXMoJzpjaGVja2JveCwgOnJhZGlvJykgJiYgb2xkVmFsdWUgPT0gaW5wdXQudmFsdWUpIHtcbiAgICAgIHJldHVybiAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcpO1xuICAgIH1cblxuICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbHVlJywgaW5wdXQudmFsdWUpO1xuXG4gICAgLy8gTm9uLXJlcXVpcmVkIGlucHV0IHdpdGggZW1wdHkgdmFsdWUgbXVzdCBwYXNzIHZhbGlkYXRpb25cbiAgICBpZiAoISBpbnB1dC52YWx1ZSAmJiAhIHRoaXMuX2lzUmVxdWlyZWQoaW5wdXQpKSB7XG4gICAgICAkZmllbGQucmVtb3ZlRGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcpO1xuICAgICAgdGhpcy5fZnJlc2goaW5wdXQpO1xuXG4gICAgLy8gSW5wdXRzIHdpdGggdmFsdWUgb3IgcmVxdWlyZWRcbiAgICB9IGVsc2Uge1xuXG4gICAgICAkLmVhY2godXNlclJ1bGVzLCBmdW5jdGlvbihpLCB1c2VyUnVsZSkge1xuXG4gICAgICAgIHVzZXJSdWxlID0gdXNlclJ1bGUuc3BsaXQoJC5pZGVhbGZvcm1zLmFyZ1NlcGFyYXRvcik7XG5cbiAgICAgICAgcnVsZSA9IHVzZXJSdWxlWzBdO1xuXG4gICAgICAgIHZhciB0aGVSdWxlID0gJC5pZGVhbGZvcm1zLnJ1bGVzW3J1bGVdXG4gICAgICAgICAgLCBhcmdzID0gdXNlclJ1bGUuc2xpY2UoMSlcbiAgICAgICAgICAsIGVycm9yO1xuXG4gICAgICAgIGVycm9yID0gJC5pZGVhbGZvcm1zLl9mb3JtYXQuYXBwbHkobnVsbCwgW1xuICAgICAgICAgICQuaWRlYWxmb3Jtcy5fZ2V0S2V5KCdlcnJvcnMuJysgaW5wdXQubmFtZSArJy4nKyBydWxlLCBzZWxmLm9wdHMpIHx8XG4gICAgICAgICAgJC5pZGVhbGZvcm1zLmVycm9yc1tydWxlXVxuICAgICAgICBdLmNvbmNhdChhcmdzKSk7XG5cbiAgICAgICAgdmFsaWQgPSB0eXBlb2YgdGhlUnVsZSA9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgPyB0aGVSdWxlLmFwcGx5KHNlbGYsIFtpbnB1dCwgaW5wdXQudmFsdWVdLmNvbmNhdChhcmdzKSlcbiAgICAgICAgICA6IHRoZVJ1bGUudGVzdChpbnB1dC52YWx1ZSk7XG5cbiAgICAgICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnLCB2YWxpZCk7XG5cbiAgICAgICAgaWYgKGhhbmRsZUVycm9yKSBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCwgZXJyb3IsIHZhbGlkKTtcbiAgICAgICAgaWYgKGhhbmRsZVN0eWxlKSBzZWxmLl9oYW5kbGVTdHlsZShpbnB1dCwgdmFsaWQpO1xuXG4gICAgICAgIHNlbGYub3B0cy5vblZhbGlkYXRlLmNhbGwoc2VsZiwgaW5wdXQsIHJ1bGUsIHZhbGlkKTtcblxuICAgICAgICByZXR1cm4gdmFsaWQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbmplY3QoJ192YWxpZGF0ZScsIGlucHV0LCBydWxlLCB2YWxpZCk7XG5cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH0sXG5cbiAgX3ZhbGlkYXRlQWxsOiBmdW5jdGlvbihoYW5kbGVFcnJvciwgaGFuZGxlU3R5bGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy4kaW5wdXRzLmVhY2goZnVuY3Rpb24oKXsgc2VsZi5fdmFsaWRhdGUodGhpcywgaGFuZGxlRXJyb3IsIGhhbmRsZVN0eWxlKTsgfSk7XG4gIH1cbn07XG4iLCIvKipcbiAqIFB1YmxpYyBtZXRob2RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFkZFJ1bGVzOiBmdW5jdGlvbihydWxlcykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyICRpbnB1dHMgPSB0aGlzLiRmb3JtLmZpbmQoJC5tYXAocnVsZXMsIGZ1bmN0aW9uKF8sIG5hbWUpIHtcbiAgICAgIHJldHVybiAnW25hbWU9XCInKyBuYW1lICsnXCJdJztcbiAgICB9KS5qb2luKCcsJykpO1xuXG4gICAgJC5leHRlbmQodGhpcy5vcHRzLnJ1bGVzLCBydWxlcyk7XG5cbiAgICAkaW5wdXRzLmVhY2goZnVuY3Rpb24oKXsgc2VsZi5fYnVpbGRGaWVsZCh0aGlzKSB9KTtcbiAgICB0aGlzLiRpbnB1dHMgPSB0aGlzLiRpbnB1dHMuYWRkKCRpbnB1dHMpO1xuXG4gICAgdGhpcy5fdmFsaWRhdGVBbGwodHJ1ZSk7XG4gICAgdGhpcy4kZmllbGRzLmZpbmQodGhpcy5vcHRzLmVycm9yKS5oaWRlKCk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ2FkZFJ1bGVzJyk7XG4gIH0sXG5cbiAgZ2V0SW52YWxpZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGZpZWxkcy5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJCh0aGlzKS5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJykgPT09IGZhbHNlO1xuICAgIH0pO1xuICB9LFxuXG4gIGZvY3VzRmlyc3RJbnZhbGlkOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBmaXJzdEludmFsaWQgPSB0aGlzLl9nZXRGaXJzdEludmFsaWQoKVswXTtcblxuICAgIGlmIChmaXJzdEludmFsaWQpIHtcbiAgICAgIHRoaXMuX2hhbmRsZUVycm9yKGZpcnN0SW52YWxpZCk7XG4gICAgICB0aGlzLl9oYW5kbGVTdHlsZShmaXJzdEludmFsaWQpO1xuICAgICAgdGhpcy5faW5qZWN0KCdmb2N1c0ZpcnN0SW52YWxpZCcsIGZpcnN0SW52YWxpZCk7XG4gICAgICAkKGZpcnN0SW52YWxpZCkuZm9jdXMoKTtcbiAgICB9XG4gIH0sXG5cbiAgaXNWYWxpZDogZnVuY3Rpb24obmFtZSkge1xuICAgIGlmIChuYW1lKSByZXR1cm4gISB0aGlzLmdldEludmFsaWQoKS5maW5kKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKS5sZW5ndGg7XG4gICAgcmV0dXJuICEgdGhpcy5nZXRJbnZhbGlkKCkubGVuZ3RoO1xuICB9LFxuXG4gIHJlc2V0OiBmdW5jdGlvbihuYW1lKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGlucHV0cyA9IHRoaXMuJGlucHV0cztcblxuICAgIGlmIChuYW1lKSAkaW5wdXRzID0gJGlucHV0cy5maWx0ZXIoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpO1xuXG4gICAgJGlucHV0cy5maWx0ZXIoJ2lucHV0Om5vdCg6Y2hlY2tib3gsIDpyYWRpbyksIHRleHRhcmVhJykudmFsKCcnKTtcbiAgICAkaW5wdXRzLmZpbHRlcignOmNoZWNrYm94LCA6cmFkaW8nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICRpbnB1dHMuZmlsdGVyKCdzZWxlY3QnKS5maW5kKCdvcHRpb24nKS5wcm9wKCdzZWxlY3RlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdFNlbGVjdGVkO1xuICAgIH0pO1xuXG4gICAgJGlucHV0cy5jaGFuZ2UoKS5lYWNoKGZ1bmN0aW9uKCl7IHNlbGYuX2ZyZXNoKHRoaXMpIH0pO1xuXG4gICAgdGhpcy5faW5qZWN0KCdyZXNldCcsIG5hbWUpO1xuICB9XG5cbn07XG4iLCIvKipcbiAqIFJ1bGVzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHJlcXVpcmVkOiAvLisvLFxuICBkaWdpdHM6IC9eXFxkKyQvLFxuICBlbWFpbDogL15bXkBdK0BbXkBdK1xcLi57Miw2fSQvLFxuICB1c2VybmFtZTogL15bYS16XSg/PVtcXHcuXXszLDMxfSQpXFx3KlxcLj9cXHcqJC9pLFxuICBwYXNzOiAvKD89LipcXGQpKD89LipbYS16XSkoPz0uKltBLVpdKS57Nix9LyxcbiAgc3Ryb25ncGFzczogLyg/PV4uezgsfSQpKCg/PS4qXFxkKXwoPz0uKlxcVyspKSg/IVsuXFxuXSkoPz0uKltBLVpdKSg/PS4qW2Etel0pLiokLyxcbiAgcGhvbmU6IC9eWzItOV1cXGR7Mn0tXFxkezN9LVxcZHs0fSQvLFxuICB6aXA6IC9eXFxkezV9JHxeXFxkezV9LVxcZHs0fSQvLFxuICB1cmw6IC9eKD86KGZ0cHxodHRwfGh0dHBzKTpcXC9cXC8pPyg/OltcXHdcXC1dK1xcLikrW2Etel17Miw2fShbXFw6XFwvPyNdLiopPyQvaSxcblxuICBudW1iZXI6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSkge1xuICAgIHJldHVybiAhaXNOYU4odmFsdWUpO1xuICB9LFxuXG4gIHJhbmdlOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE51bWJlcih2YWx1ZSkgPj0gbWluICYmIE51bWJlcih2YWx1ZSkgPD0gbWF4O1xuICB9LFxuXG4gIG1pbjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaW4pIHtcbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoID49IG1pbjtcbiAgfSxcblxuICBtYXg6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWF4KSB7XG4gICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA8PSBtYXg7XG4gIH0sXG5cbiAgbWlub3B0aW9uOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1pbikge1xuICAgIHJldHVybiB0aGlzLl9nZXRSZWxhdGVkKGlucHV0KS5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoID49IG1pbjtcbiAgfSxcblxuICBtYXhvcHRpb246IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWF4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFJlbGF0ZWQoaW5wdXQpLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGggPD0gbWF4O1xuICB9LFxuXG4gIG1pbm1heDogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaW4sIG1heCkge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPj0gbWluICYmIHZhbHVlLmxlbmd0aCA8PSBtYXg7XG4gIH0sXG5cbiAgc2VsZWN0OiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIGRlZikge1xuICAgIHJldHVybiB2YWx1ZSAhPSBkZWY7XG4gIH0sXG5cbiAgZXh0ZW5zaW9uOiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgdmFyIGV4dGVuc2lvbnMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAgICwgdmFsaWQgPSBmYWxzZTtcblxuICAgICQuZWFjaChpbnB1dC5maWxlcyB8fCBbe25hbWU6IGlucHV0LnZhbHVlfV0sIGZ1bmN0aW9uKGksIGZpbGUpIHtcbiAgICAgIHZhbGlkID0gJC5pbkFycmF5KGZpbGUubmFtZS5zcGxpdCgnLicpLnBvcCgpLnRvTG93ZXJDYXNlKCksIGV4dGVuc2lvbnMpID4gLTE7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH0sXG5cbiAgZXF1YWx0bzogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCB0YXJnZXQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkdGFyZ2V0ID0gJCgnW25hbWU9XCInKyB0YXJnZXQgKydcIl0nKTtcblxuICAgIGlmICh0aGlzLmdldEludmFsaWQoKS5maW5kKCR0YXJnZXQpLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgJHRhcmdldC5vZmYoJ2tleXVwLmVxdWFsdG8nKS5vbigna2V5dXAuZXF1YWx0bycsIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5fZ2V0RmllbGQoaW5wdXQpLnJlbW92ZURhdGEoJ2lkZWFsZm9ybXMtdmFsdWUnKTtcbiAgICAgIHNlbGYuX3ZhbGlkYXRlKGlucHV0LCBmYWxzZSwgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW5wdXQudmFsdWUgPT0gJHRhcmdldC52YWwoKTtcbiAgfSxcblxuICBkYXRlOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIGZvcm1hdCkge1xuXG4gICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdtbS9kZC95eXl5JztcblxuICAgIHZhciBkZWxpbWl0ZXIgPSAvW15tZHldLy5leGVjKGZvcm1hdClbMF1cbiAgICAgICwgdGhlRm9ybWF0ID0gZm9ybWF0LnNwbGl0KGRlbGltaXRlcilcbiAgICAgICwgdGhlRGF0ZSA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICBmdW5jdGlvbiBpc0RhdGUoZGF0ZSwgZm9ybWF0KSB7XG5cbiAgICAgIHZhciBtLCBkLCB5O1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZm9ybWF0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICgvbS8udGVzdChmb3JtYXRbaV0pKSBtID0gZGF0ZVtpXTtcbiAgICAgICAgaWYgKC9kLy50ZXN0KGZvcm1hdFtpXSkpIGQgPSBkYXRlW2ldO1xuICAgICAgICBpZiAoL3kvLnRlc3QoZm9ybWF0W2ldKSkgeSA9IGRhdGVbaV07XG4gICAgICB9XG5cbiAgICAgIGlmICghbSB8fCAhZCB8fCAheSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gbSA+IDAgJiYgbSA8IDEzICYmXG4gICAgICAgIHkgJiYgeS5sZW5ndGggPT0gNCAmJlxuICAgICAgICBkID4gMCAmJiBkIDw9IChuZXcgRGF0ZSh5LCBtLCAwKSkuZ2V0RGF0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBpc0RhdGUodGhlRGF0ZSwgdGhlRm9ybWF0KTtcbiAgfVxuXG59O1xuIl19
