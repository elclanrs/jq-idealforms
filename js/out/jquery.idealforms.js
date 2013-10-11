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

    addFields: function() {
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
      buildNavItems: function(i) {
        return this.opts.steps.i18n.step +' '+ (i+1);
      },
      wrap: '.idealsteps-wrap',
      step: '.idealsteps-step',
      activeClass: 'idealsteps-step-active',
      before: null,
      after: null,
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
    i18n: 'en',
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

    this.$form = $(this.el);
    this.$fields = $();
    this.$inputs = $();

    this._extend($.idealforms.extensions);
    this._i18n();

    this._inject('_init');

    this._addMarkupRules();
    this.addRules(this.opts.rules || {});

    this.$form.submit(function(e) {
      e.preventDefault();
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2Vycm9ycy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9hZGFwdGl2ZS9hZGFwdGl2ZS5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvYWpheC9hamF4LmV4dC5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2N1c3RvbS1pbnB1dHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxmaWxlLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxyYWRpb2NoZWNrLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvZHluYW1pYy1maWVsZHMvZHluYW1pYy1maWVsZHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL3N0ZXBzL2lkZWFsc3RlcHMuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvc3RlcHMvc3RlcHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9tYWluLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9wbHVnaW4uanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3ByaXZhdGUuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3B1YmxpYy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvcnVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBFcnJvcnNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgcmVxdWlyZWQ6ICdUaGlzIGZpZWxkIGlzIHJlcXVpcmVkJyxcbiAgZGlnaXRzOiAnTXVzdCBiZSBvbmx5IGRpZ2l0cycsXG4gIG5hbWU6ICdNdXN0IGJlIGF0IGxlYXN0IDMgY2hhcmFjdGVycyBsb25nIGFuZCBtdXN0IG9ubHkgY29udGFpbiBsZXR0ZXJzJyxcbiAgZW1haWw6ICdNdXN0IGJlIGEgdmFsaWQgZW1haWwnLFxuICB1c2VybmFtZTogJ011c3QgYmUgYXQgYmV0d2VlbiA0IGFuZCAzMiBjaGFyYWN0ZXJzIGxvbmcgYW5kIHN0YXJ0IHdpdGggYSBsZXR0ZXIuIFlvdSBtYXkgdXNlIGxldHRlcnMsIG51bWJlcnMsIHVuZGVyc2NvcmVzLCBhbmQgb25lIGRvdCcsXG4gIHBhc3M6ICdNdXN0IGJlIGF0IGxlYXN0IDYgY2hhcmFjdGVycyBsb25nLCBhbmQgY29udGFpbiBhdCBsZWFzdCBvbmUgbnVtYmVyLCBvbmUgdXBwZXJjYXNlIGFuZCBvbmUgbG93ZXJjYXNlIGxldHRlcicsXG4gIHN0cm9uZ3Bhc3M6ICdNdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycyBsb25nIGFuZCBjb250YWluIGF0IGxlYXN0IG9uZSB1cHBlcmNhc2UgYW5kIG9uZSBsb3dlcmNhc2UgbGV0dGVyIGFuZCBvbmUgbnVtYmVyIG9yIHNwZWNpYWwgY2hhcmFjdGVyJyxcbiAgcGhvbmU6ICdNdXN0IGJlIGEgdmFsaWQgcGhvbmUgbnVtYmVyJyxcbiAgemlwOiAnTXVzdCBiZSBhIHZhbGlkIHppcCBjb2RlJyxcbiAgdXJsOiAnTXVzdCBiZSBhIHZhbGlkIFVSTCcsXG4gIG51bWJlcjogJ011c3QgYmUgYSBudW1iZXInLFxuICByYW5nZTogJ011c3QgYmUgYSBudW1iZXIgYmV0d2VlbiB7MH0gYW5kIHsxfScsXG4gIG1pbjogJ011c3QgYmUgYXQgbGVhc3QgezB9IGNoYXJhY3RlcnMgbG9uZycsXG4gIG1heDogJ011c3QgYmUgdW5kZXIgezB9IGNoYXJhY3RlcnMnLFxuICBtaW5vcHRpb246ICdTZWxlY3QgYXQgbGVhc3QgezB9IG9wdGlvbnMnLFxuICBtYXhvcHRpb246ICdTZWxlY3Qgbm8gbW9yZSB0aGFuIHswfSBvcHRpb25zJyxcbiAgbWlubWF4OiAnTXVzdCBiZSBiZXR3ZWVuIHswfSBhbmQgezF9IGNoYXJhY3RlcnMgbG9uZycsXG4gIHNlbGVjdDogJ1NlbGVjdCBhbiBvcHRpb24nLFxuICBleHRlbnNpb246ICdGaWxlKHMpIG11c3QgaGF2ZSBhIHZhbGlkIGV4dGVuc2lvbiAoeyp9KScsXG4gIGVxdWFsdG86ICdNdXN0IGhhdmUgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIFwiezB9XCIgZmllbGQnLFxuICBkYXRlOiAnTXVzdCBiZSBhIHZhbGlkIGRhdGUgezB9J1xuXG59O1xuIiwiLyoqXG4gKiBBZGFwdGl2ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnYWRhcHRpdmUnLFxuXG4gIG9wdGlvbnM6IHtcbiAgICBhZGFwdGl2ZVdpZHRoOiAkKCc8cCBjbGFzcz1cImlkZWFsZm9ybXMtZmllbGQtd2lkdGhcIi8+JykuYXBwZW5kVG8oJ2JvZHknKS5jc3MoJ3dpZHRoJykucmVwbGFjZSgncHgnLCcnKVxuICB9LFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24gKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGZ1bmN0aW9uIGFkYXB0KCkge1xuXG4gICAgICAgIHZhciBmb3JtV2lkdGggPSBzZWxmLiRmb3JtLm91dGVyV2lkdGgoKVxuICAgICAgICAgICwgaXNBZGFwdGl2ZSA9IHNlbGYub3B0cy5hZGFwdGl2ZVdpZHRoID4gZm9ybVdpZHRoO1xuXG4gICAgICAgIHNlbGYuJGZvcm0udG9nZ2xlQ2xhc3MoJ2FkYXB0aXZlJywgaXNBZGFwdGl2ZSk7XG5cbiAgICAgICAgaWYgKHNlbGYuX2hhc0V4dGVuc2lvbignc3RlcHMnKSkge1xuICAgICAgICAgIHNlbGYuJHN0ZXBzQ29udGFpbmVyLnRvZ2dsZUNsYXNzKCdhZGFwdGl2ZScsIGlzQWRhcHRpdmUpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnI3VpLWRhdGVwaWNrZXItZGl2JykuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICAkKHdpbmRvdykucmVzaXplKGFkYXB0KTtcbiAgICAgIGFkYXB0KCk7XG5cbiAgICAgIHRoaXMuJGZvcm0uZmluZCgnc2VsZWN0LCAuZGF0ZXBpY2tlcicpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuX2dldEZpZWxkKHRoaXMpLmZpbmQoc2VsZi5vcHRzLmVycm9yKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICB9KTtcblxuICAgICAgJCgncC5pZGVhbGZvcm1zLWZpZWxkLXdpZHRoJykucmVtb3ZlKCk7XG4gICAgfVxuXG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnYWpheCcsXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgJC5leHRlbmQoJC5pZGVhbGZvcm1zLCB7IF9yZXF1ZXN0czoge30gfSk7XG5cbiAgICAgICQuaWRlYWxmb3Jtcy5lcnJvcnMuYWpheCA9ICQuaWRlYWxmb3Jtcy5lcnJvcnMuYWpheCB8fCAnTG9hZGluZy4uLic7XG5cbiAgICAgICQuZXh0ZW5kKCQuaWRlYWxmb3Jtcy5ydWxlcywge1xuXG4gICAgICAgIGFqYXg6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAgICAgICAsIHVybCA9ICQoaW5wdXQpLmRhdGEoJ2lkZWFsZm9ybXMtYWpheCcpXG4gICAgICAgICAgICAsIHVzZXJFcnJvciA9ICQuaWRlYWxmb3Jtcy5fZ2V0S2V5KCdlcnJvcnMuJysgaW5wdXQubmFtZSArJy5hamF4RXJyb3InLCBzZWxmLm9wdHMpXG4gICAgICAgICAgICAsIHJlcXVlc3RzID0gJC5pZGVhbGZvcm1zLl9yZXF1ZXN0c1xuICAgICAgICAgICAgLCBkYXRhID0ge307XG5cbiAgICAgICAgICBkYXRhW2lucHV0Lm5hbWVdID0gaW5wdXQudmFsdWU7XG5cbiAgICAgICAgICAkZmllbGQuYWRkQ2xhc3MoJ2FqYXgnKTtcblxuICAgICAgICAgIGlmIChyZXF1ZXN0c1tpbnB1dC5uYW1lXSkgcmVxdWVzdHNbaW5wdXQubmFtZV0uYWJvcnQoKTtcblxuICAgICAgICAgIHJlcXVlc3RzW2lucHV0Lm5hbWVdID0gJC5wb3N0KHVybCwgZGF0YSwgZnVuY3Rpb24ocmVzcCkge1xuXG4gICAgICAgICAgICBpZiAocmVzcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcsIHRydWUpO1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCk7XG4gICAgICAgICAgICAgIHNlbGYuX2hhbmRsZVN0eWxlKGlucHV0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlbGYuX2hhbmRsZUVycm9yKGlucHV0LCB1c2VyRXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkZmllbGQucmVtb3ZlQ2xhc3MoJ2FqYXgnKTtcblxuICAgICAgICAgIH0sICdqc29uJyk7XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX3ZhbGlkYXRlOiBmdW5jdGlvbihpbnB1dCwgcnVsZSkge1xuICAgICAgaWYgKHJ1bGUgIT0gJ2FqYXgnICYmICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNbaW5wdXQubmFtZV0pIHtcbiAgICAgICAgJC5pZGVhbGZvcm1zLl9yZXF1ZXN0c1tpbnB1dC5uYW1lXS5hYm9ydCgpO1xuICAgICAgICB0aGlzLl9nZXRGaWVsZChpbnB1dCkucmVtb3ZlQ2xhc3MoJ2FqYXgnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxufTtcbiIsInJlcXVpcmUoJy4vaWRlYWxmaWxlJyk7XG5yZXF1aXJlKCcuL2lkZWFscmFkaW9jaGVjaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnY3VzdG9tSW5wdXRzJyxcblxuICBvcHRpb25zOiB7XG4gICAgY3VzdG9tSW5wdXRzOiB7XG4gICAgICBpMThuOiB7XG4gICAgICAgIG9wZW46ICdPcGVuJ1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fYnVpbGRDdXN0b21JbnB1dHMoKTtcbiAgICB9LFxuXG4gICAgYWRkRmllbGRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkQ3VzdG9tSW5wdXRzKCk7XG4gICAgfSxcblxuICAgIF9idWlsZEN1c3RvbUlucHV0czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJzpmaWxlJykuaWRlYWxmaWxlKHRoaXMub3B0cy5jdXN0b21JbnB1dHMuaTE4bik7XG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJzpjaGVja2JveCwgOnJhZGlvJykuaWRlYWxyYWRpb2NoZWNrKCk7XG4gICAgfVxuXG4gIH1cbn07XG4iLCIvKipcbiAqIElkZWFsIEZpbGVcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICAvLyBCcm93c2VyIHN1cHBvcnRzIEhUTUw1IG11bHRpcGxlIGZpbGU/XG4gIHZhciBtdWx0aXBsZVN1cHBvcnQgPSB0eXBlb2YgJCgnPGlucHV0Lz4nKVswXS5tdWx0aXBsZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAsIGlzSUUgPSAvbXNpZS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICAsIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsZmlsZSc7XG5cbiAgcGx1Z2luLmRlZmF1bHRzID0ge1xuICAgIG9wZW46ICdPcGVuJ1xuICB9O1xuXG4gIHBsdWdpbi5tZXRob2RzID0ge1xuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgJGZpbGUgPSAkKHRoaXMuZWwpLmFkZENsYXNzKCdpZGVhbC1maWxlJykgLy8gdGhlIG9yaWdpbmFsIGZpbGUgaW5wdXRcbiAgICAgICAgLCAkd3JhcCA9ICQoJzxkaXYgY2xhc3M9XCJpZGVhbC1maWxlLXdyYXBcIj4nKVxuICAgICAgICAsICRpbnB1dCA9ICQoJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiaWRlYWwtZmlsZS1maWxlbmFtZVwiIC8+JylcbiAgICAgICAgICAvLyBCdXR0b24gdGhhdCB3aWxsIGJlIHVzZWQgaW4gbm9uLUlFIGJyb3dzZXJzXG4gICAgICAgICwgJGJ1dHRvbiA9ICQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiaWRlYWwtZmlsZS11cGxvYWRcIj4nKyB0aGlzLm9wdHMub3BlbiArJzwvYnV0dG9uPicpXG4gICAgICAgICAgLy8gSGFjayBmb3IgSUVcbiAgICAgICAgLCAkbGFiZWwgPSAkKCc8bGFiZWwgY2xhc3M9XCJpZGVhbC1maWxlLXVwbG9hZFwiIGZvcj1cIicgKyAkZmlsZVswXS5pZCArICdcIj4nKyB0aGlzLm9wdHMub3BlbiArJzwvbGFiZWw+Jyk7XG5cbiAgICAgIGlmIChpc0lFKSAkbGFiZWwuYWRkKCRidXR0b24pLmFkZENsYXNzKCdpZScpO1xuXG4gICAgICAvLyBIaWRlIGJ5IHNoaWZ0aW5nIHRvIHRoZSBsZWZ0IHNvIHdlXG4gICAgICAvLyBjYW4gc3RpbGwgdHJpZ2dlciBldmVudHNcbiAgICAgICRmaWxlLmNzcyh7XG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBsZWZ0OiAnLTk5OTlweCdcbiAgICAgIH0pO1xuXG4gICAgICAkd3JhcC5hcHBlbmQoJGlucHV0LCAoaXNJRSA/ICRsYWJlbCA6ICRidXR0b24pKS5pbnNlcnRBZnRlcigkZmlsZSk7XG5cbiAgICAgIC8vIFByZXZlbnQgZm9jdXNcbiAgICAgICRmaWxlLmF0dHIoJ3RhYkluZGV4JywgLTEpO1xuICAgICAgJGJ1dHRvbi5hdHRyKCd0YWJJbmRleCcsIC0xKTtcblxuICAgICAgJGJ1dHRvbi5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICRmaWxlLmZvY3VzKCkuY2xpY2soKTsgLy8gT3BlbiBkaWFsb2dcbiAgICAgIH0pO1xuXG4gICAgICAkZmlsZS5jaGFuZ2UoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBmaWxlcyA9IFtdXG4gICAgICAgICAgLCBmaWxlQXJyLCBmaWxlbmFtZTtcblxuICAgICAgICAgIC8vIElmIG11bHRpcGxlIGlzIHN1cHBvcnRlZCB0aGVuIGV4dHJhY3RcbiAgICAgICAgICAvLyBhbGwgZmlsZW5hbWVzIGZyb20gdGhlIGZpbGUgYXJyYXlcbiAgICAgICAgaWYgKG11bHRpcGxlU3VwcG9ydCkge1xuICAgICAgICAgIGZpbGVBcnIgPSAkZmlsZVswXS5maWxlcztcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZmlsZUFyci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgZmlsZXMucHVzaChmaWxlQXJyW2ldLm5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmaWxlbmFtZSA9IGZpbGVzLmpvaW4oJywgJyk7XG5cbiAgICAgICAgICAvLyBJZiBub3Qgc3VwcG9ydGVkIHRoZW4ganVzdCB0YWtlIHRoZSB2YWx1ZVxuICAgICAgICAgIC8vIGFuZCByZW1vdmUgdGhlIHBhdGggdG8ganVzdCBzaG93IHRoZSBmaWxlbmFtZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZpbGVuYW1lID0gJGZpbGUudmFsKCkuc3BsaXQoJ1xcXFwnKS5wb3AoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRpbnB1dCAudmFsKGZpbGVuYW1lKS5hdHRyKCd0aXRsZScsIGZpbGVuYW1lKTtcblxuICAgICAgfSk7XG5cbiAgICAgICRpbnB1dC5vbih7XG4gICAgICAgIGJsdXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkZmlsZS50cmlnZ2VyKCdibHVyJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGtleWRvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKGUud2hpY2ggPT09IDEzKSB7IC8vIEVudGVyXG4gICAgICAgICAgICBpZiAoIWlzSUUpICRmaWxlLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJ2Zvcm0nKS5vbmUoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAxMykgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChlLndoaWNoID09PSA4IHx8IGUud2hpY2ggPT09IDQ2KSB7IC8vIEJhY2tzcGFjZSAmIERlbFxuICAgICAgICAgICAgLy8gSW4gSUUgdGhlIHZhbHVlIGlzIHJlYWQtb25seVxuICAgICAgICAgICAgLy8gd2l0aCB0aGlzIHRyaWNrIHdlIHJlbW92ZSB0aGUgb2xkIGlucHV0IGFuZCBhZGRcbiAgICAgICAgICAgIC8vIGEgY2xlYW4gY2xvbmUgd2l0aCBhbGwgdGhlIG9yaWdpbmFsIGV2ZW50cyBhdHRhY2hlZFxuICAgICAgICAgICAgaWYgKGlzSUUpICRmaWxlLnJlcGxhY2VXaXRoKCRmaWxlID0gJGZpbGUuY2xvbmUodHJ1ZSkpO1xuICAgICAgICAgICAgJGZpbGUudmFsKCcnKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgICRpbnB1dC52YWwoJycpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gOSkgeyAvLyBUQUJcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2UgeyAvLyBBbGwgb3RoZXIga2V5c1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9XG5cbiAgfTtcblxuICByZXF1aXJlKCcuLi8uLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIiwiLypcbiAqIGlkZWFsUmFkaW9DaGVjazogalF1ZXJ5IHBsZ3VpbiBmb3IgY2hlY2tib3ggYW5kIHJhZGlvIHJlcGxhY2VtZW50XG4gKiBVc2FnZTogJCgnaW5wdXRbdHlwZT1jaGVja2JveF0sIGlucHV0W3R5cGU9cmFkaW9dJykuaWRlYWxSYWRpb0NoZWNrKClcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICB2YXIgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxyYWRpb2NoZWNrJztcblxuICBwbHVnaW4ubWV0aG9kcyA9IHtcblxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyICRpbnB1dCA9ICQodGhpcy5lbCk7XG4gICAgICB2YXIgJHNwYW4gPSAkKCc8c3Bhbi8+Jyk7XG5cbiAgICAgICRzcGFuLmFkZENsYXNzKCdpZGVhbC0nKyAoJGlucHV0LmlzKCc6Y2hlY2tib3gnKSA/ICdjaGVjaycgOiAncmFkaW8nKSk7XG4gICAgICAkaW5wdXQuaXMoJzpjaGVja2VkJykgJiYgJHNwYW4uYWRkQ2xhc3MoJ2NoZWNrZWQnKTsgLy8gaW5pdFxuICAgICAgJHNwYW4uaW5zZXJ0QWZ0ZXIoJGlucHV0KTtcblxuICAgICAgJGlucHV0LnBhcmVudCgnbGFiZWwnKVxuICAgICAgICAuYWRkQ2xhc3MoJ2lkZWFsLXJhZGlvY2hlY2stbGFiZWwnKVxuICAgICAgICAuYXR0cignb25jbGljaycsICcnKTsgLy8gRml4IGNsaWNraW5nIGxhYmVsIGluIGlPU1xuXG4gICAgICAkaW5wdXQuY3NzKHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIGxlZnQ6ICctOTk5OXB4JyB9KTsgLy8gaGlkZSBieSBzaGlmdGluZyBsZWZ0XG5cbiAgICAgIC8vIEV2ZW50c1xuICAgICAgJGlucHV0Lm9uKHtcbiAgICAgICAgY2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJGlucHV0ID0gJCh0aGlzKTtcbiAgICAgICAgICBpZiAoICRpbnB1dC5pcygnaW5wdXRbdHlwZT1cInJhZGlvXCJdJykgKSB7XG4gICAgICAgICAgICAkaW5wdXQucGFyZW50KCkuc2libGluZ3MoJ2xhYmVsJykuZmluZCgnLmlkZWFsLXJhZGlvJykucmVtb3ZlQ2xhc3MoJ2NoZWNrZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJHNwYW4udG9nZ2xlQ2xhc3MoJ2NoZWNrZWQnLCAkaW5wdXQuaXMoJzpjaGVja2VkJykpO1xuICAgICAgICB9LFxuICAgICAgICBmb2N1czogZnVuY3Rpb24oKSB7ICRzcGFuLmFkZENsYXNzKCdmb2N1cycpIH0sXG4gICAgICAgIGJsdXI6IGZ1bmN0aW9uKCkgeyAkc3Bhbi5yZW1vdmVDbGFzcygnZm9jdXMnKSB9LFxuICAgICAgICBjbGljazogZnVuY3Rpb24oKSB7ICQodGhpcykudHJpZ2dlcignZm9jdXMnKSB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfTtcblxuICByZXF1aXJlKCcuLi8uLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnZGF0ZXBpY2tlcicsXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkRGF0ZXBpY2tlcigpO1xuICAgIH0sXG5cbiAgIF9idWlsZERhdGVwaWNrZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgJGRhdGVwaWNrZXIgPSB0aGlzLiRmb3JtLmZpbmQoJ2lucHV0LmRhdGVwaWNrZXInKTtcblxuICAgICAgLy8gQWx3YXlzIHNob3cgZGF0ZXBpY2tlciBiZWxvdyB0aGUgaW5wdXRcbiAgICAgIGlmIChqUXVlcnkudWkpIHtcbiAgICAgICAgJC5kYXRlcGlja2VyLl9jaGVja09mZnNldCA9IGZ1bmN0aW9uKGEsYixjKXsgcmV0dXJuIGIgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKGpRdWVyeS51aSAmJiAkZGF0ZXBpY2tlci5sZW5ndGgpIHtcblxuICAgICAgICAkZGF0ZXBpY2tlci5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyKHtcbiAgICAgICAgICAgIGJlZm9yZVNob3c6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgICAgICAgICQoaW5wdXQpLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25DaGFuZ2VNb250aFllYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAvLyBIYWNrIHRvIGZpeCBJRTkgbm90IHJlc2l6aW5nXG4gICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgICAgICAgICAgICAsIHdpZHRoID0gJHRoaXMub3V0ZXJXaWR0aCgpOyAvLyBjYWNoZSBmaXJzdCFcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkdGhpcy5kYXRlcGlja2VyKCd3aWRnZXQnKS5jc3MoJ3dpZHRoJywgd2lkdGgpO1xuICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGp1c3Qgd2lkdGhcbiAgICAgICAgJGRhdGVwaWNrZXIub24oJ2ZvY3VzIGtleXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHQgPSAkKHRoaXMpLCB3ID0gdC5vdXRlcldpZHRoKCk7XG4gICAgICAgICAgdC5kYXRlcGlja2VyKCd3aWRnZXQnKS5jc3MoJ3dpZHRoJywgdyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICB9XG59O1xuIiwiZnVuY3Rpb24gdGVtcGxhdGUoaHRtbCwgZGF0YSkge1xuXG4gIHZhciBsb29wID0gL1xce0AoW159XSspXFx9KC4rPylcXHtcXC9cXDFcXH0vZ1xuICAgICwgbG9vcFZhcmlhYmxlID0gL1xceyMoW159XSspXFx9L2dcbiAgICAsIHZhcmlhYmxlID0gL1xceyhbXn1dKylcXH0vZztcblxuICByZXR1cm4gaHRtbFxuICAgIC5yZXBsYWNlKGxvb3AsIGZ1bmN0aW9uKF8sIGtleSwgbGlzdCkge1xuICAgICAgcmV0dXJuICQubWFwKGRhdGFba2V5XSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gbGlzdC5yZXBsYWNlKGxvb3BWYXJpYWJsZSwgZnVuY3Rpb24oXywgaykge1xuICAgICAgICAgIHJldHVybiBpdGVtW2tdO1xuICAgICAgICB9KTtcbiAgICAgIH0pLmpvaW4oJycpO1xuICAgIH0pXG4gICAgLnJlcGxhY2UodmFyaWFibGUsIGZ1bmN0aW9uKF8sIGtleSkge1xuICAgICAgcmV0dXJuIGRhdGFba2V5XSB8fCAnJztcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2R5bmFtaWNGaWVsZHMnLFxuXG4gIG9wdGlvbnM6IHtcblxuICAgIHRlbXBsYXRlczoge1xuXG4gICAgICBiYXNlOidcXFxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGRcIj5cXFxuICAgICAgICAgIDxsYWJlbCBjbGFzcz1cIm1haW5cIj57bGFiZWx9PC9sYWJlbD5cXFxuICAgICAgICAgIHtmaWVsZH1cXFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZXJyb3JcIj48L3NwYW4+XFxcbiAgICAgICAgPC9kaXY+XFxcbiAgICAgICcsXG5cbiAgICAgIHRleHQ6ICc8aW5wdXQgbmFtZT1cIntuYW1lfVwiIHR5cGU9XCJ7c3VidHlwZX1cIiB2YWx1ZT1cInt2YWx1ZX1cIiB7YXR0cnN9PicsXG5cbiAgICAgIGZpbGU6ICc8aW5wdXQgaWQ9XCJ7bmFtZX0gXCJuYW1lPVwie25hbWV9XCIgdHlwZT1cImZpbGVcIiB7YXR0cnN9PicsXG5cbiAgICAgIHRleHRhcmVhOiAnPHRleHRhcmVhIG5hbWU9XCJ7bmFtZX1cIiB7YXR0cnN9Pnt0ZXh0fTwvdGV4dGFyZWE+JyxcblxuICAgICAgZ3JvdXA6ICdcXFxuICAgICAgICA8cCBjbGFzcz1cImdyb3VwXCI+XFxcbiAgICAgICAgICB7QGxpc3R9XFxcbiAgICAgICAgICA8bGFiZWw+PGlucHV0IG5hbWU9XCJ7bmFtZX1cIiB0eXBlPVwie3N1YnR5cGV9XCIgdmFsdWU9XCJ7I3ZhbHVlfVwiIHsjYXR0cnN9PnsjdGV4dH08L2xhYmVsPlxcXG4gICAgICAgICAgey9saXN0fVxcXG4gICAgICAgIDwvcD5cXFxuICAgICAgJyxcblxuICAgICAgc2VsZWN0OiAnXFxcbiAgICAgICAgPHNlbGVjdCBuYW1lPXtuYW1lfT5cXFxuICAgICAgICAgIHtAbGlzdH1cXFxuICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJ7I3ZhbHVlfVwiPnsjdGV4dH08L29wdGlvbj5cXFxuICAgICAgICAgIHsvbGlzdH1cXFxuICAgICAgICA8L3NlbGVjdD5cXFxuICAgICAgJ1xuICAgIH1cbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICBhZGRGaWVsZHM6IGZ1bmN0aW9uKGZpZWxkcykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChmaWVsZHMsIGZ1bmN0aW9uKG5hbWUsIGZpZWxkKSB7XG5cbiAgICAgICAgdmFyIHR5cGVBcnJheSA9IGZpZWxkLnR5cGUuc3BsaXQoJzonKVxuICAgICAgICAgICwgcnVsZXMgPSB7fVxuICAgICAgICAgICwgJGxhc3QgPSBzZWxmLiRmb3JtLmZpbmQoc2VsZi5vcHRzLmZpZWxkKS5sYXN0KCk7XG5cbiAgICAgICAgZmllbGQubmFtZSA9IG5hbWU7XG4gICAgICAgIGZpZWxkLnR5cGUgPSB0eXBlQXJyYXlbMF07XG4gICAgICAgIGlmICh0eXBlQXJyYXlbMV0pIGZpZWxkLnN1YnR5cGUgPSB0eXBlQXJyYXlbMV07XG5cbiAgICAgICAgZmllbGQuaHRtbCA9IHRlbXBsYXRlKHNlbGYub3B0cy50ZW1wbGF0ZXMuYmFzZSwge1xuICAgICAgICAgIGxhYmVsOiBmaWVsZC5sYWJlbCxcbiAgICAgICAgICBmaWVsZDogdGVtcGxhdGUoc2VsZi5vcHRzLnRlbXBsYXRlc1tmaWVsZC50eXBlXSwgZmllbGQpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbGYuX2luamVjdCgnYWRkRmllbGRzJywgZmllbGQpO1xuXG4gICAgICAgIGlmIChmaWVsZC5hZnRlciB8fCBmaWVsZC5iZWZvcmUpIHtcbiAgICAgICAgICBzZWxmLiRmb3JtLmZpbmQoJ1tuYW1lPVwiJysgKGZpZWxkLmFmdGVyIHx8IGZpZWxkLmJlZm9yZSkgKydcIl0nKS5maXJzdCgpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9nZXRGaWVsZCh0aGlzKVtmaWVsZC5hZnRlciA/ICdhZnRlcicgOiAnYmVmb3JlJ10oZmllbGQuaHRtbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRm9ybSBoYXMgYXQgbGVhc3Qgb25lIGZpZWxkXG4gICAgICAgICAgaWYgKCRsYXN0Lmxlbmd0aCkgJGxhc3QuYWZ0ZXIoZmllbGQuaHRtbCk7XG4gICAgICAgICAgLy8gRm9ybSBoYXMgbm8gZmllbGRzXG4gICAgICAgICAgZWxzZSBzZWxmLiRmb3JtLmFwcGVuZChmaWVsZC5odG1sKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZC5ydWxlcykge1xuICAgICAgICAgIHJ1bGVzW25hbWVdID0gZmllbGQucnVsZXM7XG4gICAgICAgICAgc2VsZi5hZGRSdWxlcyhydWxlcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfSxcblxuICAgIHJlbW92ZUZpZWxkczogZnVuY3Rpb24obmFtZXMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2gobmFtZXMuc3BsaXQoJyAnKSwgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgICB2YXIgJGZpZWxkID0gc2VsZi5fZ2V0RmllbGQoJCgnW25hbWU9XCInKyBuYW1lICsnXCJdJykpO1xuICAgICAgICBzZWxmLiRmaWVsZHMgPSBzZWxmLiRmaWVsZHMuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAhICQodGhpcykuaXMoJGZpZWxkKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRmaWVsZC5yZW1vdmUoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9pbmplY3QoJ3JlbW92ZUZpZWxkcycpO1xuICAgIH0sXG5cbiAgICB0b2dnbGVGaWVsZHM6IGZ1bmN0aW9uKG5hbWVzKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKG5hbWVzLnNwbGl0KCcgJyksIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgICAgdmFyICRmaWVsZCA9IHNlbGYuX2dldEZpZWxkKCQoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpKTtcbiAgICAgICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnLCAkZmllbGQuaXMoJzp2aXNpYmxlJykpLnRvZ2dsZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2luamVjdCgndG9nZ2xlRmllbGRzJyk7XG4gICAgfVxuXG4gIH1cbn07XG4iLCIvKiFcbiAqIElkZWFsIFN0ZXBzXG4qL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICB2YXIgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxzdGVwcyc7XG5cbiAgcGx1Z2luLmRlZmF1bHRzID0ge1xuICAgIG5hdjogJy5pZGVhbHN0ZXBzLW5hdicsXG4gICAgbmF2SXRlbXM6ICdsaScsXG4gICAgYnVpbGROYXZJdGVtczogdHJ1ZSxcbiAgICB3cmFwOiAnLmlkZWFsc3RlcHMtd3JhcCcsXG4gICAgc3RlcDogJy5pZGVhbHN0ZXBzLXN0ZXAnLFxuICAgIGFjdGl2ZUNsYXNzOiAnaWRlYWxzdGVwcy1zdGVwLWFjdGl2ZScsXG4gICAgYmVmb3JlOiBudWxsLFxuICAgIGFmdGVyOiBudWxsLFxuICAgIGZhZGVTcGVlZDogMFxuICB9O1xuXG4gIHBsdWdpbi5tZXRob2RzID0ge1xuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgYWN0aXZlID0gdGhpcy5vcHRzLmFjdGl2ZUNsYXNzO1xuXG4gICAgICB0aGlzLiRlbCA9ICQodGhpcy5lbCk7XG5cbiAgICAgIHRoaXMuJG5hdiA9IHRoaXMuJGVsLmZpbmQodGhpcy5vcHRzLm5hdik7XG4gICAgICB0aGlzLiRuYXZJdGVtcyA9IHRoaXMuJG5hdi5maW5kKHRoaXMub3B0cy5uYXZJdGVtcyk7XG5cbiAgICAgIHRoaXMuJHdyYXAgPSB0aGlzLiRlbC5maW5kKHRoaXMub3B0cy53cmFwKTtcbiAgICAgIHRoaXMuJHN0ZXBzID0gdGhpcy4kd3JhcC5maW5kKHRoaXMub3B0cy5zdGVwKTtcblxuICAgICAgaWYgKHRoaXMub3B0cy5idWlsZE5hdkl0ZW1zKSB0aGlzLl9idWlsZE5hdkl0ZW1zKCk7XG5cbiAgICAgIHRoaXMuJHN0ZXBzLmhpZGUoKS5maXJzdCgpLnNob3coKTtcbiAgICAgIHRoaXMuJG5hdkl0ZW1zLnJlbW92ZUNsYXNzKGFjdGl2ZSkuZmlyc3QoKS5hZGRDbGFzcyhhY3RpdmUpO1xuXG4gICAgICB0aGlzLiRuYXZJdGVtcy5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2VsZi5nbyhzZWxmLiRuYXZJdGVtcy5pbmRleCh0aGlzKSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2J1aWxkTmF2SXRlbXM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgaXNDdXN0b20gPSB0eXBlb2YgdGhpcy5vcHRzLmJ1aWxkTmF2SXRlbXMgPT0gJ2Z1bmN0aW9uJyxcbiAgICAgICAgICBpdGVtID0gZnVuY3Rpb24odmFsKXsgcmV0dXJuICc8bGk+PGEgaHJlZj1cIiNcIiB0YWJpbmRleD1cIi0xXCI+JysgdmFsICsnPC9hPjwvbGk+JzsgfSxcbiAgICAgICAgICBpdGVtcztcblxuICAgICAgaXRlbXMgPSBpc0N1c3RvbSA/XG4gICAgICAgIHRoaXMuJHN0ZXBzLm1hcChmdW5jdGlvbihpKXsgcmV0dXJuIGl0ZW0oc2VsZi5vcHRzLmJ1aWxkTmF2SXRlbXMuY2FsbChzZWxmLCBpKSkgfSkuZ2V0KCkgOlxuICAgICAgICB0aGlzLiRzdGVwcy5tYXAoZnVuY3Rpb24oaSl7IHJldHVybiBpdGVtKCsraSk7IH0pLmdldCgpO1xuXG4gICAgICB0aGlzLiRuYXZJdGVtcyA9ICQoaXRlbXMuam9pbignJykpO1xuXG4gICAgICB0aGlzLiRuYXYuYXBwZW5kKCQoJzx1bC8+JykuYXBwZW5kKHRoaXMuJG5hdkl0ZW1zKSk7XG4gICAgfSxcblxuICAgIF9nZXRDdXJJZHg6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJHN0ZXBzLmluZGV4KHRoaXMuJHN0ZXBzLmZpbHRlcignOnZpc2libGUnKSk7XG4gICAgfSxcblxuICAgIGdvOiBmdW5jdGlvbihpZHgpIHtcblxuICAgICAgdmFyIGFjdGl2ZSA9IHRoaXMub3B0cy5hY3RpdmVDbGFzcyxcbiAgICAgICAgICBmYWRlU3BlZWQgPSB0aGlzLm9wdHMuZmFkZVNwZWVkO1xuXG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnZnVuY3Rpb24nKSBpZHggPSBpZHguY2FsbCh0aGlzLCB0aGlzLl9nZXRDdXJJZHgoKSk7XG5cbiAgICAgIGlmIChpZHggPj0gdGhpcy4kc3RlcHMubGVuZ3RoKSBpZHggPSAwO1xuICAgICAgaWYgKGlkeCA8IDApIGlkeCA9IHRoaXMuJHN0ZXBzLmxlbmd0aC0xO1xuXG4gICAgICBpZiAodGhpcy5vcHRzLmJlZm9yZSkgdGhpcy5vcHRzLmJlZm9yZS5jYWxsKHRoaXMsIGlkeCk7XG5cbiAgICAgIHRoaXMuJG5hdkl0ZW1zLnJlbW92ZUNsYXNzKGFjdGl2ZSkuZXEoaWR4KS5hZGRDbGFzcyhhY3RpdmUpO1xuICAgICAgdGhpcy4kc3RlcHMuZmFkZU91dChmYWRlU3BlZWQpLmVxKGlkeCkuZmFkZUluKGZhZGVTcGVlZCk7XG5cbiAgICAgIGlmICh0aGlzLm9wdHMuYWZ0ZXIpIHRoaXMub3B0cy5hZnRlci5jYWxsKHRoaXMsIGlkeCk7XG4gICAgfSxcblxuICAgIHByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbyh0aGlzLl9nZXRDdXJJZHgoKSAtIDEpO1xuICAgIH0sXG5cbiAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28odGhpcy5fZ2V0Q3VySWR4KCkgKyAxKTtcbiAgICB9LFxuXG4gICAgZmlyc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbygwKTtcbiAgICB9LFxuXG4gICAgbGFzdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKHRoaXMuJHN0ZXBzLmxlbmd0aC0xKTtcbiAgICB9XG4gIH07XG5cbiAgcmVxdWlyZSgnLi4vLi4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcbiIsInJlcXVpcmUoJy4vaWRlYWxzdGVwcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnc3RlcHMnLFxuXG4gIG9wdGlvbnM6IHtcblxuICAgIHN0ZXBzOiB7XG5cbiAgICAgIGNvbnRhaW5lcjogJy5pZGVhbHN0ZXBzLWNvbnRhaW5lcicsXG4gICAgICBuYXY6ICcuaWRlYWxzdGVwcy1uYXYnLFxuICAgICAgbmF2SXRlbXM6ICdsaScsXG4gICAgICBidWlsZE5hdkl0ZW1zOiBmdW5jdGlvbihpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdHMuc3RlcHMuaTE4bi5zdGVwICsnICcrIChpKzEpO1xuICAgICAgfSxcbiAgICAgIHdyYXA6ICcuaWRlYWxzdGVwcy13cmFwJyxcbiAgICAgIHN0ZXA6ICcuaWRlYWxzdGVwcy1zdGVwJyxcbiAgICAgIGFjdGl2ZUNsYXNzOiAnaWRlYWxzdGVwcy1zdGVwLWFjdGl2ZScsXG4gICAgICBiZWZvcmU6IG51bGwsXG4gICAgICBhZnRlcjogbnVsbCxcbiAgICAgIGZhZGVTcGVlZDogMCxcblxuICAgICAgaTE4bjoge1xuICAgICAgICBzdGVwOiAnU3RlcCdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkU3RlcHMoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIF92YWxpZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5fdXBkYXRlU3RlcHMoKTtcblxuICAgICAgaWYgKHRoaXMuX2hhc0V4dGVuc2lvbignYWpheCcpKSB7XG4gICAgICAgICQuZWFjaCgkLmlkZWFsZm9ybXMuX3JlcXVlc3RzLCBmdW5jdGlvbihrZXksIHJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0LmRvbmUoZnVuY3Rpb24oKXsgc2VsZi5fdXBkYXRlU3RlcHMoKSB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICBmb2N1c0ZpcnN0SW52YWxpZDogZnVuY3Rpb24oZmlyc3RJbnZhbGlkKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnZ28nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHN0ZXBzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh0aGlzKS5maW5kKGZpcnN0SW52YWxpZCkubGVuZ3RoO1xuICAgICAgICB9KS5pbmRleCgpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9idWlsZFN0ZXBzOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLCBvcHRpb25zXG4gICAgICAgICwgaGFzUnVsZXMgPSAhICQuaXNFbXB0eU9iamVjdCh0aGlzLm9wdHMucnVsZXMpXG4gICAgICAgICwgYnVpbGROYXZJdGVtcyA9IHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zXG4gICAgICAgICwgY291bnRlciA9IGhhc1J1bGVzXG4gICAgICAgICAgPyAnPHNwYW4gY2xhc3M9XCJjb3VudGVyXCIvPidcbiAgICAgICAgICA6ICc8c3BhbiBjbGFzcz1cImNvdW50ZXIgemVyb1wiPjA8L3NwYW4+JztcblxuICAgICAgaWYgKHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zKSB7XG4gICAgICAgIHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zID0gZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHJldHVybiBidWlsZE5hdkl0ZW1zLmNhbGwoc2VsZiwgaSkgKyBjb3VudGVyO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lciA9IHRoaXMuJGZvcm1cbiAgICAgICAgLmNsb3Nlc3QodGhpcy5vcHRzLnN0ZXBzLmNvbnRhaW5lcilcbiAgICAgICAgLmlkZWFsc3RlcHModGhpcy5vcHRzLnN0ZXBzKTtcbiAgICB9LFxuXG4gICAgX3VwZGF0ZVN0ZXBzOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdfaW5qZWN0JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGlkZWFsc3RlcHMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJG5hdkl0ZW1zLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHZhciBpbnZhbGlkID0gaWRlYWxzdGVwcy4kc3RlcHMuZXEoaSkuZmluZChzZWxmLmdldEludmFsaWQoKSkubGVuZ3RoO1xuICAgICAgICAgICQodGhpcykuZmluZCgnc3BhbicpLnRleHQoaW52YWxpZCkudG9nZ2xlQ2xhc3MoJ3plcm8nLCAhIGludmFsaWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgYWRkUnVsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5maXJzdFN0ZXAoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIGFkZEZpZWxkczogZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgIGZpZWxkLmFmdGVyID0gdGhpcy4kc3RlcHNDb250YWluZXJcbiAgICAgICAgLmZpbmQodGhpcy5vcHRzLnN0ZXBzLnN0ZXApXG4gICAgICAgIC5lcShmaWVsZC5hcHBlbmRUb1N0ZXApXG4gICAgICAgIC5maW5kKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcpXG4gICAgICAgIC5sYXN0KClbMF0ubmFtZTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIHRvZ2dsZUZpZWxkczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgcmVtb3ZlRmllbGRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0ZXBzKCk7XG4gICAgfSxcblxuICAgIGdvVG9TdGVwOiBmdW5jdGlvbihpZHgpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ2dvJywgaWR4KTtcbiAgICB9LFxuXG4gICAgcHJldlN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygncHJldicpO1xuICAgIH0sXG5cbiAgICBuZXh0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCduZXh0Jyk7XG4gICAgfSxcblxuICAgIGZpcnN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdmaXJzdCcpO1xuICAgIH0sXG5cbiAgICBsYXN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdsYXN0Jyk7XG4gICAgfVxuICB9XG5cbn07XG4iLCIvKiFcbiAqIGpRdWVyeSBJZGVhbCBGb3Jtc1xuICogQGF1dGhvcjogQ2VkcmljIFJ1aXpcbiAqIEB2ZXJzaW9uOiAzLjBcbiAqIEBsaWNlbnNlIEdQTCBvciBNSVRcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICB2YXIgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxmb3Jtcyc7XG5cbiAgcGx1Z2luLmRlZmF1bHRzID0ge1xuICAgIGkxOG46ICdlbicsXG4gICAgZmllbGQ6ICcuZmllbGQnLFxuICAgIGVycm9yOiAnLmVycm9yJyxcbiAgICBpY29uSHRtbDogJzxpLz4nLFxuICAgIGljb25DbGFzczogJ2ljb24nLFxuICAgIGludmFsaWRDbGFzczogJ2ludmFsaWQnLFxuICAgIHZhbGlkQ2xhc3M6ICd2YWxpZCcsXG4gICAgc2lsZW50TG9hZDogdHJ1ZSxcbiAgICBvblZhbGlkYXRlOiAkLm5vb3AsXG4gICAgb25TdWJtaXQ6ICQubm9vcFxuICB9O1xuXG4gIHBsdWdpbi5nbG9iYWwgPSB7XG5cbiAgICBfZm9ybWF0OiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHsoXFxkKVxcfS9nLCBmdW5jdGlvbihfLCBtYXRjaCkge1xuICAgICAgICByZXR1cm4gYXJnc1srbWF0Y2hdIHx8ICcnO1xuICAgICAgfSkucmVwbGFjZSgvXFx7XFwqKFteKn1dKilcXH0vZywgZnVuY3Rpb24oXywgc2VwKSB7XG4gICAgICAgIHJldHVybiBhcmdzLmpvaW4oc2VwIHx8ICcsICcpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9nZXRLZXk6IGZ1bmN0aW9uKGtleSwgb2JqKSB7XG4gICAgICByZXR1cm4ga2V5LnNwbGl0KCcuJykucmVkdWNlKGZ1bmN0aW9uKGEsYikge1xuICAgICAgICByZXR1cm4gYSAmJiBhW2JdO1xuICAgICAgfSwgb2JqKTtcbiAgICB9LFxuXG4gICAgaTE4bjoge30sXG5cbiAgICBydWxlU2VwYXJhdG9yOiAnICcsXG4gICAgYXJnU2VwYXJhdG9yOiAnOicsXG5cbiAgICBydWxlczogcmVxdWlyZSgnLi9ydWxlcycpLFxuICAgIGVycm9yczogcmVxdWlyZSgnLi9lcnJvcnMnKSxcblxuICAgIGV4dGVuc2lvbnM6IFtcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9keW5hbWljLWZpZWxkcy9keW5hbWljLWZpZWxkcy5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9hamF4L2FqYXguZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvc3RlcHMvc3RlcHMuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvY3VzdG9tLWlucHV0cy9jdXN0b20taW5wdXRzLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9hZGFwdGl2ZS9hZGFwdGl2ZS5leHQnKVxuICAgIF1cbiAgfTtcblxuICBwbHVnaW4ubWV0aG9kcyA9ICQuZXh0ZW5kKHt9LCByZXF1aXJlKCcuL3ByaXZhdGUnKSwgcmVxdWlyZSgnLi9wdWJsaWMnKSk7XG5cbiAgcmVxdWlyZSgnLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIiwiLyoqXG4gKiBQbHVnaW4gYm9pbGVycGxhdGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEFQID0gQXJyYXkucHJvdG90eXBlO1xuXG4gIHJldHVybiBmdW5jdGlvbihwbHVnaW4pIHtcblxuICAgIHBsdWdpbiA9ICQuZXh0ZW5kKHRydWUsIHtcbiAgICAgIG5hbWU6ICdwbHVnaW4nLFxuICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgZGlzYWJsZWRFeHRlbnNpb25zOiAnbm9uZSdcbiAgICAgIH0sXG4gICAgICBtZXRob2RzOiB7fSxcbiAgICAgIGdsb2JhbDoge30sXG4gICAgfSwgcGx1Z2luKTtcblxuICAgICRbcGx1Z2luLm5hbWVdID0gJC5leHRlbmQoe1xuXG4gICAgICBhZGRFeHRlbnNpb246IGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuICAgICAgICBwbHVnaW4uZ2xvYmFsLmV4dGVuc2lvbnMucHVzaChleHRlbnNpb24pO1xuICAgICAgfVxuICAgIH0sIHBsdWdpbi5nbG9iYWwpO1xuXG4gICAgZnVuY3Rpb24gUGx1Z2luKGVsZW1lbnQsIG9wdGlvbnMpIHtcblxuICAgICAgdGhpcy5vcHRzID0gJC5leHRlbmQoe30sIHBsdWdpbi5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICB0aGlzLmVsID0gZWxlbWVudDtcblxuICAgICAgdGhpcy5fbmFtZSA9IHBsdWdpbi5uYW1lO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgfVxuXG4gICAgUGx1Z2luLl9leHRlbmRlZCA9IHt9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5faGFzRXh0ZW5zaW9uID0gZnVuY3Rpb24oZXh0ZW5zaW9uKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgcmV0dXJuIHBsdWdpbi5nbG9iYWwuZXh0ZW5zaW9ucy5maWx0ZXIoZnVuY3Rpb24oZXh0KSB7XG4gICAgICAgIHJldHVybiBleHQubmFtZSA9PSBleHRlbnNpb24gJiYgc2VsZi5vcHRzLmRpc2FibGVkRXh0ZW5zaW9ucy5pbmRleE9mKGV4dC5uYW1lKSA8IDA7XG4gICAgICB9KS5sZW5ndGg7XG4gICAgfTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2V4dGVuZCA9IGZ1bmN0aW9uKGV4dGVuc2lvbnMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2goZXh0ZW5zaW9ucywgZnVuY3Rpb24oaSwgZXh0ZW5zaW9uKSB7XG5cbiAgICAgICAgJC5leHRlbmQoc2VsZi5vcHRzLCAkLmV4dGVuZCh0cnVlLCBleHRlbnNpb24ub3B0aW9ucywgc2VsZi5vcHRzKSk7XG5cbiAgICAgICAgJC5lYWNoKGV4dGVuc2lvbi5tZXRob2RzLCBmdW5jdGlvbihtZXRob2QsIGZuKSB7XG5cbiAgICAgICAgICBpZiAoc2VsZi5vcHRzLmRpc2FibGVkRXh0ZW5zaW9ucy5pbmRleE9mKGV4dGVuc2lvbi5uYW1lKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFBsdWdpbi5wcm90b3R5cGVbbWV0aG9kXSkge1xuICAgICAgICAgICAgUGx1Z2luLl9leHRlbmRlZFttZXRob2RdID0gUGx1Z2luLl9leHRlbmRlZFttZXRob2RdIHx8IFtdO1xuICAgICAgICAgICAgUGx1Z2luLl9leHRlbmRlZFttZXRob2RdLnB1c2goeyBuYW1lOiBleHRlbnNpb24ubmFtZSwgZm46IGZuIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQbHVnaW4ucHJvdG90eXBlW21ldGhvZF0gPSBmbjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5faW5qZWN0ID0gZnVuY3Rpb24obWV0aG9kKSB7XG5cbiAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PSAnZnVuY3Rpb24nKSByZXR1cm4gbWV0aG9kLmNhbGwodGhpcyk7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSkge1xuICAgICAgICAkLmVhY2goUGx1Z2luLl9leHRlbmRlZFttZXRob2RdLCBmdW5jdGlvbihpLCBwbHVnaW4pIHtcbiAgICAgICAgICBwbHVnaW4uZm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlLl9pbml0ID0gJC5ub29wO1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZVtwbHVnaW4ubmFtZV0gPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIGlmICghbWV0aG9kKSByZXR1cm4gdGhpcztcbiAgICAgIHRyeSB7IHJldHVybiB0aGlzW21ldGhvZF0uYXBwbHkodGhpcywgQVAuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTsgfVxuICAgICAgY2F0Y2goZSkge31cbiAgICB9O1xuXG4gICAgJC5leHRlbmQoUGx1Z2luLnByb3RvdHlwZSwgcGx1Z2luLm1ldGhvZHMpO1xuXG4gICAgJC5mbltwbHVnaW4ubmFtZV0gPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIGFyZ3MgPSBBUC5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgICAgLCBtZXRob2RBcnJheSA9IHR5cGVvZiBhcmdzWzBdID09ICdzdHJpbmcnICYmIGFyZ3NbMF0uc3BsaXQoJzonKVxuICAgICAgICAsIG1ldGhvZCA9IG1ldGhvZEFycmF5W21ldGhvZEFycmF5Lmxlbmd0aCA+IDEgPyAxIDogMF1cbiAgICAgICAgLCBwcmVmaXggPSBtZXRob2RBcnJheS5sZW5ndGggPiAxICYmIG1ldGhvZEFycmF5WzBdXG4gICAgICAgICwgb3B0cyA9IHR5cGVvZiBhcmdzWzBdID09ICdvYmplY3QnICYmIGFyZ3NbMF1cbiAgICAgICAgLCBwYXJhbXMgPSBhcmdzLnNsaWNlKDEpXG4gICAgICAgICwgcmV0O1xuXG4gICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgIG1ldGhvZCA9IHByZWZpeCArIG1ldGhvZC5zdWJzdHIoMCwxKS50b1VwcGVyQ2FzZSgpICsgbWV0aG9kLnN1YnN0cigxLG1ldGhvZC5sZW5ndGgtMSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgaW5zdGFuY2UgPSAkLmRhdGEodGhpcywgcGx1Z2luLm5hbWUpO1xuXG4gICAgICAgIC8vIE1ldGhvZFxuICAgICAgICBpZiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICByZXR1cm4gcmV0ID0gaW5zdGFuY2VbcGx1Z2luLm5hbWVdLmFwcGx5KGluc3RhbmNlLCBbbWV0aG9kXS5jb25jYXQocGFyYW1zKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbml0XG4gICAgICAgIHJldHVybiAkLmRhdGEodGhpcywgcGx1Z2luLm5hbWUsIG5ldyBQbHVnaW4odGhpcywgb3B0cykpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBwcmVmaXggPyByZXQgOiB0aGlzO1xuICAgIH07XG4gIH07XG5cbn0oKSk7XG4iLCIvKipcbiAqIFByaXZhdGUgbWV0aG9kc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLiRmb3JtID0gJCh0aGlzLmVsKTtcbiAgICB0aGlzLiRmaWVsZHMgPSAkKCk7XG4gICAgdGhpcy4kaW5wdXRzID0gJCgpO1xuXG4gICAgdGhpcy5fZXh0ZW5kKCQuaWRlYWxmb3Jtcy5leHRlbnNpb25zKTtcbiAgICB0aGlzLl9pMThuKCk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ19pbml0Jyk7XG5cbiAgICB0aGlzLl9hZGRNYXJrdXBSdWxlcygpO1xuICAgIHRoaXMuYWRkUnVsZXModGhpcy5vcHRzLnJ1bGVzIHx8IHt9KTtcblxuICAgIHRoaXMuJGZvcm0uc3VibWl0KGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNlbGYuX3ZhbGlkYXRlQWxsKCk7XG4gICAgICBzZWxmLmZvY3VzRmlyc3RJbnZhbGlkKCk7XG4gICAgICBzZWxmLm9wdHMub25TdWJtaXQuY2FsbChzZWxmLCBzZWxmLmdldEludmFsaWQoKS5sZW5ndGgsIGUpO1xuICAgIH0pO1xuXG4gICAgaWYgKCEgdGhpcy5vcHRzLnNpbGVudExvYWQpIHtcbiAgICAgIC8vIDFtcyB0aW1lb3V0IHRvIG1ha2Ugc3VyZSBlcnJvciBzaG93cyB1cFxuICAgICAgc2V0VGltZW91dCgkLnByb3h5KHRoaXMuZm9jdXNGaXJzdEludmFsaWQsIHRoaXMpLCAxKTtcbiAgICB9XG4gIH0sXG5cbiAgX2FkZE1hcmt1cFJ1bGVzOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBydWxlcyA9IHt9O1xuXG4gICAgdGhpcy4kZm9ybS5maW5kKCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcnVsZSA9ICQodGhpcykuZGF0YSgnaWRlYWxmb3Jtcy1ydWxlcycpO1xuICAgICAgaWYgKHJ1bGUgJiYgISBydWxlc1t0aGlzLm5hbWVdKSBydWxlc1t0aGlzLm5hbWVdID0gcnVsZTtcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkUnVsZXMocnVsZXMpO1xuICB9LFxuXG4gIF9pMThuOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICQuZWFjaCgkLmlkZWFsZm9ybXMuaTE4biwgZnVuY3Rpb24obG9jYWxlLCBsYW5nKSB7XG5cbiAgICAgIHZhciBlcnJvcnMgPSBsYW5nLmVycm9yc1xuICAgICAgICAsIG9wdGlvbnMgPSB7fTtcblxuICAgICAgZGVsZXRlIGxhbmcuZXJyb3JzO1xuXG4gICAgICBmb3IgKHZhciBleHQgaW4gbGFuZykgb3B0aW9uc1tleHRdID0geyBpMThuOiBsYW5nW2V4dF0gfTtcblxuICAgICAgJC5leHRlbmQoJC5pZGVhbGZvcm1zLmVycm9ycywgZXJyb3JzKTtcbiAgICAgICQuZXh0ZW5kKHRydWUsIHNlbGYub3B0cywgb3B0aW9ucyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgX2J1aWxkRmllbGQ6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAsICRpY29uO1xuXG4gICAgJGljb24gPSAkKHRoaXMub3B0cy5pY29uSHRtbCwge1xuICAgICAgY2xhc3M6IHRoaXMub3B0cy5pY29uQ2xhc3MsXG4gICAgICBjbGljazogZnVuY3Rpb24oKXsgJChpbnB1dCkuZm9jdXMoKSB9XG4gICAgfSk7XG5cbiAgICBpZiAoISB0aGlzLiRmaWVsZHMuZmlsdGVyKCRmaWVsZCkubGVuZ3RoKSB7XG4gICAgICB0aGlzLiRmaWVsZHMgPSB0aGlzLiRmaWVsZHMuYWRkKCRmaWVsZCk7XG4gICAgICBpZiAodGhpcy5vcHRzLmljb25IdG1sKSAkZmllbGQuYXBwZW5kKCRpY29uKTtcbiAgICAgICRmaWVsZC5hZGRDbGFzcygnaWRlYWxmb3Jtcy1maWVsZCBpZGVhbGZvcm1zLWZpZWxkLScrIGlucHV0LnR5cGUpO1xuICAgIH1cblxuICAgIHRoaXMuX2FkZEV2ZW50cyhpbnB1dCk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ19idWlsZEZpZWxkJywgaW5wdXQpO1xuICB9LFxuXG4gIF9hZGRFdmVudHM6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpO1xuXG4gICAgJChpbnB1dClcbiAgICAgIC5vbignY2hhbmdlIGtleXVwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS53aGljaCA9PSA5IHx8IGUud2hpY2ggPT0gMTYpIHJldHVybjtcbiAgICAgICAgc2VsZi5fdmFsaWRhdGUodGhpcywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmZvY3VzKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISBzZWxmLmlzVmFsaWQodGhpcy5uYW1lKSkge1xuICAgICAgICAgICRmaWVsZC5maW5kKHNlbGYub3B0cy5lcnJvcikuc2hvdygpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmJsdXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICRmaWVsZC5maW5kKHNlbGYub3B0cy5lcnJvcikuaGlkZSgpO1xuICAgICAgfSk7XG4gIH0sXG5cbiAgX2lzUmVxdWlyZWQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgLy8gV2UgYXNzdW1lIG5vbi10ZXh0IGlucHV0cyB3aXRoIHJ1bGVzIGFyZSByZXF1aXJlZFxuICAgIGlmICgkKGlucHV0KS5pcygnOmNoZWNrYm94LCA6cmFkaW8sIHNlbGVjdCcpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5vcHRzLnJ1bGVzW2lucHV0Lm5hbWVdLmluZGV4T2YoJ3JlcXVpcmVkJykgPiAtMTtcbiAgfSxcblxuICBfZ2V0UmVsYXRlZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RmllbGQoaW5wdXQpLmZpbmQoJ1tuYW1lPVwiJysgaW5wdXQubmFtZSArJ1wiXScpO1xuICB9LFxuXG4gIF9nZXRGaWVsZDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gJChpbnB1dCkuY2xvc2VzdCh0aGlzLm9wdHMuZmllbGQpO1xuICB9LFxuXG4gIF9nZXRGaXJzdEludmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldEludmFsaWQoKS5maXJzdCgpLmZpbmQoJ2lucHV0OmZpcnN0LCB0ZXh0YXJlYSwgc2VsZWN0Jyk7XG4gIH0sXG5cbiAgX2hhbmRsZUVycm9yOiBmdW5jdGlvbihpbnB1dCwgZXJyb3IsIHZhbGlkKSB7XG4gICAgdmFsaWQgPSB2YWxpZCB8fCB0aGlzLmlzVmFsaWQoaW5wdXQubmFtZSk7XG4gICAgdmFyICRlcnJvciA9IHRoaXMuX2dldEZpZWxkKGlucHV0KS5maW5kKHRoaXMub3B0cy5lcnJvcik7XG4gICAgdGhpcy4kZm9ybS5maW5kKHRoaXMub3B0cy5lcnJvcikuaGlkZSgpO1xuICAgIGlmIChlcnJvcikgJGVycm9yLnRleHQoZXJyb3IpO1xuICAgICRlcnJvci50b2dnbGUoIXZhbGlkKTtcbiAgfSxcblxuICBfaGFuZGxlU3R5bGU6IGZ1bmN0aW9uKGlucHV0LCB2YWxpZCkge1xuICAgIHZhbGlkID0gdmFsaWQgfHwgdGhpcy5pc1ZhbGlkKGlucHV0Lm5hbWUpO1xuICAgIHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0cy52YWxpZENsYXNzICsnICcrIHRoaXMub3B0cy5pbnZhbGlkQ2xhc3MpXG4gICAgICAuYWRkQ2xhc3ModmFsaWQgPyB0aGlzLm9wdHMudmFsaWRDbGFzcyA6IHRoaXMub3B0cy5pbnZhbGlkQ2xhc3MpXG4gICAgICAuZmluZCgnLicrIHRoaXMub3B0cy5pY29uQ2xhc3MpLnNob3coKTtcbiAgfSxcblxuICBfZnJlc2g6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRzLnZhbGlkQ2xhc3MgKycgJysgdGhpcy5vcHRzLmludmFsaWRDbGFzcylcbiAgICAgIC5maW5kKHRoaXMub3B0cy5lcnJvcikuaGlkZSgpXG4gICAgICAuZW5kKClcbiAgICAgIC5maW5kKCcuJysgdGhpcy5vcHRzLmljb25DbGFzcykudG9nZ2xlKHRoaXMuX2lzUmVxdWlyZWQoaW5wdXQpKTtcbiAgfSxcblxuICBfdmFsaWRhdGU6IGZ1bmN0aW9uKGlucHV0LCBoYW5kbGVFcnJvciwgaGFuZGxlU3R5bGUpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkZmllbGQgPSB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgICwgdXNlclJ1bGVzID0gdGhpcy5vcHRzLnJ1bGVzW2lucHV0Lm5hbWVdLnNwbGl0KCQuaWRlYWxmb3Jtcy5ydWxlU2VwYXJhdG9yKVxuICAgICAgLCBvbGRWYWx1ZSA9ICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbHVlJylcbiAgICAgICwgdmFsaWQgPSB0cnVlXG4gICAgICAsIHJ1bGU7XG5cbiAgICAvLyBEb24ndCB2YWxpZGF0ZSBpbnB1dCBpZiB2YWx1ZSBoYXNuJ3QgY2hhbmdlZFxuICAgIGlmICghICQoaW5wdXQpLmlzKCc6Y2hlY2tib3gsIDpyYWRpbycpICYmIG9sZFZhbHVlID09IGlucHV0LnZhbHVlKSB7XG4gICAgICByZXR1cm4gJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnKTtcbiAgICB9XG5cbiAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWx1ZScsIGlucHV0LnZhbHVlKTtcblxuICAgIC8vIE5vbi1yZXF1aXJlZCBpbnB1dCB3aXRoIGVtcHR5IHZhbHVlIG11c3QgcGFzcyB2YWxpZGF0aW9uXG4gICAgaWYgKCEgaW5wdXQudmFsdWUgJiYgISB0aGlzLl9pc1JlcXVpcmVkKGlucHV0KSkge1xuICAgICAgJGZpZWxkLnJlbW92ZURhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnKTtcbiAgICAgIHRoaXMuX2ZyZXNoKGlucHV0KTtcblxuICAgIC8vIElucHV0cyB3aXRoIHZhbHVlIG9yIHJlcXVpcmVkXG4gICAgfSBlbHNlIHtcblxuICAgICAgJC5lYWNoKHVzZXJSdWxlcywgZnVuY3Rpb24oaSwgdXNlclJ1bGUpIHtcblxuICAgICAgICB1c2VyUnVsZSA9IHVzZXJSdWxlLnNwbGl0KCQuaWRlYWxmb3Jtcy5hcmdTZXBhcmF0b3IpO1xuXG4gICAgICAgIHJ1bGUgPSB1c2VyUnVsZVswXTtcblxuICAgICAgICB2YXIgdGhlUnVsZSA9ICQuaWRlYWxmb3Jtcy5ydWxlc1tydWxlXVxuICAgICAgICAgICwgYXJncyA9IHVzZXJSdWxlLnNsaWNlKDEpXG4gICAgICAgICAgLCBlcnJvcjtcblxuICAgICAgICBlcnJvciA9ICQuaWRlYWxmb3Jtcy5fZm9ybWF0LmFwcGx5KG51bGwsIFtcbiAgICAgICAgICAkLmlkZWFsZm9ybXMuX2dldEtleSgnZXJyb3JzLicrIGlucHV0Lm5hbWUgKycuJysgcnVsZSwgc2VsZi5vcHRzKSB8fFxuICAgICAgICAgICQuaWRlYWxmb3Jtcy5lcnJvcnNbcnVsZV1cbiAgICAgICAgXS5jb25jYXQoYXJncykpO1xuXG4gICAgICAgIHZhbGlkID0gdHlwZW9mIHRoZVJ1bGUgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgID8gdGhlUnVsZS5hcHBseShzZWxmLCBbaW5wdXQsIGlucHV0LnZhbHVlXS5jb25jYXQoYXJncykpXG4gICAgICAgICAgOiB0aGVSdWxlLnRlc3QoaW5wdXQudmFsdWUpO1xuXG4gICAgICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJywgdmFsaWQpO1xuXG4gICAgICAgIGlmIChoYW5kbGVFcnJvcikgc2VsZi5faGFuZGxlRXJyb3IoaW5wdXQsIGVycm9yLCB2YWxpZCk7XG4gICAgICAgIGlmIChoYW5kbGVTdHlsZSkgc2VsZi5faGFuZGxlU3R5bGUoaW5wdXQsIHZhbGlkKTtcblxuICAgICAgICBzZWxmLm9wdHMub25WYWxpZGF0ZS5jYWxsKHNlbGYsIGlucHV0LCBydWxlLCB2YWxpZCk7XG5cbiAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5faW5qZWN0KCdfdmFsaWRhdGUnLCBpbnB1dCwgcnVsZSwgdmFsaWQpO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9LFxuXG4gIF92YWxpZGF0ZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuJGlucHV0cy5lYWNoKGZ1bmN0aW9uKCl7IHNlbGYuX3ZhbGlkYXRlKHRoaXMsIHRydWUpOyB9KTtcbiAgfVxufTtcbiIsIi8qKlxuICogUHVibGljIG1ldGhvZHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWRkUnVsZXM6IGZ1bmN0aW9uKHJ1bGVzKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgJGlucHV0cyA9IHRoaXMuJGZvcm0uZmluZCgkLm1hcChydWxlcywgZnVuY3Rpb24oXywgbmFtZSkge1xuICAgICAgcmV0dXJuICdbbmFtZT1cIicrIG5hbWUgKydcIl0nO1xuICAgIH0pLmpvaW4oJywnKSk7XG5cbiAgICAkLmV4dGVuZCh0aGlzLm9wdHMucnVsZXMsIHJ1bGVzKTtcblxuICAgICRpbnB1dHMuZWFjaChmdW5jdGlvbigpeyBzZWxmLl9idWlsZEZpZWxkKHRoaXMpIH0pO1xuICAgIHRoaXMuJGlucHV0cyA9IHRoaXMuJGlucHV0cy5hZGQoJGlucHV0cyk7XG5cbiAgICB0aGlzLl92YWxpZGF0ZUFsbCgpO1xuICAgIHRoaXMuJGZpZWxkcy5maW5kKHRoaXMub3B0cy5lcnJvcikuaGlkZSgpO1xuXG4gICAgdGhpcy5faW5qZWN0KCdhZGRSdWxlcycpO1xuICB9LFxuXG4gIGdldEludmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRmaWVsZHMuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQodGhpcykuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcpID09PSBmYWxzZTtcbiAgICB9KTtcbiAgfSxcblxuICBmb2N1c0ZpcnN0SW52YWxpZDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZmlyc3RJbnZhbGlkID0gdGhpcy5fZ2V0Rmlyc3RJbnZhbGlkKClbMF07XG5cbiAgICBpZiAoZmlyc3RJbnZhbGlkKSB7XG4gICAgICB0aGlzLl9oYW5kbGVFcnJvcihmaXJzdEludmFsaWQpO1xuICAgICAgdGhpcy5faGFuZGxlU3R5bGUoZmlyc3RJbnZhbGlkKTtcbiAgICAgIHRoaXMuX2luamVjdCgnZm9jdXNGaXJzdEludmFsaWQnLCBmaXJzdEludmFsaWQpO1xuICAgICAgJChmaXJzdEludmFsaWQpLmZvY3VzKCk7XG4gICAgfVxuICB9LFxuXG4gIGlzVmFsaWQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZiAobmFtZSkgcmV0dXJuICEgdGhpcy5nZXRJbnZhbGlkKCkuZmluZCgnW25hbWU9XCInKyBuYW1lICsnXCJdJykubGVuZ3RoO1xuICAgIHJldHVybiAhIHRoaXMuZ2V0SW52YWxpZCgpLmxlbmd0aDtcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24obmFtZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRpbnB1dHMgPSB0aGlzLiRpbnB1dHM7XG5cbiAgICBpZiAobmFtZSkgJGlucHV0cyA9ICRpbnB1dHMuZmlsdGVyKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKTtcblxuICAgICRpbnB1dHMuZmlsdGVyKCdpbnB1dDpub3QoOmNoZWNrYm94LCA6cmFkaW8pJykudmFsKCcnKTtcbiAgICAkaW5wdXRzLmZpbHRlcignOmNoZWNrYm94LCA6cmFkaW8nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICRpbnB1dHMuZmlsdGVyKCdzZWxlY3QnKS5maW5kKCdvcHRpb24nKS5wcm9wKCdzZWxlY3RlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdFNlbGVjdGVkO1xuICAgIH0pO1xuXG4gICAgJGlucHV0cy5jaGFuZ2UoKS5lYWNoKGZ1bmN0aW9uKCl7IHNlbGYuX3Jlc2V0RXJyb3JBbmRTdHlsZSh0aGlzKSB9KTtcblxuICAgIHRoaXMuX2luamVjdCgncmVzZXQnLCBuYW1lKTtcbiAgfVxuXG59O1xuIiwiLyoqXG4gKiBSdWxlc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICByZXF1aXJlZDogLy4rLyxcbiAgZGlnaXRzOiAvXlxcZCskLyxcbiAgZW1haWw6IC9eW15AXStAW15AXStcXC4uezIsNn0kLyxcbiAgdXNlcm5hbWU6IC9eW2Etel0oPz1bXFx3Ll17MywzMX0kKVxcdypcXC4/XFx3KiQvaSxcbiAgcGFzczogLyg/PS4qXFxkKSg/PS4qW2Etel0pKD89LipbQS1aXSkuezYsfS8sXG4gIHN0cm9uZ3Bhc3M6IC8oPz1eLns4LH0kKSgoPz0uKlxcZCl8KD89LipcXFcrKSkoPyFbLlxcbl0pKD89LipbQS1aXSkoPz0uKlthLXpdKS4qJC8sXG4gIHBob25lOiAvXlsyLTldXFxkezJ9LVxcZHszfS1cXGR7NH0kLyxcbiAgemlwOiAvXlxcZHs1fSR8XlxcZHs1fS1cXGR7NH0kLyxcbiAgdXJsOiAvXig/OihmdHB8aHR0cHxodHRwcyk6XFwvXFwvKT8oPzpbXFx3XFwtXStcXC4pK1thLXpdezIsNn0oW1xcOlxcLz8jXS4qKT8kL2ksXG5cbiAgbnVtYmVyOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUpIHtcbiAgICByZXR1cm4gIWlzTmFOKHZhbHVlKTtcbiAgfSxcblxuICByYW5nZTogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaXgsIG1heCkge1xuICAgIHJldHVybiBOdW1iZXIodmFsdWUpID49IG1pbiAmJiBOdW1iZXIodmFsdWUpIDw9IG1heDtcbiAgfSxcblxuICBtaW46IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWluKSB7XG4gICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA+PSBtaW47XG4gIH0sXG5cbiAgbWF4OiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1heCkge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPD0gbWF4O1xuICB9LFxuXG4gIG1pbm9wdGlvbjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaW4pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0UmVsYXRlZChpbnB1dCkuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCA+PSBtaW47XG4gIH0sXG5cbiAgbWF4b3B0aW9uOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1heCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRSZWxhdGVkKGlucHV0KS5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoIDw9IG1heDtcbiAgfSxcblxuICBtaW5tYXg6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWluLCBtYXgpIHtcbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoID49IG1pbiAmJiB2YWx1ZS5sZW5ndGggPD0gbWF4O1xuICB9LFxuXG4gIHNlbGVjdDogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBkZWYpIHtcbiAgICByZXR1cm4gdmFsdWUgIT0gZGVmO1xuICB9LFxuXG4gIGV4dGVuc2lvbjogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgIHZhciBleHRlbnNpb25zID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgICAsIHZhbGlkID0gZmFsc2U7XG5cbiAgICAkLmVhY2goaW5wdXQuZmlsZXMgfHwgW3tuYW1lOiBpbnB1dC52YWx1ZX1dLCBmdW5jdGlvbihpLCBmaWxlKSB7XG4gICAgICB2YWxpZCA9ICQuaW5BcnJheShmaWxlLm5hbWUuc3BsaXQoJy4nKS5wb3AoKS50b0xvd2VyQ2FzZSgpLCBleHRlbnNpb25zKSA+IC0xO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9LFxuXG4gIGVxdWFsdG86IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgdGFyZ2V0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJHRhcmdldCA9ICQoJ1tuYW1lPVwiJysgdGFyZ2V0ICsnXCJdJyk7XG5cbiAgICBpZiAodGhpcy5nZXRJbnZhbGlkKCkuZmluZCgkdGFyZ2V0KS5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAgICR0YXJnZXQub2ZmKCdrZXl1cC5lcXVhbHRvJykub24oJ2tleXVwLmVxdWFsdG8nLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuX2dldEZpZWxkKGlucHV0KS5yZW1vdmVEYXRhKCdpZGVhbGZvcm1zLXZhbHVlJyk7XG4gICAgICBzZWxmLl92YWxpZGF0ZShpbnB1dCwgZmFsc2UsIHRydWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGlucHV0LnZhbHVlID09ICR0YXJnZXQudmFsKCk7XG4gIH0sXG5cbiAgZGF0ZTogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBmb3JtYXQpIHtcblxuICAgIGZvcm1hdCA9IGZvcm1hdCB8fCAnbW0vZGQveXl5eSc7XG5cbiAgICB2YXIgZGVsaW1pdGVyID0gL1tebWR5XS8uZXhlYyhmb3JtYXQpWzBdXG4gICAgICAsIHRoZUZvcm1hdCA9IGZvcm1hdC5zcGxpdChkZWxpbWl0ZXIpXG4gICAgICAsIHRoZURhdGUgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuXG4gICAgZnVuY3Rpb24gaXNEYXRlKGRhdGUsIGZvcm1hdCkge1xuXG4gICAgICB2YXIgbSwgZCwgeTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZvcm1hdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoL20vLnRlc3QoZm9ybWF0W2ldKSkgbSA9IGRhdGVbaV07XG4gICAgICAgIGlmICgvZC8udGVzdChmb3JtYXRbaV0pKSBkID0gZGF0ZVtpXTtcbiAgICAgICAgaWYgKC95Ly50ZXN0KGZvcm1hdFtpXSkpIHkgPSBkYXRlW2ldO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW0gfHwgIWQgfHwgIXkpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIG0gPiAwICYmIG0gPCAxMyAmJlxuICAgICAgICB5ICYmIHkubGVuZ3RoID09IDQgJiZcbiAgICAgICAgZCA+IDAgJiYgZCA8PSAobmV3IERhdGUoeSwgbSwgMCkpLmdldERhdGUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXNEYXRlKHRoZURhdGUsIHRoZUZvcm1hdCk7XG4gIH1cblxufTtcbiJdfQ==
;