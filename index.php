<!DOCTYPE html>
<!--[if lt IE 7 ]> <html lang="en" class="ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en"> <!--<![endif]-->
<head>
<link rel="stylesheet" href="http://necolas.github.io/normalize.css/2.1.3/normalize.css">
<link rel="stylesheet" href="css/jquery.idealforms.css">
<meta charset=utf-8 />
<title>Ideal Forms 3</title>
<style>
  body {
    max-width: 980px;
    margin: 2em auto;
    font: normal 15px/1.5 Arial, sans-serif;
    color: #353535;
    overflow-y: scroll;
  }
  .content {
    margin: 0 30px;
  }

  .field.buttons button {
    margin-right: .5em;
  }

  #invalid {
    display: none;
    float: left;
    width: 290px;
    margin-left: 120px;
    margin-top: .5em;
    color: #CC2A18;
    font-size: 130%;
    font-weight: bold;
  }

  .idealforms.adaptive #invalid {
    margin-left: 0 !important;
  }

  .idealforms.adaptive .field.buttons label {
    height: 0;
  }
</style>
</head>
<body>

  <div class="content">

    <div class="idealsteps-container">

      <nav class="idealsteps-nav"></nav>

      <form action="" novalidate autocomplete="off" class="idealforms">

        <div class="idealsteps-wrap">

          <!-- Step 1 -->

          <section class="idealsteps-step">

            <div class="field">
              <label class="main">Username:</label>
              <input name="username" type="text" data-idealforms-ajax="ajax.php">
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">E-Mail:</label>
              <input name="email" type="email">
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">Password:</label>
              <input name="password" type="password">
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">Confirm:</label>
              <input name="confirmpass" type="password">
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">Date:</label>
              <input name="date" type="text" placeholder="mm/dd/yyyy" class="datepicker">
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">Picture:</label>
              <input id="picture" name="picture" type="file" multiple>
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">Website:</label>
              <input name="website" type="text">
              <span class="error"></span>
            </div>

            <div class="field buttons">
              <label class="main">&nbsp;</label>
              <button type="button" class="next">Next &raquo;</button>
            </div>

          </section>

          <!-- Step 2 -->

          <section class="idealsteps-step">

            <div class="field">
              <label class="main">Sex:</label>
              <p class="group">
                <label><input name="sex" type="radio" value="male">Male</label>
                <label><input name="sex" type="radio" value="female">Female</label>
              </p>
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">Hobbies:</label>
              <p class="group">
                <label><input name="hobbies[]" type="checkbox" value="football">Football</label>
                <label><input name="hobbies[]" type="checkbox" value="basketball">Basketball</label>
                <label><input name="hobbies[]" type="checkbox" value="dancing">Dancing</label>
                <label><input name="hobbies[]" type="checkbox" value="dancing">Parkour</label>
                <label><input name="hobbies[]" type="checkbox" value="dancing">Videogames</label>
              </p>
              <span class="error"></span>
            </div>

            <div class="field buttons">
              <label class="main">&nbsp;</label>
              <button type="button" class="prev">&laquo; Prev</button>
              <button type="button" class="next">Next &raquo;</button>
            </div>

          </section>

          <!-- Step 3 -->

          <section class="idealsteps-step">

            <div class="field">
              <label class="main">Phone:</label>
              <input name="phone" type="text" placeholder="000-000-0000">
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">Zip:</label>
              <input name="zip" type="text" placeholder="00000">
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">Options:</label>
              <select name="options" id="">
                <option value="default">&ndash; Select an option &ndash;</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
                <option value="4">Four</option>
              </select>
              <span class="error"></span>
            </div>

            <div class="field">
              <label class="main">Comments:</label>
              <textarea name="comments" cols="30" rows="10"></textarea>
              <span class="error"></span>
            </div>

            <div class="field buttons">
              <label class="main">&nbsp;</label>
              <button type="button" class="prev">&laquo; Prev</button>
              <button type="submit" class="submit">Submit</button>
            </div>

          </section>

        </div>

        <span id="invalid"></span>

      </form>

    </div>

  </div>

  <script src="http://code.jquery.com/jquery-2.1.0.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
  <script src="js/out/jquery.idealforms.js"></script>
  <!--<script src="js/out/jquery.idealforms.min.js"></script>-->
  <script>

    $('form.idealforms').idealforms({

      silentLoad: false,

      rules: {
        'username': 'required username ajax',
        'email': 'required email',
        'password': 'required pass',
        'confirmpass': 'required equalto:password',
        'date': 'required date',
        'picture': 'required extension:jpg:png',
        'website': 'url',
        'hobbies[]': 'minoption:2 maxoption:3',
        'phone': 'required phone',
        'zip': 'required zip',
        'options': 'select:default',
      },

      errors: {
        'username': {
          ajaxError: 'Username not available'
        }
      },

      onSubmit: function(invalid, e) {
        e.preventDefault();
        $('#invalid')
          .show()
          .toggleClass('valid', ! invalid)
          .text(invalid ? (invalid +' invalid fields') : 'All good!');
      }
    });

    $('form.idealforms').find('input, select, textarea').on('change keyup', function() {
      $('#invalid').hide();
    });

    $('form.idealforms').idealforms('addRules', {
      'comments': 'required minmax:50:200'
    });

    $('.prev').click(function(){
      $('.prev').show();
      $('form.idealforms').idealforms('prevStep');
    });
    $('.next').click(function(){
      $('.next').show();
      $('form.idealforms').idealforms('nextStep');
    });

  </script>
</body>
</html>
