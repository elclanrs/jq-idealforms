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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2Vycm9ycy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9hZGFwdGl2ZS9hZGFwdGl2ZS5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvYWpheC9hamF4LmV4dC5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2N1c3RvbS1pbnB1dHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxmaWxlLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxyYWRpb2NoZWNrLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvZHluYW1pYy1maWVsZHMvZHluYW1pYy1maWVsZHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL3N0ZXBzL2lkZWFsc3RlcHMuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvc3RlcHMvc3RlcHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9tYWluLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9wbHVnaW4uanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3ByaXZhdGUuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3B1YmxpYy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvcnVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRXJyb3JzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHJlcXVpcmVkOiAnVGhpcyBmaWVsZCBpcyByZXF1aXJlZCcsXG4gIGRpZ2l0czogJ011c3QgYmUgb25seSBkaWdpdHMnLFxuICBuYW1lOiAnTXVzdCBiZSBhdCBsZWFzdCAzIGNoYXJhY3RlcnMgbG9uZyBhbmQgbXVzdCBvbmx5IGNvbnRhaW4gbGV0dGVycycsXG4gIGVtYWlsOiAnTXVzdCBiZSBhIHZhbGlkIGVtYWlsJyxcbiAgdXNlcm5hbWU6ICdNdXN0IGJlIGF0IGJldHdlZW4gNCBhbmQgMzIgY2hhcmFjdGVycyBsb25nIGFuZCBzdGFydCB3aXRoIGEgbGV0dGVyLiBZb3UgbWF5IHVzZSBsZXR0ZXJzLCBudW1iZXJzLCB1bmRlcnNjb3JlcywgYW5kIG9uZSBkb3QnLFxuICBwYXNzOiAnTXVzdCBiZSBhdCBsZWFzdCA2IGNoYXJhY3RlcnMgbG9uZywgYW5kIGNvbnRhaW4gYXQgbGVhc3Qgb25lIG51bWJlciwgb25lIHVwcGVyY2FzZSBhbmQgb25lIGxvd2VyY2FzZSBsZXR0ZXInLFxuICBzdHJvbmdwYXNzOiAnTXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMgbG9uZyBhbmQgY29udGFpbiBhdCBsZWFzdCBvbmUgdXBwZXJjYXNlIGFuZCBvbmUgbG93ZXJjYXNlIGxldHRlciBhbmQgb25lIG51bWJlciBvciBzcGVjaWFsIGNoYXJhY3RlcicsXG4gIHBob25lOiAnTXVzdCBiZSBhIHZhbGlkIHBob25lIG51bWJlcicsXG4gIHppcDogJ011c3QgYmUgYSB2YWxpZCB6aXAgY29kZScsXG4gIHVybDogJ011c3QgYmUgYSB2YWxpZCBVUkwnLFxuICBudW1iZXI6ICdNdXN0IGJlIGEgbnVtYmVyJyxcbiAgcmFuZ2U6ICdNdXN0IGJlIGEgbnVtYmVyIGJldHdlZW4gezB9IGFuZCB7MX0nLFxuICBtaW46ICdNdXN0IGJlIGF0IGxlYXN0IHswfSBjaGFyYWN0ZXJzIGxvbmcnLFxuICBtYXg6ICdNdXN0IGJlIHVuZGVyIHswfSBjaGFyYWN0ZXJzJyxcbiAgbWlub3B0aW9uOiAnU2VsZWN0IGF0IGxlYXN0IHswfSBvcHRpb25zJyxcbiAgbWF4b3B0aW9uOiAnU2VsZWN0IG5vIG1vcmUgdGhhbiB7MH0gb3B0aW9ucycsXG4gIG1pbm1heDogJ011c3QgYmUgYmV0d2VlbiB7MH0gYW5kIHsxfSBjaGFyYWN0ZXJzIGxvbmcnLFxuICBzZWxlY3Q6ICdTZWxlY3QgYW4gb3B0aW9uJyxcbiAgZXh0ZW5zaW9uOiAnRmlsZShzKSBtdXN0IGhhdmUgYSB2YWxpZCBleHRlbnNpb24gKHsqfSknLFxuICBlcXVhbHRvOiAnTXVzdCBoYXZlIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBcInswfVwiIGZpZWxkJyxcbiAgZGF0ZTogJ011c3QgYmUgYSB2YWxpZCBkYXRlIHswfSdcblxufTtcbiIsIi8qKlxuICogQWRhcHRpdmVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2FkYXB0aXZlJyxcblxuICBvcHRpb25zOiB7XG4gICAgYWRhcHRpdmVXaWR0aDogJCgnPHAgY2xhc3M9XCJpZGVhbGZvcm1zLWZpZWxkLXdpZHRoXCIvPicpLmFwcGVuZFRvKCdib2R5JykuY3NzKCd3aWR0aCcpLnJlcGxhY2UoJ3B4JywnJylcbiAgfSxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBmdW5jdGlvbiBhZGFwdCgpIHtcblxuICAgICAgICB2YXIgZm9ybVdpZHRoID0gc2VsZi4kZm9ybS5vdXRlcldpZHRoKClcbiAgICAgICAgICAsIGlzQWRhcHRpdmUgPSBzZWxmLm9wdHMuYWRhcHRpdmVXaWR0aCA+IGZvcm1XaWR0aDtcblxuICAgICAgICBzZWxmLiRmb3JtLnRvZ2dsZUNsYXNzKCdhZGFwdGl2ZScsIGlzQWRhcHRpdmUpO1xuXG4gICAgICAgIGlmIChzZWxmLl9oYXNFeHRlbnNpb24oJ3N0ZXBzJykpIHtcbiAgICAgICAgICBzZWxmLiRzdGVwc0NvbnRhaW5lci50b2dnbGVDbGFzcygnYWRhcHRpdmUnLCBpc0FkYXB0aXZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJyN1aS1kYXRlcGlja2VyLWRpdicpLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgJCh3aW5kb3cpLnJlc2l6ZShhZGFwdCk7XG4gICAgICBhZGFwdCgpO1xuXG4gICAgICB0aGlzLiRmb3JtLmZpbmQoJ3NlbGVjdCwgLmRhdGVwaWNrZXInKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLl9nZXRGaWVsZCh0aGlzKS5maW5kKHNlbGYub3B0cy5lcnJvcikuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgfSk7XG5cbiAgICAgICQoJ3AuaWRlYWxmb3Jtcy1maWVsZC13aWR0aCcpLnJlbW92ZSgpO1xuICAgIH1cblxuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2FqYXgnLFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICQuZXh0ZW5kKCQuaWRlYWxmb3JtcywgeyBfcmVxdWVzdHM6IHt9IH0pO1xuXG4gICAgICAkLmlkZWFsZm9ybXMuZXJyb3JzLmFqYXggPSAkLmlkZWFsZm9ybXMuZXJyb3JzLmFqYXggfHwgJ0xvYWRpbmcuLi4nO1xuXG4gICAgICAkLmV4dGVuZCgkLmlkZWFsZm9ybXMucnVsZXMsIHtcblxuICAgICAgICBhamF4OiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgICAgICAgLCB1cmwgPSAkKGlucHV0KS5kYXRhKCdpZGVhbGZvcm1zLWFqYXgnKVxuICAgICAgICAgICAgLCB1c2VyRXJyb3IgPSAkLmlkZWFsZm9ybXMuX2dldEtleSgnZXJyb3JzLicrIGlucHV0Lm5hbWUgKycuYWpheEVycm9yJywgc2VsZi5vcHRzKVxuICAgICAgICAgICAgLCByZXF1ZXN0cyA9ICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNcbiAgICAgICAgICAgICwgZGF0YSA9IHt9O1xuXG4gICAgICAgICAgZGF0YVtpbnB1dC5uYW1lXSA9IGlucHV0LnZhbHVlO1xuXG4gICAgICAgICAgJGZpZWxkLmFkZENsYXNzKCdhamF4Jyk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdHNbaW5wdXQubmFtZV0pIHJlcXVlc3RzW2lucHV0Lm5hbWVdLmFib3J0KCk7XG5cbiAgICAgICAgICByZXF1ZXN0c1tpbnB1dC5uYW1lXSA9ICQucG9zdCh1cmwsIGRhdGEsIGZ1bmN0aW9uKHJlc3ApIHtcblxuICAgICAgICAgICAgaWYgKHJlc3AgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgc2VsZi5faGFuZGxlRXJyb3IoaW5wdXQpO1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVTdHlsZShpbnB1dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCwgdXNlckVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGZpZWxkLnJlbW92ZUNsYXNzKCdhamF4Jyk7XG5cbiAgICAgICAgICB9LCAnanNvbicpO1xuXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIF92YWxpZGF0ZTogZnVuY3Rpb24oaW5wdXQsIHJ1bGUpIHtcbiAgICAgIGlmIChydWxlICE9ICdhamF4JyAmJiAkLmlkZWFsZm9ybXMuX3JlcXVlc3RzW2lucHV0Lm5hbWVdKSB7XG4gICAgICAgICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNbaW5wdXQubmFtZV0uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5fZ2V0RmllbGQoaW5wdXQpLnJlbW92ZUNsYXNzKCdhamF4Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbn07XG4iLCJyZXF1aXJlKCcuL2lkZWFsZmlsZScpO1xucmVxdWlyZSgnLi9pZGVhbHJhZGlvY2hlY2snKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2N1c3RvbUlucHV0cycsXG5cbiAgb3B0aW9uczoge1xuICAgIGN1c3RvbUlucHV0czoge1xuICAgICAgaTE4bjoge1xuICAgICAgICBvcGVuOiAnT3BlbidcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkQ3VzdG9tSW5wdXRzKCk7XG4gICAgfSxcblxuICAgIGFkZEZpZWxkczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9idWlsZEN1c3RvbUlucHV0cygpO1xuICAgIH0sXG5cbiAgICBfYnVpbGRDdXN0b21JbnB1dHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kZm9ybS5maW5kKCc6ZmlsZScpLmlkZWFsZmlsZSh0aGlzLm9wdHMuY3VzdG9tSW5wdXRzLmkxOG4pO1xuICAgICAgdGhpcy4kZm9ybS5maW5kKCc6Y2hlY2tib3gsIDpyYWRpbycpLmlkZWFscmFkaW9jaGVjaygpO1xuICAgIH1cblxuICB9XG59O1xuIiwiLyoqXG4gKiBJZGVhbCBGaWxlXG4gKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgLy8gQnJvd3NlciBzdXBwb3J0cyBIVE1MNSBtdWx0aXBsZSBmaWxlP1xuICB2YXIgbXVsdGlwbGVTdXBwb3J0ID0gdHlwZW9mICQoJzxpbnB1dC8+JylbMF0ubXVsdGlwbGUgIT09ICd1bmRlZmluZWQnXG4gICAgLCBpc0lFID0gL21zaWUvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgLCBwbHVnaW4gPSB7fTtcblxuICBwbHVnaW4ubmFtZSA9ICdpZGVhbGZpbGUnO1xuXG4gIHBsdWdpbi5kZWZhdWx0cyA9IHtcbiAgICBvcGVuOiAnT3BlbidcbiAgfTtcblxuICBwbHVnaW4ubWV0aG9kcyA9IHtcblxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyICRmaWxlID0gJCh0aGlzLmVsKS5hZGRDbGFzcygnaWRlYWwtZmlsZScpIC8vIHRoZSBvcmlnaW5hbCBmaWxlIGlucHV0XG4gICAgICAgICwgJHdyYXAgPSAkKCc8ZGl2IGNsYXNzPVwiaWRlYWwtZmlsZS13cmFwXCI+JylcbiAgICAgICAgLCAkaW5wdXQgPSAkKCc8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cImlkZWFsLWZpbGUtZmlsZW5hbWVcIiAvPicpXG4gICAgICAgICAgLy8gQnV0dG9uIHRoYXQgd2lsbCBiZSB1c2VkIGluIG5vbi1JRSBicm93c2Vyc1xuICAgICAgICAsICRidXR0b24gPSAkKCc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImlkZWFsLWZpbGUtdXBsb2FkXCI+JysgdGhpcy5vcHRzLm9wZW4gKyc8L2J1dHRvbj4nKVxuICAgICAgICAgIC8vIEhhY2sgZm9yIElFXG4gICAgICAgICwgJGxhYmVsID0gJCgnPGxhYmVsIGNsYXNzPVwiaWRlYWwtZmlsZS11cGxvYWRcIiBmb3I9XCInICsgJGZpbGVbMF0uaWQgKyAnXCI+JysgdGhpcy5vcHRzLm9wZW4gKyc8L2xhYmVsPicpO1xuXG4gICAgICBpZiAoaXNJRSkgJGxhYmVsLmFkZCgkYnV0dG9uKS5hZGRDbGFzcygnaWUnKTtcblxuICAgICAgLy8gSGlkZSBieSBzaGlmdGluZyB0byB0aGUgbGVmdCBzbyB3ZVxuICAgICAgLy8gY2FuIHN0aWxsIHRyaWdnZXIgZXZlbnRzXG4gICAgICAkZmlsZS5jc3Moe1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgbGVmdDogJy05OTk5cHgnXG4gICAgICB9KTtcblxuICAgICAgJHdyYXAuYXBwZW5kKCRpbnB1dCwgKGlzSUUgPyAkbGFiZWwgOiAkYnV0dG9uKSkuaW5zZXJ0QWZ0ZXIoJGZpbGUpO1xuXG4gICAgICAvLyBQcmV2ZW50IGZvY3VzXG4gICAgICAkZmlsZS5hdHRyKCd0YWJJbmRleCcsIC0xKTtcbiAgICAgICRidXR0b24uYXR0cigndGFiSW5kZXgnLCAtMSk7XG5cbiAgICAgICRidXR0b24uY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAkZmlsZS5mb2N1cygpLmNsaWNrKCk7IC8vIE9wZW4gZGlhbG9nXG4gICAgICB9KTtcblxuICAgICAgJGZpbGUuY2hhbmdlKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgZmlsZXMgPSBbXVxuICAgICAgICAgICwgZmlsZUFyciwgZmlsZW5hbWU7XG5cbiAgICAgICAgICAvLyBJZiBtdWx0aXBsZSBpcyBzdXBwb3J0ZWQgdGhlbiBleHRyYWN0XG4gICAgICAgICAgLy8gYWxsIGZpbGVuYW1lcyBmcm9tIHRoZSBmaWxlIGFycmF5XG4gICAgICAgIGlmIChtdWx0aXBsZVN1cHBvcnQpIHtcbiAgICAgICAgICBmaWxlQXJyID0gJGZpbGVbMF0uZmlsZXM7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZpbGVBcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZUFycltpXS5uYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmlsZW5hbWUgPSBmaWxlcy5qb2luKCcsICcpO1xuXG4gICAgICAgICAgLy8gSWYgbm90IHN1cHBvcnRlZCB0aGVuIGp1c3QgdGFrZSB0aGUgdmFsdWVcbiAgICAgICAgICAvLyBhbmQgcmVtb3ZlIHRoZSBwYXRoIHRvIGp1c3Qgc2hvdyB0aGUgZmlsZW5hbWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaWxlbmFtZSA9ICRmaWxlLnZhbCgpLnNwbGl0KCdcXFxcJykucG9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICAkaW5wdXQgLnZhbChmaWxlbmFtZSkuYXR0cigndGl0bGUnLCBmaWxlbmFtZSk7XG5cbiAgICAgIH0pO1xuXG4gICAgICAkaW5wdXQub24oe1xuICAgICAgICBibHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGZpbGUudHJpZ2dlcignYmx1cicpO1xuICAgICAgICB9LFxuICAgICAgICBrZXlkb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmIChlLndoaWNoID09PSAxMykgeyAvLyBFbnRlclxuICAgICAgICAgICAgaWYgKCFpc0lFKSAkZmlsZS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCdmb3JtJykub25lKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMTMpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gOCB8fCBlLndoaWNoID09PSA0NikgeyAvLyBCYWNrc3BhY2UgJiBEZWxcbiAgICAgICAgICAgIC8vIEluIElFIHRoZSB2YWx1ZSBpcyByZWFkLW9ubHlcbiAgICAgICAgICAgIC8vIHdpdGggdGhpcyB0cmljayB3ZSByZW1vdmUgdGhlIG9sZCBpbnB1dCBhbmQgYWRkXG4gICAgICAgICAgICAvLyBhIGNsZWFuIGNsb25lIHdpdGggYWxsIHRoZSBvcmlnaW5hbCBldmVudHMgYXR0YWNoZWRcbiAgICAgICAgICAgIGlmIChpc0lFKSAkZmlsZS5yZXBsYWNlV2l0aCgkZmlsZSA9ICRmaWxlLmNsb25lKHRydWUpKTtcbiAgICAgICAgICAgICRmaWxlLnZhbCgnJykudHJpZ2dlcignY2hhbmdlJyk7XG4gICAgICAgICAgICAkaW5wdXQudmFsKCcnKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDkpIHsgLy8gVEFCXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHsgLy8gQWxsIG90aGVyIGtleXNcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfVxuXG4gIH07XG5cbiAgcmVxdWlyZSgnLi4vLi4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcbiIsIi8qXG4gKiBpZGVhbFJhZGlvQ2hlY2s6IGpRdWVyeSBwbGd1aW4gZm9yIGNoZWNrYm94IGFuZCByYWRpbyByZXBsYWNlbWVudFxuICogVXNhZ2U6ICQoJ2lucHV0W3R5cGU9Y2hlY2tib3hdLCBpbnB1dFt0eXBlPXJhZGlvXScpLmlkZWFsUmFkaW9DaGVjaygpXG4gKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFscmFkaW9jaGVjayc7XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSB7XG5cbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciAkaW5wdXQgPSAkKHRoaXMuZWwpO1xuICAgICAgdmFyICRzcGFuID0gJCgnPHNwYW4vPicpO1xuXG4gICAgICAkc3Bhbi5hZGRDbGFzcygnaWRlYWwtJysgKCRpbnB1dC5pcygnOmNoZWNrYm94JykgPyAnY2hlY2snIDogJ3JhZGlvJykpO1xuICAgICAgJGlucHV0LmlzKCc6Y2hlY2tlZCcpICYmICRzcGFuLmFkZENsYXNzKCdjaGVja2VkJyk7IC8vIGluaXRcbiAgICAgICRzcGFuLmluc2VydEFmdGVyKCRpbnB1dCk7XG5cbiAgICAgICRpbnB1dC5wYXJlbnQoJ2xhYmVsJylcbiAgICAgICAgLmFkZENsYXNzKCdpZGVhbC1yYWRpb2NoZWNrLWxhYmVsJylcbiAgICAgICAgLmF0dHIoJ29uY2xpY2snLCAnJyk7IC8vIEZpeCBjbGlja2luZyBsYWJlbCBpbiBpT1NcblxuICAgICAgJGlucHV0LmNzcyh7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBsZWZ0OiAnLTk5OTlweCcgfSk7IC8vIGhpZGUgYnkgc2hpZnRpbmcgbGVmdFxuXG4gICAgICAvLyBFdmVudHNcbiAgICAgICRpbnB1dC5vbih7XG4gICAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRpbnB1dCA9ICQodGhpcyk7XG4gICAgICAgICAgaWYgKCAkaW5wdXQuaXMoJ2lucHV0W3R5cGU9XCJyYWRpb1wiXScpICkge1xuICAgICAgICAgICAgJGlucHV0LnBhcmVudCgpLnNpYmxpbmdzKCdsYWJlbCcpLmZpbmQoJy5pZGVhbC1yYWRpbycpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgICRzcGFuLnRvZ2dsZUNsYXNzKCdjaGVja2VkJywgJGlucHV0LmlzKCc6Y2hlY2tlZCcpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkgeyAkc3Bhbi5hZGRDbGFzcygnZm9jdXMnKSB9LFxuICAgICAgICBibHVyOiBmdW5jdGlvbigpIHsgJHNwYW4ucmVtb3ZlQ2xhc3MoJ2ZvY3VzJykgfSxcbiAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKCkgeyAkKHRoaXMpLnRyaWdnZXIoJ2ZvY3VzJykgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgcmVxdWlyZSgnLi4vLi4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2RhdGVwaWNrZXInLFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9idWlsZERhdGVwaWNrZXIoKTtcbiAgICB9LFxuXG4gICBfYnVpbGREYXRlcGlja2VyOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyICRkYXRlcGlja2VyID0gdGhpcy4kZm9ybS5maW5kKCdpbnB1dC5kYXRlcGlja2VyJyk7XG5cbiAgICAgIC8vIEFsd2F5cyBzaG93IGRhdGVwaWNrZXIgYmVsb3cgdGhlIGlucHV0XG4gICAgICBpZiAoalF1ZXJ5LnVpKSB7XG4gICAgICAgICQuZGF0ZXBpY2tlci5fY2hlY2tPZmZzZXQgPSBmdW5jdGlvbihhLGIsYyl7IHJldHVybiBiIH07XG4gICAgICB9XG5cbiAgICAgIGlmIChqUXVlcnkudWkgJiYgJGRhdGVwaWNrZXIubGVuZ3RoKSB7XG5cbiAgICAgICAgJGRhdGVwaWNrZXIuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICQodGhpcykuZGF0ZXBpY2tlcih7XG4gICAgICAgICAgICBiZWZvcmVTaG93OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICAgICAgICAkKGlucHV0KS5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2hhbmdlTW9udGhZZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgLy8gSGFjayB0byBmaXggSUU5IG5vdCByZXNpemluZ1xuICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICAgICAgICAgLCB3aWR0aCA9ICR0aGlzLm91dGVyV2lkdGgoKTsgLy8gY2FjaGUgZmlyc3QhXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0ZXBpY2tlcignd2lkZ2V0JykuY3NzKCd3aWR0aCcsIHdpZHRoKTtcbiAgICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25DbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRqdXN0IHdpZHRoXG4gICAgICAgICRkYXRlcGlja2VyLm9uKCdmb2N1cyBrZXl1cCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciB0ID0gJCh0aGlzKSwgdyA9IHQub3V0ZXJXaWR0aCgpO1xuICAgICAgICAgIHQuZGF0ZXBpY2tlcignd2lkZ2V0JykuY3NzKCd3aWR0aCcsIHcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxufTtcbiIsImZ1bmN0aW9uIHRlbXBsYXRlKGh0bWwsIGRhdGEpIHtcblxuICB2YXIgbG9vcCA9IC9cXHtAKFtefV0rKVxcfSguKz8pXFx7XFwvXFwxXFx9L2dcbiAgICAsIGxvb3BWYXJpYWJsZSA9IC9cXHsjKFtefV0rKVxcfS9nXG4gICAgLCB2YXJpYWJsZSA9IC9cXHsoW159XSspXFx9L2c7XG5cbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZShsb29wLCBmdW5jdGlvbihfLCBrZXksIGxpc3QpIHtcbiAgICAgIHJldHVybiAkLm1hcChkYXRhW2tleV0sIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGxpc3QucmVwbGFjZShsb29wVmFyaWFibGUsIGZ1bmN0aW9uKF8sIGspIHtcbiAgICAgICAgICByZXR1cm4gaXRlbVtrXTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5qb2luKCcnKTtcbiAgICB9KVxuICAgIC5yZXBsYWNlKHZhcmlhYmxlLCBmdW5jdGlvbihfLCBrZXkpIHtcbiAgICAgIHJldHVybiBkYXRhW2tleV0gfHwgJyc7XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdkeW5hbWljRmllbGRzJyxcblxuICBvcHRpb25zOiB7XG5cbiAgICB0ZW1wbGF0ZXM6IHtcblxuICAgICAgYmFzZTonXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkXCI+XFxcbiAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJtYWluXCI+e2xhYmVsfTwvbGFiZWw+XFxcbiAgICAgICAgICB7ZmllbGR9XFxcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImVycm9yXCI+PC9zcGFuPlxcXG4gICAgICAgIDwvZGl2PlxcXG4gICAgICAnLFxuXG4gICAgICB0ZXh0OiAnPGlucHV0IG5hbWU9XCJ7bmFtZX1cIiB0eXBlPVwie3N1YnR5cGV9XCIgdmFsdWU9XCJ7dmFsdWV9XCIge2F0dHJzfT4nLFxuXG4gICAgICBmaWxlOiAnPGlucHV0IGlkPVwie25hbWV9IFwibmFtZT1cIntuYW1lfVwiIHR5cGU9XCJmaWxlXCIge2F0dHJzfT4nLFxuXG4gICAgICB0ZXh0YXJlYTogJzx0ZXh0YXJlYSBuYW1lPVwie25hbWV9XCIge2F0dHJzfT57dGV4dH08L3RleHRhcmVhPicsXG5cbiAgICAgIGdyb3VwOiAnXFxcbiAgICAgICAgPHAgY2xhc3M9XCJncm91cFwiPlxcXG4gICAgICAgICAge0BsaXN0fVxcXG4gICAgICAgICAgPGxhYmVsPjxpbnB1dCBuYW1lPVwie25hbWV9XCIgdHlwZT1cIntzdWJ0eXBlfVwiIHZhbHVlPVwieyN2YWx1ZX1cIiB7I2F0dHJzfT57I3RleHR9PC9sYWJlbD5cXFxuICAgICAgICAgIHsvbGlzdH1cXFxuICAgICAgICA8L3A+XFxcbiAgICAgICcsXG5cbiAgICAgIHNlbGVjdDogJ1xcXG4gICAgICAgIDxzZWxlY3QgbmFtZT17bmFtZX0+XFxcbiAgICAgICAgICB7QGxpc3R9XFxcbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwieyN2YWx1ZX1cIj57I3RleHR9PC9vcHRpb24+XFxcbiAgICAgICAgICB7L2xpc3R9XFxcbiAgICAgICAgPC9zZWxlY3Q+XFxcbiAgICAgICdcbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgYWRkRmllbGRzOiBmdW5jdGlvbihmaWVsZHMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2goZmllbGRzLCBmdW5jdGlvbihuYW1lLCBmaWVsZCkge1xuXG4gICAgICAgIHZhciB0eXBlQXJyYXkgPSBmaWVsZC50eXBlLnNwbGl0KCc6JylcbiAgICAgICAgICAsIHJ1bGVzID0ge31cbiAgICAgICAgICAsICRsYXN0ID0gc2VsZi4kZm9ybS5maW5kKHNlbGYub3B0cy5maWVsZCkubGFzdCgpO1xuXG4gICAgICAgIGZpZWxkLm5hbWUgPSBuYW1lO1xuICAgICAgICBmaWVsZC50eXBlID0gdHlwZUFycmF5WzBdO1xuICAgICAgICBpZiAodHlwZUFycmF5WzFdKSBmaWVsZC5zdWJ0eXBlID0gdHlwZUFycmF5WzFdO1xuXG4gICAgICAgIGZpZWxkLmh0bWwgPSB0ZW1wbGF0ZShzZWxmLm9wdHMudGVtcGxhdGVzLmJhc2UsIHtcbiAgICAgICAgICBsYWJlbDogZmllbGQubGFiZWwsXG4gICAgICAgICAgZmllbGQ6IHRlbXBsYXRlKHNlbGYub3B0cy50ZW1wbGF0ZXNbZmllbGQudHlwZV0sIGZpZWxkKVxuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLl9pbmplY3QoJ2FkZEZpZWxkcycsIGZpZWxkKTtcblxuICAgICAgICBpZiAoZmllbGQuYWZ0ZXIgfHwgZmllbGQuYmVmb3JlKSB7XG4gICAgICAgICAgc2VsZi4kZm9ybS5maW5kKCdbbmFtZT1cIicrIChmaWVsZC5hZnRlciB8fCBmaWVsZC5iZWZvcmUpICsnXCJdJykuZmlyc3QoKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fZ2V0RmllbGQodGhpcylbZmllbGQuYWZ0ZXIgPyAnYWZ0ZXInIDogJ2JlZm9yZSddKGZpZWxkLmh0bWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEZvcm0gaGFzIGF0IGxlYXN0IG9uZSBmaWVsZFxuICAgICAgICAgIGlmICgkbGFzdC5sZW5ndGgpICRsYXN0LmFmdGVyKGZpZWxkLmh0bWwpO1xuICAgICAgICAgIC8vIEZvcm0gaGFzIG5vIGZpZWxkc1xuICAgICAgICAgIGVsc2Ugc2VsZi4kZm9ybS5hcHBlbmQoZmllbGQuaHRtbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGQucnVsZXMpIHtcbiAgICAgICAgICBydWxlc1tuYW1lXSA9IGZpZWxkLnJ1bGVzO1xuICAgICAgICAgIHNlbGYuYWRkUnVsZXMocnVsZXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0sXG5cbiAgICByZW1vdmVGaWVsZHM6IGZ1bmN0aW9uKG5hbWVzKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKG5hbWVzLnNwbGl0KCcgJyksIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgICAgdmFyICRmaWVsZCA9IHNlbGYuX2dldEZpZWxkKCQoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpKTtcbiAgICAgICAgc2VsZi4kZmllbGRzID0gc2VsZi4kZmllbGRzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gISAkKHRoaXMpLmlzKCRmaWVsZCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkZmllbGQucmVtb3ZlKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5faW5qZWN0KCdyZW1vdmVGaWVsZHMnKTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlRmllbGRzOiBmdW5jdGlvbihuYW1lcykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChuYW1lcy5zcGxpdCgnICcpLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAgIHZhciAkZmllbGQgPSBzZWxmLl9nZXRGaWVsZCgkKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKSk7XG4gICAgICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJywgJGZpZWxkLmlzKCc6dmlzaWJsZScpKS50b2dnbGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9pbmplY3QoJ3RvZ2dsZUZpZWxkcycpO1xuICAgIH1cblxuICB9XG59O1xuIiwiLyohXG4gKiBJZGVhbCBTdGVwc1xuKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsc3RlcHMnO1xuXG4gIHBsdWdpbi5kZWZhdWx0cyA9IHtcbiAgICBuYXY6ICcuaWRlYWxzdGVwcy1uYXYnLFxuICAgIG5hdkl0ZW1zOiAnbGknLFxuICAgIGJ1aWxkTmF2SXRlbXM6IHRydWUsXG4gICAgd3JhcDogJy5pZGVhbHN0ZXBzLXdyYXAnLFxuICAgIHN0ZXA6ICcuaWRlYWxzdGVwcy1zdGVwJyxcbiAgICBhY3RpdmVDbGFzczogJ2lkZWFsc3RlcHMtc3RlcC1hY3RpdmUnLFxuICAgIGJlZm9yZTogJC5ub29wLFxuICAgIGFmdGVyOiAkLm5vb3AsXG4gICAgZmFkZVNwZWVkOiAwXG4gIH07XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSB7XG5cbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBhY3RpdmUgPSB0aGlzLm9wdHMuYWN0aXZlQ2xhc3M7XG5cbiAgICAgIHRoaXMuJGVsID0gJCh0aGlzLmVsKTtcblxuICAgICAgdGhpcy4kbmF2ID0gdGhpcy4kZWwuZmluZCh0aGlzLm9wdHMubmF2KTtcbiAgICAgIHRoaXMuJG5hdkl0ZW1zID0gdGhpcy4kbmF2LmZpbmQodGhpcy5vcHRzLm5hdkl0ZW1zKTtcblxuICAgICAgdGhpcy4kd3JhcCA9IHRoaXMuJGVsLmZpbmQodGhpcy5vcHRzLndyYXApO1xuICAgICAgdGhpcy4kc3RlcHMgPSB0aGlzLiR3cmFwLmZpbmQodGhpcy5vcHRzLnN0ZXApO1xuXG4gICAgICBpZiAodGhpcy5vcHRzLmJ1aWxkTmF2SXRlbXMpIHRoaXMuX2J1aWxkTmF2SXRlbXMoKTtcblxuICAgICAgdGhpcy4kc3RlcHMuaGlkZSgpLmZpcnN0KCkuc2hvdygpO1xuICAgICAgdGhpcy4kbmF2SXRlbXMucmVtb3ZlQ2xhc3MoYWN0aXZlKS5maXJzdCgpLmFkZENsYXNzKGFjdGl2ZSk7XG5cbiAgICAgIHRoaXMuJG5hdkl0ZW1zLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoISAkKHRoaXMpLmlzKCcuJysgc2VsZi5vcHRzLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICAgIHNlbGYuZ28oc2VsZi4kbmF2SXRlbXMuaW5kZXgodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2J1aWxkTmF2SXRlbXM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgaXNDdXN0b20gPSB0eXBlb2YgdGhpcy5vcHRzLmJ1aWxkTmF2SXRlbXMgPT0gJ2Z1bmN0aW9uJyxcbiAgICAgICAgICBpdGVtID0gZnVuY3Rpb24odmFsKXsgcmV0dXJuICc8bGk+PGEgaHJlZj1cIiNcIiB0YWJpbmRleD1cIi0xXCI+JysgdmFsICsnPC9hPjwvbGk+JzsgfSxcbiAgICAgICAgICBpdGVtcztcblxuICAgICAgaXRlbXMgPSBpc0N1c3RvbSA/XG4gICAgICAgIHRoaXMuJHN0ZXBzLm1hcChmdW5jdGlvbihpKXsgcmV0dXJuIGl0ZW0oc2VsZi5vcHRzLmJ1aWxkTmF2SXRlbXMuY2FsbChzZWxmLCBpKSkgfSkuZ2V0KCkgOlxuICAgICAgICB0aGlzLiRzdGVwcy5tYXAoZnVuY3Rpb24oaSl7IHJldHVybiBpdGVtKCsraSk7IH0pLmdldCgpO1xuXG4gICAgICB0aGlzLiRuYXZJdGVtcyA9ICQoaXRlbXMuam9pbignJykpO1xuXG4gICAgICB0aGlzLiRuYXYuYXBwZW5kKCQoJzx1bC8+JykuYXBwZW5kKHRoaXMuJG5hdkl0ZW1zKSk7XG4gICAgfSxcblxuICAgIF9nZXRDdXJJZHg6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJHN0ZXBzLmluZGV4KHRoaXMuJHN0ZXBzLmZpbHRlcignOnZpc2libGUnKSk7XG4gICAgfSxcblxuICAgIGdvOiBmdW5jdGlvbihpZHgpIHtcblxuICAgICAgdmFyIGFjdGl2ZSA9IHRoaXMub3B0cy5hY3RpdmVDbGFzcyxcbiAgICAgICAgICBmYWRlU3BlZWQgPSB0aGlzLm9wdHMuZmFkZVNwZWVkO1xuXG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnZnVuY3Rpb24nKSBpZHggPSBpZHguY2FsbCh0aGlzLCB0aGlzLl9nZXRDdXJJZHgoKSk7XG5cbiAgICAgIGlmIChpZHggPj0gdGhpcy4kc3RlcHMubGVuZ3RoKSBpZHggPSAwO1xuICAgICAgaWYgKGlkeCA8IDApIGlkeCA9IHRoaXMuJHN0ZXBzLmxlbmd0aC0xO1xuXG4gICAgICB0aGlzLm9wdHMuYmVmb3JlLmNhbGwodGhpcywgaWR4KTtcblxuICAgICAgdGhpcy4kbmF2SXRlbXMucmVtb3ZlQ2xhc3MoYWN0aXZlKS5lcShpZHgpLmFkZENsYXNzKGFjdGl2ZSk7XG4gICAgICB0aGlzLiRzdGVwcy5oaWRlKCkuZXEoaWR4KS5mYWRlSW4oZmFkZVNwZWVkKTtcblxuICAgICAgdGhpcy5vcHRzLmFmdGVyLmNhbGwodGhpcywgaWR4KTtcbiAgICB9LFxuXG4gICAgcHJldjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKHRoaXMuX2dldEN1cklkeCgpIC0gMSk7XG4gICAgfSxcblxuICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbyh0aGlzLl9nZXRDdXJJZHgoKSArIDEpO1xuICAgIH0sXG5cbiAgICBmaXJzdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKDApO1xuICAgIH0sXG5cbiAgICBsYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28odGhpcy4kc3RlcHMubGVuZ3RoLTEpO1xuICAgIH1cbiAgfTtcblxuICByZXF1aXJlKCcuLi8uLi9wbHVnaW4nKShwbHVnaW4pO1xuXG59KGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCkpO1xuIiwicmVxdWlyZSgnLi9pZGVhbHN0ZXBzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdzdGVwcycsXG5cbiAgb3B0aW9uczoge1xuXG4gICAgc3RlcHM6IHtcblxuICAgICAgY29udGFpbmVyOiAnLmlkZWFsc3RlcHMtY29udGFpbmVyJyxcbiAgICAgIG5hdjogJy5pZGVhbHN0ZXBzLW5hdicsXG4gICAgICBuYXZJdGVtczogJ2xpJyxcbiAgICAgIGJ1aWxkTmF2SXRlbXM6IGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0cy5zdGVwcy5pMThuLnN0ZXAgKycgJysgKGkrMSk7XG4gICAgICB9LFxuICAgICAgd3JhcDogJy5pZGVhbHN0ZXBzLXdyYXAnLFxuICAgICAgc3RlcDogJy5pZGVhbHN0ZXBzLXN0ZXAnLFxuICAgICAgYWN0aXZlQ2xhc3M6ICdpZGVhbHN0ZXBzLXN0ZXAtYWN0aXZlJyxcbiAgICAgIGJlZm9yZTogJC5ub29wLFxuICAgICAgYWZ0ZXI6ICQubm9vcCxcbiAgICAgIGZhZGVTcGVlZDogMCxcblxuICAgICAgaTE4bjoge1xuICAgICAgICBzdGVwOiAnU3RlcCdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkU3RlcHMoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIF92YWxpZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5fdXBkYXRlU3RlcHMoKTtcblxuICAgICAgaWYgKHRoaXMuX2hhc0V4dGVuc2lvbignYWpheCcpKSB7XG4gICAgICAgICQuZWFjaCgkLmlkZWFsZm9ybXMuX3JlcXVlc3RzLCBmdW5jdGlvbihrZXksIHJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0LmRvbmUoZnVuY3Rpb24oKXsgc2VsZi5fdXBkYXRlU3RlcHMoKSB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICBmb2N1c0ZpcnN0SW52YWxpZDogZnVuY3Rpb24oZmlyc3RJbnZhbGlkKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnZ28nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHN0ZXBzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh0aGlzKS5maW5kKGZpcnN0SW52YWxpZCkubGVuZ3RoO1xuICAgICAgICB9KS5pbmRleCgpO1xuICAgICAgfSk7XG5cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgJChmaXJzdEludmFsaWQpLmZvY3VzKCkgfSwgdGhpcy5vcHRzLnN0ZXBzLmZhZGVTcGVlZCk7XG4gICAgfSxcblxuICAgIF9idWlsZFN0ZXBzOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLCBvcHRpb25zXG4gICAgICAgICwgaGFzUnVsZXMgPSAhICQuaXNFbXB0eU9iamVjdCh0aGlzLm9wdHMucnVsZXMpXG4gICAgICAgICwgYnVpbGROYXZJdGVtcyA9IHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zXG4gICAgICAgICwgY291bnRlciA9IGhhc1J1bGVzXG4gICAgICAgICAgPyAnPHNwYW4gY2xhc3M9XCJjb3VudGVyXCIvPidcbiAgICAgICAgICA6ICc8c3BhbiBjbGFzcz1cImNvdW50ZXIgemVyb1wiPjA8L3NwYW4+JztcblxuICAgICAgaWYgKHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zKSB7XG4gICAgICAgIHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zID0gZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHJldHVybiBidWlsZE5hdkl0ZW1zLmNhbGwoc2VsZiwgaSkgKyBjb3VudGVyO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lciA9IHRoaXMuJGZvcm1cbiAgICAgICAgLmNsb3Nlc3QodGhpcy5vcHRzLnN0ZXBzLmNvbnRhaW5lcilcbiAgICAgICAgLmlkZWFsc3RlcHModGhpcy5vcHRzLnN0ZXBzKTtcbiAgICB9LFxuXG4gICAgX3VwZGF0ZVN0ZXBzOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdfaW5qZWN0JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGlkZWFsc3RlcHMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJG5hdkl0ZW1zLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHZhciBpbnZhbGlkID0gaWRlYWxzdGVwcy4kc3RlcHMuZXEoaSkuZmluZChzZWxmLmdldEludmFsaWQoKSkubGVuZ3RoO1xuICAgICAgICAgICQodGhpcykuZmluZCgnc3BhbicpLnRleHQoaW52YWxpZCkudG9nZ2xlQ2xhc3MoJ3plcm8nLCAhIGludmFsaWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgYWRkUnVsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5maXJzdFN0ZXAoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIGFkZEZpZWxkczogZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgIGZpZWxkLmFmdGVyID0gdGhpcy4kc3RlcHNDb250YWluZXJcbiAgICAgICAgLmZpbmQodGhpcy5vcHRzLnN0ZXBzLnN0ZXApXG4gICAgICAgIC5lcShmaWVsZC5hcHBlbmRUb1N0ZXApXG4gICAgICAgIC5maW5kKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcpXG4gICAgICAgIC5sYXN0KClbMF0ubmFtZTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIHRvZ2dsZUZpZWxkczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgcmVtb3ZlRmllbGRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0ZXBzKCk7XG4gICAgfSxcblxuICAgIGdvVG9TdGVwOiBmdW5jdGlvbihpZHgpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ2dvJywgaWR4KTtcbiAgICB9LFxuXG4gICAgcHJldlN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygncHJldicpO1xuICAgIH0sXG5cbiAgICBuZXh0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCduZXh0Jyk7XG4gICAgfSxcblxuICAgIGZpcnN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdmaXJzdCcpO1xuICAgIH0sXG5cbiAgICBsYXN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdsYXN0Jyk7XG4gICAgfVxuICB9XG5cbn07XG4iLCIvKiFcbiAqIGpRdWVyeSBJZGVhbCBGb3Jtc1xuICogQGF1dGhvcjogQ2VkcmljIFJ1aXpcbiAqIEB2ZXJzaW9uOiAzLjBcbiAqIEBsaWNlbnNlIEdQTCBvciBNSVRcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICB2YXIgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxmb3Jtcyc7XG5cbiAgcGx1Z2luLmRlZmF1bHRzID0ge1xuICAgIGZpZWxkOiAnLmZpZWxkJyxcbiAgICBlcnJvcjogJy5lcnJvcicsXG4gICAgaWNvbkh0bWw6ICc8aS8+JyxcbiAgICBpY29uQ2xhc3M6ICdpY29uJyxcbiAgICBpbnZhbGlkQ2xhc3M6ICdpbnZhbGlkJyxcbiAgICB2YWxpZENsYXNzOiAndmFsaWQnLFxuICAgIHNpbGVudExvYWQ6IHRydWUsXG4gICAgb25WYWxpZGF0ZTogJC5ub29wLFxuICAgIG9uU3VibWl0OiAkLm5vb3BcbiAgfTtcblxuICBwbHVnaW4uZ2xvYmFsID0ge1xuXG4gICAgX2Zvcm1hdDogZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFx7KFxcZClcXH0vZywgZnVuY3Rpb24oXywgbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3NbK21hdGNoXSB8fCAnJztcbiAgICAgIH0pLnJlcGxhY2UoL1xce1xcKihbXip9XSopXFx9L2csIGZ1bmN0aW9uKF8sIHNlcCkge1xuICAgICAgICByZXR1cm4gYXJncy5qb2luKHNlcCB8fCAnLCAnKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfZ2V0S2V5OiBmdW5jdGlvbihrZXksIG9iaikge1xuICAgICAgcmV0dXJuIGtleS5zcGxpdCgnLicpLnJlZHVjZShmdW5jdGlvbihhLGIpIHtcbiAgICAgICAgcmV0dXJuIGEgJiYgYVtiXTtcbiAgICAgIH0sIG9iaik7XG4gICAgfSxcblxuICAgIGkxOG46IHt9LFxuXG4gICAgcnVsZVNlcGFyYXRvcjogJyAnLFxuICAgIGFyZ1NlcGFyYXRvcjogJzonLFxuXG4gICAgcnVsZXM6IHJlcXVpcmUoJy4vcnVsZXMnKSxcbiAgICBlcnJvcnM6IHJlcXVpcmUoJy4vZXJyb3JzJyksXG5cbiAgICBleHRlbnNpb25zOiBbXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZHluYW1pYy1maWVsZHMvZHluYW1pYy1maWVsZHMuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvYWpheC9hamF4LmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL3N0ZXBzL3N0ZXBzLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvY3VzdG9tLWlucHV0cy5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9kYXRlcGlja2VyL2RhdGVwaWNrZXIuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvYWRhcHRpdmUvYWRhcHRpdmUuZXh0JylcbiAgICBdXG4gIH07XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSAkLmV4dGVuZCh7fSwgcmVxdWlyZSgnLi9wcml2YXRlJyksIHJlcXVpcmUoJy4vcHVibGljJykpO1xuXG4gIHJlcXVpcmUoJy4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcbiIsIi8qKlxuICogUGx1Z2luIGJvaWxlcnBsYXRlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBBUCA9IEFycmF5LnByb3RvdHlwZTtcblxuICByZXR1cm4gZnVuY3Rpb24ocGx1Z2luKSB7XG5cbiAgICBwbHVnaW4gPSAkLmV4dGVuZCh0cnVlLCB7XG4gICAgICBuYW1lOiAncGx1Z2luJyxcbiAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGRpc2FibGVkRXh0ZW5zaW9uczogJ25vbmUnXG4gICAgICB9LFxuICAgICAgbWV0aG9kczoge30sXG4gICAgICBnbG9iYWw6IHt9LFxuICAgIH0sIHBsdWdpbik7XG5cbiAgICAkW3BsdWdpbi5uYW1lXSA9ICQuZXh0ZW5kKHtcblxuICAgICAgYWRkRXh0ZW5zaW9uOiBmdW5jdGlvbihleHRlbnNpb24pIHtcbiAgICAgICAgcGx1Z2luLmdsb2JhbC5leHRlbnNpb25zLnB1c2goZXh0ZW5zaW9uKTtcbiAgICAgIH1cbiAgICB9LCBwbHVnaW4uZ2xvYmFsKTtcblxuICAgIGZ1bmN0aW9uIFBsdWdpbihlbGVtZW50LCBvcHRpb25zKSB7XG5cbiAgICAgIHRoaXMub3B0cyA9ICQuZXh0ZW5kKHt9LCBwbHVnaW4uZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5lbCA9IGVsZW1lbnQ7XG5cbiAgICAgIHRoaXMuX25hbWUgPSBwbHVnaW4ubmFtZTtcblxuICAgICAgdGhpcy5faW5pdCgpO1xuICAgIH1cblxuICAgIFBsdWdpbi5fZXh0ZW5kZWQgPSB7fTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2hhc0V4dGVuc2lvbiA9IGZ1bmN0aW9uKGV4dGVuc2lvbikge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBwbHVnaW4uZ2xvYmFsLmV4dGVuc2lvbnMuZmlsdGVyKGZ1bmN0aW9uKGV4dCkge1xuICAgICAgICByZXR1cm4gZXh0Lm5hbWUgPT0gZXh0ZW5zaW9uICYmIHNlbGYub3B0cy5kaXNhYmxlZEV4dGVuc2lvbnMuaW5kZXhPZihleHQubmFtZSkgPCAwO1xuICAgICAgfSkubGVuZ3RoO1xuICAgIH07XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlLl9leHRlbmQgPSBmdW5jdGlvbihleHRlbnNpb25zKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKGV4dGVuc2lvbnMsIGZ1bmN0aW9uKGksIGV4dGVuc2lvbikge1xuXG4gICAgICAgICQuZXh0ZW5kKHNlbGYub3B0cywgJC5leHRlbmQodHJ1ZSwgZXh0ZW5zaW9uLm9wdGlvbnMsIHNlbGYub3B0cykpO1xuXG4gICAgICAgICQuZWFjaChleHRlbnNpb24ubWV0aG9kcywgZnVuY3Rpb24obWV0aG9kLCBmbikge1xuXG4gICAgICAgICAgaWYgKHNlbGYub3B0cy5kaXNhYmxlZEV4dGVuc2lvbnMuaW5kZXhPZihleHRlbnNpb24ubmFtZSkgPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChQbHVnaW4ucHJvdG90eXBlW21ldGhvZF0pIHtcbiAgICAgICAgICAgIFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSA9IFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSB8fCBbXTtcbiAgICAgICAgICAgIFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXS5wdXNoKHsgbmFtZTogZXh0ZW5zaW9uLm5hbWUsIGZuOiBmbiB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUGx1Z2luLnByb3RvdHlwZVttZXRob2RdID0gZm47XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2luamVjdCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuXG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG1ldGhvZC5jYWxsKHRoaXMpO1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0pIHtcbiAgICAgICAgJC5lYWNoKFBsdWdpbi5fZXh0ZW5kZWRbbWV0aG9kXSwgZnVuY3Rpb24oaSwgcGx1Z2luKSB7XG4gICAgICAgICAgcGx1Z2luLmZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5faW5pdCA9ICQubm9vcDtcblxuICAgIFBsdWdpbi5wcm90b3R5cGVbcGx1Z2luLm5hbWVdID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuIHRoaXM7XG4gICAgICB0cnkgeyByZXR1cm4gdGhpc1ttZXRob2RdLmFwcGx5KHRoaXMsIEFQLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7IH1cbiAgICAgIGNhdGNoKGUpIHt9XG4gICAgfTtcblxuICAgICQuZXh0ZW5kKFBsdWdpbi5wcm90b3R5cGUsIHBsdWdpbi5tZXRob2RzKTtcblxuICAgICQuZm5bcGx1Z2luLm5hbWVdID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBhcmdzID0gQVAuc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgICAgICwgbWV0aG9kQXJyYXkgPSB0eXBlb2YgYXJnc1swXSA9PSAnc3RyaW5nJyAmJiBhcmdzWzBdLnNwbGl0KCc6JylcbiAgICAgICAgLCBtZXRob2QgPSBtZXRob2RBcnJheVttZXRob2RBcnJheS5sZW5ndGggPiAxID8gMSA6IDBdXG4gICAgICAgICwgcHJlZml4ID0gbWV0aG9kQXJyYXkubGVuZ3RoID4gMSAmJiBtZXRob2RBcnJheVswXVxuICAgICAgICAsIG9wdHMgPSB0eXBlb2YgYXJnc1swXSA9PSAnb2JqZWN0JyAmJiBhcmdzWzBdXG4gICAgICAgICwgcGFyYW1zID0gYXJncy5zbGljZSgxKVxuICAgICAgICAsIHJldDtcblxuICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICBtZXRob2QgPSBwcmVmaXggKyBtZXRob2Quc3Vic3RyKDAsMSkudG9VcHBlckNhc2UoKSArIG1ldGhvZC5zdWJzdHIoMSxtZXRob2QubGVuZ3RoLTEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlID0gJC5kYXRhKHRoaXMsIHBsdWdpbi5uYW1lKTtcblxuICAgICAgICAvLyBNZXRob2RcbiAgICAgICAgaWYgKGluc3RhbmNlKSB7XG4gICAgICAgICAgcmV0dXJuIHJldCA9IGluc3RhbmNlW3BsdWdpbi5uYW1lXS5hcHBseShpbnN0YW5jZSwgW21ldGhvZF0uY29uY2F0KHBhcmFtcykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5pdFxuICAgICAgICByZXR1cm4gJC5kYXRhKHRoaXMsIHBsdWdpbi5uYW1lLCBuZXcgUGx1Z2luKHRoaXMsIG9wdHMpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcHJlZml4ID8gcmV0IDogdGhpcztcbiAgICB9O1xuICB9O1xuXG59KCkpO1xuIiwiLyoqXG4gKiBQcml2YXRlIG1ldGhvZHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy4kZm9ybSA9ICQodGhpcy5lbCk7XG4gICAgdGhpcy4kZmllbGRzID0gJCgpO1xuICAgIHRoaXMuJGlucHV0cyA9ICQoKTtcblxuICAgIHRoaXMuX2V4dGVuZCgkLmlkZWFsZm9ybXMuZXh0ZW5zaW9ucyk7XG4gICAgdGhpcy5faTE4bigpO1xuXG4gICAgdGhpcy5faW5qZWN0KCdfaW5pdCcpO1xuXG4gICAgdGhpcy5fYWRkTWFya3VwUnVsZXMoKTtcbiAgICB0aGlzLmFkZFJ1bGVzKHRoaXMub3B0cy5ydWxlcyB8fCB7fSk7XG5cbiAgICB0aGlzLiRmb3JtLnN1Ym1pdChmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl92YWxpZGF0ZUFsbCgpO1xuICAgICAgc2VsZi5mb2N1c0ZpcnN0SW52YWxpZCgpO1xuICAgICAgc2VsZi5vcHRzLm9uU3VibWl0LmNhbGwoc2VsZiwgc2VsZi5nZXRJbnZhbGlkKCkubGVuZ3RoLCBlKTtcbiAgICB9KTtcblxuICAgIGlmICghIHRoaXMub3B0cy5zaWxlbnRMb2FkKSB7XG4gICAgICAvLyAxbXMgdGltZW91dCB0byBtYWtlIHN1cmUgZXJyb3Igc2hvd3MgdXBcbiAgICAgIHNldFRpbWVvdXQoJC5wcm94eSh0aGlzLmZvY3VzRmlyc3RJbnZhbGlkLCB0aGlzKSwgMSk7XG4gICAgfVxuICB9LFxuXG4gIF9hZGRNYXJrdXBSdWxlczogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcnVsZXMgPSB7fTtcblxuICAgIHRoaXMuJGZvcm0uZmluZCgnaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJ1bGUgPSAkKHRoaXMpLmRhdGEoJ2lkZWFsZm9ybXMtcnVsZXMnKTtcbiAgICAgIGlmIChydWxlICYmICEgcnVsZXNbdGhpcy5uYW1lXSkgcnVsZXNbdGhpcy5uYW1lXSA9IHJ1bGU7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZFJ1bGVzKHJ1bGVzKTtcbiAgfSxcblxuICBfaTE4bjogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAkLmVhY2goJC5pZGVhbGZvcm1zLmkxOG4sIGZ1bmN0aW9uKGxvY2FsZSwgbGFuZykge1xuXG4gICAgICB2YXIgZXJyb3JzID0gbGFuZy5lcnJvcnNcbiAgICAgICAgLCBvcHRpb25zID0ge307XG5cbiAgICAgIGRlbGV0ZSBsYW5nLmVycm9ycztcblxuICAgICAgZm9yICh2YXIgZXh0IGluIGxhbmcpIG9wdGlvbnNbZXh0XSA9IHsgaTE4bjogbGFuZ1tleHRdIH07XG5cbiAgICAgICQuZXh0ZW5kKCQuaWRlYWxmb3Jtcy5lcnJvcnMsIGVycm9ycyk7XG4gICAgICAkLmV4dGVuZCh0cnVlLCBzZWxmLm9wdHMsIG9wdGlvbnMpO1xuICAgIH0pO1xuICB9LFxuXG4gIF9idWlsZEZpZWxkOiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLCAkaWNvbjtcblxuICAgICRpY29uID0gJCh0aGlzLm9wdHMuaWNvbkh0bWwsIHtcbiAgICAgIGNsYXNzOiB0aGlzLm9wdHMuaWNvbkNsYXNzLFxuICAgICAgY2xpY2s6IGZ1bmN0aW9uKCl7ICQoaW5wdXQpLmZvY3VzKCkgfVxuICAgIH0pO1xuXG4gICAgaWYgKCEgdGhpcy4kZmllbGRzLmZpbHRlcigkZmllbGQpLmxlbmd0aCkge1xuICAgICAgdGhpcy4kZmllbGRzID0gdGhpcy4kZmllbGRzLmFkZCgkZmllbGQpO1xuICAgICAgaWYgKHRoaXMub3B0cy5pY29uSHRtbCkgJGZpZWxkLmFwcGVuZCgkaWNvbik7XG4gICAgICAkZmllbGQuYWRkQ2xhc3MoJ2lkZWFsZm9ybXMtZmllbGQgaWRlYWxmb3Jtcy1maWVsZC0nKyBpbnB1dC50eXBlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hZGRFdmVudHMoaW5wdXQpO1xuXG4gICAgdGhpcy5faW5qZWN0KCdfYnVpbGRGaWVsZCcsIGlucHV0KTtcbiAgfSxcblxuICBfYWRkRXZlbnRzOiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KTtcblxuICAgICQoaW5wdXQpXG4gICAgICAub24oJ2NoYW5nZSBrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUud2hpY2ggPT0gOSB8fCBlLndoaWNoID09IDE2KSByZXR1cm47XG4gICAgICAgIHNlbGYuX3ZhbGlkYXRlKHRoaXMsIHRydWUsIHRydWUpO1xuICAgICAgfSlcbiAgICAgIC5mb2N1cyhmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCEgc2VsZi5pc1ZhbGlkKHRoaXMubmFtZSkpIHtcbiAgICAgICAgICAkZmllbGQuZmluZChzZWxmLm9wdHMuZXJyb3IpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5ibHVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAkZmllbGQuZmluZChzZWxmLm9wdHMuZXJyb3IpLmhpZGUoKTtcbiAgICAgIH0pO1xuICB9LFxuXG4gIF9pc1JlcXVpcmVkOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIC8vIFdlIGFzc3VtZSBub24tdGV4dCBpbnB1dHMgd2l0aCBydWxlcyBhcmUgcmVxdWlyZWRcbiAgICBpZiAoJChpbnB1dCkuaXMoJzpjaGVja2JveCwgOnJhZGlvLCBzZWxlY3QnKSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIHRoaXMub3B0cy5ydWxlc1tpbnB1dC5uYW1lXS5pbmRleE9mKCdyZXF1aXJlZCcpID4gLTE7XG4gIH0sXG5cbiAgX2dldFJlbGF0ZWQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEZpZWxkKGlucHV0KS5maW5kKCdbbmFtZT1cIicrIGlucHV0Lm5hbWUgKydcIl0nKTtcbiAgfSxcblxuICBfZ2V0RmllbGQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgcmV0dXJuICQoaW5wdXQpLmNsb3Nlc3QodGhpcy5vcHRzLmZpZWxkKTtcbiAgfSxcblxuICBfZ2V0Rmlyc3RJbnZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRJbnZhbGlkKCkuZmlyc3QoKS5maW5kKCdpbnB1dDpmaXJzdCwgdGV4dGFyZWEsIHNlbGVjdCcpO1xuICB9LFxuXG4gIF9oYW5kbGVFcnJvcjogZnVuY3Rpb24oaW5wdXQsIGVycm9yLCB2YWxpZCkge1xuICAgIHZhbGlkID0gdmFsaWQgfHwgdGhpcy5pc1ZhbGlkKGlucHV0Lm5hbWUpO1xuICAgIHZhciAkZXJyb3IgPSB0aGlzLl9nZXRGaWVsZChpbnB1dCkuZmluZCh0aGlzLm9wdHMuZXJyb3IpO1xuICAgIHRoaXMuJGZvcm0uZmluZCh0aGlzLm9wdHMuZXJyb3IpLmhpZGUoKTtcbiAgICBpZiAoZXJyb3IpICRlcnJvci50ZXh0KGVycm9yKTtcbiAgICAkZXJyb3IudG9nZ2xlKCF2YWxpZCk7XG4gIH0sXG5cbiAgX2hhbmRsZVN0eWxlOiBmdW5jdGlvbihpbnB1dCwgdmFsaWQpIHtcbiAgICB2YWxpZCA9IHZhbGlkIHx8IHRoaXMuaXNWYWxpZChpbnB1dC5uYW1lKTtcbiAgICB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLm9wdHMudmFsaWRDbGFzcyArJyAnKyB0aGlzLm9wdHMuaW52YWxpZENsYXNzKVxuICAgICAgLmFkZENsYXNzKHZhbGlkID8gdGhpcy5vcHRzLnZhbGlkQ2xhc3MgOiB0aGlzLm9wdHMuaW52YWxpZENsYXNzKVxuICAgICAgLmZpbmQoJy4nKyB0aGlzLm9wdHMuaWNvbkNsYXNzKS5zaG93KCk7XG4gIH0sXG5cbiAgX2ZyZXNoOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0cy52YWxpZENsYXNzICsnICcrIHRoaXMub3B0cy5pbnZhbGlkQ2xhc3MpXG4gICAgICAuZmluZCh0aGlzLm9wdHMuZXJyb3IpLmhpZGUoKVxuICAgICAgLmVuZCgpXG4gICAgICAuZmluZCgnLicrIHRoaXMub3B0cy5pY29uQ2xhc3MpLnRvZ2dsZSh0aGlzLl9pc1JlcXVpcmVkKGlucHV0KSk7XG4gIH0sXG5cbiAgX3ZhbGlkYXRlOiBmdW5jdGlvbihpbnB1dCwgaGFuZGxlRXJyb3IsIGhhbmRsZVN0eWxlKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAsIHVzZXJSdWxlcyA9IHRoaXMub3B0cy5ydWxlc1tpbnB1dC5uYW1lXS5zcGxpdCgkLmlkZWFsZm9ybXMucnVsZVNlcGFyYXRvcilcbiAgICAgICwgb2xkVmFsdWUgPSAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWx1ZScpXG4gICAgICAsIHZhbGlkID0gdHJ1ZVxuICAgICAgLCBydWxlO1xuXG4gICAgLy8gRG9uJ3QgdmFsaWRhdGUgaW5wdXQgaWYgdmFsdWUgaGFzbid0IGNoYW5nZWRcbiAgICBpZiAoISAkKGlucHV0KS5pcygnOmNoZWNrYm94LCA6cmFkaW8nKSAmJiBvbGRWYWx1ZSA9PSBpbnB1dC52YWx1ZSkge1xuICAgICAgcmV0dXJuICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJyk7XG4gICAgfVxuXG4gICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsdWUnLCBpbnB1dC52YWx1ZSk7XG5cbiAgICAvLyBOb24tcmVxdWlyZWQgaW5wdXQgd2l0aCBlbXB0eSB2YWx1ZSBtdXN0IHBhc3MgdmFsaWRhdGlvblxuICAgIGlmICghIGlucHV0LnZhbHVlICYmICEgdGhpcy5faXNSZXF1aXJlZChpbnB1dCkpIHtcbiAgICAgICRmaWVsZC5yZW1vdmVEYXRhKCdpZGVhbGZvcm1zLXZhbGlkJyk7XG4gICAgICB0aGlzLl9mcmVzaChpbnB1dCk7XG5cbiAgICAvLyBJbnB1dHMgd2l0aCB2YWx1ZSBvciByZXF1aXJlZFxuICAgIH0gZWxzZSB7XG5cbiAgICAgICQuZWFjaCh1c2VyUnVsZXMsIGZ1bmN0aW9uKGksIHVzZXJSdWxlKSB7XG5cbiAgICAgICAgdXNlclJ1bGUgPSB1c2VyUnVsZS5zcGxpdCgkLmlkZWFsZm9ybXMuYXJnU2VwYXJhdG9yKTtcblxuICAgICAgICBydWxlID0gdXNlclJ1bGVbMF07XG5cbiAgICAgICAgdmFyIHRoZVJ1bGUgPSAkLmlkZWFsZm9ybXMucnVsZXNbcnVsZV1cbiAgICAgICAgICAsIGFyZ3MgPSB1c2VyUnVsZS5zbGljZSgxKVxuICAgICAgICAgICwgZXJyb3I7XG5cbiAgICAgICAgZXJyb3IgPSAkLmlkZWFsZm9ybXMuX2Zvcm1hdC5hcHBseShudWxsLCBbXG4gICAgICAgICAgJC5pZGVhbGZvcm1zLl9nZXRLZXkoJ2Vycm9ycy4nKyBpbnB1dC5uYW1lICsnLicrIHJ1bGUsIHNlbGYub3B0cykgfHxcbiAgICAgICAgICAkLmlkZWFsZm9ybXMuZXJyb3JzW3J1bGVdXG4gICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcblxuICAgICAgICB2YWxpZCA9IHR5cGVvZiB0aGVSdWxlID09ICdmdW5jdGlvbidcbiAgICAgICAgICA/IHRoZVJ1bGUuYXBwbHkoc2VsZiwgW2lucHV0LCBpbnB1dC52YWx1ZV0uY29uY2F0KGFyZ3MpKVxuICAgICAgICAgIDogdGhlUnVsZS50ZXN0KGlucHV0LnZhbHVlKTtcblxuICAgICAgICAkZmllbGQuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcsIHZhbGlkKTtcblxuICAgICAgICBpZiAoaGFuZGxlRXJyb3IpIHNlbGYuX2hhbmRsZUVycm9yKGlucHV0LCBlcnJvciwgdmFsaWQpO1xuICAgICAgICBpZiAoaGFuZGxlU3R5bGUpIHNlbGYuX2hhbmRsZVN0eWxlKGlucHV0LCB2YWxpZCk7XG5cbiAgICAgICAgc2VsZi5vcHRzLm9uVmFsaWRhdGUuY2FsbChzZWxmLCBpbnB1dCwgcnVsZSwgdmFsaWQpO1xuXG4gICAgICAgIHJldHVybiB2YWxpZDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuX2luamVjdCgnX3ZhbGlkYXRlJywgaW5wdXQsIHJ1bGUsIHZhbGlkKTtcblxuICAgIHJldHVybiB2YWxpZDtcbiAgfSxcblxuICBfdmFsaWRhdGVBbGw6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLiRpbnB1dHMuZWFjaChmdW5jdGlvbigpeyBzZWxmLl92YWxpZGF0ZSh0aGlzLCB0cnVlKTsgfSk7XG4gIH1cbn07XG4iLCIvKipcbiAqIFB1YmxpYyBtZXRob2RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFkZFJ1bGVzOiBmdW5jdGlvbihydWxlcykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyICRpbnB1dHMgPSB0aGlzLiRmb3JtLmZpbmQoJC5tYXAocnVsZXMsIGZ1bmN0aW9uKF8sIG5hbWUpIHtcbiAgICAgIHJldHVybiAnW25hbWU9XCInKyBuYW1lICsnXCJdJztcbiAgICB9KS5qb2luKCcsJykpO1xuXG4gICAgJC5leHRlbmQodGhpcy5vcHRzLnJ1bGVzLCBydWxlcyk7XG5cbiAgICAkaW5wdXRzLmVhY2goZnVuY3Rpb24oKXsgc2VsZi5fYnVpbGRGaWVsZCh0aGlzKSB9KTtcbiAgICB0aGlzLiRpbnB1dHMgPSB0aGlzLiRpbnB1dHMuYWRkKCRpbnB1dHMpO1xuXG4gICAgdGhpcy5fdmFsaWRhdGVBbGwoKTtcbiAgICB0aGlzLiRmaWVsZHMuZmluZCh0aGlzLm9wdHMuZXJyb3IpLmhpZGUoKTtcblxuICAgIHRoaXMuX2luamVjdCgnYWRkUnVsZXMnKTtcbiAgfSxcblxuICBnZXRJbnZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kZmllbGRzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkKHRoaXMpLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnKSA9PT0gZmFsc2U7XG4gICAgfSk7XG4gIH0sXG5cbiAgZm9jdXNGaXJzdEludmFsaWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGZpcnN0SW52YWxpZCA9IHRoaXMuX2dldEZpcnN0SW52YWxpZCgpWzBdO1xuXG4gICAgaWYgKGZpcnN0SW52YWxpZCkge1xuICAgICAgdGhpcy5faGFuZGxlRXJyb3IoZmlyc3RJbnZhbGlkKTtcbiAgICAgIHRoaXMuX2hhbmRsZVN0eWxlKGZpcnN0SW52YWxpZCk7XG4gICAgICB0aGlzLl9pbmplY3QoJ2ZvY3VzRmlyc3RJbnZhbGlkJywgZmlyc3RJbnZhbGlkKTtcbiAgICAgICQoZmlyc3RJbnZhbGlkKS5mb2N1cygpO1xuICAgIH1cbiAgfSxcblxuICBpc1ZhbGlkOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKG5hbWUpIHJldHVybiAhIHRoaXMuZ2V0SW52YWxpZCgpLmZpbmQoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpLmxlbmd0aDtcbiAgICByZXR1cm4gISB0aGlzLmdldEludmFsaWQoKS5sZW5ndGg7XG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uKG5hbWUpIHtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCAkaW5wdXRzID0gdGhpcy4kaW5wdXRzO1xuXG4gICAgaWYgKG5hbWUpICRpbnB1dHMgPSAkaW5wdXRzLmZpbHRlcignW25hbWU9XCInKyBuYW1lICsnXCJdJyk7XG5cbiAgICAkaW5wdXRzLmZpbHRlcignaW5wdXQ6bm90KDpjaGVja2JveCwgOnJhZGlvKScpLnZhbCgnJyk7XG4gICAgJGlucHV0cy5maWx0ZXIoJzpjaGVja2JveCwgOnJhZGlvJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAkaW5wdXRzLmZpbHRlcignc2VsZWN0JykuZmluZCgnb3B0aW9uJykucHJvcCgnc2VsZWN0ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmF1bHRTZWxlY3RlZDtcbiAgICB9KTtcblxuICAgICRpbnB1dHMuY2hhbmdlKCkuZWFjaChmdW5jdGlvbigpeyBzZWxmLl9mcmVzaCh0aGlzKSB9KTtcblxuICAgIHRoaXMuX2luamVjdCgncmVzZXQnLCBuYW1lKTtcbiAgfVxuXG59O1xuIiwiLyoqXG4gKiBSdWxlc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICByZXF1aXJlZDogLy4rLyxcbiAgZGlnaXRzOiAvXlxcZCskLyxcbiAgZW1haWw6IC9eW15AXStAW15AXStcXC4uezIsNn0kLyxcbiAgdXNlcm5hbWU6IC9eW2Etel0oPz1bXFx3Ll17MywzMX0kKVxcdypcXC4/XFx3KiQvaSxcbiAgcGFzczogLyg/PS4qXFxkKSg/PS4qW2Etel0pKD89LipbQS1aXSkuezYsfS8sXG4gIHN0cm9uZ3Bhc3M6IC8oPz1eLns4LH0kKSgoPz0uKlxcZCl8KD89LipcXFcrKSkoPyFbLlxcbl0pKD89LipbQS1aXSkoPz0uKlthLXpdKS4qJC8sXG4gIHBob25lOiAvXlsyLTldXFxkezJ9LVxcZHszfS1cXGR7NH0kLyxcbiAgemlwOiAvXlxcZHs1fSR8XlxcZHs1fS1cXGR7NH0kLyxcbiAgdXJsOiAvXig/OihmdHB8aHR0cHxodHRwcyk6XFwvXFwvKT8oPzpbXFx3XFwtXStcXC4pK1thLXpdezIsNn0oW1xcOlxcLz8jXS4qKT8kL2ksXG5cbiAgbnVtYmVyOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUpIHtcbiAgICByZXR1cm4gIWlzTmFOKHZhbHVlKTtcbiAgfSxcblxuICByYW5nZTogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaXgsIG1heCkge1xuICAgIHJldHVybiBOdW1iZXIodmFsdWUpID49IG1pbiAmJiBOdW1iZXIodmFsdWUpIDw9IG1heDtcbiAgfSxcblxuICBtaW46IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWluKSB7XG4gICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA+PSBtaW47XG4gIH0sXG5cbiAgbWF4OiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1heCkge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPD0gbWF4O1xuICB9LFxuXG4gIG1pbm9wdGlvbjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaW4pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0UmVsYXRlZChpbnB1dCkuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCA+PSBtaW47XG4gIH0sXG5cbiAgbWF4b3B0aW9uOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1heCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRSZWxhdGVkKGlucHV0KS5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoIDw9IG1heDtcbiAgfSxcblxuICBtaW5tYXg6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWluLCBtYXgpIHtcbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoID49IG1pbiAmJiB2YWx1ZS5sZW5ndGggPD0gbWF4O1xuICB9LFxuXG4gIHNlbGVjdDogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBkZWYpIHtcbiAgICByZXR1cm4gdmFsdWUgIT0gZGVmO1xuICB9LFxuXG4gIGV4dGVuc2lvbjogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgIHZhciBleHRlbnNpb25zID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgICAsIHZhbGlkID0gZmFsc2U7XG5cbiAgICAkLmVhY2goaW5wdXQuZmlsZXMgfHwgW3tuYW1lOiBpbnB1dC52YWx1ZX1dLCBmdW5jdGlvbihpLCBmaWxlKSB7XG4gICAgICB2YWxpZCA9ICQuaW5BcnJheShmaWxlLm5hbWUuc3BsaXQoJy4nKS5wb3AoKS50b0xvd2VyQ2FzZSgpLCBleHRlbnNpb25zKSA+IC0xO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9LFxuXG4gIGVxdWFsdG86IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgdGFyZ2V0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJHRhcmdldCA9ICQoJ1tuYW1lPVwiJysgdGFyZ2V0ICsnXCJdJyk7XG5cbiAgICBpZiAodGhpcy5nZXRJbnZhbGlkKCkuZmluZCgkdGFyZ2V0KS5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAgICR0YXJnZXQub2ZmKCdrZXl1cC5lcXVhbHRvJykub24oJ2tleXVwLmVxdWFsdG8nLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuX2dldEZpZWxkKGlucHV0KS5yZW1vdmVEYXRhKCdpZGVhbGZvcm1zLXZhbHVlJyk7XG4gICAgICBzZWxmLl92YWxpZGF0ZShpbnB1dCwgZmFsc2UsIHRydWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGlucHV0LnZhbHVlID09ICR0YXJnZXQudmFsKCk7XG4gIH0sXG5cbiAgZGF0ZTogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBmb3JtYXQpIHtcblxuICAgIGZvcm1hdCA9IGZvcm1hdCB8fCAnbW0vZGQveXl5eSc7XG5cbiAgICB2YXIgZGVsaW1pdGVyID0gL1tebWR5XS8uZXhlYyhmb3JtYXQpWzBdXG4gICAgICAsIHRoZUZvcm1hdCA9IGZvcm1hdC5zcGxpdChkZWxpbWl0ZXIpXG4gICAgICAsIHRoZURhdGUgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuXG4gICAgZnVuY3Rpb24gaXNEYXRlKGRhdGUsIGZvcm1hdCkge1xuXG4gICAgICB2YXIgbSwgZCwgeTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZvcm1hdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoL20vLnRlc3QoZm9ybWF0W2ldKSkgbSA9IGRhdGVbaV07XG4gICAgICAgIGlmICgvZC8udGVzdChmb3JtYXRbaV0pKSBkID0gZGF0ZVtpXTtcbiAgICAgICAgaWYgKC95Ly50ZXN0KGZvcm1hdFtpXSkpIHkgPSBkYXRlW2ldO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW0gfHwgIWQgfHwgIXkpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIG0gPiAwICYmIG0gPCAxMyAmJlxuICAgICAgICB5ICYmIHkubGVuZ3RoID09IDQgJiZcbiAgICAgICAgZCA+IDAgJiYgZCA8PSAobmV3IERhdGUoeSwgbSwgMCkpLmdldERhdGUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXNEYXRlKHRoZURhdGUsIHRoZUZvcm1hdCk7XG4gIH1cblxufTtcbiJdfQ==
;