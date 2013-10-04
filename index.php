<!DOCTYPE html>
<!--[if lt IE 7 ]> <html lang="en" class="ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en"> <!--<![endif]-->
<head>
<link rel="stylesheet" href="css/jquery.idealforms.css">
<link rel="stylesheet" href="http://necolas.github.io/normalize.css/2.1.3/normalize.css">
<meta charset=utf-8 />
<title>Ideal Forms 3</title>
<style>
  body {
    width: 960px;
    margin: 2em auto !important;
    font: normal 15px/1.5 Arial, sans-serif;
    color: #353535;
    overflow-y: scroll;
  }
  .idealforms .submit {
    margin: .35em 120px;
  }
  #invalid {
    display: none;
    float: left;
    padding: .25em .75em;
    color: #CC2A18;
    font-size: 120%;
    font-weight: bold;
  }
</style>
</head>
<body>

  <div class="idealsteps-container">

    <nav class="idealsteps-nav"></nav>

    <form action="" novalidate class="idealforms">

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

        </section>

        <!-- Step 3 -->

        <section class="idealsteps-step">

          <div class="field">
            <label class="main">Phone:</label>
            <input name="phone" type="text">
            <span class="error"></span>
          </div>

          <div class="field">
            <label class="main">Zip:</label>
            <input name="zip" type="text">
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

        </section>

      </div>

      <div class="submit">
        <button type="submit">Submit</button>
        <span id="invalid"></span>
      </div>

    </form>

  </div>

  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
  <script src="js/out/jquery.idealforms.js"></script>
  <!--<script src="js/out/jquery.idealforms.min.js"></script>-->
  <script>

    $('form').idealforms({

      rules: {
        'username': 'required username ajax',
        'email': 'required email',
        'password': 'required pass',
        'confirmpass': 'required equalto:password',
        'date': 'date',
        'picture': 'required extension:jpg:png',
        'website': 'url',
        'hobbies[]': 'minoption:1 maxoption:2',
        'phone': 'required phone',
        'zip': 'required zip',
        'options': 'select:default',
      },

      errors: {
        'username': {
          ajaxError: 'Username not available'
        }
      },

      onSubmit: function(invalid) {
        $('#invalid').show().text(invalid ? (invalid +' invalid fields') : 'All good!')
      }
    });

    $('form').keyup(function() {
      $('#invalid').hide();
    });

    $('form').idealforms('addRules', {
      'comments': 'required minmax:50:200'
    });

  </script>
</body>
</html>
