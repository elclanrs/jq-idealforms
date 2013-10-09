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
        return 'Step '+ (i+1);
      },
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
      self.opts.onSubmit.call(self, self.getInvalid().length, e);
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
      valid = $.inArray(file.name.split('.').pop().toLowerCase(), extensions) > -1;
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2Vycm9ycy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9hZGFwdGl2ZS9hZGFwdGl2ZS5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvYWpheC9hamF4LmV4dC5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2N1c3RvbS1pbnB1dHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxmaWxlLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2N1c3RvbS1pbnB1dHMvaWRlYWxyYWRpb2NoZWNrLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL2RhdGVwaWNrZXIvZGF0ZXBpY2tlci5leHQuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvZHluYW1pYy1maWVsZHMvZHluYW1pYy1maWVsZHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9leHRlbnNpb25zL3N0ZXBzL2lkZWFsc3RlcHMuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL2V4dGVuc2lvbnMvc3RlcHMvc3RlcHMuZXh0LmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9tYWluLmpzIiwiL3Zhci93d3cvanEtaWRlYWxmb3Jtcy9qcy9wbHVnaW4uanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3ByaXZhdGUuanMiLCIvdmFyL3d3dy9qcS1pZGVhbGZvcm1zL2pzL3B1YmxpYy5qcyIsIi92YXIvd3d3L2pxLWlkZWFsZm9ybXMvanMvcnVsZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEVycm9yc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICByZXF1aXJlZDogJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQnLFxuICBkaWdpdHM6ICdNdXN0IGJlIG9ubHkgZGlnaXRzJyxcbiAgbmFtZTogJ011c3QgYmUgYXQgbGVhc3QgMyBjaGFyYWN0ZXJzIGxvbmcgYW5kIG11c3Qgb25seSBjb250YWluIGxldHRlcnMnLFxuICBlbWFpbDogJ011c3QgYmUgYSB2YWxpZCBlbWFpbCcsXG4gIHVzZXJuYW1lOiAnTXVzdCBiZSBhdCBiZXR3ZWVuIDQgYW5kIDMyIGNoYXJhY3RlcnMgbG9uZyBhbmQgc3RhcnQgd2l0aCBhIGxldHRlci4gWW91IG1heSB1c2UgbGV0dGVycywgbnVtYmVycywgdW5kZXJzY29yZXMsIGFuZCBvbmUgZG90JyxcbiAgcGFzczogJ011c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzIGxvbmcsIGFuZCBjb250YWluIGF0IGxlYXN0IG9uZSBudW1iZXIsIG9uZSB1cHBlcmNhc2UgYW5kIG9uZSBsb3dlcmNhc2UgbGV0dGVyJyxcbiAgc3Ryb25ncGFzczogJ011c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmcgYW5kIGNvbnRhaW4gYXQgbGVhc3Qgb25lIHVwcGVyY2FzZSBhbmQgb25lIGxvd2VyY2FzZSBsZXR0ZXIgYW5kIG9uZSBudW1iZXIgb3Igc3BlY2lhbCBjaGFyYWN0ZXInLFxuICBwaG9uZTogJ011c3QgYmUgYSB2YWxpZCBwaG9uZSBudW1iZXInLFxuICB6aXA6ICdNdXN0IGJlIGEgdmFsaWQgemlwIGNvZGUnLFxuICB1cmw6ICdNdXN0IGJlIGEgdmFsaWQgVVJMJyxcbiAgbnVtYmVyOiAnTXVzdCBiZSBhIG51bWJlcicsXG4gIHJhbmdlOiAnTXVzdCBiZSBhIG51bWJlciBiZXR3ZWVuIHswfSBhbmQgezF9JyxcbiAgbWluOiAnTXVzdCBiZSBhdCBsZWFzdCB7MH0gY2hhcmFjdGVycyBsb25nJyxcbiAgbWF4OiAnTXVzdCBiZSB1bmRlciB7MH0gY2hhcmFjdGVycycsXG4gIG1pbm9wdGlvbjogJ1NlbGVjdCBhdCBsZWFzdCB7MH0gb3B0aW9ucycsXG4gIG1heG9wdGlvbjogJ1NlbGVjdCBubyBtb3JlIHRoYW4gezB9IG9wdGlvbnMnLFxuICBtaW5tYXg6ICdNdXN0IGJlIGJldHdlZW4gezB9IGFuZCB7MX0gY2hhcmFjdGVycyBsb25nJyxcbiAgc2VsZWN0OiAnU2VsZWN0IGFuIG9wdGlvbicsXG4gIGV4dGVuc2lvbjogJ0ZpbGUocykgbXVzdCBoYXZlIGEgdmFsaWQgZXh0ZW5zaW9uICh7Kn0pJyxcbiAgZXF1YWx0bzogJ011c3QgaGF2ZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgXCJ7MH1cIiBmaWVsZCcsXG4gIGRhdGU6ICdNdXN0IGJlIGEgdmFsaWQgZGF0ZSB7MH0nXG5cbn07XG4iLCIvKipcbiAqIEFkYXB0aXZlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdhZGFwdGl2ZScsXG5cbiAgb3B0aW9uczoge1xuICAgIGFkYXB0aXZlV2lkdGg6ICQoJzxwIGNsYXNzPVwiaWRlYWxmb3Jtcy1maWVsZC13aWR0aFwiLz4nKS5hcHBlbmRUbygnYm9keScpLmNzcygnd2lkdGgnKS5yZXBsYWNlKCdweCcsJycpXG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgZnVuY3Rpb24gYWRhcHQoKSB7XG5cbiAgICAgICAgdmFyIGZvcm1XaWR0aCA9IHNlbGYuJGZvcm0ub3V0ZXJXaWR0aCgpXG4gICAgICAgICAgLCBpc0FkYXB0aXZlID0gc2VsZi5vcHRzLmFkYXB0aXZlV2lkdGggPiBmb3JtV2lkdGg7XG5cbiAgICAgICAgc2VsZi4kZm9ybS50b2dnbGVDbGFzcygnYWRhcHRpdmUnLCBpc0FkYXB0aXZlKTtcblxuICAgICAgICBpZiAoc2VsZi5faGFzRXh0ZW5zaW9uKCdzdGVwcycpKSB7XG4gICAgICAgICAgc2VsZi4kc3RlcHNDb250YWluZXIudG9nZ2xlQ2xhc3MoJ2FkYXB0aXZlJywgaXNBZGFwdGl2ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAkKCcjdWktZGF0ZXBpY2tlci1kaXYnKS5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgICQod2luZG93KS5yZXNpemUoYWRhcHQpO1xuICAgICAgYWRhcHQoKTtcblxuICAgICAgdGhpcy4kZm9ybS5maW5kKCdzZWxlY3QsIC5kYXRlcGlja2VyJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5fZ2V0RmllbGQodGhpcykuZmluZChzZWxmLm9wdHMuZXJyb3IpLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgIH0pO1xuXG4gICAgICAkKCdwLmlkZWFsZm9ybXMtZmllbGQtd2lkdGgnKS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdhamF4JyxcblxuICBtZXRob2RzOiB7XG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAkLmV4dGVuZCgkLmlkZWFsZm9ybXMsIHsgX3JlcXVlc3RzOiB7fSB9KTtcblxuICAgICAgJC5leHRlbmQoJC5pZGVhbGZvcm1zLmVycm9ycywge1xuICAgICAgICBhamF4OiAnTG9hZGluZy4uLidcbiAgICAgIH0pO1xuXG4gICAgICAkLmV4dGVuZCgkLmlkZWFsZm9ybXMucnVsZXMsIHtcblxuICAgICAgICBhamF4OiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICAsICRmaWVsZCA9IHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgICAgICAgLCB1cmwgPSAkKGlucHV0KS5kYXRhKCdpZGVhbGZvcm1zLWFqYXgnKVxuICAgICAgICAgICAgLCB1c2VyRXJyb3IgPSAkLmlkZWFsZm9ybXMuX2dldEtleSgnZXJyb3JzLicrIGlucHV0Lm5hbWUgKycuYWpheEVycm9yJywgc2VsZi5vcHRzKVxuICAgICAgICAgICAgLCByZXF1ZXN0cyA9ICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNcbiAgICAgICAgICAgICwgZGF0YSA9IHt9O1xuXG4gICAgICAgICAgZGF0YVtpbnB1dC5uYW1lXSA9IGlucHV0LnZhbHVlO1xuXG4gICAgICAgICAgJGZpZWxkLmFkZENsYXNzKCdhamF4Jyk7XG5cbiAgICAgICAgICBpZiAocmVxdWVzdHNbaW5wdXQubmFtZV0pIHJlcXVlc3RzW2lucHV0Lm5hbWVdLmFib3J0KCk7XG5cbiAgICAgICAgICByZXF1ZXN0c1tpbnB1dC5uYW1lXSA9ICQucG9zdCh1cmwsIGRhdGEsIGZ1bmN0aW9uKHJlc3ApIHtcblxuICAgICAgICAgICAgaWYgKHJlc3AgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgc2VsZi5faGFuZGxlRXJyb3IoaW5wdXQpO1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVTdHlsZShpbnB1dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCwgdXNlckVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGZpZWxkLnJlbW92ZUNsYXNzKCdhamF4Jyk7XG5cbiAgICAgICAgICB9LCAnanNvbicpO1xuXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIF92YWxpZGF0ZTogZnVuY3Rpb24oaW5wdXQsIHJ1bGUpIHtcbiAgICAgIGlmIChydWxlICE9ICdhamF4JyAmJiAkLmlkZWFsZm9ybXMuX3JlcXVlc3RzW2lucHV0Lm5hbWVdKSB7XG4gICAgICAgICQuaWRlYWxmb3Jtcy5fcmVxdWVzdHNbaW5wdXQubmFtZV0uYWJvcnQoKTtcbiAgICAgICAgdGhpcy5fZ2V0RmllbGQoaW5wdXQpLnJlbW92ZUNsYXNzKCdhamF4Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbn07XG4iLCJyZXF1aXJlKCcuL2lkZWFsZmlsZScpO1xucmVxdWlyZSgnLi9pZGVhbHJhZGlvY2hlY2snKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2N1c3RvbUlucHV0cycsXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkQ3VzdG9tSW5wdXRzKCk7XG4gICAgfSxcblxuICAgIGFkZEZpZWxkczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9idWlsZEN1c3RvbUlucHV0cygpO1xuICAgIH0sXG5cbiAgICBfYnVpbGRDdXN0b21JbnB1dHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kZm9ybS5maW5kKCc6ZmlsZScpLmlkZWFsZmlsZSgpO1xuICAgICAgdGhpcy4kZm9ybS5maW5kKCc6Y2hlY2tib3gsIDpyYWRpbycpLmlkZWFscmFkaW9jaGVjaygpO1xuICAgIH1cblxuICB9XG59O1xuIiwiLyoqXG4gKiBJZGVhbCBGaWxlXG4gKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgLy8gQnJvd3NlciBzdXBwb3J0cyBIVE1MNSBtdWx0aXBsZSBmaWxlP1xuICB2YXIgbXVsdGlwbGVTdXBwb3J0ID0gdHlwZW9mICQoJzxpbnB1dC8+JylbMF0ubXVsdGlwbGUgIT09ICd1bmRlZmluZWQnXG4gICAgLCBpc0lFID0gL21zaWUvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgLCBwbHVnaW4gPSB7fTtcblxuICBwbHVnaW4ubmFtZSA9ICdpZGVhbGZpbGUnO1xuXG4gIHBsdWdpbi5tZXRob2RzID0ge1xuXG4gICAgX2luaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgJGZpbGUgPSAkKHRoaXMuZWwpLmFkZENsYXNzKCdpZGVhbC1maWxlJykgLy8gdGhlIG9yaWdpbmFsIGZpbGUgaW5wdXRcbiAgICAgICAgLCAkd3JhcCA9ICQoJzxkaXYgY2xhc3M9XCJpZGVhbC1maWxlLXdyYXBcIj4nKVxuICAgICAgICAsICRpbnB1dCA9ICQoJzxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiaWRlYWwtZmlsZS1maWxlbmFtZVwiIC8+JylcbiAgICAgICAgICAvLyBCdXR0b24gdGhhdCB3aWxsIGJlIHVzZWQgaW4gbm9uLUlFIGJyb3dzZXJzXG4gICAgICAgICwgJGJ1dHRvbiA9ICQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiaWRlYWwtZmlsZS11cGxvYWRcIj5PcGVuPC9idXR0b24+JylcbiAgICAgICAgICAvLyBIYWNrIGZvciBJRVxuICAgICAgICAsICRsYWJlbCA9ICQoJzxsYWJlbCBjbGFzcz1cImlkZWFsLWZpbGUtdXBsb2FkXCIgZm9yPVwiJyArICRmaWxlWzBdLmlkICsgJ1wiPk9wZW48L2xhYmVsPicpO1xuXG4gICAgICBpZiAoaXNJRSkgJGxhYmVsLmFkZCgkYnV0dG9uKS5hZGRDbGFzcygnaWUnKTtcblxuICAgICAgLy8gSGlkZSBieSBzaGlmdGluZyB0byB0aGUgbGVmdCBzbyB3ZVxuICAgICAgLy8gY2FuIHN0aWxsIHRyaWdnZXIgZXZlbnRzXG4gICAgICAkZmlsZS5jc3Moe1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgbGVmdDogJy05OTk5cHgnXG4gICAgICB9KTtcblxuICAgICAgJHdyYXAuYXBwZW5kKCRpbnB1dCwgKGlzSUUgPyAkbGFiZWwgOiAkYnV0dG9uKSkuaW5zZXJ0QWZ0ZXIoJGZpbGUpO1xuXG4gICAgICAvLyBQcmV2ZW50IGZvY3VzXG4gICAgICAkZmlsZS5hdHRyKCd0YWJJbmRleCcsIC0xKTtcbiAgICAgICRidXR0b24uYXR0cigndGFiSW5kZXgnLCAtMSk7XG5cbiAgICAgICRidXR0b24uY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAkZmlsZS5mb2N1cygpLmNsaWNrKCk7IC8vIE9wZW4gZGlhbG9nXG4gICAgICB9KTtcblxuICAgICAgJGZpbGUuY2hhbmdlKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgZmlsZXMgPSBbXVxuICAgICAgICAgICwgZmlsZUFyciwgZmlsZW5hbWU7XG5cbiAgICAgICAgICAvLyBJZiBtdWx0aXBsZSBpcyBzdXBwb3J0ZWQgdGhlbiBleHRyYWN0XG4gICAgICAgICAgLy8gYWxsIGZpbGVuYW1lcyBmcm9tIHRoZSBmaWxlIGFycmF5XG4gICAgICAgIGlmIChtdWx0aXBsZVN1cHBvcnQpIHtcbiAgICAgICAgICBmaWxlQXJyID0gJGZpbGVbMF0uZmlsZXM7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGZpbGVBcnIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZUFycltpXS5uYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZmlsZW5hbWUgPSBmaWxlcy5qb2luKCcsICcpO1xuXG4gICAgICAgICAgLy8gSWYgbm90IHN1cHBvcnRlZCB0aGVuIGp1c3QgdGFrZSB0aGUgdmFsdWVcbiAgICAgICAgICAvLyBhbmQgcmVtb3ZlIHRoZSBwYXRoIHRvIGp1c3Qgc2hvdyB0aGUgZmlsZW5hbWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaWxlbmFtZSA9ICRmaWxlLnZhbCgpLnNwbGl0KCdcXFxcJykucG9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICAkaW5wdXQgLnZhbChmaWxlbmFtZSkuYXR0cigndGl0bGUnLCBmaWxlbmFtZSk7XG5cbiAgICAgIH0pO1xuXG4gICAgICAkaW5wdXQub24oe1xuICAgICAgICBibHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGZpbGUudHJpZ2dlcignYmx1cicpO1xuICAgICAgICB9LFxuICAgICAgICBrZXlkb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmIChlLndoaWNoID09PSAxMykgeyAvLyBFbnRlclxuICAgICAgICAgICAgaWYgKCFpc0lFKSAkZmlsZS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCdmb3JtJykub25lKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMTMpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gOCB8fCBlLndoaWNoID09PSA0NikgeyAvLyBCYWNrc3BhY2UgJiBEZWxcbiAgICAgICAgICAgIC8vIEluIElFIHRoZSB2YWx1ZSBpcyByZWFkLW9ubHlcbiAgICAgICAgICAgIC8vIHdpdGggdGhpcyB0cmljayB3ZSByZW1vdmUgdGhlIG9sZCBpbnB1dCBhbmQgYWRkXG4gICAgICAgICAgICAvLyBhIGNsZWFuIGNsb25lIHdpdGggYWxsIHRoZSBvcmlnaW5hbCBldmVudHMgYXR0YWNoZWRcbiAgICAgICAgICAgIGlmIChpc0lFKSAkZmlsZS5yZXBsYWNlV2l0aCgkZmlsZSA9ICRmaWxlLmNsb25lKHRydWUpKTtcbiAgICAgICAgICAgICRmaWxlLnZhbCgnJykudHJpZ2dlcignY2hhbmdlJyk7XG4gICAgICAgICAgICAkaW5wdXQudmFsKCcnKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGUud2hpY2ggPT09IDkpIHsgLy8gVEFCXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHsgLy8gQWxsIG90aGVyIGtleXNcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgfVxuXG4gIH07XG5cbiAgcmVxdWlyZSgnLi4vLi4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcbiIsIi8qXG4gKiBpZGVhbFJhZGlvQ2hlY2s6IGpRdWVyeSBwbGd1aW4gZm9yIGNoZWNrYm94IGFuZCByYWRpbyByZXBsYWNlbWVudFxuICogVXNhZ2U6ICQoJ2lucHV0W3R5cGU9Y2hlY2tib3hdLCBpbnB1dFt0eXBlPXJhZGlvXScpLmlkZWFsUmFkaW9DaGVjaygpXG4gKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFscmFkaW9jaGVjayc7XG5cbiAgcGx1Z2luLm1ldGhvZHMgPSB7XG5cbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciAkaW5wdXQgPSAkKHRoaXMuZWwpO1xuICAgICAgdmFyICRzcGFuID0gJCgnPHNwYW4vPicpO1xuXG4gICAgICAkc3Bhbi5hZGRDbGFzcygnaWRlYWwtJysgKCRpbnB1dC5pcygnOmNoZWNrYm94JykgPyAnY2hlY2snIDogJ3JhZGlvJykpO1xuICAgICAgJGlucHV0LmlzKCc6Y2hlY2tlZCcpICYmICRzcGFuLmFkZENsYXNzKCdjaGVja2VkJyk7IC8vIGluaXRcbiAgICAgICRzcGFuLmluc2VydEFmdGVyKCRpbnB1dCk7XG5cbiAgICAgICRpbnB1dC5wYXJlbnQoJ2xhYmVsJylcbiAgICAgICAgLmFkZENsYXNzKCdpZGVhbC1yYWRpb2NoZWNrLWxhYmVsJylcbiAgICAgICAgLmF0dHIoJ29uY2xpY2snLCAnJyk7IC8vIEZpeCBjbGlja2luZyBsYWJlbCBpbiBpT1NcblxuICAgICAgJGlucHV0LmNzcyh7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBsZWZ0OiAnLTk5OTlweCcgfSk7IC8vIGhpZGUgYnkgc2hpZnRpbmcgbGVmdFxuXG4gICAgICAvLyBFdmVudHNcbiAgICAgICRpbnB1dC5vbih7XG4gICAgICAgIGNoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRpbnB1dCA9ICQodGhpcyk7XG4gICAgICAgICAgaWYgKCAkaW5wdXQuaXMoJ2lucHV0W3R5cGU9XCJyYWRpb1wiXScpICkge1xuICAgICAgICAgICAgJGlucHV0LnBhcmVudCgpLnNpYmxpbmdzKCdsYWJlbCcpLmZpbmQoJy5pZGVhbC1yYWRpbycpLnJlbW92ZUNsYXNzKCdjaGVja2VkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgICRzcGFuLnRvZ2dsZUNsYXNzKCdjaGVja2VkJywgJGlucHV0LmlzKCc6Y2hlY2tlZCcpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9jdXM6IGZ1bmN0aW9uKCkgeyAkc3Bhbi5hZGRDbGFzcygnZm9jdXMnKSB9LFxuICAgICAgICBibHVyOiBmdW5jdGlvbigpIHsgJHNwYW4ucmVtb3ZlQ2xhc3MoJ2ZvY3VzJykgfSxcbiAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKCkgeyAkKHRoaXMpLnRyaWdnZXIoJ2ZvY3VzJykgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gIH07XG5cbiAgcmVxdWlyZSgnLi4vLi4vcGx1Z2luJykocGx1Z2luKTtcblxufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTtcblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ2RhdGVwaWNrZXInLFxuXG4gIG1ldGhvZHM6IHtcblxuICAgIC8vIEBleHRlbmRcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9idWlsZERhdGVwaWNrZXIoKTtcbiAgICB9LFxuXG4gICBfYnVpbGREYXRlcGlja2VyOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyICRkYXRlcGlja2VyID0gdGhpcy4kZm9ybS5maW5kKCdpbnB1dC5kYXRlcGlja2VyJyk7XG5cbiAgICAgIC8vIEFsd2F5cyBzaG93IGRhdGVwaWNrZXIgYmVsb3cgdGhlIGlucHV0XG4gICAgICBpZiAoalF1ZXJ5LnVpKSB7XG4gICAgICAgICQuZGF0ZXBpY2tlci5fY2hlY2tPZmZzZXQgPSBmdW5jdGlvbihhLGIsYyl7IHJldHVybiBiIH07XG4gICAgICB9XG5cbiAgICAgIGlmIChqUXVlcnkudWkgJiYgJGRhdGVwaWNrZXIubGVuZ3RoKSB7XG5cbiAgICAgICAgJGRhdGVwaWNrZXIuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAgICQodGhpcykuZGF0ZXBpY2tlcih7XG4gICAgICAgICAgICBiZWZvcmVTaG93OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICAgICAgICAkKGlucHV0KS5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2hhbmdlTW9udGhZZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgLy8gSGFjayB0byBmaXggSUU5IG5vdCByZXNpemluZ1xuICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICAgICAgICAgLCB3aWR0aCA9ICR0aGlzLm91dGVyV2lkdGgoKTsgLy8gY2FjaGUgZmlyc3QhXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0ZXBpY2tlcignd2lkZ2V0JykuY3NzKCd3aWR0aCcsIHdpZHRoKTtcbiAgICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25DbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRqdXN0IHdpZHRoXG4gICAgICAgICRkYXRlcGlja2VyLm9uKCdmb2N1cyBrZXl1cCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciB0ID0gJCh0aGlzKSwgdyA9IHQub3V0ZXJXaWR0aCgpO1xuICAgICAgICAgIHQuZGF0ZXBpY2tlcignd2lkZ2V0JykuY3NzKCd3aWR0aCcsIHcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxufTtcbiIsImZ1bmN0aW9uIHRlbXBsYXRlKGh0bWwsIGRhdGEpIHtcblxuICB2YXIgbG9vcCA9IC9cXHtAKFtefV0rKVxcfSguKz8pXFx7XFwvXFwxXFx9L2dcbiAgICAsIGxvb3BWYXJpYWJsZSA9IC9cXHsjKFtefV0rKVxcfS9nXG4gICAgLCB2YXJpYWJsZSA9IC9cXHsoW159XSspXFx9L2c7XG5cbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZShsb29wLCBmdW5jdGlvbihfLCBrZXksIGxpc3QpIHtcbiAgICAgIHJldHVybiAkLm1hcChkYXRhW2tleV0sIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGxpc3QucmVwbGFjZShsb29wVmFyaWFibGUsIGZ1bmN0aW9uKF8sIGspIHtcbiAgICAgICAgICByZXR1cm4gaXRlbVtrXTtcbiAgICAgICAgfSk7XG4gICAgICB9KS5qb2luKCcnKTtcbiAgICB9KVxuICAgIC5yZXBsYWNlKHZhcmlhYmxlLCBmdW5jdGlvbihfLCBrZXkpIHtcbiAgICAgIHJldHVybiBkYXRhW2tleV0gfHwgJyc7XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIG5hbWU6ICdkeW5hbWljRmllbGRzJyxcblxuICBvcHRpb25zOiB7XG5cbiAgICB0ZW1wbGF0ZXM6IHtcblxuICAgICAgYmFzZTonXFxcbiAgICAgICAgPGRpdiBjbGFzcz1cImZpZWxkXCI+XFxcbiAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJtYWluXCI+e2xhYmVsfTwvbGFiZWw+XFxcbiAgICAgICAgICB7ZmllbGR9XFxcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImVycm9yXCI+PC9zcGFuPlxcXG4gICAgICAgIDwvZGl2PlxcXG4gICAgICAnLFxuXG4gICAgICB0ZXh0OiAnPGlucHV0IG5hbWU9XCJ7bmFtZX1cIiB0eXBlPVwie3N1YnR5cGV9XCIgdmFsdWU9XCJ7dmFsdWV9XCIge2F0dHJzfT4nLFxuXG4gICAgICBmaWxlOiAnPGlucHV0IGlkPVwie25hbWV9IFwibmFtZT1cIntuYW1lfVwiIHR5cGU9XCJmaWxlXCIge2F0dHJzfT4nLFxuXG4gICAgICB0ZXh0YXJlYTogJzx0ZXh0YXJlYSBuYW1lPVwie25hbWV9XCIge2F0dHJzfT57dGV4dH08L3RleHRhcmVhPicsXG5cbiAgICAgIGdyb3VwOiAnXFxcbiAgICAgICAgPHAgY2xhc3M9XCJncm91cFwiPlxcXG4gICAgICAgICAge0BsaXN0fVxcXG4gICAgICAgICAgPGxhYmVsPjxpbnB1dCBuYW1lPVwie25hbWV9XCIgdHlwZT1cIntzdWJ0eXBlfVwiIHZhbHVlPVwieyN2YWx1ZX1cIiB7I2F0dHJzfT57I3RleHR9PC9sYWJlbD5cXFxuICAgICAgICAgIHsvbGlzdH1cXFxuICAgICAgICA8L3A+XFxcbiAgICAgICcsXG5cbiAgICAgIHNlbGVjdDogJ1xcXG4gICAgICAgIDxzZWxlY3QgbmFtZT17bmFtZX0+XFxcbiAgICAgICAgICB7QGxpc3R9XFxcbiAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwieyN2YWx1ZX1cIj57I3RleHR9PC9vcHRpb24+XFxcbiAgICAgICAgICB7L2xpc3R9XFxcbiAgICAgICAgPC9zZWxlY3Q+XFxcbiAgICAgICdcbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgYWRkRmllbGRzOiBmdW5jdGlvbihmaWVsZHMpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkLmVhY2goZmllbGRzLCBmdW5jdGlvbihuYW1lLCBmaWVsZCkge1xuXG4gICAgICAgIHZhciB0eXBlQXJyYXkgPSBmaWVsZC50eXBlLnNwbGl0KCc6JylcbiAgICAgICAgICAsIHJ1bGVzID0ge31cbiAgICAgICAgICAsICRsYXN0ID0gc2VsZi4kZm9ybS5maW5kKHNlbGYub3B0cy5maWVsZCkubGFzdCgpO1xuXG4gICAgICAgIGZpZWxkLm5hbWUgPSBuYW1lO1xuICAgICAgICBmaWVsZC50eXBlID0gdHlwZUFycmF5WzBdO1xuICAgICAgICBpZiAodHlwZUFycmF5WzFdKSBmaWVsZC5zdWJ0eXBlID0gdHlwZUFycmF5WzFdO1xuXG4gICAgICAgIGZpZWxkLmh0bWwgPSB0ZW1wbGF0ZShzZWxmLm9wdHMudGVtcGxhdGVzLmJhc2UsIHtcbiAgICAgICAgICBsYWJlbDogZmllbGQubGFiZWwsXG4gICAgICAgICAgZmllbGQ6IHRlbXBsYXRlKHNlbGYub3B0cy50ZW1wbGF0ZXNbZmllbGQudHlwZV0sIGZpZWxkKVxuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLl9pbmplY3QoJ2FkZEZpZWxkcycsIGZpZWxkKTtcblxuICAgICAgICBpZiAoZmllbGQuYWZ0ZXIgfHwgZmllbGQuYmVmb3JlKSB7XG4gICAgICAgICAgc2VsZi4kZm9ybS5maW5kKCdbbmFtZT1cIicrIChmaWVsZC5hZnRlciB8fCBmaWVsZC5iZWZvcmUpICsnXCJdJykuZmlyc3QoKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fZ2V0RmllbGQodGhpcylbZmllbGQuYWZ0ZXIgPyAnYWZ0ZXInIDogJ2JlZm9yZSddKGZpZWxkLmh0bWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEZvcm0gaGFzIGF0IGxlYXN0IG9uZSBmaWVsZFxuICAgICAgICAgIGlmICgkbGFzdC5sZW5ndGgpICRsYXN0LmFmdGVyKGZpZWxkLmh0bWwpO1xuICAgICAgICAgIC8vIEZvcm0gaGFzIG5vIGZpZWxkc1xuICAgICAgICAgIGVsc2Ugc2VsZi4kZm9ybS5hcHBlbmQoZmllbGQuaHRtbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGQucnVsZXMpIHtcbiAgICAgICAgICBydWxlc1tuYW1lXSA9IGZpZWxkLnJ1bGVzO1xuICAgICAgICAgIHNlbGYuYWRkUnVsZXMocnVsZXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0sXG5cbiAgICByZW1vdmVGaWVsZHM6IGZ1bmN0aW9uKG5hbWVzKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgJC5lYWNoKG5hbWVzLnNwbGl0KCcgJyksIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgICAgdmFyICRmaWVsZCA9IHNlbGYuX2dldEZpZWxkKCQoJ1tuYW1lPVwiJysgbmFtZSArJ1wiXScpKTtcbiAgICAgICAgc2VsZi4kZmllbGRzID0gc2VsZi4kZmllbGRzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gISAkKHRoaXMpLmlzKCRmaWVsZCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkZmllbGQucmVtb3ZlKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5faW5qZWN0KCdyZW1vdmVGaWVsZHMnKTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlRmllbGRzOiBmdW5jdGlvbihuYW1lcykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChuYW1lcy5zcGxpdCgnICcpLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAgIHZhciAkZmllbGQgPSBzZWxmLl9nZXRGaWVsZCgkKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKSk7XG4gICAgICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbGlkJywgJGZpZWxkLmlzKCc6dmlzaWJsZScpKS50b2dnbGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9pbmplY3QoJ3RvZ2dsZUZpZWxkcycpO1xuICAgIH1cblxuICB9XG59O1xuIiwiLyohXG4gKiBJZGVhbCBTdGVwc1xuKi9cbihmdW5jdGlvbigkLCB3aW4sIGRvYywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyIHBsdWdpbiA9IHt9O1xuXG4gIHBsdWdpbi5uYW1lID0gJ2lkZWFsc3RlcHMnO1xuXG4gIHBsdWdpbi5kZWZhdWx0cyA9IHtcbiAgICBuYXY6ICcuaWRlYWxzdGVwcy1uYXYnLFxuICAgIG5hdkl0ZW1zOiAnbGknLFxuICAgIGJ1aWxkTmF2SXRlbXM6IHRydWUsXG4gICAgd3JhcDogJy5pZGVhbHN0ZXBzLXdyYXAnLFxuICAgIHN0ZXA6ICcuaWRlYWxzdGVwcy1zdGVwJyxcbiAgICBhY3RpdmVDbGFzczogJ2lkZWFsc3RlcHMtc3RlcC1hY3RpdmUnLFxuICAgIGJlZm9yZTogbnVsbCxcbiAgICBhZnRlcjogbnVsbCxcbiAgICBmYWRlU3BlZWQ6IDBcbiAgfTtcblxuICBwbHVnaW4ubWV0aG9kcyA9IHtcblxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIGFjdGl2ZSA9IHRoaXMub3B0cy5hY3RpdmVDbGFzcztcblxuICAgICAgdGhpcy4kZWwgPSAkKHRoaXMuZWwpO1xuXG4gICAgICB0aGlzLiRuYXYgPSB0aGlzLiRlbC5maW5kKHRoaXMub3B0cy5uYXYpO1xuICAgICAgdGhpcy4kbmF2SXRlbXMgPSB0aGlzLiRuYXYuZmluZCh0aGlzLm9wdHMubmF2SXRlbXMpO1xuXG4gICAgICB0aGlzLiR3cmFwID0gdGhpcy4kZWwuZmluZCh0aGlzLm9wdHMud3JhcCk7XG4gICAgICB0aGlzLiRzdGVwcyA9IHRoaXMuJHdyYXAuZmluZCh0aGlzLm9wdHMuc3RlcCk7XG5cbiAgICAgIGlmICh0aGlzLm9wdHMuYnVpbGROYXZJdGVtcykgdGhpcy5fYnVpbGROYXZJdGVtcygpO1xuXG4gICAgICB0aGlzLiRzdGVwcy5oaWRlKCkuZmlyc3QoKS5zaG93KCk7XG4gICAgICB0aGlzLiRuYXZJdGVtcy5yZW1vdmVDbGFzcyhhY3RpdmUpLmZpcnN0KCkuYWRkQ2xhc3MoYWN0aXZlKTtcblxuICAgICAgdGhpcy4kbmF2SXRlbXMuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNlbGYuZ28oc2VsZi4kbmF2SXRlbXMuaW5kZXgodGhpcykpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9idWlsZE5hdkl0ZW1zOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIGlzQ3VzdG9tID0gdHlwZW9mIHRoaXMub3B0cy5idWlsZE5hdkl0ZW1zID09ICdmdW5jdGlvbicsXG4gICAgICAgICAgaXRlbSA9IGZ1bmN0aW9uKHZhbCl7IHJldHVybiAnPGxpPjxhIGhyZWY9XCIjXCIgdGFiaW5kZXg9XCItMVwiPicrIHZhbCArJzwvYT48L2xpPic7IH0sXG4gICAgICAgICAgaXRlbXM7XG5cbiAgICAgIGl0ZW1zID0gaXNDdXN0b20gP1xuICAgICAgICB0aGlzLiRzdGVwcy5tYXAoZnVuY3Rpb24oaSl7IHJldHVybiBpdGVtKHNlbGYub3B0cy5idWlsZE5hdkl0ZW1zLmNhbGwoc2VsZiwgaSkpIH0pLmdldCgpIDpcbiAgICAgICAgdGhpcy4kc3RlcHMubWFwKGZ1bmN0aW9uKGkpeyByZXR1cm4gaXRlbSgrK2kpOyB9KS5nZXQoKTtcblxuICAgICAgdGhpcy4kbmF2SXRlbXMgPSAkKGl0ZW1zLmpvaW4oJycpKTtcblxuICAgICAgdGhpcy4kbmF2LmFwcGVuZCgkKCc8dWwvPicpLmFwcGVuZCh0aGlzLiRuYXZJdGVtcykpO1xuICAgIH0sXG5cbiAgICBfZ2V0Q3VySWR4OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLiRzdGVwcy5pbmRleCh0aGlzLiRzdGVwcy5maWx0ZXIoJzp2aXNpYmxlJykpO1xuICAgIH0sXG5cbiAgICBnbzogZnVuY3Rpb24oaWR4KSB7XG5cbiAgICAgIHZhciBhY3RpdmUgPSB0aGlzLm9wdHMuYWN0aXZlQ2xhc3MsXG4gICAgICAgICAgZmFkZVNwZWVkID0gdGhpcy5vcHRzLmZhZGVTcGVlZDtcblxuICAgICAgaWYgKHR5cGVvZiBpZHggPT0gJ2Z1bmN0aW9uJykgaWR4ID0gaWR4LmNhbGwodGhpcywgdGhpcy5fZ2V0Q3VySWR4KCkpO1xuXG4gICAgICBpZiAoaWR4ID49IHRoaXMuJHN0ZXBzLmxlbmd0aCkgaWR4ID0gMDtcbiAgICAgIGlmIChpZHggPCAwKSBpZHggPSB0aGlzLiRzdGVwcy5sZW5ndGgtMTtcblxuICAgICAgaWYgKHRoaXMub3B0cy5iZWZvcmUpIHRoaXMub3B0cy5iZWZvcmUuY2FsbCh0aGlzLCBpZHgpO1xuXG4gICAgICB0aGlzLiRuYXZJdGVtcy5yZW1vdmVDbGFzcyhhY3RpdmUpLmVxKGlkeCkuYWRkQ2xhc3MoYWN0aXZlKTtcbiAgICAgIHRoaXMuJHN0ZXBzLmZhZGVPdXQoZmFkZVNwZWVkKS5lcShpZHgpLmZhZGVJbihmYWRlU3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5vcHRzLmFmdGVyKSB0aGlzLm9wdHMuYWZ0ZXIuY2FsbCh0aGlzLCBpZHgpO1xuICAgIH0sXG5cbiAgICBwcmV2OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28odGhpcy5fZ2V0Q3VySWR4KCkgLSAxKTtcbiAgICB9LFxuXG4gICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmdvKHRoaXMuX2dldEN1cklkeCgpICsgMSk7XG4gICAgfSxcblxuICAgIGZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZ28oMCk7XG4gICAgfSxcblxuICAgIGxhc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5nbyh0aGlzLiRzdGVwcy5sZW5ndGgtMSk7XG4gICAgfVxuICB9O1xuXG4gIHJlcXVpcmUoJy4uLy4uL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iLCJyZXF1aXJlKCcuL2lkZWFsc3RlcHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgbmFtZTogJ3N0ZXBzJyxcblxuICBvcHRpb25zOiB7XG4gICAgc3RlcHM6IHtcbiAgICAgIGNvbnRhaW5lcjogJy5pZGVhbHN0ZXBzLWNvbnRhaW5lcicsXG4gICAgICBuYXY6ICcuaWRlYWxzdGVwcy1uYXYnLFxuICAgICAgbmF2SXRlbXM6ICdsaScsXG4gICAgICBidWlsZE5hdkl0ZW1zOiBmdW5jdGlvbihpKSB7XG4gICAgICAgIHJldHVybiAnU3RlcCAnKyAoaSsxKTtcbiAgICAgIH0sXG4gICAgICB3cmFwOiAnLmlkZWFsc3RlcHMtd3JhcCcsXG4gICAgICBzdGVwOiAnLmlkZWFsc3RlcHMtc3RlcCcsXG4gICAgICBhY3RpdmVDbGFzczogJ2lkZWFsc3RlcHMtc3RlcC1hY3RpdmUnLFxuICAgICAgYmVmb3JlOiBudWxsLFxuICAgICAgYWZ0ZXI6IG51bGwsXG4gICAgICBmYWRlU3BlZWQ6IDBcbiAgICB9XG4gIH0sXG5cbiAgbWV0aG9kczoge1xuXG4gICAgLy8gQGV4dGVuZFxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2J1aWxkU3RlcHMoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIF92YWxpZGF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5fdXBkYXRlU3RlcHMoKTtcblxuICAgICAgaWYgKHRoaXMuX2hhc0V4dGVuc2lvbignYWpheCcpKSB7XG4gICAgICAgICQuZWFjaCgkLmlkZWFsZm9ybXMuX3JlcXVlc3RzLCBmdW5jdGlvbihrZXksIHJlcXVlc3QpIHtcbiAgICAgICAgICByZXF1ZXN0LmRvbmUoZnVuY3Rpb24oKXsgc2VsZi5fdXBkYXRlU3RlcHMoKSB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEBleHRlbmRcbiAgICBmb2N1c0ZpcnN0SW52YWxpZDogZnVuY3Rpb24oZmlyc3RJbnZhbGlkKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygnZ28nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJHN0ZXBzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh0aGlzKS5maW5kKGZpcnN0SW52YWxpZCkubGVuZ3RoO1xuICAgICAgICB9KS5pbmRleCgpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9idWlsZFN0ZXBzOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzLCBvcHRpb25zXG4gICAgICAgICwgaGFzUnVsZXMgPSAhICQuaXNFbXB0eU9iamVjdCh0aGlzLm9wdHMucnVsZXMpXG4gICAgICAgICwgYnVpbGROYXZJdGVtcyA9IHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zXG4gICAgICAgICwgY291bnRlciA9IGhhc1J1bGVzXG4gICAgICAgICAgPyAnPHNwYW4gY2xhc3M9XCJjb3VudGVyXCIvPidcbiAgICAgICAgICA6ICc8c3BhbiBjbGFzcz1cImNvdW50ZXIgemVyb1wiPjA8L3NwYW4+JztcblxuICAgICAgaWYgKHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zKSB7XG4gICAgICAgIHRoaXMub3B0cy5zdGVwcy5idWlsZE5hdkl0ZW1zID0gZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHJldHVybiBidWlsZE5hdkl0ZW1zLmNhbGwoc2VsZiwgaSkgKyBjb3VudGVyO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lciA9IHRoaXMuJGZvcm1cbiAgICAgICAgLmNsb3Nlc3QodGhpcy5vcHRzLnN0ZXBzLmNvbnRhaW5lcilcbiAgICAgICAgLmlkZWFsc3RlcHModGhpcy5vcHRzLnN0ZXBzKTtcbiAgICB9LFxuXG4gICAgX3VwZGF0ZVN0ZXBzOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdfaW5qZWN0JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGlkZWFsc3RlcHMgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuJG5hdkl0ZW1zLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICAgIHZhciBpbnZhbGlkID0gaWRlYWxzdGVwcy4kc3RlcHMuZXEoaSkuZmluZChzZWxmLmdldEludmFsaWQoKSkubGVuZ3RoO1xuICAgICAgICAgICQodGhpcykuZmluZCgnc3BhbicpLnRleHQoaW52YWxpZCkudG9nZ2xlQ2xhc3MoJ3plcm8nLCAhIGludmFsaWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgYWRkUnVsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5maXJzdFN0ZXAoKTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIGFkZEZpZWxkczogZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgIGZpZWxkLmFmdGVyID0gdGhpcy4kc3RlcHNDb250YWluZXJcbiAgICAgICAgLmZpbmQodGhpcy5vcHRzLnN0ZXBzLnN0ZXApXG4gICAgICAgIC5lcShmaWVsZC5hcHBlbmRUb1N0ZXApXG4gICAgICAgIC5maW5kKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcpXG4gICAgICAgIC5sYXN0KClbMF0ubmFtZTtcbiAgICB9LFxuXG4gICAgLy8gQGV4dGVuZFxuICAgIHRvZ2dsZUZpZWxkczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGVwcygpO1xuICAgIH0sXG5cbiAgICAvLyBAZXh0ZW5kXG4gICAgcmVtb3ZlRmllbGRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN0ZXBzKCk7XG4gICAgfSxcblxuICAgIGdvVG9TdGVwOiBmdW5jdGlvbihpZHgpIHtcbiAgICAgIHRoaXMuJHN0ZXBzQ29udGFpbmVyLmlkZWFsc3RlcHMoJ2dvJywgaWR4KTtcbiAgICB9LFxuXG4gICAgcHJldlN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kc3RlcHNDb250YWluZXIuaWRlYWxzdGVwcygncHJldicpO1xuICAgIH0sXG5cbiAgICBuZXh0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCduZXh0Jyk7XG4gICAgfSxcblxuICAgIGZpcnN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdmaXJzdCcpO1xuICAgIH0sXG5cbiAgICBsYXN0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRzdGVwc0NvbnRhaW5lci5pZGVhbHN0ZXBzKCdsYXN0Jyk7XG4gICAgfVxuICB9XG5cbn07XG4iLCIvKiFcbiAqIGpRdWVyeSBJZGVhbCBGb3Jtc1xuICogQGF1dGhvcjogQ2VkcmljIFJ1aXpcbiAqIEB2ZXJzaW9uOiAzLjBcbiAqIEBsaWNlbnNlIEdQTCBvciBNSVRcbiAqL1xuKGZ1bmN0aW9uKCQsIHdpbiwgZG9jLCB1bmRlZmluZWQpIHtcblxuICB2YXIgcGx1Z2luID0ge307XG5cbiAgcGx1Z2luLm5hbWUgPSAnaWRlYWxmb3Jtcyc7XG5cbiAgcGx1Z2luLmRlZmF1bHRzID0ge1xuICAgIGZpZWxkOiAnLmZpZWxkJyxcbiAgICBlcnJvcjogJy5lcnJvcicsXG4gICAgaWNvbkh0bWw6ICc8aS8+JyxcbiAgICBpY29uQ2xhc3M6ICdpY29uJyxcbiAgICBpbnZhbGlkQ2xhc3M6ICdpbnZhbGlkJyxcbiAgICB2YWxpZENsYXNzOiAndmFsaWQnLFxuICAgIHNpbGVudExvYWQ6IHRydWUsXG4gICAgb25WYWxpZGF0ZTogJC5ub29wLFxuICAgIG9uU3VibWl0OiAkLm5vb3BcbiAgfTtcblxuICBwbHVnaW4uZ2xvYmFsID0ge1xuXG4gICAgX2Zvcm1hdDogZnVuY3Rpb24oc3RyKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvXFx7KFxcZClcXH0vZywgZnVuY3Rpb24oXywgbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGFyZ3NbK21hdGNoXSB8fCAnJztcbiAgICAgIH0pLnJlcGxhY2UoL1xce1xcKihbXip9XSopXFx9L2csIGZ1bmN0aW9uKF8sIHNlcCkge1xuICAgICAgICByZXR1cm4gYXJncy5qb2luKHNlcCB8fCAnLCAnKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfZ2V0S2V5OiBmdW5jdGlvbihrZXksIG9iaikge1xuICAgICAgcmV0dXJuIGtleS5zcGxpdCgnLicpLnJlZHVjZShmdW5jdGlvbihhLGIpIHtcbiAgICAgICAgcmV0dXJuIGEgJiYgYVtiXTtcbiAgICAgIH0sIG9iaik7XG4gICAgfSxcblxuICAgIHJ1bGVTZXBhcmF0b3I6ICcgJyxcbiAgICBhcmdTZXBhcmF0b3I6ICc6JyxcblxuICAgIHJ1bGVzOiByZXF1aXJlKCcuL3J1bGVzJyksXG4gICAgZXJyb3JzOiByZXF1aXJlKCcuL2Vycm9ycycpLFxuXG4gICAgZXh0ZW5zaW9uczogW1xuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2R5bmFtaWMtZmllbGRzL2R5bmFtaWMtZmllbGRzLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2FqYXgvYWpheC5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9zdGVwcy9zdGVwcy5leHQnKSxcbiAgICAgIHJlcXVpcmUoJy4vZXh0ZW5zaW9ucy9jdXN0b20taW5wdXRzL2N1c3RvbS1pbnB1dHMuZXh0JyksXG4gICAgICByZXF1aXJlKCcuL2V4dGVuc2lvbnMvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmV4dCcpLFxuICAgICAgcmVxdWlyZSgnLi9leHRlbnNpb25zL2FkYXB0aXZlL2FkYXB0aXZlLmV4dCcpXG4gICAgXVxuICB9O1xuXG4gIHBsdWdpbi5tZXRob2RzID0gJC5leHRlbmQoe30sIHJlcXVpcmUoJy4vcHJpdmF0ZScpLCByZXF1aXJlKCcuL3B1YmxpYycpKTtcblxuICByZXF1aXJlKCcuL3BsdWdpbicpKHBsdWdpbik7XG5cbn0oalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KSk7XG4iLCIvKipcbiAqIFBsdWdpbiBib2lsZXJwbGF0ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICB2YXIgQVAgPSBBcnJheS5wcm90b3R5cGU7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHBsdWdpbikge1xuXG4gICAgcGx1Z2luID0gJC5leHRlbmQodHJ1ZSwge1xuICAgICAgbmFtZTogJ3BsdWdpbicsXG4gICAgICBkZWZhdWx0czoge1xuICAgICAgICBkaXNhYmxlZEV4dGVuc2lvbnM6ICdub25lJ1xuICAgICAgfSxcbiAgICAgIG1ldGhvZHM6IHt9LFxuICAgICAgZ2xvYmFsOiB7fSxcbiAgICB9LCBwbHVnaW4pO1xuXG4gICAgJFtwbHVnaW4ubmFtZV0gPSAkLmV4dGVuZCh7XG5cbiAgICAgIGFkZEV4dGVuc2lvbjogZnVuY3Rpb24oZXh0ZW5zaW9uKSB7XG4gICAgICAgIHBsdWdpbi5nbG9iYWwuZXh0ZW5zaW9ucy5wdXNoKGV4dGVuc2lvbik7XG4gICAgICB9XG4gICAgfSwgcGx1Z2luLmdsb2JhbCk7XG5cbiAgICBmdW5jdGlvbiBQbHVnaW4oZWxlbWVudCwgb3B0aW9ucykge1xuXG4gICAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh7fSwgcGx1Z2luLmRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuZWwgPSBlbGVtZW50O1xuXG4gICAgICB0aGlzLl9uYW1lID0gcGx1Z2luLm5hbWU7XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICB9XG5cbiAgICBQbHVnaW4uX2V4dGVuZGVkID0ge307XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlLl9oYXNFeHRlbnNpb24gPSBmdW5jdGlvbihleHRlbnNpb24pIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gcGx1Z2luLmdsb2JhbC5leHRlbnNpb25zLmZpbHRlcihmdW5jdGlvbihleHQpIHtcbiAgICAgICAgcmV0dXJuIGV4dC5uYW1lID09IGV4dGVuc2lvbiAmJiBzZWxmLm9wdHMuZGlzYWJsZWRFeHRlbnNpb25zLmluZGV4T2YoZXh0Lm5hbWUpIDwgMDtcbiAgICAgIH0pLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgUGx1Z2luLnByb3RvdHlwZS5fZXh0ZW5kID0gZnVuY3Rpb24oZXh0ZW5zaW9ucykge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICQuZWFjaChleHRlbnNpb25zLCBmdW5jdGlvbihpLCBleHRlbnNpb24pIHtcblxuICAgICAgICAkLmV4dGVuZChzZWxmLm9wdHMsICQuZXh0ZW5kKHRydWUsIGV4dGVuc2lvbi5vcHRpb25zLCBzZWxmLm9wdHMpKTtcblxuICAgICAgICAkLmVhY2goZXh0ZW5zaW9uLm1ldGhvZHMsIGZ1bmN0aW9uKG1ldGhvZCwgZm4pIHtcblxuICAgICAgICAgIGlmIChzZWxmLm9wdHMuZGlzYWJsZWRFeHRlbnNpb25zLmluZGV4T2YoZXh0ZW5zaW9uLm5hbWUpID4gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoUGx1Z2luLnByb3RvdHlwZVttZXRob2RdKSB7XG4gICAgICAgICAgICBQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0gPSBQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0gfHwgW107XG4gICAgICAgICAgICBQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0ucHVzaCh7IG5hbWU6IGV4dGVuc2lvbi5uYW1lLCBmbjogZm4gfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFBsdWdpbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlLl9pbmplY3QgPSBmdW5jdGlvbihtZXRob2QpIHtcblxuICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICAgIGlmICh0eXBlb2YgbWV0aG9kID09ICdmdW5jdGlvbicpIHJldHVybiBtZXRob2QuY2FsbCh0aGlzKTtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoUGx1Z2luLl9leHRlbmRlZFttZXRob2RdKSB7XG4gICAgICAgICQuZWFjaChQbHVnaW4uX2V4dGVuZGVkW21ldGhvZF0sIGZ1bmN0aW9uKGksIHBsdWdpbikge1xuICAgICAgICAgIHBsdWdpbi5mbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFBsdWdpbi5wcm90b3R5cGUuX2luaXQgPSAkLm5vb3A7XG5cbiAgICBQbHVnaW4ucHJvdG90eXBlW3BsdWdpbi5uYW1lXSA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgaWYgKCFtZXRob2QpIHJldHVybiB0aGlzO1xuICAgICAgdHJ5IHsgcmV0dXJuIHRoaXNbbWV0aG9kXS5hcHBseSh0aGlzLCBBUC5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpOyB9XG4gICAgICBjYXRjaChlKSB7fVxuICAgIH07XG5cbiAgICAkLmV4dGVuZChQbHVnaW4ucHJvdG90eXBlLCBwbHVnaW4ubWV0aG9kcyk7XG5cbiAgICAkLmZuW3BsdWdpbi5uYW1lXSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgYXJncyA9IEFQLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgICAgICAsIG1ldGhvZEFycmF5ID0gdHlwZW9mIGFyZ3NbMF0gPT0gJ3N0cmluZycgJiYgYXJnc1swXS5zcGxpdCgnOicpXG4gICAgICAgICwgbWV0aG9kID0gbWV0aG9kQXJyYXlbbWV0aG9kQXJyYXkubGVuZ3RoID4gMSA/IDEgOiAwXVxuICAgICAgICAsIHByZWZpeCA9IG1ldGhvZEFycmF5Lmxlbmd0aCA+IDEgJiYgbWV0aG9kQXJyYXlbMF1cbiAgICAgICAgLCBvcHRzID0gdHlwZW9mIGFyZ3NbMF0gPT0gJ29iamVjdCcgJiYgYXJnc1swXVxuICAgICAgICAsIHBhcmFtcyA9IGFyZ3Muc2xpY2UoMSlcbiAgICAgICAgLCByZXQ7XG5cbiAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgbWV0aG9kID0gcHJlZml4ICsgbWV0aG9kLnN1YnN0cigwLDEpLnRvVXBwZXJDYXNlKCkgKyBtZXRob2Quc3Vic3RyKDEsbWV0aG9kLmxlbmd0aC0xKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBpbnN0YW5jZSA9ICQuZGF0YSh0aGlzLCBwbHVnaW4ubmFtZSk7XG5cbiAgICAgICAgLy8gTWV0aG9kXG4gICAgICAgIGlmIChpbnN0YW5jZSkge1xuICAgICAgICAgIHJldHVybiByZXQgPSBpbnN0YW5jZVtwbHVnaW4ubmFtZV0uYXBwbHkoaW5zdGFuY2UsIFttZXRob2RdLmNvbmNhdChwYXJhbXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluaXRcbiAgICAgICAgcmV0dXJuICQuZGF0YSh0aGlzLCBwbHVnaW4ubmFtZSwgbmV3IFBsdWdpbih0aGlzLCBvcHRzKSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHByZWZpeCA/IHJldCA6IHRoaXM7XG4gICAgfTtcbiAgfTtcblxufSgpKTtcbiIsIi8qKlxuICogUHJpdmF0ZSBtZXRob2RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIF9pbml0OiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX2V4dGVuZCgkLmlkZWFsZm9ybXMuZXh0ZW5zaW9ucyk7XG5cbiAgICB0aGlzLiRmb3JtID0gJCh0aGlzLmVsKTtcbiAgICB0aGlzLiRmaWVsZHMgPSAkKCk7XG4gICAgdGhpcy4kaW5wdXRzID0gJCgpO1xuXG4gICAgdGhpcy4kZm9ybS5zdWJtaXQoZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgc2VsZi5mb2N1c0ZpcnN0SW52YWxpZCgpO1xuICAgICAgc2VsZi5vcHRzLm9uU3VibWl0LmNhbGwoc2VsZiwgc2VsZi5nZXRJbnZhbGlkKCkubGVuZ3RoLCBlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2luamVjdCgnX2luaXQnKTtcblxuICAgIHRoaXMuYWRkUnVsZXModGhpcy5vcHRzLnJ1bGVzIHx8IHt9KTtcblxuICAgIGlmICghIHRoaXMub3B0cy5zaWxlbnRMb2FkKSB0aGlzLmZvY3VzRmlyc3RJbnZhbGlkKCk7XG4gIH0sXG5cbiAgX2J1aWxkRmllbGQ6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAsICRpY29uO1xuXG4gICAgJGljb24gPSAkKHRoaXMub3B0cy5pY29uSHRtbCwge1xuICAgICAgY2xhc3M6IHRoaXMub3B0cy5pY29uQ2xhc3MsXG4gICAgICBjbGljazogZnVuY3Rpb24oKXsgJChpbnB1dCkuZm9jdXMoKSB9XG4gICAgfSk7XG5cbiAgICBpZiAoISB0aGlzLiRmaWVsZHMuZmlsdGVyKCRmaWVsZCkubGVuZ3RoKSB7XG4gICAgICB0aGlzLiRmaWVsZHMgPSB0aGlzLiRmaWVsZHMuYWRkKCRmaWVsZCk7XG4gICAgICBpZiAodGhpcy5vcHRzLmljb25IdG1sKSAkZmllbGQuYXBwZW5kKCRpY29uKTtcbiAgICAgICRmaWVsZC5hZGRDbGFzcygnaWRlYWxmb3Jtcy1maWVsZCBpZGVhbGZvcm1zLWZpZWxkLScrIGlucHV0LnR5cGUpO1xuICAgIH1cblxuICAgIHRoaXMuX2FkZEV2ZW50cyhpbnB1dCk7XG5cbiAgICB0aGlzLl9pbmplY3QoJ19idWlsZEZpZWxkJywgaW5wdXQpO1xuICB9LFxuXG4gIF9hZGRFdmVudHM6IGZ1bmN0aW9uKGlucHV0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpO1xuXG4gICAgJChpbnB1dClcbiAgICAgIC5vbignY2hhbmdlIGtleXVwJywgZnVuY3Rpb24oZSkge1xuXG4gICAgICAgIHZhciBvbGRWYWx1ZSA9ICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbHVlJyk7XG5cbiAgICAgICAgaWYgKGUud2hpY2ggPT0gOSB8fCBlLndoaWNoID09IDE2KSByZXR1cm47XG4gICAgICAgIGlmICghICQodGhpcykuaXMoJzpjaGVja2JveCwgOnJhZGlvJykgJiYgb2xkVmFsdWUgPT0gdGhpcy52YWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgICRmaWVsZC5kYXRhKCdpZGVhbGZvcm1zLXZhbHVlJywgdGhpcy52YWx1ZSk7XG5cbiAgICAgICAgc2VsZi5fdmFsaWRhdGUodGhpcywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICB9KVxuICAgICAgLmZvY3VzKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmIChzZWxmLmlzVmFsaWQodGhpcy5uYW1lKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGlmIChzZWxmLl9pc1JlcXVpcmVkKHRoaXMpIHx8IHRoaXMudmFsdWUpIHtcbiAgICAgICAgICAkZmllbGQuZmluZChzZWxmLm9wdHMuZXJyb3IpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5ibHVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAkZmllbGQuZmluZChzZWxmLm9wdHMuZXJyb3IpLmhpZGUoKTtcbiAgICAgIH0pO1xuICB9LFxuXG4gIF9pc1JlcXVpcmVkOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIC8vIFdlIGFzc3VtZSBub24tdGV4dCBpbnB1dHMgd2l0aCBydWxlcyBhcmUgcmVxdWlyZWRcbiAgICBpZiAoJChpbnB1dCkuaXMoJzpjaGVja2JveCwgOnJhZGlvLCBzZWxlY3QnKSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIHRoaXMub3B0cy5ydWxlc1tpbnB1dC5uYW1lXS5pbmRleE9mKCdyZXF1aXJlZCcpID4gLTE7XG4gIH0sXG5cbiAgX2dldFJlbGF0ZWQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldEZpZWxkKGlucHV0KS5maW5kKCdbbmFtZT1cIicrIGlucHV0Lm5hbWUgKydcIl0nKTtcbiAgfSxcblxuICBfZ2V0RmllbGQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgcmV0dXJuICQoaW5wdXQpLmNsb3Nlc3QodGhpcy5vcHRzLmZpZWxkKTtcbiAgfSxcblxuICBfZ2V0Rmlyc3RJbnZhbGlkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRJbnZhbGlkKCkuZmlyc3QoKS5maW5kKCdpbnB1dDpmaXJzdCwgdGV4dGFyZWEsIHNlbGVjdCcpO1xuICB9LFxuXG4gIF9oYW5kbGVFcnJvcjogZnVuY3Rpb24oaW5wdXQsIGVycm9yLCB2YWxpZCkge1xuICAgIHZhbGlkID0gdmFsaWQgfHwgdGhpcy5pc1ZhbGlkKGlucHV0Lm5hbWUpO1xuICAgIHZhciAkZXJyb3IgPSB0aGlzLl9nZXRGaWVsZChpbnB1dCkuZmluZCh0aGlzLm9wdHMuZXJyb3IpO1xuICAgIHRoaXMuJGZvcm0uZmluZCh0aGlzLm9wdHMuZXJyb3IpLmhpZGUoKTtcbiAgICBpZiAoZXJyb3IpICRlcnJvci50ZXh0KGVycm9yKTtcbiAgICAkZXJyb3IudG9nZ2xlKCF2YWxpZCk7XG4gIH0sXG5cbiAgX2hhbmRsZVN0eWxlOiBmdW5jdGlvbihpbnB1dCwgdmFsaWQpIHtcbiAgICB2YWxpZCA9IHZhbGlkIHx8IHRoaXMuaXNWYWxpZChpbnB1dC5uYW1lKTtcbiAgICB0aGlzLl9nZXRGaWVsZChpbnB1dClcbiAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLm9wdHMudmFsaWRDbGFzcyArJyAnKyB0aGlzLm9wdHMuaW52YWxpZENsYXNzKVxuICAgICAgLmFkZENsYXNzKHZhbGlkID8gdGhpcy5vcHRzLnZhbGlkQ2xhc3MgOiB0aGlzLm9wdHMuaW52YWxpZENsYXNzKVxuICAgICAgLmZpbmQoJy4nKyB0aGlzLm9wdHMuaWNvbkNsYXNzKS5zaG93KCk7XG4gIH0sXG5cbiAgX2ZyZXNoOiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHRoaXMuX2dldEZpZWxkKGlucHV0KVxuICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0cy52YWxpZENsYXNzICsnICcrIHRoaXMub3B0cy5pbnZhbGlkQ2xhc3MpXG4gICAgICAuZmluZCh0aGlzLm9wdHMuZXJyb3IpLmhpZGUoKVxuICAgICAgLmVuZCgpXG4gICAgICAuZmluZCgnLicrIHRoaXMub3B0cy5pY29uQ2xhc3MpLnRvZ2dsZSh0aGlzLl9pc1JlcXVpcmVkKGlucHV0KSk7XG4gIH0sXG5cbiAgX3ZhbGlkYXRlOiBmdW5jdGlvbihpbnB1dCwgaGFuZGxlRXJyb3IsIGhhbmRsZVN0eWxlKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJGZpZWxkID0gdGhpcy5fZ2V0RmllbGQoaW5wdXQpXG4gICAgICAsIHVzZXJSdWxlcyA9IHRoaXMub3B0cy5ydWxlc1tpbnB1dC5uYW1lXS5zcGxpdCgkLmlkZWFsZm9ybXMucnVsZVNlcGFyYXRvcilcbiAgICAgICwgdmFsaWQgPSB0cnVlXG4gICAgICAsIHJ1bGU7XG5cbiAgICAvLyBOb24tcmVxdWlyZWQgaW5wdXQgd2l0aCBlbXB0eSB2YWx1ZSBtdXN0IHBhc3MgdmFsaWRhdGlvblxuICAgIGlmICghIGlucHV0LnZhbHVlICYmICEgdGhpcy5faXNSZXF1aXJlZChpbnB1dCkpIHtcbiAgICAgICRmaWVsZC5yZW1vdmVEYXRhKCdpZGVhbGZvcm1zLXZhbGlkJyk7XG4gICAgICB0aGlzLl9mcmVzaChpbnB1dCk7XG5cbiAgICAvLyBSZXF1aXJlZCBpbnB1dHNcbiAgICB9IGVsc2Uge1xuXG4gICAgICAkLmVhY2godXNlclJ1bGVzLCBmdW5jdGlvbihpLCB1c2VyUnVsZSkge1xuXG4gICAgICAgIHVzZXJSdWxlID0gdXNlclJ1bGUuc3BsaXQoJC5pZGVhbGZvcm1zLmFyZ1NlcGFyYXRvcik7XG5cbiAgICAgICAgcnVsZSA9IHVzZXJSdWxlWzBdO1xuXG4gICAgICAgIHZhciB0aGVSdWxlID0gJC5pZGVhbGZvcm1zLnJ1bGVzW3J1bGVdXG4gICAgICAgICAgLCBhcmdzID0gdXNlclJ1bGUuc2xpY2UoMSlcbiAgICAgICAgICAsIGVycm9yO1xuXG4gICAgICAgIGVycm9yID0gJC5pZGVhbGZvcm1zLl9mb3JtYXQuYXBwbHkobnVsbCwgW1xuICAgICAgICAgICQuaWRlYWxmb3Jtcy5fZ2V0S2V5KCdlcnJvcnMuJysgaW5wdXQubmFtZSArJy4nKyBydWxlLCBzZWxmLm9wdHMpIHx8XG4gICAgICAgICAgJC5pZGVhbGZvcm1zLmVycm9yc1tydWxlXVxuICAgICAgICBdLmNvbmNhdChhcmdzKSk7XG5cbiAgICAgICAgdmFsaWQgPSB0eXBlb2YgdGhlUnVsZSA9PSAnZnVuY3Rpb24nXG4gICAgICAgICAgPyB0aGVSdWxlLmFwcGx5KHNlbGYsIFtpbnB1dCwgaW5wdXQudmFsdWVdLmNvbmNhdChhcmdzKSlcbiAgICAgICAgICA6IHRoZVJ1bGUudGVzdChpbnB1dC52YWx1ZSk7XG5cbiAgICAgICAgJGZpZWxkLmRhdGEoJ2lkZWFsZm9ybXMtdmFsaWQnLCB2YWxpZCk7XG5cbiAgICAgICAgaWYgKGhhbmRsZUVycm9yKSBzZWxmLl9oYW5kbGVFcnJvcihpbnB1dCwgZXJyb3IsIHZhbGlkKTtcbiAgICAgICAgaWYgKGhhbmRsZVN0eWxlKSBzZWxmLl9oYW5kbGVTdHlsZShpbnB1dCwgdmFsaWQpO1xuXG4gICAgICAgIHNlbGYub3B0cy5vblZhbGlkYXRlLmNhbGwoc2VsZiwgaW5wdXQsIHJ1bGUsIHZhbGlkKTtcblxuICAgICAgICByZXR1cm4gdmFsaWQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbmplY3QoJ192YWxpZGF0ZScsIGlucHV0LCBydWxlLCB2YWxpZCk7XG5cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH1cblxufTtcbiIsIi8qKlxuICogUHVibGljIG1ldGhvZHNcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWRkUnVsZXM6IGZ1bmN0aW9uKHJ1bGVzKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgJGlucHV0cyA9IHRoaXMuJGZvcm0uZmluZCgkLm1hcChydWxlcywgZnVuY3Rpb24oXywgbmFtZSkge1xuICAgICAgcmV0dXJuICdbbmFtZT1cIicrIG5hbWUgKydcIl0nO1xuICAgIH0pLmpvaW4oJywnKSk7XG5cbiAgICAkLmV4dGVuZCh0aGlzLm9wdHMucnVsZXMsIHJ1bGVzKTtcblxuICAgICRpbnB1dHMuZWFjaChmdW5jdGlvbigpeyBzZWxmLl9idWlsZEZpZWxkKHRoaXMpIH0pO1xuXG4gICAgdGhpcy4kaW5wdXRzID0gdGhpcy4kaW5wdXRzXG4gICAgICAuYWRkKCRpbnB1dHMpXG4gICAgICAuZWFjaChmdW5jdGlvbigpeyBzZWxmLl92YWxpZGF0ZSh0aGlzLCB0cnVlKSB9KTtcblxuICAgIHRoaXMuJGZpZWxkcy5maW5kKHRoaXMub3B0cy5lcnJvcikuaGlkZSgpO1xuXG4gICAgdGhpcy5faW5qZWN0KCdhZGRSdWxlcycpO1xuICB9LFxuXG4gIGdldEludmFsaWQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRmaWVsZHMuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQodGhpcykuZGF0YSgnaWRlYWxmb3Jtcy12YWxpZCcpID09PSBmYWxzZTtcbiAgICB9KTtcbiAgfSxcblxuICBmb2N1c0ZpcnN0SW52YWxpZDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZmlyc3RJbnZhbGlkID0gdGhpcy5fZ2V0Rmlyc3RJbnZhbGlkKClbMF07XG5cbiAgICBpZiAoZmlyc3RJbnZhbGlkKSB7XG4gICAgICB0aGlzLl9oYW5kbGVFcnJvcihmaXJzdEludmFsaWQpO1xuICAgICAgdGhpcy5faGFuZGxlU3R5bGUoZmlyc3RJbnZhbGlkKTtcbiAgICAgIHRoaXMuX2luamVjdCgnZm9jdXNGaXJzdEludmFsaWQnLCBmaXJzdEludmFsaWQpO1xuICAgICAgZmlyc3RJbnZhbGlkLmZvY3VzKCk7XG4gICAgfVxuICB9LFxuXG4gIGlzVmFsaWQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZiAobmFtZSkgcmV0dXJuICEgdGhpcy5nZXRJbnZhbGlkKCkuZmluZCgnW25hbWU9XCInKyBuYW1lICsnXCJdJykubGVuZ3RoO1xuICAgIHJldHVybiAhIHRoaXMuZ2V0SW52YWxpZCgpLmxlbmd0aDtcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24obmFtZSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsICRpbnB1dHMgPSB0aGlzLiRpbnB1dHM7XG5cbiAgICBpZiAobmFtZSkgJGlucHV0cyA9ICRpbnB1dHMuZmlsdGVyKCdbbmFtZT1cIicrIG5hbWUgKydcIl0nKTtcblxuICAgICRpbnB1dHMuZmlsdGVyKCdpbnB1dDpub3QoOmNoZWNrYm94LCA6cmFkaW8pJykudmFsKCcnKTtcbiAgICAkaW5wdXRzLmZpbHRlcignOmNoZWNrYm94LCA6cmFkaW8nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICRpbnB1dHMuZmlsdGVyKCdzZWxlY3QnKS5maW5kKCdvcHRpb24nKS5wcm9wKCdzZWxlY3RlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdFNlbGVjdGVkO1xuICAgIH0pO1xuXG4gICAgJGlucHV0cy5jaGFuZ2UoKS5lYWNoKGZ1bmN0aW9uKCl7IHNlbGYuX3Jlc2V0RXJyb3JBbmRTdHlsZSh0aGlzKSB9KTtcblxuICAgIHRoaXMuX2luamVjdCgncmVzZXQnLCBuYW1lKTtcbiAgfVxuXG59O1xuIiwiLyoqXG4gKiBSdWxlc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICByZXF1aXJlZDogLy4rLyxcbiAgZGlnaXRzOiAvXlxcZCskLyxcbiAgZW1haWw6IC9eW15AXStAW15AXStcXC4uezIsNn0kLyxcbiAgdXNlcm5hbWU6IC9eW2Etel0oPz1bXFx3Ll17MywzMX0kKVxcdypcXC4/XFx3KiQvaSxcbiAgcGFzczogLyg/PS4qXFxkKSg/PS4qW2Etel0pKD89LipbQS1aXSkuezYsfS8sXG4gIHN0cm9uZ3Bhc3M6IC8oPz1eLns4LH0kKSgoPz0uKlxcZCl8KD89LipcXFcrKSkoPyFbLlxcbl0pKD89LipbQS1aXSkoPz0uKlthLXpdKS4qJC8sXG4gIHBob25lOiAvXlsyLTldXFxkezJ9LVxcZHszfS1cXGR7NH0kLyxcbiAgemlwOiAvXlxcZHs1fSR8XlxcZHs1fS1cXGR7NH0kLyxcbiAgdXJsOiAvXig/OihmdHB8aHR0cHxodHRwcyk6XFwvXFwvKT8oPzpbXFx3XFwtXStcXC4pK1thLXpdezIsNn0oW1xcOlxcLz8jXS4qKT8kL2ksXG5cbiAgbnVtYmVyOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUpIHtcbiAgICByZXR1cm4gIWlzTmFOKHZhbHVlKTtcbiAgfSxcblxuICByYW5nZTogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaXgsIG1heCkge1xuICAgIHJldHVybiBOdW1iZXIodmFsdWUpID49IG1pbiAmJiBOdW1iZXIodmFsdWUpIDw9IG1heDtcbiAgfSxcblxuICBtaW46IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWluKSB7XG4gICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA+PSBtaW47XG4gIH0sXG5cbiAgbWF4OiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1heCkge1xuICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPD0gbWF4O1xuICB9LFxuXG4gIG1pbm9wdGlvbjogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBtaW4pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0UmVsYXRlZChpbnB1dCkuZmlsdGVyKCc6Y2hlY2tlZCcpLmxlbmd0aCA+PSBtaW47XG4gIH0sXG5cbiAgbWF4b3B0aW9uOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIG1heCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRSZWxhdGVkKGlucHV0KS5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoIDw9IG1heDtcbiAgfSxcblxuICBtaW5tYXg6IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgbWluLCBtYXgpIHtcbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoID49IG1pbiAmJiB2YWx1ZS5sZW5ndGggPD0gbWF4O1xuICB9LFxuXG4gIHNlbGVjdDogZnVuY3Rpb24oaW5wdXQsIHZhbHVlLCBkZWYpIHtcbiAgICByZXR1cm4gdmFsdWUgIT0gZGVmO1xuICB9LFxuXG4gIGV4dGVuc2lvbjogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgIHZhciBleHRlbnNpb25zID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgICAsIHZhbGlkID0gZmFsc2U7XG5cbiAgICAkLmVhY2goaW5wdXQuZmlsZXMgfHwgW3tuYW1lOiBpbnB1dC52YWx1ZX1dLCBmdW5jdGlvbihpLCBmaWxlKSB7XG4gICAgICB2YWxpZCA9ICQuaW5BcnJheShmaWxlLm5hbWUuc3BsaXQoJy4nKS5wb3AoKS50b0xvd2VyQ2FzZSgpLCBleHRlbnNpb25zKSA+IC0xO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHZhbGlkO1xuICB9LFxuXG4gIGVxdWFsdG86IGZ1bmN0aW9uKGlucHV0LCB2YWx1ZSwgdGFyZ2V0KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgJHRhcmdldCA9ICQoJ1tuYW1lPVwiJysgdGFyZ2V0ICsnXCJdJyk7XG5cbiAgICBpZiAodGhpcy5nZXRJbnZhbGlkKCkuZmluZCgkdGFyZ2V0KS5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAgICR0YXJnZXQub2ZmKCdrZXl1cC5lcXVhbHRvJykub24oJ2tleXVwLmVxdWFsdG8nLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuX3ZhbGlkYXRlKGlucHV0LCBmYWxzZSwgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW5wdXQudmFsdWUgPT0gJHRhcmdldC52YWwoKTtcbiAgfSxcblxuICBkYXRlOiBmdW5jdGlvbihpbnB1dCwgdmFsdWUsIGZvcm1hdCkge1xuXG4gICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdtbS9kZC95eXl5JztcblxuICAgIHZhciBkZWxpbWl0ZXIgPSAvW15tZHldLy5leGVjKGZvcm1hdClbMF1cbiAgICAgICwgdGhlRm9ybWF0ID0gZm9ybWF0LnNwbGl0KGRlbGltaXRlcilcbiAgICAgICwgdGhlRGF0ZSA9IHZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICBmdW5jdGlvbiBpc0RhdGUoZGF0ZSwgZm9ybWF0KSB7XG5cbiAgICAgIHZhciBtLCBkLCB5O1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZm9ybWF0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICgvbS8udGVzdChmb3JtYXRbaV0pKSBtID0gZGF0ZVtpXTtcbiAgICAgICAgaWYgKC9kLy50ZXN0KGZvcm1hdFtpXSkpIGQgPSBkYXRlW2ldO1xuICAgICAgICBpZiAoL3kvLnRlc3QoZm9ybWF0W2ldKSkgeSA9IGRhdGVbaV07XG4gICAgICB9XG5cbiAgICAgIGlmICghbSB8fCAhZCB8fCAheSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICByZXR1cm4gbSA+IDAgJiYgbSA8IDEzICYmXG4gICAgICAgIHkgJiYgeS5sZW5ndGggPT0gNCAmJlxuICAgICAgICBkID4gMCAmJiBkIDw9IChuZXcgRGF0ZSh5LCBtLCAwKSkuZ2V0RGF0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBpc0RhdGUodGhlRGF0ZSwgdGhlRm9ybWF0KTtcbiAgfVxuXG59O1xuIl19
;