var _dataFile = <%- JSON.stringify(dataFiles) %>;

function switchTheme(themeID)
{
  // current theme selection
  var $selectedBtn = $("input:radio[name='theme'][checked='checked']");
  var oldTheme = $selectedBtn.val();

  if (oldTheme != themeID)
  {
    $("input:radio[name='theme']").each(function(idx, elem) {
      var $elem = $(elem);
      $elem.prop("checked", ($elem.val() == themeID)).checkboxradio("refresh");

      if ($elem.val() == themeID) {
        // fire event
        $elem.trigger('change');
      }
    });


    var searchTheme = new RegExp('(-'+oldTheme+'$|-'+oldTheme+'\\s)','g');
    $("*[data-theme='"+oldTheme+"']").each(function(index, elem) {
      $(elem).attr('class', $(elem).attr('class').replace(searchTheme, "-"+themeID+' '));
      $(elem).attr('data-theme', themeID);
    });
  }
}

function setCookie(name, value)
{
  var now = new Date();
  now.setDate(now.getDate() + 100);

  var value=escape(value) + "; expires="+now.toUTCString();
  document.cookie=name + "=" + value;
}

function getCookie(name)
{
  var cookie = document.cookie;
  var key = name+"=";
  var entryIndex = cookie.indexOf(key);
  if (entryIndex == -1) return null;

  var lastIndex = cookie.indexOf(";", entryIndex);
  if (lastIndex == -1) {
    lastIndex = cookie.length;
  }

  return unescape(cookie.substring(entryIndex+key.length, lastIndex));
}


function initPage() {
  var $dataSource = $('#dataSource');

  // create fieldset
  var html = [];
  html.push('');
  html.push('<fieldset id="dataSourceList" data-role="controlgroup">');

  // setup data source popup
  _dataFile.forEach(function(csv, index, arry) {
    html.push('<input type="radio" name="dataSourceInput" id="dataSourceInput_'+index+'" value="'+index+'"/>');
    html.push('<label for="dataSourceInput_'+index+'">'+csv+'</label>');
  });

  html.push('</fieldset>');
  $dataSource.append(html.join('\n'));
  $dataSource.trigger("create");

  // set default value
  var $radios = $("input[name='dataSourceInput']");
  $($radios[0]).prop('checked', true).checkboxradio('refresh');

  // hook data source selection
  $radios.on('change', function(event){
    var mad = xdo.sdk.plugin.Bimad.getInstance();
    var idx = parseInt($(this).val());
    mad.refresh(_dataFile[idx]);
  });

  // hook theme selection
  $("#themeSwitch input[type='radio']").on('change', function(event){

    // changing theme
    var oldTheme = $("#themeSwitch input[data-cacheval='true']").val();
    var newTheme = $(this).val();

    var searchTheme = new RegExp('(-'+oldTheme+'$|-'+oldTheme+'\\s)','g');
    $("*[data-theme='"+oldTheme+"']").each(function(index, elem) {
      $(elem).attr('class', $(elem).attr('class').replace(searchTheme, "-"+newTheme+' '));
      $(elem).attr('data-theme', newTheme);
    });

    // remember last selection into the cookie
    setCookie('devServerTheme', newTheme);

    // refresh plugin
    var dataIdx = 0;
    $("input[name='dataSourceInput']").each(function(idx, radio) {
      var $radio = $(radio);
      if( $radio.prop("checked")) {
        dataIdx = parseInt($radio.val());
      }
    });

    var mad = xdo.sdk.plugin.Bimad.getInstance();
    mad.refresh(_dataFile[dataIdx]);
  });

  var theme = getCookie('devServerTheme');
  if (theme != null && theme != 'c') {
    switchTheme(theme);
  }

};

// render plugin
$(document).on("pageinit", function(ev) {
  initPage();

  var mad = xdo.sdk.plugin.Bimad.getInstance();
  var data = (_dataFile != null)?_dataFile[0]:null;
  mad.render(data);
});

