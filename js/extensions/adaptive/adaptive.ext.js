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
