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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2Vycm9ycy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9hZGFwdGl2ZS9hZGFwdGl2ZS5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvYWpheC9hamF4LmV4dC5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2N1c3RvbS1pbnB1dHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxmaWxlLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxyYWRpb2NoZWNrLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvZHluYW1pYy1maWVsZHMvZHluYW1pYy1maWVsZHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL3N0ZXBzL2lkZWFsc3RlcHMuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvc3RlcHMvc3RlcHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9tYWluLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9wbHVnaW4uanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3ByaXZhdGUuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3B1YmxpYy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvcnVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRXJyb3JzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHJlcXVpcmVkOiAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCcsXG4gIGRpZ2l0czogJ011c3QgYmUgb25seSBkaWdpdHMnLFxuICBuYW1lOiAnTXVzdCBiZSBhdCBsZWFzdCAzIGNoYXJhY3RlcnMgbG9uZyBhbmQgbXVzdCBvbmx5IGNvbnRhaW4gbGV0dGVycycsXG4gIGVtYWlsOiAnTXVzdCBiZSBhIHZhbGlkIGVtYWlsJyxcbiAgdXNlcm5hbWU6ICdNdXN0IGJlIGF0IGJldHdlZW4gNCBhbmQgMzIgY2hhcmFjdGVycyBsb25nIGFuZCBzdGFydCB3aXRoIGEgbGV0dGVyLiBZb3UgbWF5IHVzZSBsZXR0ZXJzLCBudW1iZXJzLCB1bmRlcnNjb3JlcywgYW5kIG9uZSBkb3QnLFxuICBwYXNzOiAnTXVzdCBiZSBhdCBsZWFzdCA2IGNoYXJhY3RlcnMgbG9uZywgYW5kIGNvbnRhaW4gYXQgbGVhc3Qgb25lIG51bWJlciwgb25lIHVwcGVyY2FzZSBhbmQgb25lIGxvd2VyY2FzZSBsZXR0ZXInLFxuICBzdHJvbmdwYXNzOiAnTXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMgbG9uZyBhbmQgY29udGFpbiBhdCBsZWFzdCBvbmUgdXBwZXJjYXNlIGFuZCBvbmUgbG93ZXJjYXNlIGxldHRlciBhbmQgb25lIG51bWJlciBvciBzcGVjaWFsIGNoYXJhY3RlcicsXG4gIHBob25lOiAnTXVzdCBiZSBhIHZhbGlkIHBob25lIG51bWJlcicsXG4gIHppcDogJ011c3QgYmUgYSB2YWxpZCB6aXAgY29kZScsXG4gIHVybDogJ011c3QgYmUgYSB2YWxpZCBVUkwnLFxuICBudW1iZXI6ICdNdXN0IGJlIGEgbnVtYmVyJyxcbiAgcmFuZ2U6ICdNdXN0IGJlIGEgbnVtYmVyIGJldHdlZW4gezB9IGFuZCB7MX0nLFxuICBtaW46ICdNdXN0IGJlIGF0IGxlYXN0IHswfSBjaGFyYWN0ZXJzIGxvbmcnLFxuICBtYXg6ICdNdXN0IGJlIHVuZGVyIHswfSBjaGFyYWN0ZXJzJyxcbiAgbWlub3B0aW9uOiAnU2VsZWN0IGF0IGxlYXN0IHswfSBvcHRpb25zJyxcbiAgbWF4b3B0aW9uOiAnU2VsZWN0IG5vIG1vcmUgdGhhbiB7MH0gb3B0aW9ucycsXG4gIG1pbm1heDogJ011c3QgYmUgYmV0d2VlbiB7MH0gYW5kIHsxfSBjaGFyYWN0ZXJzIGxvbmcnLFxuICBzZWxlY3Q6ICdTZWxlY3QgYW4gb3B0aW9uJyxcbiAgZXh0ZW5zaW9uOiAnRmlsZShzKSBtdXN0IGhhdmUgYSB2YWxpZCBleHRlbnNpb24gKHsqfSknLFxuICBlcXVhbHRvOiAnTXVzdCBoYXZlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBcInswfVwiIGZpZWxkJyxcbiAgZGF0ZTogJ011c3QgYmUgYSB2YWxpZCBkYXRlIHswfSdcblxufTtcbiIsIi8qKlxuICogQWRhcHRpdmVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2FkYXB0aXZlJyxcblxuICBvcHRpb25zOiB7XG4gICAgYWRhcHRpdmVXaWR0aDogJCgnPHAgY2xhc3M9XCJpZGVhbGZvcm1zLWZpZWxkLXdpZHRoXCIvPicpLmFwcGVuZFRvKCdib2R5JykuY3NzKCd3aWR0aCcpLnJlcGxhY2UoJ3B4JywnJylcbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBmdW5jdGlvbiBhZGFwdCgpIHtcblxuICAgICAgICB2YXIgZm9ybVdpZHRoID0gc2VsZi4kZm9ybS5vdXRlcldpZHRoKClcbiAgICAgICAgICAsIGlzQWRhcHRpdmUgPSBzZWxmLm9wdHMuYWRhcHRpdmVXaWR0aCA+IGZvcm1XaWR0aDtcblxuICAgICAgICBzZWxmLiRmb3JtLnRvZ2dsZUNsYXNzKCdhZGFwdGl2ZScsIGlzQWRhcHRpdmUpO1xuXG4gICAgICAgIGlmIChzZWxmLl9oYXNFeHRlbnNpb24oJ3N0ZXBzJykpIHtcbiAgICAgICAgICBzZWxmLiRzdGVwc0NvbnRhaW5lci50b2dnbGVDbGFzcygnYWRhcHRpdmUnLCBpc0FkYXB0aXZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJyN1aS1kYXRlcGlja2VyLWRpdicpLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgJCh3aW5kb3cpLnJlc2l6ZShhZGFwdCk7XG4gICAgICBhZGFwdCgpO1xuXG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJ3NlbGVjdCwgLmRhdGVwaWNrZXInKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLl9nZXRGaWVsZCh0aGlzKS5maW5kKHNlbGYub3B0cy5lcnJvcikuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgfSk7XG5cbiAgICAgICQoJ3AuaWRlYWxmb3Jtcy1maWVsZC13aWR0aCcpLnJlbW92ZSgpO1xuICAgIH1cblxuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2FqYXgnLFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICQuZXh0ZW5kKCQuaWRlYWxmb3JtcywgeyBfcmVxdWVzdHM6IHt9IH0pO1xuXG4gICAgICAkLmlkZWFsZm9ybXMuZXJyb3JzLmFqYXggPSAkLmlkZWFsZm9ybXMuZXJyb3JzLmFqYXggfHwgJ0xvYWRpbmcuLi4nO1xuXG4gICAgICAkLmV4dGVuZCgkLmlkZWFsZm9ybXMucnVsZXMsIHtcblxuICAgICAgICBhamF4OiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgICAgICAgLCB1cmwgPSAkKGlucHV0KS5kYXRhKCdpZGVhbGZvcm1zLWFqYXgnKVxuICAgICAgICAgICAgLCB1c2VyRXJyb3IgPSAkLmlkZWFsZm9ybXMuX2dldEtleSgnZXJyb3JzLicrIGlucHV0Lm5hbWUgKycuYWpheEVycm9yJywgc2VsZi5vcHRzKVxuICAgICAgICAgICAgLCByZXF1ZXN0cyA9ICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNcbiAgICAgICAgICAgICwgZGF0YSA9IHt9O1xuXG4gICAgICAgICAgZGF0YVtpbnB1dC5uYW1lXSA9IGlucHV0LnZhbHVlO1xuXG4gICAgICAgICAgJGZpZWxkLmFkZENsYXNzKCdhamF4Jyk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdHNbaW5wdXQubmFtZV0pIHJlcXVlc3RzW2lucHV0Lm5hbWVdLmFib3J0KCk7XG5cbiAgICAgICAgICByZXF1ZXN0c1tpbnB1dC5uYW1lXSA9ICQucG9zdCh1cmwsIGRhdGEsIGZ1bmN0aW9uKHJlc3ApIHtcblxuICAgICAgICAgICAgaWYgKHJlc3AgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgc2VsZi5faGFuZGxlRXJyb3IoaW5wdXQpO1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVTdHlsZShpbnB1dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCwgdXNlckVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5vcHRzLm9uVmFsaWRhdGUuY2FsbChzZWxmLCBpbnB1dCwgJ2FqYXgnLCByZXNwKTtcblxuICAgICAgICAgICAgJGZpZWxkLnJlbW92ZUNsYXNzKCdhamF4Jyk7XG5cbiAgICAgICAgICB9LCAnanNvbicpO1xuXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIF92YWxpZGF0ZTogZnVuY3Rpb24oaW5wdXQsIHJ1bGUpIHtcbiAgICAgIGlmIChydWxlICE9ICdhamF4JyAmJiAkLmlkZWFsZm9ybXMuX3JlcXVlc3RzW2lucHV0Lm5hbWVdKSB7XG4gICAgICAgICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNbaW5wdXQubmFtZV0uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5fZ2V0RmllbGQoaW5wdXQpLnJlbW92ZUNsYXNzKCdhamF4Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbn07XG4iLCJyZXF1aXJlKCcuL2lkZWFsZmlsZScpO1xucmVxdWlyZSgnLi9pZGVhbHJhZGlvY2hlY2snKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2N1c3RvbUlucHV0cycsXG5cbiAgb3B0aW9uczoge1xuICAgIGN1c3RvbUlucHV0czoge1xuICAgICAgaTE4bjoge1xuICAgICAgICBvcGVuOiAnT3BlbidcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkQ3VzdG9tSW5wdXRzKCk7XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICAnYWRkRmllbGRzOmFmdGVyJzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9idWlsZEN1c3RvbUlucHV0cygpO1xuICAgIH0sXG5cbiAgICBfYnVpbGRDdXN0b21JbnB1dHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kZm9ybS5maW5kKCc6ZmlsZScpLmlkZWFsZmlsZSh0aGlzLm9wdHMuY3VzdG9tSW5wdXRzLmkxOG4pO1xuICAgICAgdGhpcy4kZm9ybS5maW5kKCc6Y2hlY2tib3gsIDpyYWRpbycpLmlkZWFscmFkaW9jaGVjaygpO1xuICAgIH1cblxuICB9XG59O1xuIiwiLyoqXG4gKiBJZGVhbCBGaWxlXG4gKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgLy8gQnJvd3NlciBzdXBwb3J0cyBIVE1MNSBtdWx0aXBsZSBmaWxlP1xuICB2YXIgbXVsdGlwbGVTdXBwb3J0ID0gdHlwZW9mICQoJzxpbnB1dC8+JylbMF0ubXVsdGlwbGUgIT09ICd1bmRlZmluZWQnXG4gICAgLCBpc0lFID0gL21zaWUvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgLCBwbHVnaW4gPSB7fTtcblxuICBwbHVnaW4ubmFtZSA9ICdpZGVhbGZpbGUnO1xuXG4gIHBsdWdpbi5kZWZhdWx0cyA9IHtcbiAgICBvcGVuOiAnT3BlbidcbiAgfTtcblxuICBwbHVnaW4ubWV0aG9kcyA9IHtcblxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyICRmaWxlID0gJCh0aGlzLmVsKS5hZGRDbGFzcygnaWRlYWwtZmlsZScpIC8vIHRoZSBvcmlnaW5hbCBmaWxlIGlucHV0XG4gICAgICAgICwgJHdyYXAgPSAkKCc8ZGl2IGNsYXNzPVwiaWRlYWwtZmlsZS13cmFwXCI+JylcbiAgICAgICAgLCAkaW5wdXQgPSAkKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImlkZWFsLWZpbGUtZmlsZW5hbWVcIiAvPicpXG4gICAgICAgICAgLy8gQnV0dG9uIHRoYXQgd2lsbCBiZSB1c2VkIGluIG5vbi1JRSBicm93c2Vyc1xuICAgICAgICAsICRidXR0b24gPSAkKCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImlkZWFsLWZpbGUtdXBsb2FkXCI+JysgdGhpcy5vcHRzLm9wZW4gKyc8L2J1dHRvbj4nKVxuICAgICAgICAgIC8vIEhhY2sgZm9yIElFXG4gICAgICAgICwgJGxhYmVsID0gJCgnPGxhYmVsIGNsYXNzPVwiaWRlYWwtZmlsZS11cGxvYWRcIiBmb3I9XCInICsgJGZpbGVbMF0uaWQgKyAnXCI+JysgdGhpcy5vcHRzLm9wZW4gKyc8L2xhYmVsPicpO1xuXG4gICAgICBpZiAoaXNJRSkgJGxhYmVsLmFkZCgkYnV0dG9uKS5hZGRDbGFzcygnaWUnKTtcblxuICAgICAgLy8gSGlkZSBieSBzaGlmdGluZyB0byB0aGUgbGVmdCBzbyB3ZVxuICAgICAgLy8gY2FuIHN0aWxsIHRyaWdnZXIgZXZlbnRzXG4gICAgICAkZmlsZS5jc3Moe1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgbGVmdDogJy05OTk5cHgnXG4gICAgICB9KTtcblxuICAgICAgJHdyYXAuYXBwZW5kKCRpbnB1dCwgKGlzSUUgPyAkbGFiZWwgOiAkYnV0dG9uKSkuaW5zZXJ0QWZ0ZXIoJGZpbGUpO1xuXG4gICAgICAvLyBQcmV2ZW50IGZvY3VzXG4gICAgICAkZmlsZS5hdHRyKCd0YWJJbmRleCcsIC0xKTtcbiAgICAgICRidXR0b24uYXR0cigndGFiSW5kZXgnLCAtMSk7XG5cbiAgICAgICRidXR0b24uY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAkZmlsZS5mb2N1cygpLmNsaWNrKCk7IC8vIE9wZW4gZGlhbG9nXG4gICAgICB9KTtcblxuICAgICAgJGZpbGUuY2hhbmdlKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgZmlsZXMgPSBbXVxuICAgICAgICAgICwgZmlsZUFyciwgZmlsZW5hbWU7XG5cbiAgICAgICAgICAvLyBJZiBtdWx0aXBsZSBpcyBzdXBwb3J0ZWQgdGhlbiBleHRyYWN0XG4gICAgICAgICAgLy8gYWxsIGZpbGVuYW1lcyBmcm9tIHRoZSBmaWxlIGFycmF5XG4gICAgICAgIGlmIChtdWx0aXBsZVN1cHBvcnQpIHtcbiAgICAgICAgICBmaWxlQXJyID0gJGZpbGVbMF0uZmlsZXM7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZpbGVBcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZUFycltpXS5uYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmlsZW5hbWUgPSBmaWxlcy5qb2luKCcsICcpO1xuXG4gICAgICAgICAgLy8gSWYgbm90IHN1cHBvcnRlZCB0aGVuIGp1c3QgdGFrZSB0aGUgdmFsdWVcbiAgICAgICAgICAvLyBhbmQgcmVtb3ZlIHRoZSBwYXRoIHRvIGp1c3Qgc2hvdyB0aGUgZmlsZW5hbWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaWxlbmFtZSA9ICRmaWxlLnZhbCgpLnNwbGl0KCdcXFxcJykucG9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICAkaW5wdXQgLnZhbChmaWxlbmFtZSkuYXR0cigndGl0bGUnLCBmaWxlbmFtZSk7XG5cbiAgICAgIH0pO1xuXG4gICAgICAkaW5wdXQub24oe1xuICAgICAgICBibHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGZpbGUudHJpZ2dlcignYmx1cicpO1xuICAgICAgICB9LFxuICAgICAgICBrZXlkb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmIChlLndoaWNoID09PSAxMykgeyAvLyBFbnRlclxuICAgICAgICAgICAgaWYgKCFpc0lFKSAkZmlsZS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCdmb3JtJykub25lKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMTMpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gOCB8fCBlLndoaWNoID09PSA0NikgeyAvLyBCYWNrc3BhY2UgJiBEZWxcbiAgICAgICAgICAgIC8vIEluIElFIHRoZSB2YWx1ZSBpcyByZWFkLW9ubHlcbiAgICAgICAgICAgIC8vIHdpdGggdGhpcyB0cmljayB3ZSByZW1vdmUgdGhlIG9sZCBpbnB1dCBhbmQgYWRkXG4gICAgICAgICAgICAvLyBhIGNsZWFuIGNsb25lIHdpdGggYWxsIHRoZSBvcmlnaW5hbCBldmVudHMgYXR0YWNoZWRcbiAgICAgICAgICAgIGlmIChpc0lFKSAkZmlsZS5yZXBsYWNlV2l0aCgkZmlsZSA9ICRmaWxlLmNsb25lKHRydWUpKTtcbiAgICAgICAgICAgICRmaWxlLnZhbCgnJykudHJpZ2dlcignY2hhbmdlJyk7XG4gICAgICAgICAgICAkaW5wdXQudmFsKCcnKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDkpIHsgLy8gVEFCXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHsgLy8gQWxsIG90aGVyIGtleXNcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfVxuXG4gIH07XG5cbiAgcmVxdWlyZSgnLi4vLi4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcbiIsIi8qXG4gKiBpZGVhbFJhZGlvQ2hlY2s6IGpRdWVyeSBwbGd1aW4gZm9yIGNoZWNrYm94IGFuZCByYWRpbyByZXBsYWNlbWVudFxuICogVXNhZ2U6ICQoJ2lucHV0W3R5cGU9Y2hlY2tib3hdLCBpbnB1dFt0eXBlPXJhZGlvXScpLmlkZWFsUmFkaW9DaGVjaygpXG4gKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFscmFkaW9jaGVjayc7XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSB7XG5cbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciAkaW5wdXQgPSAkKHRoaXMuZWwpO1xuICAgICAgdmFyICRzcGFuID0gJCgnPHNwYW4vPicpO1xuXG4gICAgICAkc3Bhbi5hZGRDbGFzcygnaWRlYWwtJysgKCRpbnB1dC5pcygnOmNoZWNrYm94JykgPyAnY2hlY2snIDogJ3JhZGlvJykpO1xuICAgICAgJGlucHV0LmlzKCc6Y2hlY2tlZCcpICYmICRzcGFuLmFkZENsYXNzKCdjaGVja2VkJyk7IC8vIGluaXRcbiAgICAgICRzcGFuLmluc2VydEFmdGVyKCRpbnB1dCk7XG5cbiAgICAgICRpbnB1dC5wYXJlbnQoJ2xhYmVsJylcbiAgICAgICAgLmFkZENsYXNzKCdpZGVhbC1yYWRpb2NoZWNrLWxhYmVsJylcbiAgICAgICAgLmF0dHIoJ29uY2xpY2snLCAnJyk7IC8vIEZpeCBjbGlja2luZyBsYWJlbCBpbiBpT1NcblxuICAgICAgJGlucHV0LmNzcyh7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBsZWZ0OiAnLTk5OTlweCcgfSk7IC8vIGhpZGUgYnkgc2hpZnRpbmcgbGVmdFxuXG4gICAgICAvLyBFdmVudHNcbiAgICAgICRpbnB1dC5vbih7XG4gICAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRpbnB1dCA9ICQodGhpcyk7XG4gICAgICAgICAgaWYgKCAkaW5wdXQuaXMoJ2lucHV0W3R5cGU9XCJyYWRpb1wiXScpICkge1xuICAgICAgICAgICAgJGlucHV0LnBhcmVudCgpLnNpYmxpbmdzKCdsYWJlbCcpLmZpbmQoJy5pZGVhbC1yYWRpbycpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgICRzcGFuLnRvZ2dsZUNsYXNzKCdjaGVja2VkJywgJGlucHV0LmlzKCc6Y2hlY2tlZCcpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkgeyAkc3Bhbi5hZGRDbGFzcygnZm9jdXMnKSB9LFxuICAgICAgICBibHVyOiBmdW5jdGlvbigpIHsgJHNwYW4ucmVtb3ZlQ2xhc3MoJ2ZvY3VzJykgfSxcbiAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKCkgeyAkKHRoaXMpLnRyaWdnZXIoJ2ZvY3VzJykgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgcmVxdWlyZSgnLi4vLi4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2RhdGVwaWNrZXInLFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9idWlsZERhdGVwaWNrZXIoKTtcbiAgICB9LFxuXG4gICBfYnVpbGREYXRlcGlja2VyOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyICRkYXRlcGlja2VyID0gdGhpcy4kZm9ybS5maW5kKCdpbnB1dC5kYXRlcGlja2VyJyk7XG5cbiAgICAgIC8vIEFsd2F5cyBzaG93IGRhdGVwaWNrZXIgYmVsb3cgdGhlIGlucHV0XG4gICAgICBpZiAoalF1ZXJ5LnVpKSB7XG4gICAgICAgICQuZGF0ZXBpY2tlci5fY2hlY2tPZmZzZXQgPSBmdW5jdGlvbihhLGIsYyl7IHJldHVybiBiIH07XG4gICAgICB9XG5cbiAgICAgIGlmIChqUXVlcnkudWkgJiYgJGRhdGVwaWNrZXIubGVuZ3RoKSB7XG5cbiAgICAgICAgJGRhdGVwaWNrZXIuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICQodGhpcykuZGF0ZXBpY2tlcih7XG4gICAgICAgICAgICBiZWZvcmVTaG93OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICAgICAgICAkKGlucHV0KS5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2hhbmdlTW9udGhZZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgLy8gSGFjayB0byBmaXggSUU5IG5vdCByZXNpemluZ1xuICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICAgICAgICAgLCB3aWR0aCA9ICR0aGlzLm91dGVyV2lkdGgoKTsgLy8gY2FjaGUgZmlyc3QhXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0ZXBpY2tlcignd2lkZ2V0JykuY3NzKCd3aWR0aCcsIHdpZHRoKTtcbiAgICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25DbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRqdXN0IHdpZHRoXG4gICAgICAgICRkYXRlcGlja2VyLm9uKCdmb2N1cyBrZXl1cCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciB0ID0gJCh0aGlzKSwgdyA9IHQub3V0ZXJXaWR0aCgpO1xuICAgICAgICAgIHQuZGF0ZXBpY2tlcignd2lkZ2V0JykuY3NzKCd3aWR0aCcsIHcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxufTtcbiIsImZ1bmN0aW9uIHRlbXBsYXRlKGh0bWwsIGRhdGEpIHtcblxuICB2YXIgbG9vcCA9IC9cXHtAKFtefV0rKVxcfSguKz8pXFx7XFwvXFwxXFx9L2dcbiAgICAsIGxvb3BWYXJpYWJsZSA9IC9cXHsjKFtefV0rKVxcfS9nXG4gICAgLCB2YXJpYWJsZSA9IC9cXHsoW159XSspXFx9L2c7XG5cbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZShsb29wLCBmdW5jdGlvbihfLCBrZXksIGxpc3QpIHtcbiAgICAgIHJldHVybiAkLm1hcChkYXRhW2tleV0sIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGxpc3QucmVwbGFjZShsb29wVmFyaWFibGUsIGZ1bmN0aW9uKF8sIGspIHtcbiAgICAgICAgICByZXR1cm4gaXRlbVtrXTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5qb2luKCcnKTtcbiAgICB9KVxuICAgIC5yZXBsYWNlKHZhcmlhYmxlLCBmdW5jdGlvbihfLCBrZXkpIHtcbiAgICAgIHJldHVybiBkYXRhW2tleV0gfHwgJyc7XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdkeW5hbWljRmllbGRzJyxcblxuICBvcHRpb25zOiB7XG5cbiAgICB0ZW1wbGF0ZXM6IHtcblxuICAgICAgYmFzZTonXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkXCI+XFxcbiAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJtYWluXCI+e2xhYmVsfTwvbGFiZWw+XFxcbiAgICAgICAgICB7ZmllbGR9XFxcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImVycm9yXCI+PC9zcGFuPlxcXG4gICAgICAgIDwvZGl2PlxcXG4gICAgICAnLFxuXG4gICAgICB0ZXh0OiAnPGlucHV0IG5hbWU9XCJ7bmFtZX1cIiB0eXBlPVwie3N1YnR5cGV9XCIgdmFsdWU9XCJ7dmFsdWV9XCIge2F0dHJzfT4nLFxuXG4gICAgICBmaWxlOiAnPGlucHV0IGlkPVwie25hbWV9IFwibmFtZT1cIntuYW1lfVwiIHR5cGU9XCJmaWxlXCIge2F0dHJzfT4nLFxuXG4gICAgICB0ZXh0YXJlYTogJzx0ZXh0YXJlYSBuYW1lPVwie25hbWV9XCIge2F0dHJzfT57dGV4dH08L3RleHRhcmVhPicsXG5cbiAgICAgIGdyb3VwOiAnXFxcbiAgICAgICAgPHAgY2xhc3M9XCJncm91cFwiPlxcXG4gICAgICAgICAge0BsaXN0fVxcXG4gICAgICAgICAgPGxhYmVsPjxpbnB1dCBuYW1lPVwie25hbWV9XCIgdHlwZT1cIntzdWJ0eXBlfVwiIHZhbHVlPVwieyN2YWx1ZX1cIiB7I2F0dHJzfT57I3RleHR9PC9sYWJlbD5cXFxuICAgICAgICAgIHsvbGlzdH1cXFxuICAgICAgICA8L3A+XFxcbiAgICAgICcsXG5cbiAgICAgIHNlbGVjdDogJ1xcXG4gICAgICAgIDxzZWxlY3QgbmFtZT17bmFtZX0+XFxcbiAgICAgICAgICB7QGxpc3R9XFxcbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwieyN2YWx1ZX1cIj57I3RleHR9PC9vcHRpb24+XFxcbiAgICAgICAgICB7L2xpc3R9XFxcbiAgICAgICAgPC9zZWxlY3Q+XFxcbiAgICAgICdcbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgYWRkRmllbGRzOiBmdW5jdGlvbihmaWVsZHMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2goZmllbGRzLCBmdW5jdGlvbihuYW1lLCBmaWVsZCkge1xuXG4gICAgICAgIHZhciB0eXBlQXJyYXkgPSBmaWVsZC50eXBlLnNwbGl0KCc6JylcbiAgICAgICAgICAsIHJ1bGVzID0ge31cbiAgICAgICAgICAsICRsYXN0ID0gc2VsZi4kZm9ybS5maW5kKHNlbGYub3B0cy5maWVsZCkubGFzdCgpO1xuXG4gICAgICAgIGZpZWxkLm5hbWUgPSBuYW1lO1xuICAgICAgICBmaWVsZC50eXBlID0gdHlwZUFycmF5WzBdO1xuICAgICAgICBpZiAodHlwZUFycmF5WzFdKSBmaWVsZC5zdWJ0eXBlID0gdHlwZUFycmF5WzFdO1xuXG4gICAgICAgIGZpZWxkLmh0bWwgPSB0ZW1wbGF0ZShzZWxmLm9wdHMudGVtcGxhdGVzLmJhc2UsIHtcbiAgICAgICAgICBsYWJlbDogZmllbGQubGFiZWwsXG4gICAgICAgICAgZmllbGQ6IHRlbXBsYXRlKHNlbGYub3B0cy50ZW1wbGF0ZXNbZmllbGQudHlwZV0sIGZpZWxkKVxuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLl9pbmplY3QoJ2FkZEZpZWxkczpiZWZvcmUnLCBmaWVsZCk7XG5cbiAgICAgICAgaWYgKGZpZWxkLmFmdGVyIHx8IGZpZWxkLmJlZm9yZSkge1xuICAgICAgICAgIHNlbGYuJGZvcm0uZmluZCgnW25hbWU9XCInKyAoZmllbGQuYWZ0ZXIgfHwgZmllbGQuYmVmb3JlKSArJ1wiXScpLmZpcnN0KCkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX2dldEZpZWxkKHRoaXMpW2ZpZWxkLmFmdGVyID8gJ2FmdGVyJyA6ICdiZWZvcmUnXShmaWVsZC5odG1sKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBGb3JtIGhhcyBhdCBsZWFzdCBvbmUgZmllbGRcbiAgICAgICAgICBpZiAoJGxhc3QubGVuZ3RoKSAkbGFzdC5hZnRlcihmaWVsZC5odG1sKTtcbiAgICAgICAgICAvLyBGb3JtIGhhcyBubyBmaWVsZHNcbiAgICAgICAgICBlbHNlIHNlbGYuJGZvcm0uYXBwZW5kKGZpZWxkLmh0bWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkLnJ1bGVzKSB7XG4gICAgICAgICAgcnVsZXNbbmFtZV0gPSBmaWVsZC5ydWxlcztcbiAgICAgICAgICBzZWxmLmFkZFJ1bGVzKHJ1bGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuX2luamVjdCgnYWRkRmllbGRzOmFmdGVyJywgZmllbGQpO1xuICAgICAgfSk7XG5cbiAgICB9LFxuXG4gICAgcmVtb3ZlRmllbGRzOiBmdW5jdGlvbihuYW1lcykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChuYW1lcy5zcGxpdCgnICcpLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAgIHZhciAkZmllbGQgPSBzZWxmLl9nZXRGaWVsZCgkKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKSk7XG4gICAgICAgIHNlbGYuJGZpZWxkcyA9IHNlbGYuJGZpZWxkcy5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICEgJCh0aGlzKS5pcygkZmllbGQpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGZpZWxkLnJlbW92ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2luamVjdCgncmVtb3ZlRmllbGRzJyk7XG4gICAgfSxcblxuICAgIHRvZ2dsZUZpZWxkczogZnVuY3Rpb24obmFtZXMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2gobmFtZXMuc3BsaXQoJyAnKSwgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgICB2YXIgJGZpZWxkID0gc2VsZi5fZ2V0RmllbGQoJCgnW25hbWU9XCInKyBuYW1lICsnXCJdJykpO1xuICAgICAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcsICRmaWVsZC5pcygnOnZpc2libGUnKSkudG9nZ2xlKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5faW5qZWN0KCd0b2dnbGVGaWVsZHMnKTtcbiAgICB9XG5cbiAgfVxufTtcbiIsIi8qIVxuICogSWRlYWwgU3RlcHNcbiovXG4oZnVuY3Rpb24oJCwgd2luLCBkb2MsIHVuZGVmaW5lZCkge1xuXG4gIHZhciBwbHVnaW4gPSB7fTtcblxuICBwbHVnaW4ubmFtZSA9ICdpZGVhbHN0ZXBzJztcblxuICBwbHVnaW4uZGVmYXVsdHMgPSB7XG4gICAgbmF2OiAnLmlkZWFsc3RlcHMtbmF2JyxcbiAgICBuYXZJdGVtczogJ2xpJyxcbiAgICBidWlsZE5hdkl0ZW1zOiB0cnVlLFxuICAgIHdyYXA6ICcuaWRlYWxzdGVwcy13cmFwJyxcbiAgICBzdGVwOiAnLmlkZWFsc3RlcHMtc3RlcCcsXG4gICAgYWN0aXZlQ2xhc3M6ICdpZGVhbHN0ZXBzLXN0ZXAtYWN0aXZlJyxcbiAgICBiZWZvcmU6ICQubm9vcCxcbiAgICBhZnRlcjogJC5ub29wLFxuICAgIGZhZGVTcGVlZDogMFxuICB9O1xuXG4gIHBsdWdpbi5tZXRob2RzID0ge1xuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgYWN0aXZlID0gdGhpcy5vcHRzLmFjdGl2ZUNsYXNzO1xuXG4gICAgICB0aGlzLiRlbCA9ICQodGhpcy5lbCk7XG5cbiAgICAgIHRoaXMuJG5hdiA9IHRoaXMuJGVsLmZpbmQodGhpcy5vcHRzLm5hdik7XG4gICAgICB0aGlzLiRuYXZJdGVtcyA9IHRoaXMuJG5hdi5maW5kKHRoaXMub3B0cy5uYXZJdGVtcyk7XG5cbiAgICAgIHRoaXMuJHdyYXAgPSB0aGlzLiRlbC5maW5kKHRoaXMub3B0cy53cmFwKTtcbiAgICAgIHRoaXMuJHN0ZXBzID0gdGhpcy4kd3JhcC5maW5kKHRoaXMub3B0cy5zdGVwKTtcblxuICAgICAgaWYgKHRoaXMub3B0cy5idWlsZE5hdkl0ZW1zKSB0aGlzLl9idWlsZE5hdkl0ZW1zKCk7XG5cbiAgICAgIHRoaXMuJHN0ZXBzLmhpZGUoKS5maXJzdCgpLnNob3coKTtcbiAgICAgIHRoaXMuJG5hdkl0ZW1zLnJlbW92ZUNsYXNzKGFjdGl2ZSkuZmlyc3QoKS5hZGRDbGFzcyhhY3RpdmUpO1xuXG4gICAgICB0aGlzLiRuYXZJdGVtcy5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCEgJCh0aGlzKS5pcygnLicrIHNlbGYub3B0cy5hY3RpdmVDbGFzcykpIHtcbiAgICAgICAgICBzZWxmLmdvKHNlbGYuJG5hdkl0ZW1zLmluZGV4KHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9idWlsZE5hdkl0ZW1zOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIGlzQ3VzdG9tID0gdHlwZW9mIHRoaXMub3B0cy5idWlsZE5hdkl0ZW1zID09ICdmdW5jdGlvbicsXG4gICAgICAgICAgaXRlbSA9IGZ1bmN0aW9uKHZhbCl7IHJldHVybiAnPGxpPjxhIGhyZWY9XCIjXCIgdGFiaW5kZXg9XCItMVwiPicrIHZhbCArJzwvYT48L2xpPic7IH0sXG4gICAgICAgICAgaXRlbXM7XG5cbiAgICAgIGl0ZW1zID0gaXNDdXN0b20gP1xuICAgICAgICB0aGlzLiRzdGVwcy5tYXAoZnVuY3Rpb24oaSl7IHJldHVybiBpdGVtKHNlbGYub3B0cy5idWlsZE5hdkl0ZW1zLmNhbGwoc2VsZiwgaSkpIH0pLmdldCgpIDpcbiAgICAgICAgdGhpcy4kc3RlcHMubWFwKGZ1bmN0aW9uKGkpeyByZXR1cm4gaXRlbSgrK2kpOyB9KS5nZXQoKTtcblxuICAgICAgdGhpcy4kbmF2SXRlbXMgPSAkKGl0ZW1zLmpvaW4oJycpKTtcblxuICAgICAgdGhpcy4kbmF2LmFwcGVuZCgkKCc8dWwvPicpLmFwcGVuZCh0aGlzLiRuYXZJdGVtcykpO1xuICAgIH0sXG5cbiAgICBfZ2V0Q3VySWR4OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLiRzdGVwcy5pbmRleCh0aGlzLiRzdGVwcy5maWx0ZXIoJzp2aXNpYmxlJykpO1xuICAgIH0sXG5cbiAgICBnbzogZnVuY3Rpb24oaWR4KSB7XG5cbiAgICAgIHZhciBhY3RpdmUgPSB0aGlzLm9wdHMuYWN0aXZlQ2xhc3MsXG4gICAgICAgICAgZmFkZVNwZWVkID0gdGhpcy5vcHRzLmZhZGVTcGVlZDtcblxuICAgICAgaWYgKHR5cGVvZiBpZHggPT0gJ2Z1bmN0aW9uJykgaWR4ID0gaWR4LmNhbGwodGhpcywgdGhpcy5fZ2V0Q3VySWR4KCkpO1xuXG4gICAgICBpZiAoaWR4ID49IHRoaXMuJHN0ZXBzLmxlbmd0aCkgaWR4ID0gMDtcbiAgICAgIGlmIChpZHggPCAwKSBpZHggPSB0aGlzLiRzdGVwcy5sZW5ndGgtMTtcblxuICAgICAgdGhpcy5vcHRzLmJlZm9yZS5jYWxsKHRoaXMsIGlkeCk7XG5cbiAgICAgIHRoaXMuJG5hdkl0ZW1zLnJlbW92ZUNsYXNzKGFjdGl2ZSkuZXEoaWR4KS5hZGRDbGFzcyhhY3RpdmUpO1xuICAgICAgdGhpcy4kc3RlcHMuaGlkZSgpLmVxKGlkeCkuZmFkZUluKGZhZGVTcGVlZCk7XG5cbiAgICAgIHRoaXMub3B0cy5hZnRlci5jYWxsKHRoaXMsIGlkeCk7XG4gICAgfSxcblxuICAgIHByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbyh0aGlzLl9nZXRDdXJJZHgoKSAtIDEpO1xuICAgIH0sXG5cbiAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28odGhpcy5fZ2V0Q3VySWR4KCkgKyAxKTtcbiAgICB9LFxuXG4gICAgZmlyc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbygwKTtcbiAgICB9LFxuXG4gICAgbGFzdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKHRoaXMuJHN0ZXBzLmxlbmd0aC0xKTtcbiAgICB9XG4gIH07XG5cbiAgcmVxdWlyZSgnLi4vLi4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcbiIsInJlcXVpcmUoJy4vaWRlYWxzdGVwcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnc3RlcHMnLFxuXG4gIG9wdGlvbnM6IHtcblxuICAgIHN0ZXBzOiB7XG5cbiAgICAgIGNvbnRhaW5lcjogJy5pZGVhbHN0ZXBzLWNvbnRhaW5lcicsXG4gICAgICBuYXY6ICcuaWRlYWxzdGVwcy1uYXYnLFxuICAgICAgbmF2SXRlbXM6ICdsaScsXG4gICAgICBidWlsZE5hdkl0ZW1zOiBmdW5jdGlvbihpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdHMuc3RlcHMuaTE4bi5zdGVwICsnICcrIChpKzEpO1xuICAgICAgfSxcbiAgICAgIHdyYXA6ICcuaWRlYWxzdGVwcy13cmFwJyxcbiAgICAgIHN0ZXA6ICcuaWRlYWxzdGVwcy1zdGVwJyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAnaWRlYWxzdGVwcy1zdGVwLWFjdGl2ZScsXG4gICAgICBiZWZvcmU6ICQubm9vcCxcbiAgICAgIGFmdGVyOiAkLm5vb3AsXG4gICAgICBmYWRlU3BlZWQ6IDAsXG5cbiAgICAgIGkxOG46IHtcbiAgICAgICAgc3RlcDogJ1N0ZXAnXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9idWlsZFN0ZXBzKCk7XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICBfdmFsaWRhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZVN0ZXBzKCk7XG5cbiAgICAgIGlmICh0aGlzLl9oYXNFeHRlbnNpb24oJ2FqYXgnKSkge1xuICAgICAgICAkLmVhY2goJC5pZGVhbGZvcm1zLl9yZXF1ZXN0cywgZnVuY3Rpb24oa2V5LCByZXF1ZXN0KSB7XG4gICAgICAgICAgcmVxdWVzdC5kb25lKGZ1bmN0aW9uKCl7IHNlbGYuX3VwZGF0ZVN0ZXBzKCkgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgZm9jdXNGaXJzdEludmFsaWQ6IGZ1bmN0aW9uKGZpcnN0SW52YWxpZCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ2dvJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRzdGVwcy5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQodGhpcykuZmluZChmaXJzdEludmFsaWQpLmxlbmd0aDtcbiAgICAgICAgfSkuaW5kZXgoKTtcbiAgICAgIH0pO1xuXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ICQoZmlyc3RJbnZhbGlkKS5mb2N1cygpIH0sIHRoaXMub3B0cy5zdGVwcy5mYWRlU3BlZWQpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgYWRkUnVsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5maXJzdFN0ZXAoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgICdhZGRGaWVsZHM6YmVmb3JlJzogZnVuY3Rpb24oZmllbGQpIHtcblxuICAgICAgaWYgKGZpZWxkLmFmdGVyIHx8IGZpZWxkLmJlZm9yZSkgcmV0dXJuO1xuXG4gICAgICB2YXIgJHN0ZXBzID0gdGhpcy4kc3RlcHNDb250YWluZXIuZmluZCh0aGlzLm9wdHMuc3RlcHMuc3RlcCk7XG5cbiAgICAgIGlmICghICgnYXBwZW5kVG9TdGVwJyBpbiBmaWVsZCkpIHtcbiAgICAgICAgZmllbGQuYXBwZW5kVG9TdGVwID0gJHN0ZXBzLmxlbmd0aC0xO1xuICAgICAgfVxuXG4gICAgICBmaWVsZC5hZnRlciA9ICRzdGVwc1xuICAgICAgICAuZXEoZmllbGQuYXBwZW5kVG9TdGVwKVxuICAgICAgICAuZmluZCgnaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEnKVxuICAgICAgICAubGFzdCgpWzBdLm5hbWU7XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICB0b2dnbGVGaWVsZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fdXBkYXRlU3RlcHMoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIHJlbW92ZUZpZWxkczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuICAgIH0sXG5cbiAgICBfYnVpbGRTdGVwczogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcywgb3B0aW9uc1xuICAgICAgICAsIGhhc1J1bGVzID0gISAkLmlzRW1wdHlPYmplY3QodGhpcy5vcHRzLnJ1bGVzKVxuICAgICAgICAsIGJ1aWxkTmF2SXRlbXMgPSB0aGlzLm9wdHMuc3RlcHMuYnVpbGROYXZJdGVtc1xuICAgICAgICAsIGNvdW50ZXIgPSBoYXNSdWxlc1xuICAgICAgICAgID8gJzxzcGFuIGNsYXNzPVwiY291bnRlclwiLz4nXG4gICAgICAgICAgOiAnPHNwYW4gY2xhc3M9XCJjb3VudGVyIHplcm9cIj4wPC9zcGFuPic7XG5cbiAgICAgIGlmICh0aGlzLm9wdHMuc3RlcHMuYnVpbGROYXZJdGVtcykge1xuICAgICAgICB0aGlzLm9wdHMuc3RlcHMuYnVpbGROYXZJdGVtcyA9IGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICByZXR1cm4gYnVpbGROYXZJdGVtcy5jYWxsKHNlbGYsIGkpICsgY291bnRlcjtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIgPSB0aGlzLiRmb3JtXG4gICAgICAgIC5jbG9zZXN0KHRoaXMub3B0cy5zdGVwcy5jb250YWluZXIpXG4gICAgICAgIC5pZGVhbHN0ZXBzKHRoaXMub3B0cy5zdGVwcyk7XG4gICAgfSxcblxuICAgIF91cGRhdGVTdGVwczogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnX2luamVjdCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBpZGVhbHN0ZXBzID0gdGhpcztcblxuICAgICAgICB0aGlzLiRuYXZJdGVtcy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICB2YXIgaW52YWxpZCA9IGlkZWFsc3RlcHMuJHN0ZXBzLmVxKGkpLmZpbmQoc2VsZi5nZXRJbnZhbGlkKCkpLmxlbmd0aDtcbiAgICAgICAgICAkKHRoaXMpLmZpbmQoJ3NwYW4nKS50ZXh0KGludmFsaWQpLnRvZ2dsZUNsYXNzKCd6ZXJvJywgISBpbnZhbGlkKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ29Ub1N0ZXA6IGZ1bmN0aW9uKGlkeCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnZ28nLCBpZHgpO1xuICAgIH0sXG5cbiAgICBwcmV2U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdwcmV2Jyk7XG4gICAgfSxcblxuICAgIG5leHRTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ25leHQnKTtcbiAgICB9LFxuXG4gICAgZmlyc3RTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ2ZpcnN0Jyk7XG4gICAgfSxcblxuICAgIGxhc3RTdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ2xhc3QnKTtcbiAgICB9XG4gIH1cblxufTtcbiIsIi8qIVxuICogalF1ZXJ5IElkZWFsIEZvcm1zXG4gKiBAYXV0aG9yOiBDZWRyaWMgUnVpelxuICogQHZlcnNpb246IDMuMFxuICogQGxpY2Vuc2UgR1BMIG9yIE1JVFxuICovXG4oZnVuY3Rpb24oJCwgd2luLCBkb2MsIHVuZGVmaW5lZCkge1xuXG4gIHZhciBwbHVnaW4gPSB7fTtcblxuICBwbHVnaW4ubmFtZSA9ICdpZGVhbGZvcm1zJztcblxuICBwbHVnaW4uZGVmYXVsdHMgPSB7XG4gICAgZmllbGQ6ICcuZmllbGQnLFxuICAgIGVycm9yOiAnLmVycm9yJyxcbiAgICBpY29uSHRtbDogJzxpLz4nLFxuICAgIGljb25DbGFzczogJ2ljb24nLFxuICAgIGludmFsaWRDbGFzczogJ2ludmFsaWQnLFxuICAgIHZhbGlkQ2xhc3M6ICd2YWxpZCcsXG4gICAgc2lsZW50TG9hZDogdHJ1ZSxcbiAgICBvblZhbGlkYXRlOiAkLm5vb3AsXG4gICAgb25TdWJtaXQ6ICQubm9vcCxcbiAgICBydWxlczoge30sXG4gICAgZXJyb3JzOiB7fVxuICB9O1xuXG4gIHBsdWdpbi5nbG9iYWwgPSB7XG5cbiAgICBfZm9ybWF0OiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHsoXFxkKVxcfS9nLCBmdW5jdGlvbihfLCBtYXRjaCkge1xuICAgICAgICByZXR1cm4gYXJnc1srbWF0Y2hdIHx8ICcnO1xuICAgICAgfSkucmVwbGFjZSgvXFx7XFwqKFteKn1dKilcXH0vZywgZnVuY3Rpb24oXywgc2VwKSB7XG4gICAgICAgIHJldHVybiBhcmdzLmpvaW4oc2VwIHx8ICcsICcpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9nZXRLZXk6IGZ1bmN0aW9uKGtleSwgb2JqKSB7XG4gICAgICByZXR1cm4ga2V5LnNwbGl0KCcuJykucmVkdWNlKGZ1bmN0aW9uKGEsYikge1xuICAgICAgICByZXR1cm4gYSAmJiBhW2JdO1xuICAgICAgfSwgb2JqKTtcbiAgICB9LFxuXG4gICAgaTE4bjoge30sXG5cbiAgICBydWxlU2VwYXJhdG9yOiAnICcsXG4gICAgYXJnU2VwYXJhdG9yOiAnOicsXG5cbiAgICBydWxlczogcmVxdWlyZSgnLi9ydWxlcycpLFxuICAgIGVycm9yczogcmVxdWlyZSgnLi9lcnJvcnMnKSxcblxuICAgIGV4dGVuc2lvbnM6IFtcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9keW5hbWljLWZpZWxkcy9keW5hbWljLWZpZWxkcy5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9hamF4L2FqYXguZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvc3RlcHMvc3RlcHMuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvY3VzdG9tLWlucHV0cy9jdXN0b20taW5wdXRzLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9hZGFwdGl2ZS9hZGFwdGl2ZS5leHQnKVxuICAgIF1cbiAgfTtcblxuICBwbHVnaW4ubWV0aG9kcyA9ICQuZXh0ZW5kKHt9LCByZXF1aXJlKCcuL3ByaXZhdGUnKSwgcmVxdWlyZSgnLi9wdWJsaWMnKSk7XG5cbiAgcmVxdWlyZSgnLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIiwiLyoqXG4gKiBQbHVnaW4gYm9pbGVycGxhdGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEFQID0gQXJyYXkucHJvdG90eXBlO1xuXG4gIHJldHVybiBmdW5jdGlvbihwbHVnaW4pIHtcblxuICAgIHBsdWdpbiA9ICQuZXh0ZW5kKHRydWUsIHtcbiAgICAgIG5hbWU6ICdwbHVnaW4nLFxuICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgZGlzYWJsZWRFeHRlbnNpb25zOiAnbm9uZSdcbiAgICAgIH0sXG4gICAgICBtZXRob2RzOiB7fSxcbiAgICAgIGdsb2JhbDoge30sXG4gICAgfSwgcGx1Z2luKTtcblxuICAgICRbcGx1Z2luLm5hbWVdID0gJC5leHRlbmQoe1xuXG4gICAgICBhZGRFeHRlbnNpb246IGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuICAgICAgICBwbHVnaW4uZ2xvYmFsLmV4dGVuc2lvbnMucHVzaChleHRlbnNpb24pO1xuICAgICAgfVxuICAgIH0sIHBsdWdpbi5nbG9iYWwpO1xuXG4gICAgZnVuY3Rpb24gUGx1Z2luKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQoe30sIHBsdWdpbi5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICB0aGlzLmVsID0gZWxlbWVudDtcblxuICAgICAgdGhpcy5fbmFtZSA9IHBsdWdpbi5uYW1lO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgfVxuXG4gICAgUGx1Z2luLl9leHRlbmRlZCA9IHt9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5faGFzRXh0ZW5zaW9uID0gZnVuY3Rpb24oZXh0ZW5zaW9uKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgcmV0dXJuIHBsdWdpbi5nbG9iYWwuZXh0ZW5zaW9ucy5maWx0ZXIoZnVuY3Rpb24oZXh0KSB7XG4gICAgICAgIHJldHVybiBleHQubmFtZSA9PSBleHRlbnNpb24gJiYgc2VsZi5vcHRzLmRpc2FibGVkRXh0ZW5zaW9ucy5pbmRleE9mKGV4dC5uYW1lKSA8IDA7XG4gICAgICB9KS5sZW5ndGg7XG4gICAgfTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2V4dGVuZCA9IGZ1bmN0aW9uKGV4dGVuc2lvbnMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2goZXh0ZW5zaW9ucywgZnVuY3Rpb24oaSwgZXh0ZW5zaW9uKSB7XG5cbiAgICAgICAgJC5leHRlbmQoc2VsZi5vcHRzLCAkLmV4dGVuZCh0cnVlLCBleHRlbnNpb24ub3B0aW9ucywgc2VsZi5vcHRzKSk7XG5cbiAgICAgICAgJC5lYWNoKGV4dGVuc2lvbi5tZXRob2RzLCBmdW5jdGlvbihtZXRob2QsIGZuKSB7XG5cbiAgICAgICAgICBpZiAoc2VsZi5vcHRzLmRpc2FibGVkRXh0ZW5zaW9ucy5pbmRleE9mKGV4dGVuc2lvbi5uYW1lKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFBsdWdpbi5wcm90b3R5cGVbbWV0aG9kLnNwbGl0KCc6JylbMF1dKSB7XG4gICAgICAgICAgICBQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0gPSBQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0gfHwgW107XG4gICAgICAgICAgICBQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0ucHVzaCh7IG5hbWU6IGV4dGVuc2lvbi5uYW1lLCBmbjogZm4gfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFBsdWdpbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlLl9pbmplY3QgPSBmdW5jdGlvbihtZXRob2QpIHtcblxuICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICAgIGlmICh0eXBlb2YgbWV0aG9kID09ICdmdW5jdGlvbicpIHJldHVybiBtZXRob2QuY2FsbCh0aGlzKTtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoUGx1Z2luLl9leHRlbmRlZFttZXRob2RdKSB7XG4gICAgICAgICQuZWFjaChQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0sIGZ1bmN0aW9uKGksIHBsdWdpbikge1xuICAgICAgICAgIHBsdWdpbi5mbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2luaXQgPSAkLm5vb3A7XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlW3BsdWdpbi5uYW1lXSA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgaWYgKCFtZXRob2QpIHJldHVybiB0aGlzO1xuICAgICAgdHJ5IHsgcmV0dXJuIHRoaXNbbWV0aG9kXS5hcHBseSh0aGlzLCBBUC5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpOyB9XG4gICAgICBjYXRjaChlKSB7fVxuICAgIH07XG5cbiAgICAkLmV4dGVuZChQbHVnaW4ucHJvdG90eXBlLCBwbHVnaW4ubWV0aG9kcyk7XG5cbiAgICAkLmZuW3BsdWdpbi5uYW1lXSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgYXJncyA9IEFQLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgICAgICAsIG1ldGhvZEFycmF5ID0gdHlwZW9mIGFyZ3NbMF0gPT0gJ3N0cmluZycgJiYgYXJnc1swXS5zcGxpdCgnOicpXG4gICAgICAgICwgbWV0aG9kID0gbWV0aG9kQXJyYXlbbWV0aG9kQXJyYXkubGVuZ3RoID4gMSA/IDEgOiAwXVxuICAgICAgICAsIHByZWZpeCA9IG1ldGhvZEFycmF5Lmxlbmd0aCA+IDEgJiYgbWV0aG9kQXJyYXlbMF1cbiAgICAgICAgLCBvcHRzID0gdHlwZW9mIGFyZ3NbMF0gPT0gJ29iamVjdCcgJiYgYXJnc1swXVxuICAgICAgICAsIHBhcmFtcyA9IGFyZ3Muc2xpY2UoMSlcbiAgICAgICAgLCByZXQ7XG5cbiAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgbWV0aG9kID0gcHJlZml4ICsgbWV0aG9kLnN1YnN0cigwLDEpLnRvVXBwZXJDYXNlKCkgKyBtZXRob2Quc3Vic3RyKDEsbWV0aG9kLmxlbmd0aC0xKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBpbnN0YW5jZSA9ICQuZGF0YSh0aGlzLCBwbHVnaW4ubmFtZSk7XG5cbiAgICAgICAgLy8gTWV0aG9kXG4gICAgICAgIGlmIChpbnN0YW5jZSkge1xuICAgICAgICAgIHJldHVybiByZXQgPSBpbnN0YW5jZVtwbHVnaW4ubmFtZV0uYXBwbHkoaW5zdGFuY2UsIFttZXRob2RdLmNvbmNhdChwYXJhbXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluaXRcbiAgICAgICAgcmV0dXJuICQuZGF0YSh0aGlzLCBwbHVnaW4ubmFtZSwgbmV3IFBsdWdpbih0aGlzLCBvcHRzKSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHByZWZpeCA/IHJldCA6IHRoaXM7XG4gICAgfTtcbiAgfTtcblxufSgpKTtcbiIsIi8qKlxuICogUHJpdmF0ZSBtZXRob2RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuJGZvcm0gPSAkKHRoaXMuZWwpO1xuICAgIHRoaXMuJGZpZWxkcyA9ICQoKTtcbiAgICB0aGlzLiRpbnB1dHMgPSAkKCk7XG5cbiAgICB0aGlzLl9leHRlbmQoJC5pZGVhbGZvcm1zLmV4dGVuc2lvbnMpO1xuICAgIHRoaXMuX2kxOG4oKTtcblxuICAgIHRoaXMuX2luamVjdCgnX2luaXQnKTtcblxuICAgIHRoaXMuX2FkZE1hcmt1cFJ1bGVzKCk7XG4gICAgdGhpcy5hZGRSdWxlcyh0aGlzLm9wdHMucnVsZXMgfHwge30pO1xuXG4gICAgdGhpcy4kZm9ybS5zdWJtaXQoZnVuY3Rpb24oZSkge1xuICAgICAgc2VsZi5fdmFsaWRhdGVBbGwoKTtcbiAgICAgIHNlbGYuZm9jdXNGaXJzdEludmFsaWQoKTtcbiAgICAgIHNlbGYub3B0cy5vblN1Ym1pdC5jYWxsKHNlbGYsIHNlbGYuZ2V0SW52YWxpZCgpLmxlbmd0aCwgZSk7XG4gICAgfSk7XG5cbiAgICBpZiAoISB0aGlzLm9wdHMuc2lsZW50TG9hZCkge1xuICAgICAgLy8gMW1zIHRpbWVvdXQgdG8gbWFrZSBzdXJlIGVycm9yIHNob3dzIHVwXG4gICAgICBzZXRUaW1lb3V0KCQucHJveHkodGhpcy5mb2N1c0ZpcnN0SW52YWxpZCwgdGhpcyksIDEpO1xuICAgIH1cbiAgfSxcblxuICBfYWRkTWFya3VwUnVsZXM6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJ1bGVzID0ge307XG5cbiAgICB0aGlzLiRmb3JtLmZpbmQoJ2lucHV0LCBzZWxlY3QsIHRleHRhcmVhJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBydWxlID0gJCh0aGlzKS5kYXRhKCdpZGVhbGZvcm1zLXJ1bGVzJyk7XG4gICAgICBpZiAocnVsZSAmJiAhIHJ1bGVzW3RoaXMubmFtZV0pIHJ1bGVzW3RoaXMubmFtZV0gPSBydWxlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRSdWxlcyhydWxlcyk7XG4gIH0sXG5cbiAgX2kxOG46IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgJC5lYWNoKCQuaWRlYWxmb3Jtcy5pMThuLCBmdW5jdGlvbihsb2NhbGUsIGxhbmcpIHtcblxuICAgICAgdmFyIGVycm9ycyA9IGxhbmcuZXJyb3JzXG4gICAgICAgICwgb3B0aW9ucyA9IHt9O1xuXG4gICAgICBkZWxldGUgbGFuZy5lcnJvcnM7XG5cbiAgICAgIGZvciAodmFyIGV4dCBpbiBsYW5nKSBvcHRpb25zW2V4dF0gPSB7IGkxOG46IGxhbmdbZXh0XSB9O1xuXG4gICAgICAkLmV4dGVuZCgkLmlkZWFsZm9ybXMuZXJyb3JzLCBlcnJvcnMpO1xuICAgICAgJC5leHRlbmQodHJ1ZSwgc2VsZi5vcHRzLCBvcHRpb25zKTtcbiAgICB9KTtcbiAgfSxcblxuICBfYnVpbGRGaWVsZDogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgICwgJGljb247XG5cbiAgICAkaWNvbiA9ICQodGhpcy5vcHRzLmljb25IdG1sLCB7XG4gICAgICBjbGFzczogdGhpcy5vcHRzLmljb25DbGFzcyxcbiAgICAgIGNsaWNrOiBmdW5jdGlvbigpeyAkKGlucHV0KS5mb2N1cygpIH1cbiAgICB9KTtcblxuICAgIGlmICghIHRoaXMuJGZpZWxkcy5maWx0ZXIoJGZpZWxkKS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuJGZpZWxkcyA9IHRoaXMuJGZpZWxkcy5hZGQoJGZpZWxkKTtcbiAgICAgIGlmICh0aGlzLm9wdHMuaWNvbkh0bWwpICRmaWVsZC5hcHBlbmQoJGljb24pO1xuICAgICAgJGZpZWxkLmFkZENsYXNzKCdpZGVhbGZvcm1zLWZpZWxkIGlkZWFsZm9ybXMtZmllbGQtJysgaW5wdXQudHlwZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fYWRkRXZlbnRzKGlucHV0KTtcblxuICAgIHRoaXMuX2luamVjdCgnX2J1aWxkRmllbGQnLCBpbnB1dCk7XG4gIH0sXG5cbiAgX2FkZEV2ZW50czogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dCk7XG5cbiAgICAkKGlucHV0KVxuICAgICAgLm9uKCdjaGFuZ2Uga2V5dXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLndoaWNoID09IDkgfHwgZS53aGljaCA9PSAxNikgcmV0dXJuO1xuICAgICAgICBzZWxmLl92YWxpZGF0ZSh0aGlzLCB0cnVlLCB0cnVlKTtcbiAgICAgIH0pXG4gICAgICAuZm9jdXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghIHNlbGYuaXNWYWxpZCh0aGlzLm5hbWUpKSB7XG4gICAgICAgICAgJGZpZWxkLmZpbmQoc2VsZi5vcHRzLmVycm9yKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuYmx1cihmdW5jdGlvbigpIHtcbiAgICAgICAgJGZpZWxkLmZpbmQoc2VsZi5vcHRzLmVycm9yKS5oaWRlKCk7XG4gICAgICB9KTtcbiAgfSxcblxuICBfaXNSZXF1aXJlZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAvLyBXZSBhc3N1bWUgbm9uLXRleHQgaW5wdXRzIHdpdGggcnVsZXMgYXJlIHJlcXVpcmVkXG4gICAgaWYgKCQoaW5wdXQpLmlzKCc6Y2hlY2tib3gsIDpyYWRpbywgc2VsZWN0JykpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiB0aGlzLm9wdHMucnVsZXNbaW5wdXQubmFtZV0uaW5kZXhPZigncmVxdWlyZWQnKSA+IC0xO1xuICB9LFxuXG4gIF9nZXRSZWxhdGVkOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRGaWVsZChpbnB1dCkuZmluZCgnW25hbWU9XCInKyBpbnB1dC5uYW1lICsnXCJdJyk7XG4gIH0sXG5cbiAgX2dldEZpZWxkOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHJldHVybiAkKGlucHV0KS5jbG9zZXN0KHRoaXMub3B0cy5maWVsZCk7XG4gIH0sXG5cbiAgX2dldEZpcnN0SW52YWxpZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW52YWxpZCgpLmZpcnN0KCkuZmluZCgnaW5wdXQ6Zmlyc3QsIHRleHRhcmVhLCBzZWxlY3QnKTtcbiAgfSxcblxuICBfaGFuZGxlRXJyb3I6IGZ1bmN0aW9uKGlucHV0LCBlcnJvciwgdmFsaWQpIHtcbiAgICB2YWxpZCA9IHZhbGlkIHx8IHRoaXMuaXNWYWxpZChpbnB1dC5uYW1lKTtcbiAgICB2YXIgJGVycm9yID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpLmZpbmQodGhpcy5vcHRzLmVycm9yKTtcbiAgICB0aGlzLiRmb3JtLmZpbmQodGhpcy5vcHRzLmVycm9yKS5oaWRlKCk7XG4gICAgaWYgKGVycm9yKSAkZXJyb3IudGV4dChlcnJvcik7XG4gICAgJGVycm9yLnRvZ2dsZSghdmFsaWQpO1xuICB9LFxuXG4gIF9oYW5kbGVTdHlsZTogZnVuY3Rpb24oaW5wdXQsIHZhbGlkKSB7XG4gICAgdmFsaWQgPSB2YWxpZCB8fCB0aGlzLmlzVmFsaWQoaW5wdXQubmFtZSk7XG4gICAgdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRzLnZhbGlkQ2xhc3MgKycgJysgdGhpcy5vcHRzLmludmFsaWRDbGFzcylcbiAgICAgIC5hZGRDbGFzcyh2YWxpZCA/IHRoaXMub3B0cy52YWxpZENsYXNzIDogdGhpcy5vcHRzLmludmFsaWRDbGFzcylcbiAgICAgIC5maW5kKCcuJysgdGhpcy5vcHRzLmljb25DbGFzcykuc2hvdygpO1xuICB9LFxuXG4gIF9mcmVzaDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLm9wdHMudmFsaWRDbGFzcyArJyAnKyB0aGlzLm9wdHMuaW52YWxpZENsYXNzKVxuICAgICAgLmZpbmQodGhpcy5vcHRzLmVycm9yKS5oaWRlKClcbiAgICAgIC5lbmQoKVxuICAgICAgLmZpbmQoJy4nKyB0aGlzLm9wdHMuaWNvbkNsYXNzKS50b2dnbGUodGhpcy5faXNSZXF1aXJlZChpbnB1dCkpO1xuICB9LFxuXG4gIF92YWxpZGF0ZTogZnVuY3Rpb24oaW5wdXQsIGhhbmRsZUVycm9yLCBoYW5kbGVTdHlsZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLCB1c2VyUnVsZXMgPSB0aGlzLm9wdHMucnVsZXNbaW5wdXQubmFtZV0uc3BsaXQoJC5pZGVhbGZvcm1zLnJ1bGVTZXBhcmF0b3IpXG4gICAgICAsIG9sZFZhbHVlID0gJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsdWUnKVxuICAgICAgLCB2YWxpZCA9IHRydWVcbiAgICAgICwgcnVsZTtcblxuICAgIC8vIERvbid0IHZhbGlkYXRlIGlucHV0IGlmIHZhbHVlIGhhc24ndCBjaGFuZ2VkXG4gICAgaWYgKCEgJChpbnB1dCkuaXMoJzpjaGVja2JveCwgOnJhZGlvJykgJiYgb2xkVmFsdWUgPT0gaW5wdXQudmFsdWUpIHtcbiAgICAgIHJldHVybiAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcpO1xuICAgIH1cblxuICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbHVlJywgaW5wdXQudmFsdWUpO1xuXG4gICAgLy8gTm9uLXJlcXVpcmVkIGlucHV0IHdpdGggZW1wdHkgdmFsdWUgbXVzdCBwYXNzIHZhbGlkYXRpb25cbiAgICBpZiAoISBpbnB1dC52YWx1ZSAmJiAhIHRoaXMuX2lzUmVxdWlyZWQoaW5wdXQpKSB7XG4gICAgICAkZmllbGQucmVtb3ZlRGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcpO1xuICAgICAgdGhpcy5fZnJlc2goaW5wdXQpO1xuXG4gICAgLy8gSW5wdXRzIHdpdGggdmFsdWUgb3IgcmVxdWlyZWRcbiAgICB9IGVsc2Uge1xuXG4gICAgICAkLmVhY2godXNlclJ1bGVzLCBmdW5jdGlvbihpLCB1c2VyUnVsZSkge1xuXG4gICAgICAgIHVzZXJSdWxlID0gdXNlclJ1bGUuc3BsaXQoJC5pZGVhbGZvcm1zLmFyZ1NlcGFyYXRvcik7XG5cbiAgICAgICAgcnVsZSA9IHVzZXJSdWxlWzBdO1xuXG4gICAgICAgIHZhciB0aGVSdWxlID0gJC5pZGVhbGZvcm1zLnJ1bGVzW3J1bGVdXG4gICAgICAgICAgLCBhcmdzID0gdXNlclJ1bGUuc2xpY2UoMSlcbiAgICAgICAgICAsIGVycm9yO1xuXG4gICAgICAgIGVycm9yID0gJC5pZGVhbGZvcm1zLl9mb3JtYXQuYXBwbHkobnVsbCwgW1xuICAgICAgICAgICQuaWRlYWxmb3Jtcy5fZ2V0S2V5KCdlcnJvcnMuJysgaW5wdXQubmFtZSArJy4nKyBydWxlLCBzZWxmLm9wdHMpIHx8XG4gICAgICAgICAgJC5pZGVhbGZvcm1zLmVycm9yc1tydWxlXVxuICAgICAgICBdLmNvbmNhdChhcmdzKSk7XG5cbiAgICAgICAgdmFsaWQgPSB0eXBlb2YgdGhlUnVsZSA9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgPyB0aGVSdWxlLmFwcGx5KHNlbGYsIFtpbnB1dCwgaW5wdXQudmFsdWVdLmNvbmNhdChhcmdzKSlcbiAgICAgICAgICA6IHRoZVJ1bGUudGVzdChpbnB1dC52YWx1ZSk7XG5cbiAgICAgICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnLCB2YWxpZCk7XG5cbiAgICAgICAgaWYgKGhhbmRsZUVycm9yKSBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCwgZXJyb3IsIHZhbGlkKTtcbiAgICAgICAgaWYgKGhhbmRsZVN0eWxlKSBzZWxmLl9oYW5kbGVTdHlsZShpbnB1dCwgdmFsaWQpO1xuXG4gICAgICAgIHNlbGYub3B0cy5vblZhbGlkYXRlLmNhbGwoc2VsZiwgaW5wdXQsIHJ1bGUsIHZhbGlkKTtcblxuICAgICAgICByZXR1cm4gdmFsaWQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbmplY3QoJ192YWxpZGF0ZScsIGlucHV0LCBydWxlLCB2YWxpZCk7XG5cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH0sXG5cbiAgX3ZhbGlkYXRlQWxsOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy4kaW5wdXRzLmVhY2goZnVuY3Rpb24oKXsgc2VsZi5fdmFsaWRhdGUodGhpcywgdHJ1ZSk7IH0pO1xuICB9XG59O1xuIiwiLyoqXG4gKiBQdWJsaWMgbWV0aG9kc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhZGRSdWxlczogZnVuY3Rpb24ocnVsZXMpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciAkaW5wdXRzID0gdGhpcy4kZm9ybS5maW5kKCQubWFwKHJ1bGVzLCBmdW5jdGlvbihfLCBuYW1lKSB7XG4gICAgICByZXR1cm4gJ1tuYW1lPVwiJysgbmFtZSArJ1wiXSc7XG4gICAgfSkuam9pbignLCcpKTtcblxuICAgICQuZXh0ZW5kKHRoaXMub3B0cy5ydWxlcywgcnVsZXMpO1xuXG4gICAgJGlucHV0cy5lYWNoKGZ1bmN0aW9uKCl7IHNlbGYuX2J1aWxkRmllbGQodGhpcykgfSk7XG4gICAgdGhpcy4kaW5wdXRzID0gdGhpcy4kaW5wdXRzLmFkZCgkaW5wdXRzKTtcblxuICAgIHRoaXMuX3ZhbGlkYXRlQWxsKCk7XG4gICAgdGhpcy4kZmllbGRzLmZpbmQodGhpcy5vcHRzLmVycm9yKS5oaWRlKCk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ2FkZFJ1bGVzJyk7XG4gIH0sXG5cbiAgZ2V0SW52YWxpZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGZpZWxkcy5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJCh0aGlzKS5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJykgPT09IGZhbHNlO1xuICAgIH0pO1xuICB9LFxuXG4gIGZvY3VzRmlyc3RJbnZhbGlkOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBmaXJzdEludmFsaWQgPSB0aGlzLl9nZXRGaXJzdEludmFsaWQoKVswXTtcblxuICAgIGlmIChmaXJzdEludmFsaWQpIHtcbiAgICAgIHRoaXMuX2hhbmRsZUVycm9yKGZpcnN0SW52YWxpZCk7XG4gICAgICB0aGlzLl9oYW5kbGVTdHlsZShmaXJzdEludmFsaWQpO1xuICAgICAgdGhpcy5faW5qZWN0KCdmb2N1c0ZpcnN0SW52YWxpZCcsIGZpcnN0SW52YWxpZCk7XG4gICAgICAkKGZpcnN0SW52YWxpZCkuZm9jdXMoKTtcbiAgICB9XG4gIH0sXG5cbiAgaXNWYWxpZDogZnVuY3Rpb24obmFtZSkge1xuICAgIGlmIChuYW1lKSByZXR1cm4gISB0aGlzLmdldEludmFsaWQoKS5maW5kKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKS5sZW5ndGg7XG4gICAgcmV0dXJuICEgdGhpcy5nZXRJbnZhbGlkKCkubGVuZ3RoO1xuICB9LFxuXG4gIHJlc2V0OiBmdW5jdGlvbihuYW1lKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGlucHV0cyA9IHRoaXMuJGlucHV0cztcblxuICAgIGlmIChuYW1lKSAkaW5wdXRzID0gJGlucHV0cy5maWx0ZXIoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpO1xuXG4gICAgJGlucHV0cy5maWx0ZXIoJ2lucHV0Om5vdCg6Y2hlY2tib3gsIDpyYWRpbyknKS52YWwoJycpO1xuICAgICRpbnB1dHMuZmlsdGVyKCc6Y2hlY2tib3gsIDpyYWRpbycpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgJGlucHV0cy5maWx0ZXIoJ3NlbGVjdCcpLmZpbmQoJ29wdGlvbicpLnByb3AoJ3NlbGVjdGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZhdWx0U2VsZWN0ZWQ7XG4gICAgfSk7XG5cbiAgICAkaW5wdXRzLmNoYW5nZSgpLmVhY2goZnVuY3Rpb24oKXsgc2VsZi5fZnJlc2godGhpcykgfSk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ3Jlc2V0JywgbmFtZSk7XG4gIH1cblxufTtcbiIsIi8qKlxuICogUnVsZXNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgcmVxdWlyZWQ6IC8uKy8sXG4gIGRpZ2l0czogL15cXGQrJC8sXG4gIGVtYWlsOiAvXlteQF0rQFteQF0rXFwuLnsyLDZ9JC8sXG4gIHVzZXJuYW1lOiAvXlthLXpdKD89W1xcdy5dezMsMzF9JClcXHcqXFwuP1xcdyokL2ksXG4gIHBhc3M6IC8oPz0uKlxcZCkoPz0uKlthLXpdKSg/PS4qW0EtWl0pLns2LH0vLFxuICBzdHJvbmdwYXNzOiAvKD89Xi57OCx9JCkoKD89LipcXGQpfCg/PS4qXFxXKykpKD8hWy5cXG5dKSg/PS4qW0EtWl0pKD89LipbYS16XSkuKiQvLFxuICBwaG9uZTogL15bMi05XVxcZHsyfS1cXGR7M30tXFxkezR9JC8sXG4gIHppcDogL15cXGR7NX0kfF5cXGR7NX0tXFxkezR9JC8sXG4gIHVybDogL14oPzooZnRwfGh0dHB8aHR0cHMpOlxcL1xcLyk/KD86W1xcd1xcLV0rXFwuKStbYS16XXsyLDZ9KFtcXDpcXC8/I10uKik/JC9pLFxuXG4gIG51bWJlcjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlKSB7XG4gICAgcmV0dXJuICFpc05hTih2YWx1ZSk7XG4gIH0sXG5cbiAgcmFuZ2U6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWluLCBtYXgpIHtcbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKSA+PSBtaW4gJiYgTnVtYmVyKHZhbHVlKSA8PSBtYXg7XG4gIH0sXG5cbiAgbWluOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1pbikge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPj0gbWluO1xuICB9LFxuXG4gIG1heDogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtYXgpIHtcbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoIDw9IG1heDtcbiAgfSxcblxuICBtaW5vcHRpb246IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWluKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFJlbGF0ZWQoaW5wdXQpLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGggPj0gbWluO1xuICB9LFxuXG4gIG1heG9wdGlvbjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtYXgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0UmVsYXRlZChpbnB1dCkuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCA8PSBtYXg7XG4gIH0sXG5cbiAgbWlubWF4OiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA+PSBtaW4gJiYgdmFsdWUubGVuZ3RoIDw9IG1heDtcbiAgfSxcblxuICBzZWxlY3Q6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgZGVmKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9IGRlZjtcbiAgfSxcblxuICBleHRlbnNpb246IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICB2YXIgZXh0ZW5zaW9ucyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICAgLCB2YWxpZCA9IGZhbHNlO1xuXG4gICAgJC5lYWNoKGlucHV0LmZpbGVzIHx8IFt7bmFtZTogaW5wdXQudmFsdWV9XSwgZnVuY3Rpb24oaSwgZmlsZSkge1xuICAgICAgdmFsaWQgPSAkLmluQXJyYXkoZmlsZS5uYW1lLnNwbGl0KCcuJykucG9wKCkudG9Mb3dlckNhc2UoKSwgZXh0ZW5zaW9ucykgPiAtMTtcbiAgICB9KTtcblxuICAgIHJldHVybiB2YWxpZDtcbiAgfSxcblxuICBlcXVhbHRvOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIHRhcmdldCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICR0YXJnZXQgPSAkKCdbbmFtZT1cIicrIHRhcmdldCArJ1wiXScpO1xuXG4gICAgaWYgKHRoaXMuZ2V0SW52YWxpZCgpLmZpbmQoJHRhcmdldCkubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICAkdGFyZ2V0Lm9mZigna2V5dXAuZXF1YWx0bycpLm9uKCdrZXl1cC5lcXVhbHRvJywgZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLl9nZXRGaWVsZChpbnB1dCkucmVtb3ZlRGF0YSgnaWRlYWxmb3Jtcy12YWx1ZScpO1xuICAgICAgc2VsZi5fdmFsaWRhdGUoaW5wdXQsIGZhbHNlLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBpbnB1dC52YWx1ZSA9PSAkdGFyZ2V0LnZhbCgpO1xuICB9LFxuXG4gIGRhdGU6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgZm9ybWF0KSB7XG5cbiAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJ21tL2RkL3l5eXknO1xuXG4gICAgdmFyIGRlbGltaXRlciA9IC9bXm1keV0vLmV4ZWMoZm9ybWF0KVswXVxuICAgICAgLCB0aGVGb3JtYXQgPSBmb3JtYXQuc3BsaXQoZGVsaW1pdGVyKVxuICAgICAgLCB0aGVEYXRlID0gdmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcblxuICAgIGZ1bmN0aW9uIGlzRGF0ZShkYXRlLCBmb3JtYXQpIHtcblxuICAgICAgdmFyIG0sIGQsIHk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBmb3JtYXQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKC9tLy50ZXN0KGZvcm1hdFtpXSkpIG0gPSBkYXRlW2ldO1xuICAgICAgICBpZiAoL2QvLnRlc3QoZm9ybWF0W2ldKSkgZCA9IGRhdGVbaV07XG4gICAgICAgIGlmICgveS8udGVzdChmb3JtYXRbaV0pKSB5ID0gZGF0ZVtpXTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFtIHx8ICFkIHx8ICF5KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHJldHVybiBtID4gMCAmJiBtIDwgMTMgJiZcbiAgICAgICAgeSAmJiB5Lmxlbmd0aCA9PSA0ICYmXG4gICAgICAgIGQgPiAwICYmIGQgPD0gKG5ldyBEYXRlKHksIG0sIDApKS5nZXREYXRlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGlzRGF0ZSh0aGVEYXRlLCB0aGVGb3JtYXQpO1xuICB9XG5cbn07XG4iXX0=
;