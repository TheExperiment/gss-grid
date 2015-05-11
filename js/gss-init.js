//TODO - Should be .coffee
//TODO - Pass suggested variables to the constructor

var loadGSS = function(callback) {
  var script = document.createElement('script');
  script.onload = callback
  script.src = "//rawgit.com/gss/document/ranges2/dist/gss.document.parser.js"
  if (location.protocol == 'file:')
    script.src = 'http:' + script.src
  document.body.appendChild(script)
}

var initGss = function() {

    if (location.search.indexOf('export=') == -1)
      document.documentElement.classList.add('animations')
    window.engine = new GSS(document);

      if (location.search.indexOf('export=') == -1)
      window.engine.addEventListener('compile', function() {
        var articles = document.querySelectorAll('section.post-section');
        for (var article, i = 0; article = articles[i++];) {
          var x = 1 - Math.floor(Math.random() * 3);
          var y = 1 - Math.floor(Math.random() * 3);
          //article.classList.add('displace-y-' + y);
          //article.classList.add('displace-x-' + x);
        }
      })

      if (location.search.indexOf('export-output') > -1)
        engine.addEventListener('export', function(s) {
          document.write(s)
        })

    // document.addEventListener('mousemove',function(e){
      //window.engine.solve({"mouse-y": 1});
    // });



    GSS.Document.prototype.Output.prototype.Unit.define({
      md: function(value, engine, operation, continuation, scope) {
        return value * engine.watch(null, 'md', operation, continuation, scope);
      },
      g: function(value, engine, operation, continuation, scope) {
        return value * engine.watch(null, 'g', operation, continuation, scope);
      }
    })

    GSS.Document.prototype.Input.prototype.Unit.define({
      md: function(value) {
        return ['*', ['get', 'md'], value];
      },
      g: function(value) {
        return ['*', ['get', 'g'], value];
      }
    })

    window.engine.then(function() {
      window.engine.solve([
        ['rule', [['.', 'animations'], [' '], ['.', 'animating']], [
        
          ['map', 
            ['get', ['&'], 'target'],
            ['get', ['&'], 'spring']
          ]
        ]],
        ['rule', [['.', 'animations'], [' '], ['.', 'animating'], [':visible-y', -100]], [
          ['=',
            ['get', ['&'], 'target'],
            1
          ]
        ]]

      ])
    })

};

function initAnimator() {

  var style = document.getElementById('gss-precomputed')
  var currentHeight = document.documentElement.scrollHeight
  window.addEventListener('resize', function() {
    currentHeight = document.documentElement.scrollHeight
  })
  text = style.textContent || style.innerText
  var animations = []
  var paused = {}
  var running = {}
  var regex = /\.([a-z0-9]+)-([^-]+)-(\d+)-(\d+)-(\d+)-running/ig
  var generated = ''
  var biggest = 0;

  text.replace(regex, function(match, name, id, h, y, w) {
    if (name != 'appearance')
      return
    w = parseInt(w)
    animations.push({
        name: name + '-' + id + '-' + h + '-' + y + '-' + w,
        h: parseInt(h) / 1000,
        y: parseInt(y) / 1000,
        w: w
    })
    if (biggest < w)
      biggest = w
    return match[0]
  })


  function intersect(sh, sy, eh, ey) {
    return (ey <= sy && ey + eh >= sy + sh) || // mid
           (ey > sy && ey < sy + sh)        || // top
           (ey + eh > sy && ey + eh < sy + sh)// bottom
  }

  var Animator = function() {
    var sh = window.innerHeight
    var sy = window.scrollY
    var current = window.innerWidth > 720 && 1440 || 720


    for (var i = 0, animation; animation = animations[i++];) {
      var eh = currentHeight * animation.h
      var ey = currentHeight * animation.y

      if (animation.w == current) {
        document.documentElement.classList.add(animation.name)
      } else {
        document.documentElement.classList.remove(animation.name)
      }
      //if (intersect(sh, sy, eh + 100, ey - 150)) {
      //    if (!paused[animation.name]) {
      //        document.documentElement.classList.add(animation.name)
      //        paused[animation.name] = true;
      //    }
      //} else {
      //    if (paused[animation.name]) {
      //        delete paused[animation.name];
      //        document.documentElement.classList.remove(animation.name)
      //    }
      //}
      if (animation.w == current && intersect(sh, sy, eh - 150, ey + 75)) {
        if (!running[animation.name]) {
            document.documentElement.classList.add(animation.name + '-running')
            document.documentElement.classList.remove('dis' + animation.name + '-running')
            document.documentElement.classList.remove('dis' + animation.name)
            running[animation.name] = true;
        }
      } else {
        if (running[animation.name]) {
          delete running[animation.name];
          document.documentElement.classList.remove(animation.name + '-running')
          if (animation.w == current) {
            document.documentElement.classList.add('dis' + animation.name + '-running')
            document.documentElement.classList.add('dis' + animation.name)
          }
        }
        if (animation.w != current) {
         document.documentElement.classList.remove('dis' + animation.name + '-running')
         document.documentElement.classList.remove('dis' + animation.name)
        }
      }
    }
  }
  document.addEventListener('scroll', Animator)
  document.addEventListener('resize', Animator)
  setTimeout(function() {
    Animator()
  }, 100)
}

// Main
var precomputed = document.getElementById('gss-precomputed');
if (precomputed && precomputed.innerHTML.length) {
  if (window.console)
    console.log('Got precomputed CSS for the page. GSS is NOT initialized.');
  initAnimator()
} else {
  loadGSS(initGss);

}
