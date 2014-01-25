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

      this.opts.adaptiveWidth = $dummy.css('width').replace('px','')

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
      self._validateAll();
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

  _validateAll: function() {
    var self = this;
    this.$inputs.each(function(){ self._validate(this, true); });
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

    this._validateAll();
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

    $inputs.filter('input:not(:checkbox, :radio)').val('');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdXNyL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9lcnJvcnMuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvYWRhcHRpdmUvYWRhcHRpdmUuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2FqYXgvYWpheC5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvY3VzdG9tLWlucHV0cy9jdXN0b20taW5wdXRzLmV4dC5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2lkZWFsZmlsZS5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2lkZWFscmFkaW9jaGVjay5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9kYXRlcGlja2VyL2RhdGVwaWNrZXIuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2R5bmFtaWMtZmllbGRzL2R5bmFtaWMtZmllbGRzLmV4dC5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9zdGVwcy9pZGVhbHN0ZXBzLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL3N0ZXBzL3N0ZXBzLmV4dC5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvbWFpbi5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvcGx1Z2luLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9wcml2YXRlLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9wdWJsaWMuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3J1bGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEVycm9yc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICByZXF1aXJlZDogJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQnLFxuICBkaWdpdHM6ICdNdXN0IGJlIG9ubHkgZGlnaXRzJyxcbiAgbmFtZTogJ011c3QgYmUgYXQgbGVhc3QgMyBjaGFyYWN0ZXJzIGxvbmcgYW5kIG11c3Qgb25seSBjb250YWluIGxldHRlcnMnLFxuICBlbWFpbDogJ011c3QgYmUgYSB2YWxpZCBlbWFpbCcsXG4gIHVzZXJuYW1lOiAnTXVzdCBiZSBhdCBiZXR3ZWVuIDQgYW5kIDMyIGNoYXJhY3RlcnMgbG9uZyBhbmQgc3RhcnQgd2l0aCBhIGxldHRlci4gWW91IG1heSB1c2UgbGV0dGVycywgbnVtYmVycywgdW5kZXJzY29yZXMsIGFuZCBvbmUgZG90JyxcbiAgcGFzczogJ011c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzIGxvbmcsIGFuZCBjb250YWluIGF0IGxlYXN0IG9uZSBudW1iZXIsIG9uZSB1cHBlcmNhc2UgYW5kIG9uZSBsb3dlcmNhc2UgbGV0dGVyJyxcbiAgc3Ryb25ncGFzczogJ011c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmcgYW5kIGNvbnRhaW4gYXQgbGVhc3Qgb25lIHVwcGVyY2FzZSBhbmQgb25lIGxvd2VyY2FzZSBsZXR0ZXIgYW5kIG9uZSBudW1iZXIgb3Igc3BlY2lhbCBjaGFyYWN0ZXInLFxuICBwaG9uZTogJ011c3QgYmUgYSB2YWxpZCBwaG9uZSBudW1iZXInLFxuICB6aXA6ICdNdXN0IGJlIGEgdmFsaWQgemlwIGNvZGUnLFxuICB1cmw6ICdNdXN0IGJlIGEgdmFsaWQgVVJMJyxcbiAgbnVtYmVyOiAnTXVzdCBiZSBhIG51bWJlcicsXG4gIHJhbmdlOiAnTXVzdCBiZSBhIG51bWJlciBiZXR3ZWVuIHswfSBhbmQgezF9JyxcbiAgbWluOiAnTXVzdCBiZSBhdCBsZWFzdCB7MH0gY2hhcmFjdGVycyBsb25nJyxcbiAgbWF4OiAnTXVzdCBiZSB1bmRlciB7MH0gY2hhcmFjdGVycycsXG4gIG1pbm9wdGlvbjogJ1NlbGVjdCBhdCBsZWFzdCB7MH0gb3B0aW9ucycsXG4gIG1heG9wdGlvbjogJ1NlbGVjdCBubyBtb3JlIHRoYW4gezB9IG9wdGlvbnMnLFxuICBtaW5tYXg6ICdNdXN0IGJlIGJldHdlZW4gezB9IGFuZCB7MX0gY2hhcmFjdGVycyBsb25nJyxcbiAgc2VsZWN0OiAnU2VsZWN0IGFuIG9wdGlvbicsXG4gIGV4dGVuc2lvbjogJ0ZpbGUocykgbXVzdCBoYXZlIGEgdmFsaWQgZXh0ZW5zaW9uICh7Kn0pJyxcbiAgZXF1YWx0bzogJ011c3QgaGF2ZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgXCJ7MH1cIiBmaWVsZCcsXG4gIGRhdGU6ICdNdXN0IGJlIGEgdmFsaWQgZGF0ZSB7MH0nXG5cbn07XG4iLCIvKipcbiAqIEFkYXB0aXZlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdhZGFwdGl2ZScsXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyICRkdW1teSA9ICQoJzxwIGNsYXNzPVwiaWRlYWxmb3Jtcy1maWVsZC13aWR0aFwiLz4nKS5hcHBlbmRUbygnYm9keScpO1xuXG4gICAgICB0aGlzLm9wdHMuYWRhcHRpdmVXaWR0aCA9ICRkdW1teS5jc3MoJ3dpZHRoJykucmVwbGFjZSgncHgnLCcnKVxuXG4gICAgICBmdW5jdGlvbiBhZGFwdCgpIHtcblxuICAgICAgICB2YXIgZm9ybVdpZHRoID0gc2VsZi4kZm9ybS5vdXRlcldpZHRoKClcbiAgICAgICAgICAsIGlzQWRhcHRpdmUgPSBzZWxmLm9wdHMuYWRhcHRpdmVXaWR0aCA+IGZvcm1XaWR0aDtcblxuICAgICAgICBzZWxmLiRmb3JtLnRvZ2dsZUNsYXNzKCdhZGFwdGl2ZScsIGlzQWRhcHRpdmUpO1xuXG4gICAgICAgIGlmIChzZWxmLl9oYXNFeHRlbnNpb24oJ3N0ZXBzJykpIHtcbiAgICAgICAgICBzZWxmLiRzdGVwc0NvbnRhaW5lci50b2dnbGVDbGFzcygnYWRhcHRpdmUnLCBpc0FkYXB0aXZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJyN1aS1kYXRlcGlja2VyLWRpdicpLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgJCh3aW5kb3cpLnJlc2l6ZShhZGFwdCk7XG4gICAgICBhZGFwdCgpO1xuXG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJ3NlbGVjdCwgLmRhdGVwaWNrZXInKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLl9nZXRGaWVsZCh0aGlzKS5maW5kKHNlbGYub3B0cy5lcnJvcikuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgfSk7XG5cbiAgICAgICRkdW1teS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdhamF4JyxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAkLmV4dGVuZCgkLmlkZWFsZm9ybXMsIHsgX3JlcXVlc3RzOiB7fSB9KTtcblxuICAgICAgJC5pZGVhbGZvcm1zLmVycm9ycy5hamF4ID0gJC5pZGVhbGZvcm1zLmVycm9ycy5hamF4IHx8ICdMb2FkaW5nLi4uJztcblxuICAgICAgJC5leHRlbmQoJC5pZGVhbGZvcm1zLnJ1bGVzLCB7XG5cbiAgICAgICAgYWpheDogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgICAgICAgICwgdXJsID0gJChpbnB1dCkuZGF0YSgnaWRlYWxmb3Jtcy1hamF4JylcbiAgICAgICAgICAgICwgdXNlckVycm9yID0gJC5pZGVhbGZvcm1zLl9nZXRLZXkoJ2Vycm9ycy4nKyBpbnB1dC5uYW1lICsnLmFqYXhFcnJvcicsIHNlbGYub3B0cylcbiAgICAgICAgICAgICwgcmVxdWVzdHMgPSAkLmlkZWFsZm9ybXMuX3JlcXVlc3RzXG4gICAgICAgICAgICAsIGRhdGEgPSB7fTtcblxuICAgICAgICAgIGRhdGFbaW5wdXQubmFtZV0gPSBpbnB1dC52YWx1ZTtcblxuICAgICAgICAgICRmaWVsZC5hZGRDbGFzcygnYWpheCcpO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3RzW2lucHV0Lm5hbWVdKSByZXF1ZXN0c1tpbnB1dC5uYW1lXS5hYm9ydCgpO1xuXG4gICAgICAgICAgcmVxdWVzdHNbaW5wdXQubmFtZV0gPSAkLnBvc3QodXJsLCBkYXRhLCBmdW5jdGlvbihyZXNwKSB7XG5cbiAgICAgICAgICAgIGlmIChyZXNwID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJywgdHJ1ZSk7XG4gICAgICAgICAgICAgIHNlbGYuX2hhbmRsZUVycm9yKGlucHV0KTtcbiAgICAgICAgICAgICAgc2VsZi5faGFuZGxlU3R5bGUoaW5wdXQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VsZi5faGFuZGxlRXJyb3IoaW5wdXQsIHVzZXJFcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYub3B0cy5vblZhbGlkYXRlLmNhbGwoc2VsZiwgaW5wdXQsICdhamF4JywgcmVzcCk7XG5cbiAgICAgICAgICAgICRmaWVsZC5yZW1vdmVDbGFzcygnYWpheCcpO1xuXG4gICAgICAgICAgfSwgJ2pzb24nKTtcblxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICBfdmFsaWRhdGU6IGZ1bmN0aW9uKGlucHV0LCBydWxlKSB7XG4gICAgICBpZiAocnVsZSAhPSAnYWpheCcgJiYgJC5pZGVhbGZvcm1zLl9yZXF1ZXN0c1tpbnB1dC5uYW1lXSkge1xuICAgICAgICAkLmlkZWFsZm9ybXMuX3JlcXVlc3RzW2lucHV0Lm5hbWVdLmFib3J0KCk7XG4gICAgICAgIHRoaXMuX2dldEZpZWxkKGlucHV0KS5yZW1vdmVDbGFzcygnYWpheCcpO1xuICAgICAgfVxuICAgIH1cblxuICB9XG59O1xuIiwicmVxdWlyZSgnLi9pZGVhbGZpbGUnKTtcbnJlcXVpcmUoJy4vaWRlYWxyYWRpb2NoZWNrJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdjdXN0b21JbnB1dHMnLFxuXG4gIG9wdGlvbnM6IHtcbiAgICBjdXN0b21JbnB1dHM6IHtcbiAgICAgIGkxOG46IHtcbiAgICAgICAgb3BlbjogJ09wZW4nXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9idWlsZEN1c3RvbUlucHV0cygpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgJ2FkZEZpZWxkczphZnRlcic6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGRDdXN0b21JbnB1dHMoKTtcbiAgICB9LFxuXG4gICAgX2J1aWxkQ3VzdG9tSW5wdXRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGZvcm0uZmluZCgnOmZpbGUnKS5pZGVhbGZpbGUodGhpcy5vcHRzLmN1c3RvbUlucHV0cy5pMThuKTtcbiAgICAgIHRoaXMuJGZvcm0uZmluZCgnOmNoZWNrYm94LCA6cmFkaW8nKS5pZGVhbHJhZGlvY2hlY2soKTtcbiAgICB9XG5cbiAgfVxufTtcbiIsIi8qKlxuICogSWRlYWwgRmlsZVxuICovXG4oZnVuY3Rpb24oJCwgd2luLCBkb2MsIHVuZGVmaW5lZCkge1xuXG4gIC8vIEJyb3dzZXIgc3VwcG9ydHMgSFRNTDUgbXVsdGlwbGUgZmlsZT9cbiAgdmFyIG11bHRpcGxlU3VwcG9ydCA9IHR5cGVvZiAkKCc8aW5wdXQvPicpWzBdLm11bHRpcGxlICE9PSAndW5kZWZpbmVkJ1xuICAgICwgaXNJRSA9IC9tc2llL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KVxuICAgICwgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxmaWxlJztcblxuICBwbHVnaW4uZGVmYXVsdHMgPSB7XG4gICAgb3BlbjogJ09wZW4nXG4gIH07XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSB7XG5cbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciAkZmlsZSA9ICQodGhpcy5lbCkuYWRkQ2xhc3MoJ2lkZWFsLWZpbGUnKSAvLyB0aGUgb3JpZ2luYWwgZmlsZSBpbnB1dFxuICAgICAgICAsICR3cmFwID0gJCgnPGRpdiBjbGFzcz1cImlkZWFsLWZpbGUtd3JhcFwiPicpXG4gICAgICAgICwgJGlucHV0ID0gJCgnPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJpZGVhbC1maWxlLWZpbGVuYW1lXCIgLz4nKVxuICAgICAgICAgIC8vIEJ1dHRvbiB0aGF0IHdpbGwgYmUgdXNlZCBpbiBub24tSUUgYnJvd3NlcnNcbiAgICAgICAgLCAkYnV0dG9uID0gJCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJpZGVhbC1maWxlLXVwbG9hZFwiPicrIHRoaXMub3B0cy5vcGVuICsnPC9idXR0b24+JylcbiAgICAgICAgICAvLyBIYWNrIGZvciBJRVxuICAgICAgICAsICRsYWJlbCA9ICQoJzxsYWJlbCBjbGFzcz1cImlkZWFsLWZpbGUtdXBsb2FkXCIgZm9yPVwiJyArICRmaWxlWzBdLmlkICsgJ1wiPicrIHRoaXMub3B0cy5vcGVuICsnPC9sYWJlbD4nKTtcblxuICAgICAgaWYgKGlzSUUpICRsYWJlbC5hZGQoJGJ1dHRvbikuYWRkQ2xhc3MoJ2llJyk7XG5cbiAgICAgIC8vIEhpZGUgYnkgc2hpZnRpbmcgdG8gdGhlIGxlZnQgc28gd2VcbiAgICAgIC8vIGNhbiBzdGlsbCB0cmlnZ2VyIGV2ZW50c1xuICAgICAgJGZpbGUuY3NzKHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIGxlZnQ6ICctOTk5OXB4J1xuICAgICAgfSk7XG5cbiAgICAgICR3cmFwLmFwcGVuZCgkaW5wdXQsIChpc0lFID8gJGxhYmVsIDogJGJ1dHRvbikpLmluc2VydEFmdGVyKCRmaWxlKTtcblxuICAgICAgLy8gUHJldmVudCBmb2N1c1xuICAgICAgJGZpbGUuYXR0cigndGFiSW5kZXgnLCAtMSk7XG4gICAgICAkYnV0dG9uLmF0dHIoJ3RhYkluZGV4JywgLTEpO1xuXG4gICAgICAkYnV0dG9uLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGZpbGUuZm9jdXMoKS5jbGljaygpOyAvLyBPcGVuIGRpYWxvZ1xuICAgICAgfSk7XG5cbiAgICAgICRmaWxlLmNoYW5nZShmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGZpbGVzID0gW11cbiAgICAgICAgICAsIGZpbGVBcnIsIGZpbGVuYW1lO1xuXG4gICAgICAgICAgLy8gSWYgbXVsdGlwbGUgaXMgc3VwcG9ydGVkIHRoZW4gZXh0cmFjdFxuICAgICAgICAgIC8vIGFsbCBmaWxlbmFtZXMgZnJvbSB0aGUgZmlsZSBhcnJheVxuICAgICAgICBpZiAobXVsdGlwbGVTdXBwb3J0KSB7XG4gICAgICAgICAgZmlsZUFyciA9ICRmaWxlWzBdLmZpbGVzO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBmaWxlQXJyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlcy5wdXNoKGZpbGVBcnJbaV0ubmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpbGVuYW1lID0gZmlsZXMuam9pbignLCAnKTtcblxuICAgICAgICAgIC8vIElmIG5vdCBzdXBwb3J0ZWQgdGhlbiBqdXN0IHRha2UgdGhlIHZhbHVlXG4gICAgICAgICAgLy8gYW5kIHJlbW92ZSB0aGUgcGF0aCB0byBqdXN0IHNob3cgdGhlIGZpbGVuYW1lXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmlsZW5hbWUgPSAkZmlsZS52YWwoKS5zcGxpdCgnXFxcXCcpLnBvcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGlucHV0IC52YWwoZmlsZW5hbWUpLmF0dHIoJ3RpdGxlJywgZmlsZW5hbWUpO1xuXG4gICAgICB9KTtcblxuICAgICAgJGlucHV0Lm9uKHtcbiAgICAgICAgYmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRmaWxlLnRyaWdnZXIoJ2JsdXInKTtcbiAgICAgICAgfSxcbiAgICAgICAga2V5ZG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMTMpIHsgLy8gRW50ZXJcbiAgICAgICAgICAgIGlmICghaXNJRSkgJGZpbGUudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnZm9ybScpLm9uZSgna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEzKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDggfHwgZS53aGljaCA9PT0gNDYpIHsgLy8gQmFja3NwYWNlICYgRGVsXG4gICAgICAgICAgICAvLyBJbiBJRSB0aGUgdmFsdWUgaXMgcmVhZC1vbmx5XG4gICAgICAgICAgICAvLyB3aXRoIHRoaXMgdHJpY2sgd2UgcmVtb3ZlIHRoZSBvbGQgaW5wdXQgYW5kIGFkZFxuICAgICAgICAgICAgLy8gYSBjbGVhbiBjbG9uZSB3aXRoIGFsbCB0aGUgb3JpZ2luYWwgZXZlbnRzIGF0dGFjaGVkXG4gICAgICAgICAgICBpZiAoaXNJRSkgJGZpbGUucmVwbGFjZVdpdGgoJGZpbGUgPSAkZmlsZS5jbG9uZSh0cnVlKSk7XG4gICAgICAgICAgICAkZmlsZS52YWwoJycpLnRyaWdnZXIoJ2NoYW5nZScpO1xuICAgICAgICAgICAgJGlucHV0LnZhbCgnJyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSA5KSB7IC8vIFRBQlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7IC8vIEFsbCBvdGhlciBrZXlzXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH1cblxuICB9O1xuXG4gIHJlcXVpcmUoJy4uLy4uL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iLCIvKlxuICogaWRlYWxSYWRpb0NoZWNrOiBqUXVlcnkgcGxndWluIGZvciBjaGVja2JveCBhbmQgcmFkaW8gcmVwbGFjZW1lbnRcbiAqIFVzYWdlOiAkKCdpbnB1dFt0eXBlPWNoZWNrYm94XSwgaW5wdXRbdHlwZT1yYWRpb10nKS5pZGVhbFJhZGlvQ2hlY2soKVxuICovXG4oZnVuY3Rpb24oJCwgd2luLCBkb2MsIHVuZGVmaW5lZCkge1xuXG4gIHZhciBwbHVnaW4gPSB7fTtcblxuICBwbHVnaW4ubmFtZSA9ICdpZGVhbHJhZGlvY2hlY2snO1xuXG4gIHBsdWdpbi5tZXRob2RzID0ge1xuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgJGlucHV0ID0gJCh0aGlzLmVsKTtcbiAgICAgIHZhciAkc3BhbiA9ICQoJzxzcGFuLz4nKTtcblxuICAgICAgJHNwYW4uYWRkQ2xhc3MoJ2lkZWFsLScrICgkaW5wdXQuaXMoJzpjaGVja2JveCcpID8gJ2NoZWNrJyA6ICdyYWRpbycpKTtcbiAgICAgICRpbnB1dC5pcygnOmNoZWNrZWQnKSAmJiAkc3Bhbi5hZGRDbGFzcygnY2hlY2tlZCcpOyAvLyBpbml0XG4gICAgICAkc3Bhbi5pbnNlcnRBZnRlcigkaW5wdXQpO1xuXG4gICAgICAkaW5wdXQucGFyZW50KCdsYWJlbCcpXG4gICAgICAgIC5hZGRDbGFzcygnaWRlYWwtcmFkaW9jaGVjay1sYWJlbCcpXG4gICAgICAgIC5hdHRyKCdvbmNsaWNrJywgJycpOyAvLyBGaXggY2xpY2tpbmcgbGFiZWwgaW4gaU9TXG5cbiAgICAgICRpbnB1dC5jc3MoeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgbGVmdDogJy05OTk5cHgnIH0pOyAvLyBoaWRlIGJ5IHNoaWZ0aW5nIGxlZnRcblxuICAgICAgLy8gRXZlbnRzXG4gICAgICAkaW5wdXQub24oe1xuICAgICAgICBjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkaW5wdXQgPSAkKHRoaXMpO1xuICAgICAgICAgIGlmICggJGlucHV0LmlzKCdpbnB1dFt0eXBlPVwicmFkaW9cIl0nKSApIHtcbiAgICAgICAgICAgICRpbnB1dC5wYXJlbnQoKS5zaWJsaW5ncygnbGFiZWwnKS5maW5kKCcuaWRlYWwtcmFkaW8nKS5yZW1vdmVDbGFzcygnY2hlY2tlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkc3Bhbi50b2dnbGVDbGFzcygnY2hlY2tlZCcsICRpbnB1dC5pcygnOmNoZWNrZWQnKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvY3VzOiBmdW5jdGlvbigpIHsgJHNwYW4uYWRkQ2xhc3MoJ2ZvY3VzJykgfSxcbiAgICAgICAgYmx1cjogZnVuY3Rpb24oKSB7ICRzcGFuLnJlbW92ZUNsYXNzKCdmb2N1cycpIH0sXG4gICAgICAgIGNsaWNrOiBmdW5jdGlvbigpIHsgJCh0aGlzKS50cmlnZ2VyKCdmb2N1cycpIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICB9O1xuXG4gIHJlcXVpcmUoJy4uLy4uL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdkYXRlcGlja2VyJyxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGREYXRlcGlja2VyKCk7XG4gICAgfSxcblxuICAgX2J1aWxkRGF0ZXBpY2tlcjogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciAkZGF0ZXBpY2tlciA9IHRoaXMuJGZvcm0uZmluZCgnaW5wdXQuZGF0ZXBpY2tlcicpO1xuXG4gICAgICAvLyBBbHdheXMgc2hvdyBkYXRlcGlja2VyIGJlbG93IHRoZSBpbnB1dFxuICAgICAgaWYgKGpRdWVyeS51aSkge1xuICAgICAgICAkLmRhdGVwaWNrZXIuX2NoZWNrT2Zmc2V0ID0gZnVuY3Rpb24oYSxiLGMpeyByZXR1cm4gYiB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoalF1ZXJ5LnVpICYmICRkYXRlcGlja2VyLmxlbmd0aCkge1xuXG4gICAgICAgICRkYXRlcGlja2VyLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIoe1xuICAgICAgICAgICAgYmVmb3JlU2hvdzogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgICAgICAgJChpbnB1dCkuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNoYW5nZU1vbnRoWWVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIC8vIEhhY2sgdG8gZml4IElFOSBub3QgcmVzaXppbmdcbiAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxuICAgICAgICAgICAgICAgICwgd2lkdGggPSAkdGhpcy5vdXRlcldpZHRoKCk7IC8vIGNhY2hlIGZpcnN0IVxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICR0aGlzLmRhdGVwaWNrZXIoJ3dpZGdldCcpLmNzcygnd2lkdGgnLCB3aWR0aCk7XG4gICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkanVzdCB3aWR0aFxuICAgICAgICAkZGF0ZXBpY2tlci5vbignZm9jdXMga2V5dXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgdCA9ICQodGhpcyksIHcgPSB0Lm91dGVyV2lkdGgoKTtcbiAgICAgICAgICB0LmRhdGVwaWNrZXIoJ3dpZGdldCcpLmNzcygnd2lkdGgnLCB3KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbn07XG4iLCJmdW5jdGlvbiB0ZW1wbGF0ZShodG1sLCBkYXRhKSB7XG5cbiAgdmFyIGxvb3AgPSAvXFx7QChbXn1dKylcXH0oLis/KVxce1xcL1xcMVxcfS9nXG4gICAgLCBsb29wVmFyaWFibGUgPSAvXFx7IyhbXn1dKylcXH0vZ1xuICAgICwgdmFyaWFibGUgPSAvXFx7KFtefV0rKVxcfS9nO1xuXG4gIHJldHVybiBodG1sXG4gICAgLnJlcGxhY2UobG9vcCwgZnVuY3Rpb24oXywga2V5LCBsaXN0KSB7XG4gICAgICByZXR1cm4gJC5tYXAoZGF0YVtrZXldLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBsaXN0LnJlcGxhY2UobG9vcFZhcmlhYmxlLCBmdW5jdGlvbihfLCBrKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW1ba107XG4gICAgICAgIH0pO1xuICAgICAgfSkuam9pbignJyk7XG4gICAgfSlcbiAgICAucmVwbGFjZSh2YXJpYWJsZSwgZnVuY3Rpb24oXywga2V5KSB7XG4gICAgICByZXR1cm4gZGF0YVtrZXldIHx8ICcnO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnZHluYW1pY0ZpZWxkcycsXG5cbiAgb3B0aW9uczoge1xuXG4gICAgdGVtcGxhdGVzOiB7XG5cbiAgICAgIGJhc2U6J1xcXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZFwiPlxcXG4gICAgICAgICAgPGxhYmVsIGNsYXNzPVwibWFpblwiPntsYWJlbH08L2xhYmVsPlxcXG4gICAgICAgICAge2ZpZWxkfVxcXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJlcnJvclwiPjwvc3Bhbj5cXFxuICAgICAgICA8L2Rpdj5cXFxuICAgICAgJyxcblxuICAgICAgdGV4dDogJzxpbnB1dCBuYW1lPVwie25hbWV9XCIgdHlwZT1cIntzdWJ0eXBlfVwiIHZhbHVlPVwie3ZhbHVlfVwiIHthdHRyc30+JyxcblxuICAgICAgZmlsZTogJzxpbnB1dCBpZD1cIntuYW1lfSBcIm5hbWU9XCJ7bmFtZX1cIiB0eXBlPVwiZmlsZVwiIHthdHRyc30+JyxcblxuICAgICAgdGV4dGFyZWE6ICc8dGV4dGFyZWEgbmFtZT1cIntuYW1lfVwiIHthdHRyc30+e3RleHR9PC90ZXh0YXJlYT4nLFxuXG4gICAgICBncm91cDogJ1xcXG4gICAgICAgIDxwIGNsYXNzPVwiZ3JvdXBcIj5cXFxuICAgICAgICAgIHtAbGlzdH1cXFxuICAgICAgICAgIDxsYWJlbD48aW5wdXQgbmFtZT1cIntuYW1lfVwiIHR5cGU9XCJ7c3VidHlwZX1cIiB2YWx1ZT1cInsjdmFsdWV9XCIgeyNhdHRyc30+eyN0ZXh0fTwvbGFiZWw+XFxcbiAgICAgICAgICB7L2xpc3R9XFxcbiAgICAgICAgPC9wPlxcXG4gICAgICAnLFxuXG4gICAgICBzZWxlY3Q6ICdcXFxuICAgICAgICA8c2VsZWN0IG5hbWU9e25hbWV9PlxcXG4gICAgICAgICAge0BsaXN0fVxcXG4gICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInsjdmFsdWV9XCI+eyN0ZXh0fTwvb3B0aW9uPlxcXG4gICAgICAgICAgey9saXN0fVxcXG4gICAgICAgIDwvc2VsZWN0PlxcXG4gICAgICAnXG4gICAgfVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIGFkZEZpZWxkczogZnVuY3Rpb24oZmllbGRzKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKGZpZWxkcywgZnVuY3Rpb24obmFtZSwgZmllbGQpIHtcblxuICAgICAgICB2YXIgdHlwZUFycmF5ID0gZmllbGQudHlwZS5zcGxpdCgnOicpXG4gICAgICAgICAgLCBydWxlcyA9IHt9XG4gICAgICAgICAgLCAkbGFzdCA9IHNlbGYuJGZvcm0uZmluZChzZWxmLm9wdHMuZmllbGQpLmxhc3QoKTtcblxuICAgICAgICBmaWVsZC5uYW1lID0gbmFtZTtcbiAgICAgICAgZmllbGQudHlwZSA9IHR5cGVBcnJheVswXTtcbiAgICAgICAgaWYgKHR5cGVBcnJheVsxXSkgZmllbGQuc3VidHlwZSA9IHR5cGVBcnJheVsxXTtcblxuICAgICAgICBmaWVsZC5odG1sID0gdGVtcGxhdGUoc2VsZi5vcHRzLnRlbXBsYXRlcy5iYXNlLCB7XG4gICAgICAgICAgbGFiZWw6IGZpZWxkLmxhYmVsLFxuICAgICAgICAgIGZpZWxkOiB0ZW1wbGF0ZShzZWxmLm9wdHMudGVtcGxhdGVzW2ZpZWxkLnR5cGVdLCBmaWVsZClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5faW5qZWN0KCdhZGRGaWVsZHM6YmVmb3JlJywgZmllbGQpO1xuXG4gICAgICAgIGlmIChmaWVsZC5hZnRlciB8fCBmaWVsZC5iZWZvcmUpIHtcbiAgICAgICAgICBzZWxmLiRmb3JtLmZpbmQoJ1tuYW1lPVwiJysgKGZpZWxkLmFmdGVyIHx8IGZpZWxkLmJlZm9yZSkgKydcIl0nKS5maXJzdCgpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9nZXRGaWVsZCh0aGlzKVtmaWVsZC5hZnRlciA/ICdhZnRlcicgOiAnYmVmb3JlJ10oZmllbGQuaHRtbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRm9ybSBoYXMgYXQgbGVhc3Qgb25lIGZpZWxkXG4gICAgICAgICAgaWYgKCRsYXN0Lmxlbmd0aCkgJGxhc3QuYWZ0ZXIoZmllbGQuaHRtbCk7XG4gICAgICAgICAgLy8gRm9ybSBoYXMgbm8gZmllbGRzXG4gICAgICAgICAgZWxzZSBzZWxmLiRmb3JtLmFwcGVuZChmaWVsZC5odG1sKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZC5ydWxlcykge1xuICAgICAgICAgIHJ1bGVzW25hbWVdID0gZmllbGQucnVsZXM7XG4gICAgICAgICAgc2VsZi5hZGRSdWxlcyhydWxlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLl9pbmplY3QoJ2FkZEZpZWxkczphZnRlcicsIGZpZWxkKTtcbiAgICAgIH0pO1xuXG4gICAgfSxcblxuICAgIHJlbW92ZUZpZWxkczogZnVuY3Rpb24obmFtZXMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2gobmFtZXMuc3BsaXQoJyAnKSwgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgICB2YXIgJGZpZWxkID0gc2VsZi5fZ2V0RmllbGQoJCgnW25hbWU9XCInKyBuYW1lICsnXCJdJykpO1xuICAgICAgICBzZWxmLiRmaWVsZHMgPSBzZWxmLiRmaWVsZHMuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAhICQodGhpcykuaXMoJGZpZWxkKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRmaWVsZC5yZW1vdmUoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9pbmplY3QoJ3JlbW92ZUZpZWxkcycpO1xuICAgIH0sXG5cbiAgICB0b2dnbGVGaWVsZHM6IGZ1bmN0aW9uKG5hbWVzKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKG5hbWVzLnNwbGl0KCcgJyksIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgICAgdmFyICRmaWVsZCA9IHNlbGYuX2dldEZpZWxkKCQoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpKTtcbiAgICAgICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnLCAkZmllbGQuaXMoJzp2aXNpYmxlJykpLnRvZ2dsZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2luamVjdCgndG9nZ2xlRmllbGRzJyk7XG4gICAgfVxuXG4gIH1cbn07XG4iLCIvKiFcbiAqIElkZWFsIFN0ZXBzXG4qL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICB2YXIgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxzdGVwcyc7XG5cbiAgcGx1Z2luLmRlZmF1bHRzID0ge1xuICAgIG5hdjogJy5pZGVhbHN0ZXBzLW5hdicsXG4gICAgbmF2SXRlbXM6ICdsaScsXG4gICAgYnVpbGROYXZJdGVtczogdHJ1ZSxcbiAgICB3cmFwOiAnLmlkZWFsc3RlcHMtd3JhcCcsXG4gICAgc3RlcDogJy5pZGVhbHN0ZXBzLXN0ZXAnLFxuICAgIGFjdGl2ZUNsYXNzOiAnaWRlYWxzdGVwcy1zdGVwLWFjdGl2ZScsXG4gICAgYmVmb3JlOiAkLm5vb3AsXG4gICAgYWZ0ZXI6ICQubm9vcCxcbiAgICBmYWRlU3BlZWQ6IDBcbiAgfTtcblxuICBwbHVnaW4ubWV0aG9kcyA9IHtcblxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIGFjdGl2ZSA9IHRoaXMub3B0cy5hY3RpdmVDbGFzcztcblxuICAgICAgdGhpcy4kZWwgPSAkKHRoaXMuZWwpO1xuXG4gICAgICB0aGlzLiRuYXYgPSB0aGlzLiRlbC5maW5kKHRoaXMub3B0cy5uYXYpO1xuICAgICAgdGhpcy4kbmF2SXRlbXMgPSB0aGlzLiRuYXYuZmluZCh0aGlzLm9wdHMubmF2SXRlbXMpO1xuXG4gICAgICB0aGlzLiR3cmFwID0gdGhpcy4kZWwuZmluZCh0aGlzLm9wdHMud3JhcCk7XG4gICAgICB0aGlzLiRzdGVwcyA9IHRoaXMuJHdyYXAuZmluZCh0aGlzLm9wdHMuc3RlcCk7XG5cbiAgICAgIGlmICh0aGlzLm9wdHMuYnVpbGROYXZJdGVtcykgdGhpcy5fYnVpbGROYXZJdGVtcygpO1xuXG4gICAgICB0aGlzLiRzdGVwcy5oaWRlKCkuZmlyc3QoKS5zaG93KCk7XG4gICAgICB0aGlzLiRuYXZJdGVtcy5yZW1vdmVDbGFzcyhhY3RpdmUpLmZpcnN0KCkuYWRkQ2xhc3MoYWN0aXZlKTtcblxuICAgICAgdGhpcy4kbmF2SXRlbXMuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICghICQodGhpcykuaXMoJy4nKyBzZWxmLm9wdHMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgc2VsZi5nbyhzZWxmLiRuYXZJdGVtcy5pbmRleCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfYnVpbGROYXZJdGVtczogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBpc0N1c3RvbSA9IHR5cGVvZiB0aGlzLm9wdHMuYnVpbGROYXZJdGVtcyA9PSAnZnVuY3Rpb24nLFxuICAgICAgICAgIGl0ZW0gPSBmdW5jdGlvbih2YWwpeyByZXR1cm4gJzxsaT48YSBocmVmPVwiI1wiIHRhYmluZGV4PVwiLTFcIj4nKyB2YWwgKyc8L2E+PC9saT4nOyB9LFxuICAgICAgICAgIGl0ZW1zO1xuXG4gICAgICBpdGVtcyA9IGlzQ3VzdG9tID9cbiAgICAgICAgdGhpcy4kc3RlcHMubWFwKGZ1bmN0aW9uKGkpeyByZXR1cm4gaXRlbShzZWxmLm9wdHMuYnVpbGROYXZJdGVtcy5jYWxsKHNlbGYsIGkpKSB9KS5nZXQoKSA6XG4gICAgICAgIHRoaXMuJHN0ZXBzLm1hcChmdW5jdGlvbihpKXsgcmV0dXJuIGl0ZW0oKytpKTsgfSkuZ2V0KCk7XG5cbiAgICAgIHRoaXMuJG5hdkl0ZW1zID0gJChpdGVtcy5qb2luKCcnKSk7XG5cbiAgICAgIHRoaXMuJG5hdi5hcHBlbmQoJCgnPHVsLz4nKS5hcHBlbmQodGhpcy4kbmF2SXRlbXMpKTtcbiAgICB9LFxuXG4gICAgX2dldEN1cklkeDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy4kc3RlcHMuaW5kZXgodGhpcy4kc3RlcHMuZmlsdGVyKCc6dmlzaWJsZScpKTtcbiAgICB9LFxuXG4gICAgZ286IGZ1bmN0aW9uKGlkeCkge1xuXG4gICAgICB2YXIgYWN0aXZlID0gdGhpcy5vcHRzLmFjdGl2ZUNsYXNzLFxuICAgICAgICAgIGZhZGVTcGVlZCA9IHRoaXMub3B0cy5mYWRlU3BlZWQ7XG5cbiAgICAgIGlmICh0eXBlb2YgaWR4ID09ICdmdW5jdGlvbicpIGlkeCA9IGlkeC5jYWxsKHRoaXMsIHRoaXMuX2dldEN1cklkeCgpKTtcblxuICAgICAgaWYgKGlkeCA+PSB0aGlzLiRzdGVwcy5sZW5ndGgpIGlkeCA9IDA7XG4gICAgICBpZiAoaWR4IDwgMCkgaWR4ID0gdGhpcy4kc3RlcHMubGVuZ3RoLTE7XG5cbiAgICAgIHRoaXMub3B0cy5iZWZvcmUuY2FsbCh0aGlzLCBpZHgpO1xuXG4gICAgICB0aGlzLiRuYXZJdGVtcy5yZW1vdmVDbGFzcyhhY3RpdmUpLmVxKGlkeCkuYWRkQ2xhc3MoYWN0aXZlKTtcbiAgICAgIHRoaXMuJHN0ZXBzLmhpZGUoKS5lcShpZHgpLmZhZGVJbihmYWRlU3BlZWQpO1xuXG4gICAgICB0aGlzLm9wdHMuYWZ0ZXIuY2FsbCh0aGlzLCBpZHgpO1xuICAgIH0sXG5cbiAgICBwcmV2OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28odGhpcy5fZ2V0Q3VySWR4KCkgLSAxKTtcbiAgICB9LFxuXG4gICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKHRoaXMuX2dldEN1cklkeCgpICsgMSk7XG4gICAgfSxcblxuICAgIGZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28oMCk7XG4gICAgfSxcblxuICAgIGxhc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbyh0aGlzLiRzdGVwcy5sZW5ndGgtMSk7XG4gICAgfVxuICB9O1xuXG4gIHJlcXVpcmUoJy4uLy4uL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iLCJyZXF1aXJlKCcuL2lkZWFsc3RlcHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ3N0ZXBzJyxcblxuICBvcHRpb25zOiB7XG5cbiAgICBzdGVwczoge1xuXG4gICAgICBjb250YWluZXI6ICcuaWRlYWxzdGVwcy1jb250YWluZXInLFxuICAgICAgbmF2OiAnLmlkZWFsc3RlcHMtbmF2JyxcbiAgICAgIG5hdkl0ZW1zOiAnbGknLFxuICAgICAgYnVpbGROYXZJdGVtczogZnVuY3Rpb24oaSkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRzLnN0ZXBzLmkxOG4uc3RlcCArJyAnKyAoaSsxKTtcbiAgICAgIH0sXG4gICAgICB3cmFwOiAnLmlkZWFsc3RlcHMtd3JhcCcsXG4gICAgICBzdGVwOiAnLmlkZWFsc3RlcHMtc3RlcCcsXG4gICAgICBhY3RpdmVDbGFzczogJ2lkZWFsc3RlcHMtc3RlcC1hY3RpdmUnLFxuICAgICAgYmVmb3JlOiAkLm5vb3AsXG4gICAgICBhZnRlcjogJC5ub29wLFxuICAgICAgZmFkZVNwZWVkOiAwLFxuXG4gICAgICBpMThuOiB7XG4gICAgICAgIHN0ZXA6ICdTdGVwJ1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGRTdGVwcygpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX3ZhbGlkYXRlOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuXG4gICAgICBpZiAodGhpcy5faGFzRXh0ZW5zaW9uKCdhamF4JykpIHtcbiAgICAgICAgJC5lYWNoKCQuaWRlYWxmb3Jtcy5fcmVxdWVzdHMsIGZ1bmN0aW9uKGtleSwgcmVxdWVzdCkge1xuICAgICAgICAgIHJlcXVlc3QuZG9uZShmdW5jdGlvbigpeyBzZWxmLl91cGRhdGVTdGVwcygpIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIGZvY3VzRmlyc3RJbnZhbGlkOiBmdW5jdGlvbihmaXJzdEludmFsaWQpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdnbycsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kc3RlcHMuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkKHRoaXMpLmZpbmQoZmlyc3RJbnZhbGlkKS5sZW5ndGg7XG4gICAgICAgIH0pLmluZGV4KCk7XG4gICAgICB9KTtcblxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyAkKGZpcnN0SW52YWxpZCkuZm9jdXMoKSB9LCB0aGlzLm9wdHMuc3RlcHMuZmFkZVNwZWVkKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIGFkZFJ1bGVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZmlyc3RTdGVwKCk7XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICAnYWRkRmllbGRzOmJlZm9yZSc6IGZ1bmN0aW9uKGZpZWxkKSB7XG5cbiAgICAgIGlmIChmaWVsZC5hZnRlciB8fCBmaWVsZC5iZWZvcmUpIHJldHVybjtcblxuICAgICAgdmFyICRzdGVwcyA9IHRoaXMuJHN0ZXBzQ29udGFpbmVyLmZpbmQodGhpcy5vcHRzLnN0ZXBzLnN0ZXApO1xuXG4gICAgICBpZiAoISAoJ2FwcGVuZFRvU3RlcCcgaW4gZmllbGQpKSB7XG4gICAgICAgIGZpZWxkLmFwcGVuZFRvU3RlcCA9ICRzdGVwcy5sZW5ndGgtMTtcbiAgICAgIH1cblxuICAgICAgZmllbGQuYWZ0ZXIgPSAkc3RlcHNcbiAgICAgICAgLmVxKGZpZWxkLmFwcGVuZFRvU3RlcClcbiAgICAgICAgLmZpbmQoJ2lucHV0LCBzZWxlY3QsIHRleHRhcmVhJylcbiAgICAgICAgLmxhc3QoKVswXS5uYW1lO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgdG9nZ2xlRmllbGRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0ZXBzKCk7XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICByZW1vdmVGaWVsZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fdXBkYXRlU3RlcHMoKTtcbiAgICB9LFxuXG4gICAgX2J1aWxkU3RlcHM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIG9wdGlvbnNcbiAgICAgICAgLCBoYXNSdWxlcyA9ICEgJC5pc0VtcHR5T2JqZWN0KHRoaXMub3B0cy5ydWxlcylcbiAgICAgICAgLCBidWlsZE5hdkl0ZW1zID0gdGhpcy5vcHRzLnN0ZXBzLmJ1aWxkTmF2SXRlbXNcbiAgICAgICAgLCBjb3VudGVyID0gaGFzUnVsZXNcbiAgICAgICAgICA/ICc8c3BhbiBjbGFzcz1cImNvdW50ZXJcIi8+J1xuICAgICAgICAgIDogJzxzcGFuIGNsYXNzPVwiY291bnRlciB6ZXJvXCI+MDwvc3Bhbj4nO1xuXG4gICAgICBpZiAodGhpcy5vcHRzLnN0ZXBzLmJ1aWxkTmF2SXRlbXMpIHtcbiAgICAgICAgdGhpcy5vcHRzLnN0ZXBzLmJ1aWxkTmF2SXRlbXMgPSBmdW5jdGlvbihpKSB7XG4gICAgICAgICAgcmV0dXJuIGJ1aWxkTmF2SXRlbXMuY2FsbChzZWxmLCBpKSArIGNvdW50ZXI7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyID0gdGhpcy4kZm9ybVxuICAgICAgICAuY2xvc2VzdCh0aGlzLm9wdHMuc3RlcHMuY29udGFpbmVyKVxuICAgICAgICAuaWRlYWxzdGVwcyh0aGlzLm9wdHMuc3RlcHMpO1xuICAgIH0sXG5cbiAgICBfdXBkYXRlU3RlcHM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ19pbmplY3QnLCBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgaWRlYWxzdGVwcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy4kbmF2SXRlbXMuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgdmFyIGludmFsaWQgPSBpZGVhbHN0ZXBzLiRzdGVwcy5lcShpKS5maW5kKHNlbGYuZ2V0SW52YWxpZCgpKS5sZW5ndGg7XG4gICAgICAgICAgJCh0aGlzKS5maW5kKCdzcGFuJykudGV4dChpbnZhbGlkKS50b2dnbGVDbGFzcygnemVybycsICEgaW52YWxpZCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdvVG9TdGVwOiBmdW5jdGlvbihpZHgpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ2dvJywgaWR4KTtcbiAgICB9LFxuXG4gICAgcHJldlN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygncHJldicpO1xuICAgIH0sXG5cbiAgICBuZXh0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCduZXh0Jyk7XG4gICAgfSxcblxuICAgIGZpcnN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdmaXJzdCcpO1xuICAgIH0sXG5cbiAgICBsYXN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdsYXN0Jyk7XG4gICAgfVxuICB9XG5cbn07XG4iLCIvKiFcbiAqIGpRdWVyeSBJZGVhbCBGb3Jtc1xuICogQGF1dGhvcjogQ2VkcmljIFJ1aXpcbiAqIEB2ZXJzaW9uOiAzLjBcbiAqIEBsaWNlbnNlIEdQTCBvciBNSVRcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICB2YXIgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxmb3Jtcyc7XG5cbiAgcGx1Z2luLmRlZmF1bHRzID0ge1xuICAgIGZpZWxkOiAnLmZpZWxkJyxcbiAgICBlcnJvcjogJy5lcnJvcicsXG4gICAgaWNvbkh0bWw6ICc8aS8+JyxcbiAgICBpY29uQ2xhc3M6ICdpY29uJyxcbiAgICBpbnZhbGlkQ2xhc3M6ICdpbnZhbGlkJyxcbiAgICB2YWxpZENsYXNzOiAndmFsaWQnLFxuICAgIHNpbGVudExvYWQ6IHRydWUsXG4gICAgb25WYWxpZGF0ZTogJC5ub29wLFxuICAgIG9uU3VibWl0OiAkLm5vb3AsXG4gICAgcnVsZXM6IHt9LFxuICAgIGVycm9yczoge31cbiAgfTtcblxuICBwbHVnaW4uZ2xvYmFsID0ge1xuXG4gICAgX2Zvcm1hdDogZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFx7KFxcZClcXH0vZywgZnVuY3Rpb24oXywgbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3NbK21hdGNoXSB8fCAnJztcbiAgICAgIH0pLnJlcGxhY2UoL1xce1xcKihbXip9XSopXFx9L2csIGZ1bmN0aW9uKF8sIHNlcCkge1xuICAgICAgICByZXR1cm4gYXJncy5qb2luKHNlcCB8fCAnLCAnKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfZ2V0S2V5OiBmdW5jdGlvbihrZXksIG9iaikge1xuICAgICAgcmV0dXJuIGtleS5zcGxpdCgnLicpLnJlZHVjZShmdW5jdGlvbihhLGIpIHtcbiAgICAgICAgcmV0dXJuIGEgJiYgYVtiXTtcbiAgICAgIH0sIG9iaik7XG4gICAgfSxcblxuICAgIGkxOG46IHt9LFxuXG4gICAgcnVsZVNlcGFyYXRvcjogJyAnLFxuICAgIGFyZ1NlcGFyYXRvcjogJzonLFxuXG4gICAgcnVsZXM6IHJlcXVpcmUoJy4vcnVsZXMnKSxcbiAgICBlcnJvcnM6IHJlcXVpcmUoJy4vZXJyb3JzJyksXG5cbiAgICBleHRlbnNpb25zOiBbXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZHluYW1pYy1maWVsZHMvZHluYW1pYy1maWVsZHMuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvYWpheC9hamF4LmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL3N0ZXBzL3N0ZXBzLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvY3VzdG9tLWlucHV0cy5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9kYXRlcGlja2VyL2RhdGVwaWNrZXIuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvYWRhcHRpdmUvYWRhcHRpdmUuZXh0JylcbiAgICBdXG4gIH07XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSAkLmV4dGVuZCh7fSwgcmVxdWlyZSgnLi9wcml2YXRlJyksIHJlcXVpcmUoJy4vcHVibGljJykpO1xuXG4gIHJlcXVpcmUoJy4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcbiIsIi8qKlxuICogUGx1Z2luIGJvaWxlcnBsYXRlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBBUCA9IEFycmF5LnByb3RvdHlwZTtcblxuICByZXR1cm4gZnVuY3Rpb24ocGx1Z2luKSB7XG5cbiAgICBwbHVnaW4gPSAkLmV4dGVuZCh0cnVlLCB7XG4gICAgICBuYW1lOiAncGx1Z2luJyxcbiAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGRpc2FibGVkRXh0ZW5zaW9uczogJ25vbmUnXG4gICAgICB9LFxuICAgICAgbWV0aG9kczoge30sXG4gICAgICBnbG9iYWw6IHt9LFxuICAgIH0sIHBsdWdpbik7XG5cbiAgICAkW3BsdWdpbi5uYW1lXSA9ICQuZXh0ZW5kKHtcblxuICAgICAgYWRkRXh0ZW5zaW9uOiBmdW5jdGlvbihleHRlbnNpb24pIHtcbiAgICAgICAgcGx1Z2luLmdsb2JhbC5leHRlbnNpb25zLnB1c2goZXh0ZW5zaW9uKTtcbiAgICAgIH1cbiAgICB9LCBwbHVnaW4uZ2xvYmFsKTtcblxuICAgIGZ1bmN0aW9uIFBsdWdpbihlbGVtZW50LCBvcHRpb25zKSB7XG5cbiAgICAgIHRoaXMub3B0cyA9ICQuZXh0ZW5kKHt9LCBwbHVnaW4uZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5lbCA9IGVsZW1lbnQ7XG5cbiAgICAgIHRoaXMuX25hbWUgPSBwbHVnaW4ubmFtZTtcblxuICAgICAgdGhpcy5faW5pdCgpO1xuICAgIH1cblxuICAgIFBsdWdpbi5fZXh0ZW5kZWQgPSB7fTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2hhc0V4dGVuc2lvbiA9IGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uZ2xvYmFsLmV4dGVuc2lvbnMuZmlsdGVyKGZ1bmN0aW9uKGV4dCkge1xuICAgICAgICByZXR1cm4gZXh0Lm5hbWUgPT0gZXh0ZW5zaW9uICYmIHNlbGYub3B0cy5kaXNhYmxlZEV4dGVuc2lvbnMuaW5kZXhPZihleHQubmFtZSkgPCAwO1xuICAgICAgfSkubGVuZ3RoO1xuICAgIH07XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlLl9leHRlbmQgPSBmdW5jdGlvbihleHRlbnNpb25zKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKGV4dGVuc2lvbnMsIGZ1bmN0aW9uKGksIGV4dGVuc2lvbikge1xuXG4gICAgICAgICQuZXh0ZW5kKHNlbGYub3B0cywgJC5leHRlbmQodHJ1ZSwgZXh0ZW5zaW9uLm9wdGlvbnMsIHNlbGYub3B0cykpO1xuXG4gICAgICAgICQuZWFjaChleHRlbnNpb24ubWV0aG9kcywgZnVuY3Rpb24obWV0aG9kLCBmbikge1xuXG4gICAgICAgICAgaWYgKHNlbGYub3B0cy5kaXNhYmxlZEV4dGVuc2lvbnMuaW5kZXhPZihleHRlbnNpb24ubmFtZSkgPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChQbHVnaW4ucHJvdG90eXBlW21ldGhvZC5zcGxpdCgnOicpWzBdXSkge1xuICAgICAgICAgICAgUGx1Z2luLl9leHRlbmRlZFttZXRob2RdID0gUGx1Z2luLl9leHRlbmRlZFttZXRob2RdIHx8IFtdO1xuICAgICAgICAgICAgUGx1Z2luLl9leHRlbmRlZFttZXRob2RdLnB1c2goeyBuYW1lOiBleHRlbnNpb24ubmFtZSwgZm46IGZuIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQbHVnaW4ucHJvdG90eXBlW21ldGhvZF0gPSBmbjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5faW5qZWN0ID0gZnVuY3Rpb24obWV0aG9kKSB7XG5cbiAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PSAnZnVuY3Rpb24nKSByZXR1cm4gbWV0aG9kLmNhbGwodGhpcyk7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSkge1xuICAgICAgICAkLmVhY2goUGx1Z2luLl9leHRlbmRlZFttZXRob2RdLCBmdW5jdGlvbihpLCBwbHVnaW4pIHtcbiAgICAgICAgICBwbHVnaW4uZm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlLl9pbml0ID0gJC5ub29wO1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZVtwbHVnaW4ubmFtZV0gPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIGlmICghbWV0aG9kKSByZXR1cm4gdGhpcztcbiAgICAgIHRyeSB7IHJldHVybiB0aGlzW21ldGhvZF0uYXBwbHkodGhpcywgQVAuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTsgfVxuICAgICAgY2F0Y2goZSkge31cbiAgICB9O1xuXG4gICAgJC5leHRlbmQoUGx1Z2luLnByb3RvdHlwZSwgcGx1Z2luLm1ldGhvZHMpO1xuXG4gICAgJC5mbltwbHVnaW4ubmFtZV0gPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIGFyZ3MgPSBBUC5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgICAgLCBtZXRob2RBcnJheSA9IHR5cGVvZiBhcmdzWzBdID09ICdzdHJpbmcnICYmIGFyZ3NbMF0uc3BsaXQoJzonKVxuICAgICAgICAsIG1ldGhvZCA9IG1ldGhvZEFycmF5W21ldGhvZEFycmF5Lmxlbmd0aCA+IDEgPyAxIDogMF1cbiAgICAgICAgLCBwcmVmaXggPSBtZXRob2RBcnJheS5sZW5ndGggPiAxICYmIG1ldGhvZEFycmF5WzBdXG4gICAgICAgICwgb3B0cyA9IHR5cGVvZiBhcmdzWzBdID09ICdvYmplY3QnICYmIGFyZ3NbMF1cbiAgICAgICAgLCBwYXJhbXMgPSBhcmdzLnNsaWNlKDEpXG4gICAgICAgICwgcmV0O1xuXG4gICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgIG1ldGhvZCA9IHByZWZpeCArIG1ldGhvZC5zdWJzdHIoMCwxKS50b1VwcGVyQ2FzZSgpICsgbWV0aG9kLnN1YnN0cigxLG1ldGhvZC5sZW5ndGgtMSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgaW5zdGFuY2UgPSAkLmRhdGEodGhpcywgcGx1Z2luLm5hbWUpO1xuXG4gICAgICAgIC8vIE1ldGhvZFxuICAgICAgICBpZiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICByZXR1cm4gcmV0ID0gaW5zdGFuY2VbcGx1Z2luLm5hbWVdLmFwcGx5KGluc3RhbmNlLCBbbWV0aG9kXS5jb25jYXQocGFyYW1zKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbml0XG4gICAgICAgIHJldHVybiAkLmRhdGEodGhpcywgcGx1Z2luLm5hbWUsIG5ldyBQbHVnaW4odGhpcywgb3B0cykpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBwcmVmaXggPyByZXQgOiB0aGlzO1xuICAgIH07XG4gIH07XG5cbn0oKSk7XG4iLCIvKipcbiAqIFByaXZhdGUgbWV0aG9kc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLiRmb3JtID0gJCh0aGlzLmVsKTtcbiAgICB0aGlzLiRmaWVsZHMgPSAkKCk7XG4gICAgdGhpcy4kaW5wdXRzID0gJCgpO1xuXG4gICAgdGhpcy5fZXh0ZW5kKCQuaWRlYWxmb3Jtcy5leHRlbnNpb25zKTtcbiAgICB0aGlzLl9pMThuKCk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ19pbml0Jyk7XG5cbiAgICB0aGlzLl9hZGRNYXJrdXBSdWxlcygpO1xuICAgIHRoaXMuYWRkUnVsZXModGhpcy5vcHRzLnJ1bGVzIHx8IHt9KTtcblxuICAgIHRoaXMuJGZvcm0uc3VibWl0KGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX3ZhbGlkYXRlQWxsKCk7XG4gICAgICBzZWxmLmZvY3VzRmlyc3RJbnZhbGlkKCk7XG4gICAgICBzZWxmLm9wdHMub25TdWJtaXQuY2FsbChzZWxmLCBzZWxmLmdldEludmFsaWQoKS5sZW5ndGgsIGUpO1xuICAgIH0pO1xuXG4gICAgaWYgKCEgdGhpcy5vcHRzLnNpbGVudExvYWQpIHtcbiAgICAgIC8vIDFtcyB0aW1lb3V0IHRvIG1ha2Ugc3VyZSBlcnJvciBzaG93cyB1cFxuICAgICAgc2V0VGltZW91dCgkLnByb3h5KHRoaXMuZm9jdXNGaXJzdEludmFsaWQsIHRoaXMpLCAxKTtcbiAgICB9XG4gIH0sXG5cbiAgX2FkZE1hcmt1cFJ1bGVzOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBydWxlcyA9IHt9O1xuXG4gICAgdGhpcy4kZm9ybS5maW5kKCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcnVsZSA9ICQodGhpcykuZGF0YSgnaWRlYWxmb3Jtcy1ydWxlcycpO1xuICAgICAgaWYgKHJ1bGUgJiYgISBydWxlc1t0aGlzLm5hbWVdKSBydWxlc1t0aGlzLm5hbWVdID0gcnVsZTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkUnVsZXMocnVsZXMpO1xuICB9LFxuXG4gIF9pMThuOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICQuZWFjaCgkLmlkZWFsZm9ybXMuaTE4biwgZnVuY3Rpb24obG9jYWxlLCBsYW5nKSB7XG5cbiAgICAgIHZhciBlcnJvcnMgPSBsYW5nLmVycm9yc1xuICAgICAgICAsIG9wdGlvbnMgPSB7fTtcblxuICAgICAgZGVsZXRlIGxhbmcuZXJyb3JzO1xuXG4gICAgICBmb3IgKHZhciBleHQgaW4gbGFuZykgb3B0aW9uc1tleHRdID0geyBpMThuOiBsYW5nW2V4dF0gfTtcblxuICAgICAgJC5leHRlbmQoJC5pZGVhbGZvcm1zLmVycm9ycywgZXJyb3JzKTtcbiAgICAgICQuZXh0ZW5kKHRydWUsIHNlbGYub3B0cywgb3B0aW9ucyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX2J1aWxkRmllbGQ6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAsICRpY29uO1xuXG4gICAgJGljb24gPSAkKHRoaXMub3B0cy5pY29uSHRtbCwge1xuICAgICAgY2xhc3M6IHRoaXMub3B0cy5pY29uQ2xhc3MsXG4gICAgICBjbGljazogZnVuY3Rpb24oKXsgJChpbnB1dCkuZm9jdXMoKSB9XG4gICAgfSk7XG5cbiAgICBpZiAoISB0aGlzLiRmaWVsZHMuZmlsdGVyKCRmaWVsZCkubGVuZ3RoKSB7XG4gICAgICB0aGlzLiRmaWVsZHMgPSB0aGlzLiRmaWVsZHMuYWRkKCRmaWVsZCk7XG4gICAgICBpZiAodGhpcy5vcHRzLmljb25IdG1sKSAkZmllbGQuYXBwZW5kKCRpY29uKTtcbiAgICAgICRmaWVsZC5hZGRDbGFzcygnaWRlYWxmb3Jtcy1maWVsZCBpZGVhbGZvcm1zLWZpZWxkLScrIGlucHV0LnR5cGUpO1xuICAgIH1cblxuICAgIHRoaXMuX2FkZEV2ZW50cyhpbnB1dCk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ19idWlsZEZpZWxkJywgaW5wdXQpO1xuICB9LFxuXG4gIF9hZGRFdmVudHM6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpO1xuXG4gICAgJChpbnB1dClcbiAgICAgIC5vbignY2hhbmdlIGtleXVwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS53aGljaCA9PSA5IHx8IGUud2hpY2ggPT0gMTYpIHJldHVybjtcbiAgICAgICAgc2VsZi5fdmFsaWRhdGUodGhpcywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmZvY3VzKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISBzZWxmLmlzVmFsaWQodGhpcy5uYW1lKSkge1xuICAgICAgICAgICRmaWVsZC5maW5kKHNlbGYub3B0cy5lcnJvcikuc2hvdygpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmJsdXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICRmaWVsZC5maW5kKHNlbGYub3B0cy5lcnJvcikuaGlkZSgpO1xuICAgICAgfSk7XG4gIH0sXG5cbiAgX2lzUmVxdWlyZWQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgLy8gV2UgYXNzdW1lIG5vbi10ZXh0IGlucHV0cyB3aXRoIHJ1bGVzIGFyZSByZXF1aXJlZFxuICAgIGlmICgkKGlucHV0KS5pcygnOmNoZWNrYm94LCA6cmFkaW8sIHNlbGVjdCcpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5vcHRzLnJ1bGVzW2lucHV0Lm5hbWVdLmluZGV4T2YoJ3JlcXVpcmVkJykgPiAtMTtcbiAgfSxcblxuICBfZ2V0UmVsYXRlZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RmllbGQoaW5wdXQpLmZpbmQoJ1tuYW1lPVwiJysgaW5wdXQubmFtZSArJ1wiXScpO1xuICB9LFxuXG4gIF9nZXRGaWVsZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gJChpbnB1dCkuY2xvc2VzdCh0aGlzLm9wdHMuZmllbGQpO1xuICB9LFxuXG4gIF9nZXRGaXJzdEludmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEludmFsaWQoKS5maXJzdCgpLmZpbmQoJ2lucHV0OmZpcnN0LCB0ZXh0YXJlYSwgc2VsZWN0Jyk7XG4gIH0sXG5cbiAgX2hhbmRsZUVycm9yOiBmdW5jdGlvbihpbnB1dCwgZXJyb3IsIHZhbGlkKSB7XG4gICAgdmFsaWQgPSB2YWxpZCB8fCB0aGlzLmlzVmFsaWQoaW5wdXQubmFtZSk7XG4gICAgdmFyICRlcnJvciA9IHRoaXMuX2dldEZpZWxkKGlucHV0KS5maW5kKHRoaXMub3B0cy5lcnJvcik7XG4gICAgdGhpcy4kZm9ybS5maW5kKHRoaXMub3B0cy5lcnJvcikuaGlkZSgpO1xuICAgIGlmIChlcnJvcikgJGVycm9yLnRleHQoZXJyb3IpO1xuICAgICRlcnJvci50b2dnbGUoIXZhbGlkKTtcbiAgfSxcblxuICBfaGFuZGxlU3R5bGU6IGZ1bmN0aW9uKGlucHV0LCB2YWxpZCkge1xuICAgIHZhbGlkID0gdmFsaWQgfHwgdGhpcy5pc1ZhbGlkKGlucHV0Lm5hbWUpO1xuICAgIHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0cy52YWxpZENsYXNzICsnICcrIHRoaXMub3B0cy5pbnZhbGlkQ2xhc3MpXG4gICAgICAuYWRkQ2xhc3ModmFsaWQgPyB0aGlzLm9wdHMudmFsaWRDbGFzcyA6IHRoaXMub3B0cy5pbnZhbGlkQ2xhc3MpXG4gICAgICAuZmluZCgnLicrIHRoaXMub3B0cy5pY29uQ2xhc3MpLnNob3coKTtcbiAgfSxcblxuICBfZnJlc2g6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRzLnZhbGlkQ2xhc3MgKycgJysgdGhpcy5vcHRzLmludmFsaWRDbGFzcylcbiAgICAgIC5maW5kKHRoaXMub3B0cy5lcnJvcikuaGlkZSgpXG4gICAgICAuZW5kKClcbiAgICAgIC5maW5kKCcuJysgdGhpcy5vcHRzLmljb25DbGFzcykudG9nZ2xlKHRoaXMuX2lzUmVxdWlyZWQoaW5wdXQpKTtcbiAgfSxcblxuICBfdmFsaWRhdGU6IGZ1bmN0aW9uKGlucHV0LCBoYW5kbGVFcnJvciwgaGFuZGxlU3R5bGUpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgICwgdXNlclJ1bGVzID0gdGhpcy5vcHRzLnJ1bGVzW2lucHV0Lm5hbWVdLnNwbGl0KCQuaWRlYWxmb3Jtcy5ydWxlU2VwYXJhdG9yKVxuICAgICAgLCBvbGRWYWx1ZSA9ICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbHVlJylcbiAgICAgICwgdmFsaWQgPSB0cnVlXG4gICAgICAsIHJ1bGU7XG5cbiAgICAvLyBEb24ndCB2YWxpZGF0ZSBpbnB1dCBpZiB2YWx1ZSBoYXNuJ3QgY2hhbmdlZFxuICAgIGlmICghICQoaW5wdXQpLmlzKCc6Y2hlY2tib3gsIDpyYWRpbycpICYmIG9sZFZhbHVlID09IGlucHV0LnZhbHVlKSB7XG4gICAgICByZXR1cm4gJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnKTtcbiAgICB9XG5cbiAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWx1ZScsIGlucHV0LnZhbHVlKTtcblxuICAgIC8vIE5vbi1yZXF1aXJlZCBpbnB1dCB3aXRoIGVtcHR5IHZhbHVlIG11c3QgcGFzcyB2YWxpZGF0aW9uXG4gICAgaWYgKCEgaW5wdXQudmFsdWUgJiYgISB0aGlzLl9pc1JlcXVpcmVkKGlucHV0KSkge1xuICAgICAgJGZpZWxkLnJlbW92ZURhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnKTtcbiAgICAgIHRoaXMuX2ZyZXNoKGlucHV0KTtcblxuICAgIC8vIElucHV0cyB3aXRoIHZhbHVlIG9yIHJlcXVpcmVkXG4gICAgfSBlbHNlIHtcblxuICAgICAgJC5lYWNoKHVzZXJSdWxlcywgZnVuY3Rpb24oaSwgdXNlclJ1bGUpIHtcblxuICAgICAgICB1c2VyUnVsZSA9IHVzZXJSdWxlLnNwbGl0KCQuaWRlYWxmb3Jtcy5hcmdTZXBhcmF0b3IpO1xuXG4gICAgICAgIHJ1bGUgPSB1c2VyUnVsZVswXTtcblxuICAgICAgICB2YXIgdGhlUnVsZSA9ICQuaWRlYWxmb3Jtcy5ydWxlc1tydWxlXVxuICAgICAgICAgICwgYXJncyA9IHVzZXJSdWxlLnNsaWNlKDEpXG4gICAgICAgICAgLCBlcnJvcjtcblxuICAgICAgICBlcnJvciA9ICQuaWRlYWxmb3Jtcy5fZm9ybWF0LmFwcGx5KG51bGwsIFtcbiAgICAgICAgICAkLmlkZWFsZm9ybXMuX2dldEtleSgnZXJyb3JzLicrIGlucHV0Lm5hbWUgKycuJysgcnVsZSwgc2VsZi5vcHRzKSB8fFxuICAgICAgICAgICQuaWRlYWxmb3Jtcy5lcnJvcnNbcnVsZV1cbiAgICAgICAgXS5jb25jYXQoYXJncykpO1xuXG4gICAgICAgIHZhbGlkID0gdHlwZW9mIHRoZVJ1bGUgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgID8gdGhlUnVsZS5hcHBseShzZWxmLCBbaW5wdXQsIGlucHV0LnZhbHVlXS5jb25jYXQoYXJncykpXG4gICAgICAgICAgOiB0aGVSdWxlLnRlc3QoaW5wdXQudmFsdWUpO1xuXG4gICAgICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJywgdmFsaWQpO1xuXG4gICAgICAgIGlmIChoYW5kbGVFcnJvcikgc2VsZi5faGFuZGxlRXJyb3IoaW5wdXQsIGVycm9yLCB2YWxpZCk7XG4gICAgICAgIGlmIChoYW5kbGVTdHlsZSkgc2VsZi5faGFuZGxlU3R5bGUoaW5wdXQsIHZhbGlkKTtcblxuICAgICAgICBzZWxmLm9wdHMub25WYWxpZGF0ZS5jYWxsKHNlbGYsIGlucHV0LCBydWxlLCB2YWxpZCk7XG5cbiAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5faW5qZWN0KCdfdmFsaWRhdGUnLCBpbnB1dCwgcnVsZSwgdmFsaWQpO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9LFxuXG4gIF92YWxpZGF0ZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuJGlucHV0cy5lYWNoKGZ1bmN0aW9uKCl7IHNlbGYuX3ZhbGlkYXRlKHRoaXMsIHRydWUpOyB9KTtcbiAgfVxufTtcbiIsIi8qKlxuICogUHVibGljIG1ldGhvZHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWRkUnVsZXM6IGZ1bmN0aW9uKHJ1bGVzKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgJGlucHV0cyA9IHRoaXMuJGZvcm0uZmluZCgkLm1hcChydWxlcywgZnVuY3Rpb24oXywgbmFtZSkge1xuICAgICAgcmV0dXJuICdbbmFtZT1cIicrIG5hbWUgKydcIl0nO1xuICAgIH0pLmpvaW4oJywnKSk7XG5cbiAgICAkLmV4dGVuZCh0aGlzLm9wdHMucnVsZXMsIHJ1bGVzKTtcblxuICAgICRpbnB1dHMuZWFjaChmdW5jdGlvbigpeyBzZWxmLl9idWlsZEZpZWxkKHRoaXMpIH0pO1xuICAgIHRoaXMuJGlucHV0cyA9IHRoaXMuJGlucHV0cy5hZGQoJGlucHV0cyk7XG5cbiAgICB0aGlzLl92YWxpZGF0ZUFsbCgpO1xuICAgIHRoaXMuJGZpZWxkcy5maW5kKHRoaXMub3B0cy5lcnJvcikuaGlkZSgpO1xuXG4gICAgdGhpcy5faW5qZWN0KCdhZGRSdWxlcycpO1xuICB9LFxuXG4gIGdldEludmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRmaWVsZHMuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQodGhpcykuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcpID09PSBmYWxzZTtcbiAgICB9KTtcbiAgfSxcblxuICBmb2N1c0ZpcnN0SW52YWxpZDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZmlyc3RJbnZhbGlkID0gdGhpcy5fZ2V0Rmlyc3RJbnZhbGlkKClbMF07XG5cbiAgICBpZiAoZmlyc3RJbnZhbGlkKSB7XG4gICAgICB0aGlzLl9oYW5kbGVFcnJvcihmaXJzdEludmFsaWQpO1xuICAgICAgdGhpcy5faGFuZGxlU3R5bGUoZmlyc3RJbnZhbGlkKTtcbiAgICAgIHRoaXMuX2luamVjdCgnZm9jdXNGaXJzdEludmFsaWQnLCBmaXJzdEludmFsaWQpO1xuICAgICAgJChmaXJzdEludmFsaWQpLmZvY3VzKCk7XG4gICAgfVxuICB9LFxuXG4gIGlzVmFsaWQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZiAobmFtZSkgcmV0dXJuICEgdGhpcy5nZXRJbnZhbGlkKCkuZmluZCgnW25hbWU9XCInKyBuYW1lICsnXCJdJykubGVuZ3RoO1xuICAgIHJldHVybiAhIHRoaXMuZ2V0SW52YWxpZCgpLmxlbmd0aDtcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24obmFtZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRpbnB1dHMgPSB0aGlzLiRpbnB1dHM7XG5cbiAgICBpZiAobmFtZSkgJGlucHV0cyA9ICRpbnB1dHMuZmlsdGVyKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKTtcblxuICAgICRpbnB1dHMuZmlsdGVyKCdpbnB1dDpub3QoOmNoZWNrYm94LCA6cmFkaW8pJykudmFsKCcnKTtcbiAgICAkaW5wdXRzLmZpbHRlcignOmNoZWNrYm94LCA6cmFkaW8nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICRpbnB1dHMuZmlsdGVyKCdzZWxlY3QnKS5maW5kKCdvcHRpb24nKS5wcm9wKCdzZWxlY3RlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdFNlbGVjdGVkO1xuICAgIH0pO1xuXG4gICAgJGlucHV0cy5jaGFuZ2UoKS5lYWNoKGZ1bmN0aW9uKCl7IHNlbGYuX2ZyZXNoKHRoaXMpIH0pO1xuXG4gICAgdGhpcy5faW5qZWN0KCdyZXNldCcsIG5hbWUpO1xuICB9XG5cbn07XG4iLCIvKipcbiAqIFJ1bGVzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHJlcXVpcmVkOiAvLisvLFxuICBkaWdpdHM6IC9eXFxkKyQvLFxuICBlbWFpbDogL15bXkBdK0BbXkBdK1xcLi57Miw2fSQvLFxuICB1c2VybmFtZTogL15bYS16XSg/PVtcXHcuXXszLDMxfSQpXFx3KlxcLj9cXHcqJC9pLFxuICBwYXNzOiAvKD89LipcXGQpKD89LipbYS16XSkoPz0uKltBLVpdKS57Nix9LyxcbiAgc3Ryb25ncGFzczogLyg/PV4uezgsfSQpKCg/PS4qXFxkKXwoPz0uKlxcVyspKSg/IVsuXFxuXSkoPz0uKltBLVpdKSg/PS4qW2Etel0pLiokLyxcbiAgcGhvbmU6IC9eWzItOV1cXGR7Mn0tXFxkezN9LVxcZHs0fSQvLFxuICB6aXA6IC9eXFxkezV9JHxeXFxkezV9LVxcZHs0fSQvLFxuICB1cmw6IC9eKD86KGZ0cHxodHRwfGh0dHBzKTpcXC9cXC8pPyg/OltcXHdcXC1dK1xcLikrW2Etel17Miw2fShbXFw6XFwvPyNdLiopPyQvaSxcblxuICBudW1iZXI6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSkge1xuICAgIHJldHVybiAhaXNOYU4odmFsdWUpO1xuICB9LFxuXG4gIHJhbmdlOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE51bWJlcih2YWx1ZSkgPj0gbWluICYmIE51bWJlcih2YWx1ZSkgPD0gbWF4O1xuICB9LFxuXG4gIG1pbjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaW4pIHtcbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoID49IG1pbjtcbiAgfSxcblxuICBtYXg6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWF4KSB7XG4gICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA8PSBtYXg7XG4gIH0sXG5cbiAgbWlub3B0aW9uOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1pbikge1xuICAgIHJldHVybiB0aGlzLl9nZXRSZWxhdGVkKGlucHV0KS5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoID49IG1pbjtcbiAgfSxcblxuICBtYXhvcHRpb246IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWF4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFJlbGF0ZWQoaW5wdXQpLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGggPD0gbWF4O1xuICB9LFxuXG4gIG1pbm1heDogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaW4sIG1heCkge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPj0gbWluICYmIHZhbHVlLmxlbmd0aCA8PSBtYXg7XG4gIH0sXG5cbiAgc2VsZWN0OiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIGRlZikge1xuICAgIHJldHVybiB2YWx1ZSAhPSBkZWY7XG4gIH0sXG5cbiAgZXh0ZW5zaW9uOiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgdmFyIGV4dGVuc2lvbnMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAgICwgdmFsaWQgPSBmYWxzZTtcblxuICAgICQuZWFjaChpbnB1dC5maWxlcyB8fCBbe25hbWU6IGlucHV0LnZhbHVlfV0sIGZ1bmN0aW9uKGksIGZpbGUpIHtcbiAgICAgIHZhbGlkID0gJC5pbkFycmF5KGZpbGUubmFtZS5zcGxpdCgnLicpLnBvcCgpLnRvTG93ZXJDYXNlKCksIGV4dGVuc2lvbnMpID4gLTE7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH0sXG5cbiAgZXF1YWx0bzogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCB0YXJnZXQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkdGFyZ2V0ID0gJCgnW25hbWU9XCInKyB0YXJnZXQgKydcIl0nKTtcblxuICAgIGlmICh0aGlzLmdldEludmFsaWQoKS5maW5kKCR0YXJnZXQpLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgJHRhcmdldC5vZmYoJ2tleXVwLmVxdWFsdG8nKS5vbigna2V5dXAuZXF1YWx0bycsIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5fZ2V0RmllbGQoaW5wdXQpLnJlbW92ZURhdGEoJ2lkZWFsZm9ybXMtdmFsdWUnKTtcbiAgICAgIHNlbGYuX3ZhbGlkYXRlKGlucHV0LCBmYWxzZSwgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW5wdXQudmFsdWUgPT0gJHRhcmdldC52YWwoKTtcbiAgfSxcblxuICBkYXRlOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIGZvcm1hdCkge1xuXG4gICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdtbS9kZC95eXl5JztcblxuICAgIHZhciBkZWxpbWl0ZXIgPSAvW15tZHldLy5leGVjKGZvcm1hdClbMF1cbiAgICAgICwgdGhlRm9ybWF0ID0gZm9ybWF0LnNwbGl0KGRlbGltaXRlcilcbiAgICAgICwgdGhlRGF0ZSA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICBmdW5jdGlvbiBpc0RhdGUoZGF0ZSwgZm9ybWF0KSB7XG5cbiAgICAgIHZhciBtLCBkLCB5O1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZm9ybWF0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICgvbS8udGVzdChmb3JtYXRbaV0pKSBtID0gZGF0ZVtpXTtcbiAgICAgICAgaWYgKC9kLy50ZXN0KGZvcm1hdFtpXSkpIGQgPSBkYXRlW2ldO1xuICAgICAgICBpZiAoL3kvLnRlc3QoZm9ybWF0W2ldKSkgeSA9IGRhdGVbaV07XG4gICAgICB9XG5cbiAgICAgIGlmICghbSB8fCAhZCB8fCAheSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gbSA+IDAgJiYgbSA8IDEzICYmXG4gICAgICAgIHkgJiYgeS5sZW5ndGggPT0gNCAmJlxuICAgICAgICBkID4gMCAmJiBkIDw9IChuZXcgRGF0ZSh5LCBtLCAwKSkuZ2V0RGF0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBpc0RhdGUodGhlRGF0ZSwgdGhlRm9ybWF0KTtcbiAgfVxuXG59O1xuIl19
